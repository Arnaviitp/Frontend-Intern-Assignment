import { useCallback, useState, useEffect, useRef } from 'react';
import type { ComponentRef } from 'react';
import Map, { Source, Layer, NavigationControl, FullscreenControl, ScaleControl, useControl } from 'react-map-gl/maplibre';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { MapGeoJSONFeature } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Layers, Download, Trash2 } from 'lucide-react';
import GeocodingSearch from './GeocodingSearch';

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
}

// DrawControl component to integrate mapbox-gl-draw with react-map-gl
function DrawControl(props: DrawControlProps) {
    useControl(
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

    return null;
}

const WMS_URL = 'https://www.wms.nrw.de/geobasis/wms_nw_dop';
const WMS_LAYER = 'nw_dop_rgb';

interface MapComponentProps {
    onFeaturesUpdate?: (features: Record<string, MapGeoJSONFeature>) => void;
}

export default function MapComponent({ onFeaturesUpdate }: MapComponentProps) {
    const mapRef = useRef<ComponentRef<typeof Map>>(null);
    const [viewState, setViewState] = useState({
        longitude: 7.4653, // NRW center approx
        latitude: 51.5136,
        zoom: 10
    });
    const [showWMS, setShowWMS] = useState(true);

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
        setFeatures(currFeatures => {
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
        setFeatures(currFeatures => {
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
    useEffect(() => {
        try {
            localStorage.setItem('aoi-features', JSON.stringify(features));
        } catch (error) {
            console.error('Failed to save features:', error);
        }
        if (onFeaturesUpdate) {
            onFeaturesUpdate(features);
        }
    }, [features, onFeaturesUpdate]);

    const handleLocationSelect = (lat: number, lon: number, bbox?: number[]) => {
        if (mapRef.current) {
            mapRef.current.flyTo({
                center: [lon, lat],
                zoom: bbox ? 12 : 14,
                duration: 2000,
            });
        }
    };

    const handleExportFeatures = () => {
        const geojson = {
            type: 'FeatureCollection',
            features: Object.values(features)
        };
        const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aoi-features-${new Date().toISOString()}.geojson`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleClearAll = () => {
        if (confirm('Are you sure you want to delete all features?')) {
            setFeatures({});
            localStorage.removeItem('aoi-features');
        }
    };

    return (
        <div className="relative w-full h-full bg-gray-900">
            <GeocodingSearch onLocationSelect={handleLocationSelect} />

            <Map
                ref={mapRef}
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                style={{ width: '100%', height: '100%' }}
                mapStyle="https://demotiles.maplibre.org/style.json"
            >
                {/* WMS Layer */}
                {showWMS && (
                    <Source
                        id="wms-source"
                        type="raster"
                        tiles={[
                            `${WMS_URL}?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=${WMS_LAYER}`
                        ]}
                        tileSize={256}
                    >
                        <Layer
                            id="wms-layer"
                            type="raster"
                            paint={{ 'raster-opacity': 1 }}
                            beforeId="aeroway-line" // Try to place it below labels if possible, though maplibre base style might differ
                        />
                    </Source>
                )}

                <NavigationControl position="top-right" />
                <FullscreenControl position="top-right" />
                <ScaleControl />

                <DrawControl
                    position="top-left"
                    displayControlsDefault={false}
                    controls={{
                        polygon: true,
                        trash: true,
                        point: true,
                        line_string: true
                    }}
                    defaultMode="simple_select"
                    onCreate={onUpdate}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                />
            </Map>

            {/* Layer Toggle Control */}
            <div className="absolute bottom-8 left-8 bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-slate-800 z-10 flex flex-col gap-4 w-72 transition-all hover:border-slate-700">
                <div className="flex items-center gap-3 text-white font-semibold border-b border-slate-800 pb-3">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                        <Layers className="w-5 h-5 text-blue-500" />
                    </div>
                    <span>Layer Control</span>
                </div>

                <label className="flex items-center gap-4 cursor-pointer group p-2 hover:bg-slate-800/50 rounded-xl transition-colors">
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={showWMS}
                            onChange={(e) => setShowWMS(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Satellite Imagery (NRW)</span>
                </label>

                <div className="text-xs text-slate-500 mt-1 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                    <p className="mb-1">Draw AOIs using the tools at top-left.</p>
                    <p className="font-semibold text-blue-400">{Object.keys(features).length} feature(s) drawn</p>
                </div>

                <div className="flex gap-3 mt-2 pt-2 border-t border-slate-800">
                    <button
                        onClick={handleExportFeatures}
                        disabled={Object.keys(features).length === 0}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600/10 text-emerald-500 border border-emerald-600/20 text-sm font-medium rounded-xl hover:bg-emerald-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button
                        onClick={handleClearAll}
                        disabled={Object.keys(features).length === 0}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-red-600/10 text-red-500 border border-red-600/20 text-sm font-medium rounded-xl hover:bg-red-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear
                    </button>
                </div>
            </div>
        </div>
    );
}
