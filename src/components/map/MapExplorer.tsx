'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow, Autocomplete } from '@react-google-maps/api';
import SearchBar from './SearchBar';
import PlacesList from './PlacesList';
import PlaceCard from './PlaceCard';
import { supabase } from '@/lib/supabase';

interface EntertainmentPlace {
  id: string;
  name: string;
  type: 'theater' | 'museum' | 'concert' | 'sports';
  location: {
    lat: number;
    lng: number;
  };
  description: string;
}

const entertainmentPlaces: EntertainmentPlace[] = [
  {
    id: '1',
    name: 'Madison Square Garden',
    type: 'sports',
    location: { lat: 40.7505, lng: -73.9934 },
    description: 'World-famous arena hosting sports events and concerts'
  },
  {
    id: '2',
    name: 'Metropolitan Museum of Art',
    type: 'museum',
    location: { lat: 40.7794, lng: -73.9632 },
    description: 'One of the world\'s largest and finest art museums'
  },
  {
    id: '3',
    name: 'Broadway Theater District',
    type: 'theater',
    location: { lat: 40.7580, lng: -73.9855 },
    description: 'Home to world-renowned theatrical performances'
  },
  {
    id: '4',
    name: 'American Museum of Natural History',
    type: 'museum',
    location: { lat: 40.7813, lng: -73.9739 },
    description: 'Famous natural history museum with dinosaur exhibits'
  },
  {
    id: '5',
    name: 'Radio City Music Hall',
    type: 'concert',
    location: { lat: 40.7597, lng: -73.9797 },
    description: 'Iconic entertainment venue and concert hall'
  },
  {
    id: '6',
    name: 'Yankee Stadium',
    type: 'sports',
    location: { lat: 40.8296, lng: -73.9262 },
    description: 'Home of the New York Yankees baseball team'
  },
  {
    id: '7',
    name: 'Museum of Modern Art (MoMA)',
    type: 'museum',
    location: { lat: 40.7614, lng: -73.9776 },
    description: 'World-renowned modern art museum'
  },
  {
    id: '8',
    name: 'Carnegie Hall',
    type: 'concert',
    location: { lat: 40.7650, lng: -73.9799 },
    description: 'Historic concert venue for classical and popular music'
  },
  {
    id: '9',
    name: 'New York City Ballet',
    type: 'theater',
    location: { lat: 40.7720, lng: -73.9832 },
    description: 'Premier ballet company performing at Lincoln Center'
  },
  {
    id: '10',
    name: 'Barclays Center',
    type: 'sports',
    location: { lat: 40.6826, lng: -73.9754 },
    description: 'Modern sports and entertainment arena in Brooklyn'
  }
];

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

  const [selectedPlace, setSelectedPlace] = useState<EntertainmentPlace | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchBox, setSearchBox] = useState<google.maps.places.Autocomplete | null>(null);
  const searchBoxRef = useRef<HTMLInputElement>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onSearchBoxLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    setSearchBox(autocomplete);
  }, []);

  const onPlaceChanged = useCallback(() => {
    if (searchBox) {
      const place = searchBox.getPlace();
      if (place.geometry && place.geometry.location) {
        map?.panTo(place.geometry.location);
        map?.setZoom(15);
      }
    }
  }, [searchBox, map]);

  const getMarkerIcon = (type: EntertainmentPlace['type']) => {
    const colors = {
      theater: 'red',
      museum: 'blue',
      concert: 'green',
      sports: 'orange'
    };
    return `http://maps.google.com/mapfiles/ms/icons/${colors[type]}-dot.png`;
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="relative w-full h-screen">
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 w-[600px]">
        <div className="relative group">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl transform transition-all duration-300 group-hover:shadow-blue-500/20 group-hover:scale-[1.02]"></div>
          <Autocomplete
            onLoad={onSearchBoxLoad}
            onPlaceChanged={onPlaceChanged}
            restrictions={{ country: 'us' }}
            types={['establishment']}
            fields={['geometry', 'name', 'formatted_address']}
          >
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
                ref={searchBoxRef}
                type="text"
                placeholder="Search for entertainment venues in NYC..."
                className="w-full bg-transparent border-none outline-none text-lg text-black placeholder-gray-400 py-3 focus:ring-0"
              />
            </div>
          </Autocomplete>
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={center}
        options={options}
        onLoad={onMapLoad}
      >
        {entertainmentPlaces.map((place) => (
          <Marker
            key={place.id}
            position={place.location}
            icon={{
              url: getMarkerIcon(place.type),
              scaledSize: new google.maps.Size(32, 32)
            }}
            onClick={() => setSelectedPlace(place)}
          />
        ))}

        {selectedPlace && (
          <InfoWindow
            position={selectedPlace.location}
            onCloseClick={() => setSelectedPlace(null)}
          >
            <div className="p-3">
              <h3 className="font-bold text-lg text-gray-800">{selectedPlace.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedPlace.description}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}