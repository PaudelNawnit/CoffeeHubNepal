import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Textarea } from '@/components/common/Textarea';
import { reportService, ReportType } from '@/services/report.service';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
  onSuccess?: () => void;
}

export const ReportModal = ({ isOpen, onClose, postId, postTitle, onSuccess }: ReportModalProps) => {
  const [reason, setReason] = useState('');
  const [type, setType] = useState<ReportType>('spam');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for reporting');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await reportService.reportPost(postId, { reason, type });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setReason('');
        setType('spam');
        onSuccess?.();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <h3 className="text-lg font-black">Report Post</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Reporting: <span className="font-bold">{postTitle}</span>
        </p>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-green-600" size={32} />
            </div>
            <p className="font-black text-green-700">Report submitted successfully!</p>
            <p className="text-sm text-gray-600 mt-2">Thank you for helping keep our community safe.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ReportType)}
                className="w-full px-4 py-2 border border-[#EBE3D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6F4E37]"
              >
                <option value="spam">Spam</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="fraud">Fraud</option>
                <option value="harassment">Harassment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Reason
              </label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please describe why you're reporting this post..."
                rows={4}
                className="resize-none px-4 py-2"
                maxLength={500}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

