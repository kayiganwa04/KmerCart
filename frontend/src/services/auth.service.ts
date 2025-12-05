import api from './api';
import { useCartStore } from '@/store/cartStore';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'customer' | 'vendor';
  phone?: string;
  vendorProfile?: {
    businessName: string;
    businessDescription: string;
    businessAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    taxId: string;
    bankAccount: {
      accountNumber: string;
      routingNumber: string;
      accountHolderName: string;
    };
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    const { user, accessToken, refreshToken } = response.data;

    // Store tokens and user data
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    // Also set cookies so server-side middleware and API routes can read auth/user
    try {
      // Expires in 7 days
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `accessToken=${accessToken}; path=/; expires=${expires}`;
      document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; expires=${expires}`;
    } catch (e) {
      // ignore when cookies are not available
    }

    // Notify other parts of the app that auth state changed
    try {
      // If there is a guest cart, sync it to the server now (lazy-import cartApi to avoid circular deps)
      try {
        const localItems = useCartStore.getState().items || [];
        if (localItems.length > 0) {
          const guestItems = localItems.map((li) => ({ productId: (li.product as any).id, quantity: li.quantity }));
          try {
            const cartApi = (await import('./cartApi')).default;
            await cartApi.syncCart(guestItems);
            // Clear guest cart since server now holds the cart
            try { useCartStore.getState().clearCart(); } catch (e) { /* ignore */ }
          } catch (e) {
            console.error('Failed to sync guest cart on register:', e);
          }
        }
      } catch (e) {
        console.error('Failed to read guest cart on register:', e);
      }

      window.dispatchEvent(new CustomEvent('authChanged', { detail: { user } }));
    } catch (e) {
      // ignore in non-browser environments
    }

    return response.data;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    const { user, accessToken, refreshToken } = response.data;

    // Store tokens and user data
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    // Also set cookies so server-side middleware and API routes can read auth/user
    try {
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `accessToken=${accessToken}; path=/; expires=${expires}`;
      document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; expires=${expires}`;
    } catch (e) {
      // ignore when cookies are not available
    }

    // Notify other parts of the app that auth state changed
    try {
      // Sync guest cart to server when logging in (lazy-import cartApi to avoid circular deps)
      try {
        const localItems = useCartStore.getState().items || [];
        if (localItems.length > 0) {
          const guestItems = localItems.map((li) => ({ productId: (li.product as any).id, quantity: li.quantity }));
          try {
            const cartApi = (await import('./cartApi')).default;
            await cartApi.syncCart(guestItems);
            // Clear guest cart locally after successful sync
            try { useCartStore.getState().clearCart(); } catch (e) { /* ignore */ }
          } catch (e) {
            console.error('Failed to sync guest cart on login:', e);
          }
        }
      } catch (e) {
        console.error('Failed to read guest cart on login:', e);
      }

      window.dispatchEvent(new CustomEvent('authChanged', { detail: { user } }));
    } catch (e) {
      // ignore in non-browser environments
    }

    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      try {
        // Clear guest cart from zustand store and remove persisted storage
        const clear = useCartStore.getState().clearCart;
        if (typeof clear === 'function') clear();
      } catch (e) {
        // fallback: remove persisted localStorage entry
        try { localStorage.removeItem('cart-storage'); } catch (e) { /* ignore */ }
      }
      try {
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      } catch (e) {
        // ignore
      }

      // Notify other parts of the app that auth state changed
      try {
        window.dispatchEvent(new CustomEvent('authChanged', { detail: { user: null } }));
        // Notify other parts that cart was cleared
        try { window.dispatchEvent(new CustomEvent('cartCleared')); } catch (e) { /* ignore */ }
      } catch (e) {
        // ignore in non-browser environments
      }
    }
  }

  async getProfile(): Promise<any> {
    const response = await api.get('/auth/profile');
    return response.data;
  }

  getCurrentUser(): any | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}

export default new AuthService();
