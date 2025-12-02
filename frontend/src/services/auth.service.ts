import api from './api';

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
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      } catch (e) {
        // ignore
      }

      // Notify other parts of the app that auth state changed
      try {
        window.dispatchEvent(new CustomEvent('authChanged', { detail: { user: null } }));
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

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}

export default new AuthService();
