import MapComponent from './components/MapComponent';

function App() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-900">
      <MapComponent />

      {/* Overlay Header */}
      <div className="absolute top-0 left-0 w-full p-4 pointer-events-none z-10">
        <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-xl p-4 inline-flex items-center gap-4 pointer-events-auto border border-gray-200/50">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-blue-500/30 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">AOI Creator</h1>
            <p className="text-xs text-gray-500 font-medium">Satellite Intelligence Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
