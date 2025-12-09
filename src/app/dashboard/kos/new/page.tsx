'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import ImageUpload from '@/components/image-upload';
import LocationPickerLeaflet from '@/components/location-picker-leaflet';
import FacilitySelector from '@/components/facility-selector';
import Link from 'next/link';
import { ArrowLeft, Save, MapPin } from 'lucide-react';

interface FormData {
  title: string;
  description: string;
  address: string;
  gender: 'PUTRA' | 'PUTRI' | 'CAMPUR';
  monthly_price: number;
  latitude: number;
  longitude: number;
  available_rooms: number;
  total_rooms: number;
}

interface SelectedFacility {
  facility_id: number;
  extra_price: number;
}

interface ImageUploadResponse {
  url: string;          // Public CDN URL from Vercel Blob
  pathname: string;     // Blob pathname (used for deletion)
  contentType: string;  // MIME type
  size: number;         // File size in bytes
}

interface KosPayload extends FormData {
  cover_image: string | null;
  cover_image_url: string | null;
  images: string[];
  image_urls: string[];
  facilities?: SelectedFacility[];
}

export default function NewKosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [authWarning, setAuthWarning] = useState<string | null>(null);
  const [selectedFacilities, setSelectedFacilities] = useState<SelectedFacility[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    address: '',
    gender: 'PUTRA',
    monthly_price: 0,
    latitude: -7.2819, // Default to ITS location
    longitude: 112.7954,
    available_rooms: 1,
    total_rooms: 1,
  });

  // Check authentication status
  React.useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      setAuthWarning('You need to sign in to create a kos listing.');
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

    console.log('Uploading images to Vercel Blob...');

    // Convert base64 images to format expected by Vercel Blob API
    const imageData = images.map((base64, index) => ({
      base64,
      filename: `kos-image-${Date.now()}-${index}.jpg`
    }));

    const response = await fetch('/api/upload/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        images: imageData,
        folder: 'kos-images',
        maxSizeMB: 10
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Image upload error:', errorData);
      throw new Error(errorData.error || 'Failed to upload images');
    }

    const result = await response.json();
    console.log('Images uploaded successfully to Vercel Blob:', result.data);
    return result.data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Session:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasEmail: !!session?.user?.email,
      hasAppUserId: !!session?.user?.appUserId,
      email: session?.user?.email
    });
    
    if (!session?.user?.email) {
      setError('Please sign in to create a kos listing');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a title for your kos');
      return;
    }

    if (!formData.address.trim()) {
      setError('Please enter an address');
      return;
    }

    if (formData.monthly_price <= 0) {
      setError('Please enter a valid monthly price');
      return;
    }

    if (formData.available_rooms > formData.total_rooms) {
      setError('Available rooms cannot exceed total rooms');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload images first if any
      let imageData: ImageUploadResponse[] | null = null;
      if (uploadedImages.length > 0) {
        console.log('Uploading images...');
        imageData = await uploadImages(uploadedImages);
      }

      // Prepare kos data
      const kosPayload: KosPayload = {
        ...formData,
        cover_image: imageData?.[coverIndex]?.pathname || null,
        cover_image_url: imageData?.[coverIndex]?.url || null,
        images: imageData?.map(img => img.pathname) || [],
        image_urls: imageData?.map(img => img.url) || [],
        facilities: selectedFacilities.length > 0 ? selectedFacilities : undefined
      };

      console.log('Creating kos with payload:', {
        title: kosPayload.title,
        hasImages: kosPayload.images.length > 0,
        imagesCount: kosPayload.images.length
      });

      const response = await fetch('/api/kos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(kosPayload),
      });

      console.log('Kos creation response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Kos creation error:', errorData);
        
        // Show detailed error message if available
        let errorMessage = errorData.error || 'Failed to create kos listing';
        if (errorData.details) {
          errorMessage += ': ' + errorData.details;
        }
        if (errorData.code === 'NO_APP_USER_ID') {
          errorMessage += ' Try signing out and signing in again.';
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Kos created successfully:', result);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating kos:', error);
      setError(error instanceof Error ? error.message : 'Failed to create kos listing');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

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
            Create New Kos Listing
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Fill out the information below to create your kos listing
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
                  placeholder="e.g., Kos Putri Sakura"
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
                  placeholder="e.g., 1500000"
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
                  placeholder="Describe your kos facilities, rules, and other important information..."
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
                  placeholder="Enter the full address of your kos..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Location on Map
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
              disabled={loading || status === 'loading' || status === 'unauthenticated' || !session?.user?.appUserId}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
              title={!session?.user?.appUserId ? 'Please sign in first' : ''}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Kos Listing
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}