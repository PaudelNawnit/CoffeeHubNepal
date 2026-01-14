import { Calendar, DollarSign, Briefcase } from 'lucide-react'; // Keep these for now - no exact matches
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import logoImage from '@/assets/images/logo/coffeelogo.webp';
import { t } from '@/i18n';

interface SidebarProps {
  onMenuOpen: () => void;
}

export const Sidebar = ({ onMenuOpen }: SidebarProps) => {
  const { currentPage, setCurrentPage, language } = useApp();

  const mainTabs: Array<{
    id: string;
    iconName?: string;
    icon?: React.ComponentType<any>;
    label: string;
  }> = [
    { id: 'home', iconName: 'Sidebar_Home_20', label: t(language, 'nav.home') },
    { id: 'blog', iconName: 'Sidebar_MessageSquare_20', label: t(language, 'nav.blog') },
    { id: 'market', iconName: 'Sidebar_Store_20', label: t(language, 'nav.market') },
    { id: 'notices', iconName: 'Sidebar_Bell_20', label: t(language, 'nav.alerts') },
    { id: 'jobs', icon: Briefcase, label: t(language, 'nav.jobs') }, // Using lucide for now
    { id: 'prices', icon: DollarSign, label: t(language, 'nav.prices') }, // Using lucide for now
    { id: 'events', icon: Calendar, label: t(language, 'nav.events') }, // Using lucide for now
    { id: 'groups', iconName: 'Sidebar_User_20', label: t(language, 'nav.groups') }, // Using User icon as placeholder
    { id: 'profile', iconName: 'Sidebar_User_20', label: t(language, 'nav.profile') }
  ];

  return (
    <aside className="w-60 xl:w-64 bg-coffee-beige border-r-2 border-coffee-dark/30 h-screen sticky top-0 flex flex-col">
      {/* Logo Section */}
      <div className="p-4 lg:p-6 border-b border-coffee-dark/20">
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
          <Icon name="Sidebar_Create_Plus_18" size={18} /> {t(language, 'nav.createNew')}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 lg:p-4">
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
              {tab.iconName ? (
                <Icon name={tab.iconName} size={20} />
              ) : (
                tab.icon && <tab.icon size={20} />
              )}
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-coffee-dark/20 space-y-2">
        <div className="bg-white/60 rounded-md border border-coffee-dark/20 p-4 text-center">
          <p className="text-xs font-heading font-semibold text-coffee-dark mb-2">{t(language, 'nav.needHelp')}</p>
          <Button 
            variant="outline" 
            className="w-full text-xs py-2"
            onClick={() => setCurrentPage('contact')}
          >
            {t(language, 'nav.contactSupport')}
          </Button>
        </div>
        <div className="space-y-1">
          <button
            onClick={() => setCurrentPage('about')}
            className="w-full text-left px-3 py-2 text-xs text-coffee-dark/70 hover:bg-white/50 rounded-md border border-transparent hover:border-coffee-dark/20 transition-colors"
          >
            {t(language, 'nav.about')}
          </button>
          <button
            onClick={() => setCurrentPage('contact')}
            className="w-full text-left px-3 py-2 text-xs text-coffee-dark/70 hover:bg-white/50 rounded-md border border-transparent hover:border-coffee-dark/20 transition-colors"
          >
            {t(language, 'nav.contact')}
          </button>
        </div>
      </div>
    </aside>
  );
};

