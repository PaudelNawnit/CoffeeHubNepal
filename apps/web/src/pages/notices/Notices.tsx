import { useEffect, useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { NoticeCard } from '@/components/cards/NoticeCard';
import { useApp } from '@/context/AppContext';
import { noticeService, type Notice } from '@/services/notice.service';

export const Notices = () => {
  const { navigate } = useApp();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const data = await noticeService.getNotices();
        setNotices(data);
      } catch (error) {
        console.error('Failed to load notices:', error);
        setNotices([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotices();
  }, []);
  
  const handleNoticeClick = (id: string) => {
    // Store underlying blog post ID and use subPage navigation (similar to blog detail)
    try {
      window.sessionStorage.setItem('noticeDetailId', id);
    } catch {
      // ignore storage errors
    }
    navigate('notice-detail', 0);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 pb-32 lg:pb-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black">Official Alerts</h2>
        <Button variant="outline" className="text-xs px-3">
          <Filter size={14}/> Sort
        </Button>
      </div>
      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-gray-500">Loading alerts...</p>
        ) : notices.length === 0 ? (
          <p className="text-sm text-gray-500">No official alerts have been posted yet.</p>
        ) : (
          notices.map(notice => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              onReadMore={() => handleNoticeClick(notice.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

