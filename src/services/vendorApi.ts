import api from './api';

export interface VendorProfile {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  vendorProfile: {
    businessName: string;
    businessDescription?: string;
    businessAddress?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    taxId?: string;
    bankAccount?: {
      accountNumber?: string;
      routingNumber?: string;
      accountHolderName?: string;
    };
    isApproved: boolean;
    rating?: number;
    totalSales?: number;
    commissionRate?: number;
    joinedDate?: Date;
  };
}

export interface Product {
  _id: string;
  vendorId: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  subcategoryId?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  currency: string;
  images: string[];
  mainImage?: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  attributes?: Array<{ name: string; value: string }>;
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  totalSales: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerId: any;
  items: Array<{
    productId: string;
    vendorId: string;
    name: string;
    image?: string;
    quantity: number;
    price: number;
    discount: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  taxRate: number;
  shippingCost: number;
  discount: number;
  total: number;
  currency: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: any;
  billingAddress?: any;
  trackingNumber?: string;
  notes?: string;
  statusHistory: Array<{
    status: string;
    timestamp: Date;
    note?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  deliveredAt?: Date;
}

export interface DashboardStats {
  products: {
    total: number;
    active: number;
    lowStock: number;
    outOfStock: number;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
  };
  sales: {
    total: number;
    revenue: number;
  };
  recentOrders: Order[];
}

export interface SalesAnalytics {
  dailySales: Array<{
    _id: string;
    sales: number;
    orders: number;
  }>;
  topProducts: Array<{
    _id: string;
    productName: string;
    totalSold: number;
    revenue: number;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

class VendorApiService {
  // Profile Management
  async getProfile(): Promise<VendorProfile> {
    const response = await api.get('/vendors/profile');
    return response.data;
  }

  async updateProfile(data: Partial<VendorProfile['vendorProfile']>): Promise<VendorProfile> {
    const response = await api.put('/vendors/profile', data);
    return response.data;
  }

  // Dashboard Statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get('/vendors/dashboard/stats');
    return response.data;
  }

  async getSalesAnalytics(startDate?: Date, endDate?: Date): Promise<SalesAnalytics> {
    const params: any = {};
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();

    const response = await api.get('/vendors/analytics/sales', { params });
    return response.data;
  }

  // Product Management
  async createProduct(data: Partial<Product>): Promise<Product> {
    const response = await api.post('/vendors/products', data);
    return response.data;
  }

  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive' | 'low-stock' | 'out-of-stock';
  }): Promise<{ products: Product[]; pagination: any }> {
    const response = await api.get('/vendors/products', { params });
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await api.get(`/vendors/products/${id}`);
    return response.data;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const response = await api.put(`/vendors/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/vendors/products/${id}`);
    return response.data;
  }

  async updateProductStock(id: string, stock: number): Promise<Product> {
    const response = await api.patch(`/vendors/products/${id}/stock`, { stock });
    return response.data;
  }

  // Order Management
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ orders: Order[]; pagination: any }> {
    const response = await api.get('/vendors/orders', { params });
    return response.data;
  }

  async getOrder(id: string): Promise<Order> {
    const response = await api.get(`/vendors/orders/${id}`);
    return response.data;
  }

  async updateOrderStatus(
    id: string,
    data: {
      status: string;
      trackingNumber?: string;
      note?: string;
    }
  ): Promise<Order> {
    const response = await api.patch(`/vendors/orders/${id}/status`, data);
    return response.data;
  }
}

export const vendorApi = new VendorApiService();
export default vendorApi;
