'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { KosMarker, KosFilters, GenderType } from '@/types/database';
import { Filter, Search, MapPin } from 'lucide-react';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface KosMapProps {
  onKosSelect?: (kos: KosMarker) => void;
}

const ITS_LOCATION = {
  lat: -7.2819,
  lng: 112.7954,
  name: 'Institut Teknologi Sepuluh Nopember (ITS)'
};

export default function KosMap({ onKosSelect }: KosMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [kosData, setKosData] = useState<KosMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<KosFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map
    const map = L.map(mapContainerRef.current).setView(
      [ITS_LOCATION.lat, ITS_LOCATION.lng], 
      14
    );

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add ITS marker
    const itsIcon = L.divIcon({
      html: `
        <div class="bg-red-600 text-white p-2 rounded-full shadow-lg flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `,
      className: 'custom-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    L.marker([ITS_LOCATION.lat, ITS_LOCATION.lng], { icon: itsIcon })
      .addTo(map)
      .bindPopup(`<strong>${ITS_LOCATION.name}</strong><br/>Main Campus`);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

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

  // Update map markers when kos data changes
  useEffect(() => {
    if (!mapRef.current || !kosData.length) return;

    // Clear existing markers (except ITS)
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer.getLatLng().lat !== ITS_LOCATION.lat) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Add kos markers
    kosData.forEach((kos) => {
      const genderColor = {
        PUTRA: '#3B82F6', // blue
        PUTRI: '#EC4899', // pink
        CAMPUR: '#10B981' // green
      }[kos.gender];

      const kosIcon = L.divIcon({
        html: `
          <div class="relative">
            <div style="background-color: ${genderColor}" class="text-white p-1 rounded-full shadow-lg flex items-center justify-center w-8 h-8">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div class="absolute -bottom-1 -right-1 bg-white text-xs px-1 rounded shadow border text-gray-700 font-semibold">
              ${kos.available_rooms}
            </div>
          </div>
        `,
        className: 'custom-kos-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([kos.latitude, kos.longitude], { icon: kosIcon })
        .addTo(mapRef.current!);

      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold text-lg mb-2">${kos.title}</h3>
          <div class="space-y-1 text-sm">
            <p><span class="font-medium">Gender:</span> ${kos.gender}</p>
            <p><span class="font-medium">Price:</span> Rp ${kos.monthly_price.toLocaleString('id-ID')}/month</p>
            <p><span class="font-medium">Available Rooms:</span> ${kos.available_rooms}</p>
            ${kos.distance_to_its_km ? `<p><span class="font-medium">Distance to ITS:</span> ${kos.distance_to_its_km} km</p>` : ''}
          </div>
          <button 
            onclick="window.location.href='/kos/${kos.slug}'" 
            class="mt-3 w-full bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
          >
            View Details
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 300 });

      marker.on('click', () => {
        if (onKosSelect) {
          onKosSelect(kos);
        }
      });
    });
  }, [kosData, onKosSelect]);

  return (
    <div className="relative h-full">
      {/* Map Container */}
      <div ref={mapContainerRef} className="h-full w-full" />
      
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center">
            <MapPin className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Loading kos locations...</p>
          </div>
        </div>
      )}

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

      {/* Filter Panel */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-white shadow-lg border border-gray-200 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-50"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </button>

        {showFilters && (
          <div className="mt-2 bg-white shadow-lg border border-gray-200 rounded-lg p-4 w-80">
            <h3 className="font-medium text-gray-900 mb-4">Filter Kos</h3>
            
            <div className="space-y-4">
              {/* Gender Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender Type
                </label>
                <select
                  value={filters.gender || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value as GenderType || undefined }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="PUTRA">Putra (Male)</option>
                  <option value="PUTRI">Putri (Female)</option>
                  <option value="CAMPUR">Campur (Mixed)</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (Rp/month)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min price"
                    value={filters.min_price || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, min_price: e.target.value ? parseInt(e.target.value) : undefined }))}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max price"
                    value={filters.max_price || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, max_price: e.target.value ? parseInt(e.target.value) : undefined }))}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Distance Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Distance from ITS (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 2.5"
                  value={filters.max_distance || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, max_distance: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                className="w-full text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-50"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="absolute bottom-4 left-4 bg-white shadow-lg border border-gray-200 px-4 py-2 rounded-lg z-10">
        <p className="text-sm text-gray-600">
          {loading ? 'Loading...' : `${kosData.length} kos found`}
        </p>
      </div>
    </div>
  );
}