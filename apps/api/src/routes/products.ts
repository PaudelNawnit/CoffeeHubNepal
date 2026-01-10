import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  markProductAsSold
} from '../services/productService.js';

const router = Router();

const createProductSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  price: z.number().min(0),
  unit: z.string().min(1),
  quantity: z.number().min(0),
  location: z.string().min(1),
  category: z.string().min(1),
  images: z.array(z.string()).optional()
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const filters = {
      category: req.query.category as string | undefined,
      location: req.query.location as string | undefined,
      search: req.query.search as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      sellerId: req.query.sellerId as string | undefined
    };

    const result = await getProducts(filters);
    return res.json(result);
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ error: 'FAILED_TO_FETCH_PRODUCTS' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'PRODUCT_NOT_FOUND' });
    }
    
    // Ensure sellerPhone is included
    return res.json({
      ...product,
      sellerPhone: product.sellerPhone || null
    });
  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({ error: 'FAILED_TO_FETCH_PRODUCT' });
  }
});

// Create product (auth required)
router.post('/', authenticate, validate(createProductSchema), async (req: AuthRequest, res) => {
  try {
    console.log('[Products] Creating product for user:', req.userId);
    console.log('[Products] Product data:', JSON.stringify(req.body, null, 2));
    
    const { User } = await import('../models/User.js');
    const user = await User.findById(req.userId).lean();
    
    if (!user) {
      console.error('[Products] User not found:', req.userId);
      return res.status(401).json({ error: 'USER_NOT_FOUND', message: 'User not found' });
    }

    console.log('[Products] User found:', user.email);
    
    const product = await createProduct(
      req.userId!,
      user.name || 'User',
      req.userEmail!,
      req.body
    );
    
    console.log('[Products] Product created successfully:', product._id);
    
    // Get seller phone number from User model
    const seller = await User.findById(req.userId).select('phone').lean();
    
    // Convert to plain object with string IDs
    const productObj = product.toObject();
    return res.status(201).json({
      ...productObj,
      _id: productObj._id.toString(),
      id: productObj._id.toString(),
      sellerId: productObj.sellerId.toString(),
      sellerPhone: seller?.phone || null
    });
  } catch (error: any) {
    console.error('[Products] Create product error:', error);
    console.error('[Products] Error stack:', error.stack);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: error.message || 'Invalid product data'
      });
    }
    
    // Handle Zod validation errors (from middleware)
    if (error.errors) {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: 'Invalid product data',
        details: error.errors
      });
    }
    
    return res.status(500).json({ 
      error: 'FAILED_TO_CREATE_PRODUCT',
      message: error.message || 'Failed to create product'
    });
  }
});

// Update product (auth + owner check)
router.put('/:id', authenticate, validate(createProductSchema.partial()), async (req: AuthRequest, res) => {
  try {
    const product = await updateProduct(req.params.id, req.userId!, req.body);
    
    if (!product) {
      return res.status(404).json({ error: 'PRODUCT_NOT_FOUND' });
    }
    
    return res.json(product);
  } catch (error: any) {
    if (error.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ error: 'PRODUCT_NOT_FOUND' });
    }
    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({ error: 'UNAUTHORIZED', message: 'You can only edit your own products' });
    }
    console.error('Update product error:', error);
    return res.status(500).json({ error: 'FAILED_TO_UPDATE_PRODUCT' });
  }
});

// Delete product (auth + owner check)
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await deleteProduct(req.params.id, req.userId!);
    return res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    if (error.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ error: 'PRODUCT_NOT_FOUND' });
    }
    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({ error: 'UNAUTHORIZED', message: 'You can only delete your own products' });
    }
    console.error('Delete product error:', error);
    return res.status(500).json({ error: 'FAILED_TO_DELETE_PRODUCT' });
  }
});

// Mark product as sold (auth + owner check)
router.post('/:id/sold', authenticate, async (req: AuthRequest, res) => {
  try {
    const product = await markProductAsSold(req.params.id, req.userId!);
    return res.json(product);
  } catch (error: any) {
    if (error.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ error: 'PRODUCT_NOT_FOUND' });
    }
    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({ error: 'UNAUTHORIZED', message: 'You can only mark your own products as sold' });
    }
    console.error('Mark product as sold error:', error);
    return res.status(500).json({ error: 'FAILED_TO_MARK_SOLD' });
  }
});

export default router;

