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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1) On mount, fetch existing session
    let isMounted = true;

    const fetchSessionAndProfile = async () => {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();

      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
          setLoading(false);
        } else {
          setFirstName(null); 
          setLoading(false);
        }
      }
    };

    fetchSessionAndProfile();

    // 2) Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
          setLoading(false);
        } else {
          setFirstName(null);
          setLoading(false);
        }
      }
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data: data.session, error };
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string, 
    lastName: string  
  ) => {
    // 1️⃣ Create the auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    // 2️⃣ If signup succeeded and we got a user back, seed the profiles table
    if (!error && data.user) {
      const userId = data.user.id;
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          role: 'user',         
          first_name: firstName, 
          last_name: lastName,
          avatar_url: null,    
        });

      if (profileError) {
        console.error('Error creating profile row:', profileError);
        console.log('Error creating profile row:', profileError);
      }
    }

    // 3️⃣ Return the original signup result so your UI can handle session or error
    return { data: data.session, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Helper function to fetch profile
  const fetchProfile = async (userId: string) => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', userId)
      .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setFirstName(null); 
      } else if (profileData) {
        setFirstName(profileData.first_name);
      } else {
        setFirstName(null);
      }
  }

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
