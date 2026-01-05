import { ArrowLeft, Bell, Moon, Shield, Trash2, User, Info, MessageCircle, FileText } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useApp } from '@/context/AppContext';
import { useState } from 'react';

export const Settings = () => {
  const { setCurrentPage, setSubPage } = useApp();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');

  const [profileData, setProfileData] = useState({
    name: 'Coffee HUB',
    email: 'user@coffeehubnepal.com',
    phone: '+977 9800000000',
    location: 'Kaski, Nepal'
  });

  return (
    <div className="min-h-screen bg-[#F8F5F2] pb-32">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 py-4 flex items-center gap-4">
        <button onClick={() => setCurrentPage('profile')} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-[#6F4E37] flex-1">App Settings</h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Information */}
        <Card className="p-6">
          <h3 className="font-black text-lg mb-4 flex items-center gap-2">
            <User size={20} className="text-[#6F4E37]" />
            Profile Information
          </h3>
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            />
            <Input
              type="email"
              label="Email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            />
            <Input
              type="tel"
              label="Phone Number"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
            />
            <Input
              label="Location"
              value={profileData.location}
              onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
            />
            <Button variant="primary" className="w-full">
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <h3 className="font-black text-lg mb-4 flex items-center gap-2">
            <Bell size={20} className="text-[#6F4E37]" />
            Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-sm">Push Notifications</p>
                <p className="text-xs text-gray-500">Receive notifications on your device</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6F4E37]"></div>
              </label>
            </div>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span>New messages</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span>Job opportunities</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span>Price alerts</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span>Marketing emails</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="p-6">
          <h3 className="font-black text-lg mb-4 flex items-center gap-2">
            <Moon size={20} className="text-[#6F4E37]" />
            Preferences
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-600 mb-2 uppercase tracking-tight">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-white border border-[#EBE3D5] rounded-xl px-4 py-3 outline-none focus:ring-2 ring-[#6F4E37]/10 text-sm"
              >
                <option value="en">English</option>
                <option value="ne">नेपाली (Nepali)</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-sm">Dark Mode</p>
                <p className="text-xs text-gray-500">Switch to dark theme</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6F4E37]"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Privacy & Security */}
        <Card className="p-6">
          <h3 className="font-black text-lg mb-4 flex items-center gap-2">
            <Shield size={20} className="text-[#6F4E37]" />
            Privacy & Security
          </h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Privacy Settings
            </Button>
          </div>
        </Card>

        {/* About & Contact */}
        <Card className="p-6">
          <h3 className="font-black text-lg mb-4 flex items-center gap-2">
            <Info size={20} className="text-[#6F4E37]" />
            Information
          </h3>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setCurrentPage('about');
                setSubPage(null);
              }}
            >
              <Info size={16} /> About Us
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setCurrentPage('contact');
                setSubPage(null);
              }}
            >
              <MessageCircle size={16} /> Contact Us
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setCurrentPage('faq');
                setSubPage(null);
              }}
            >
              <Info size={16} /> FAQ
            </Button>
          </div>
        </Card>

        {/* Legal */}
        <Card className="p-6">
          <h3 className="font-black text-lg mb-4 flex items-center gap-2">
            <Shield size={20} className="text-[#6F4E37]" />
            Legal
          </h3>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setCurrentPage('privacy');
                setSubPage(null);
              }}
            >
              <Shield size={16} /> Privacy Policy
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setCurrentPage('terms');
                setSubPage(null);
              }}
            >
              <FileText size={16} /> Terms of Service
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setCurrentPage('faq');
                setSubPage(null);
              }}
            >
              <Info size={16} /> FAQ
            </Button>
          </div>
        </Card>

        {/* Legal */}
        <Card className="p-6">
          <h3 className="font-black text-lg mb-4 flex items-center gap-2">
            <Shield size={20} className="text-[#6F4E37]" />
            Legal
          </h3>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setCurrentPage('privacy');
                setSubPage(null);
              }}
            >
              <Shield size={16} /> Privacy Policy
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setCurrentPage('terms');
                setSubPage(null);
              }}
            >
              <FileText size={16} /> Terms of Service
            </Button>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-red-200">
          <h3 className="font-black text-lg mb-4 text-red-600 flex items-center gap-2">
            <Trash2 size={20} />
            Danger Zone
          </h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start text-red-600 border-red-200">
              Delete Account
            </Button>
            <p className="text-xs text-gray-500">This action cannot be undone</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

