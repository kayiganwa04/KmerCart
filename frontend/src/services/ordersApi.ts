import axios from 'axios';
import authService from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface CreateOrderData {
  paymentMethod: string;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  shippingCost?: number;
  discount?: number;
  notes?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerId: any;
  items: any[];
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
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  trackingNumber?: string;
  notes?: string;
  statusHistory: any[];
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

const ordersApi = {
  /**
   * Create order from cart
   */
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    const token = authService.getToken();
    const response = await axios.post(`${API_URL}/orders`, orderData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * Get user's orders (customer or vendor)
   */
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ orders: Order[]; pagination: any }> {
    const token = authService.getToken();
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const response = await axios.get(
      `${API_URL}/orders?${queryParams.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  },

  /**
   * Get single order
   */
  async getOrder(orderId: string): Promise<Order> {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * Update order status (vendor only)
   */
  async updateOrderStatus(
    orderId: string,
    status: string,
    note?: string,
  ): Promise<Order> {
    const token = authService.getToken();
    const response = await axios.patch(
      `${API_URL}/orders/${orderId}/status`,
      { status, note },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  },

  /**
   * Cancel order (customer only)
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const token = authService.getToken();
    const response = await axios.patch(
      `${API_URL}/orders/${orderId}/cancel`,
      { reason },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  },

  /**
   * Get order statistics (vendor only)
   */
  async getOrderStats(): Promise<any> {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/orders/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export default ordersApi;
