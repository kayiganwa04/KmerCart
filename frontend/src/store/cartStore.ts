import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product } from '@/types';
import authService from '@/services/auth.service';
import cartApi from '@/services/cartApi';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: async (product: Product) => {
        // Deterministic product id normalization to avoid duplicates
        const pid = (product as any).id || (product as any)._id || (product as any).slug || (product as any).title || '';
        const normalizedProduct = {
          ...product,
          id: pid,
        } as Product;
        // If user is authenticated, add to server cart and then sync local store
        if (authService.isAuthenticated()) {
          try {
            const serverCart = await cartApi.addItem(product.id, 1);
            // Map server cart to local shape
            const mapped = (serverCart.items || []).map((si: any) => ({
              product: {
                id: si.productId._id,
                title: si.productId.name || si.productId.title || 'Product',
                price: si.productId.price || 0,
                originalPrice: si.productId.originalPrice,
                image: si.productId.mainImage || (si.productId.images && si.productId.images[0]) || '',
                images: si.productId.images || [],
                description: si.productId.description || '',
                category: si.productId.category || '',
                seller: {
                  name: si.productId.seller?.name || 'Unknown Seller',
                  rating: si.productId.seller?.rating || 0,
                  reviewCount: si.productId.reviewCount || 0,
                },
                rating: si.productId.rating || 0,
                reviewCount: si.productId.reviewCount || 0,
                inStock: (si.productId.stock || 0) > 0,
              },
              quantity: si.quantity,
            }));

            set({ items: mapped });
            return;
          } catch (e) {
            console.error('Failed to add item to server cart, falling back to local', e);
            // fallthrough to local update
          }
        }

        const items = get().items;
        const existingItem = items.find(item => ((item.product as any).id || (item.product as any)._id || (item.product as any).slug || (item.product as any).title) === pid);
        
        if (existingItem) {
          set({
            items: items.map(item =>
              (item.product as any).id === pid
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          });
        } else {
          set({
            items: [...items, { product: normalizedProduct, quantity: 1 }]
          });
        }
      },
      
      removeItem: async (productId: string) => {
        const pid = productId;
        if (authService.isAuthenticated()) {
          try {
            const serverCart = await cartApi.removeItem(productId);
            const mapped = (serverCart.items || []).map((si: any) => ({
              product: {
                id: si.productId._id,
                title: si.productId.name || si.productId.title || 'Product',
                price: si.productId.price || 0,
                originalPrice: si.productId.originalPrice,
                image: si.productId.mainImage || (si.productId.images && si.productId.images[0]) || '',
                images: si.productId.images || [],
                description: si.productId.description || '',
                category: si.productId.category || '',
                seller: {
                  name: si.productId.seller?.name || 'Unknown Seller',
                  rating: si.productId.seller?.rating || 0,
                  reviewCount: si.productId.reviewCount || 0,
                },
                rating: si.productId.rating || 0,
                reviewCount: si.productId.reviewCount || 0,
                inStock: (si.productId.stock || 0) > 0,
              },
              quantity: si.quantity,
            }));

            set({ items: mapped });
            return;
          } catch (e) {
            console.error('Failed to remove item from server cart, falling back to local', e);
            // fallthrough to local update
          }
        }

        set({
          items: get().items.filter(item => ((item.product as any).id || (item.product as any)._id || (item.product as any).slug || (item.product as any).title) !== pid)
        });
      },
      
      updateQuantity: async (productId: string, quantity: number) => {
        if (quantity <= 0) {
          await get().removeItem(productId);
          return;
        }

        if (authService.isAuthenticated()) {
          try {
            const serverCart = await cartApi.updateItemQuantity(productId, quantity);
            const mapped = (serverCart.items || []).map((si: any) => ({
              product: {
                id: si.productId._id,
                title: si.productId.name || si.productId.title || 'Product',
                price: si.productId.price || 0,
                originalPrice: si.productId.originalPrice,
                image: si.productId.mainImage || (si.productId.images && si.productId.images[0]) || '',
                images: si.productId.images || [],
                description: si.productId.description || '',
                category: si.productId.category || '',
                seller: {
                  name: si.productId.seller?.name || 'Unknown Seller',
                  rating: si.productId.seller?.rating || 0,
                  reviewCount: si.productId.reviewCount || 0,
                },
                rating: si.productId.rating || 0,
                reviewCount: si.productId.reviewCount || 0,
                inStock: (si.productId.stock || 0) > 0,
              },
              quantity: si.quantity,
            }));

            set({ items: mapped });
            return;
          } catch (e) {
            console.error('Failed to update server cart quantity, falling back to local', e);
            // fallthrough to local update
          }
        }

        const pid = productId;
        set({
          items: get().items.map(item =>
            (((item.product as any).id || (item.product as any)._id || (item.product as any).slug || (item.product as any).title) === pid)
              ? { ...item, quantity }
              : item
          )
        });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + (item.product.price * item.quantity),
          0
        );
      },
      
      getTotalItems: () => {
        return get().items.reduce(
          (total, item) => total + item.quantity,
          0
        );
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        try {
          if (state && (state as any).items && Array.isArray((state as any).items)) {
            const items: any[] = (state as any).items;
            const map: Record<string, any> = {};

            for (const it of items) {
              const p = it.product || {};
              const key = p.id || p._id || p.slug || p.title || '';
              if (!key) continue;
              if (!map[key]) {
                // normalize stored product id
                map[key] = { ...it, product: { ...p, id: key } };
              } else {
                map[key].quantity = (map[key].quantity || 0) + (it.quantity || 0);
              }
            }

            const merged = Object.values(map);
            (state as any).items = merged;
          }
        } catch (e) {
          // ignore errors during migration
          console.error('Failed to rehydrate cart store:', e);
        }
      },
    }
  )
);
