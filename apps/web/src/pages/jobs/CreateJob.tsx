import { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import { Textarea } from '@/components/common/Textarea';
import { useAuth } from '@/context/AuthContext';
import { jobService } from '@/services/job.service';
import { useApp } from '@/context/AppContext';
import { t } from '@/i18n';

interface CreateJobProps {
  onBack: () => void;
  onSubmit?: (job: any) => void;
}

export const CreateJob = ({ onBack, onSubmit }: CreateJobProps) => {
  const { user } = useAuth();
  const { language } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    farm: '',
    location: '',
    pay: '',
    type: 'Full-time',
    description: '',
    requirements: '',
    benefits: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const jobTypes = ['Full-time', 'Part-time', 'Seasonal', 'Contract'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id && !user?.mongoId) {
      setError('Please log in to post a job');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const jobData = {
        ...formData,
        createdBy: user.mongoId || user.id.toString()
      };
      
      const createdJob = await jobService.createJob(jobData);
      onSubmit?.(createdJob);
      onBack();
    } catch (err: any) {
      setError(err.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F2] pb-32">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-[#6F4E37]">{t(language, 'jobs.postJob')}</h2>
      </div>

      <div className="p-6">
        <Card className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              label="Job Title"
              placeholder="e.g. Seasonal Berry Pickers"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              maxLength={200}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                label="Farm/Company Name"
                placeholder="Everest Coffee Estate"
                value={formData.farm}
                onChange={(e) => setFormData({ ...formData, farm: e.target.value })}
                maxLength={200}
                required
              />

              <div>
                <label className="block text-xs font-black text-gray-600 mb-2 uppercase tracking-tight">
                  Job Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-white border border-[#EBE3D5] rounded-xl px-4 py-3 outline-none focus:ring-2 ring-[#6F4E37]/10 text-sm"
                >
                  {jobTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                label="Location"
                placeholder="Kaski, Nepal"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                maxLength={200}
                required
              />

              <Input
                type="text"
                label="Salary/Pay"
                placeholder="Rs. 800/day"
                value={formData.pay}
                onChange={(e) => setFormData({ ...formData, pay: e.target.value })}
                maxLength={200}
                required
              />
            </div>

            <Textarea
              label="Job Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the job role and responsibilities..."
              className="min-h-[120px]"
              maxLength={3000}
              required
            />

            <Textarea
              label="Requirements"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="List the required qualifications and skills..."
              className="min-h-[100px]"
              maxLength={2000}
            />

            <Textarea
              label="Benefits"
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              placeholder="List any benefits or perks..."
              className="min-h-[100px]"
              maxLength={2000}
            />

            <div className="flex gap-3">
              <Button variant="outline" type="button" onClick={onBack} className="flex-1">
                {t(language, 'jobs.cancel')}
              </Button>
              <Button variant="primary" type="submit" className="flex-1" disabled={loading}>
                <Send size={16} /> {loading ? t(language, 'common.loading') : t(language, 'jobs.postJob')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

