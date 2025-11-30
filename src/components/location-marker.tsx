'use client';

import { useState, useEffect } from 'react';

interface LocationMarkerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function LocationMarker({ onLocationSelect }: LocationMarkerProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [Marker, setMarker] = useState<any>(null);
  const [useMapEvents, setUseMapEvents] = useState<any>(null);

  useEffect(() => {
    // Dynamically import react-leaflet components only on client side
    const loadLeafletComponents = async () => {
      try {
        const { Marker: MarkerComponent, useMapEvents: useMapEventsHook } = await import('react-leaflet');
        setMarker(() => MarkerComponent);
        setUseMapEvents(() => useMapEventsHook);
      } catch (error) {
        console.error('Failed to load Leaflet components:', error);
      }
    };

    loadLeafletComponents();
  }, []);

  // Use the hook only when it's available
  const map = useMapEvents ? useMapEvents({
    click(e: any) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  }) : null;

  // Return marker only if both position and Marker component are available
  return (position && Marker) ? <Marker position={position} /> : null;
}