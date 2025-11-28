import { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setError(null);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      if (!response.ok) throw new Error('Failed to fetch results');
      const data = await response.json();
      setResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Geocoding error:', error);
      setResults([]);
      setError('Failed to search location. Please try again.');
      setShowResults(true);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced auto-search on typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 3) {
        performSearch(query);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = () => performSearch(query);

  useEffect(() => {
    const handleTriggerSearch = (e: CustomEvent<string>) => {
      setQuery(e.detail);
      performSearch(e.detail);
    };

    window.addEventListener('trigger-search', handleTriggerSearch as EventListener);
    return () => window.removeEventListener('trigger-search', handleTriggerSearch as EventListener);
  }, []);

  const handleSelectResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    const bbox = result.boundingbox.map(parseFloat);
    onLocationSelect(lat, lon, bbox);
    setShowResults(false);
    setQuery(result.display_name.split(',')[0]); // Show just the first part
    setResults([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full relative">
      <div className="flex items-center gap-2 w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => query && results.length > 0 && setShowResults(true)}
          placeholder="Search location..."
          className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium text-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowResults(false);
            }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-80 overflow-y-auto custom-scrollbar z-50 animate-fadeIn">
          {results.map((result, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectResult(result)}
              className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0 group flex items-start gap-3"
            >
              <MapPin className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors truncate">
                  {result.display_name.split(',')[0]}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {result.display_name.split(',').slice(1).join(', ')}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && !isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 px-4 py-3 text-sm text-gray-500 z-50">
          <div className="flex items-center gap-2">
            {error ? (
              <>
                <X className="w-4 h-4 text-red-500" />
                <span className="text-red-500">{error}</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>No results found</span>
              </>
            )}
          </div>
        </div>
      )}

      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 px-4 py-3 z-50">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Searching...</span>
          </div>
        </div>
      )}
    </div>
  );
}
