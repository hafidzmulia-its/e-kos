// Database entity types for ITS KosFinder

export type UserRole = 'USER' | 'ADMIN';
export type GenderType = 'PUTRA' | 'PUTRI' | 'CAMPUR';

// User entity (linked to Google OAuth)
export interface User {
  id: string; // Google OAuth ID
  name: string;
  email: string;
  image_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Facility type master data
export interface FacilityType {
  id: number;
  name: string;
  icon?: string;
  created_at: string;
}

// Main kos listing entity
export interface KosListing {
  id: number;
  owner_id: string;
  title: string;
  slug: string;
  description?: string;
  address: string;
  gender: GenderType;
  monthly_price: number;
  latitude: number;
  longitude: number;
  distance_to_its_km?: number;
  available_rooms: number;
  total_rooms: number;
  cover_image?: string; // Cloudinary public_id for main image
  cover_image_url?: string; // Cloudinary secure_url for main image
  images?: string[]; // Array of Cloudinary public_ids for gallery
  image_urls?: string[]; // Array of Cloudinary secure_urls for gallery
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Kos facility relationship
export interface KosFacility {
  kos_id: number;
  facility_id: number;
  is_available: boolean;
  extra_price: number;
}

// Review entity
export interface Review {
  id: number;
  kos_id: number;
  user_id: string;
  rating: number; // 1-5
  comment?: string;
  created_at: string;
  updated_at: string;
}

// Favorite entity
export interface Favorite {
  user_id: string;
  kos_id: number;
  created_at: string;
}

// Extended types for API responses and components

// Kos listing with related data
export interface KosListingWithDetails extends KosListing {
  owner?: User;
  facilities?: Array<FacilityType & { extra_price: number; is_available: boolean }>;
  reviews?: Review[];
  average_rating?: number;
  total_reviews?: number;
  is_favorited?: boolean; // For logged-in users
}

// Map marker data (lightweight for map view)
export interface KosMarker {
  id: number;
  title: string;
  slug: string;
  gender: GenderType;
  monthly_price: number;
  latitude: number;
  longitude: number;
  distance_to_its_km?: number;
  available_rooms: number;
  cover_image_url?: string;
}

// Filter options for kos search
export interface KosFilters {
  gender?: GenderType;
  min_price?: number;
  max_price?: number;
  facilities?: number[]; // facility type IDs
  max_distance?: number; // km from ITS
  available_only?: boolean;
}

// API request/response types

// Create kos request
export interface CreateKosRequest {
  title: string;
  description?: string;
  address: string;
  gender: GenderType;
  monthly_price: number;
  latitude: number;
  longitude: number;
  available_rooms: number;
  total_rooms: number;
  cover_image?: string; // Cloudinary public_id for main image
  cover_image_url?: string; // Cloudinary secure_url for main image
  images?: string[]; // Array of Cloudinary public_ids for gallery
  image_urls?: string[]; // Array of Cloudinary secure_urls for gallery
  facilities?: Array<{ facility_id: number; extra_price?: number }>;
}

// Update kos request
export interface UpdateKosRequest extends Partial<CreateKosRequest> {
  id: number;
}

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// NextAuth session extension
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      appUserId: string; // Supabase users.id
      role: UserRole;
    };
  }

  interface User {
    appUserId: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    appUserId: string;
    role: UserRole;
  }
}