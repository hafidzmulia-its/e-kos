'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from '@/components/navigation';
import { ArrowLeft, Save } from 'lucide-react';

interface KosData {
  id: number;
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  monthly_price: number;
  gender: 'PUTRA' | 'PUTRI' | 'CAMPUR';
  total_rooms: number;
  available_rooms: number;
  phone_number: string;
  whatsapp_number: string;
  email: string;
}

interface EditKosPageProps {
  params: {
    id: string;
  };
}

export default function EditKosPage({ params }: EditKosPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [kosData, setKosData] = useState<KosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kosId, setKosId] = useState<string | null>(null);

  useEffect(() => {
    // Extract ID from params (which is now a Promise in Next.js 15+)
    const getParamsId = async () => {
      const resolvedParams = await params;
      setKosId(resolvedParams.id);
    };
    
    getParamsId();
  }, [params]);

  useEffect(() => {
    if (status === 'loading' || !kosId) return;
    
    if (!session) {
      router.push('/api/auth/signin');
      return;
    }

    fetchKosData();
  }, [session, status, router, kosId]);

  const fetchKosData = async () => {
    if (!kosId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/kos/${kosId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch kos data');
      }
      const data = await response.json();
      setKosData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load kos data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!kosData) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/kos/${kosId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: kosData.title,
          description: kosData.description,
          address: kosData.address,
          latitude: kosData.latitude,
          longitude: kosData.longitude,
          monthly_price: kosData.monthly_price,
          gender: kosData.gender,
          total_rooms: kosData.total_rooms,
          available_rooms: kosData.available_rooms,
          phone_number: kosData.phone_number,
          whatsapp_number: kosData.whatsapp_number,
          email: kosData.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update kos');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update kos');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!kosData) return;

    const { name, value, type } = e.target;
    setKosData(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      };
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading kos data...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  if (error && !kosData) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!kosData) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-gray-600">Kos not found</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Kos Listing
          </h1>
          <p className="mt-2 text-gray-600">
            Update your kos listing information
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Kos Name *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={kosData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Kos Melati Surabaya"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={kosData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your kos facilities, rules, and what makes it special..."
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={kosData.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="PUTRA">Male Only (Putra)</option>
                  <option value="PUTRI">Female Only (Putri)</option>
                  <option value="CAMPUR">Mixed (Campur)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Location
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={kosData.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Jl. Raya ITS No. 123, Sukolilo, Surabaya, Jawa Timur 60111"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    id="latitude"
                    name="latitude"
                    value={kosData.latitude}
                    onChange={handleInputChange}
                    required
                    step="any"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., -7.2819"
                  />
                </div>

                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    id="longitude"
                    name="longitude"
                    value={kosData.longitude}
                    onChange={handleInputChange}
                    required
                    step="any"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 112.7950"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Rooms */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Pricing & Availability
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="monthly_price" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Price (IDR) *
                </label>
                <input
                  type="number"
                  id="monthly_price"
                  name="monthly_price"
                  value={kosData.monthly_price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 500000"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="total_rooms" className="block text-sm font-medium text-gray-700 mb-1">
                    Total Rooms *
                  </label>
                  <input
                    type="number"
                    id="total_rooms"
                    name="total_rooms"
                    value={kosData.total_rooms}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 10"
                  />
                </div>

                <div>
                  <label htmlFor="available_rooms" className="block text-sm font-medium text-gray-700 mb-1">
                    Available Rooms *
                  </label>
                  <input
                    type="number"
                    id="available_rooms"
                    name="available_rooms"
                    value={kosData.available_rooms}
                    onChange={handleInputChange}
                    required
                    min="0"
                    max={kosData.total_rooms}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 3"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={kosData.phone_number}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., +6281234567890"
                />
              </div>

              <div>
                <label htmlFor="whatsapp_number" className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  id="whatsapp_number"
                  name="whatsapp_number"
                  value={kosData.whatsapp_number || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., +6281234567890"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={kosData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., owner@example.com"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Kos
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}