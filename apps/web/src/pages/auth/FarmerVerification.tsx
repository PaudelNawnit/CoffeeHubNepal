import { useState, useRef } from 'react';
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
    organizationName: '',
    roleDescription: '',
    location: '',
    yearsOfExperience: '',
    certification: '',
    documents: [] as File[]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const maxSizeBytes = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

      const validFiles: File[] = [];
      for (const file of Array.from(files)) {
        if (file.size > maxSizeBytes) {
          // Skip oversized files
          // You could replace this with a toast or inline error UI if desired
          console.warn(`Skipping file ${file.name}: larger than 5MB`);
          continue;
        }
        if (!allowedTypes.includes(file.type)) {
          console.warn(`Skipping file ${file.name}: unsupported type ${file.type}`);
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        setFormData((prev) => ({
          ...prev,
          documents: [...prev.documents, ...validFiles]
        }));
      }
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files) {
      setFormData({
        ...formData,
        documents: [...formData.documents, ...Array.from(files)]
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
          <h1 className="text-3xl font-black text-[#6F4E37] mb-2">Account Verification</h1>
          <p className="text-sm text-gray-600">
            Tell us more about how you participate in the coffee ecosystem so we can verify your account.
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              label="Organization / Business Name"
              placeholder="e.g. Everest Coffee, Local Co-op"
              value={formData.organizationName}
              onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
              required
            />

            <Input
              type="text"
              label="Your Role or Activity"
              placeholder="e.g. Farmer, Roaster, Trader, Exporter, Expert"
              value={formData.roleDescription}
              onChange={(e) => setFormData({ ...formData, roleDescription: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                label="Location"
                placeholder="e.g. Kaski, Gandaki Province"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />

              <Input
                type="text"
                label="Years of Experience"
                placeholder="e.g. 5"
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                required
              />
            </div>

            <Input
              type="text"
              label="Relevant Certifications (optional)"
              placeholder="e.g. Organic, Fair Trade, training programs"
              value={formData.certification}
              onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
            />

            <div>
              <label className="block text-xs font-black text-gray-600 mb-3 uppercase tracking-tight">
                Upload Documents
              </label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-[#6F4E37] bg-[#6F4E37]/5'
                    : 'border-[#EBE3D5] bg-gray-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {isDragging ? (
                  <>
                    <Upload className="mx-auto mb-3 text-[#6F4E37]" size={32} />
                    <p className="text-xs font-black text-[#6F4E37] mb-2">Drop files here</p>
                  </>
                ) : (
                  <>
                    <Upload className="mx-auto mb-3 text-gray-400" size={32} />
                    <p className="text-xs font-black text-gray-500 mb-2">Upload land ownership, ID, business registration, or certificates</p>
                    <p className="text-xs text-gray-400 mb-3">Drag and drop files here or use the button below</p>
                    <Button
                      variant="outline"
                      type="button"
                      className="text-xs"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      Choose Files
                    </Button>
                  </>
                )}
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

