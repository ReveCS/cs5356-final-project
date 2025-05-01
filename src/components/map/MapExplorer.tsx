// c:\Users\InvisiHands\Cornell Tech\CS-5356\final-project\src\components\map\MapExplorer.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import SearchBar from './SearchBar';
import PlacesList from './PlacesList';
import PlaceCard from './PlaceCard'; // Keep for later use
import { supabase } from '@/lib/supabase'; // Ensure supabase client is correctly configured

// Interface for data from Supabase 'places' table
interface SupabasePlace {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  long: number; // Matches your table description
}

// Interface for the original hardcoded places (if you still want to show them as markers)
interface EntertainmentPlace {
  id: string;
  name: string;
  type: 'theater' | 'museum' | 'concert' | 'sports';
  location: {
    lat: number;
    lng: number; // Note: Google Maps uses 'lng'
  };
  description: string;
}

// --- Hardcoded Data (Optional: Keep if you want initial markers) ---
const entertainmentPlaces: EntertainmentPlace[] = [
  // ... (your existing place data)
  { id: '1', name: 'Madison Square Garden', type: 'sports', location: { lat: 40.7505, lng: -73.9934 }, description: 'World-famous arena hosting sports events and concerts' },
  { id: '2', name: 'Metropolitan Museum of Art', type: 'museum', location: { lat: 40.7794, lng: -73.9632 }, description: 'One of the world\'s largest and finest art museums' },
  { id: '3', name: 'Broadway Theater District', type: 'theater', location: { lat: 40.7580, lng: -73.9855 }, description: 'Home to world-renowned theatrical performances' },
  // ... etc
];

// --- Map Styles and Options ---
const mapContainerStyle = { width: '100%', height: '100vh' };
const center = { lat: 40.7128, lng: -73.9352 }; // Use lng for Google Maps center
const options = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [ { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] } ]
};

// Debounce hook (optional but recommended)
function useDebounce(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}


export default function MapExplorer() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  // --- State ---
  const [selectedMapMarker, setSelectedMapMarker] = useState<EntertainmentPlace | null>(null); // For hardcoded markers
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchBox, setSearchBox] = useState<google.maps.places.Autocomplete | null>(null); // Google Autocomplete instance

  // Search and Supabase List State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // Debounce Supabase calls
  const [supabasePlaces, setSupabasePlaces] = useState<SupabasePlace[]>([]);
  const [isPlacesListVisible, setIsPlacesListVisible] = useState<boolean>(false);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedSupabasePlace, setSelectedSupabasePlace] = useState<SupabasePlace | null>(null); // For PlaceCard later

  // Ref to track if input is focused (helps manage list visibility)
  const isInputFocused = useRef(false);

  // --- Callbacks & Effects ---
  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onSearchBoxLoad = useCallback((autocompleteInstance: google.maps.places.Autocomplete) => {
    setSearchBox(autocompleteInstance);
  }, []);

  // Google Places Autocomplete selection
  const onPlaceChanged = useCallback(() => {
    if (searchBox) {
      const place = searchBox.getPlace();
      console.log("Google Place selected:", place);
      if (place.geometry?.location && map) {
        map.panTo(place.geometry.location);
        map.setZoom(15);
        setSearchTerm(place.name || ''); // Update search term
        setIsPlacesListVisible(false); // Hide Supabase list
        setSelectedSupabasePlace(null); // Clear Supabase selection
        setSelectedMapMarker(null); // Clear map marker selection
      } else {
        console.log('Autocomplete place result missing geometry:', place);
      }
    }
  }, [searchBox, map]);

  // Fetch places from Supabase when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm.trim() === '') {
      setSupabasePlaces([]);
      setIsPlacesListVisible(false); // Hide list if search is empty
      setFetchError(null);
      return;
    }

    const fetchPlaces = async () => {
      setIsLoadingPlaces(true);
      setFetchError(null);
      setIsPlacesListVisible(true); // Show list container (will show loading state)
      setSupabasePlaces([]); // Clear previous results immediately

      try {
        // Use ilike for case-insensitive search on the 'name' column
        // Adjust column name ('name') if it's different in your table
        const { data, error } = await supabase
          .from('places') // Your table name
          .select('id, name, address, lat, long') // Select specific columns
          .ilike('name', `%${debouncedSearchTerm}%`) // Case-insensitive search
          .limit(10); // Limit results for performance

        if (error) {
          throw error;
        }

        // Ensure data conforms to SupabasePlace interface (basic check)
        if (data && Array.isArray(data)) {
             // Explicitly cast if confident, or add runtime validation
             const validatedData = data as SupabasePlace[];
             setSupabasePlaces(validatedData);
        } else {
            setSupabasePlaces([]); // Set empty if data is not as expected
        }

      } catch (error: any) {
        console.error("Error fetching Supabase places:", error);
        setFetchError(error.message || 'Failed to fetch places.');
        setSupabasePlaces([]); // Clear results on error
      } finally {
        setIsLoadingPlaces(false);
      }
    };

    fetchPlaces();
  }, [debouncedSearchTerm]); // Re-run effect when debounced term changes

  // Handle selecting a place from *our Supabase* list
  const handleSupabasePlaceSelect = useCallback((place: SupabasePlace) => {
    console.log("Supabase Place selected:", place);
    setSelectedSupabasePlace(place); // Set the selected place (for PlaceCard later)
    setSearchTerm(place.name); // Update search bar text
    setIsPlacesListVisible(false); // Hide the list
    setSelectedMapMarker(null); // Clear any map InfoWindow

    // Pan the map to the selected Supabase place
    if (map && place.lat && place.long) {
       map.panTo({ lat: place.lat, lng: place.long }); // Use lng for Google Maps
       map.setZoom(15);
    }
    // Trigger showing the PlaceCard for 'place' in the next step
  }, [map]);

  // Update search term state
  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);
     setSelectedSupabasePlace(null); // Clear Supabase selection when typing
     if (term.trim() === '') {
         setIsPlacesListVisible(false); // Hide immediately if cleared
     }
  };

  // Show list on focus if there's a search term
  const handleFocus = () => {
    isInputFocused.current = true;
    if (searchTerm.trim() !== '') {
       // Re-show list if there was a term and results/loading/error
       setIsPlacesListVisible(true);
    }
  };

  // Hide list on blur, using a delay to allow clicks on list items
  const handleBlur = () => {
     isInputFocused.current = false;
    // Delay hiding the list to allow click events on PlacesList to register
    setTimeout(() => {
        // Only hide if the input is *still* not focused (user didn't click back in)
        if (!isInputFocused.current) {
            setIsPlacesListVisible(false);
        }
    }, 150); // Adjust delay ms as needed
  };


  // --- Marker Icon Logic (For hardcoded places, if kept) ---
  const getMarkerIcon = (type: EntertainmentPlace['type']) => {
    const colors = { theater: 'red', museum: 'blue', concert: 'green', sports: 'orange' };
    const color = colors[type] || 'purple';
    return `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`;
  };

  // --- Render Logic ---
  if (loadError) return <div>Error loading maps: {loadError.message}</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div className="relative w-full h-screen">
      {/* Render SearchBar */}
      <SearchBar
        searchTerm={searchTerm}
        onLoad={onSearchBoxLoad}
        onPlaceChanged={onPlaceChanged}
        onSearchTermChange={handleSearchTermChange}
        onFocus={handleFocus}
        onBlur={handleBlur} // Pass the delayed blur handler
      />

      {/* Render PlacesList conditionally */}
      <PlacesList
        places={supabasePlaces}
        onPlaceSelect={handleSupabasePlaceSelect}
        isVisible={isPlacesListVisible}
        isLoading={isLoadingPlaces}
        error={fetchError}
      />

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={center}
        options={options}
        onLoad={onMapLoad}
      >
        {/* Render Markers for original hardcoded places (Optional) */}
        {entertainmentPlaces.map((place) => (
          <Marker
            key={`marker-${place.id}`} // Add prefix to avoid key conflicts if IDs overlap
            position={place.location}
            icon={{
              url: getMarkerIcon(place.type),
              scaledSize: new google.maps.Size(32, 32)
            }}
            onClick={() => {
                setSelectedMapMarker(place);
                setSelectedSupabasePlace(null); // Clear Supabase selection
                setIsPlacesListVisible(false); // Hide list on map click
            }}
            title={place.name}
          />
        ))}

        {/* InfoWindow for hardcoded places clicked on the map */}
        {selectedMapMarker && (
          <InfoWindow
            position={selectedMapMarker.location}
            onCloseClick={() => setSelectedMapMarker(null)}
            options={{ pixelOffset: new google.maps.Size(0, -35) }}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-bold text-md text-gray-800 mb-1">{selectedMapMarker.name}</h3>
              <p className="text-sm text-gray-600">{selectedMapMarker.description}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Placeholder for where PlaceCard will go, controlled by selectedSupabasePlace */}
      {selectedSupabasePlace && (
        <div className="absolute bottom-4 left-4 z-10 bg-white p-4 rounded-lg shadow-md">
           {/* Replace with actual PlaceCard component later */}
           <h3 className="font-bold">{selectedSupabasePlace.name}</h3>
           <p>{selectedSupabasePlace.address}</p>
           <p>Lat: {selectedSupabasePlace.lat}, Long: {selectedSupabasePlace.long}</p>
           <button onClick={() => setSelectedSupabasePlace(null)} className="text-sm text-blue-500 mt-2">Close</button>
        </div>
      )}
    </div>
  );
}
