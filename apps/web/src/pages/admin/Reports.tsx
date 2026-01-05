import { ArrowLeft, AlertTriangle, Eye, Ban, CheckCircle } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';

const MOCK_REPORTS = [
  {
    id: 1,
    type: "Spam",
    content: "Listing #1234",
    reporter: "User A",
    reported: "User B",
    reason: "Fake product listing",
    status: "pending",
    time: "2h ago"
  },
  {
    id: 2,
    type: "Inappropriate",
    content: "Question #567",
    reporter: "User C",
    reported: "User D",
    reason: "Offensive language",
    status: "reviewed",
    time: "1 day ago"
  },
  {
    id: 3,
    type: "Fraud",
    content: "User Profile",
    reporter: "User E",
    reported: "User F",
    reason: "Suspicious activity",
    status: "pending",
    time: "3h ago"
  }
];

export const Reports = () => {
  const handleAction = (id: number, action: string) => {
    console.log(action, id);
  };

  return (
    <div className="min-h-screen bg-[#F8F5F2] pb-32">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 py-4 flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-[#6F4E37]">Reports</h2>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-full bg-[#6F4E37] text-white text-xs font-black">
            Pending (5)
          </button>
          <button className="px-4 py-2 rounded-full bg-white border border-[#EBE3D5] text-gray-600 text-xs font-black">
            Reviewed (23)
          </button>
        </div>

        {MOCK_REPORTS.map(report => (
          <Card key={report.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  report.type === 'Spam' ? 'bg-red-100 text-red-600' :
                  report.type === 'Fraud' ? 'bg-orange-100 text-orange-600' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <Badge variant={report.type === 'Spam' ? 'alert' : 'primary'} className="mb-1">
                    {report.type}
                  </Badge>
                  <p className="font-black text-sm">{report.content}</p>
                </div>
              </div>
              <Badge variant={report.status === 'pending' ? 'alert' : 'success'}>
                {report.status}
              </Badge>
            </div>

            <div className="bg-[#F8F5F2] p-4 rounded-xl mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Reporter:</span>
                <span className="font-black">{report.reporter}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Reported:</span>
                <span className="font-black">{report.reported}</span>
              </div>
              <div className="pt-2 border-t border-[#EBE3D5]">
                <p className="text-xs font-black text-gray-400 uppercase mb-1">Reason</p>
                <p className="text-sm text-gray-700">{report.reason}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => handleAction(report.id, 'view')}>
                <Eye size={16} /> View
              </Button>
              {report.status === 'pending' && (
                <>
                  <Button variant="outline" className="flex-1" onClick={() => handleAction(report.id, 'dismiss')}>
                    <CheckCircle size={16} /> Dismiss
                  </Button>
                  <Button variant="primary" className="flex-1" onClick={() => handleAction(report.id, 'ban')}>
                    <Ban size={16} /> Take Action
                  </Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

