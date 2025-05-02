'use client';

import { useState, useEffect } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';

interface PlaceCardProps {
  place: {
    id: string;
    name: string;
    address: string;
    lat: number;
    long: number;
    category: string;
    place_id: string;
  };
  onClose: () => void;
}

interface PlaceDetails {
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  photos?: google.maps.places.PlacePhoto[];
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }>;
  website?: string;
  formatted_phone_number?: string;
  opening_hours?: {
    weekday_text?: string[];
    open_now?: boolean;
  };
  price_level?: number;
}

export default function PlaceCard({ place, onClose }: PlaceCardProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  const { user } = useAuth();
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isWantToTry, setIsWantToTry] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    if (!isLoaded) return;

    const fetchPlaceDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const service = new google.maps.places.PlacesService(
          document.createElement('div')
        );

        const request = {
          placeId: place.place_id,
          fields: [
            'name',
            'formatted_address',
            'rating',
            'user_ratings_total',
            'photos',
            'reviews',
            'website',
            'formatted_phone_number',
            'opening_hours',
            'price_level'
          ]
        };

        service.getDetails(request, (result, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && result) {
            setPlaceDetails(result as PlaceDetails);
            
            // Fetch all photo URLs if photos are available
            if (result.photos && result.photos.length > 0) {
              const urls = result.photos.map(photo => 
                photo.getUrl({
                  maxWidth: 400,
                  maxHeight: 300
                })
              );
              setPhotoUrls(urls);
            }
          } else {
            setError('Failed to fetch place details');
          }
          setIsLoading(false);
        });
      } catch (err) {
        setError('Error fetching place details');
        setIsLoading(false);
      }
    };

    fetchPlaceDetails();
  }, [place.place_id, isLoaded]);

  const handleSavePlace = async () => {
    console.log('Current user:', user);

    if (!user) {
      setError('Please sign in to save places');
      return;
    }

    try {
      const placeData = {
        id: place.id,
        name: place.name,
        address: place.address,
        lat: place.lat,
        long: place.long,
        category: place.category,
        place_id: place.place_id
      };

      console.log('Saving place data:', placeData);
      console.log('User ID:', user.id);

      // First check if the place is already saved
      const { data: currentData, error: fetchError } = await supabase
        .from('saved_places')
        .select('places')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching current places:', fetchError);
        setError('Failed to fetch current saved places');
        return;
      }

      // Check if place is already saved
      const currentPlaces = currentData?.places || [];
      const placeExists = currentPlaces.some(
        (p: any) => p.place_id === place.place_id
      );

      if (placeExists) {
        setError('This place is already in your saved places');
        setIsSaved(true);
        return;
      }

      const { error } = await supabase.rpc('add_place_to_saved_places', {
        user_id_input: user.id,
        new_place: placeData
      });

      if (error) {
        console.error('Supabase error:', error);
        setError(`Failed to save place: ${error.message}`);
        return;
      }
      setIsSaved(true);
      setError(null);
    } catch (err) {
      console.error('Error saving place:', err);
      setError('Failed to save place. Please try again.');
    }
  };

  const handleWantToTry = async () => {
    try {
      const { error } = await supabase
        .from('want_to_try')
        .insert([
          {
            place_id: place.place_id,
            name: place.name,
            address: place.address,
            lat: place.lat,
            long: place.long,
            category: place.category
          }
        ]);

      if (error) throw error;
      setIsWantToTry(true);
    } catch (err) {
      console.error('Error adding to want to try:', err);
    }
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photoUrls.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photoUrls.length) % photoUrls.length);
  };

  if (isLoading) {
    return (
      <div className="absolute bottom-4 left-4 z-10 bg-white p-4 rounded-lg shadow-lg w-96">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute bottom-4 left-4 z-10 bg-white p-4 rounded-lg shadow-lg w-96">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="absolute bottom-4 left-4 z-10 bg-white p-6 rounded-lg shadow-lg w-[450px] max-h-[85vh] overflow-y-auto">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{place.name}</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Debug info - remove in production */}
      <div className="mb-4 p-3 bg-grey-100 rounded text-sm">
        <p>Auth Status: {user ? 'Signed In' : 'Not Signed In'}</p>
        {user && <p>User ID: {user.id}</p>}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {photoUrls.length > 0 && (
        <div className="mb-6 relative">
          <img
            src={photoUrls[currentPhotoIndex]}
            alt={`${place.name} - Photo ${currentPhotoIndex + 1}`}
            className="w-full h-56 object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          {photoUrls.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
                {currentPhotoIndex + 1} / {photoUrls.length}
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleSavePlace}
          disabled={isSaved}
          className={`flex-1 py-3 px-4 rounded-lg text-lg ${
            isSaved
              ? 'bg-green-500 text-white'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isSaved ? 'Saved' : 'Save Place'}
        </button>
        <button
          onClick={handleWantToTry}
          disabled={isWantToTry}
          className={`flex-1 py-3 px-4 rounded-lg text-lg ${
            isWantToTry
              ? 'bg-green-500 text-white'
              : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
        >
          {isWantToTry ? 'Added to List' : 'Want to Try'}
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <h3 className="font-semibold text-lg text-gray-700">Address</h3>
          <p className="text-gray-600 text-base">{placeDetails?.formatted_address || place.address}</p>
        </div>

        {placeDetails?.rating && (
          <div>
            <h3 className="font-semibold text-lg text-gray-700">Rating</h3>
            <div className="flex items-center">
              <span className="text-yellow-400 text-xl">★</span>
              <span className="ml-1 text-gray-600 text-base">
                {placeDetails.rating} ({placeDetails.user_ratings_total} reviews)
              </span>
            </div>
          </div>
        )}

        {placeDetails?.opening_hours && (
          <div>
            <h3 className="font-semibold text-lg text-gray-700">Hours</h3>
            <p className="text-gray-600 text-base">
              {placeDetails.opening_hours.open_now ? 'Open now' : 'Closed'}
            </p>
            {placeDetails.opening_hours.weekday_text && (
              <div className="mt-2">
                {placeDetails.opening_hours.weekday_text.map((day, index) => (
                  <p key={index} className="text-base text-gray-600">
                    {day}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {placeDetails?.website && (
          <div>
            <h3 className="font-semibold text-lg text-gray-700">Website</h3>
            <a
              href={placeDetails.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline text-base"
            >
              Visit website
            </a>
          </div>
        )}

        {placeDetails?.formatted_phone_number && (
          <div>
            <h3 className="font-semibold text-lg text-gray-700">Phone</h3>
            <a
              href={`tel:${placeDetails.formatted_phone_number}`}
              className="text-blue-500 hover:underline text-base"
            >
              {placeDetails.formatted_phone_number}
            </a>
          </div>
        )}

        {placeDetails?.reviews && placeDetails.reviews.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg text-gray-700">Recent Reviews</h3>
            <div className="space-y-3">
              {placeDetails.reviews.slice(0, 3).map((review, index) => (
                <div key={index} className="border-t pt-3">
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-400 text-xl">★</span>
                    <span className="ml-1 text-base text-gray-600">
                      {review.author_name}
                    </span>
                  </div>
                  <p className="text-base text-gray-600">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}