import { notFound } from 'next/navigation';
import { KosModel } from '@/lib/models/kos';
import Navigation from '@/components/navigation';
import Link from 'next/link';
import { MapPin, Users, DollarSign, Bed, ArrowLeft } from 'lucide-react';

interface KosDetailPageProps {
  params: {
    slug: string;
  };
}

export default async function KosDetailPage({ params }: KosDetailPageProps) {
  // Await params as it's now a Promise in Next.js 15+
  const { slug } = await params;
  
  let kos;
  try {
    kos = await KosModel.getKosDetails(slug);
  } catch (error) {
    console.error('Error fetching kos details:', error);
    notFound();
  }

  if (!kos) {
    notFound();
  }

  // Convert gender from Indonesian to English for display
  const getGenderDisplay = (gender: string) => {
    switch (gender) {
      case 'PUTRA': return 'male';
      case 'PUTRI': return 'female';
      case 'CAMPUR': return 'mixed';
      default: return gender.toLowerCase();
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/map"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Map
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {kos.title}
              </h1>
              
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{kos.address}</span>
                {kos.distance_to_its_km && (
                  <span className="ml-4 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                    {kos.distance_to_its_km} km from ITS
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="capitalize">{getGenderDisplay(kos.gender)}</span>
                </div>
                
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="font-semibold">
                    Rp {kos.monthly_price.toLocaleString('id-ID')}/month
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Bed className="w-5 h-5 mr-2 text-gray-500" />
                  <span>
                    {kos.available_rooms} available of {kos.total_rooms} rooms
                  </span>
                </div>
              </div>
            </div>
            
            <div className="lg:ml-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-800">
                  {kos.available_rooms > 0 ? 'Available' : 'Full'}
                </div>
                <div className="text-sm text-green-600">
                  {kos.available_rooms} rooms left
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {kos.description || 'No description available.'}
              </p>
            </div>

            {/* Facilities */}
            {kos.facilities && kos.facilities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Facilities
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {kos.facilities.map((facility: any, index: number) => (
                    <div
                      key={facility.name || facility.facility_id || index}
                      className={`flex items-center p-3 rounded-lg border ${
                        facility.is_available
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {facility.name || facility.facility_types?.name}
                        </div>
                        {facility.extra_price > 0 && (
                          <div className="text-xs text-gray-500">
                            +Rp {facility.extra_price.toLocaleString('id-ID')}
                          </div>
                        )}
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        facility.is_available ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Contact */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Owner
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Owner:</span>
                  <div className="font-medium">{kos.owner?.name || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Email:</span>
                  <div className="font-medium">{kos.owner?.email || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender Type</span>
                  <span className="font-medium capitalize">
                    {getGenderDisplay(kos.gender)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Price</span>
                  <span className="font-medium">
                    Rp {kos.monthly_price.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Rooms</span>
                  <span className="font-medium">{kos.available_rooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Rooms</span>
                  <span className="font-medium">{kos.total_rooms}</span>
                </div>
                {kos.distance_to_its_km && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distance to ITS</span>
                    <span className="font-medium">{kos.distance_to_its_km} km</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export async function generateStaticParams() {
  // In a real app, you'd fetch all slugs from the database
  return [];
}

export async function generateMetadata({ params }: KosDetailPageProps) {
  // Await params as it's now a Promise in Next.js 15+
  const { slug } = await params;
  const kos = await KosModel.getKosDetails(slug);

  if (!kos) {
    return {
      title: 'Kos Not Found',
    };
  }

  return {
    title: `${kos.title} - ITS KosFinder`,
    description: kos.description || `${kos.title} - Boarding house near ITS campus`,
  };
}