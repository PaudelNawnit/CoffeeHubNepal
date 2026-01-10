import { Product, ProductDocument } from '../models/Product.js';
import mongoose from 'mongoose';

export interface CreateProductData {
  title: string;
  description: string;
  price: number;
  unit: string;
  quantity: number;
  location: string;
  category: string;
  images?: string[];
}

export const createProduct = async (userId: string, sellerName: string, sellerEmail: string, data: CreateProductData): Promise<ProductDocument> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID');
  }

  console.log('[ProductService] Creating product with data:', {
    userId,
    sellerName,
    sellerEmail,
    title: data.title,
    price: data.price,
    quantity: data.quantity,
    category: data.category
  });

  // Get user verification status
  const { User } = await import('../models/User.js');
  const user = await User.findById(userId).lean();
  const verified = user?.verified || false;

  console.log('[ProductService] User verification status:', verified);

  try {
    const product = new Product({
      ...data,
      sellerId: new mongoose.Types.ObjectId(userId),
      sellerName,
      sellerEmail,
      verified,
      active: true,
      sold: false
    });

    const savedProduct = await product.save();
    console.log('[ProductService] Product saved successfully:', savedProduct._id);
    return savedProduct;
  } catch (error: any) {
    console.error('[ProductService] Error saving product:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      throw new Error(`Validation error: ${errors.join(', ')}`);
    }
    throw error;
  }
};

export const getProducts = async (filters?: {
  category?: string;
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
  sellerId?: string;
}) => {
  const page = filters?.page || 1;
  const limit = Math.min(filters?.limit || 20, 50);
  const skip = (page - 1) * limit;

  const query: any = {
    active: { $ne: false }, // active is true or undefined (defaults to true)
    sold: { $ne: true } // sold is false or undefined (defaults to false)
  };

  if (filters?.category) {
    query.category = filters.category;
  }

  if (filters?.location) {
    query.location = { $regex: filters.location, $options: 'i' };
  }

  if (filters?.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } }
    ];
  }

  if (filters?.sellerId) {
    query.sellerId = new mongoose.Types.ObjectId(filters.sellerId);
  }

  const [products, total] = await Promise.all([
    Product.find(query)
      .select('title description price unit quantity location category images sellerName sellerEmail sellerId verified active sold createdAt updatedAt _id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query)
  ]);

  // Get seller phone numbers from User model
  const { User } = await import('../models/User.js');
  const sellerIds = products.map((p: any) => p.sellerId).filter(Boolean);
  const sellers = await User.find({ _id: { $in: sellerIds } })
    .select('_id phone')
    .lean();
  
  const sellerPhoneMap = new Map(
    sellers.map((s: any) => [s._id.toString(), s.phone || null])
  );

  // Add _id as id for frontend compatibility and include phone number
  const productsWithId = products.map((product: any) => ({
    ...product,
    id: product._id.toString(),
    _id: product._id.toString(),
    sellerId: product.sellerId?.toString(),
    sellerPhone: sellerPhoneMap.get(product.sellerId?.toString()) || null
  }));

  return {
    products: productsWithId,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const getProductById = async (id: string): Promise<any> => {
  const product = await Product.findById(id)
    .select('title description price unit quantity location category images sellerId sellerName sellerEmail verified active sold createdAt updatedAt')
    .lean();
  
  if (!product) {
    return null;
  }

  // Get seller phone number from User model
  const { User } = await import('../models/User.js');
  const seller = await User.findById(product.sellerId)
    .select('phone')
    .lean();
  
  return {
    ...product,
    _id: product._id.toString(),
    id: product._id.toString(),
    sellerId: product.sellerId?.toString(),
    sellerPhone: seller?.phone || null
  };
};

export const updateProduct = async (id: string, userId: string, data: Partial<CreateProductData>): Promise<any> => {
  const product = await Product.findById(id).lean();
  
  if (!product) {
    throw new Error('PRODUCT_NOT_FOUND');
  }

  if (product.sellerId.toString() !== userId) {
    throw new Error('UNAUTHORIZED');
  }

  const updated = await Product.findByIdAndUpdate(
    id,
    { ...data },
    { new: true, runValidators: true }
  ).lean();

  return updated;
};

export const deleteProduct = async (id: string, userId: string): Promise<boolean> => {
  const product = await Product.findById(id).lean();
  
  if (!product) {
    throw new Error('PRODUCT_NOT_FOUND');
  }

  if (product.sellerId.toString() !== userId) {
    throw new Error('UNAUTHORIZED');
  }

  await Product.findByIdAndUpdate(id, { active: false });
  return true;
};

export const markProductAsSold = async (id: string, userId: string): Promise<any> => {
  const product = await Product.findById(id).lean();
  
  if (!product) {
    throw new Error('PRODUCT_NOT_FOUND');
  }

  if (product.sellerId.toString() !== userId) {
    throw new Error('UNAUTHORIZED');
  }

  return await Product.findByIdAndUpdate(
    id,
    { sold: true, active: false },
    { new: true }
  ).lean();
};

