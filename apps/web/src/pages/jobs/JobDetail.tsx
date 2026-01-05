import { ArrowLeft, MapPin, Briefcase, Phone, Mail, CheckCircle } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { MOCK_JOBS } from '@/utils/mockData';

interface JobDetailProps {
  jobId: number;
  onBack: () => void;
  onApply?: () => void;
}

export const JobDetail = ({ jobId, onBack, onApply }: JobDetailProps) => {
  const job = MOCK_JOBS.find(j => j.id === jobId) || MOCK_JOBS[0];

  return (
    <div className="min-h-screen bg-[#F8F5F2] pb-32">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-[#6F4E37]">Job Details</h2>
      </div>

      <div className="p-6 space-y-6">
        <Card className="p-8">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#6F4E37] to-[#3A7D44] rounded-3xl flex items-center justify-center text-white font-black text-2xl">
              CB
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
                <span className="text-xs font-bold uppercase">Location</span>
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
                We are looking for experienced {job.title.toLowerCase()} to join our team at {job.farm}. 
                This position requires hands-on experience in coffee farming and processing. 
                The ideal candidate should have at least 2 years of experience in the coffee industry.
              </p>
            </div>

            <div>
              <h3 className="font-black mb-3">Requirements</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#3A7D44] mt-1">•</span>
                  <span>Minimum 2 years of experience in coffee farming</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3A7D44] mt-1">•</span>
                  <span>Physical fitness for field work</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3A7D44] mt-1">•</span>
                  <span>Knowledge of organic farming practices preferred</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3A7D44] mt-1">•</span>
                  <span>Ability to work in team environment</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-black mb-3">Benefits</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#3A7D44] mt-1">•</span>
                  <span>Competitive salary package</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3A7D44] mt-1">•</span>
                  <span>Accommodation provided</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3A7D44] mt-1">•</span>
                  <span>Training and skill development opportunities</span>
                </li>
              </ul>
            </div>
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

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => window.location.href = 'tel:+9779800000000'}>
            <Phone size={18} /> Call Now
          </Button>
          <Button variant="primary" className="flex-1" onClick={onApply}>
            Apply Now
          </Button>
        </div>
      </div>
    </div>
  );
};

