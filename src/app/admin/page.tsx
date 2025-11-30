'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation';
import Link from 'next/link';
import { Shield, MapPin, Users, DollarSign, Bed, Edit3, Trash2, AlertCircle } from 'lucide-react';

interface KosListing {
  id: number;
  title: string;
  slug: string;
  address: string;
  gender: string;
  monthly_price: number;
  available_rooms: number;
  total_rooms: number;
  is_active: boolean;
  created_at: string;
  owner?: {
    name: string;
    email: string;
  };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [kosListings, setKosListings] = useState<KosListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      loadKosListings();
    }
  }, [status, router]);

  const loadKosListings = async () => {
    try {
      const response = await fetch('/api/admin/kos');
      if (response.ok) {
        const result = await response.json();
        setKosListings(result.data || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load listings');
      }
    } catch (error) {
      console.error('Error loading admin kos listings:', error);
      setError('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/kos?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setKosListings(prev => prev.filter(kos => kos.id !== id));
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting kos:', error);
      alert('Failed to delete listing');
    }
  };

  const getGenderDisplay = (gender: string) => {
    switch (gender) {
      case 'PUTRA': return 'Male';
      case 'PUTRI': return 'Female';
      case 'CAMPUR': return 'Mixed';
      default: return gender;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage all kos listings and user data
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Listings</p>
                <p className="text-2xl font-bold text-gray-900">{kosListings.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Bed className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Rooms</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kosListings.reduce((sum, kos) => sum + kos.available_rooms, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kosListings.reduce((sum, kos) => sum + kos.total_rooms, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kosListings.filter(kos => !kos.is_active).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="block sm:inline">{error}</span>
            </div>
          </div>
        )}

        {/* Listings */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Kos Listings
            </h2>
          </div>
          
          {kosListings.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No kos listings found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                There are currently no kos listings in the system.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {kosListings.map((kos) => (
                <div key={kos.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          <Link 
                            href={`/kos/${kos.slug}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {kos.title}
                          </Link>
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          kos.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {kos.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="mt-1 flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{kos.address}</span>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{getGenderDisplay(kos.gender)}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span>Rp {kos.monthly_price.toLocaleString('id-ID')}/month</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <Bed className="w-4 h-4 mr-1" />
                          <span>{kos.available_rooms}/{kos.total_rooms} rooms</span>
                        </div>
                      </div>

                      {kos.owner && (
                        <div className="mt-2 text-sm text-gray-500">
                          Owner: {kos.owner.name} ({kos.owner.email})
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        href={`/dashboard/kos/${kos.id}/edit`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                      
                      <button
                        onClick={() => handleDelete(kos.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}