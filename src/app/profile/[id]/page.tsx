'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/lib/supabase';
import { Place } from '@/types/place';
import ProfileHeader from '@/components/profile/ProfileHeader';
import PlaceList from '@/components/profile/PlaceList';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProfilePage({ params }: PageProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wantToTryPlaces, setWantToTryPlaces] = useState<Place[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unwrap params at the top level
  const resolvedParams = use(params);
  const profileId = resolvedParams.id;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || authLoading) return;

    // If not logged in, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchProfileData = async () => {
      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .eq('id', profileId)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          throw new Error(profileError.message);
        }

        if (!profileData) {
          throw new Error('Profile not found');
        }

        setProfile(profileData);

        // Fetch want to try places
        const { data: wantToTryData, error: wantToTryError } = await supabase
          .from('want_to_try_places')
          .select('places')
          .eq('user_id', profileId)
          .single();

        if (wantToTryError && wantToTryError.code !== 'PGRST116') {
          console.error('Want to try places fetch error:', wantToTryError);
          throw new Error(wantToTryError.message);
        }

        if (wantToTryData?.places) {
          setWantToTryPlaces(Array.isArray(wantToTryData.places) ? wantToTryData.places : []);
        }

        // Fetch saved places
        const { data: savedData, error: savedError } = await supabase
          .from('saved_places')
          .select('places')
          .eq('user_id', profileId)
          .single();

        if (savedError && savedError.code !== 'PGRST116') {
          console.error('Saved places fetch error:', savedError);
          throw new Error(savedError.message);
        }

        if (savedData?.places) {
          setSavedPlaces(Array.isArray(savedData.places) ? savedData.places : []);
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [mounted, authLoading, user, router, profileId]);

  const handlePlacesUpdate = async () => {
    if (!user) return;
    
    try {
      // Fetch want to try places
      const { data: wantToTryData, error: wantToTryError } = await supabase
        .from('want_to_try_places')
        .select('places')
        .eq('user_id', profileId)
        .single();

      if (wantToTryError && wantToTryError.code !== 'PGRST116') {
        throw wantToTryError;
      }

      if (wantToTryData?.places) {
        setWantToTryPlaces(Array.isArray(wantToTryData.places) ? wantToTryData.places : []);
      }

      // Fetch saved places
      const { data: savedData, error: savedError } = await supabase
        .from('saved_places')
        .select('places')
        .eq('user_id', profileId)
        .single();

      if (savedError && savedError.code !== 'PGRST116') {
        throw savedError;
      }

      if (savedData?.places) {
        setSavedPlaces(Array.isArray(savedData.places) ? savedData.places : []);
      }
    } catch (err) {
      console.error('Error updating places:', err);
      setError('Failed to update places');
    }
  };

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-900"></div>
          <p className="text-gray-600">Loading your experience...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-900"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  const isOwnProfile = user.id === profile.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <ProfileHeader profile={profile} />
        <PlaceList
          wantToTryPlaces={wantToTryPlaces}
          savedPlaces={savedPlaces}
          isLoading={isLoading}
          error={error}
          onPlacesUpdate={handlePlacesUpdate}
          isOwnProfile={isOwnProfile}
        />
      </div>
    </div>
  );
} 