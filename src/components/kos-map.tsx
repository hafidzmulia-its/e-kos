'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { KosMarker, KosFilters, GenderType } from '@/types/database';
import { Filter, MapPin, ExternalLink } from 'lucide-react';

// Dynamic imports for Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

interface KosMapProps {
  onKosSelect?: (kos: KosMarker) => void;
}

const ITS_LOCATION = {
  lat: -7.2819,
  lng: 112.7954,
  name: 'Institut Teknologi Sepuluh Nopember (ITS)'
};

// Component to handle Leaflet icon fixes when component mounts
const LeafletIconFix = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Import Leaflet only on client side
      import('leaflet').then((L) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
      });
    }
  }, []);
  return null;
};

// Custom marker component for kos locations
const KosMarkerComponent = ({ kos, onSelect, isSelected, markerRef }: { kos: KosMarker; onSelect: (kos: KosMarker) => void; isSelected: boolean; markerRef?: (ref: any) => void }) => {
  const [customIcon, setCustomIcon] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        const color = {
          PUTRA: '#3B82F6',  // Blue
          PUTRI: '#EC4899',  // Pink
          CAMPUR: '#10B981'  // Green
        }[kos.gender];
        
        // Add pulsing animation and larger size if selected
        const size = isSelected ? 28 : 20;
        const borderWidth = isSelected ? 4 : 3;
        const pulseAnimation = isSelected ? 'animation: pulse 2s infinite;' : '';
        
        const icon = L.divIcon({
          html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: ${borderWidth}px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); ${pulseAnimation}"></div>`,
          className: 'custom-kos-marker',
          iconSize: [size, size],
          iconAnchor: [size/2, size/2]
        });
        setCustomIcon(icon);
      });
    }
  }, [kos.gender, isSelected]);

  if (!customIcon) return null;

  return (
    <Marker
      position={[kos.latitude, kos.longitude]}
      icon={customIcon}
      eventHandlers={{
        click: () => onSelect(kos)
      }}
      ref={markerRef}
    >
      <Popup>
        <div className="min-w-[200px]">
          {kos.cover_image_url && (
            <img 
              src={kos.cover_image_url} 
              alt={kos.title}
              className="w-full h-32 object-cover rounded-lg mb-2"
            />
          )}
          <h3 className="font-semibold text-gray-900 mb-2">{kos.title}</h3>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Type:</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                {
                  PUTRA: 'bg-blue-100 text-blue-800',
                  PUTRI: 'bg-pink-100 text-pink-800',
                  CAMPUR: 'bg-green-100 text-green-800'
                }[kos.gender]
              }`}>
                {kos.gender}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Price:</span>
              <span className="text-sm font-semibold">Rp {kos.monthly_price.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Available:</span>
              <span className="text-sm">{kos.available_rooms} rooms</span>
            </div>
            {kos.distance_to_its_km && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Distance:</span>
                <span className="text-sm">{kos.distance_to_its_km} km</span>
              </div>
            )}
            <div className="mt-2 pt-2 border-t border-gray-200">
              <a
                href={`/kos/${kos.slug}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Details →
              </a>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default function KosMap({ onKosSelect }: KosMapProps) {
  const [kosData, setKosData] = useState<KosMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<KosFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedKos, setSelectedKos] = useState<KosMarker | null>(null);
  const mapRef = useRef<any>(null);
  const markerRefs = useRef<{ [key: number]: any }>({});
  
  // Bottom sheet state for mobile
  const [isExpanded, setIsExpanded] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch kos data
  useEffect(() => {
    fetchKosData();
  }, [filters]);

  const fetchKosData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.min_price) params.append('min_price', filters.min_price.toString());
      if (filters.max_price) params.append('max_price', filters.max_price.toString());
      if (filters.max_distance) params.append('max_distance', filters.max_distance.toString());
      if (filters.available_only) params.append('available_only', 'true');

      const response = await fetch(`/api/kos?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch kos data');
      }

      const result = await response.json();
      setKosData(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load kos data');
    } finally {
      setLoading(false);
    }
  };

  // Function to center map on selected kos and open its popup
  const centerMapOnKos = (kos: KosMarker) => {
    if (mapRef.current) {
      const map = mapRef.current;
      
      // On mobile, offset the center point upward to account for bottom sheet
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        // Calculate offset to move marker higher on screen
        const targetPoint = map.project([kos.latitude, kos.longitude], 16);
        // Shift up by 15% of screen height to center in visible area above bottom sheet
        targetPoint.y -= window.innerHeight * 0.15;
        const targetLatLng = map.unproject(targetPoint, 16);
        
        map.setView(targetLatLng, 16, {
          animate: true,
          duration: 1
        });
      } else {
        // Desktop: normal centering
        map.setView([kos.latitude, kos.longitude], 16, {
          animate: true,
          duration: 1
        });
      }
      
      // Close all popups first
      map.closePopup();
      
      // Open the popup for the selected kos after a short delay
      setTimeout(() => {
        const marker = markerRefs.current[kos.id];
        if (marker) {
          marker.openPopup();
        }
      }, 500); // Wait for animation to complete
    }
  };

  // Touch handlers for bottom sheet
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const diff = startY - currentY;
    
    // If swiped up more than 50px, expand
    if (diff > 50) {
      setIsExpanded(true);
    }
    // If swiped down more than 50px, collapse
    else if (diff < -50) {
      setIsExpanded(false);
    }
    
    setStartY(0);
    setCurrentY(0);
  };

  return (
    <div className="relative h-full w-full flex flex-col md:flex-row overflow-hidden">
      <LeafletIconFix />
      
      {/* Map Container - Interactive Leaflet Map */}
      <div className="relative w-full md:flex-1 h-full md:h-full z-0">
        <MapContainer
          center={[ITS_LOCATION.lat, ITS_LOCATION.lng]}
          zoom={14}
          className="h-full w-full md:rounded-l-lg"
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* ITS Campus Marker */}
          <Marker position={[ITS_LOCATION.lat, ITS_LOCATION.lng]}>
            <Popup>
              <div className="text-center">
                <strong className="text-red-600">🏫 {ITS_LOCATION.name}</strong>
                <p className="text-sm text-gray-600 mt-1">Main Campus</p>
              </div>
            </Popup>
          </Marker>
          
          {/* Kos Markers */}
          {kosData.map((kos) => (
            <KosMarkerComponent
              key={kos.id}
              kos={kos}
              isSelected={selectedKos?.id === kos.id}
              onSelect={(selectedKos) => {
                setSelectedKos(selectedKos);
                if (onKosSelect) onKosSelect(selectedKos);
              }}
              markerRef={(ref) => {
                if (ref) {
                  markerRefs.current[kos.id] = ref;
                }
              }}
            />
          ))}
        </MapContainer>
        
        {/* Map Controls */}
        <div className="absolute bottom-4 right-4 space-y-2 z-10 md:z-auto mb-[calc(30vh+1rem)] md:mb-0">
          <a
            href={`https://www.google.com/maps/search/kos/@${ITS_LOCATION.lat},${ITS_LOCATION.lng},14z`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white shadow-lg border border-gray-200 px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-50 text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Google Maps</span>
            <span className="sm:hidden">Maps</span>
          </a>
        </div>
      </div>
      
      {/* Kos List Sidebar - Desktop: Fixed sidebar, Mobile: Draggable bottom sheet */}
      <div 
        className={`
          fixed md:relative
          bottom-0 md:bottom-auto
          left-0 right-0 md:left-auto md:right-auto
          w-full md:w-96 
          bg-white 
          border-t md:border-t-0 md:border-l border-gray-200 
          flex flex-col 
          transition-all duration-300 ease-out
          md:h-full
          rounded-t-3xl md:rounded-none
          shadow-2xl md:shadow-none
          z-50 md:z-auto
          ${isExpanded ? 'h-[70vh]' : 'h-[30vh]'}
        `}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle - Mobile Only */}
        <div className="md:hidden flex justify-center py-2 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>
        
        {/* Header with Filter Toggle */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Kos Listings</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-600">
            {loading ? 'Loading...' : `${kosData.length} kos found`}
          </p>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Filter Options</h4>
            
            <div className="space-y-3">
              {/* Gender Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender Type
                </label>
                <select
                  value={filters.gender || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value as GenderType || undefined }))}
                  className="w-full text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="PUTRA">Putra (Male)</option>
                  <option value="PUTRI">Putri (Female)</option>
                  <option value="CAMPUR">Campur (Mixed)</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range (Rp/month)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.min_price || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, min_price: e.target.value ? parseInt(e.target.value) : undefined }))}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.max_price || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, max_price: e.target.value ? parseInt(e.target.value) : undefined }))}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Available Only */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.available_only || false}
                    onChange={(e) => setFilters(prev => ({ ...prev, available_only: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Available rooms only</span>
                </label>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => setFilters({})}
                className="w-full text-sm text-gray-600 hover:text-gray-800 bg-white border border-gray-300 px-2 py-1 rounded-md hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <MapPin className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : kosData.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No kos found with current filters
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {kosData.map((kos) => {
                const genderColor = {
                  PUTRA: 'bg-blue-100 text-blue-800',
                  PUTRI: 'bg-pink-100 text-pink-800',
                  CAMPUR: 'bg-green-100 text-green-800'
                }[kos.gender];
                
                return (
                  <div
                    key={kos.id}
                    className={`p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedKos?.id === kos.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      setSelectedKos(kos);
                      centerMapOnKos(kos); // Center map on clicked kos
                      if (onKosSelect) onKosSelect(kos);
                    }}
                  >
                    <h4 className="font-medium text-gray-900 mb-1">{kos.title}</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${genderColor}`}>
                        {kos.gender}
                      </span>
                      <span className="text-sm text-gray-600">
                        {kos.available_rooms} rooms
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      Rp {kos.monthly_price.toLocaleString('id-ID')}/month
                    </p>
                    {kos.distance_to_its_km && (
                      <p className="text-xs text-gray-500 mt-1">
                        {kos.distance_to_its_km} km from ITS
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-10">
          <p className="font-medium">Error loading map data</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchKosData}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}