'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports for Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

interface LocationPickerProps {
  initialPosition: [number, number];
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  height?: string;
}

export default function LocationPickerLeaflet({ 
  initialPosition, 
  onLocationSelect, 
  height = '400px' 
}: LocationPickerProps) {
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>(initialPosition);
  const [markerIcon, setMarkerIcon] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const markerRef = useRef<any>(null);

  // Fix Leaflet icons on mount
  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Create custom marker for selected location
        const icon = L.divIcon({
          html: '<div style="background-color: #EF4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); cursor: move;"></div>',
          className: 'custom-location-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        setMarkerIcon(icon);
      });
    }
  }, []);

  const handleLocationSelect = async (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
    
    // Try to get address from reverse geocoding
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      );
      const data = await response.json();
      const address = data.display_name || '';
      onLocationSelect(lat, lng, address);
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      onLocationSelect(lat, lng);
    }
  };

  const handleMarkerDrag = (event: any) => {
    const marker = event.target;
    const position = marker.getLatLng();
    handleLocationSelect(position.lat, position.lng);
  };

  // Don't render map until client-side and icon is ready
  if (!isClient || !markerIcon) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <div className="mb-2 text-sm text-gray-600">
            📍 Loading map...
          </div>
          <div style={{ height }} className="rounded-lg overflow-hidden border border-gray-300 bg-gray-100 flex items-center justify-center">
            <div className="text-gray-500">Initializing map...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Interactive Leaflet Map */}
      <div className="relative">
        <div className="mb-2 text-sm text-gray-600">
          📍 Drag the red marker to select location, or enter coordinates manually below
        </div>
        <div style={{ height }} className="rounded-lg overflow-hidden border border-gray-300">
          <MapContainer
            center={selectedPosition}
            zoom={15}
            className="h-full w-full"
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Draggable Location Marker */}
            {markerIcon && (
              <Marker 
                position={selectedPosition} 
                draggable={true}
                icon={markerIcon}
                ref={markerRef}
                eventHandlers={{
                  dragend: handleMarkerDrag,
                }}
              >
                <Popup>
                  <div>
                    <strong>Selected Location</strong>
                    <p className="text-sm text-gray-600 mt-1">
                      Drag me to change location!
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          💡 Tip: Drag the red marker to your desired location, or use manual input below
        </div>
      </div>
      
      {/* Manual Input */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
            Latitude *
          </label>
          <input
            type="number"
            id="latitude"
            step="0.000001"
            value={selectedPosition[0]}
            onChange={(e) => {
              const lat = parseFloat(e.target.value) || 0;
              setSelectedPosition([lat, selectedPosition[1]]);
              handleLocationSelect(lat, selectedPosition[1]);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="-7.2819"
          />
        </div>
        <div>
          <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
            Longitude *
          </label>
          <input
            type="number"
            id="longitude"
            step="0.000001"
            value={selectedPosition[1]}
            onChange={(e) => {
              const lng = parseFloat(e.target.value) || 0;
              setSelectedPosition([selectedPosition[0], lng]);
              handleLocationSelect(selectedPosition[0], lng);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="112.7954"
          />
        </div>
      </div>
      
      {/* Current Location Display */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        📌 Current: {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
      </div>
    </div>
  );
}