import { Suspense } from 'react';
import MapExplorer from '@/components/map/MapExplorer'; 

// Define a simple fallback component to show while MapExplorer loads
function LoadingFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f0f0' }}>
      <p>Loading Map...</p>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MapExplorer />
    </Suspense>
  );
}