import axios from 'axios';
import authService from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface CartItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    mainImage?: string;
    images: string[];
    stock: number;
    isActive: boolean;
  };
  quantity: number;
  price: number;
  addedAt: Date;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  updatedAt: Date;
}

const cartApi = {
  /**
   * Get user's cart
   */
  async getCart(): Promise<Cart> {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * Add item to cart
   */
  async addItem(productId: string, quantity: number = 1): Promise<Cart> {
    const token = authService.getToken();
    const response = await axios.post(
      `${API_URL}/cart/items`,
      { productId, quantity },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  },

  /**
   * Update item quantity
   */
  async updateItemQuantity(productId: string, quantity: number): Promise<Cart> {
    const token = authService.getToken();
    const response = await axios.put(
      `${API_URL}/cart/items/${productId}`,
      { quantity },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  },

  /**
   * Remove item from cart
   */
  async removeItem(productId: string): Promise<Cart> {
    const token = authService.getToken();
    const response = await axios.delete(`${API_URL}/cart/items/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * Clear cart
   */
  async clearCart(): Promise<{ message: string }> {
    const token = authService.getToken();
    const response = await axios.delete(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * Sync guest cart with user cart (on login)
   */
  async syncCart(guestItems: Array<{ productId: string; quantity: number }>): Promise<Cart> {
    const token = authService.getToken();
    const response = await axios.post(
      `${API_URL}/cart/sync`,
      { items: guestItems },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  },

  /**
   * Get cart total
   */
  async getCartTotal(): Promise<{ subtotal: number; totalItems: number; items: number }> {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/cart/total`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

export default cartApi;
