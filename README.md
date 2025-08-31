# KmerCart - Modern E-commerce Marketplace

A modern, responsive e-commerce marketplace application built with Next.js 14, inspired by Allegro's design with a Polish touch. This project features a clean, minimal interface with orange accents, comprehensive product management, and smooth animations.

## 🚀 Features

### Core Functionality
- **Homepage** with hero banner, featured products, and category showcase
- **Product Catalog** with detailed product pages and image galleries
- **Shopping Cart** with persistent state management using Zustand
- **User Authentication** with login and registration forms
- **Category Navigation** with subcategory dropdowns
- **Responsive Design** optimized for mobile and desktop

### Design & UX
- **Polish E-commerce Design** with orange color scheme and clean layout
- **Smooth Animations** powered by Framer Motion
- **Interactive Components** with hover effects and transitions
- **Modern UI Elements** using Lucide React icons
- **Tailwind CSS** for responsive styling

### Technical Features
- **Next.js 14** with App Router and TypeScript
- **State Management** with Zustand for cart functionality
- **Persistent Storage** for cart items using localStorage
- **SEO Optimized** with proper meta tags and structured data
- **Performance Optimized** with Next.js Image component

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Image Optimization:** Next.js Image component

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd KmerCart
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── cart/              # Shopping cart page
│   ├── category/[id]/     # Category pages with filtering
│   ├── login/             # User login page
│   ├── product/[id]/      # Individual product pages
│   ├── register/          # User registration page
│   ├── layout.tsx         # Root layout with header/footer
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── Header.tsx         # Main navigation header
│   ├── CategoryNav.tsx    # Category navigation bar
│   ├── ProductCard.tsx    # Product display card
│   └── HeroSection.tsx    # Homepage hero banner
├── data/                  # JSON data files
│   ├── products.json      # Product catalog data
│   └── categories.json    # Category structure
├── store/                 # State management
│   └── cartStore.ts       # Zustand cart store
└── types/                 # TypeScript type definitions
    └── index.ts           # Main type definitions
```

## 🎨 Design System

### Colors
- **Primary Orange:** `#ff5a00` (KmerCart Orange)
- **Dark Orange:** `#e54900` (Hover states)
- **Light Gray:** `#f5f5f5` (Background)
- **Dark Gray:** `#333333` (Text)

### Typography
- **Font Family:** Inter
- **Font Weights:** 300, 400, 500, 600, 700

### Components
- **Responsive Grid Layout**
- **Card-based Design**
- **Smooth Hover Animations**
- **Consistent Spacing** using Tailwind's spacing scale

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

## 🛍️ E-commerce Features

### Shopping Cart
- Add/remove items
- Quantity management
- Persistent storage
- Real-time price calculation
- Checkout interface

### Product Management
- Product categories and filtering
- Search functionality
- Product ratings and reviews
- Image galleries
- Stock status indicators

### User Experience
- Smooth page transitions
- Loading states
- Error handling
- Accessibility features
- SEO optimization

## 🎯 Future Enhancements

- Backend API integration
- Real user authentication
- Payment processing
- Order management
- Product reviews and ratings
- Advanced search and filtering
- Wishlist functionality
- Multi-language support

## 📄 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For support and questions, please open an issue in the repository.

---

Built with ❤️ using Next.js 14 and modern web technologies.
