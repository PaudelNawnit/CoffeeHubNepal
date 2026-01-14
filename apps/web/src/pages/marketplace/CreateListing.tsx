import { useState, useRef } from 'react';
import { ArrowLeft, Camera, X, Upload } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import { Textarea } from '@/components/common/Textarea';
import { compressImage } from '@/utils/imageCompression';
import { marketplaceService } from '@/services/marketplace.service';
import { useAuth } from '@/context/AuthContext';

interface CreateListingProps {
  onBack: () => void;
  onSubmit?: (listing: any) => void;
}

export const CreateListing = ({ onBack, onSubmit }: CreateListingProps) => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    quantity: '',
    unit: 'kg',
    category: 'Arabica',
    location: '',
    images: [] as string[]
  });
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['Arabica', 'Robusta', 'Gear', 'Equipment', 'Other'];
  const units = ['kg', 'pc', 'bag', 'ton'];

  const handleImageUpload = async (file: File) => {
    // Limit to 5 images max
    if (formData.images.length >= 5) {
      alert('Maximum 5 images allowed per listing');
      return;
    }

    // Validate file type - only allow safe image formats
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPG, PNG or WebP images are allowed');
      return;
    }

    // Validate file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      // Compress image (1920x1920 max, quality 0.8, max 1MB per image)
      const compressedDataUrl = await compressImage(file, 1920, 1920, 0.8, 1000);
      
      // Check final size (max 1MB per compressed image)
      const base64Size = (compressedDataUrl.length * 3) / 4;
      if (base64Size > 1024 * 1024) {
        alert('Image is too large even after compression. Please use a smaller image.');
        setUploading(false);
        return;
      }

      setFormData({
        ...formData,
        images: [...formData.images, compressedDataUrl]
      });
    } catch (error: any) {
      console.error('Image compression error:', error);
      alert(error.message || 'Failed to process image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Process up to 5 images or remaining slots
      const remainingSlots = 5 - formData.images.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      
      for (const file of filesToProcess) {
        await handleImageUpload(file);
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files) {
      const remainingSlots = 5 - formData.images.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      
      for (const file of filesToProcess) {
        await handleImageUpload(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Please log in to create a listing');
      return;
    }

    // Validate required fields
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Valid price is required');
      return;
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      setError('Valid quantity is required');
      return;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const listingData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        category: formData.category,
        location: formData.location.trim(),
        images: formData.images
      };

      console.log('[CreateListing] Submitting listing data:', listingData);
      const result = await marketplaceService.createListing(listingData);
      console.log('[CreateListing] Listing created successfully:', result);
      
      // Call optional onSubmit callback if provided
      onSubmit?.(result);
      
      // Navigate back on success
      onBack();
    } catch (err: any) {
      console.error('Failed to create listing:', err);
      setError(err.message || 'Failed to create listing. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F2] pb-32 lg:pb-8">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 lg:px-8 py-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-[#6F4E37]">Create Listing</h2>
      </div>

      <div className="p-6 lg:p-8">
        <Card className="p-6 lg:max-w-3xl lg:mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-600 mb-3 uppercase tracking-tight">
                Photos (Max 5)
              </label>
              {formData.images.length === 0 ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    isDragging
                      ? 'border-[#6F4E37] bg-[#6F4E37]/5'
                      : 'border-[#EBE3D5] bg-gray-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {isDragging ? (
                    <>
                      <Upload size={48} className="mx-auto mb-3 text-[#6F4E37]" />
                      <p className="text-sm font-bold text-[#6F4E37]">Drop images here</p>
                    </>
                  ) : (
                    <>
                      <Upload size={48} className="mx-auto mb-3 text-gray-400" />
                      <p className="text-sm font-bold text-gray-700 mb-1">Drag and drop images here</p>
                      <p className="text-xs text-gray-500 mb-4">or click to browse (Max 5 images, 10MB each)</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        <Camera size={16} className="mr-2" />
                        Choose Images
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden">
                      <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            images: formData.images.filter((_, i) => i !== idx)
                          });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {formData.images.length < 5 && (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
                        isDragging
                          ? 'border-[#6F4E37] bg-[#6F4E37]/5'
                          : 'border-[#EBE3D5] hover:border-[#6F4E37] bg-gray-50'
                      } ${uploading ? 'opacity-50' : ''}`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      {isDragging ? (
                        <>
                          <Upload size={24} className="text-[#6F4E37] mb-2" />
                          <span className="text-xs font-bold text-[#6F4E37]">Drop here</span>
                        </>
                      ) : (
                        <>
                          <Camera size={24} className="text-gray-400 mb-2" />
                          <span className="text-xs text-gray-500 text-center px-2">
                            {uploading ? 'Uploading...' : 'Click or drag'}
                          </span>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="mt-1 text-xs text-[#6F4E37] font-bold hover:underline disabled:opacity-50"
                      >
                        Browse
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Input
              type="text"
              label="Listing Title"
              placeholder="e.g. A-Grade Parchment Coffee"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              maxLength={200}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-600 mb-2 uppercase tracking-tight">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-white border border-[#EBE3D5] rounded-xl px-4 py-3 outline-none focus:ring-2 ring-[#6F4E37]/10 text-sm"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-600 mb-2 uppercase tracking-tight">
                  Unit
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full bg-white border border-[#EBE3D5] rounded-xl px-4 py-3 outline-none focus:ring-2 ring-[#6F4E37]/10 text-sm"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Price (रू)"
                placeholder="850"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                min="0"
                step="0.01"
              />

              <Input
                type="number"
                label="Quantity"
                placeholder="100"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                min="0"
                step="0.01"
              />
            </div>

            <Input
              type="text"
              label="Location"
              placeholder="Kaski, Nepal"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />

            <div>
              <label className="block text-xs font-black text-gray-600 mb-2 uppercase tracking-tight">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your product in detail..."
                className="min-h-[120px]"
                maxLength={3000}
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" type="button" onClick={onBack} className="flex-1" disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="flex-1" disabled={saving}>
                {saving ? 'Creating...' : 'Create Listing'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

