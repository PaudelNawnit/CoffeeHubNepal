import { useState } from 'react';
import { ArrowLeft, Upload, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';

interface FarmerVerificationProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

export const FarmerVerification = ({ onBack, onSuccess }: FarmerVerificationProps) => {
  const [formData, setFormData] = useState({
    farmName: '',
    farmSize: '',
    location: '',
    yearsOfExperience: '',
    certification: '',
    documents: [] as File[]
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        documents: [...formData.documents, ...Array.from(e.target.files)]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate verification submission
    setTimeout(() => {
      setIsLoading(false);
      onSuccess?.();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8F5F2] p-6 pb-32">
      {onBack && (
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-600">
          <ArrowLeft size={20} />
          <span className="text-sm font-bold">Back</span>
        </button>
      )}

      <div className="max-w-2xl mx-auto mt-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#3A7D44] to-[#6F4E37] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <CheckCircle className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-black text-[#6F4E37] mb-2">Farmer Verification</h1>
          <p className="text-sm text-gray-600">Get verified to build trust in the community</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              label="Farm Name"
              placeholder="Everest Coffee Estate"
              value={formData.farmName}
              onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                label="Farm Size (hectares)"
                placeholder="2.5"
                value={formData.farmSize}
                onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                required
              />

              <Input
                type="text"
                label="Years of Experience"
                placeholder="10"
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                required
              />
            </div>

            <Input
              type="text"
              label="Farm Location"
              placeholder="Kaski, Gandaki Province"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />

            <Input
              type="text"
              label="Certifications (if any)"
              placeholder="Organic, Fair Trade, etc."
              value={formData.certification}
              onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
            />

            <div>
              <label className="block text-xs font-black text-gray-600 mb-3 uppercase tracking-tight">
                Upload Documents
              </label>
              <div className="border-2 border-dashed border-[#EBE3D5] rounded-2xl p-8 text-center">
                <Upload className="mx-auto mb-3 text-gray-400" size={32} />
                <p className="text-xs font-black text-gray-500 mb-2">Upload land ownership, ID, or certificates</p>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" type="button" className="text-xs">
                    Choose Files
                  </Button>
                </label>
              </div>

              {formData.documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.documents.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-[#F5EFE6] p-3 rounded-xl">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[#6F4E37]" />
                        <span className="text-xs font-bold text-gray-700">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newDocs = formData.documents.filter((_, i) => i !== idx);
                          setFormData({ ...formData, documents: newDocs });
                        }}
                        className="text-red-500 text-xs font-black"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong className="font-black">Note:</strong> Verification typically takes 2-3 business days. 
                You'll receive a notification once your application is reviewed.
              </p>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full py-4"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit for Verification'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

