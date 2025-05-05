'use client';

import { useState } from 'react';
import { Place } from '@/types/place';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [showCopied, setShowCopied] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const pathname = usePathname();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const currentPlaces = activeTab === 'want-to-try' ? wantToTryPlaces : savedPlaces;
  const currentListName = activeTab === 'want-to-try' ? 'Want to Try' : 'Saved Places';

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${pathname}`;
    try {
      await navigator.clipboard.writeText(url);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
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
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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

      {/* Tabs and Share Button */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-2">
          <nav className="flex flex-1">
            <button
              onClick={() => setActiveTab('want-to-try')}
              className={`flex-1 px-4 py-3 text-sm font-medium text-center ${
                activeTab === 'want-to-try'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Want to Try ({wantToTryPlaces.length})
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 px-4 py-3 text-sm font-medium text-center ${
                activeTab === 'saved'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Saved Places ({savedPlaces.length})
            </button>
          </nav>
          <button
            onClick={handleShare}
            className="ml-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {showCopied ? (
              <>
                <svg className="h-4 w-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </>
            )}
          </button>
        </div>
      </div>

      {/* List Content */}
      <div className="p-4">
        {isLoading ? (
          <p className="text-gray-500 text-center py-4">Loading your places...</p>
        ) : error ? (
          <p className="text-red-500 text-center py-4">{error}</p>
        ) : currentPlaces.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {currentPlaces.map((place) => (
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
                {place.category && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {place.category}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 