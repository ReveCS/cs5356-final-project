'use client';

import { useCallback, useState } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';

// Define the type for our entertainment places
interface EntertainmentPlace {
  name: string;
  position: {
    lat: number;
    lng: number;
  };
  type: 'theater' | 'museum' | 'park' | 'restaurant' | 'bar';
  description: string;
}

// List of entertainment places in NYC
const entertainmentPlaces: EntertainmentPlace[] = [
  {
    name: "Broadway Theater",
    position: { lat: 40.7580, lng: -73.9855 },
    type: "theater",
    description: "Iconic Broadway theater district"
  },
  {
    name: "The Metropolitan Museum of Art",
    position: { lat: 40.7794, lng: -73.9632 },
    type: "museum",
    description: "World-famous art museum"
  },
  {
    name: "Central Park",
    position: { lat: 40.7829, lng: -73.9654 },
    type: "park",
    description: "Iconic urban park"
  },
  {
    name: "Times Square",
    position: { lat: 40.7580, lng: -73.9855 },
    type: "park",
    description: "Famous commercial intersection"
  },
  {
    name: "Empire State Building",
    position: { lat: 40.7484, lng: -73.9857 },
    type: "museum",
    description: "Iconic skyscraper and observation deck"
  },
  {
    name: "High Line",
    position: { lat: 40.7480, lng: -74.0048 },
    type: "park",
    description: "Elevated linear park"
  },
  {
    name: "Museum of Modern Art",
    position: { lat: 40.7614, lng: -73.9776 },
    type: "museum",
    description: "Modern art museum"
  },
  {
    name: "Madison Square Garden",
    position: { lat: 40.7505, lng: -73.9934 },
    type: "theater",
    description: "Famous sports and entertainment venue"
  },
  {
    name: "Brooklyn Bridge",
    position: { lat: 40.7061, lng: -73.9969 },
    type: "park",
    description: "Historic suspension bridge"
  },
  {
    name: "Statue of Liberty",
    position: { lat: 40.6892, lng: -74.0445 },
    type: "museum",
    description: "Iconic symbol of freedom"
  }
];

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 40.7128,
  lng: -74.0060
};

export default function Map() {
  const [selectedPlace, setSelectedPlace] = useState<EntertainmentPlace | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  const onMarkerClick = useCallback((place: EntertainmentPlace) => {
    setSelectedPlace(place);
  }, []);

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Map</h3>
          <p className="text-gray-600">Failed to load the map. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={12}
      center={center}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      }}
    >
      {entertainmentPlaces.map((place) => (
        <Marker
          key={place.name}
          position={place.position}
          title={place.name}
          icon={{
            url: `https://maps.google.com/mapfiles/ms/icons/${
              place.type === 'theater' ? 'red' :
              place.type === 'museum' ? 'blue' :
              place.type === 'park' ? 'green' :
              place.type === 'restaurant' ? 'yellow' : 'purple'
            }-dot.png`,
            scaledSize: new google.maps.Size(32, 32)
          }}
          onClick={() => onMarkerClick(place)}
        />
      ))}

      {selectedPlace && (
        <InfoWindow
          position={selectedPlace.position}
          onCloseClick={() => setSelectedPlace(null)}
        >
          <div className="p-2">
            <h3 className="font-bold text-lg">{selectedPlace.name}</h3>
            <p className="text-sm text-gray-600">{selectedPlace.description}</p>
            <p className="text-xs text-gray-500 mt-1">Type: {selectedPlace.type}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
} 