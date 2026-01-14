import { useState, useRef } from 'react';
import { ArrowLeft, Image as ImageIcon, X, Upload, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import { Textarea } from '@/components/common/Textarea';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { blogService } from '@/services/blog.service';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { compressImage } from '@/utils/imageCompression';

const CATEGORIES = ['Agronomy', 'Processing', 'Marketing', 'Stories', 'Tips', 'News'];

export const CreateBlog = () => {
  const { setSubPage, navigate } = useApp();
  const { user, isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] pb-32 lg:pb-8">
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 lg:px-8 py-4 flex items-center gap-4">
          <button onClick={() => setSubPage(null)} className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-black text-[#6F4E37]">Create Blog Post</h2>
        </div>
        <div className="p-6 lg:p-8 lg:max-w-3xl lg:mx-auto">
          <Card className="p-6 lg:p-8 text-center">
            <p className="text-lg font-bold mb-4">Please log in to create a blog post</p>
            <Button variant="primary" onClick={() => setSubPage('login')}>
              Log In
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleAddImage = () => {
    const url = imageUrl.trim();
    if (url && !images.includes(url)) {
      // Basic URL validation - allow http, https, or data URLs
      const isValidUrl = url.startsWith('http://') || 
                         url.startsWith('https://') || 
                         url.startsWith('data:') ||
                         url.startsWith('/'); // Allow relative paths
      
      if (isValidUrl) {
        setImages([...images, url]);
        setImageUrl('');
      } else {
        setError('Please enter a valid image URL (must start with http://, https://, or be a relative path)');
      }
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    setImages(images.filter(url => url !== urlToRemove));
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Limit to 5 images max to prevent document size issues
    const remainingSlots = 5 - images.length;
    if (remainingSlots <= 0) {
      setError('Maximum 5 images allowed per post');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    for (const file of filesToProcess) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload only image files');
        continue;
      }

      // Validate file size (max 10MB before compression)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        continue;
      }

      try {
        // Compress image before converting to base64
        const compressedDataUrl = await compressImage(file, 1920, 1920, 0.8);
        
        // Check final size (max 1MB per compressed image)
        const base64Size = (compressedDataUrl.length * 3) / 4;
        if (base64Size > 1024 * 1024) {
          setError('Image is too large even after compression. Please use a smaller image.');
          continue;
        }
        
        if (!images.includes(compressedDataUrl)) {
          setImages([...images, compressedDataUrl]);
          setError(null);
        }
      } catch (err: any) {
        console.error('Image compression error:', err);
        setError(err.message || 'Failed to process image');
      }
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
    handleFileUpload(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to create a blog post');
      return;
    }

    if (!title.trim() || !content.trim() || !category) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Filter out empty image URLs before sending
      const validImages = images.filter(url => url && url.trim());
      
      const post = await blogService.createPost({
        title: title.trim(),
        content: content.trim(),
        category,
        tags,
        images: validImages,
        authorName: user.name || user.email?.split('@')[0] || 'User'
      });

      // Show success animation
      setSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store post ID in sessionStorage and navigate to blog detail
      sessionStorage.setItem('blogDetailId', post._id);
      navigate('blog-detail', 0);
    } catch (err: any) {
      console.error('Create blog error:', err);
      const errorMessage = err.message || 'Failed to create blog post';
      setError(errorMessage);
      setSuccess(false);
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay 
        isVisible={loading} 
        message="Publishing your blog post..."
        success={success}
        successMessage="Blog post published successfully!"
      />
      <div className="min-h-screen bg-[#F8F5F2] pb-32 lg:pb-8">
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 lg:px-8 py-4 flex items-center gap-4">
        <button onClick={() => setSubPage(null)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-[#6F4E37]">Create Blog Post</h2>
      </div>

      <div className="p-6 lg:p-8 lg:max-w-3xl lg:mx-auto">
        <Card className="p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">
                Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a catchy title..."
                maxLength={200}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-[#EBE3D5] rounded-xl px-4 py-3 outline-none focus:ring-2 ring-[#6F4E37]/10 text-sm"
                required
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">
                Content *
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your blog post content here..."
                className="min-h-[300px]"
                maxLength={5000}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add a tag and press Enter"
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#6F4E37] text-white rounded-full text-xs"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-black text-gray-700">
                  Images
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadMode('upload')}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      uploadMode === 'upload'
                        ? 'bg-[#6F4E37] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Upload size={14} className="inline mr-1" />
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('url')}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      uploadMode === 'url'
                        ? 'bg-[#6F4E37] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <LinkIcon size={14} className="inline mr-1" />
                    URL
                  </button>
                </div>
              </div>

              {uploadMode === 'upload' ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    isDragging
                      ? 'border-[#6F4E37] bg-[#6F4E37]/5'
                      : 'border-[#EBE3D5] bg-gray-50/50'
                  }`}
                >
                  <Upload
                    size={48}
                    className={`mx-auto mb-3 ${
                      isDragging ? 'text-[#6F4E37]' : 'text-gray-400'
                    }`}
                  />
                  <p className="text-sm font-bold text-gray-700 mb-1">
                    {isDragging ? 'Drop images here' : 'Drag and drop images here'}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    or click to browse (Max 5MB per image)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon size={16} className="mr-2" />
                      Choose Images
                    </Button>
                  </label>
                </div>
              ) : (
                <div className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImage();
                      }
                    }}
                    placeholder="Enter image URL (http://, https://, or relative path)"
                  />
                  <Button type="button" variant="outline" onClick={handleAddImage}>
                    <LinkIcon size={16} />
                  </Button>
                </div>
              )}

              {images.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-bold text-gray-600 mb-2">
                    {images.length} image{images.length > 1 ? 's' : ''} added
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {images.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
                      >
                        <img
                          src={url}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.error-icon')) {
                              const errorDiv = document.createElement('div');
                              errorDiv.className =
                                'error-icon absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-xs';
                              errorDiv.textContent = 'Failed to load';
                              parent.appendChild(errorDiv);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(url)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Remove image"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSubPage(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Publishing...' : 'Publish Post'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
    </>
  );
};

