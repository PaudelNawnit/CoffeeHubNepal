import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ArrowLeft } from 'lucide-react';
import type { Notice } from '@/services/notice.service';

interface NoticeCardProps {
  notice: Notice;
  onReadMore?: () => void;
}

export const NoticeCard = ({ notice, onReadMore }: NoticeCardProps) => (
  <Card className="p-6 border-l-8 border-[#3A7D44]">
    <div className="flex justify-between items-start mb-3">
      <Badge variant={notice.priority === 'High' ? 'alert' : 'primary'}>
        {notice.type}
      </Badge>
      <span className="text-[10px] font-bold text-gray-400 uppercase">
        {notice.date}
      </span>
    </div>
    <h4 className="font-black text-base mb-2">{notice.title}</h4>
    <p className="text-xs text-gray-600 leading-relaxed">{notice.body}</p>
    <button
      onClick={onReadMore}
      className="mt-4 text-[10px] font-black uppercase text-[#3A7D44] flex items-center gap-1"
    >
      Read Full Notice <ArrowLeft className="rotate-180" size={12} />
    </button>
  </Card>
);

