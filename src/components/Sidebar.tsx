import { Home, LayoutGrid, ChevronLeft, Upload, Search, Download, Trash2, Layers, Clock, Save } from 'lucide-react';
import { useState } from 'react';
import GeocodingSearch from './GeocodingSearch';

interface SidebarProps {
    onLocationSelect: (lat: number, lon: number, bbox?: number[]) => void;
}

export default function Sidebar({ onLocationSelect }: SidebarProps) {
    const [activeTab, setActiveTab] = useState<'define' | 'saved' | 'export'>('define');

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
                    >
                        <Home className={`w-6 h-6 ${activeTab === 'define' ? 'text-orange-400' : 'text-[#C5A882]'} group-hover:text-orange-400 transition-colors`} />
                        <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                            Define AOI
                        </div>
                    </button>
                    <button
                        className="p-3 rounded-xl hover:bg-white/10 transition-all duration-200 group relative"
                        onClick={() => setActiveTab('saved')}
                    >
                        <Save className={`w-6 h-6 ${activeTab === 'saved' ? 'text-orange-400' : 'text-[#C5A882]'} group-hover:text-orange-400 transition-colors`} />
                        <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                            Saved AOIs
                        </div>
                    </button>
                    <button
                        className="p-3 rounded-xl hover:bg-white/10 transition-all duration-200 group relative"
                        onClick={() => setActiveTab('export')}
                    >
                        <LayoutGrid className={`w-6 h-6 ${activeTab === 'export' ? 'text-orange-400' : 'text-[#C5A882]'} group-hover:text-orange-400 transition-colors`} />
                        <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                            Manage Data
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
                        {activeTab === 'export' && 'Export & Manage'}
                    </h1>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'define' && (
                        <div className="px-8 py-6 flex flex-col gap-6">
                            <div>
                                <h2 className="text-[15px] font-normal text-gray-900 leading-relaxed">
                                    <span className="font-bold">Define the area(s)</span> where you will apply your object count & detection model
                                </h2>
                            </div>

                            <div className="flex flex-col gap-4">
                                <span className="text-sm font-medium text-gray-700">Options:</span>

                                {/* Search Box - Matching uploaded design */}
                                <div className="bg-[#F5EFE7] rounded-2xl border border-gray-300 p-6 relative min-h-[130px] hover:border-gray-400 transition-colors">
                                    <div className="absolute top-5 left-6 right-6">
                                        <div className="flex items-center gap-3">
                                            <Search className="w-5 h-5 text-gray-400" />
                                            <GeocodingSearch onLocationSelect={onLocationSelect} />
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-start h-full pt-16 text-left">
                                        <p className="text-gray-500 text-sm leading-relaxed">
                                            <span className="font-semibold text-gray-700">Search</span> for a city, town...
                                            <br />
                                            or <span className="font-semibold text-gray-700">draw</span> area on map
                                        </p>
                                    </div>
                                </div>

                                {/* Upload Option */}
                                <button className="w-full bg-[#F5EFE7] hover:bg-[#EDE5DC] transition-colors rounded-2xl border border-gray-300 hover:border-gray-400 p-5 flex items-center gap-4 text-gray-700 group">
                                    <Upload className="w-5 h-5 text-gray-600" />
                                    <span className="font-medium text-[15px]">Uploading a shape file</span>
                                </button>
                            </div>

                            {/* Recent Searches */}
                            <div className="mt-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-semibold text-gray-700">Recent Searches</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {['Berlin', 'Paris', 'London', 'New York'].map((city) => (
                                        <button
                                            key={city}
                                            className="px-4 py-2 bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-700 rounded-lg text-sm transition-colors font-medium"
                                            onClick={() => {
                                                // Trigger search for this city
                                            }}
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Draw Tools */}
                            <div className="mt-2">
                                <span className="text-sm font-semibold text-gray-700 block mb-3">Quick Draw Tools</span>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl border border-blue-200 transition-all text-left group">
                                        <div className="font-semibold text-blue-900 text-sm mb-1">Polygon</div>
                                        <div className="text-xs text-blue-700">Draw custom shape</div>
                                    </button>
                                    <button className="p-4 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl border border-green-200 transition-all text-left group">
                                        <div className="font-semibold text-green-900 text-sm mb-1">Rectangle</div>
                                        <div className="text-xs text-green-700">Quick area select</div>
                                    </button>
                                    <button className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl border border-purple-200 transition-all text-left group">
                                        <div className="font-semibold text-purple-900 text-sm mb-1">Circle</div>
                                        <div className="text-xs text-purple-700">Radius based area</div>
                                    </button>
                                    <button className="p-4 bg-gradient-to-br from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200 rounded-xl border border-rose-200 transition-all text-left group">
                                        <div className="font-semibold text-rose-900 text-sm mb-1">Point</div>
                                        <div className="text-xs text-rose-700">Single location</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'saved' && (
                        <div className="px-8 py-6 flex flex-col gap-4">
                            <p className="text-sm text-gray-600 mb-2">Your saved areas of interest</p>

                            {/* Sample saved AOIs */}
                            {['Downtown District', 'Industrial Zone A', 'Residential Area B'].map((name, idx) => (
                                <div key={idx} className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-gray-900">{name}</h3>
                                        <div className="flex gap-2">
                                            <button className="p-1 hover:bg-blue-100 rounded transition-colors">
                                                <Download className="w-4 h-4 text-blue-600" />
                                            </button>
                                            <button className="p-1 hover:bg-red-100 rounded transition-colors">
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Created: {new Date().toLocaleDateString()} • {Math.floor(Math.random() * 10) + 1} features
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'export' && (
                        <div className="px-8 py-6 flex flex-col gap-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Export Formats</h3>
                                <div className="flex flex-col gap-2">
                                    <button className="p-4 bg-white hover:bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all text-left">
                                        <div className="font-semibold text-gray-900 mb-1">GeoJSON</div>
                                        <div className="text-xs text-gray-500">Standard geographic data format</div>
                                    </button>
                                    <button className="p-4 bg-white hover:bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all text-left">
                                        <div className="font-semibold text-gray-900 mb-1">Shapefile</div>
                                        <div className="text-xs text-gray-500">Compatible with GIS software</div>
                                    </button>
                                    <button className="p-4 bg-white hover:bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all text-left">
                                        <div className="font-semibold text-gray-900 mb-1">KML</div>
                                        <div className="text-xs text-gray-500">Google Earth format</div>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <Layers className="w-4 h-4" />
                                    Layer Management
                                </h3>
                                <div className="space-y-2">
                                    {['Satellite Imagery', 'Street View', 'Terrain'].map((layer) => (
                                        <label key={layer} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                                            <span className="text-sm text-gray-700">{layer}</span>
                                            <input type="checkbox" defaultChecked className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500" />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
