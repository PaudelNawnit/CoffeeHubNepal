import { useState, useEffect } from 'react';
import { ArrowLeft, Home, Briefcase } from 'lucide-react';
import { JobCard } from '@/components/cards/JobCard';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { jobService, Job } from '@/services/job.service';
import { t } from '@/i18n';

export const Jobs = () => {
  const { navigate, setCurrentPage, language } = useApp();
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await jobService.getJobs({ limit: 100 });
      setJobs(result.jobs);
    } catch (err: any) {
      console.error('Failed to load jobs:', err);
      setError(err.message || 'Failed to load jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleJobClick = (id: string | number | undefined) => {
    if (!id) return;
    const jobId = typeof id === 'string' ? id : id.toString();
    sessionStorage.setItem('jobDetailId', jobId);
    navigate('job-detail', 0);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in pb-32 lg:pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCurrentPage('home')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-black">{t(language, 'jobs.title')}</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t(language, 'jobs.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <Button 
              variant="outline" 
              className="text-xs px-3"
              onClick={() => navigate('my-jobs')}
            >
              <Briefcase size={14} /> {t(language, 'jobs.myJobs')}
            </Button>
          )}
          <Button 
            variant="outline" 
            className="p-2 rounded-xl"
            onClick={() => setCurrentPage('home')}
          >
            <Home size={18} />
          </Button>
        </div>
      </div>
      
      {loading && (
        <div className="text-center py-8 text-gray-500">Loading jobs...</div>
      )}
      
      {error && (
        <div className="text-center py-8 text-red-500">{error}</div>
      )}
      
      {!loading && !error && jobs.length === 0 && (
        <div className="text-center py-8 text-gray-500">No jobs available</div>
      )}
      
      {!loading && !error && (
        <div className="space-y-4">
          {jobs.map(job => (
            <JobCard 
              key={job._id || job.id} 
              job={job} 
              onApply={() => handleJobClick(job._id || job.id || '')} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

