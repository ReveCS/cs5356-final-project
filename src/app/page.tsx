// app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users to /auth/signin
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/signin');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Loading…</p>
      </div>
    );
  }

  // Logged-in view:
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-primary-50 to-primary-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">NYC Entertainment List Keeper</h1>
          <button
            onClick={() => router.replace('/auth/signin')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Discover and organize NYC entertainment spots
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              Create lists of your favorite venues, track where you&apos;ve been, and see where your friends are going.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <Link
                href="/map"
                className="inline-flex items-center px-5 py-3 text-base font-medium rounded-md bg-primary-600 text-white hover:bg-primary-700"
              >
                Explore Map
              </Link>
              <Link
                href="/lists"
                className="inline-flex items-center px-5 py-3 text-base font-medium rounded-md bg-primary-100 text-primary-700 hover:bg-primary-200"
              >
                My Lists
              </Link>
            </div>
          </div>
          {/* ...Feature cards, etc. */}
        </div>
      </main>
    </div>
  );
}
