import { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import { Textarea } from '@/components/common/Textarea';

interface CreateNoticeProps {
  onBack: () => void;
  onSubmit?: (notice: any) => void;
}

export const CreateNotice = ({ onBack, onSubmit }: CreateNoticeProps) => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'Training',
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
    location: '',
    deadline: ''
  });

  const noticeTypes = ['Training', 'Govt', 'Event', 'Alert', 'Other'];
  const priorities = ['High', 'Medium', 'Low'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onBack();
  };

  return (
    <div className="min-h-screen bg-[#F8F5F2] pb-32">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-[#6F4E37]">Post Notice</h2>
      </div>

      <div className="p-6">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              label="Notice Title"
              placeholder="e.g. Monsoon Harvest Training"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              maxLength={200}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-600 mb-2 uppercase tracking-tight">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-white border border-[#EBE3D5] rounded-xl px-4 py-3 outline-none focus:ring-2 ring-[#6F4E37]/10 text-sm"
                >
                  {noticeTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-600 mb-2 uppercase tracking-tight">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'High' | 'Medium' | 'Low' })}
                  className="w-full bg-white border border-[#EBE3D5] rounded-xl px-4 py-3 outline-none focus:ring-2 ring-[#6F4E37]/10 text-sm"
                >
                  {priorities.map(pri => (
                    <option key={pri} value={pri}>{pri}</option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              type="text"
              label="Location"
              placeholder="e.g. Kaski, Nepal"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              maxLength={200}
            />

            <Input
              type="date"
              label="Deadline (if applicable)"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />

            <Textarea
              label="Notice Content"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Write your notice details here..."
              className="min-h-[200px]"
              maxLength={2000}
              required
            />

            <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-2xl">
              <p className="text-xs text-yellow-800">
                <strong className="font-black">Note:</strong> Notices are subject to moderation. 
                Only verified users can post official notices.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" type="button" onClick={onBack} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="flex-1">
                <Send size={16} /> Post Notice
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

