'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { Place } from '@/types/place'; // Assuming you have a Place type defined

interface ListComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceSelect: (place: Place) => void; // Function to handle when a place is clicked
}

type TabType = 'want-to-try' | 'saved';

export default function ListComponent({ isOpen, onClose, onPlaceSelect }: ListComponentProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('want-to-try');
  const [wantToTryPlaces, setWantToTryPlaces] = useState<Place[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placeToDelete, setPlaceToDelete] = useState<Place | null>(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      if (!user) {
        setWantToTryPlaces([]);
        setSavedPlaces([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      console.log('Fetching places for lists...');

      try {
        // Fetch Want to Try places
        const { data: wantData, error: wantError } = await supabase
          .from('want_to_try_places')
          .select('places')
          .eq('user_id', user.id)
          .single();

        if (wantError && wantError.code !== 'PGRST116') {
          console.error('Error fetching want_to_try_places:', wantError);
          setError('Failed to load your Want to Try list.');
        } else if (wantData?.places) {
          setWantToTryPlaces(Array.isArray(wantData.places) ? wantData.places : []);
        }

        // Fetch Saved places
        const { data: savedData, error: savedError } = await supabase
          .from('saved_places')
          .select('places')
          .eq('user_id', user.id)
          .single();

        if (savedError && savedError.code !== 'PGRST116') {
          console.error('Error fetching saved_places:', savedError);
          setError('Failed to load your Saved Places list.');
        } else if (savedData?.places) {
          setSavedPlaces(Array.isArray(savedData.places) ? savedData.places : []);
        }
      } catch (err) {
        console.error('Unexpected error fetching places:', err);
        setError('An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchPlaces();
    }
  }, [user, isOpen]);

  const handleDelete = async (place: Place) => {
    if (!user) return;

    try {
      const table = activeTab === 'want-to-try' ? 'want_to_try_places' : 'saved_places';
      const currentPlaces = activeTab === 'want-to-try' ? wantToTryPlaces : savedPlaces;
      const setCurrentPlaces = activeTab === 'want-to-try' ? setWantToTryPlaces : setSavedPlaces;

      // Remove the place from the current list
      const updatedPlaces = currentPlaces.filter(p => p.place_id !== place.place_id);

      // Update the database
      const { error } = await supabase
        .from(table)
        .update({ places: updatedPlaces })
        .eq('user_id', user.id);

      if (error) {
        console.error(`Error removing place from ${table}:`, error);
        setError(`Failed to remove place from ${activeTab === 'want-to-try' ? 'Want to Try' : 'Saved'} list.`);
        return;
      }

      // Update local state
      setCurrentPlaces(updatedPlaces);
      setPlaceToDelete(null); // Close the confirmation dialog
    } catch (err) {
      console.error('Error removing place:', err);
      setError('An unexpected error occurred while removing the place.');
    }
  };

  if (!isOpen) {
    return null;
  }

  const currentPlaces = activeTab === 'want-to-try' ? wantToTryPlaces : savedPlaces;
  const currentListName = activeTab === 'want-to-try' ? 'Want to Try' : 'Saved Places';

  return (
    <>
      <div className="absolute top-16 right-4 z-10 bg-white p-4 rounded-lg shadow-xl w-80 max-h-[calc(100vh-10rem)] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('want-to-try')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'want-to-try'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Want to Try
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'saved'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Saved
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close list"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto pr-1">
          {isLoading && <p className="text-gray-500 text-sm">Loading lists...</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {!isLoading && !error && (
            <>
              {currentPlaces.length === 0 ? (
                <p className="text-gray-500 text-sm">Your {currentListName} list is empty.</p>
              ) : (
                <ul className="space-y-2">
                  {currentPlaces.map((place) => (
                    <li
                      key={place.place_id || place.id}
                      className="group p-2 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div 
                          className="flex-grow cursor-pointer"
                          onClick={() => onPlaceSelect(place)}
                        >
                          <p className="font-medium text-gray-800 text-sm">{place.name}</p>
                          <p className="text-xs text-gray-500">{place.address}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPlaceToDelete(place);
                          }}
                          className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          aria-label="Delete place"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {placeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Remove Place</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove {placeToDelete.name} from your {currentListName} list?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setPlaceToDelete(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(placeToDelete)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Define a basic Place type if you don't have one (adjust as needed)
// You might want to move this to a central types file (e.g., src/types/place.ts)
// export interface Place {
//   id: string;
//   name: string;
//   address: string;
//   lat: number;
//   long: number;
//   category: string;
//   place_id: string;
// } 