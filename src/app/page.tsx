"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from 'next/link';
import { useAuth } from "@/components/AuthContext"
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api"
import { PlusCircle, MapPin, List, Star, ChevronRight } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface RecommendedPlace {
  id: string
  name: string
  location: { lat: number; lng: number }
  description: string
}

interface ListItem {
  id: string
  title: string
  places: number
  author: string
}

export default function HomePage() {
  const { user, loading, firstName } = useAuth()
  const router = useRouter()

  // Redirect unauthenticated users to /auth/signin
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/signin")
    }
  }, [loading, user, router])

  const { isLoaded: isMapLoaded, loadError: mapLoadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  })

  const [selectedMarker, setSelectedMarker] = useState<RecommendedPlace | null>(null)
  const [myLists, setMyLists] = useState<ListItem[]>([])

  // Mock data - in a real app, this would come from your database
  const recommendedLists: ListItem[] = [
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
  ]

  // Simulating fetching user's lists - in a real app, fetch from your database
  useEffect(() => {
    // Mock API call - replace with actual data fetching
    const fetchMyLists = async () => {
      // Simulating empty lists for demonstration
      setMyLists([])

      // Uncomment to simulate having lists
      /*
      setMyLists([
        { id: 'my-list-1', title: 'My Favorite Restaurants', places: 5, author: 'You' },
        { id: 'my-list-2', title: 'Weekend Plans', places: 3, author: 'You' },
      ]);
      */
    }

    if (user) {
      fetchMyLists()
    }
  }, [user])

  const mapContainerStyle = { width: "100%", height: "100%" }
  const mapCenter = { lat: 40.74, lng: -73.98 } // Center of NYC
  const mapOptions = {
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
  }

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    // Optional: mapInstance.setOptions({ maxZoom: 15 });
  }, [])

  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Loading…</p>
      </div>
    )
  }

  // --- Define Weekly Recommendations ---
  const weeklyRecommendations: RecommendedPlace[] = [
    {
      id: "rec-1",
      name: "Museum of Modern Art (MoMA)",
      location: { lat: 40.7614, lng: -73.9776 },
      description: "Iconic museum featuring modern and contemporary art.",
    },
    {
      id: "rec-2",
      name: "Brooklyn Bridge Park",
      location: { lat: 40.702, lng: -73.9953 },
      description: "Waterfront park with stunning Manhattan skyline views.",
    },
    {
      id: "rec-3",
      name: "Comedy Cellar",
      location: { lat: 40.7302, lng: -74.0005 },
      description: "Legendary basement comedy club.",
    },
  ]

  // Logged-in view:
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Gotham Guide</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/profile")} className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
                {/* <AvatarImage src={user?.avatar_url || "/placeholder.svg?height=32&width=32"} alt={firstName || "User"} /> */}
                <AvatarFallback>{firstName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline">{firstName || user?.email || "User"}</span>
            </Button>
            <Button variant="outline" onClick={() => router.replace("/auth/signin")} size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-4 md:p-6 gap-6">
        {/* Left Column: Map with Today's Recommendation */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Today's Recommendation</h2>
          </div>

          <div className="relative flex-1 overflow-hidden">
            {/* Custom map shape with clip-path */}
            <div
              className="absolute inset-0 rounded-3xl overflow-hidden"
              style={{
                clipPath: "polygon(0% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%)",
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
                  {/* Render Markers for recommended places */}
                  {weeklyRecommendations.map((place) => (
                    <Marker
                      key={`rec-marker-${place.id}`}
                      position={place.location}
                      onClick={() => {
                        setSelectedMarker(place)
                      }}
                      title={place.name}
                    />
                  ))}

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

          {/* Featured place card that overlays the bottom of the map */}
          <Card className="bg-white shadow-lg -mt-16 ml-8 z-10 max-w-md">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Featured: {weeklyRecommendations[0].name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{weeklyRecommendations[0].description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
                {recommendedLists.map((list) => (
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
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">My Lists</h2>
              <Button variant="ghost" size="sm" className="text-sm flex items-center gap-1">
                View all <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-[160px] rounded-lg border bg-white p-4">
              {myLists.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {myLists.map((list) => (
                    <Card key={list.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Star className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{list.title}</h3>
                          <p className="text-sm text-gray-500">{list.places} places</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-3 p-6">
                  <div className="bg-gray-100 p-3 rounded-full">
                    <PlusCircle className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-gray-700">No lists yet</h3>
                  <p className="text-sm text-gray-500 text-center">
                    Create your first list to start organizing your favorite places
                  </p>
                  <Button className="mt-2">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create New List
                  </Button>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 mt-auto">
            <Link href="/map" className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              Explore Full Map
            </Link>
            
          </div>
        </div>
      </main>
    </div>
  )
}
