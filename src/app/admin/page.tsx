'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from '@/components/navigation';
import { Shield, Users, MapPin, Edit, Trash2, Eye } from 'lucide-react';

interface AdminKosListing {
  id: number;
  title: string;
  slug: string;
  gender: string;
  monthly_price: number;
  available_rooms: number;
  total_rooms: number;
  address: string;
  created_at: string;
  owner: {
    name: string;
    email: string;
  };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [kosListings, setKosListings] = useState<AdminKosListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/api/auth/signin?callbackUrl=/admin');
      return;
    }

    if (session.user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchAllKos();
  }, [session, status, router]);

  const fetchAllKos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/kos');
      if (!response.ok) {
        throw new Error('Failed to fetch kos listings');
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
    if (!confirm('Are you sure you want to delete this kos listing? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/kos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete kos');
      }

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
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return null; // Will redirect
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage all kos listings and moderate the platform
              </p>
            </div>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <MapPin className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {kosListings.length}
                </div>
                <div className="text-sm text-gray-600">Total Listings</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {kosListings.reduce((sum, kos) => sum + kos.available_rooms, 0)}
                </div>
                <div className="text-sm text-gray-600">Available Rooms</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                %
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {kosListings.length > 0 ? Math.round(
                    (kosListings.filter(kos => kos.available_rooms > 0).length / kosListings.length) * 100
                  ) : 0}%
                </div>
                <div className="text-sm text-gray-600">Availability Rate</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                U
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {new Set(kosListings.map(kos => kos.owner.email)).size}
                </div>
                <div className="text-sm text-gray-600">Active Owners</div>
              </div>
            </div>
          </div>
        </div>

        {/* Kos Listings Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Kos Listings
            </h2>
          </div>

          {kosListings.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No kos listings found
              </h3>
              <p className="text-gray-600">
                Kos listings will appear here once users start creating them.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kos Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price & Rooms
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {kosListings.map((kos) => (
                    <tr key={kos.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {kos.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {kos.address}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            <span className="capitalize">{kos.gender.toLowerCase()}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {kos.owner.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {kos.owner.email}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Rp {kos.monthly_price.toLocaleString('id-ID')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {kos.available_rooms}/{kos.total_rooms} rooms
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          kos.available_rooms > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {kos.available_rooms > 0 ? 'Available' : 'Full'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(kos.created_at).toLocaleDateString()}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <a
                            href={`/kos/${kos.slug}`}
                            className="text-gray-600 hover:text-blue-600 p-1 rounded"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          
                          <a
                            href={`/dashboard/kos/${kos.id}/edit`}
                            className="text-gray-600 hover:text-blue-600 p-1 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </a>
                          
                          <button
                            onClick={() => deleteKos(kos.id)}
                            className="text-gray-600 hover:text-red-600 p-1 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}