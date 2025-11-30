'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

interface FacilityType {
  id: number;
  name: string;
  icon?: string;
}

interface SelectedFacility {
  facility_id: number;
  extra_price: number;
}

interface FacilitySelectorProps {
  selectedFacilities: SelectedFacility[];
  onFacilitiesChange: (facilities: SelectedFacility[]) => void;
}

export default function FacilitySelector({ 
  selectedFacilities, 
  onFacilitiesChange 
}: FacilitySelectorProps) {
  const [availableFacilities, setAvailableFacilities] = useState<FacilityType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const response = await fetch('/api/facilities');
      if (response.ok) {
        const data = await response.json();
        setAvailableFacilities(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFacilitySelected = (facilityId: number) => {
    return selectedFacilities.some(f => f.facility_id === facilityId);
  };

  const getFacilityExtraPrice = (facilityId: number) => {
    const facility = selectedFacilities.find(f => f.facility_id === facilityId);
    return facility?.extra_price || 0;
  };

  const toggleFacility = (facilityId: number) => {
    if (isFacilitySelected(facilityId)) {
      // Remove facility
      onFacilitiesChange(selectedFacilities.filter(f => f.facility_id !== facilityId));
    } else {
      // Add facility with 0 extra price
      onFacilitiesChange([...selectedFacilities, { facility_id: facilityId, extra_price: 0 }]);
    }
  };

  const updateExtraPrice = (facilityId: number, price: number) => {
    onFacilitiesChange(
      selectedFacilities.map(f => 
        f.facility_id === facilityId 
          ? { ...f, extra_price: price } 
          : f
      )
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading facilities...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Select facilities available in your kos. You can add extra price for each facility if applicable.
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {availableFacilities.map((facility) => {
          const isSelected = isFacilitySelected(facility.id);
          const extraPrice = getFacilityExtraPrice(facility.id);
          
          return (
            <div key={facility.id} className="space-y-2">
              <button
                type="button"
                onClick={() => toggleFacility(facility.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <span className="text-sm font-medium text-gray-900">
                  {facility.name}
                </span>
                {isSelected && (
                  <Check className="w-5 h-5 text-blue-500" />
                )}
              </button>
              
              {isSelected && (
                <div className="ml-3">
                  <label className="block text-xs text-gray-600 mb-1">
                    Extra price (optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={extraPrice}
                      onChange={(e) => updateExtraPrice(facility.id, parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {selectedFacilities.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">{selectedFacilities.length}</span> {selectedFacilities.length === 1 ? 'facility' : 'facilities'} selected
          </p>
        </div>
      )}
    </div>
  );
}
