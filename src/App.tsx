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
  const [drawMode, setDrawMode] = useState<'polygon' | 'rectangle' | 'circle' | 'point' | null>(null);
  const [showWMS, setShowWMS] = useState(true);
  const [wmsLayer, setWmsLayer] = useState<'nw_dop_rgb' | 'nw_dop_cir'>('nw_dop_rgb');

  const handleLocationSelect = (lat: number, lon: number, bbox?: number[]) => {
    setSelectedLocation({ lat, lon, bbox });
  };

  const handleDrawModeChange = (mode: 'polygon' | 'rectangle' | 'circle' | 'point' | null) => {
    setDrawMode(mode);
  };

  const handleLayerToggle = (layer: 'satellite' | 'street' | 'terrain', enabled: boolean) => {
    if (layer === 'satellite') {
      setShowWMS(enabled);
    }
  };

  const handleWMSLayerChange = (layer: 'nw_dop_rgb' | 'nw_dop_cir') => {
    setWmsLayer(layer);
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-gray-100">
      <Sidebar
        onLocationSelect={handleLocationSelect}
        onDrawModeChange={handleDrawModeChange}
        onLayerToggle={handleLayerToggle}
        showWMS={showWMS}
        wmsLayer={wmsLayer}
        onWMSLayerChange={handleWMSLayerChange}
      />

      <main className="flex-1 relative h-full">
        <MapComponent
          selectedLocation={selectedLocation}
          drawMode={drawMode}
          showWMS={showWMS}
          wmsLayer={wmsLayer}
        />
      </main>
    </div>
  );
}

export default App;
