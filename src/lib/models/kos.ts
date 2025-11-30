import { supabase, supabaseAdmin } from '@/lib/supabase';
import { 
  KosListing, 
  KosListingWithDetails, 
  KosMarker, 
  KosFilters,
  CreateKosRequest,
  UpdateKosRequest 
} from '@/types/database';

export class KosModel {
  // Get all kos for map view with optional filters
  static async getKosMarkers(filters?: KosFilters): Promise<KosMarker[]> {
    let query = supabase
      .from('kos_listings')
      .select(`
        id, title, slug, gender, monthly_price, 
        latitude, longitude, distance_to_its_km, available_rooms, cover_image_url
      `)
      .eq('is_active', true); // Only show active listings

    // Apply filters
    if (filters?.gender) {
      query = query.eq('gender', filters.gender);
    }
    
    if (filters?.min_price) {
      query = query.gte('monthly_price', filters.min_price);
    }
    
    if (filters?.max_price) {
      query = query.lte('monthly_price', filters.max_price);
    }
    
    if (filters?.max_distance) {
      query = query.lte('distance_to_its_km', filters.max_distance);
    }
    
    if (filters?.available_only) {
      query = query.gt('available_rooms', 0);
    }

    const { data, error } = await query.order('distance_to_its_km', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  // Get single kos with full details (by ID or slug)
  static async getKosDetails(idOrSlug: string, skipActiveCheck: boolean = false): Promise<KosListingWithDetails | null> {
    // Try to parse as ID first (numeric), otherwise treat as slug
    const isId = !isNaN(parseInt(idOrSlug));
    
    let query = supabase
      .from('kos_listings')
      .select(`
        *,
        users!kos_listings_owner_id_fkey(id, name, email),
        kos_facilities(
          facility_id, is_available, extra_price,
          facility_types(id, name, icon)
        ),
        reviews(
          id, rating, comment, created_at,
          users!reviews_user_id_fkey(name)
        )
      `);
    
    // Only show active listings for public view (unless skipActiveCheck is true for admin/owner)
    if (!skipActiveCheck) {
      query = query.eq('is_active', true);
    }
    
    if (isId) {
      query = query.eq('id', parseInt(idOrSlug));
    } else {
      query = query.eq('slug', idOrSlug);
    }
    
    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    // Calculate average rating
    const ratings = data.reviews?.map((r: any) => r.rating) || [];
    const average_rating = ratings.length > 0 
      ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length 
      : 0;

    return {
      ...data,
      owner: data.users,
      facilities: data.kos_facilities?.map((kf: any) => ({
        ...kf.facility_types,
        extra_price: kf.extra_price,
        is_available: kf.is_available
      })) || [],
      reviews: data.reviews || [],
      average_rating
    };
  }

  // Get kos owned by specific user
  static async getKosByOwner(ownerId: string): Promise<KosListing[]> {
    const { data, error } = await supabase
      .from('kos_listings')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Create new kos listing
  static async createKos(kosData: CreateKosRequest, ownerId: string): Promise<KosListing> {
    const client = supabaseAdmin || supabase;
    
    console.log('KosModel.createKos called with:', {
      title: kosData.title,
      ownerId,
      hasImages: !!kosData.images,
      imageCount: kosData.images?.length || 0,
      hasFacilities: !!kosData.facilities,
      facilityCount: kosData.facilities?.length || 0
    });
    
    // Generate slug from title
    const generateSlug = (title: string): string => {
      let slug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-'); // Replace spaces with hyphens
      
      // Ensure minimum length to avoid empty or very short slugs
      if (slug.length < 3) {
        slug = slug + '-kos';
      }
      
      return slug;
    };
    
    const baseSlug = generateSlug(kosData.title);
    let slug = baseSlug;
    let counter = 1;
    
    // Check for existing slugs and make unique
    while (true) {
      const { data: existing } = await client
        .from('kos_listings')
        .select('id')
        .eq('slug', slug)
        .single();
      
      if (!existing) break; // Slug is unique
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    console.log('Inserting kos with slug:', slug);
    
    // Extract facilities from kosData as it's not a column in kos_listings table
    const { facilities, ...kosListingData } = kosData;
    
    const insertData = {
      ...kosListingData,
      owner_id: ownerId,
      slug: slug // Use generated unique slug
    };
    
    console.log('Insert data keys:', Object.keys(insertData));
    
    const { data, error } = await client
      .from('kos_listings')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    // Add facilities if provided
    if (facilities && facilities.length > 0) {
      const facilitiesData = facilities.map(f => ({
        kos_id: data.id,
        facility_id: f.facility_id,
        extra_price: f.extra_price || 0
      }));

      const { error: facilityError } = await client
        .from('kos_facilities')
        .insert(facilitiesData);

      if (facilityError) {
        console.error('Facility insert error:', facilityError);
        throw facilityError;
      }
    }

    return data;
  }

  // Update kos listing
  static async updateKos(kosData: UpdateKosRequest, ownerId: string, userRole: string): Promise<KosListing> {
    const client = supabaseAdmin || supabase;
    
    // Check ownership or admin access
    if (userRole !== 'ADMIN') {
      const { data: existingKos } = await client
        .from('kos_listings')
        .select('owner_id')
        .eq('id', kosData.id)
        .single();

      if (!existingKos || existingKos.owner_id !== ownerId) {
        throw new Error('Unauthorized: You can only edit your own kos listings');
      }
    }

    const { id, facilities, ...updateData } = kosData;
    
    const { data, error } = await client
      .from('kos_listings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update facilities if provided
    if (facilities) {
      // Delete existing facilities
      await client.from('kos_facilities').delete().eq('kos_id', id);
      
      // Insert new facilities
      if (facilities.length > 0) {
        const facilitiesData = facilities.map(f => ({
          kos_id: id,
          facility_id: f.facility_id,
          extra_price: f.extra_price || 0
        }));

        const { error: facilityError } = await client
          .from('kos_facilities')
          .insert(facilitiesData);

        if (facilityError) throw facilityError;
      }
    }

    return data;
  }

  // Update kos status (admin only)
  static async updateKosStatus(kosId: number, isActive: boolean): Promise<void> {
    const client = supabaseAdmin || supabase;
    
    const { error } = await client
      .from('kos_listings')
      .update({ is_active: isActive })
      .eq('id', kosId);

    if (error) throw error;
  }

  // Delete kos listing
  static async deleteKos(kosId: number, ownerId: string, userRole: string): Promise<void> {
    const client = supabaseAdmin || supabase;
    
    // Check ownership or admin access
    if (userRole !== 'ADMIN') {
      const { data: existingKos } = await client
        .from('kos_listings')
        .select('owner_id')
        .eq('id', kosId)
        .single();

      if (!existingKos || existingKos.owner_id !== ownerId) {
        throw new Error('Unauthorized: You can only delete your own kos listings');
      }
    }

    const { error } = await client
      .from('kos_listings')
      .delete()
      .eq('id', kosId);

    if (error) throw error;
  }

  // Get all kos (admin only)
  static async getAllKos(): Promise<KosListingWithDetails[]> {
    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('kos_listings')
      .select(`
        *,
        users!kos_listings_owner_id_fkey(name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(kos => ({
      ...kos,
      owner: kos.users
    }));
  }

  // Alias for admin API compatibility
  static async getAllKosListings(): Promise<KosListingWithDetails[]> {
    return this.getAllKos();
  }

  // Get kos listings by owner email
  static async getKosListingsByOwner(ownerEmail: string): Promise<KosListing[]> {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', ownerEmail)
      .single();

    if (userError) throw userError;
    if (!user) return [];

    const { data, error } = await supabase
      .from('kos_listings')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Update kos images
  static async updateKosImages(
    kosId: number,
    coverImagePublicId: string,
    coverImageUrl: string,
    imagePublicIds: string[],
    imageUrls: string[]
  ): Promise<void> {
    const client = supabaseAdmin || supabase;
    
    const { error } = await client
      .from('kos_listings')
      .update({
        cover_image: coverImagePublicId,
        cover_image_url: coverImageUrl,
        images: imagePublicIds,
        image_urls: imageUrls
      })
      .eq('id', kosId);

    if (error) throw error;
  }

  // Get kos images
  static async getKosImages(kosId: number): Promise<{
    cover_image?: string;
    cover_image_url?: string;
    images?: string[];
    image_urls?: string[];
  }> {
    const { data, error } = await supabase
      .from('kos_listings')
      .select('cover_image, cover_image_url, images, image_urls')
      .eq('id', kosId)
      .single();

    if (error) throw error;
    return data || {};
  }
}