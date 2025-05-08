'use client';

import { useState, useEffect, ElementType } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/lib/supabase';
import { Place } from '@/types/place';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { List, Star, Plus } from "lucide-react";

export default function MyLists() {
  const { user } = useAuth();
  const [wantToTryPlaces, setWantToTryPlaces] = useState<Place[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If there's no user, or no user ID, we can't fetch their lists.
    // Clear any existing data and set loading to false.
    if (!user || !user.id) {
      setWantToTryPlaces([]);
      setSavedPlaces([]);
      setIsLoading(false); // Important to set loading to false if we're not fetching
      setError(null);      // Clear any previous error
      return;
    }

    const fetchPlaces = async () => {
      setIsLoading(true);
      setError(null);

      let fetchedWantToTry: Place[] = [];
      let fetchedSavedPlaces: Place[] = [];
      let encounteredError: string | null = null;

      try {
        // Fetch Want to Try places
        const { data: wantToTryRows, error: wantError } = await supabase
          .from('want_to_try_places')
          .select('places')
          .eq('user_id', user.id)
          .limit(1);

        if (wantError) {
          console.error('Error fetching want_to_try_places:', wantError);
          encounteredError = 'Failed to load your Want to Try list.';
        } else if (wantToTryRows && wantToTryRows.length > 0 && wantToTryRows[0].places) {
          fetchedWantToTry = Array.isArray(wantToTryRows[0].places) ? wantToTryRows[0].places : [];
        } else {
          // No error, but no data or malformed data, so list is empty
          fetchedWantToTry = [];
        }

        // Only proceed if the first fetch didn't encounter an error
        if (!encounteredError) {
          // Fetch Saved places
          const { data: savedRows, error: savedError } = await supabase
            .from('saved_places')
            .select('places')
            .eq('user_id', user.id)
            .limit(1);

          if (savedError) {
            console.error('Error fetching saved_places:', savedError);
            encounteredError = 'Failed to load your Saved Places list.';
          } else if (savedRows && savedRows.length > 0 && savedRows[0].places) {
            fetchedSavedPlaces = Array.isArray(savedRows[0].places) ? savedRows[0].places : [];
          } else {
            // No error, but no data or malformed data, so list is empty
            fetchedSavedPlaces = [];
          }
        }
      } catch (err) {
        console.error('Unexpected error fetching places:', err);
        encounteredError = 'An unexpected error occurred while fetching your lists.';
      } finally {
        if (encounteredError) {
          setError(encounteredError);
        }
        setWantToTryPlaces(fetchedWantToTry);
        setSavedPlaces(fetchedSavedPlaces);
        setIsLoading(false);
      }
    };

    fetchPlaces();
  }, [user?.id]); // Changed dependency from [user] to [user?.id]

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-600 p-4 bg-red-50 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  const PlaceCard = ({ place }: { place: Place }) => (
    <Card className="hover:bg-gray-50 transition-colors min-w-[200px]">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <div className="bg-teal-100 p-1.5 rounded-md">
            <List className="h-4 w-4 text-teal-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-sm truncate">{place.name}</h3>
            <p className="text-xs text-gray-500 truncate">{place.address || 'No address available'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ListSection = ({ 
    title, 
    icon: Icon, 
    places, 
    emptyMessage 
  }: { 
    title: string; 
    icon: ElementType;
    places: Place[]; 
    emptyMessage: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-teal-600" />
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-4">
          {places.length === 0 ? (
            <div className="text-sm text-gray-500 italic">{emptyMessage}</div>
          ) : (
            places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );

  return (
    <ScrollArea className="h-full"> {/* Make the entire component scrollable */}
      <div className="space-y-6 p-1"> {/* Add some padding if needed */}
        <ListSection
          title="Want to Try"
          icon={List}
          places={wantToTryPlaces}
          emptyMessage="No places in your Want to Try list yet"
        />

        <ListSection
          title="Saved Places"
          icon={Star}
          places={savedPlaces}
          emptyMessage="No saved places yet"
        />

        <div className="pt-2">
          <Button variant="outline" className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Create New List
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
} 