'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLoadScript } from '@react-google-maps/api';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { Place } from '@/types/place';

// Move libraries array outside component
const libraries: ('places')[] = ['places'];

interface PlaceCardProps {
  place: Place;
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
    isOpen?: () => boolean;
  };
  price_level?: number;
}

export default function PlaceCard({ place, onClose }: PlaceCardProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const { user } = useAuth();
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInWantToTry, setIsInWantToTry] = useState(false);
  const [isInSaved, setIsInSaved] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [availablePhotos, setAvailablePhotos] = useState<google.maps.places.PlacePhoto[]>([]);

  useEffect(() => {
    if (!isLoaded) return;

    // Create a map instance for the Places service
    const map = new google.maps.Map(document.createElement('div'), {
      center: { lat: place.lat, lng: place.long },
      zoom: 15,
    });

    const fetchPlaceDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('Fetching details for place ID:', place.place_id);
        const service = new google.maps.places.PlacesService(map);

        const request: google.maps.places.PlaceDetailsRequest = {
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
            'price_level',
          ],
        };

        console.log('Making Places API request with:', request);

        service.getDetails(request, (result, status) => {
          console.log('Places API response status:', status);
          console.log('Places API response:', result);

          if (status === google.maps.places.PlacesServiceStatus.OK && result) {
            setPlaceDetails(result as PlaceDetails);

            if (result.photos && result.photos.length > 0) {
              const photos = result.photos.slice(0, 5);
              setAvailablePhotos(photos);
              setCurrentPhotoIndex(0);

              try {
                const firstPhotoUrl = photos[0].getUrl({ maxWidth: 800, maxHeight: 600 });
                setPhotoUrl(firstPhotoUrl || null);
              } catch (err) {
                console.error('Error getting URL for first photo:', err);
                setPhotoUrl(null);
              }
            } else {
              setAvailablePhotos([]);
              setPhotoUrl(null);
            }
          } else {
            console.error('Failed to fetch place details. Status:', status);
            setError(`Failed to fetch place details: ${status}`);
          }
          setIsLoading(false);
        });
      } catch (err) {
        console.error('Error in fetchPlaceDetails:', err);
        setError('Error fetching place details');
        setIsLoading(false);
      }
    };

    fetchPlaceDetails();
  }, [isLoaded, place.place_id, place.lat, place.long]);

  useEffect(() => {
    const checkPlaceStatus = async () => {
      if (!user) {
        setIsInWantToTry(false);
        setIsInSaved(false);
        return;
      }

      try {
        // Check Want to Try list
        const { data: wantData } = await supabase
          .from('want_to_try_places')
          .select('places')
          .eq('user_id', user.id)
          .single();

        if (wantData?.places) {
          const wantToTryPlaces = Array.isArray(wantData.places) ? wantData.places : [];
          setIsInWantToTry(wantToTryPlaces.some(p => p.place_id === place.place_id));
        }

        // Check Saved Places list
        const { data: savedData } = await supabase
          .from('saved_places')
          .select('places')
          .eq('user_id', user.id)
          .single();

        if (savedData?.places) {
          const savedPlaces = Array.isArray(savedData.places) ? savedData.places : [];
          setIsInSaved(savedPlaces.some(p => p.place_id === place.place_id));
        }
      } catch (err) {
        console.error('Error checking place status:', err);
        setError('Failed to check place status.');
      }
    };

    checkPlaceStatus();
  }, [user, place.place_id]);

  // --- Photo Navigation ---
  const loadPhotoAtIndex = (index: number) => {
    if (index >= 0 && index < availablePhotos.length) {
      try {
        const url = availablePhotos[index].getUrl({ maxWidth: 800, maxHeight: 600 });
        setPhotoUrl(url || null);
        setCurrentPhotoIndex(index);
      } catch (err) {
        console.error(`Error getting URL for photo at index ${index}:`, err);
        setPhotoUrl(null);
      }
    }
  };

  const handleNextPhoto = () => loadPhotoAtIndex(currentPhotoIndex + 1);
  const handlePrevPhoto = () => loadPhotoAtIndex(currentPhotoIndex - 1);
  // ------------------------

  const handleWantToTry = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      const { data: existingData } = await supabase
        .from('want_to_try_places')
        .select('places')
        .eq('user_id', user.id)
        .single();

      const currentPlaces = existingData?.places || [];
      const isCurrentlyInList = currentPlaces.some(p => p.place_id === place.place_id);
      let updatedPlaces;

      if (isCurrentlyInList) {
        updatedPlaces = currentPlaces.filter(p => p.place_id !== place.place_id);
        setIsInWantToTry(false);
      } else {
        updatedPlaces = [...currentPlaces, place];
        setIsInWantToTry(true);
      }

      let updateError;
      if (!existingData) {
        const { error } = await supabase
          .from('want_to_try_places')
          .insert({ user_id: user.id, places: updatedPlaces });
        updateError = error;
      } else {
        const { error } = await supabase
          .from('want_to_try_places')
          .update({ places: updatedPlaces })
          .eq('user_id', user.id);
        updateError = error;
      }

      if (updateError) {
        console.error('Error updating want_to_try_places:', updateError);
        setError('Failed to update Want to Try list.');
        setIsInWantToTry(isCurrentlyInList);
      }
    } catch (err) {
      console.error('Error updating Want to Try list:', err);
      setError('An unexpected error occurred.');
      setIsInWantToTry(prev => !prev);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlace = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      const { data: existingData } = await supabase
        .from('saved_places')
        .select('places')
        .eq('user_id', user.id)
        .single();

      const currentPlaces = existingData?.places || [];
      const isCurrentlyInList = currentPlaces.some(p => p.place_id === place.place_id);
      let updatedPlaces;

      if (isCurrentlyInList) {
        updatedPlaces = currentPlaces.filter(p => p.place_id !== place.place_id);
        setIsInSaved(false);
      } else {
        updatedPlaces = [...currentPlaces, place];
        setIsInSaved(true);
      }

      let updateError;
      if (!existingData) {
        const { error } = await supabase
          .from('saved_places')
          .insert({ user_id: user.id, places: updatedPlaces });
        updateError = error;
      } else {
        const { error } = await supabase
          .from('saved_places')
          .update({ places: updatedPlaces })
          .eq('user_id', user.id);
        updateError = error;
      }

      if (updateError) {
        console.error('Error updating saved_places:', updateError);
        setError('Failed to update Saved Places list.');
        setIsInSaved(isCurrentlyInList);
      }
    } catch (err) {
      console.error('Error updating Saved Places list:', err);
      setError('An unexpected error occurred.');
      setIsInSaved(prev => !prev);
    } finally {
      setIsLoading(false);
    }
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
    <div className="absolute bottom-4 left-4 z-10 bg-white p-6 rounded-xl shadow-xl w-[450px] max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{place.name}</h2>
          {placeDetails?.rating && (
            <div className="flex items-center">
              <span className="text-yellow-400 text-lg">★</span>
              <span className="ml-1 text-gray-600 text-sm">
                {placeDetails.rating} ({placeDetails.user_ratings_total} reviews)
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
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

      {/* Category Placeholder Image */}
      <div className="mb-6 relative rounded-xl overflow-hidden shadow-md">
        <div className="relative w-full h-64">
          {photoUrl ? (
            <div className="relative w-full h-full group">
              <Image
                src={photoUrl}
                alt={`${place.name}`}
                fill // Use fill to cover the parent div
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Adjust sizes as needed
                style={{ objectFit: 'cover' }} // Equivalent to object-cover class
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  console.error('Error loading image:', e);
                  console.log('Failed image URL:', photoUrl);
                  // Optionally set to null to show placeholder on error
                  // setPhotoUrl(null);
                }}
              />
              {/* Photo Counter */}
              {availablePhotos.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                  {currentPhotoIndex + 1} / {availablePhotos.length}
                </div>
              )}

              {/* Navigation Buttons - Visible on hover */} 
              {availablePhotos.length > 1 && (
                <>
                  {/* Previous Button */}
                  <button
                    onClick={handlePrevPhoto}
                    disabled={currentPhotoIndex === 0}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white p-2 rounded-full hover:bg-opacity-60 focus:outline-none transition-opacity opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={handleNextPhoto}
                    disabled={currentPhotoIndex === availablePhotos.length - 1}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white p-2 rounded-full hover:bg-opacity-60 focus:outline-none transition-opacity opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                {place.category && (
                  <>
                    {place.category === 'restaurant' && (
                      <svg className="w-16 h-16 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                      </svg>
                    )}
                    {place.category === 'bar' && (
                      <svg className="w-16 h-16 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                      </svg>
                    )}
                    {place.category !== 'restaurant' && place.category !== 'bar' && (
                      <svg className="w-16 h-16 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    )}
                    <p className="text-gray-500 text-sm">
                      {typeof place.category === 'string' ? place.category.charAt(0).toUpperCase() + place.category.slice(1) : 'Unknown'}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={handleWantToTry}
          disabled={isLoading}
          className={`flex-1 py-2.5 px-4 rounded-lg text-base font-medium transition-colors ${
            isInWantToTry
              ? 'bg-green-500 text-white'
              : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
        >
          {isLoading ? 'Updating...' : isInWantToTry ? '✓ Added' : 'Want to Try'}
        </button>
        <button
          onClick={handleSavePlace}
          disabled={isLoading}
          className={`flex-1 py-2.5 px-4 rounded-lg text-base font-medium transition-colors ${
            isInSaved
              ? 'bg-green-500 text-white'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isLoading ? 'Updating...' : isInSaved ? '✓ Saved' : 'Save Place'}
        </button>
      </div>

      {/* Details Section */}
      <div className="space-y-4">
        {/* Address */}
        <div className="flex items-start space-x-3">
          <div className="text-gray-400 mt-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Address</h3>
            <p className="text-gray-600 text-sm">{placeDetails?.formatted_address || place.address}</p>
          </div>
        </div>

        {/* Hours */}
        {placeDetails?.opening_hours && (
          <div className="flex items-start space-x-3">
            <div className="text-gray-400 mt-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Hours</h3>
              <p className="text-gray-600 text-sm">
                {placeDetails.opening_hours.isOpen?.() ? (
                  <span className="text-green-600">Open now</span>
                ) : (
                  <span className="text-red-600">Closed</span>
                )}
              </p>
              {placeDetails.opening_hours.weekday_text && (
                <div className="mt-1">
                  {placeDetails.opening_hours.weekday_text.map((day, index) => (
                    <p key={index} className="text-sm text-gray-600">
                      {day}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Website */}
        {placeDetails?.website && (
          <div className="flex items-start space-x-3">
            <div className="text-gray-400 mt-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Website</h3>
              <a
                href={placeDetails.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-sm"
              >
                Visit website
              </a>
            </div>
          </div>
        )}

        {/* Phone */}
        {placeDetails?.formatted_phone_number && (
          <div className="flex items-start space-x-3">
            <div className="text-gray-400 mt-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Phone</h3>
              <a
                href={`tel:${placeDetails.formatted_phone_number}`}
                className="text-blue-500 hover:underline text-sm"
              >
                {placeDetails.formatted_phone_number}
              </a>
            </div>
          </div>
        )}

        {/* Reviews */}
        {placeDetails?.reviews && placeDetails.reviews.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium text-gray-700 mb-3">Recent Reviews</h3>
            <div className="space-y-4">
              {placeDetails.reviews.slice(0, 3).map((review, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-400 text-lg">★</span>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {review.author_name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}