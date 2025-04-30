import { X, Phone, Globe, Star, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

interface PlaceDetails {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  photos?: string[];
  types?: string[];
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
}

interface PlaceCardProps {
  place: PlaceDetails;
  onClose: () => void;
}

export default function PlaceCard({ place, onClose }: PlaceCardProps) {
  // Convert rating to star display
  const renderRating = (rating?: number) => {
    if (!rating) return null;
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={`${
              i < fullStars
                ? 'text-yellow-500 fill-yellow-500'
                : i === fullStars && hasHalfStar
                ? 'text-yellow-500 fill-yellow-500 half-star'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <div className="relative">
        {/* Placeholder image or first photo */}
        <div className="h-40 bg-gray-200 flex items-center justify-center">
          {place.photos && place.photos.length > 0 ? (
            <img
              src={place.photos[0]}
              alt={place.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <MapPin size={32} className="text-gray-400" />
              <span className="text-sm text-gray-500 mt-2">No image available</span>
            </div>
          )}
        </div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
        >
          <X size={18} className="text-gray-700" />
        </button>
      </div>

      {/* Place details */}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900">{place.name}</h2>
        
        {/* Type tags */}
        {place.types && place.types.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {place.types.slice(0, 3).map((type, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
              >
                {type.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
        
        {/* Rating */}
        {place.rating && (
          <div className="mt-2">
            {renderRating(place.rating)}
          </div>
        )}
        
        {/* Address */}
        <div className="mt-3 flex items-start">
          <MapPin size={16} className="flex-shrink-0 mr-1.5 text-gray-500 mt-0.5" />
          <p className="text-sm text-gray-600">{place.address}</p>
        </div>
        
        {/* Phone */}
        {place.phone && (
          <div className="mt-2 flex items-center">
            <Phone size={16} className="flex-shrink-0 mr-1.5 text-gray-500" />
            <a href={`tel:${place.phone}`} className="text-sm text-primary-600 hover:underline">
              {place.phone}
            </a>
          </div>
        )}
        
        {/* Website */}
        {place.website && (
          <div className="mt-2 flex items-center">
            <Globe size={16} className="flex-shrink-0 mr-1.5 text-gray-500" />
            <a 
              href={place.website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-primary-600 hover:underline truncate max-w-[220px]"
            >
              {new URL(place.website).hostname}
            </a>
          </div>
        )}

        {/* Opening hours */}
        {place.opening_hours?.open_now !== undefined && (
          <div className="mt-2 flex items-center">
            <Clock size={16} className="flex-shrink-0 mr-1.5 text-gray-500" />
            <span className={`text-sm ${place.opening_hours.open_now ? 'text-green-600' : 'text-red-600'}`}>
              {place.opening_hours.open_now ? 'Open now' : 'Closed'}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
        <Link 
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${place.name} ${place.address}`
          )}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-primary-700 hover:text-primary-800 font-medium"
        >
          View on Google Maps
        </Link>
        
        <Link 
          href={`/lists/add?placeId=${place.id}`}
          className="text-sm text-primary-700 hover:text-primary-800 font-medium"
        >
          Save to List
        </Link>
      </div>
    </div>
  );
}