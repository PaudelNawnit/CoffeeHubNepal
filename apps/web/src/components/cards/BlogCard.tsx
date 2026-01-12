import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Heart, MessageSquare, Calendar } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import { BlogPost, getAuthorName, getAuthorAvatar } from '@/services/blog.service';

interface BlogCardProps {
  post: BlogPost;
  onCardClick: () => void;
  onLike?: () => void;
  currentUserId?: string;
}

export const BlogCard = ({ post, onCardClick, onLike, currentUserId }: BlogCardProps) => {
  const isLiked = currentUserId ? post.likes.includes(currentUserId) : false;
  const likesCount = post.likes.length;
  const commentsCount = post.comments.length;
  
  // Get current author info (populated data takes priority over stored data)
  const authorName = getAuthorName(post);
  const authorAvatar = getAuthorAvatar(post);
  
  // Truncate content for preview
  const preview = post.content.length > 150 
    ? post.content.substring(0, 150) + '...' 
    : post.content;

  return (
    <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={onCardClick}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            {authorAvatar ? (
              <img 
                src={authorAvatar} 
                alt={authorName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Replace with fallback initial on error
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="w-full h-full bg-[#6F4E37] flex items-center justify-center text-white font-bold text-sm">${authorName.charAt(0).toUpperCase()}</div>`;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-[#6F4E37] flex items-center justify-center text-white font-bold text-sm">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-black text-gray-700">{authorName}</p>
            <p className="text-[10px] text-gray-400 flex items-center gap-1">
              <Calendar size={10} />
              {formatDate(post.createdAt)}
            </p>
          </div>
        </div>
        <Badge variant="primary" className="text-[10px]">{post.category}</Badge>
      </div>
      
      <h3 className="font-black text-xl mb-2 text-[#6F4E37]">{post.title}</h3>
      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{preview}</p>
      
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              #{tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              +{post.tags.length - 3}
            </span>
          )}
        </div>
      )}
      
      {post.images.length > 0 && (
        <div className="mb-4 relative h-40 bg-gray-100 rounded-lg overflow-hidden">
          <img 
            src={post.images[0]} 
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike?.();
          }}
          className={`flex items-center gap-2 text-sm transition-colors ${
            isLiked ? 'text-red-600' : 'text-gray-400 hover:text-red-600'
          }`}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
          <span className="font-bold">{likesCount}</span>
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <MessageSquare size={18} />
          <span className="font-bold">{commentsCount}</span>
        </div>
      </div>
    </Card>
  );
};

