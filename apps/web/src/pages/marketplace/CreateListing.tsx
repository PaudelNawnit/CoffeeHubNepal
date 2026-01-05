import { useState } from 'react';
import { ArrowLeft, Camera, X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';

interface CreateListingProps {
  onBack: () => void;
  onSubmit?: (listing: any) => void;
}

export const CreateListing = ({ onBack, onSubmit }: CreateListingProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    unit: 'kg',
    category: 'Arabica',
    location: '',
    images: [] as string[]
  });

  const categories = ['Arabica', 'Robusta', 'Gear', 'Equipment', 'Other'];
  const units = ['kg', 'pc', 'bag', 'ton'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData({
            ...formData,
            images: [...formData.images, event.target.result as string]
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onBack();
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
                Photos
              </label>
              <div className="grid grid-cols-3 gap-3 mb-3">
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
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-lg"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {formData.images.length < 5 && (
                  <label className="aspect-square border-2 border-dashed border-[#EBE3D5] rounded-xl flex items-center justify-center cursor-pointer hover:border-[#6F4E37] transition-colors">
                    <Camera size={24} className="text-gray-400" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <Input
              type="text"
              label="Listing Title"
              placeholder="e.g. A-Grade Parchment Coffee"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              />

              <Input
                type="text"
                label="Location"
                placeholder="Kaski, Nepal"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-600 mb-2 uppercase tracking-tight">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your product in detail..."
                className="w-full bg-white border border-[#EBE3D5] rounded-xl px-4 py-3 outline-none focus:ring-2 ring-[#6F4E37]/10 text-sm min-h-[120px]"
                required
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" type="button" onClick={onBack} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="flex-1">
                Create Listing
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

