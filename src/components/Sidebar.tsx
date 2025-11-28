import {
  Home,
  LayoutGrid,
  ChevronLeft,
  Upload,
  Search,
  Trash2,
  Layers,
  Clock,
  Save,
  MapPin,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import GeocodingSearch from './GeocodingSearch';
import { useToast, useModal } from './UI';

interface SidebarProps {
  onLocationSelect: (lat: number, lon: number, bbox?: number[]) => void;
  onDrawModeChange: (mode: 'polygon' | 'rectangle' | 'circle' | 'point' | null) => void;
  onLayerToggle: (layer: 'satellite' | 'street' | 'terrain', enabled: boolean) => void;
  showWMS: boolean;
  wmsLayer: 'nw_dop_rgb' | 'nw_dop_cir';
  onWMSLayerChange: (layer: 'nw_dop_rgb' | 'nw_dop_cir') => void;
}

interface SavedAOI {
  id: string;
  name: string;
  featureCount: number;
  createdAt: string;
  geometry: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function Sidebar({
  onLocationSelect,
  onDrawModeChange,
  onLayerToggle,
  showWMS,
  wmsLayer,
  onWMSLayerChange,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'define' | 'saved' | 'export'>('define');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('recent-searches');
    return saved ? JSON.parse(saved) : [];
  });
  const [savedAOIs, setSavedAOIs] = useState<SavedAOI[]>(() => {
    const saved = localStorage.getItem('saved-aois');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeDrawMode, setActiveDrawMode] = useState<string | null>(null);

  const { showToast, ToastComponent } = useToast();
  const { showModal, ModalComponent } = useModal();

  // Listen for storage changes (cross‑tab)
  useEffect(() => {
    const loadSavedAOIs = () => {
      const saved = localStorage.getItem('saved-aois');
      if (saved) {
        setSavedAOIs(JSON.parse(saved));
      }
    };

    window.addEventListener('storage', loadSavedAOIs);
    return () => window.removeEventListener('storage', loadSavedAOIs);
  }, []);

  const addRecentSearch = (query: string) => {
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem('recent-searches', JSON.stringify(updated));
  };

  const handleLocationSelectWithHistory = (
    lat: number,
    lon: number,
    bbox?: number[],
    searchQuery?: string
  ) => {
    onLocationSelect(lat, lon, bbox);
    if (searchQuery) {
      addRecentSearch(searchQuery);
    }
  };

  const handleDrawMode = (mode: 'polygon' | 'rectangle' | 'circle' | 'point') => {
    setActiveDrawMode(mode);
    onDrawModeChange(mode);
  };

  const handleSaveCurrentAOI = () => {
    const features = localStorage.getItem('aoi-features');
    if (!features || Object.keys(JSON.parse(features)).length === 0) {
      showToast('No features to save. Please draw some areas first.', 'error');
      return;
    }

    showModal(
      'Save AOI',
      'Enter a name for this Area of Interest:',
      (name) => {
        if (!name?.trim()) return;

        const newAOI: SavedAOI = {
          id: Date.now().toString(),
          name: name.trim(),
          featureCount: JSON.parse(features).length || Object.keys(JSON.parse(features)).length,
          createdAt: new Date().toISOString(),
          geometry: JSON.parse(features),
        };

        const updated = [...savedAOIs, newAOI];
        setSavedAOIs(updated);
        localStorage.setItem('saved-aois', JSON.stringify(updated));
        showToast(`AOI "${name.trim()}" saved successfully!`, 'success');
      },
      true,
      'My AOI'
    );
  };

  const handleDeleteSavedAOI = (id: string, name: string) => {
    showModal('Delete AOI', `Are you sure you want to delete "${name}"?`, () => {
      const updated = savedAOIs.filter((aoi) => aoi.id !== id);
      setSavedAOIs(updated);
      localStorage.setItem('saved-aois', JSON.stringify(updated));
      showToast('AOI deleted successfully', 'success');
    });
  };

  const handleLoadSavedAOI = (aoi: SavedAOI) => {
    localStorage.setItem('aoi-features', JSON.stringify(aoi.geometry));
    showToast(`Loading "${aoi.name}"...`, 'info');
    setTimeout(() => window.location.reload(), 500);
  };

  const handleExportFormat = (format: 'geojson' | 'shapefile' | 'kml') => {
    const features = localStorage.getItem('aoi-features');
    if (!features || Object.keys(JSON.parse(features)).length === 0) {
      showToast('No features to export. Please draw some areas first.', 'error');
      return;
    }

    const parsed = JSON.parse(features);
    const featureArray = Object.values(parsed);

    const geojson = {
      type: 'FeatureCollection',
      features: featureArray,
    };

    if (format === 'geojson') {
      const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aoi-export-${new Date().toISOString().split('T')[0]}.geojson`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('GeoJSON exported successfully!', 'success');
    } else {
      showToast(`${format.toUpperCase()} export coming soon. Use GeoJSON for now.`, 'info');
    }
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.geojson,.json,.kml,.shp';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const geojson = JSON.parse(content);

          if (geojson.type === 'FeatureCollection') {
            // Convert to our format
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const features: any = {};
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            geojson.features.forEach((feature: any, idx: number) => {
              features[`uploaded-${idx}`] = feature;
            });
            localStorage.setItem('aoi-features', JSON.stringify(features));
            showToast('File uploaded successfully! Reloading...', 'success');
            setTimeout(() => window.location.reload(), 500);
          } else {
            showToast('Invalid GeoJSON format. Please upload a FeatureCollection.', 'error');
          }
        } catch {
          showToast("Error reading file. Please ensure it's a valid GeoJSON file.", 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="h-full flex z-20 shadow-2xl">
      {/* Narrow Nav Bar */}
      <div className="w-20 h-full bg-[#3d3d3d] flex flex-col items-center py-6 gap-4 border-r border-gray-700">
        {/* Logo/Icon */}
        <div className="w-12 h-12 relative hover:scale-110 transition-transform duration-300 cursor-pointer mb-4">
          <div className="absolute top-0 right-0 w-0 h-0 border-l-[14px] border-l-transparent border-b-[20px] border-b-orange-400 border-r-[14px] border-r-transparent transform rotate-[-15deg] drop-shadow-lg"></div>
          <div className="absolute bottom-0 left-0 w-0 h-0 border-l-[14px] border-l-transparent border-t-[20px] border-t-white border-r-[14px] border-r-transparent transform rotate-[-15deg] drop-shadow-lg"></div>
        </div>

        {/* Divider */}
        <div className="w-10 h-px bg-gray-600 mb-2"></div>

        {/* Nav Icons */}
        <div className="flex flex-col gap-3 w-full items-center">
          <button
            className="p-3 rounded-xl hover:bg-white/10 transition-all duration-200 group relative"
            onClick={() => setActiveTab('define')}
            aria-label="Define AOI"
          >
            <MapPin
              className={`w-6 h-6 ${activeTab === 'define' ? 'text-orange-400' : 'text-[#C5A882]'} group-hover:text-orange-400 transition-colors`}
            />
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50">
              Define AOI
            </div>
          </button>
          <button
            className="p-3 rounded-xl hover:bg-white/10 transition-all duration-200 group relative"
            onClick={() => setActiveTab('saved')}
            aria-label="Saved AOIs"
          >
            <Save
              className={`w-6 h-6 ${activeTab === 'saved' ? 'text-orange-400' : 'text-[#C5A882]'} group-hover:text-orange-400 transition-colors`}
            />
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50">
              Saved AOIs
            </div>
          </button>
          <button
            className="p-3 rounded-xl hover:bg-white/10 transition-all duration-200 group relative"
            onClick={() => setActiveTab('export')}
            aria-label="Export and Layers"
          >
            <LayoutGrid
              className={`w-6 h-6 ${activeTab === 'export' ? 'text-orange-400' : 'text-[#C5A882]'} group-hover:text-orange-400 transition-colors`}
            />
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-50">
              Export & Layers
            </div>
          </button>
        </div>
      </div>

      {/* Main Sidebar Panel */}
      <div className="w-[430px] h-full bg-white flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100">
          <button className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-5 transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-medium">Back</span>
          </button>
          <h1 className="text-2xl font-medium text-orange-500 tracking-tight">
            {activeTab === 'define' && 'Define Area of Interest'}
            {activeTab === 'saved' && 'Saved AOIs'}
            {activeTab === 'export' && 'Export & Layers'}
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'define' && (
            <div className="px-8 py-6 flex flex-col gap-6">
              <div>
                <h2 className="text-[15px] font-normal text-gray-900 leading-relaxed">
                  <span className="font-bold">Define the area(s)</span> where you will apply your
                  object count & detection model
                </h2>
              </div>

              <div className="flex flex-col gap-4">
                <span className="text-sm font-medium text-gray-700">Options:</span>

                {/* Search Box */}
                <div className="bg-[#F5EFE7] rounded-2xl border border-gray-300 p-6 relative min-h-[130px] hover:border-gray-400 transition-colors">
                  <div className="absolute top-5 left-6 right-6">
                    <div className="flex items-center gap-3">
                      <Search className="w-5 h-5 text-gray-400" />
                      <GeocodingSearch onLocationSelect={handleLocationSelectWithHistory} />
                    </div>
                  </div>
                  <div className="flex items-end justify-start h-full pt-16 text-left">
                    <p className="text-gray-500 text-sm leading-relaxed">
                      <span className="font-semibold text-gray-700">Search</span> for a city,
                      town...
                      <br />
                      or <span className="font-semibold text-gray-700">draw</span> area on map
                    </p>
                  </div>
                </div>

                {/* Upload Option */}
                <button
                  onClick={handleFileUpload}
                  className="w-full bg-[#F5EFE7] hover:bg-[#EDE5DC] transition-colors rounded-2xl border border-gray-300 hover:border-gray-400 p-5 flex items-center gap-4 text-gray-700 group"
                >
                  <Upload className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-[15px]">Upload a shape file (GeoJSON)</span>
                </button>
              </div>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700">Recent Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((city, idx) => (
                      <button
                        key={idx}
                        className="px-4 py-2 bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-700 rounded-lg text-sm transition-colors font-medium"
                        onClick={() => {
                          // Trigger search for this city
                          const event = new CustomEvent('trigger-search', { detail: city });
                          window.dispatchEvent(event);
                        }}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Draw Tools */}
              <div className="mt-2">
                <span className="text-sm font-semibold text-gray-700 block mb-3">
                  Quick Draw Tools
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleDrawMode('polygon')}
                    className={`p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl border-2 transition-all text-left group ${activeDrawMode === 'polygon' ? 'border-blue-500 shadow-lg' : 'border-blue-200'}`}
                  >
                    <div className="font-semibold text-blue-900 text-sm mb-1">Polygon</div>
                    <div className="text-xs text-blue-700">Draw custom shape</div>
                  </button>
                  <button
                    onClick={() => handleDrawMode('rectangle')}
                    className={`p-4 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl border-2 transition-all text-left group ${activeDrawMode === 'rectangle' ? 'border-green-500 shadow-lg' : 'border-green-200'}`}
                  >
                    <div className="font-semibold text-green-900 text-sm mb-1">Rectangle</div>
                    <div className="text-xs text-green-700">Quick area select</div>
                  </button>
                  <button
                    onClick={() => handleDrawMode('circle')}
                    className={`p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl border-2 transition-all text-left group ${activeDrawMode === 'circle' ? 'border-purple-500 shadow-lg' : 'border-purple-200'}`}
                  >
                    <div className="font-semibold text-purple-900 text-sm mb-1">Circle</div>
                    <div className="text-xs text-purple-700">Radius based area</div>
                  </button>
                  <button
                    onClick={() => handleDrawMode('point')}
                    className={`p-4 bg-gradient-to-br from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200 rounded-xl border-2 transition-all text-left group ${activeDrawMode === 'point' ? 'border-rose-500 shadow-lg' : 'border-rose-200'}`}
                  >
                    <div className="font-semibold text-rose-900 text-sm mb-1">Point</div>
                    <div className="text-xs text-rose-700">Single location</div>
                  </button>
                </div>
              </div>

              {/* Save Current AOI Button */}
              <button
                onClick={handleSaveCurrentAOI}
                className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors shadow-md hover:shadow-lg"
              >
                Save Current AOI
              </button>
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="px-8 py-6 flex flex-col gap-4">
              <p className="text-sm text-gray-600 mb-2">
                Your saved areas of interest ({savedAOIs.length})
              </p>

              {savedAOIs.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Save className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No saved AOIs yet</p>
                  <p className="text-sm mt-1">Draw some areas and save them!</p>
                </div>
              ) : (
                savedAOIs.map((aoi) => (
                  <div
                    key={aoi.id}
                    className="p-4 bg-white hover:bg-orange-50/50 rounded-xl border border-gray-200 hover:border-orange-200 transition-all shadow-sm hover:shadow-md group relative"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
                          {aoi.name}
                        </h3>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            {new Date(aoi.createdAt).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>
                            {aoi.featureCount} feature{aoi.featureCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleLoadSavedAOI(aoi)}
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          title="Load AOI"
                          aria-label={`Load AOI ${aoi.name}`}
                        >
                          <Home className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSavedAOI(aoi.id, aoi.name)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          title="Delete AOI"
                          aria-label={`Delete AOI ${aoi.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'export' && (
            <div className="px-8 py-6 flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Export Formats</h3>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleExportFormat('geojson')}
                    className="p-4 bg-white hover:bg-orange-50 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all text-left group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <MapPin className="w-12 h-12 text-orange-500" />
                    </div>
                    <div className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      GeoJSON
                    </div>
                    <div className="text-xs text-gray-500">Standard geographic data format</div>
                  </button>
                  <button
                    onClick={() => handleExportFormat('shapefile')}
                    className="p-4 bg-white hover:bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all text-left opacity-75 hover:opacity-100"
                  >
                    <div className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                      Shapefile
                    </div>
                    <div className="text-xs text-gray-500">
                      Compatible with GIS software (Coming soon)
                    </div>
                  </button>
                  <button
                    onClick={() => handleExportFormat('kml')}
                    className="p-4 bg-white hover:bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all text-left opacity-75 hover:opacity-100"
                  >
                    <div className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                      KML
                    </div>
                    <div className="text-xs text-gray-500">Google Earth format (Coming soon)</div>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Layer Management
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                    <span className="text-sm text-gray-700">Satellite Imagery</span>
                    <input
                      type="checkbox"
                      checked={showWMS}
                      onChange={(e) => onLayerToggle('satellite', e.target.checked)}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                  </label>
                  {showWMS && (
                    <div className="ml-4 space-y-2 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="wmsLayer"
                          checked={wmsLayer === 'nw_dop_rgb'}
                          onChange={() => onWMSLayerChange('nw_dop_rgb')}
                          className="text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-600">RGB (Standard Color)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="wmsLayer"
                          checked={wmsLayer === 'nw_dop_cir'}
                          onChange={() => onWMSLayerChange('nw_dop_cir')}
                          className="text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-600">Infrared (CIR)</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {ToastComponent}
      {ModalComponent}
    </div>
  );
}
