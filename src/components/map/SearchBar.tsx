'use client';

import React from 'react';
import { Autocomplete } from '@react-google-maps/api';

interface SearchBarProps {
    searchTerm: string;
    onLoad: (autocomplete: google.maps.places.Autocomplete) => void;
    onPlaceChanged: () => void;
    onSearchTermChange: (term: string) => void;
    onFocus: () => void;
    onBlur: () => void;
}

export default function SearchBar({
    searchTerm,
    onLoad,
    onPlaceChanged,
    onSearchTermChange,
    onFocus,
    onBlur // This will be the delayed version from MapExplorer
  }: SearchBarProps) {
    return (
        // Add onFocus and onBlur to the container div
        <div
          className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 w-[600px]" // Increased z-index
          onFocus={onFocus}
          onBlur={onBlur} // Use the passed delayed handler
          tabIndex={-1} // Make the div focusable programmatically if needed
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl transform transition-all duration-300 group-hover:shadow-blue-500/20 group-hover:scale-[1.02]"></div>
            {/* --- Google Autocomplete --- */}
            <Autocomplete
              onLoad={onLoad}
              onPlaceChanged={onPlaceChanged}
              restrictions={{ country: 'us' }}
              // Consider adjusting types if Google Places interfere too much with Supabase results
              // types={['geocode']} // Or remove types entirely if only using Supabase search
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
                  placeholder="Search Google Places or local venues..." // Updated placeholder
                  className="w-full bg-transparent border-none outline-none text-lg text-black placeholder-gray-400 py-3 focus:ring-0"
                  value={searchTerm} // Control the input value
                  onChange={(e) => onSearchTermChange(e.target.value)} // Call prop on change
                  // No need for direct onFocus/onBlur here if handled by container
                />
              </div>
            </Autocomplete>
             {/* --- End Google Autocomplete --- */}
          </div>
          {/* PlacesList will be rendered by MapExplorer just below this component */}
        </div>
      );
    }