import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchResult {
    display_name: string;
    lat: string;
    lon: string;
    boundingbox: string[];
}

interface GeocodingSearchProps {
    onLocationSelect: (lat: number, lon: number, bbox?: number[]) => void;
}

export default function GeocodingSearch({ onLocationSelect }: GeocodingSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
            );
            const data = await response.json();
            setResults(data);
            setShowResults(true);
        } catch (error) {
            console.error('Geocoding error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectResult = (result: SearchResult) => {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        const bbox = result.boundingbox.map(parseFloat);
        onLocationSelect(lat, lon, bbox);
        setShowResults(false);
        setQuery('');
        setResults([]);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="absolute top-24 left-4 right-4 md:left-auto md:right-auto md:w-96 z-20">
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50">
                <div className="flex items-center gap-2 p-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Search for a location..."
                        className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400"
                    />
                    {query && (
                        <button
                            onClick={() => {
                                setQuery('');
                                setResults([]);
                                setShowResults(false);
                            }}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    )}
                    <button
                        onClick={handleSearch}
                        disabled={isSearching || !query.trim()}
                        className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSearching ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {showResults && results.length > 0 && (
                    <div className="border-t border-gray-200 max-h-64 overflow-y-auto">
                        {results.map((result, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelectResult(result)}
                                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                            >
                                <div className="text-sm font-medium text-gray-800">{result.display_name}</div>
                            </button>
                        ))}
                    </div>
                )}

                {showResults && results.length === 0 && !isSearching && (
                    <div className="border-t border-gray-200 px-4 py-3 text-sm text-gray-500">
                        No results found
                    </div>
                )}
            </div>
        </div>
    );
}
