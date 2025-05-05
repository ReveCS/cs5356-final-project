'use client';

import { useState } from 'react';
import { Home, Settings, User, Search, Menu } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger, 
  NavigationMenuContent, 
  navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';

export default function NavigationBar() {
  const [activeItem, setActiveItem] = useState('home');
  const router = useRouter();
  const { user, firstName } = useAuth();

  const navItems = [
    { name: 'Home', icon: <Home className="mr-2 h-4 w-4" />, id: 'home', href: '/'},
    { name: 'Profile', icon: <User className="mr-2 h-4 w-4" />, id: 'profile', href: user ? `/profile/${user.id}` : '/auth/signin' },
  ];

  return (
    <div className="absolute top-4 left-4 z-10">
      <NavigationMenu viewport={false}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg">
              <Menu className="h-5 w-5 mr-2" /> 
              {user ? firstName || 'Menu' : 'Menu'}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 md:w-[200px] lg:w-[250px] bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-100"> 
                {navItems.map((item) => (
                  <li key={item.id}>
                    <NavigationMenuLink asChild>
                      <Link 
                        href={item.href} 
                        className="flex items-center p-2 rounded-md hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900 transition-colors"
                        onClick={() => setActiveItem(item.id)}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}