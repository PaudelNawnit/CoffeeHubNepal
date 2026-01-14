import { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';

/**
 * Sanitize HTML content in request body
 * Removes potentially dangerous HTML/JavaScript while preserving safe formatting
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Only sanitize if body exists and has content
  if (req.body && typeof req.body === 'object') {
    // Fields that may contain HTML content
    const htmlFields = ['content', 'description', 'message', 'reason', 'requirements', 'benefits'];
    
    for (const field of htmlFields) {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = sanitizeHtml(req.body[field], {
          allowedTags: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
          allowedAttributes: {},
          allowedStyles: {},
        });
      }
    }
    
    // Sanitize array fields (like tags)
    if (Array.isArray(req.body.tags)) {
      req.body.tags = req.body.tags.map((tag: any) => {
        if (typeof tag === 'string') {
          return sanitizeHtml(tag, { allowedTags: [], allowedAttributes: {} });
        }
        return tag;
      });
    }
  }
  
  next();
};

/**
 * Sanitize query parameters
 */
export const sanitizeQuery = (req: Request, res: Response, next: NextFunction) => {
  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeHtml(req.query[key] as string, {
          allowedTags: [],
          allowedAttributes: {},
        });
      }
    }
  }
  
  next();
};
