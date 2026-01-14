import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment
} from '../services/blogService.js';
import { createReport } from '../services/reportService.js';

const router = Router();

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  category: z.string().min(1),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  authorName: z.string().optional()
});

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(5000).optional(),
  category: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional()
});

const commentSchema = z.object({
  content: z.string().min(1).max(1000)
});

// Get all posts with optional filters
router.get('/', async (req, res) => {
  try {
    const category = req.query.category as string | undefined;
    const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;
    const author = req.query.author as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const result = await getPosts({ category, tags, author, page, limit });
    return res.json(result);
  } catch (error) {
    console.error('Get posts error:', error);
    return res.status(500).json({ error: 'FAILED_TO_FETCH_POSTS' });
  }
});

// Get single post
router.get('/:id', validateObjectId(), async (req, res) => {
  try {
    const post = await getPostById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'POST_NOT_FOUND' });
    }
    
    return res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    return res.status(500).json({ error: 'FAILED_TO_FETCH_POST' });
  }
});

// Create post (auth required)
router.post('/', authenticate, validate(createPostSchema), async (req: AuthRequest, res) => {
  try {
    // Filter out empty image URLs
    const images = req.body.images?.filter((url: string) => url && url.trim()) || [];
    
    const post = await createPost(req.userId!, {
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      tags: req.body.tags || [],
      images: images,
      authorName: req.body.authorName || 'User',
      authorEmail: req.userEmail!
    });
    
    return res.status(201).json(post);
  } catch (error: any) {
    console.error('Create post error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
    
    // MongoDB/Cosmos DB specific errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR', 
        message: error.message || 'Invalid post data' 
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'DUPLICATE_ENTRY', 
        message: 'A post with this title already exists' 
      });
    }
    if (error.message?.includes('Invalid author ID')) {
      return res.status(400).json({ 
        error: 'INVALID_AUTHOR', 
        message: 'Invalid user authentication' 
      });
    }
    // Check if collection doesn't exist
    if (error.message?.includes('collection') || error.message?.includes('Collection') || error.code === 'NamespaceNotFound' || (error as any).isCollectionError) {
      return res.status(500).json({ 
        error: 'COLLECTION_NOT_FOUND',
        message: 'Blog collection not found. Please create the "blogposts" collection in Azure Portal first. See AZURE_COLLECTION_SETUP.md for instructions.'
      });
    }
    // Check for document size limits (base64 images can be large)
    if (error.message?.includes('size') || error.message?.includes('too large') || error.code === 16500 || (error as any).isSizeError) {
      return res.status(400).json({ 
        error: 'IMAGE_TOO_LARGE',
        message: 'Image(s) are too large. Please reduce image size or use fewer images. Each image should be less than 2MB.'
      });
    }
    
    return res.status(500).json({ 
      error: 'FAILED_TO_CREATE_POST',
      message: error.message || 'Failed to create blog post. Check server logs for details.'
    });
  }
});

// Update post (auth + author check)
router.put('/:id', validateObjectId(), authenticate, validate(updatePostSchema), async (req: AuthRequest, res) => {
  try {
    const post = await updatePost(req.params.id, req.userId!, req.body);
    
    if (!post) {
      return res.status(404).json({ error: 'POST_NOT_FOUND' });
    }
    
    return res.json(post);
  } catch (error: any) {
    if (error.message === 'POST_NOT_FOUND') {
      return res.status(404).json({ error: 'POST_NOT_FOUND' });
    }
    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({ error: 'UNAUTHORIZED', message: 'You can only edit your own posts' });
    }
    console.error('Update post error:', error);
    return res.status(500).json({ error: 'FAILED_TO_UPDATE_POST' });
  }
});

// Delete post (auth + author check)
router.delete('/:id', validateObjectId(), authenticate, async (req: AuthRequest, res) => {
  try {
    await deletePost(req.params.id, req.userId!);
    return res.json({ message: 'Post deleted successfully' });
  } catch (error: any) {
    if (error.message === 'POST_NOT_FOUND') {
      return res.status(404).json({ error: 'POST_NOT_FOUND' });
    }
    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({ error: 'UNAUTHORIZED', message: 'You can only delete your own posts' });
    }
    console.error('Delete post error:', error);
    return res.status(500).json({ error: 'FAILED_TO_DELETE_POST' });
  }
});

// Like/Unlike post (auth required)
router.post('/:id/like', validateObjectId(), authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await likePost(req.params.id, req.userId!);
    return res.json(result);
  } catch (error: any) {
    if (error.message === 'POST_NOT_FOUND') {
      return res.status(404).json({ error: 'POST_NOT_FOUND' });
    }
    console.error('Like post error:', error);
    return res.status(500).json({ error: 'FAILED_TO_LIKE_POST' });
  }
});

// Add comment (auth required)
router.post('/:id/comments', validateObjectId(), authenticate, validate(commentSchema), async (req: AuthRequest, res) => {
  try {
    const post = await addComment(req.params.id, req.userId!, {
      content: req.body.content,
      authorName: req.body.authorName || 'User',
      authorEmail: req.userEmail!
    });
    
    return res.status(201).json(post);
  } catch (error: any) {
    if (error.message === 'POST_NOT_FOUND') {
      return res.status(404).json({ error: 'POST_NOT_FOUND' });
    }
    console.error('Add comment error:', error);
    return res.status(500).json({ error: 'FAILED_TO_ADD_COMMENT' });
  }
});

// Delete comment (auth + author check)
router.delete('/:id/comments/:commentId', validateObjectId(['id', 'commentId']), authenticate, async (req: AuthRequest, res) => {
  try {
    await deleteComment(req.params.id, req.params.commentId, req.userId!);
    return res.json({ message: 'Comment deleted successfully' });
  } catch (error: any) {
    if (error.message === 'POST_NOT_FOUND' || error.message === 'COMMENT_NOT_FOUND') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({ error: 'UNAUTHORIZED', message: 'You can only delete your own comments' });
    }
    console.error('Delete comment error:', error);
    return res.status(500).json({ error: 'FAILED_TO_DELETE_COMMENT' });
  }
});

// Report a post (authenticated users)
const reportPostSchema = z.object({
  reason: z.string().min(1).max(500),
  type: z.enum(['spam', 'inappropriate', 'fraud', 'harassment', 'other'])
});

router.post('/:id/report', validateObjectId(), authenticate, validate(reportPostSchema), async (req: AuthRequest, res) => {
  try {
    const post = await getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'POST_NOT_FOUND' });
    }

    // Get user ID from token (we need to fetch user by email to get ID)
    const { User } = await import('../models/User.js');
    const user = await User.findOne({ email: req.userEmail });
    if (!user) {
      return res.status(401).json({ error: 'USER_NOT_FOUND' });
    }

    const report = await createReport({
      postId: req.params.id,
      reporterId: user._id.toString(),
      reportedUserId: post.author.toString(),
      reason: req.body.reason,
      type: req.body.type
    });

    return res.status(201).json({
      id: report._id.toString(),
      message: 'Report submitted successfully'
    });
  } catch (error: any) {
    if (error.message === 'POST_NOT_FOUND') {
      return res.status(404).json({ error: 'POST_NOT_FOUND' });
    }
    if (error.message === 'ALREADY_REPORTED') {
      return res.status(409).json({ error: 'ALREADY_REPORTED', message: 'You have already reported this post' });
    }
    console.error('Report post error:', error);
    return res.status(500).json({ error: 'FAILED_TO_REPORT_POST' });
  }
});

export default router;

