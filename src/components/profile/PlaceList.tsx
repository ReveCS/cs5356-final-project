'use client';

import { useState, useEffect } from 'react';
import { Place } from '@/types/place';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

type TabType = 'want-to-try' | 'saved';

interface PlaceListProps {
  wantToTryPlaces: Place[];
  savedPlaces: Place[];
  isLoading: boolean;
  error: string | null;
  onPlacesUpdate: () => void;
  isOwnProfile: boolean;
}

export default function PlaceList({ wantToTryPlaces, savedPlaces, isLoading, error, onPlacesUpdate, isOwnProfile }: PlaceListProps) {
  const [activeTab, setActiveTab] = useState<TabType>('want-to-try');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [placesWithDetails, setPlacesWithDetails] = useState<Place[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const currentPlaces = activeTab === 'want-to-try' ? wantToTryPlaces : savedPlaces;
  const currentListName = activeTab === 'want-to-try' ? 'Want to Try' : 'Saved Places';

  // Fetch place details from places table
  useEffect(() => {
    const fetchPlaceDetails = async () => {
      if (currentPlaces.length === 0) {
        setPlacesWithDetails([]);
        return;
      }

      setIsLoadingDetails(true);
      try {
        const placeIds = currentPlaces.map(place => place.place_id).filter(Boolean);
        
        const { data: placeDetails, error: detailsError } = await supabase
          .from('places')
          .select('*')
          .in('place_id', placeIds);

        if (detailsError) throw detailsError;

        // Merge the place details with the current places
        const mergedPlaces = currentPlaces.map(place => {
          const details = placeDetails?.find(d => d.place_id === place.place_id);
          return {
            ...place,
            description: details?.description || place.description
          };
        });

        setPlacesWithDetails(mergedPlaces);
      } catch (err) {
        console.error('Error fetching place details:', err);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchPlaceDetails();
  }, [currentPlaces]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDelete = async (placeId: string) => {
    if (!user) return;
    
    setIsDeleting(placeId);
    try {
      const updatedPlaces = currentPlaces.filter(place => place.place_id !== placeId);
      
      const { error } = await supabase
        .from(activeTab === 'want-to-try' ? 'want_to_try_places' : 'saved_places')
        .update({ places: updatedPlaces })
        .eq('user_id', user.id);

      if (error) throw error;
      
      showNotification('Place removed from your list', 'success');
      onPlacesUpdate();
    } catch (err) {
      console.error('Error deleting place:', err);
      showNotification('Failed to remove place from your list', 'error');
    } finally {
      setIsDeleting(null);
    }
  };

  const EmptyState = () => (
    <div className="text-center py-8">
      <p className="text-gray-500 mb-4">Your {currentListName} list is empty.</p>
      <Link 
        href="/map" 
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0D4E4A] hover:bg-[#0D4E4A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0D4E4A]"
      >
        Search for places to add
      </Link>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Notification */}
      {notification && (
        <div className={`p-4 text-sm font-medium ${
          notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-2">
          <nav className="flex flex-1">
            <button
              onClick={() => setActiveTab('want-to-try')}
              className={`flex-1 px-4 py-3 text-sm font-medium text-center ${
                activeTab === 'want-to-try'
                  ? 'border-b-2 border-[#0D4E4A] text-[#0D4E4A]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Want to Try ({wantToTryPlaces.length})
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 px-4 py-3 text-sm font-medium text-center ${
                activeTab === 'saved'
                  ? 'border-b-2 border-[#0D4E4A] text-[#0D4E4A]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Saved Places ({savedPlaces.length})
            </button>
          </nav>
        </div>
      </div>

      {/* List Content */}
      <div className="p-4">
        {isLoading || isLoadingDetails ? (
          <p className="text-gray-500 text-center py-4">Loading your places...</p>
        ) : error ? (
          <p className="text-red-500 text-center py-4">{error}</p>
        ) : currentPlaces.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {placesWithDetails.map((place) => (
              <div
                key={place.place_id}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors relative group"
              >
                {isOwnProfile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(place.place_id!)}
                    disabled={isDeleting === place.place_id}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
                <h3 className="font-medium text-gray-900 pr-8">{place.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{place.address}</p>
                {place.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{place.description}</p>
                )}
                {place.category && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-[#0D4E4A]/10 text-[#0D4E4A] rounded-full">
                    {place.category}
                  </span>
                )}
                <div className="mt-3">
                  <Link
                    href={`/map?place=${place.place_id}`}
                    className="inline-flex items-center text-[#0D4E4A] hover:text-[#0D4E4A]/80 transition-colors"
                  >
                    View Place
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 