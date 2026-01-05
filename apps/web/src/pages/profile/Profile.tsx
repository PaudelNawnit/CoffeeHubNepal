import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Camera, 
  CheckCircle, 
  Store, 
  MessageSquare, 
  Leaf, 
  ShieldCheck, 
  Grip, 
  Award, 
  Settings, 
  LogOut, 
  ChevronRight,
  Info
} from 'lucide-react';

export const Profile = () => {
  const { navigate, setCurrentPage, userRole, setUserRole } = useApp();
  const { logout: authLogout } = useAuth();

  const getRoleDisplay = (role: string) => {
    const roleMap: { [key: string]: { label: string; variant: 'primary' | 'success' | 'alert' | 'ai' } } = {
      farmer: { label: 'Farmer', variant: 'success' },
      roaster: { label: 'Roaster', variant: 'primary' },
      trader: { label: 'Trader', variant: 'primary' },
      exporter: { label: 'Exporter', variant: 'primary' },
      admin: { label: 'Admin', variant: 'alert' },
      expert: { label: 'Expert', variant: 'ai' }
    };
    return roleMap[role] || { label: role.charAt(0).toUpperCase() + role.slice(1), variant: 'primary' };
  };

  const roleInfo = getRoleDisplay(userRole);

  const handleMenuClick = (item: string) => {
    switch(item) {
      case 'verification':
        navigate('verification');
        break;
      case 'listings':
        navigate('my-listings');
        break;
      case 'certifications':
        navigate('certifications');
        break;
      case 'settings':
        navigate('settings');
        break;
      case 'about':
        setCurrentPage('about');
        break;
      case 'contact':
        setCurrentPage('contact');
        break;
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in pb-32 lg:pb-8 pt-10">
    <div className="flex items-center gap-6">
      <div className="w-24 h-24 rounded-[32px] bg-[#6F4E37] p-1 border-4 border-white shadow-2xl relative">
        <img 
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
          className="w-full h-full object-cover rounded-[28px]" 
          alt="Profile" 
        />
        <button className="absolute -right-2 -bottom-2 bg-white p-2 rounded-xl shadow-lg text-[#6F4E37] border border-[#EBE3D5]">
          <Camera size={16}/>
        </button>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-black">Coffee HUB</h2>
          <CheckCircle className="text-blue-500" size={18} fill="currentColor" />
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Member since 2022</p>
          <span className="text-gray-300">•</span>
          <Badge variant={roleInfo.variant} className="text-[10px]">{roleInfo.label}</Badge>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {userRole === 'farmer' && <Badge variant="success">Verified Farmer</Badge>}
          {userRole === 'roaster' && <Badge variant="success">Verified Roaster</Badge>}
          {userRole === 'trader' && <Badge variant="success">Verified Trader</Badge>}
          {userRole === 'exporter' && <Badge variant="success">Verified Exporter</Badge>}
          {userRole === 'expert' && <Badge variant="ai">Certified Expert</Badge>}
          <Badge variant="primary">Gold Tier</Badge>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4">
      {[
        { label: "Active Ads", val: "12", icon: Store },
        { label: "QA Karma", val: "480", icon: MessageSquare },
        { label: "Farm Size", val: "1.2h", icon: Leaf }
      ].map((stat, i) => (
        <Card key={i} className="p-4 text-center">
          <stat.icon size={16} className="mx-auto mb-2 text-gray-300"/>
          <p className="text-xl font-black text-[#6F4E37]">{stat.val}</p>
          <p className="text-[8px] font-black text-gray-400 uppercase">{stat.label}</p>
        </Card>
      ))}
    </div>

    <div className="space-y-4">
      <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest">Management</h3>
      <Card className="divide-y divide-gray-100">
        {[
          { label: "Farmer Verification", icon: ShieldCheck, color: "text-blue-600", key: "verification" },
          { label: "My Listings", icon: Grip, color: "text-[#6F4E37]", key: "listings" },
          { label: "Expert Certifications", icon: Award, color: "text-amber-600", key: "certifications" },
          { label: "App Settings", icon: Settings, color: "text-gray-400", key: "settings" }
        ].map((item, i) => (
          <div 
            key={i} 
            onClick={() => handleMenuClick(item.key)}
            className="p-5 flex items-center justify-between group cursor-pointer active:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <item.icon className={item.color} size={20}/>
              <span className="text-sm font-black text-gray-700">{item.label}</span>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-gray-500" size={18}/>
          </div>
        ))}
      </Card>

      <Card className="divide-y divide-gray-100">
        {[
          { label: "About Us", icon: Info, color: "text-blue-600", key: "about" },
          { label: "Contact Us", icon: MessageSquare, color: "text-green-600", key: "contact" }
        ].map((item, i) => (
          <div 
            key={i} 
            onClick={() => handleMenuClick(item.key)}
            className="p-5 flex items-center justify-between group cursor-pointer active:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <item.icon className={item.color} size={20}/>
              <span className="text-sm font-black text-gray-700">{item.label}</span>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-gray-500" size={18}/>
          </div>
        ))}
      </Card>

      <Button 
        variant="outline" 
        className="w-full py-4 text-red-600 border-red-50 bg-red-50/20 hover:bg-red-100"
        onClick={async () => {
          // Confirm logout
          if (window.confirm('Are you sure you want to log out?')) {
            // Clear user data and navigate to login
            await authLogout();
            setUserRole('farmer');
            setCurrentPage('home');
            navigate('login');
          }
        }}
      >
        <LogOut size={18}/> Log Out
      </Button>
    </div>
  </div>
  );
};

