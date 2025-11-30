'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from '@/components/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, MapPin, DollarSign, Users } from 'lucide-react';

interface KosListing {
  id: number;
  title: string;
  slug: string;
  gender: string;
  monthly_price: number;
  available_rooms: number;
  total_rooms: number;
  address: string;
  created_at: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [kosListings, setKosListings] = useState<KosListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/api/auth/signin?callbackUrl=/dashboard');
      return;
    }

    fetchUserKos();
  }, [session, status, router]);

  const fetchUserKos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/kos/my');
      if (!response.ok) {
        throw new Error('Failed to fetch your kos listings');
      }
      const data = await response.json();
      setKosListings(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load kos listings');
    } finally {
      setLoading(false);
    }
  };

  const deleteKos = async (id: number) => {
    if (!confirm('Are you sure you want to delete this kos listing?')) {
      return;
    }

    try {
      const response = await fetch(`/api/kos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete kos');
      }

      // Remove from local state
      setKosListings(prev => prev.filter(kos => kos.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete kos');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Kos Listings
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your boarding house listings
              </p>
            </div>
            <Link
              href="/dashboard/kos/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Kos</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}

        {kosListings.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No kos listings yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start by creating your first kos listing to help students find your boarding house.
              </p>
              <Link
                href="/dashboard/kos/new"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create First Kos</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {kosListings.map((kos) => (
              <div key={kos.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {kos.title}
                    </h3>
                    
                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {kos.address}
                      </div>
                      
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span className="capitalize">{kos.gender.toLowerCase()}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Rp {kos.monthly_price.toLocaleString('id-ID')}/month
                      </div>
                      
                      <div className="flex items-center">
                        <span>{kos.available_rooms} of {kos.total_rooms} rooms available</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Created: {new Date(kos.created_at).toLocaleDateString()}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        kos.available_rooms > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {kos.available_rooms > 0 ? 'Available' : 'Full'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      href={`/kos/${kos.slug}`}
                      className="text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    
                    <Link
                      href={`/dashboard/kos/${kos.id}/edit`}
                      className="text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    
                    <button
                      onClick={() => deleteKos(kos.id)}
                      className="text-gray-600 hover:text-red-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {kosListings.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {kosListings.length}
              </div>
              <div className="text-sm text-gray-600">
                Total Listings
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {kosListings.reduce((sum, kos) => sum + kos.available_rooms, 0)}
              </div>
              <div className="text-sm text-gray-600">
                Available Rooms
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {kosListings.reduce((sum, kos) => sum + kos.total_rooms, 0)}
              </div>
              <div className="text-sm text-gray-600">
                Total Rooms
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}