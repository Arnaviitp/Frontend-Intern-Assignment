import { useCallback, useState, useEffect, useRef } from 'react';
import type { ComponentRef } from 'react';
import Map, { Source, Layer, ScaleControl, useControl } from 'react-map-gl/maplibre';
import CustomMapControls from './CustomMapControls';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { MapGeoJSONFeature } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

// Type definitions for draw events
interface DrawEvent {
  features: MapGeoJSONFeature[];
}

interface MapInstance {
  on: (event: string, handler: (e: DrawEvent) => void) => void;
  off: (event: string, handler: (e: DrawEvent) => void) => void;
}

interface DrawControlProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  displayControlsDefault?: boolean;
  controls?: {
    polygon?: boolean;
    trash?: boolean;
    point?: boolean;
    line_string?: boolean;
  };
  defaultMode?: string;
  onCreate?: (e: DrawEvent) => void;
  onUpdate?: (e: DrawEvent) => void;
  onDelete?: (e: DrawEvent) => void;
  onMount?: (draw: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}

// DrawControl component to integrate mapbox-gl-draw with react-map-gl
function DrawControl(props: DrawControlProps) {
  const { onMount } = props;
  const draw = useControl(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => new MapboxDraw(props) as any, // Cast to any for MapLibre compatibility
    ({ map }: { map: MapInstance }) => {
      if (props.onCreate) map.on('draw.create', props.onCreate);
      if (props.onUpdate) map.on('draw.update', props.onUpdate);
      if (props.onDelete) map.on('draw.delete', props.onDelete);
    },
    ({ map }: { map: MapInstance }) => {
      if (props.onCreate) map.off('draw.create', props.onCreate);
      if (props.onUpdate) map.off('draw.update', props.onUpdate);
      if (props.onDelete) map.off('draw.delete', props.onDelete);
    },
    {
      position: props.position,
    }
  );

  useEffect(() => {
    if (onMount && draw) {
      onMount(draw);
    }
  }, [draw, onMount]);

  return null;
}

const WMS_URL = 'https://www.wms.nrw.de/geobasis/wms_nw_dop';
// Removed constant WMS_LAYER as it is now dynamic

interface MapComponentProps {
  onFeaturesUpdate?: (features: Record<string, MapGeoJSONFeature>) => void;
  selectedLocation?: { lat: number; lon: number; bbox?: number[] } | null;
  drawMode?: 'polygon' | 'rectangle' | 'circle' | 'point' | null;
  showWMS?: boolean;
  wmsLayer?: 'nw_dop_rgb' | 'nw_dop_cir';
}

export default function MapComponent({
  onFeaturesUpdate,
  selectedLocation,
  drawMode,
  showWMS = true,
  wmsLayer = 'nw_dop_rgb',
}: MapComponentProps) {
  const mapRef = useRef<ComponentRef<typeof Map>>(null);
  const drawControlRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [viewState, setViewState] = useState({
    longitude: 7.4653, // NRW center approx
    latitude: 51.5136,
    zoom: 10,
  });

  // Handle location selection from sidebar
  useEffect(() => {
    if (selectedLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedLocation.lon, selectedLocation.lat],
        zoom: selectedLocation.bbox ? 12 : 14,
        duration: 2000,
      });
    }
  }, [selectedLocation]);

  // Handle draw mode changes
  useEffect(() => {
    if (!drawControlRef.current) return;

    const draw = drawControlRef.current;
    // MapboxDraw doesn't support 'rectangle' or 'circle' natively without plugins,
    // but for now we'll map them to polygon/point or just use simple_select if not supported.
    // For a real implementation of circle/rectangle, we'd need mapbox-gl-draw-rectangle-mode etc.
    // Here we'll stick to basic modes for the "Quick Draw" demo.

    if (drawMode === 'polygon') {
      draw.changeMode('draw_polygon');
    } else if (drawMode === 'point') {
      draw.changeMode('draw_point');
    } else if (drawMode === 'rectangle') {
      // Fallback or custom mode if available. For now, let's use polygon as fallback or just alert
      // Since we don't have the plugin installed, we'll default to polygon for rectangle
      draw.changeMode('draw_polygon');
    } else if (drawMode === 'circle') {
      // Fallback for circle
      draw.changeMode('draw_polygon');
    } else {
      draw.changeMode('simple_select');
    }
  }, [drawMode]);

  // Load features from localStorage on mount
  const [features, setFeatures] = useState<Record<string, MapGeoJSONFeature>>(() => {
    try {
      const saved = localStorage.getItem('aoi-features');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const onUpdate = useCallback((e: DrawEvent) => {
    setFeatures((currFeatures) => {
      const newFeatures = { ...currFeatures };
      for (const f of e.features) {
        if (f.id) {
          newFeatures[f.id] = f;
        }
      }
      return newFeatures;
    });
  }, []);

  const onDelete = useCallback((e: DrawEvent) => {
    setFeatures((currFeatures) => {
      const newFeatures = { ...currFeatures };
      for (const f of e.features) {
        if (f.id) {
          delete newFeatures[f.id];
        }
      }
      return newFeatures;
    });
  }, []);

  // Save features to localStorage whenever they change
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem('aoi-features', JSON.stringify(features));
      } catch (error) {
        console.error('Failed to save features:', error);
      }
    }, 200);

    if (onFeaturesUpdate) {
      onFeaturesUpdate(features);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [features, onFeaturesUpdate]);

  return (
    <div className="relative w-full h-full bg-gray-900">
      {/* GeocodingSearch is now in Sidebar */}

      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
      >
        {/* WMS Layer */}
        {showWMS && (
          <Source
            id="wms-source"
            type="raster"
            tiles={[
              `${WMS_URL}?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=${wmsLayer}`,
            ]}
            tileSize={256}
            attribution="Geobasis NRW"
          >
            <Layer
              id="wms-layer"
              type="raster"
              paint={{ 'raster-opacity': 1 }}
              beforeId="aeroway-line" // Try to place it below labels if possible, though maplibre base style might differ
            />
          </Source>
        )}

        <CustomMapControls position="bottom-right" />
        <ScaleControl />

        <DrawControl
          position="top-left"
          displayControlsDefault={false}
          controls={{
            polygon: true,
            trash: true,
            point: true,
            line_string: true,
          }}
          defaultMode="simple_select"
          onCreate={onUpdate}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onMount={(draw) => {
            drawControlRef.current = draw;
          }}
        />
      </Map>

      {/* Feature Counter Badge */}
      {Object.keys(features).length > 0 && (
        <div className="absolute bottom-6 right-6 bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-3 z-10 animate-fadeIn">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-700">
              {Object.keys(features).length} feature{Object.keys(features).length !== 1 ? 's' : ''}{' '}
              drawn
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
