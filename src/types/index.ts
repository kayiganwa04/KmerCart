export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  description: string;
  category: string;
  seller: {
    name: string;
    rating: number;
    reviewCount: number;
  };
  rating: number;
  reviewCount: number;
  inStock: boolean;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
