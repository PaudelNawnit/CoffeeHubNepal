import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Eye } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Job, jobService } from '@/services/job.service';
import { t } from '@/i18n';

export const MyJobs = () => {
  const { setSubPage, navigate, language } = useApp();
  const { user } = useAuth();
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applicationCounts, setApplicationCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadMyJobs();
  }, [user]);

  const loadMyJobs = async () => {
    setLoading(true);
    try {
      if (user?.mongoId || user?.id) {
        const userId = user.mongoId || user.id.toString();
        const jobs = await jobService.getMyJobs(userId);
        setMyJobs(jobs);

        // Load application counts for each job
        const counts: Record<string, number> = {};
        for (const job of jobs) {
          try {
            const jobId = job._id || job.id || '';
            if (jobId) {
              const applications = await jobService.getApplications(jobId);
              counts[jobId] = applications.length;
            }
          } catch (error) {
            console.error(`Failed to load applications for job ${job._id || job.id}:`, error);
            counts[job._id || job.id || ''] = 0;
          }
        }
        setApplicationCounts(counts);
      } else {
        setMyJobs([]);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
      setMyJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (jobId: string) => {
    sessionStorage.setItem('jobDetailId', jobId);
    navigate('job-detail', 0);
  };

  return (
    <div className="min-h-screen bg-[#F8F5F2] pb-32">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 py-4 flex items-center gap-4">
        <button onClick={() => setSubPage(null)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-[#6F4E37] flex-1">{t(language, 'jobs.myJobs')}</h2>
        <Button 
          variant="primary" 
          className="text-xs px-3"
          onClick={() => navigate('create-job')}
        >
          <Plus size={14} /> {t(language, 'nav.createNew')}
        </Button>
      </div>

      <div className="p-6 space-y-4">
        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">{t(language, 'common.loading')}</p>
          </Card>
        ) : myJobs.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 mb-4">{t(language, 'jobs.noJobsYet')}</p>
            <Button variant="primary" onClick={() => navigate('create-job')}>
              <Plus size={16} /> {t(language, 'jobs.createFirstJob')}
            </Button>
          </Card>
        ) : (
          myJobs.map(job => {
            const jobId = job._id || job.id || '';
            return (
            <Card key={jobId} className="overflow-hidden">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-[#6F4E37] to-[#3A7D44] rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0">
                  {job.farm.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 py-2">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-black text-base mb-1">{job.title}</h3>
                      <p className="text-sm text-[#3A7D44] font-bold">{job.farm}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge>{job.type}</Badge>
                      {applicationCounts[jobId] !== undefined && (
                        <Badge variant="primary" className="text-xs">
                          {applicationCounts[jobId]} {t(language, 'jobs.applicationCount')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                    <span>{job.location}</span>
                    <span>•</span>
                    <span className="text-[#6F4E37] font-black">{job.pay}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full text-xs py-2" 
                    onClick={() => handleJobClick(jobId)}
                  >
                    <Eye size={14} /> {t(language, 'jobs.viewApplications')}
                  </Button>
                </div>
              </div>
            </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

