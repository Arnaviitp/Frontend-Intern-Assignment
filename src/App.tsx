import { useState } from 'react';
import MapComponent from './components/MapComponent';
import Sidebar from './components/Sidebar';

interface LocationState {
  lat: number;
  lon: number;
  bbox?: number[];
}

function App() {
  const [selectedLocation, setSelectedLocation] = useState<LocationState | null>(null);

  const handleLocationSelect = (lat: number, lon: number, bbox?: number[]) => {
    setSelectedLocation({ lat, lon, bbox });
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-gray-100">
      <Sidebar onLocationSelect={handleLocationSelect} />

      <main className="flex-1 relative h-full">
        <MapComponent selectedLocation={selectedLocation} />

        {/* Top Bar Overlay - Removed for cleaner design */}
      </main>
    </div>
  );
}

export default App;
