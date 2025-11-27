import { useCallback, useState, useEffect, useRef } from 'react';
import Map, { Source, Layer, NavigationControl, FullscreenControl, ScaleControl, useControl, MapRef } from 'react-map-gl/maplibre';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Layers, Download, Trash2 } from 'lucide-react';
import GeocodingSearch from './GeocodingSearch';

// DrawControl component to integrate mapbox-gl-draw with react-map-gl
function DrawControl(props: any) {
    useControl(
        () => new MapboxDraw(props) as any, // Cast to any for MapLibre compatibility
        ({ map }: any) => {
            map.on('draw.create', props.onCreate);
            map.on('draw.update', props.onUpdate);
            map.on('draw.delete', props.onDelete);
        },
        ({ map }: any) => {
            map.off('draw.create', props.onCreate);
            map.off('draw.update', props.onUpdate);
            map.off('draw.delete', props.onDelete);
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
    onFeaturesUpdate?: (features: any) => void;
}

export default function MapComponent({ onFeaturesUpdate }: MapComponentProps) {
    const mapRef = useRef<MapRef>(null);
    const [viewState, setViewState] = useState({
        longitude: 7.4653, // NRW center approx
        latitude: 51.5136,
        zoom: 10
    });
    const [showWMS, setShowWMS] = useState(true);

    // Load features from localStorage on mount
    const [features, setFeatures] = useState<Record<string, any>>(() => {
        try {
            const saved = localStorage.getItem('aoi-features');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    const onUpdate = useCallback((e: any) => {
        setFeatures(currFeatures => {
            const newFeatures = { ...currFeatures };
            for (const f of e.features) {
                newFeatures[f.id] = f;
            }
            return newFeatures;
        });
    }, []);

    const onDelete = useCallback((e: any) => {
        setFeatures(currFeatures => {
            const newFeatures = { ...currFeatures };
            for (const f of e.features) {
                delete newFeatures[f.id];
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
            <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-200 z-10 flex flex-col gap-3 w-64">
                <div className="flex items-center gap-2 text-gray-800 font-semibold border-b border-gray-200 pb-2">
                    <Layers className="w-5 h-5 text-blue-600" />
                    <span>Layer Control</span>
                </div>

                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={showWMS}
                            onChange={(e) => setShowWMS(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Satellite Imagery (NRW)</span>
                </label>

                <div className="text-xs text-gray-500 mt-1">
                    <p>Draw AOIs using the tools at top-left.</p>
                    <p className="font-semibold">{Object.keys(features).length} feature(s) drawn</p>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                    <button
                        onClick={handleExportFeatures}
                        disabled={Object.keys(features).length === 0}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button
                        onClick={handleClearAll}
                        disabled={Object.keys(features).length === 0}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear All
                    </button>
                </div>
            </div>
        </div>
    );
}
