import { supabase, supabaseAdmin } from '@/lib/supabase';
import { User, UserRole, FacilityType } from '@/types/database';

export class UserModel {
  // Get or create user from Google OAuth
  static async findOrCreateUser(googleUser: {
    id: string;
    name?: string;
    email: string;
    image?: string;
  }): Promise<User> {
    const client = supabaseAdmin || supabase;
    
    // First, try to find existing user
    let { data: existingUser, error } = await client
      .from('users')
      .select('*')
      .eq('email', googleUser.email)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (existingUser) {
      // Update user info if needed
      const { data: updatedUser, error: updateError } = await client
        .from('users')
        .update({
          name: googleUser.name || existingUser.name,
          image_url: googleUser.image || existingUser.image_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedUser;
    }

    // Create new user
    const newUser = {
      id: googleUser.id,
      name: googleUser.name || '',
      email: googleUser.email,
      image_url: googleUser.image || '',
      role: 'USER' as UserRole // Default role
    };

    const { data: createdUser, error: createError } = await client
      .from('users')
      .insert(newUser)
      .select()
      .single();

    if (createError) throw createError;
    return createdUser;
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  }

  // Update user role (admin only)
  static async updateUserRole(userId: string, newRole: UserRole): Promise<User> {
    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('users')
      .update({ 
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get all users (admin only)
  static async getAllUsers(): Promise<User[]> {
    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

export class FacilityModel {
  // Get all facility types
  static async getAllFacilities(): Promise<FacilityType[]> {
    const { data, error } = await supabase
      .from('facility_types')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Create new facility type (admin only)
  static async createFacility(facilityData: { name: string; icon?: string }): Promise<FacilityType> {
    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('facility_types')
      .insert(facilityData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update facility type (admin only)
  static async updateFacility(facilityId: number, facilityData: { name?: string; icon?: string }): Promise<FacilityType> {
    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('facility_types')
      .update(facilityData)
      .eq('id', facilityId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete facility type (admin only)
  static async deleteFacility(facilityId: number): Promise<void> {
    const client = supabaseAdmin || supabase;
    
    const { error } = await client
      .from('facility_types')
      .delete()
      .eq('id', facilityId);

    if (error) throw error;
  }
}