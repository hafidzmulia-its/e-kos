'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface KosListing {
  id: number;
  title: string;
  slug: string;
  description: string;
  address: string;
  gender: 'male' | 'female' | 'mixed';
  monthly_price: number;
  total_rooms: number;
  available_rooms: number;
  distance_to_its_km: number;
  latitude: number;
  longitude: number;
  facilities: string[];
  rules: string[];
  contact_info: any;
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
  const [id, setId] = useState('');

  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    gender: 'mixed' as 'male' | 'female' | 'mixed',
    monthly_price: 0,
    total_rooms: 0,
    available_rooms: 0,
    distance_to_its_km: 0,
    latitude: 0,
    longitude: 0,
    facilities: [] as string[],
    rules: [] as string[],
    contact_info: {}
  });

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
        gender: data.data.gender || 'mixed',
        monthly_price: data.data.monthly_price || 0,
        total_rooms: data.data.total_rooms || 0,
        available_rooms: data.data.available_rooms || 0,
        distance_to_its_km: data.data.distance_to_its_km || 0,
        latitude: data.data.latitude || 0,
        longitude: data.data.longitude || 0,
        facilities: data.data.facilities || [],
        rules: data.data.rules || [],
        contact_info: data.data.contact_info || {}
      });
      
    } catch (error) {
      console.error('Error fetching kos:', error);
      setError('Failed to load kos listing');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/kos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update kos');

      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating kos:', error);
      setError('Failed to update kos listing');
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
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-lg">Loading kos details...</div>
        </div>
      </div>
    );
  }

  if (!kos) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">
          Kos listing not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Edit Kos Listing
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
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
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>

        <div>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Price (Rp)
            </label>
            <input
              type="number"
              name="monthly_price"
              value={formData.monthly_price}
              onChange={handleInputChange}
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Rooms
            </label>
            <input
              type="number"
              name="total_rooms"
              value={formData.total_rooms}
              onChange={handleInputChange}
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Available Rooms
            </label>
            <input
              type="number"
              name="available_rooms"
              value={formData.available_rooms}
              onChange={handleInputChange}
              min="0"
              max={formData.total_rooms}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distance to ITS (km)
            </label>
            <input
              type="number"
              name="distance_to_its_km"
              value={formData.distance_to_its_km}
              onChange={handleInputChange}
              min="0"
              step="0.1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

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
            />
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update Kos'}
          </button>
        </div>
      </form>
    </div>
  );
}