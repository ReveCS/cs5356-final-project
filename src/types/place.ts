export interface Place {
  id: string;         // Your internal database ID (if applicable) or a unique identifier
  name: string;
  address: string;
  lat: number;
  long: number;
  category: string;   // Or potentially a more specific type like 'restaurant' | 'bar' | etc.
  place_id: string;   // Google Place ID
} 