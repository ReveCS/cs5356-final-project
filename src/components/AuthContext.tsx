// components/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  firstName: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: AuthError | null;
    data: Session | null;
  }>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<{
    error: AuthError | null;
    data: Session | null;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('AuthProvider rendering/re-rendering');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    console.log('AuthProvider: useEffect mounting. Initial loading state:', loading);

    // Get initial session
    const initializeAuth = async () => {
      console.log('AuthProvider: initializeAuth started.');
      try {
        console.log('AuthProvider: Calling supabase.auth.getSession()...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('AuthProvider: supabase.auth.getSession() returned.', { sessionDetails: session, errorDetails: sessionError });
        
        if (sessionError) {
          console.error('AuthProvider: Error from getSession():', sessionError);
        } 

        if (!mounted) {
          console.log('AuthProvider: initializeAuth - component unmounted during getSession, returning.');
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        console.log('AuthProvider: initializeAuth - user set to:', session?.user ?? null);

        if (session?.user) {
          console.log('AuthProvider: initializeAuth - user found, fetching profile for', session.user.id);
          await fetchProfile(session.user.id);
          console.log('AuthProvider: initializeAuth - profile fetched.');
        } else{
          console.log('AuthProvider: initializeAuth - no user session found.');
        }
      } catch (error) {
        console.error('AuthProvider: Error in initializeAuth catch block:', error);
      } finally {
        if (mounted) {
          console.log('AuthProvider: initializeAuth - setting loading to false.');
          setLoading(false);
        } else {
          console.log('AuthProvider: initializeAuth - component unmounted, not setting loading state.');
        }
      }
    };

    initializeAuth();
    console.log('AuthProvider: Setting up onAuthStateChange listener.');

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      console.log('AuthProvider: onAuthStateChange - user set to:', session?.user ?? null);
      if (session?.user) {
        console.log('AuthProvider: onAuthStateChange - user found, fetching profile for', session.user.id);
        await fetchProfile(session.user.id);
        console.log('AuthProvider: onAuthStateChange - profile fetched.');
      } else {
        console.log('AuthProvider: onAuthStateChange - no user session, setting firstName to null.');
        setFirstName(null);
      }
      console.log('AuthProvider: onAuthStateChange - setting loading to false.');
      setLoading(false);
    });

    return () => {
      mounted = false;
      console.log('AuthProvider: useEffect cleanup. Unsubscribing from onAuthStateChange.');
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    console.log(`AuthProvider: fetchProfile started for userId: ${userId}`);
    try {
      console.log(`AuthProvider: fetchProfile - Calling Supabase to get profile for ${userId}`);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', userId)
        .single();
      console.log(`AuthProvider: fetchProfile - Supabase call returned for ${userId}`, { profileData, profileError });

      if (profileError) {
        console.error(`AuthProvider: fetchProfile - Error fetching profile for ${userId}:`, profileError);
        setFirstName(null);
      } else if (profileData) {
        console.log(`AuthProvider: fetchProfile - Profile data found for ${userId}, setting firstName:`, profileData.first_name);
        setFirstName(profileData.first_name);
      } else {
        console.log(`AuthProvider: fetchProfile - No profile data found for ${userId}, setting firstName to null.`);
        setFirstName(null);
      }
    } catch (err) {
      console.error(`AuthProvider: fetchProfile - Caught an error for ${userId}:`, err);
      setFirstName(null);
    } finally {
      console.log(`AuthProvider: fetchProfile finished for userId: ${userId}`);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data: data.session, error };
    } catch (err) {
      console.error('Error in signIn:', err);
      return { data: null, error: err as AuthError };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { data: null, error };
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            role: 'user',
            first_name: firstName,
            last_name: lastName,
            avatar_url: null,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      return { data: data.session, error: null };
    } catch (err) {
      console.error('Error in signUp:', err);
      return { data: null, error: err as AuthError };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setFirstName(null);
    } catch (err) {
      console.error('Error in signOut:', err);
      throw err;
    }
  };

  const value = {
    user,
    session,
    loading,
    firstName,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}