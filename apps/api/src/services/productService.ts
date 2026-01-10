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

  // Get user verification status
  const { User } = await import('../models/User.js');
  const user = await User.findById(userId).lean();
  const verified = user?.verified || false;

  const product = new Product({
    ...data,
    sellerId: new mongoose.Types.ObjectId(userId),
    sellerName,
    sellerEmail,
    verified,
    active: true,
    sold: false
  });

  return await product.save();
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
      .select('title description price unit quantity location category images sellerName sellerEmail verified active sold createdAt updatedAt _id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query)
  ]);

  // Add _id as id for frontend compatibility
  const productsWithId = products.map((product: any) => ({
    ...product,
    id: product._id.toString(),
    _id: product._id.toString()
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
  return await Product.findById(id)
    .select('title description price unit quantity location category images sellerId sellerName sellerEmail verified active sold createdAt updatedAt')
    .lean();
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

