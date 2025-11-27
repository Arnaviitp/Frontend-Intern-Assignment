import MapComponent from './components/MapComponent';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <div className="flex w-screen h-screen overflow-hidden bg-slate-950">
      <Sidebar />

      <main className="flex-1 relative h-full">
        <MapComponent />

        {/* Top Bar Overlay */}
        <div className="absolute top-0 left-0 w-full p-6 pointer-events-none z-10 flex justify-between items-start">
          <div className="bg-slate-900/80 backdrop-blur-md shadow-lg rounded-2xl p-4 border border-slate-800 pointer-events-auto">
            <h1 className="text-lg font-bold text-white tracking-tight">AOI Creator</h1>
            <p className="text-xs text-slate-400 font-medium">Satellite Intelligence Platform</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
