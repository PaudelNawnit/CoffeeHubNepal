import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, MapPin, FileText, ExternalLink } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { noticeService, type Notice } from '@/services/notice.service';

interface NoticeDetailProps {
  noticeId: string;
  onBack: () => void;
}

export const NoticeDetail = ({ noticeId, onBack }: NoticeDetailProps) => {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        let id = noticeId;
        if (!id) {
          try {
            id = window.sessionStorage.getItem('noticeDetailId') || '';
          } catch {
            id = '';
          }
        }

        if (!id) {
          setNotice(null);
          return;
        }

        const data = await noticeService.getNotice(id);
        setNotice(data);
      } catch (e) {
        console.error('Failed to load notice:', e);
        setNotice(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [noticeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] pb-32">
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-black text-[#6F4E37]">Notice Details</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500">Loading notice...</p>
        </div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] pb-32">
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-black text-[#6F4E37]">Notice Details</h2>
        </div>
        <div className="p-6">
          <Card className="p-6">
            <p className="text-sm text-gray-600">This notice could not be found.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F2] pb-32">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-[#6F4E37]">Notice Details</h2>
      </div>

      <div className="p-6">
        <Card className="p-8 border-l-8 border-[#3A7D44]">
          <div className="flex justify-between items-start mb-6">
            <Badge variant={notice.priority === 'High' ? 'alert' : 'primary'}>
              {notice.type}
            </Badge>
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar size={14} />
              <span className="text-xs font-bold">{notice.date}</span>
            </div>
          </div>

          <h1 className="text-3xl font-black mb-6">{notice.title}</h1>

          <div className="prose prose-sm max-w-none mb-8">
            <p className="text-gray-700 leading-relaxed text-base mb-4">{notice.body}</p>

            <div className="bg-[#F5EFE6] p-6 rounded-2xl mb-6">
              <h3 className="font-black text-sm mb-3 uppercase tracking-tight">
                Full Notice Content
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">{notice.body}</p>
            </div>

            {(notice.location || notice.deadline) && (
              <div className="space-y-3">
                {notice.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin size={16} className="text-[#3A7D44]" />
                    <span className="font-bold">Applicable Region:</span>
                    <span className="text-gray-700">{notice.location}</span>
                  </div>
                )}
                {notice.deadline && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={16} className="text-[#3A7D44]" />
                    <span className="font-bold">Deadline:</span>
                    <span className="text-gray-700">{notice.deadline}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" disabled>
              <FileText size={16} /> Download PDF
            </Button>
            <Button variant="primary" className="flex-1" disabled>
              <ExternalLink size={16} /> View Official Link
            </Button>
          </div>
        </Card>

        <Card className="p-6 mt-6">
          <h3 className="font-black mb-4">Related Notices</h3>
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              More related alerts will appear here as the system is extended.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

