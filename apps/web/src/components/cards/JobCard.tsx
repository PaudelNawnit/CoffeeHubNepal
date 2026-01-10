import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { MapPin } from 'lucide-react';
import { Job } from '@/services/job.service';

interface JobCardProps {
  job: Job;
  onApply?: () => void;
}

export const JobCard = ({ job, onApply }: JobCardProps) => (
  <Card className="p-6">
    <div className="flex justify-between items-start mb-4">
      <div className="flex gap-4">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-gray-400">
          CB
        </div>
        <div>
          <h4 className="font-black text-base">{job.title}</h4>
          <p className="text-xs text-[#3A7D44] font-bold">{job.farm}</p>
        </div>
      </div>
      <Badge>{job.type}</Badge>
    </div>
    <div className="flex justify-between items-center bg-[#F8F5F2] p-4 rounded-2xl">
      <div className="flex items-center gap-1 text-gray-500 font-bold text-xs">
        <MapPin size={12}/> {job.location}
      </div>
      <div className="font-black text-sm text-[#6F4E37]">{job.pay}</div>
    </div>
    <Button variant="secondary" className="w-full mt-4 py-3" onClick={onApply}>
      Apply Now
    </Button>
  </Card>
);

