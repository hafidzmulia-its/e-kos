'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  initialPosition: [number, number];
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  height?: string;
}

// Component to handle map clicks
function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function LocationPicker({ 
  initialPosition, 
  onLocationSelect, 
  height = '400px' 
}: LocationPickerProps) {
  const [isClient, setIsClient] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>(initialPosition);

  useEffect(() => {
    setIsClient(true);
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

  if (!isClient) {
    return (
      <div 
        className="bg-gray-200 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <span className="text-gray-600">Loading map...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="mb-2 text-sm text-gray-600">
        📍 Click on the map to select location
      </div>
      <div style={{ height }} className="rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={initialPosition}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Show initial position marker */}
          <Marker position={selectedPosition} />
          
          {/* Handle map clicks for new location */}
          <LocationMarker onLocationSelect={handleLocationSelect} />
        </MapContainer>
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Current coordinates: {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
      </div>
    </div>
  );
}