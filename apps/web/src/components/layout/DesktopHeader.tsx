import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Icon } from '@/components/common/Icon';
import { t } from '@/i18n';

export const DesktopHeader = () => {
  const { setCurrentPage, language, setLanguage, navigate } = useApp();
  const { user } = useAuth();
  
  // Get user display name and role
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const userRole = user?.role || 'farmer';
  const isVerified = user?.verified === true;
  
  // Get avatar URL - use user's uploaded avatar or fallback to generated avatar
  const avatarSeed = user?.email || user?.name || 'user';
  const generatedAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`;
  const avatarUrl = user?.avatar || generatedAvatarUrl;
  
  // Role display labels
  const roleLabels: { [key: string]: string } = {
    farmer: 'Farmer',
    roaster: 'Roaster',
    trader: 'Trader',
    exporter: 'Exporter',
    expert: 'Expert',
    admin: 'Admin',
    moderator: 'Moderator'
  };
  
  const roleLabel = roleLabels[userRole] || 'Member';

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-coffee-dark/20 shadow-sm px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-dark/60">
              <Icon name="DesktopHeader_Search_20" size={20} />
            </div>
            <input
              type="text"
              placeholder={t(language, 'common.searchPlaceholder')}
              className="w-full bg-white/50 backdrop-blur-sm border border-coffee-dark/10 rounded-md pl-12 pr-4 py-3 outline-none focus:border-coffee-dark/30 focus:bg-white/70 focus:shadow-sm text-base text-coffee-dark placeholder:text-coffee-dark/50 transition-all"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4 ml-2 sm:ml-4">
          {/* Language Toggle */}
          <div className="flex items-center bg-white/60 border border-coffee-dark/10 rounded-full text-[11px] overflow-hidden">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 font-semibold transition-colors ${
                language === 'en' ? 'bg-coffee-dark text-white' : 'text-coffee-dark/70'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ne')}
              className={`px-3 py-1 font-semibold transition-colors ${
                language === 'ne' ? 'bg-coffee-dark text-white' : 'text-coffee-dark/70'
              }`}
            >
              ने
            </button>
          </div>
          <button 
            onClick={() => setCurrentPage('notices')}
            className="relative p-2 sm:p-3 bg-white/50 backdrop-blur-sm rounded-md border border-coffee-dark/10 text-coffee-dark hover:bg-white/70 hover:border-coffee-dark/30 hover:shadow-sm transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Icon name="DesktopHeader_Bell_20" size={20} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white/70 rounded-full"></span>
          </button>

          <button 
            onClick={() => setCurrentPage('profile')}
            className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-white/40 backdrop-blur-sm rounded-xl transition-all hover:shadow-sm min-h-[44px]"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-coffee-dark border border-coffee-dark rounded-md overflow-hidden flex items-center justify-center">
              {user?.avatar ? (
                <img 
                  src={avatarUrl} 
                  alt={displayName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to generated avatar if image fails to load
                    (e.target as HTMLImageElement).src = generatedAvatarUrl;
                  }}
                />
              ) : (
                <img 
                  src={generatedAvatarUrl} 
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-sm font-heading font-semibold text-coffee-dark">{displayName}</p>
              <p className="text-xs font-body text-coffee-dark/70">
                {isVerified ? `Verified ${roleLabel}` : roleLabel}
              </p>
            </div>
          </button>

          <button 
            onClick={() => {
              setCurrentPage('profile');
              navigate('settings');
            }}
            className="p-2 sm:p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-coffee-dark/10 text-coffee-dark hover:bg-white/70 hover:border-coffee-dark/30 hover:shadow-sm transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Settings"
          >
            <Icon name="DesktopHeader_Settings_20" size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

