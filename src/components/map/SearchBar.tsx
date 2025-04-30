'use client';

import React from 'react';
import { Autocomplete } from '@react-google-maps/api';

interface SearchBarProps {
  onLoad: (autocomplete: google.maps.places.Autocomplete) => void;
  onPlaceChanged: () => void;
}

export default function SearchBar({ onLoad, onPlaceChanged }: SearchBarProps) {
  return (
    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 w-[600px]">
      <div className="relative group">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl transform transition-all duration-300 group-hover:shadow-blue-500/20 group-hover:scale-[1.02]"></div>
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
          restrictions={{ country: 'us' }}
          types={['establishment']} 
          fields={['geometry', 'name', 'formatted_address']}
        >
          <div className="relative flex items-center px-4 py-2">
            <svg
              className="w-6 h-6 text-gray-500 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search for entertainment venues in NYC..."
              className="w-full bg-transparent border-none outline-none text-lg text-black placeholder-gray-400 py-3 focus:ring-0"
            />
          </div>
        </Autocomplete>
      </div>
    </div>
  );
}
