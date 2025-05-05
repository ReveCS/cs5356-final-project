import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/lib/supabase';
import { Place } from '@/types/place';

interface Profile {
  first_name: string;
  last_name: string;
}

export function useProfileData(profileId?: string) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wantToTryPlaces, setWantToTryPlaces] = useState<Place[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no profileId is provided and no user is logged in, return
    if (!profileId && !user) return;

    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const targetId = profileId || user?.id;
        console.log('Fetching profile for user:', targetId);
        
        // Fetch user profile - using 'id' for profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', targetId)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', {
            error: profileError,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint
          });
          setError('Failed to load profile.');
        } else {
          console.log('Profile data received:', profileData);
          setProfile(profileData);
        }

        // Fetch Want to Try places - using 'user_id' for want_to_try_places table
        console.log('Fetching want to try places for user:', targetId);
        const { data: wantData, error: wantError } = await supabase
          .from('want_to_try_places')
          .select('places')
          .eq('user_id', targetId)
          .single();

        if (wantError) {
          console.error('Error fetching want_to_try_places:', {
            error: wantError,
            message: wantError.message,
            details: wantError.details,
            hint: wantError.hint,
            code: wantError.code
          });
          if (wantError.code !== 'PGRST116') {
            setError('Failed to load Want to Try list.');
          }
        } else {
          console.log('Want to try places data received:', wantData);
          if (wantData?.places) {
            const places = Array.isArray(wantData.places) ? wantData.places : [];
            console.log('Processed want to try places:', places);
            setWantToTryPlaces(places);
          }
        }

        // Fetch Saved places - using 'user_id' for saved_places table
        console.log('Fetching saved places for user:', targetId);
        const { data: savedData, error: savedError } = await supabase
          .from('saved_places')
          .select('places')
          .eq('user_id', targetId)
          .single();

        if (savedError) {
          console.error('Error fetching saved_places:', {
            error: savedError,
            message: savedError.message,
            details: savedError.details,
            hint: savedError.hint,
            code: savedError.code
          });
          if (savedError.code !== 'PGRST116') {
            setError('Failed to load Saved Places list.');
          }
        } else {
          console.log('Saved places data received:', savedData);
          if (savedData?.places) {
            const places = Array.isArray(savedData.places) ? savedData.places : [];
            console.log('Processed saved places:', places);
            setSavedPlaces(places);
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, profileId]);

  return {
    profile,
    wantToTryPlaces,
    savedPlaces,
    isLoading,
    error,
  };
} 