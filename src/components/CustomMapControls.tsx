import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import { useState } from 'react';
import { useMap } from 'react-map-gl/maplibre';

interface CustomMapControlsProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export default function CustomMapControls({ position = 'top-right' }: CustomMapControlsProps) {
  const { current: map } = useMap();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => {
    if (map) {
      map.zoomIn({ duration: 300 });
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.zoomOut({ duration: 300 });
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const positionStyles = {
    'top-left': { top: '1rem', left: '1rem' },
    'top-right': { top: '1rem', right: '1rem' },
    'bottom-left': { bottom: '1rem', left: '1rem' },
    'bottom-right': { bottom: '8rem', right: '1rem' }, // Raised to avoid Feature Counter
  };

  return (
    <div className="absolute flex flex-col gap-2 z-10" style={positionStyles[position]}>
      {/* Zoom Controls */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden backdrop-blur-sm bg-white/95">
        <button
          onClick={handleZoomIn}
          className="p-3 hover:bg-orange-50 transition-all duration-200 border-b border-gray-200 group"
          aria-label="Zoom in"
          title="Zoom in"
        >
          <ZoomIn className="w-5 h-5 text-gray-700 group-hover:text-orange-500 transition-colors" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-3 hover:bg-orange-50 transition-all duration-200 group"
          aria-label="Zoom out"
          title="Zoom out"
        >
          <ZoomOut className="w-5 h-5 text-gray-700 group-hover:text-orange-500 transition-colors" />
        </button>
      </div>

      {/* Fullscreen Control */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden backdrop-blur-sm bg-white/95">
        <button
          onClick={handleToggleFullscreen}
          className="p-3 hover:bg-orange-50 transition-all duration-200 group"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 text-gray-700 group-hover:text-orange-500 transition-colors" />
          ) : (
            <Maximize2 className="w-5 h-5 text-gray-700 group-hover:text-orange-500 transition-colors" />
          )}
        </button>
      </div>
    </div>
  );
}
