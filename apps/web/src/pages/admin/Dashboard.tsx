import { Users, MessageSquare, Store, ShieldCheck, TrendingUp, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

export const Dashboard = () => {
  const stats = [
    { label: "Total Users", value: "2,458", icon: Users, color: "text-blue-600", change: "+12%" },
    { label: "Active Listings", value: "342", icon: Store, color: "text-green-600", change: "+8%" },
    { label: "Questions", value: "1,234", icon: MessageSquare, color: "text-purple-600", change: "+15%" },
    { label: "Verifications", value: "89", icon: ShieldCheck, color: "text-amber-600", change: "+5%" }
  ];

  const recentActivities = [
    { type: "verification", user: "Ram Thapa", action: "approved", time: "2m ago" },
    { type: "report", user: "Post #1234", action: "flagged", time: "15m ago" },
    { type: "verification", user: "Sita Adhikari", action: "pending", time: "1h ago" },
    { type: "user", user: "New user registered", action: "created", time: "2h ago" }
  ];

  return (
    <div className="p-6 space-y-6 animate-in fade-in pb-32">
      <div>
        <h2 className="text-3xl font-black">Admin Dashboard</h2>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Platform Overview</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-opacity-10 rounded-2xl flex items-center justify-center ${stat.color.replace('text-', 'bg-')}`}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <span className="text-xs font-black text-green-600 flex items-center gap-1">
                <TrendingUp size={12} /> {stat.change}
              </span>
            </div>
            <p className="text-3xl font-black mb-1">{stat.value}</p>
            <p className="text-xs font-black text-gray-400 uppercase">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="font-black mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivities.map((activity, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-[#F8F5F2] rounded-xl">
              <div className="flex items-center gap-3">
                {activity.action === 'approved' && <CheckCircle size={18} className="text-green-600" />}
                {activity.action === 'flagged' && <AlertTriangle size={18} className="text-red-600" />}
                {activity.action === 'pending' && <X size={18} className="text-amber-600" />}
                {activity.action === 'created' && <Users size={18} className="text-blue-600" />}
                <div>
                  <p className="font-black text-sm">{activity.user}</p>
                  <p className="text-xs text-gray-400">{activity.action}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="font-black mb-4">Pending Verifications</h3>
          <div className="text-center py-8">
            <ShieldCheck size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="font-black text-2xl mb-1">12</p>
            <p className="text-xs text-gray-400">Awaiting review</p>
          </div>
          <Button variant="primary" className="w-full mt-4">
            Review Now
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-black mb-4">Flagged Content</h3>
          <div className="text-center py-8">
            <AlertTriangle size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="font-black text-2xl mb-1">5</p>
            <p className="text-xs text-gray-400">Requires attention</p>
          </div>
          <Button variant="outline" className="w-full mt-4">
            View Reports
          </Button>
        </Card>
      </div>
    </div>
  );
};

