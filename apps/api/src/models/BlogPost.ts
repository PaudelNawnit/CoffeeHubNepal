import mongoose, { Document, Schema } from 'mongoose';

export interface CommentDocument {
  author: mongoose.Types.ObjectId;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: Date;
}

export interface BlogPostDocument extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  authorName: string;
  authorEmail: string;
  category: string;
  tags: string[];
  images: string[];
  likes: mongoose.Types.ObjectId[];
  comments: CommentDocument[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<CommentDocument>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    content: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const blogPostSchema = new Schema<BlogPostDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    authorName: {
      type: String,
      required: true
    },
    authorEmail: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      index: true
    },
    tags: {
      type: [String],
      default: []
    },
    images: {
      type: [String],
      default: []
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    comments: [commentSchema],
    published: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Performance indexes
blogPostSchema.index({ createdAt: -1 });
blogPostSchema.index({ category: 1, createdAt: -1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ published: 1, createdAt: -1 }); // Compound index for common query
blogPostSchema.index({ author: 1, createdAt: -1 }); // For author-specific queries
// Compound index for category + tags + createdAt (recommended in suggestions)
blogPostSchema.index({ category: 1, tags: 1, createdAt: -1 });

export const BlogPost = mongoose.model<BlogPostDocument>('BlogPost', blogPostSchema);

