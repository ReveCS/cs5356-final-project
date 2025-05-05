import React from 'react';

// Import or define the SupabasePlace interface here as well
interface SupabasePlace {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  long: number;
}

interface PlacesListProps {
  places: SupabasePlace[];
  onPlaceSelect: (place: SupabasePlace) => void;
  isVisible: boolean;
  isLoading: boolean;
  error: string | null;
}

export default function PlacesList({
  places,
  onPlaceSelect,
  isVisible,
  isLoading,
  error
}: PlacesListProps) {
  if (!isVisible) {
    return null; 
  }

  return (
    <div className="absolute top-[calc(3rem+1.5rem)] left-1/2 transform -translate-x-1/2 z-10 w-[600px] mt-1">
      <div className="bg-white rounded-xl shadow-lg max-h-60 overflow-y-auto border border-gray-200">
        {isLoading && <div className="p-4 text-gray-500">Loading...</div>}
        {error && <div className="p-4 text-red-600">Error: {error}</div>}
        {!isLoading && !error && places.length === 0 && (
          <div className="p-4 text-gray-500">No matching places found.</div>
        )}
        {!isLoading && !error && places.length > 0 && (
          <ul>
            {places.map((place) => (
              <li key={place.id}>
                <button
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out text-gray-700"
                  onMouseDown={() => onPlaceSelect(place)}
                >
                  <div className="font-medium">{place.name!}</div>
                  {place.address && (
                    <div className="text-sm text-gray-500">{place.address}</div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}