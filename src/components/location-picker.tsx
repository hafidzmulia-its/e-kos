'use client';

import { useEffect, useState } from 'react';

interface LocationPickerProps {
  initialPosition: [number, number];
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  height?: string;
}

export default function LocationPicker({ 
  initialPosition, 
  onLocationSelect, 
  height = '400px' 
}: LocationPickerProps) {
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>(initialPosition);

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

  return (
    <div className="space-y-4">
      {/* Google Maps Embed with Click Information */}
      <div className="relative">
        <div className="mb-2 text-sm text-gray-600">
          📍 Use the map below for reference, then enter coordinates manually
        </div>
        <div style={{ height }} className="rounded-lg overflow-hidden border border-gray-300">
          <iframe
            src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.1!2d${selectedPosition[1]}!3d${selectedPosition[0]}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f15.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMTYnNTUuMCJTIDExMsKwNDcnNDMuNCJF!5e0!3m2!1sen!2sid!4v1701234567890!5m2!1sen!2sid`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          💡 Tip: Right-click on any location in Google Maps and copy the coordinates that appear
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