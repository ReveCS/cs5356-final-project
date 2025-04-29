import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { HomeIcon, MapIcon, ListIcon, UserIcon, LogOutIcon, LogInIcon } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  user?: User | null;
}

export default function MainLayout({ children, user }: MainLayoutProps) {
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
          {user ? (
            <>
              <NavLink href="/profile" icon={<UserIcon size={20} />} label="Profile" />
              <NavLink href="/auth/signout" icon={<LogOutIcon size={20} />} label="Sign Out" />
            </>
          ) : (
            <NavLink href="/auth/signin" icon={<LogInIcon size={20} />} label="Sign In" />
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

function NavLink({ href, icon, label }: NavLinkProps) {
  return (
    <Link href={href} className="flex items-center px-3 py-2 my-1 text-gray-700 hover:bg-primary-100 rounded-md transition-colors">
      <span className="mr-3">{icon}</span>
      <span className="hidden md:block">{label}</span>
    </Link>
  );
}