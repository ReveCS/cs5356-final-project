// components/MainLayout.tsx
'use client';

import Link from 'next/link';
import { HomeIcon, MapIcon, ListIcon, UserIcon, LogOutIcon } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import SignInForm from '@/components/SignInForm';

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

function NavLink({ href, icon, label }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center px-3 py-2 my-1 text-gray-700 hover:bg-primary-100 rounded-md transition-colors"
    >
      <span className="mr-3">{icon}</span>
      <span className="hidden md:block">{label}</span>
    </Link>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl mb-4">Please Sign In</h2>
        <SignInForm />
        <p className="mt-4">
          Don’t have an account?{' '}
          <Link href="/auth/signup" className="text-primary-600 underline">
            Sign up
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar Navigation */}
      <nav className="w-16 md:w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 flex items-center justify-center md:justify-start">
          <h1 className="hidden md:block text-xl font-bold">NYC Explorer</h1>
          <span className="md:hidden text-xl font-bold">NYC</span>
        </div>

        <div className="flex-1 px-2 py-4">
          <NavLink href="/" icon={<HomeIcon size={20} />} label="Home" />
          <NavLink href="/map" icon={<MapIcon size={20} />} label="Map" />
          <NavLink href="/lists" icon={<ListIcon size={20} />} label="My Lists" />
          <NavLink href="/profile" icon={<UserIcon size={20} />} label="Profile" />
          <NavLink href="/auth/signout" icon={<LogOutIcon size={20} />} label="Sign Out" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
