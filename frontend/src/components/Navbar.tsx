import { Bell, Search } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0">
      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search API's..."
          className="w-full pl-12 pr-4 py-3 bg-slate-100/50 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all text-sm font-medium"
        />
      </div>

      <div className="flex items-center space-x-6">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Bell size={24} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-4 pl-6 border-l border-slate-200 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20 border-2 border-white flex items-center justify-center text-white font-bold">
            JD
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-bold text-slate-700">John Doe</p>
            <p className="text-xs font-medium text-slate-500">PRO Plan</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
