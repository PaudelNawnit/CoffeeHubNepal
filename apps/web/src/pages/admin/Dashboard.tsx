import { useState, useEffect } from 'react';
import { Users, ShieldCheck, AlertTriangle, UserCheck, ArrowLeft, DollarSign } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { adminService } from '@/services/admin.service';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

export const Dashboard = () => {
  const { setCurrentPage, setSubPage } = useApp();
  const { user, isAuthenticated } = useAuth();
  
  // Redirect if not authenticated or not admin/moderator
  useEffect(() => {
    if (!isAuthenticated || (!user || (user.role !== 'admin' && user.role !== 'moderator'))) {
      setCurrentPage('home');
      setSubPage(null);
    }
  }, [isAuthenticated, user, setCurrentPage, setSubPage]);
  
  // Don't render if user doesn't have access
  if (!isAuthenticated || !user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return null;
  }
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    pendingVerifications: 0,
    pendingReports: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const adminStats = await adminService.getAdminStats();
      const reportsResult = await adminService.getReports({ status: 'pending', limit: 1 });
      
      setStats({
        totalUsers: adminStats.totalUsers,
        verifiedUsers: adminStats.verifiedUsers,
        pendingVerifications: adminStats.pendingVerifications,
        pendingReports: reportsResult.pagination?.total || 0
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    { label: "Total Users", value: loading ? "..." : stats.totalUsers.toLocaleString(), icon: Users, color: "text-blue-600" },
    { label: "Verified Users", value: loading ? "..." : stats.verifiedUsers.toLocaleString(), icon: UserCheck, color: "text-green-600" },
    { label: "Pending Verifications", value: loading ? "..." : stats.pendingVerifications.toString(), icon: ShieldCheck, color: "text-amber-600" },
    { label: "Pending Reports", value: loading ? "..." : stats.pendingReports.toString(), icon: AlertTriangle, color: "text-red-600" }
  ];

  return (
    <div className="min-h-screen bg-[#F8F5F2] pb-32">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 py-4 flex items-center gap-4">
        <button 
          onClick={() => {
            setCurrentPage('home');
            setSubPage(null);
          }} 
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-[#6F4E37]">Admin Dashboard</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Platform Overview</p>
        </div>
      </div>
      <div className="p-6 space-y-6 animate-in fade-in">

      <div className="grid grid-cols-2 gap-4">
        {dashboardStats.map((stat, idx) => (
          <Card key={idx} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-opacity-10 rounded-2xl flex items-center justify-center ${stat.color.replace('text-', 'bg-')}`}>
                <stat.icon className={stat.color} size={24} />
              </div>
            </div>
            <p className="text-3xl font-black mb-1">{stat.value}</p>
            <p className="text-xs font-black text-gray-400 uppercase">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button 
          variant="outline" 
          className="p-6 flex flex-col items-center gap-2 hover:bg-[#F8F5F2] transition-colors" 
          onClick={() => {
            setCurrentPage('admin');
            setSubPage('users');
          }}
        >
          <Users size={32} className="text-[#6F4E37]" />
          <span className="font-black text-sm">Manage Users</span>
        </Button>
        <Button 
          variant="outline" 
          className="p-6 flex flex-col items-center gap-2 hover:bg-[#F8F5F2] transition-colors" 
          onClick={() => {
            setCurrentPage('admin');
            setSubPage('verifications');
          }}
        >
          <ShieldCheck size={32} className="text-[#6F4E37]" />
          <span className="font-black text-sm">Verifications</span>
        </Button>
        <Button 
          variant="outline" 
          className="p-6 flex flex-col items-center gap-2 hover:bg-[#F8F5F2] transition-colors" 
          onClick={() => {
            setCurrentPage('admin');
            setSubPage('reports');
          }}
        >
          <AlertTriangle size={32} className="text-[#6F4E37]" />
          <span className="font-black text-sm">Reports</span>
        </Button>
        <Button 
          variant="outline" 
          className="p-6 flex flex-col items-center gap-2 hover:bg-[#F8F5F2] transition-colors" 
          onClick={() => {
            setCurrentPage('admin');
            setSubPage('prices');
          }}
        >
          <DollarSign size={32} className="text-[#6F4E37]" />
          <span className="font-black text-sm">Manage Prices</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="font-black mb-4">Pending Verifications</h3>
          <div className="text-center py-8">
            <ShieldCheck size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="font-black text-2xl mb-1">{loading ? "..." : stats.pendingVerifications}</p>
            <p className="text-xs text-gray-400">Awaiting review</p>
          </div>
          <Button 
            variant="primary" 
            className="w-full mt-4" 
            onClick={() => {
              setCurrentPage('admin');
              setSubPage('verifications');
            }}
          >
            Review Now
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-black mb-4">Flagged Content</h3>
          <div className="text-center py-8">
            <AlertTriangle size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="font-black text-2xl mb-1">{loading ? "..." : stats.pendingReports}</p>
            <p className="text-xs text-gray-400">Requires attention</p>
          </div>
          <Button 
            variant="outline" 
            className="w-full mt-4" 
            onClick={() => {
              setCurrentPage('admin');
              setSubPage('reports');
            }}
          >
            View Reports
          </Button>
        </Card>
      </div>
      </div>
    </div>
  );
};

