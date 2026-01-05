import { Search, Bell } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import logoImage from '@/assets/images/logo/coffeelogo.png';

export const Header = () => {
  const { setCurrentPage } = useApp();

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-coffee-dark/20 shadow-sm px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setCurrentPage('home')}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-md border border-coffee-dark/20 flex items-center justify-center overflow-hidden">
            <img 
              src={logoImage} 
              alt="CoffeeHubNepal Logo" 
              className="w-full h-full object-contain"
              id="coffeehubnepal-logo"
            />
          </div>
          <div>
            <h1 className="font-heading font-bold text-coffee-dark text-lg leading-none tracking-tight">CoffeeHubNepal</h1>
            <p className="text-[9px] font-body font-semibold text-[#3A7D44] uppercase tracking-widest">Nepal Platform</p>
          </div>
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2.5 bg-white/50 backdrop-blur-sm rounded-md border border-coffee-dark/10 text-coffee-dark transition-all hover:bg-white/70 hover:border-coffee-dark/30 hover:shadow-sm">
          <Search size={20}/>
        </button>
        <button 
          onClick={() => setCurrentPage('notices')}
          className="p-2.5 bg-white/50 backdrop-blur-sm rounded-md border border-coffee-dark/10 text-coffee-dark relative transition-all hover:bg-white/70 hover:border-coffee-dark/30 hover:shadow-sm"
        >
          <Bell size={20}/>
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
      </div>
    </header>
  );
};

