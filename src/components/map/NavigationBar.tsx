'use client';

import { useState } from 'react';
import { Home, Settings, User, Search, Menu } from 'lucide-react'; // Added Menu icon
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

export default function NavigationBar() {
  const [activeItem, setActiveItem] = useState('home');

  const navItems = [
    { name: 'Home', icon: <Home className="mr-2 h-4 w-4" />, id: 'home', href: '/'},
    { name: 'Profile', icon: <User className="mr-2 h-4 w-4" />, id: 'profile' },
    { name: 'Settings', icon: <Settings className="mr-2 h-4 w-4" />, id: 'settings' },
  ];

  return (
    <div className="absolute top-4 left-4 z-10">
      <NavigationMenu>
      <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <Menu className="h-5 w-5 mr-2" /> 
              Menu
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 md:w-[200px] lg:w-[250px]"> 
                {navItems.map((item) => (
                  <li key={item.id}>
                    <NavigationMenuLink asChild>
                      <a href={item.href} className="flex items-center p-2 rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:bg-accent focus:text-accent-foreground">
                        {item.icon}
                        {item.name}
                      </a>
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