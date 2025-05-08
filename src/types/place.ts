export interface Place {
  id: string;         // Your internal database ID (if applicable) or a unique identifier
  name: string;
  description?: string;
  location?: {
    lat: number;
    lng: number;
  };
  address?: string;
  category?: string;   // Or potentially a more specific type like 'restaurant' | 'bar' | etc.
  place_id?: string;   // Google Place ID
  lat?: number;        // Latitude from Supabase/MapExplorer
  long?: number;       // Longitude from Supabase/MapExplorer
  editorial_summary?: string; // Editorial summary or overview of the place
}