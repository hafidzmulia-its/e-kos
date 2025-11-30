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

            {/* Reviews */}
            {kos.reviews && kos.reviews.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Reviews ({kos.reviews.length})
                </h2>
                <div className="space-y-4">
                  {kos.reviews.slice(0, 3).map((review: any, index: number) => (
                    <div key={review.id || `review-${index}`} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">
                          {review.users?.name || 'Anonymous'}
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={`star-${i}`}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Owner */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Owner
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700">Owner</div>
                  <div className="text-gray-900">
                    {kos.users?.name || 'Not available'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Email</div>
                  <a
                    href={`mailto:${kos.users?.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {kos.users?.email || 'Not available'}
                  </a>
                </div>
              </div>
              
              <button className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Contact Owner
              </button>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Location
              </h3>
              <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm">
                    Lat: {kos.latitude}, Lng: {kos.longitude}
                  </div>
                  <div className="text-xs mt-1">
                    Interactive map coming soon
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
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
    description: kos.description || `${kos.title} - ${kos.gender} kos near ITS campus for Rp ${kos.monthly_price.toLocaleString('id-ID')}/month`,
  };
}