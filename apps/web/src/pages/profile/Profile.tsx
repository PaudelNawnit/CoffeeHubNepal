import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { blogService } from '@/services/blog.service';
import { authService } from '@/services/auth.service';
import { compressImage } from '@/utils/imageCompression';
import { 
  Camera, 
  CheckCircle, 
  Store, 
  MessageSquare, 
  Leaf, 
  ShieldCheck, 
  Grip, 
  Briefcase,
  Award, 
  Settings, 
  LogOut, 
  ChevronRight,
  Info,
  Upload,
  X
} from 'lucide-react';

export const Profile = () => {
  const { navigate, setCurrentPage, setSubPage, userRole, setUserRole } = useApp();
  const { user, logout: authLogout, updateUser } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userStats, setUserStats] = useState({
    activeAds: 0,
    qaKarma: 0,
    farmSize: 'N/A'
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

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

  const roleInfo = getRoleDisplay(user?.role || userRole);
  
  // Get avatar URL - use user's uploaded avatar or fallback to generated avatar
  const avatarSeed = user?.email || user?.name || 'user';
  const generatedAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`;
  const avatarUrl = user?.avatar || generatedAvatarUrl;
  
  // Get user display name
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  
  // Member since year
  const memberSince = user?.memberSince || new Date().getFullYear().toString();
  
  // Verification status
  const isVerified = user?.verified === true;

  // Fetch user statistics
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user?.mongoId) {
        setLoadingStats(false);
        return;
      }

      try {
        setLoadingStats(true);
        
        // Get user's blog posts count (Active Ads)
        const blogResult = await blogService.getPosts({ 
          author: user.mongoId, 
          limit: 1000 // Get all posts to count
        });
        const activeAds = blogResult.posts.length;

        // Count user's comments across all blog posts (QA Karma)
        let qaKarma = 0;
        const allPosts = await blogService.getPosts({ limit: 1000 });
        allPosts.posts.forEach(post => {
          const userComments = post.comments.filter(
            comment => comment.author === user.mongoId || comment.authorEmail === user.email
          );
          qaKarma += userComments.length;
        });

        // Farm size - not stored yet, so use N/A or 0h
        const farmSize = 'N/A';

        setUserStats({
          activeAds,
          qaKarma,
          farmSize
        });
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
        // Keep default values on error
      } finally {
        setLoadingStats(false);
      }
    };

    fetchUserStats();
  }, [user?.mongoId, user?.email]);

  const handleImageUpload = async (file: File) => {
    // Allow larger files before compression (up to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploadingImage(true);
    try {
      // Compress image for avatar (512x512 max, quality 0.7, max 300KB to leave room for other user data in Cosmos DB)
      const compressedDataUrl = await compressImage(file, 512, 512, 0.7, 300);

      try {
        const result = await authService.updateProfile({ avatar: compressedDataUrl });
        if (result.user) {
          updateUser(result.user);
          // Also update localStorage
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const updatedUser = { ...currentUser, ...result.user };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (error: any) {
        console.error('Failed to upload image:', error);
        alert(error.message || 'Failed to upload image. Please try again.');
      } finally {
        setUploadingImage(false);
      }
    } catch (error: any) {
      console.error('Image compression error:', error);
      alert(error.message || 'Failed to process image');
      setUploadingImage(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleRemoveImage = async () => {
    if (!confirm('Are you sure you want to remove your profile image?')) {
      return;
    }

    setUploadingImage(true);
    try {
      const result = await authService.updateProfile({ avatar: '' });
      if (result.user) {
        updateUser(result.user);
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...result.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error: any) {
      console.error('Failed to remove image:', error);
      alert(error.message || 'Failed to remove image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleMenuClick = (item: string) => {
    switch(item) {
      case 'verification':
        navigate('verification');
        break;
      case 'listings':
        navigate('my-listings');
        break;
      case 'jobs':
        navigate('my-jobs');
        break;
      case 'certifications':
        navigate('certifications');
        break;
      case 'settings':
        navigate('settings');
        break;
      case 'admin':
        setCurrentPage('admin');
        setSubPage(null);
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
      <div 
        ref={dropZoneRef}
        className={`w-24 h-24 rounded-[32px] bg-[#6F4E37] p-1 border-4 border-white shadow-2xl relative ${
          isDragging ? 'ring-4 ring-[#6F4E37] ring-opacity-50' : ''
        } ${uploadingImage ? 'opacity-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <img 
          src={avatarUrl} 
          className="w-full h-full object-cover rounded-[28px]" 
          alt={displayName} 
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="absolute -right-2 -bottom-2 flex gap-1">
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="bg-white p-2 rounded-xl shadow-lg text-[#6F4E37] border border-[#EBE3D5] hover:bg-gray-50 disabled:opacity-50"
            title="Upload image"
          >
            {uploadingImage ? (
              <div className="w-4 h-4 border-2 border-[#6F4E37] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera size={16}/>
            )}
          </button>
          {user?.avatar && (
            <button 
              onClick={handleRemoveImage}
              disabled={uploadingImage}
              className="bg-white p-2 rounded-xl shadow-lg text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50"
              title="Remove image"
            >
              <X size={16}/>
            </button>
          )}
        </div>
        {isDragging && (
          <div className="absolute inset-0 bg-[#6F4E37] bg-opacity-80 rounded-[28px] flex items-center justify-center">
            <div className="text-white text-xs font-bold text-center">
              <Upload size={20} className="mx-auto mb-1" />
              Drop image here
            </div>
          </div>
        )}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-black">{displayName}</h2>
          {isVerified && <CheckCircle className="text-blue-500" size={18} fill="currentColor" />}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Member since {memberSince}</p>
          <span className="text-gray-300">•</span>
          <Badge variant={roleInfo.variant} className="text-[10px]">{roleInfo.label}</Badge>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {isVerified && user?.role === 'farmer' && <Badge variant="success">Verified Farmer</Badge>}
          {isVerified && user?.role === 'roaster' && <Badge variant="success">Verified Roaster</Badge>}
          {isVerified && user?.role === 'trader' && <Badge variant="success">Verified Trader</Badge>}
          {isVerified && user?.role === 'exporter' && <Badge variant="success">Verified Exporter</Badge>}
          {isVerified && user?.role === 'expert' && <Badge variant="ai">Certified Expert</Badge>}
          {!isVerified && <Badge variant="primary">Pending Verification</Badge>}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4">
      {[
        { label: "Active Ads", val: loadingStats ? "..." : userStats.activeAds.toString(), icon: Store },
        { label: "QA Karma", val: loadingStats ? "..." : userStats.qaKarma.toString(), icon: MessageSquare },
        { label: "Farm Size", val: loadingStats ? "..." : userStats.farmSize, icon: Leaf }
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
          { label: "Account Verification", icon: ShieldCheck, color: "text-blue-600", key: "verification" },
          { label: "My Listings", icon: Grip, color: "text-[#6F4E37]", key: "listings" },
          { label: "My Jobs", icon: Briefcase, color: "text-green-600", key: "jobs" },
          { label: "Expert Certifications", icon: Award, color: "text-amber-600", key: "certifications" },
          { label: "App Settings", icon: Settings, color: "text-gray-400", key: "settings" },
          ...((user?.role === 'admin' || user?.role === 'moderator') ? [
            { label: "Admin Panel", icon: ShieldCheck, color: "text-purple-600", key: "admin" }
          ] : [])
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
        onClick={() => setShowLogoutConfirm(true)}
      >
        <LogOut size={18}/> Log Out
      </Button>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to log out? You'll need to sign in again to access your account."
        confirmText="Log Out"
        cancelText="Cancel"
        variant="danger"
        onConfirm={async () => {
          await authLogout();
          setUserRole('farmer');
          setCurrentPage('home');
          navigate('login');
          setShowLogoutConfirm(false);
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  </div>
  );
};

