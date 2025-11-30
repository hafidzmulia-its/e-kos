'use client';

import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/navigation';

// Dynamically import the map component to avoid SSR issues with Leaflet
const KosMap = dynamic(() => import('@/components/kos-map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const { data: session, status } = useSession();

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Kos Map - Find Your Perfect Boarding House
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {session ? (
                  <>Welcome back, {session.user?.name}! Explore available kos around ITS campus.</>
                ) : (
                  <>Explore available kos around ITS campus. <a href="/api/auth/signin" className="text-blue-600 hover:underline">Sign in</a> to add your own kos.</>
                )}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Use the filters to narrow down your search
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="h-[calc(100vh-180px)]">
        <KosMap />
      </div>

      {/* Quick Info */}
      <div className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
              <span>Putra (Male)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-pink-600 rounded-full"></div>
              <span>Putri (Female)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              <span>Campur (Mixed)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-600 rounded-full"></div>
              <span>ITS Campus</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}