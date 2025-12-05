import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  mainImage?: string;
  stock: number;
  lowStockThreshold: number;
  sku: string;
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  totalSales: number;
  tags: string[];
  categoryId?: {
    _id: string;
    name: string;
    slug: string;
  };
  subcategoryId?: {
    _id: string;
    name: string;
    slug: string;
  };
  vendorId?: {
    _id: string;
    businessName: string;
    rating: number;
    businessDescription?: string;
  };
  weight?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  featured?: boolean;
}

const productsApi = {
  /**
   * Get all products with optional filters
   */
  async getProducts(query: ProductQuery = {}): Promise<ProductsResponse> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.category) params.append('category', query.category);
    if (query.subcategory) params.append('subcategory', query.subcategory);
    if (query.minPrice !== undefined) params.append('minPrice', query.minPrice.toString());
    if (query.maxPrice !== undefined) params.append('maxPrice', query.maxPrice.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);
    if (query.featured !== undefined) params.append('featured', query.featured.toString());

    const response = await axios.get(`${API_URL}/products?${params.toString()}`);
    return response.data;
  },

  /**
   * Get featured products for homepage
   */
  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    const response = await axios.get(`${API_URL}/products/featured?limit=${limit}`);
    return response.data;
  },

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<Product> {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
  },

  /**
   * Get a single product by slug
   */
  async getProductBySlug(slug: string): Promise<Product> {
    const response = await axios.get(`${API_URL}/products/slug/${slug}`);
    return response.data;
  },

  /**
   * Get products by category
   */
  async getProductsByCategory(
    categoryId: string,
    options: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<ProductsResponse> {
    const params = new URLSearchParams();

    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);

    const response = await axios.get(
      `${API_URL}/products/category/${categoryId}?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get related products
   */
  async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    const response = await axios.get(
      `${API_URL}/products/${productId}/related?limit=${limit}`
    );
    return response.data;
  },

  /**
   * Search products with autocomplete
   */
  async searchProducts(searchTerm: string, limit: number = 10): Promise<Product[]> {
    const response = await axios.get(
      `${API_URL}/products/search?q=${encodeURIComponent(searchTerm)}&limit=${limit}`
    );
    return response.data;
  },
};

export default productsApi;
