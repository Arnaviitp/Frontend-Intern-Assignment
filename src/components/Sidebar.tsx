import { Map, Layers, FileText, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
    return (
        <div className="h-full w-16 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 z-20 shadow-xl">
            {/* Logo */}
            <div className="mb-8">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Map className="w-6 h-6 text-white" />
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 flex flex-col gap-6 w-full px-2">
                <button className="p-3 rounded-xl bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all duration-300 group relative">
                    <Map className="w-5 h-5" />
                    <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none">
                        Map View
                    </span>
                </button>

                <button className="p-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-300 group relative">
                    <Layers className="w-5 h-5" />
                    <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none">
                        Layers
                    </span>
                </button>

                <button className="p-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-300 group relative">
                    <FileText className="w-5 h-5" />
                    <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none">
                        Saved AOIs
                    </span>
                </button>

                <button className="p-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-300 group relative">
                    <Settings className="w-5 h-5" />
                    <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none">
                        Settings
                    </span>
                </button>
            </nav>

            {/* Bottom Actions */}
            <div className="mt-auto flex flex-col gap-4 w-full px-2">
                <button className="p-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 group relative">
                    <LogOut className="w-5 h-5" />
                    <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none">
                        Logout
                    </span>
                </button>
            </div>
        </div>
    );
}
