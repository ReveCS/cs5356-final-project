"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from 'next/link';
import { useAuth } from "@/components/AuthContext"
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api"
import { List, ChevronRight } from "lucide-react" // Removed PlusCircle, MapPin, Star
import { supabase } from "@/lib/supabase" // Import supabase client
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar" // Removed AvatarImage
import dynamic from 'next/dynamic';

// Dynamically import MyLists with no SSR
const MyLists = dynamic(() => import('@/components/home/MyLists'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-900"></div>
    </div>
  )
});

// Define libraries outside component to prevent recreation
const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"];

interface RecommendedPlace {
  id: string
  name: string
  location: { lat: number; lng: number } // Keep lng here for GoogleMap compatibility
  description: string
}

interface ListItem {
  id: string
  title: string
  places: number
  author: string
}

// Interface matching the structure returned by our SQL function + description
interface DailyPlace {
  id: string;
  name: string;
  lat: number;
  long: number; // Matches Supabase table column
  description?: string; // Optional description
  place_id: string;
}

// Memoize recommended lists to prevent recreation
const RECOMMENDED_LISTS: ListItem[] = [
  {
    id: "list-1",
    title: "Best Coffee Shops",
    places: 8,
    author: "Emma",
  },
  {
    id: "list-2",
    title: "Hidden Gems in Brooklyn",
    places: 12,
    author: "Marcus",
  },
  {
    id: "list-3",
    title: "Rooftop Bars",
    places: 6,
    author: "Sophia",
  },
  {
    id: "list-4",
    title: "Art Galleries",
    places: 9,
    author: "Jackson",
  },
  {
    id: "list-5",
    title: "Historic Landmarks",
    places: 15,
    author: "Olivia",
  },
];

export default function HomePage() {
  const { user, loading, firstName, signOut } = useAuth()
  const router = useRouter()

  // Redirect unauthenticated users to /auth/signin
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/signin")
    }
  }, [loading, user, router])

  const { isLoaded: isMapLoaded, loadError: mapLoadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  })

  const [selectedMarker, setSelectedMarker] = useState<RecommendedPlace | null>(null)
  const [dailyRecommendationPlace, setDailyRecommendationPlace] = useState<DailyPlace | null>(null);

  // Memoize map options to prevent recreation
  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    zoomControl: true,
    scrollwheel: false,
    draggable: true,
    styles: [
      { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#e9e9e9" }] },
      { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ lightness: 100 }] },
      { featureType: "road", elementType: "labels", stylers: [{ visibility: "simplified" }] },
      { featureType: "transit", stylers: [{ visibility: "simplified" }] },
    ],
  }), []);

  const mapContainerStyle = useMemo(() => ({ 
    width: "100%", 
    height: "100%" 
  }), []);

  const mapCenter = useMemo(() => ({ 
    lat: 40.74, 
    lng: -73.98 
  }), []);

  // Fetch daily recommendation
  useEffect(() => {
    if (!user) return; // Don't fetch if no user yet

    const fetchRandomPlace = async () => {
      try {
        const { data, error } = await supabase.rpc('get_random_place');

        if (error) {
          console.error("Error fetching random place:", error);
          throw error;
        }

        if (data && data.length > 0) {
          setDailyRecommendationPlace({ ...data[0], description: "" });
        } else {
          setDailyRecommendationPlace(null);
        }
      } catch (error) {
        console.error("Error fetching random place:", error);
        setDailyRecommendationPlace(null);
      }
    };

    fetchRandomPlace();
  }, [user]); // Depend only on user object

  const onMapLoad = useCallback(() => {

  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/auth/signin");
  };

  if (loading) { // Rely solely on AuthContext loading state for initial load
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-900"></div>
          <p className="text-gray-600">Loading your experience...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null;
  }

  // Logged-in view:
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-teal-900">Gotham Guide</h1>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push(`/profile/${user.id}`)} 
              className="flex items-center gap-2 hover:bg-gray-100 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>{firstName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline">{firstName || user?.email || "User"}</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSignOut} 
              size="sm"
              className="hover:bg-gray-100 transition-colors"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-4 md:p-6 gap-6">
        {/* Left Column: Map with Today's Recommendation */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Today&apos;s Recommendation
            </h2>
          </div>

          <div className="relative flex-1 overflow-hidden">
            {/* Custom map shape with clip-path */}
            <div
              className="absolute inset-0 rounded-3xl overflow-hidden"
              style={{
                clipPath: "polygon(0% 0%, 100% 0%, 100% 90%, 90% 100%, 0% 100%)",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Map Rendering Logic */}
              {mapLoadError && (
                <div className="flex items-center justify-center h-full bg-gray-200 text-red-600">
                  Error loading map.
                </div>
              )}
              {!isMapLoaded && !mapLoadError && (
                <div className="flex items-center justify-center h-full bg-gray-200">Loading Map...</div>
              )}
              {isMapLoaded && !mapLoadError && (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  zoom={11}
                  center={mapCenter}
                  options={mapOptions}
                  onLoad={onMapLoad}
                >
                  {/* Render Marker for the fetched recommended place */}
                  {dailyRecommendationPlace && (
                    <Marker
                      key={`rec-marker-${dailyRecommendationPlace.id}`}
                      position={{ lat: dailyRecommendationPlace.lat, lng: dailyRecommendationPlace.long }} // Use lat/long from fetched data
                      onClick={() => {
                        // Adapt the selected marker state if needed, or create a compatible object
                        setSelectedMarker({
                          id: dailyRecommendationPlace.id,
                          name: dailyRecommendationPlace.name,
                          location: { lat: dailyRecommendationPlace.lat, lng: dailyRecommendationPlace.long },
                          description: dailyRecommendationPlace.description || ""
                        });
                      }}
                    />
                  )}

                  {/* InfoWindow for selected recommended place */}
                  {selectedMarker && (
                    <InfoWindow
                      position={selectedMarker.location}
                      onCloseClick={() => setSelectedMarker(null)}
                      options={{ pixelOffset: new google.maps.Size(0, -35) }}
                    >
                      <div className="p-2 max-w-xs">
                        <h3 className="font-bold text-md text-gray-800 mb-1">{selectedMarker.name}</h3>
                        <p className="text-sm text-gray-600">{selectedMarker.description}</p>
                        <Button size="sm" variant="outline" className="mt-2 w-full">
                          View Details
                        </Button>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              )}
            </div>
          </div>

          {/* Daily Recommendation */}
          <div className="absolute bottom-4 left-16 max-w-md z-10">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-[1.02]">
              <div className="p-4"> 
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Daily Recommendation</h3>
                </div>
                {dailyRecommendationPlace ? (
                  <div className="space-y-2.5">
                    <h4 className="text-base font-medium text-gray-900 truncate">{dailyRecommendationPlace.name}</h4> 
                    {dailyRecommendationPlace.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{dailyRecommendationPlace.description}</p>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <Link
                        href={`/map?place=${dailyRecommendationPlace.place_id}`}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5"
                      >
                        View on Map Explorer
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Loading recommendation...</p> 
                )}
              </div>
            </div>
          </div>
        </div>


        {/* Right Column: Lists */}
        <div className="w-full md:w-1/2 flex flex-col gap-6 overflow-hidden">
          {/* Recommended Lists Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Recommended Lists</h2>
              <Button variant="ghost" size="sm" className="text-sm flex items-center gap-1">
                View all <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="w-148 whitespace-nowrap rounded-md">
              <div className="flex w-max space-x-4 p-4">
                {RECOMMENDED_LISTS.map((list) => (
                  <Card key={list.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="bg-orange-100 p-2 rounded-md">
                        <List className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{list.title}</h3>
                        <p className="text-sm text-gray-500">{list.places} places</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{list.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-500">{list.author}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea >
          </div>

          {/* My Lists Section */}
          <div className="flex flex-col gap-4 flex-1 min-h-0">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">My Lists</h2>
            </div>

            <div className="flex-1 overflow-hidden">
              <MyLists />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 mt-auto">
            <Link href="/map" className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-teal-900 text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              Explore Full Map
            </Link>
            
          </div>
        </div>
      </main>
    </div>
  )
}
