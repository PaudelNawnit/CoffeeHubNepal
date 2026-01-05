import { useState } from 'react';
import { ArrowLeft, MessageSquare, ThumbsUp, Sparkles, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { MOCK_QA } from '@/utils/mockData';

interface QnaDetailProps {
  questionId: number;
  onBack: () => void;
}

export const QnaDetail = ({ questionId, onBack }: QnaDetailProps) => {
  const [answer, setAnswer] = useState('');
  const question = MOCK_QA.find(q => q.id === questionId) || MOCK_QA[0];
  
  const mockAnswers = [
    {
      id: 1,
      author: 'Dr. Sita Adhikari',
      verified: true,
      content: 'Leaf rust at 1500m is common. Apply copper-based fungicides every 2 weeks during wet season. Remove infected leaves immediately.',
      upvotes: 24,
      isExpert: true,
      timeAgo: '2h ago'
    },
    {
      id: 2,
      author: 'Hari Pokhrel',
      verified: false,
      content: 'I had the same issue in Gulmi. Neem oil spray worked for me. Mix 2ml per liter and spray early morning.',
      upvotes: 12,
      isExpert: false,
      timeAgo: '5h ago'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F5F2] pb-32 lg:pb-8">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 lg:px-8 py-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-[#6F4E37]">Question Details</h2>
      </div>

      <div className="p-6 lg:p-8 lg:max-w-4xl lg:mx-auto space-y-6">
        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div>
                <p className="text-sm font-black">{question.author}</p>
                <p className="text-[10px] text-gray-400">2h ago</p>
              </div>
            </div>
            <Badge>{question.tags[0]}</Badge>
          </div>

          <h1 className="text-2xl font-black mb-4">{question.title}</h1>
          <p className="text-gray-700 leading-relaxed mb-6">{question.desc}</p>

          <div className="flex gap-2">
            <Button variant="outline" className="text-xs">
              <MessageSquare size={14} /> {question.answers} Answers
            </Button>
            <Button variant="ai" className="text-xs">
              <Sparkles size={14} /> Generate AI Answer
            </Button>
          </div>
        </Card>

        <div>
          <h3 className="text-lg font-black mb-4">Answers ({mockAnswers.length})</h3>
          <div className="space-y-4">
            {mockAnswers.map(ans => (
              <Card key={ans.id} className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#6F4E37] to-[#3A7D44] rounded-2xl flex items-center justify-center text-white font-black">
                    {ans.author[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-sm">{ans.author}</span>
                      {ans.verified && (
                        <CheckCircle size={14} className="text-blue-500" fill="currentColor" />
                      )}
                      {ans.isExpert && (
                        <Badge variant="success" className="text-[8px] px-1.5 py-0.5">Expert</Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400">{ans.timeAgo}</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">{ans.content}</p>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 text-gray-500 hover:text-[#6F4E37] transition-colors">
                    <ThumbsUp size={16} />
                    <span className="text-xs font-bold">{ans.upvotes}</span>
                  </button>
                  <button className="text-xs font-black text-[#6F4E37]">Reply</button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-6 bg-gradient-to-br from-[#F5EFE6] to-white">
          <h3 className="font-black mb-4">Your Answer</h3>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Share your knowledge and experience..."
            className="w-full bg-white border border-[#EBE3D5] rounded-xl px-4 py-3 outline-none focus:ring-2 ring-[#6F4E37]/10 text-sm min-h-[120px] mb-4"
          />
          <div className="flex gap-2">
            <Button variant="ai" className="text-xs">
              <Sparkles size={14} /> AI Assist
            </Button>
            <Button variant="primary" className="flex-1">
              <Send size={16} /> Post Answer
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

