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
    if (!user) return;

    const fetchPlaces = async () => {
      setIsLoading(true);
      setError(null);
      
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
        console.error('Error fetching places:', err);
        setError('An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaces();
  }, [user]);

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