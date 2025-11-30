'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import ImageUpload from '@/components/image-upload';
import LocationPickerLeaflet from '@/components/location-picker-leaflet';
import FacilitySelector from '@/components/facility-selector';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

interface KosListing {
  id: number;
  title: string;
  slug: string;
  description: string;
  address: string;
  gender: 'PUTRA' | 'PUTRI' | 'CAMPUR';
  monthly_price: number;
  total_rooms: number;
  available_rooms: number;
  distance_to_its_km: number;
  latitude: number;
  longitude: number;
  cover_image?: string;
  cover_image_url?: string;
  images?: string[];
  image_urls?: string[];
}

interface ImageUploadResponse {
  public_id: string;
  secure_url: string;
  [key: string]: any;
}

interface FormData {
  title: string;
  description: string;
  address: string;
  gender: 'PUTRA' | 'PUTRI' | 'CAMPUR';
  monthly_price: number;
  total_rooms: number;
  available_rooms: number;
  latitude: number;
  longitude: number;
}

interface SelectedFacility {
  facility_id: number;
  extra_price: number;
}

interface UpdatePayload extends FormData {
  cover_image?: string | null;
  cover_image_url?: string | null;
  images?: string[];
  image_urls?: string[];
  facilities?: SelectedFacility[];
}

interface EditKosPageProps {
  params: Promise<{ id: string }>;
}

export default function EditKosPage({ params }: EditKosPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [kos, setKos] = useState<KosListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [authWarning, setAuthWarning] = useState<string | null>(null);
  const [id, setId] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [selectedFacilities, setSelectedFacilities] = useState<SelectedFacility[]>([]);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    address: '',
    gender: 'CAMPUR',
    monthly_price: 0,
    total_rooms: 0,
    available_rooms: 0,
    latitude: -7.2819,
    longitude: 112.7954,
  });

  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  // Check authentication status
  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      setAuthWarning('You need to sign in to edit kos listings.');
      return;
    }
    
    if (session && !session.user?.appUserId) {
      setAuthWarning('Your account is not fully set up. Please sign out and sign in again.');
      console.warn('Session exists but appUserId is missing:', {
        hasSession: !!session,
        hasUser: !!session.user,
        email: session.user?.email,
        appUserId: session.user?.appUserId
      });
      return;
    }
    
    if (session?.user?.appUserId) {
      setAuthWarning(null);
    }
  }, [session, status]);

  useEffect(() => {
    if (status === 'loading' || !id) return;
    
    if (!session) {
      router.push('/api/auth/signin');
      return;
    }

    fetchKos();
  }, [session, status, router, id]);

  const fetchKos = async () => {
    try {
      const response = await fetch(`/api/kos/${id}`);
      if (!response.ok) throw new Error('Failed to fetch kos');
      
      const data = await response.json();
      setKos(data.data);
      
      // Set form data
      setFormData({
        title: data.data.title || '',
        description: data.data.description || '',
        address: data.data.address || '',
        gender: data.data.gender || 'CAMPUR',
        monthly_price: data.data.monthly_price || 0,
        total_rooms: data.data.total_rooms || 0,
        available_rooms: data.data.available_rooms || 0,
        latitude: data.data.latitude || -7.2819,
        longitude: data.data.longitude || 112.7954,
      });
      
      // Set existing facilities
      if (data.data.facilities && Array.isArray(data.data.facilities)) {
        const existingFacilities: SelectedFacility[] = data.data.facilities.map((f: any) => ({
          facility_id: f.facility_id || f.id,
          extra_price: f.extra_price || 0
        }));
        setSelectedFacilities(existingFacilities);
      }
      
    } catch (error) {
      console.error('Error fetching kos:', error);
      setError('Failed to load kos listing');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: address || prev.address
    }));
  };

  const handleImagesChange = (images: string[], newCoverIndex?: number) => {
    setUploadedImages(images);
    if (newCoverIndex !== undefined) {
      setCoverIndex(newCoverIndex);
    }
  };

  const handleFacilitiesChange = (facilities: SelectedFacility[]) => {
    setSelectedFacilities(facilities);
  };

  const uploadImages = async (images: string[]): Promise<ImageUploadResponse[] | null> => {
    if (images.length === 0) return null;

    const response = await fetch('/api/upload/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        images,
        folder: 'kos-images',
        compressionQuality: 80,
        maxWidth: 1200,
        maxHeight: 1200
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload images');
    }

    const result = await response.json();
    return result.data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Upload new images if any
      let imageData: ImageUploadResponse[] | null = null;
      if (uploadedImages.length > 0) {
        imageData = await uploadImages(uploadedImages);
      }

      // Prepare update payload
      const updatePayload: UpdatePayload = {
        ...formData,
      };

      // Add image data if new images were uploaded
      if (imageData) {
        updatePayload.cover_image = imageData[coverIndex]?.public_id || null;
        updatePayload.cover_image_url = imageData[coverIndex]?.secure_url || null;
        updatePayload.images = imageData.map(img => img.public_id);
        updatePayload.image_urls = imageData.map(img => img.secure_url);
      }
      
      // Add facilities
      updatePayload.facilities = selectedFacilities.length > 0 ? selectedFacilities : undefined;

      console.log('Updating kos with ID:', id);
      console.log('Update payload:', {
        title: updatePayload.title,
        hasImages: !!updatePayload.images?.length,
        imagesCount: updatePayload.images?.length || 0
      });

      const response = await fetch(`/api/kos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      console.log('Update response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update error:', errorData);
        
        // Show detailed error message
        let errorMessage = errorData.error || 'Failed to update kos listing';
        if (errorData.details) {
          errorMessage += ': ' + errorData.details;
        }
        if (errorMessage.includes('Unauthorized')) {
          errorMessage += ' You can only edit your own kos listings.';
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Kos updated successfully:', result);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating kos:', error);
      setError(error instanceof Error ? error.message : 'Failed to update kos listing');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-lg">Loading kos details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!kos) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto p-6">
          <div className="text-center text-red-600">
            Kos listing not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Kos Listing
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Update your kos listing information
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {authWarning && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="block sm:inline">{authWarning}</span>
            </div>
            {status === 'unauthenticated' && (
              <Link
                href="/api/auth/signin"
                className="mt-2 inline-block text-yellow-900 underline hover:text-yellow-700"
              >
                Sign in now
              </Link>
            )}
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kos Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender Type *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="PUTRA">Male Only (Putra)</option>
                  <option value="PUTRI">Female Only (Putri)</option>
                  <option value="CAMPUR">Mixed (Campur)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Price (Rp) *
                </label>
                <input
                  type="number"
                  name="monthly_price"
                  value={formData.monthly_price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Rooms *
                </label>
                <input
                  type="number"
                  name="total_rooms"
                  value={formData.total_rooms}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Rooms *
                </label>
                <input
                  type="number"
                  name="available_rooms"
                  value={formData.available_rooms}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max={formData.total_rooms}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Images</h2>
            <ImageUpload
              onImagesChange={handleImagesChange}
              existingImages={kos.image_urls || []}
              existingCoverIndex={0}
              maxImages={10}
              compressionQuality={0.8}
              maxWidth={1200}
              maxHeight={1200}
            />
          </div>

          {/* Facilities */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Facilities</h2>
            <FacilitySelector
              selectedFacilities={selectedFacilities}
              onFacilitiesChange={handleFacilitiesChange}
            />
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Location</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Update Location on Map
                </label>
                <LocationPickerLeaflet
                  initialPosition={[formData.latitude, formData.longitude]}
                  onLocationSelect={handleLocationSelect}
                  height="400px"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    step="0.000001"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    step="0.000001"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-between bg-white rounded-lg shadow-sm p-6">
            <Link
              href="/dashboard"
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </Link>
            
            <button
              type="submit"
              disabled={saving || status === 'loading' || status === 'unauthenticated' || !session?.user?.appUserId}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
              title={!session?.user?.appUserId ? 'Please sign in first' : ''}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Kos Listing
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}