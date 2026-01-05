import { Home, MessageSquare, Store, Bell, User, Plus, Briefcase, DollarSign, Calendar, Users } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/common/Button';
import logoImage from '@/assets/images/logo.png';

interface SidebarProps {
  onMenuOpen: () => void;
}

export const Sidebar = ({ onMenuOpen }: SidebarProps) => {
  const { currentPage, setCurrentPage } = useApp();

  const mainTabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'qna', icon: MessageSquare, label: 'Forum' },
    { id: 'market', icon: Store, label: 'Marketplace' },
    { id: 'notices', icon: Bell, label: 'Alerts' },
    { id: 'jobs', icon: Briefcase, label: 'Jobs' },
    { id: 'prices', icon: DollarSign, label: 'Prices' },
    { id: 'events', icon: Calendar, label: 'Events' },
    { id: 'groups', icon: Users, label: 'Groups' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <aside className="w-64 bg-coffee-beige border-r-2 border-coffee-dark/30 h-screen sticky top-0 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-coffee-dark/20">
        <button 
          onClick={() => setCurrentPage('home')}
          className="flex items-center gap-3 mb-4 w-full"
        >
          <div className="w-12 h-12 rounded-md border border-coffee-dark/20 flex items-center justify-center overflow-hidden">
            <img 
              src={logoImage} 
              alt="CoffeeHubNepal Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-left">
            <h1 className="font-heading font-bold text-coffee-dark text-lg leading-none">CoffeeHubNepal</h1>
            <p className="text-[9px] font-body font-semibold text-[#3A7D44] uppercase tracking-widest">Nepal Platform</p>
          </div>
        </button>
        <Button 
          variant="primary" 
          className="w-full"
          onClick={onMenuOpen}
        >
          <Plus size={18} /> Create New
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {mainTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentPage(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md border transition-all ${
                currentPage === tab.id
                  ? 'bg-coffee-dark text-white border-coffee-dark font-heading font-semibold'
                  : 'text-coffee-dark/70 border-transparent hover:bg-white/50 hover:border-coffee-dark/20 font-body font-medium'
              }`}
            >
              <tab.icon size={20} />
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-coffee-dark/20 space-y-2">
        <div className="bg-white/60 rounded-md border border-coffee-dark/20 p-4 text-center">
          <p className="text-xs font-heading font-semibold text-coffee-dark mb-2">Need Help?</p>
          <Button 
            variant="outline" 
            className="w-full text-xs py-2"
            onClick={() => setCurrentPage('contact')}
          >
            Contact Support
          </Button>
        </div>
        <div className="space-y-1">
          <button
            onClick={() => setCurrentPage('about')}
            className="w-full text-left px-3 py-2 text-xs text-coffee-dark/70 hover:bg-white/50 rounded-md border border-transparent hover:border-coffee-dark/20 transition-colors"
          >
            About Us
          </button>
          <button
            onClick={() => setCurrentPage('contact')}
            className="w-full text-left px-3 py-2 text-xs text-coffee-dark/70 hover:bg-white/50 rounded-md border border-transparent hover:border-coffee-dark/20 transition-colors"
          >
            Contact Us
          </button>
        </div>
      </div>
    </aside>
  );
};

