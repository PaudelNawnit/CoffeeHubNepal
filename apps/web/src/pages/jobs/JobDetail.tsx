import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Briefcase, Phone, Mail, CheckCircle, User, Check, X } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { jobService, Application, Job } from '@/services/job.service';
import { t } from '@/i18n';

interface JobDetailProps {
  jobId: string;
  onBack: () => void;
  onApply?: () => void;
}

export const JobDetail = ({ jobId, onBack, onApply }: JobDetailProps) => {
  const { user } = useAuth();
  const { language, setSubPage } = useApp();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobLoading, setJobLoading] = useState(true);
  const [processingApp, setProcessingApp] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    setJobLoading(true);
    try {
      const jobData = await jobService.getJob(jobId);
      setJob(jobData);
    } catch (error) {
      console.error('Failed to load job:', error);
      setJob(null);
    } finally {
      setJobLoading(false);
    }
  };

  const isJobCreator = user && job && (user.mongoId === job.createdBy || user.id?.toString() === job.createdBy);

  useEffect(() => {
    if (isJobCreator && jobId) {
      loadApplications();
    }
  }, [jobId, isJobCreator]);

  const loadApplications = async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const apps = await jobService.getApplications(jobId);
      setApplications(apps);
    } catch (error) {
      console.error('Failed to load applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (applicationId: string) => {
    if (!jobId) return;
    setProcessingApp(applicationId);
    try {
      await jobService.acceptApplication(jobId, applicationId);
      // Update local state
      setApplications(prev => prev.map(app => 
        (app._id || app.id) === applicationId ? { ...app, status: 'accepted' as const } : app
      ));
    } catch (error) {
      console.error('Failed to accept application:', error);
    } finally {
      setProcessingApp(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!jobId) return;
    setProcessingApp(applicationId);
    try {
      await jobService.rejectApplication(jobId, applicationId);
      // Update local state
      setApplications(prev => prev.map(app => 
        (app._id || app.id) === applicationId ? { ...app, status: 'rejected' as const } : app
      ));
    } catch (error) {
      console.error('Failed to reject application:', error);
    } finally {
      setProcessingApp(null);
    }
  };

  const getStatusBadgeVariant = (status: string): 'primary' | 'success' | 'alert' | 'ai' => {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'alert';
      default: return 'primary';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleApply = async () => {
    if (!user || !job || !jobId) {
      setApplyError('Please log in to apply for this job');
      setTimeout(() => {
        setSubPage('login');
      }, 1500);
      return;
    }

    setApplying(true);
    setApplyError(null);
    setApplySuccess(false);

    try {
      await jobService.applyToJob(jobId, {
        message: `Application for ${job.title} at ${job.farm}`
      });
      
      setApplySuccess(true);
      // Reload applications if user is job creator
      if (isJobCreator) {
        loadApplications();
      }
      // Call the optional onApply callback if provided
      onApply?.();
    } catch (error: any) {
      setApplyError(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (jobLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] pb-32 flex items-center justify-center">
        <p className="text-gray-500">Loading job...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] pb-32 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Job not found</p>
          <Button onClick={onBack}>Go Back</Button>
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
        <h2 className="text-lg font-black text-[#6F4E37]">{t(language, 'jobs.jobDetails')}</h2>
      </div>

      <div className="p-6 space-y-6">
        <Card className="p-8">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#6F4E37] to-[#3A7D44] rounded-3xl flex items-center justify-center text-white font-black text-2xl">
              {job.farm.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-black">{job.title}</h1>
                <CheckCircle size={20} className="text-blue-500" fill="currentColor" />
              </div>
              <p className="text-lg text-[#3A7D44] font-bold mb-3">{job.farm}</p>
              <Badge>{job.type}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#F8F5F2] p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <MapPin size={14} />
                <span className="text-xs font-bold uppercase">{t(language, 'marketplace.location')}</span>
              </div>
              <p className="font-black text-sm">{job.location}</p>
            </div>
            <div className="bg-[#F8F5F2] p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Briefcase size={14} />
                <span className="text-xs font-bold uppercase">Salary</span>
              </div>
              <p className="font-black text-sm text-[#6F4E37]">{job.pay}</p>
            </div>
          </div>

          <div className="border-t border-[#EBE3D5] pt-6 space-y-4">
            <div>
              <h3 className="font-black mb-3">Job Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {job.description || `We are looking for experienced ${job.title.toLowerCase()} to join our team at ${job.farm}. This position requires hands-on experience in coffee farming and processing.`}
              </p>
            </div>

            {job.requirements && (
              <div>
                <h3 className="font-black mb-3">Requirements</h3>
                <ul className="space-y-2 text-gray-700">
                  {job.requirements.split(',').map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#3A7D44] mt-1">•</span>
                      <span>{req.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.benefits && (
              <div>
                <h3 className="font-black mb-3">Benefits</h3>
                <ul className="space-y-2 text-gray-700">
                  {job.benefits.split(',').map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#3A7D44] mt-1">•</span>
                      <span>{benefit.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-black mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F5EFE6] rounded-xl flex items-center justify-center">
                <Phone size={18} className="text-[#6F4E37]" />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase">Phone</p>
                <p className="font-black">+977 9800000000</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F5EFE6] rounded-xl flex items-center justify-center">
                <Mail size={18} className="text-[#6F4E37]" />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase">Email</p>
                <p className="font-black">jobs@{job.farm.toLowerCase().replace(/\s+/g, '')}.com</p>
              </div>
            </div>
          </div>
        </Card>

        {isJobCreator ? (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black">{t(language, 'jobs.applications')}</h3>
              <Badge variant="primary">{applications.length}</Badge>
            </div>
            
            {loading ? (
              <p className="text-gray-500 text-center py-4">{t(language, 'common.loading')}</p>
            ) : applications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">{t(language, 'jobs.noApplications')}</p>
            ) : (
              <div className="space-y-4">
                {applications.map(application => {
                  const appId = application._id || application.id || '';
                  return (
                  <div key={appId} className="border border-[#EBE3D5] rounded-xl p-4 bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 bg-[#F5EFE6] rounded-xl flex items-center justify-center">
                          <User size={20} className="text-[#6F4E37]" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-base mb-1">{application.applicantName}</h4>
                          <p className="text-sm text-gray-600 mb-2">{application.applicantEmail}</p>
                          {application.applicantPhone && (
                            <p className="text-xs text-gray-500">{application.applicantPhone}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            {t(language, 'jobs.appliedAt')}: {formatDate(application.appliedAt)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(application.status)}>
                        {t(language, `jobs.${application.status}`)}
                      </Badge>
                    </div>

                    {application.message && (
                      <div className="bg-[#F8F5F2] rounded-xl p-3 mb-3">
                        <p className="text-sm text-gray-700">{application.message}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {application.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            className="flex-1 text-green-600 border-green-600"
                            onClick={() => handleAccept(appId)}
                            disabled={processingApp === appId}
                          >
                            <Check size={14} /> {t(language, 'jobs.accept')}
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 text-red-600 border-red-600"
                            onClick={() => handleReject(appId)}
                            disabled={processingApp === appId}
                          >
                            <X size={14} /> {t(language, 'jobs.reject')}
                          </Button>
                        </>
                      )}
                      {application.applicantPhone && (
                        <Button
                          variant="outline"
                          className="px-3"
                          onClick={() => window.location.href = `tel:${application.applicantPhone}`}
                        >
                          <Phone size={14} />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="px-3"
                        onClick={() => window.location.href = `mailto:${application.applicantEmail}`}
                      >
                        <Mail size={14} />
                      </Button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </Card>
        ) : (
          <>
            {applyError && (
              <Card className="p-4 bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm">{applyError}</p>
              </Card>
            )}
            {applySuccess && (
              <Card className="p-4 bg-green-50 border border-green-200">
                <p className="text-green-600 text-sm font-bold">
                  {t(language, 'jobs.applicationSubmitted')}
                </p>
              </Card>
            )}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => window.location.href = 'tel:+9779800000000'}>
                <Phone size={18} /> {t(language, 'jobs.callNow')}
              </Button>
              <Button 
                variant="primary" 
                className="flex-1" 
                onClick={handleApply}
                disabled={applying || applySuccess}
              >
                {applying ? t(language, 'common.loading') : applySuccess ? 'Applied ✓' : t(language, 'jobs.applyNow')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
