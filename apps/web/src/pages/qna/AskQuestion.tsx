import { useState } from 'react';
import { ArrowLeft, Sparkles, Send } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';

interface AskQuestionProps {
  onBack: () => void;
  onSubmit?: (question: any) => void;
}

export const AskQuestion = ({ onBack, onSubmit }: AskQuestionProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    category: 'Agronomy'
  });

  const availableTags = ['Disease', 'Pest', 'Fertilizer', 'Harvest', 'Processing', 'Market'];
  const categories = ['Agronomy', 'Pests', 'Markets', 'Processing', 'Equipment'];

  const toggleTag = (tag: string) => {
    if (formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: formData.tags.filter(t => t !== tag)
      });
    } else {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onBack();
  };

  return (
    <div className="min-h-screen bg-[#F8F5F2] pb-32">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-[#6F4E37]">Ask a Question</h2>
      </div>

      <div className="p-6">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-600 mb-2 uppercase tracking-tight">
                Category
              </label>
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`px-4 py-2 rounded-full border-2 font-black text-xs uppercase transition-all ${
                      formData.category === cat
                        ? 'border-[#6F4E37] bg-[#F5EFE6] text-[#6F4E37]'
                        : 'border-[#EBE3D5] bg-white text-gray-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <Input
              type="text"
              label="Question Title"
              placeholder="e.g. How to handle leaf rust at 1500m?"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <div>
              <label className="block text-xs font-black text-gray-600 mb-2 uppercase tracking-tight">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide more details about your question..."
                className="w-full bg-white border border-[#EBE3D5] rounded-xl px-4 py-3 outline-none focus:ring-2 ring-[#6F4E37]/10 text-sm min-h-[150px]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-600 mb-3 uppercase tracking-tight">
                Tags (Select relevant tags)
              </label>
              <div className="flex gap-2 flex-wrap">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full border font-black text-[10px] uppercase transition-all ${
                      formData.tags.includes(tag)
                        ? 'border-[#6F4E37] bg-[#F5EFE6] text-[#6F4E37]'
                        : 'border-[#EBE3D5] bg-white text-gray-500'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-4 rounded-2xl">
              <div className="flex items-start gap-3">
                <Sparkles className="text-indigo-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-black text-indigo-900 mb-1">AI Assistant Available</p>
                  <p className="text-xs text-indigo-700">Get AI-powered suggestions for your question</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" type="button" onClick={onBack} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="flex-1">
                <Send size={16} /> Post Question
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

