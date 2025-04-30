import { MapPin } from 'lucide-react';

interface Place {
  id: string;
  name: string;
  address: string;
  types?: string[];
}

interface PlacesListProps {
  places: Place[];
  onSelectPlace: (place: Place) => void;
}

export default function PlacesList({ places, onSelectPlace }: PlacesListProps) {
  // Function to format place types for better display
  const formatPlaceType = (types: string[] | undefined) => {
    if (!types || types.length === 0) return '';
    
    // Replace underscores with spaces and capitalize first letter
    const formattedType = types[0].replace(/_/g, ' ');
    return formattedType.charAt(0).toUpperCase() + formattedType.slice(1);
  };

  return (
    <div className="mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
      {places.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No results found</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {places.map((place) => (
            <li 
              key={place.id}
              className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onSelectPlace(place)}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <MapPin size={18} className="text-primary-600" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                    {place.name}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {place.address}
                  </p>
                  {place.types && place.types.length > 0 && (
                    <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {formatPlaceType(place.types)}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}