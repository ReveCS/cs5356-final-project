// app/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';

interface RecommendedPlace {
  id: string; name: string; location: { lat: number; lng: number; }; description: string;
}

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users to /auth/signin
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/signin');
    }
  }, [loading, user, router]);

  const { isLoaded: isMapLoaded, loadError: mapLoadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  const [selectedMarker, setSelectedMarker] = useState<RecommendedPlace | null>(null);

  const mapContainerStyle = { width: '100%', height: '100%' };
  const mapCenter = { lat: 40.74, lng: -73.98 }; // Center of NYC
  const mapOptions = {
    disableDefaultUI: true, zoomControl: true, scrollwheel: false, draggable: false,
    styles: [ { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] } ]
  };

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    // Optional: mapInstance.setOptions({ maxZoom: 15 });
  }, []);

  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Loading…</p>
      </div>
    );
  }

  // --- Define Weekly Recommendations ---
  const weeklyRecommendations: RecommendedPlace[] = [
    { id: 'rec-1', name: 'Museum of Modern Art (MoMA)', location: { lat: 40.7614, lng: -73.9776 }, description: 'Iconic museum featuring modern and contemporary art.' },
    { id: 'rec-2', name: 'Brooklyn Bridge Park', location: { lat: 40.7020, lng: -73.9953 }, description: 'Waterfront park with stunning Manhattan skyline views.' },
    { id: 'rec-3', name: 'Comedy Cellar', location: { lat: 40.7302, lng: -74.0005 }, description: 'Legendary basement comedy club.' },
  ];

  // Logged-in view:
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">NYC Entertainment List Keeper</h1>
          <button
            onClick={() => router.replace('/auth/signin')}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden"> {/* Flex container for columns */}

        {/* Left Column: Map */}
        <div className="w-1/2 h-full border-r border-gray-200"> {/* Adjust width (e.g., w-1/2, w-2/3) */}
           {/* Map Rendering Logic */}
           {mapLoadError && <div className="flex items-center justify-center h-full bg-gray-200 text-red-600">Error loading map.</div>}
           {!isMapLoaded && !mapLoadError && <div className="flex items-center justify-center h-full bg-gray-200">Loading Map...</div>}
           {isMapLoaded && !mapLoadError && (
             <GoogleMap
               mapContainerStyle={mapContainerStyle}
               zoom={11} // Adjust zoom level for overview
               center={mapCenter}
               options={mapOptions}
               onLoad={onMapLoad}
             >
               {/* Render Markers for recommended places */}
               {weeklyRecommendations.map((place) => (
                 <Marker
                   key={`rec-marker-${place.id}`}
                   position={place.location}
                   onClick={() => {
                     setSelectedMarker(place);
                   }}
                   title={place.name}
                 />
               ))}

               {/* InfoWindow for selected recommended place */}
               {selectedMarker && (
                 <InfoWindow
                   position={selectedMarker.location}
                   onCloseClick={() => setSelectedMarker(null)}
                   options={{ pixelOffset: new google.maps.Size(0, -35) }} // Adjust offset if using custom icons
                 >
                   <div className="p-1 max-w-xs">
                     <h3 className="font-bold text-md text-gray-800 mb-1">{selectedMarker.name}</h3>
                     <p className="text-sm text-gray-600">{selectedMarker.description}</p>
                   </div>
                 </InfoWindow>
               )}
             </GoogleMap>
           )}
        </div>

        {/* Right Column: Content */}
        <div className="w-1/2 h-full flex flex-col items-center justify-center p-8 lg:p-12 overflow-y-auto"> {/* Adjust width, add padding and scrolling */}
          <div className="text-center max-w-md"> {/* Limit width of text content */}
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Weekly Recommendations
            </h2>
            <p className="mt-3 text-lg text-gray-600">
              Explore this week's curated spots on the map!
            </p>
            <p className="mt-6 text-lg text-gray-500">
               Ready to manage your own lists or explore more?
             </p>
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-center sm:space-x-4 space-y-3 sm:space-y-0">
              <Link
                href="/map"
                className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" // Primary action style
              >
                Explore Full Map
              </Link>
              <Link
                href="/lists"
                className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" // Secondary action style
              >
                My Lists
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

