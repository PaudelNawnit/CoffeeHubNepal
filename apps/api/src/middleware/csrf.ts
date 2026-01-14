import { Request, Response, NextFunction } from 'express';
import csrf from 'csurf';

// CSRF protection configuration
// Note: CSRF tokens are typically used with session-based auth
// Since we're using JWT tokens, CSRF protection is less critical but still recommended for state-changing operations

// Create CSRF middleware
// Only apply to state-changing methods (POST, PUT, DELETE, PATCH)
export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    sameSite: 'strict',
  },
});

// Middleware to skip CSRF for certain routes (like API endpoints that use JWT)
export const csrfSkip = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for API routes that use JWT authentication
  // JWT tokens in Authorization header are not vulnerable to CSRF
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return next();
  }
  // Skip for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  // Apply CSRF protection
  csrfProtection(req, res, next);
};

// Get CSRF token endpoint (for forms that need it)
export const getCsrfToken = (req: Request, res: Response) => {
  res.json({ csrfToken: req.csrfToken() });
};
