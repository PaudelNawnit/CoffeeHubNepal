import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { ipRateLimiter } from './middleware/rateLimit.js';
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blog.js';
import adminRoutes from './routes/admin.js';
import jobRoutes from './routes/jobs.js';
import productRoutes from './routes/products.js';
import priceRoutes from './routes/prices.js';
import contactRoutes from './routes/contacts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = () => {
  const app = express();
  
  // Configure helmet for production (less strict for static file serving)
  app.use(helmet({
    contentSecurityPolicy: false, // Allow inline scripts/styles from React build
  }));
  
  // CORS configuration
  const isProduction = process.env.NODE_ENV === 'production';
  const staticFilesServed = isProduction; // Always serve static files in production
  
  // Build allowed origins list
  const allowedOrigins = [env.clientOrigin];
  // Add production domain if different from clientOrigin
  if (isProduction && process.env.PRODUCTION_DOMAIN) {
    allowedOrigins.push(process.env.PRODUCTION_DOMAIN);
  }
  
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (same-origin, mobile apps, curl)
        if (!origin || staticFilesServed) {
          callback(null, true);
          return;
        }
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true
    })
  );
  
  // Increase body size limit for base64 images (default is 100kb, increase to 10MB)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(ipRateLimiter);

  // Add caching headers for GET requests (public data only)
  app.use((req, res, next) => {
    // Only cache GET requests for public data - NOT admin endpoints
    if (req.method === 'GET' && !req.path.startsWith('/auth') && !req.path.startsWith('/admin')) {
      // Cache public data for 5 minutes
      if (req.path.startsWith('/blog') || req.path.startsWith('/jobs') || 
          req.path.startsWith('/products') || req.path.startsWith('/prices')) {
        res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
      }
      // Cache health check for 1 minute
      if (req.path === '/health') {
        res.set('Cache-Control', 'public, max-age=60'); // 1 minute
      }
    }
    // Admin endpoints should never be publicly cached
    if (req.path.startsWith('/admin')) {
      res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    }
    next();
  });

  // API routes (must come before static file serving)
  app.use('/auth', authRoutes);
  app.use('/blog', blogRoutes);
  app.use('/admin', adminRoutes);
  app.use('/jobs', jobRoutes);
  app.use('/products', productRoutes);
  app.use('/prices', priceRoutes);
  app.use('/contacts', contactRoutes);

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // Serve static files from React build (only in production when SERVE_STATIC_FILES is true)
  if (staticFilesServed) {
    const publicPath = path.join(__dirname, '../public');
    app.use(express.static(publicPath, {
      maxAge: '1y', // Cache static assets for 1 year
      etag: true,
      lastModified: true
    }));

    // Catch-all handler: send back React's index.html file for client-side routing
    // This must be last, after all API routes
    app.get('*', (_req, res) => {
      res.sendFile(path.join(publicPath, 'index.html'));
    });
  }

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      error: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An internal server error occurred'
    });
  });

  return app;
};

