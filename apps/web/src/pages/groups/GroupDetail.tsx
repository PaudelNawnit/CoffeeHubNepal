import { ArrowLeft, Users, MessageSquare, Settings, Plus, Send } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

interface GroupDetailProps {
  groupId: number;
  onBack: () => void;
}

export const GroupDetail = ({ onBack }: GroupDetailProps) => {
  const group = {
    id: 1,
    name: "Kaski Coffee Farmers",
    members: 245,
    posts: 89,
    type: "public",
    description: "A community for coffee farmers in Kaski district to share knowledge, experiences, and support each other.",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800"
  };

  const mockPosts = [
    {
      id: 1,
      author: "Ram Thapa",
      time: "2h ago",
      content: "Just harvested my first batch of the season! Quality looks excellent this year.",
      likes: 12,
      comments: 3
    },
    {
      id: 2,
      author: "Sita Adhikari",
      time: "5h ago",
      content: "Does anyone have experience with organic pest control methods? Looking for natural alternatives.",
      likes: 8,
      comments: 7
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F5F2] pb-32">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-[#6F4E37] flex-1">{group.name}</h2>
        <button className="p-2 hover:bg-gray-100 rounded-xl">
          <Settings size={20} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <Card className="overflow-hidden">
          <div className="relative h-48">
            <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-6">
            <h1 className="text-2xl font-black mb-2">{group.name}</h1>
            <p className="text-gray-700 mb-4">{group.description}</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#6F4E37]" />
                <span className="font-black">{group.members} members</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-[#6F4E37]" />
                <span className="font-black">{group.posts} posts</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-lg">Recent Posts</h3>
            <Button variant="primary" className="text-xs px-3">
              <Plus size={14} /> New Post
            </Button>
          </div>

          <div className="space-y-4">
            {mockPosts.map(post => (
              <div key={post.id} className="p-4 bg-[#F8F5F2] rounded-2xl border border-[#EBE3D5]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <p className="font-black text-sm">{post.author}</p>
                    <p className="text-[10px] text-gray-400">{post.time}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-3 leading-relaxed">{post.content}</p>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 text-gray-500 text-xs font-bold">
                    <span>👍</span> {post.likes}
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 text-xs font-bold">
                    <MessageSquare size={14} /> {post.comments}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-[#F5EFE6] to-white">
          <h3 className="font-black mb-4">Create Post</h3>
          <textarea
            placeholder="Share something with the group..."
            className="w-full bg-white border border-[#EBE3D5] rounded-xl px-4 py-3 outline-none focus:ring-2 ring-[#6F4E37]/10 text-sm min-h-[100px] mb-4"
          />
          <Button variant="primary" className="w-full">
            <Send size={16} /> Post to Group
          </Button>
        </Card>
      </div>
    </div>
  );
};

