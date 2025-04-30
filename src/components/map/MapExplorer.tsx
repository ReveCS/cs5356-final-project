'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import SearchBar from './SearchBar';
import PlacesList from './PlacesList';
import PlaceCard from './PlaceCard';
import { supabase } from '@/lib/supabase';

export default function MapExplorer() {
    
}