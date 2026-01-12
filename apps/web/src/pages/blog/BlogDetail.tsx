import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Edit, Trash2, Calendar, Tag, Flag } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { LikeButton } from '@/components/blog/LikeButton';
import { CommentSection } from '@/components/blog/CommentSection';
import { ReportModal } from '@/components/blog/ReportModal';
import { blogService, BlogPost, getAuthorName, getAuthorAvatar, getAuthorId } from '@/services/blog.service';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/formatDate';

interface BlogDetailProps {
  postId: string;
  onBack: () => void;
}

export const BlogDetail = ({ postId, onBack }: BlogDetailProps) => {
  const { navigate, setCurrentPage } = useApp();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);

  // Handle back navigation properly
  const handleBack = useCallback(() => {
    setCurrentPage('blog');
    onBack();
  }, [onBack, setCurrentPage]);

  useEffect(() => {
    loadPost();
  }, [postId]);

  useEffect(() => {
    if (post) {
      // Check if user has liked this post
      if (user && user.mongoId) {
        setIsLiked(post.likes.includes(user.mongoId));
      } else if (user) {
        setIsLiked(post.likes.includes(user.id.toString()));
      } else {
        setIsLiked(false);
      }
      setLikesCount(post.likes.length);
    }
  }, [post, user]);

  const loadPost = async (overrideId?: string) => {
    setLoading(true);
    setError(null);
    try {
      // Check if we have a MongoDB ObjectId in sessionStorage (from navigation)
      const storedId = sessionStorage.getItem('blogDetailId');
      // Use storedId first, then overrideId, then convert postId to string
      const actualPostId = overrideId || storedId || (typeof postId === 'string' ? postId : String(postId));
      
      if (!actualPostId) {
        throw new Error('Post ID is required');
      }
      
      if (storedId) {
        sessionStorage.removeItem('blogDetailId'); // Clean up after use
      }
      
      const data = await blogService.getPostById(actualPostId);
      setPost(data);
      setIsLiked(user ? data.likes.includes(user.mongoId || user.id.toString()) : false);
      setLikesCount(data.likes.length);
    } catch (err: any) {
      setError(err.message || 'Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    // Don't show login message if auth is still loading
    if (authLoading) {
      return;
    }
    
    if (!isAuthenticated || !user) {
      navigate('login');
      return;
    }

    if (!post) return;

    try {
      const result = await blogService.likePost(post._id);
      setIsLiked(result.liked);
      setLikesCount(result.likesCount);
    } catch (err: any) {
      if (err.message?.includes('log in')) {
        navigate('login');
      } else {
        alert(err.message || 'Failed to like post');
      }
    }
  };

  const handleDelete = async () => {
    if (!post || !user) return;
    
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await blogService.deletePost(post._id);
      alert('Post deleted successfully');
      onBack();
    } catch (err: any) {
      alert(err.message || 'Failed to delete post');
    }
  };

  const handleAddComment = async (content: string) => {
    if (!post || !user) return;

    try {
      await blogService.addComment(post._id, content, user.name || 'User');
      await loadPost(); // Reload to get updated comments
    } catch (err: any) {
      throw new Error(err.message || 'Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!post) return;

    try {
      await blogService.deleteComment(post._id, commentId);
      await loadPost(); // Reload to get updated comments
    } catch (err: any) {
      alert(err.message || 'Failed to delete comment');
    }
  };

  const isAuthor = post && user && getAuthorId(post) === (user.mongoId || user.id.toString());

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] pb-32 lg:pb-8">
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-black text-[#6F4E37]">Loading...</h2>
        </div>
        <div className="p-6 lg:p-8 text-center py-12 text-gray-400">Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] pb-32 lg:pb-8">
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-black text-[#6F4E37]">Error</h2>
        </div>
        <div className="p-6 lg:p-8 text-center py-12 text-red-500">{error || 'Post not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F2] pb-32 lg:pb-8">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-black text-[#6F4E37]">Blog Post</h2>
        </div>
        <div className="flex gap-2">
          {!isAuthor && user && (
            <Button
              variant="outline"
              className="text-xs"
              onClick={() => setShowReportModal(true)}
            >
              <Flag size={14} /> Report
            </Button>
          )}
          {isAuthor && (
            <>
              <Button
                variant="outline"
                className="text-xs"
                onClick={() => {
                  sessionStorage.setItem('blogEditId', post._id);
                  navigate('edit-blog', 0);
                }}
              >
                <Edit size={14} /> Edit
              </Button>
              <Button
                variant="outline"
                className="text-xs text-red-600 hover:bg-red-50"
                onClick={handleDelete}
              >
                <Trash2 size={14} /> Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="p-6 lg:p-8 lg:max-w-4xl lg:mx-auto space-y-6">
        <Card className="p-6 lg:p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                {getAuthorAvatar(post) ? (
                  <img 
                    src={getAuthorAvatar(post)!} 
                    alt={getAuthorName(post)}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Replace with fallback initial on error
                      const target = e.target as HTMLImageElement;
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-full h-full bg-[#6F4E37] flex items-center justify-center text-white font-bold text-lg">${getAuthorName(post).charAt(0).toUpperCase()}</div>`;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-[#6F4E37] flex items-center justify-center text-white font-bold text-lg">
                    {getAuthorName(post).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-black text-gray-700">{getAuthorName(post)}</p>
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Calendar size={10} />
                  {formatDate(post.createdAt)}
                </p>
              </div>
            </div>
            <Badge variant="primary">{post.category}</Badge>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black mb-4 text-[#6F4E37]">{post.title}</h1>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full flex items-center gap-1"
                >
                  <Tag size={12} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {post.images.length > 0 && (
            <div className="mb-6 space-y-3">
              {post.images.map((img, idx) => (
                <div key={idx} className="relative flex justify-center">
                  <img
                    src={img}
                    alt={`${post.title} - Image ${idx + 1}`}
                    className="max-w-[600px] w-full max-h-80 rounded-lg object-contain mx-auto shadow-sm border border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.image-error')) {
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'image-error p-8 bg-gray-100 rounded-xl text-center text-gray-400';
                        errorDiv.textContent = 'Failed to load image';
                        parent.appendChild(errorDiv);
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
            <LikeButton
              isLiked={isLiked}
              likesCount={likesCount}
              onLike={handleLike}
              disabled={authLoading}
            />
            {!isAuthenticated && !authLoading && (
              <span className="text-xs text-gray-500">Log in to like</span>
            )}
          </div>
        </Card>

        <Card className="p-6 lg:p-8">
          <CommentSection
            comments={post.comments}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
          />
        </Card>
      </div>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        postId={post._id}
        postTitle={post.title}
      />
    </div>
  );
};

