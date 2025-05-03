// c:\Users\InvisiHands\Cornell Tech\CS-5356\final-project\src\components\map\MapExplorer.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { supabase } from '@/lib/supabase';
import debounce from 'lodash/debounce';
import PlaceCard from './PlaceCard';
import NavigationBar from './NavigationBar';

interface Place {
  id: string;
  name: string;
  address: string;
  lat: number;
  long: number;
  category: string;
  place_id: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '100vh'
};

const center = {
  lat: 40.7128,
  lng: -73.9352
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

export default function MapExplorer() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<Place | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const searchPlaces = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching places:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      searchPlaces(query);
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
    setSelectedMarker(place);
    if (map) {
      map.panTo({ lat: place.lat, lng: place.long });
      map.setZoom(15);
    }
    setSearchResults([]);
    setSearchQuery(place.name);
  };

  const getMarkerIcon = (category: string) => {
    const colors = {
      theater: 'red',
      museum: 'blue',
      concert: 'green',
      sports: 'orange'
    };
    return `http://maps.google.com/mapfiles/ms/icons/${colors[category as keyof typeof colors] || 'blue'}-dot.png`;
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="relative w-full h-screen">
      <NavigationBar /> 
      
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 w-[600px]">
        <div className="relative group">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl transform transition-all duration-300 group-hover:shadow-blue-500/20 group-hover:scale-[1.02]"></div>
          <div className="relative flex items-center px-4 py-2">
            <svg 
              className="w-6 h-6 text-gray-500 mr-3" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search for entertainment venues in NYC..."
              className="w-full bg-transparent border-none outline-none text-lg text-black placeholder-gray-400 py-3 focus:ring-0"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="absolute w-full mt-2 bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto">
              {searchResults.map((place) => (
                <button
                  key={place.id}
                  onClick={() => handlePlaceSelect(place)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-150"
                >
                  <div className="font-medium text-gray-900">{place.name}</div>
                  <div className="text-sm text-gray-500">{place.address}</div>
                </button>
              ))}
            </div>
          )}
          {isSearching && (
            <div className="absolute w-full mt-2 bg-white rounded-lg shadow-lg p-4 text-center text-gray-500">
              Searching...
            </div>
          )}
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={center}
        options={options}
        onLoad={onMapLoad}
      >
        {searchResults.map((place) => (
          <Marker
            key={place.id}
            position={{ lat: place.lat, lng: place.long }}
            icon={{
              url: getMarkerIcon(place.category),
              scaledSize: new google.maps.Size(32, 32)
            }}
            onClick={() => handlePlaceSelect(place)}
          />
        ))}

        {selectedMarker && (
          <Marker
            position={{ lat: selectedMarker.lat, lng: selectedMarker.long }}
            icon={{
              url: getMarkerIcon(selectedMarker.category),
              scaledSize: new google.maps.Size(40, 40)
            }}
            animation={google.maps.Animation.BOUNCE}
          />
        )}
      </GoogleMap>

      {selectedPlace && (
        <PlaceCard
          place={selectedPlace}
          onClose={() => {
            setSelectedPlace(null);
            setSelectedMarker(null);
          }}
        />
      )}
    </div>
  );
}
