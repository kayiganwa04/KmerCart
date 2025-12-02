# KmerCart E-Commerce Platform - Complete Architecture

## Overview
KmerCart is a full-featured multi-vendor e-commerce platform built with Next.js 14 (frontend) and NestJS + MongoDB (backend).

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animations**: Framer Motion
- **i18n**: Custom implementation (EN/FR)

### Backend
- **Framework**: NestJS
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (Access + Refresh Tokens)
- **Validation**: class-validator, class-transformer
- **Security**: Helmet, CORS, Rate Limiting
- **Documentation**: Swagger/OpenAPI
- **File Upload**: Multer
- **Email**: Nodemailer
- **Payment**: Stripe Integration

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  Next.js Frontend (Port 3000)                               │
│  - Customer Portal                                           │
│  - Vendor Dashboard                                          │
│  - Admin Panel                                               │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/REST API
┌─────────────────▼───────────────────────────────────────────┐
│                     API GATEWAY LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  NestJS Backend (Port 3001)                                 │
│  - Authentication Middleware                                 │
│  - Rate Limiting                                             │
│  - Request Validation                                        │
│  - Error Handling                                            │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  Modules:                                                    │
│  - Auth Module (JWT, Guards, Strategies)                    │
│  - Users Module (Profile, Addresses)                        │
│  - Products Module (CRUD, Search, Filters)                  │
│  - Categories Module                                         │
│  - Cart Module                                               │
│  - Orders Module (Checkout, Tracking)                       │
│  - Vendors Module (Dashboard, Analytics)                    │
│  - Payouts Module (Vendor Payments)                         │
│  - Reviews Module                                            │
│  - Notifications Module (Email, In-app)                     │
│  - Analytics Module                                          │
│  - Payments Module (Stripe)                                 │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                      DATA LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  MongoDB Database                                            │
│  Collections:                                                │
│  - users, products, categories, orders, carts               │
│  - vendors, payouts, reviews, notifications                 │
│  - addresses, payments, analytics                           │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### User Schema
```typescript
{
  _id: ObjectId,
  email: string (unique, indexed),
  password: string (hashed),
  firstName: string,
  lastName: string,
  role: enum ['customer', 'vendor', 'admin'],
  avatar: string,
  phone: string,
  isEmailVerified: boolean,
  isActive: boolean,
  refreshToken: string,
  vendorProfile: {
    businessName: string,
    businessDescription: string,
    businessAddress: Address,
    taxId: string,
    bankAccount: {
      accountNumber: string,
      routingNumber: string,
      accountHolderName: string
    },
    commissionRate: number,
    isApproved: boolean,
    rating: number,
    totalSales: number,
    joinedDate: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Product Schema
```typescript
{
  _id: ObjectId,
  vendorId: ObjectId (ref: User),
  name: string (indexed),
  slug: string (unique, indexed),
  description: string,
  shortDescription: string,
  categoryId: ObjectId (ref: Category),
  subcategoryId: ObjectId (ref: Category),
  price: number,
  originalPrice: number,
  discount: number,
  currency: string,
  images: [string],
  mainImage: string,
  sku: string (unique),
  stock: number,
  lowStockThreshold: number,
  attributes: [{
    name: string,
    value: string
  }],
  tags: [string],
  isFeatured: boolean,
  isActive: boolean,
  rating: number,
  reviewCount: number,
  totalSales: number,
  weight: number,
  dimensions: {
    length: number,
    width: number,
    height: number
  },
  seo: {
    metaTitle: string,
    metaDescription: string,
    keywords: [string]
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema
```typescript
{
  _id: ObjectId,
  orderNumber: string (unique, indexed),
  customerId: ObjectId (ref: User),
  items: [{
    productId: ObjectId (ref: Product),
    vendorId: ObjectId (ref: User),
    name: string,
    image: string,
    quantity: number,
    price: number,
    discount: number,
    total: number
  }],
  subtotal: number,
  tax: number,
  taxRate: number,
  shippingCost: number,
  discount: number,
  total: number,
  currency: string,
  status: enum [
    'pending', 'confirmed', 'processing',
    'shipped', 'delivered', 'cancelled', 'refunded'
  ],
  paymentStatus: enum ['pending', 'paid', 'failed', 'refunded'],
  paymentMethod: string,
  paymentIntentId: string,
  shippingAddress: {
    fullName: string,
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string,
    phone: string
  },
  billingAddress: {
    fullName: string,
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string
  },
  trackingNumber: string,
  notes: string,
  statusHistory: [{
    status: string,
    timestamp: Date,
    note: string
  }],
  createdAt: Date,
  updatedAt: Date,
  deliveredAt: Date
}
```

### Cart Schema
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  items: [{
    productId: ObjectId (ref: Product),
    quantity: number,
    price: number,
    addedAt: Date
  }],
  updatedAt: Date
}
```

### Category Schema
```typescript
{
  _id: ObjectId,
  name: string,
  slug: string (unique, indexed),
  description: string,
  parentId: ObjectId (ref: Category, nullable),
  image: string,
  icon: string,
  order: number,
  isActive: boolean,
  productCount: number,
  createdAt: Date,
  updatedAt: Date
}
```

### Review Schema
```typescript
{
  _id: ObjectId,
  productId: ObjectId (ref: Product, indexed),
  userId: ObjectId (ref: User),
  orderId: ObjectId (ref: Order),
  rating: number (1-5),
  title: string,
  comment: string,
  images: [string],
  isVerifiedPurchase: boolean,
  helpfulCount: number,
  reportCount: number,
  isApproved: boolean,
  vendorResponse: {
    comment: string,
    respondedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Payout Schema
```typescript
{
  _id: ObjectId,
  vendorId: ObjectId (ref: User, indexed),
  amount: number,
  currency: string,
  status: enum ['pending', 'processing', 'completed', 'failed'],
  paymentMethod: string,
  transactionId: string,
  orders: [ObjectId] (ref: Order),
  period: {
    startDate: Date,
    endDate: Date
  },
  bankAccount: {
    accountNumber: string (masked),
    accountHolderName: string
  },
  notes: string,
  processedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Schema
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, indexed),
  type: enum [
    'order_placed', 'order_shipped', 'order_delivered',
    'payout_processed', 'low_stock', 'new_review',
    'account_update', 'promotion'
  ],
  title: string,
  message: string,
  data: object,
  isRead: boolean,
  link: string,
  createdAt: Date,
  readAt: Date
}
```

## API Endpoints

### Authentication Endpoints
```
POST   /api/auth/register              - Register new user
POST   /api/auth/login                 - Login user
POST   /api/auth/logout                - Logout user
POST   /api/auth/refresh               - Refresh access token
POST   /api/auth/verify-email          - Verify email address
POST   /api/auth/forgot-password       - Request password reset
POST   /api/auth/reset-password        - Reset password
GET    /api/auth/me                    - Get current user
```

### Users Endpoints
```
GET    /api/users/:id                  - Get user by ID
PUT    /api/users/:id                  - Update user profile
DELETE /api/users/:id                  - Delete user (admin only)
GET    /api/users/:id/addresses        - Get user addresses
POST   /api/users/:id/addresses        - Add new address
PUT    /api/users/:id/addresses/:addrId - Update address
DELETE /api/users/:id/addresses/:addrId - Delete address
PUT    /api/users/:id/password         - Change password
POST   /api/users/:id/avatar           - Upload avatar
```

### Products Endpoints
```
GET    /api/products                   - Get all products (paginated, filtered)
GET    /api/products/:id               - Get product by ID
POST   /api/products                   - Create product (vendor only)
PUT    /api/products/:id               - Update product (vendor/admin)
DELETE /api/products/:id               - Delete product (vendor/admin)
GET    /api/products/slug/:slug        - Get product by slug
GET    /api/products/category/:id      - Get products by category
GET    /api/products/vendor/:vendorId  - Get vendor products
POST   /api/products/search            - Search products
POST   /api/products/:id/images        - Upload product images
DELETE /api/products/:id/images/:imageId - Delete product image
```

### Categories Endpoints
```
GET    /api/categories                 - Get all categories
GET    /api/categories/:id             - Get category by ID
POST   /api/categories                 - Create category (admin only)
PUT    /api/categories/:id             - Update category (admin only)
DELETE /api/categories/:id             - Delete category (admin only)
GET    /api/categories/:id/subcategories - Get subcategories
```

### Cart Endpoints
```
GET    /api/cart                       - Get user cart
POST   /api/cart/items                 - Add item to cart
PUT    /api/cart/items/:productId      - Update item quantity
DELETE /api/cart/items/:productId      - Remove item from cart
DELETE /api/cart                       - Clear cart
POST   /api/cart/merge                 - Merge guest cart with user cart
```

### Orders Endpoints
```
GET    /api/orders                     - Get user orders (paginated)
GET    /api/orders/:id                 - Get order by ID
POST   /api/orders                     - Create order (checkout)
PUT    /api/orders/:id                 - Update order (admin/vendor)
DELETE /api/orders/:id                 - Cancel order
GET    /api/orders/:id/invoice         - Get order invoice
GET    /api/orders/:id/track           - Track order
POST   /api/orders/:id/refund          - Request refund
GET    /api/vendor/orders              - Get vendor orders
PUT    /api/vendor/orders/:id/status   - Update order status (vendor)
```

### Reviews Endpoints
```
GET    /api/reviews/product/:productId - Get product reviews
POST   /api/reviews                    - Create review
PUT    /api/reviews/:id                - Update review
DELETE /api/reviews/:id                - Delete review
POST   /api/reviews/:id/helpful        - Mark review helpful
POST   /api/reviews/:id/report         - Report review
POST   /api/reviews/:id/vendor-response - Add vendor response (vendor)
```

### Vendor Endpoints
```
GET    /api/vendor/dashboard           - Get vendor dashboard data
GET    /api/vendor/analytics           - Get vendor analytics
GET    /api/vendor/products            - Get vendor products
GET    /api/vendor/orders              - Get vendor orders
GET    /api/vendor/payouts             - Get vendor payouts
GET    /api/vendor/reviews             - Get vendor reviews
PUT    /api/vendor/profile             - Update vendor profile
GET    /api/vendor/inventory           - Get inventory status
```

### Payouts Endpoints
```
GET    /api/payouts                    - Get payouts (vendor)
GET    /api/payouts/:id                - Get payout by ID
POST   /api/payouts/request            - Request payout (vendor)
GET    /api/admin/payouts              - Get all payouts (admin)
PUT    /api/admin/payouts/:id/process  - Process payout (admin)
```

### Notifications Endpoints
```
GET    /api/notifications              - Get user notifications
PUT    /api/notifications/:id/read     - Mark notification as read
PUT    /api/notifications/read-all     - Mark all as read
DELETE /api/notifications/:id          - Delete notification
```

### Payments Endpoints
```
POST   /api/payments/create-intent     - Create payment intent
POST   /api/payments/confirm           - Confirm payment
POST   /api/payments/webhook           - Stripe webhook
GET    /api/payments/:id               - Get payment details
POST   /api/payments/refund            - Process refund (admin)
```

### Analytics Endpoints
```
GET    /api/analytics/overview         - Get platform overview (admin)
GET    /api/analytics/sales            - Get sales analytics
GET    /api/analytics/products         - Get product analytics
GET    /api/analytics/customers        - Get customer analytics
GET    /api/analytics/vendors          - Get vendor analytics
```

## User Roles & Permissions

### Customer
- Browse products
- Manage cart
- Place orders
- Write reviews
- Manage profile & addresses
- View order history

### Vendor
- All customer permissions
- Create/manage products
- View vendor orders
- Update order status (shipped, etc.)
- View analytics
- Request payouts
- Respond to reviews
- Manage inventory

### Admin
- All vendor permissions
- Manage all users
- Manage all products
- Manage all orders
- Process payouts
- Manage categories
- View platform analytics
- Approve vendors
- Moderate reviews

## Security Features

### Authentication
- JWT with access + refresh tokens
- Access token: 15 minutes expiry
- Refresh token: 7 days expiry
- Secure HTTP-only cookies for refresh tokens
- Password hashing with bcrypt (10 rounds)

### Authorization
- Role-based access control (RBAC)
- Route guards for protected endpoints
- Resource ownership validation

### Data Protection
- Input validation with class-validator
- SQL/NoSQL injection prevention
- XSS protection with sanitization
- CORS configuration
- Rate limiting (100 req/15min per IP)
- Helmet.js security headers

### Payment Security
- PCI DSS compliant (via Stripe)
- No card data stored
- Webhook signature verification
- 3D Secure support

## Error Handling

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict (duplicate resources)
- 429: Too Many Requests
- 500: Internal Server Error

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ],
  "timestamp": "2025-12-02T10:30:00.000Z",
  "path": "/api/auth/register"
}
```

## Pagination & Filtering

### Query Parameters
```
?page=1              - Page number (default: 1)
?limit=20            - Items per page (default: 20, max: 100)
?sort=createdAt      - Sort field
?order=desc          - Sort order (asc/desc)
?search=keyword      - Search query
?category=id         - Filter by category
?minPrice=10         - Minimum price
?maxPrice=100        - Maximum price
?inStock=true        - Filter by stock
?vendor=id           - Filter by vendor
```

### Response Format
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Workflows

### Customer Registration & Login
1. User submits registration form
2. Backend validates input
3. Password is hashed
4. User created in database
5. Verification email sent
6. User clicks email link
7. Email verified
8. User logs in
9. JWT tokens issued
10. User redirected to dashboard

### Product Purchase Flow
1. Customer browses products
2. Adds products to cart
3. Proceeds to checkout
4. Enters shipping address
5. Selects payment method
6. Creates Stripe payment intent
7. Confirms payment
8. Order created in database
9. Inventory decremented
10. Confirmation email sent
11. Vendor notified
12. Order appears in dashboards

### Vendor Payout Flow
1. Vendor reviews sales in dashboard
2. Requests payout
3. System calculates commission
4. Payout request created (pending)
5. Admin reviews payout
6. Admin approves & processes
7. Payment sent to vendor bank
8. Payout status updated (completed)
9. Vendor notified
10. Transaction recorded

### Order Fulfillment Flow
1. Order placed by customer
2. Vendor receives notification
3. Vendor confirms order
4. Vendor updates status to "processing"
5. Vendor ships order
6. Vendor updates status to "shipped"
7. Vendor adds tracking number
8. Customer receives notification
9. Customer tracks order
10. Delivery confirmed
11. Status updated to "delivered"
12. Review request sent to customer

## Performance Optimization

### Database
- Indexed fields (email, slug, productId, userId)
- Compound indexes for common queries
- Database query optimization
- Connection pooling

### Caching
- Redis for session management
- Cache frequent queries (categories, featured products)
- CDN for static assets

### API
- Response compression (gzip)
- Pagination for large datasets
- Lazy loading for images
- Request debouncing

## Monitoring & Logging

### Logging
- Winston logger
- Log levels: error, warn, info, debug
- Structured logging (JSON format)
- Request/response logging
- Error stack traces

### Monitoring
- Health check endpoint
- Performance metrics
- Error tracking (Sentry)
- Uptime monitoring

## Deployment

### Environment Variables
```
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
EMAIL_HOST=...
EMAIL_USER=...
EMAIL_PASS=...
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://...
```

### Production Considerations
- HTTPS required
- Environment-based configs
- Database backups
- Load balancing
- Horizontal scaling
- CI/CD pipeline
- Docker containerization

## Testing Strategy

### Unit Tests
- Service layer tests
- Utility function tests
- 80% code coverage target

### Integration Tests
- API endpoint tests
- Database operation tests
- Authentication flow tests

### E2E Tests
- Complete user workflows
- Payment processing
- Order fulfillment

---

## Quick Start

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables
npm run start:dev
```

### Frontend Setup
```bash
cd KmerCart
npm install
cp .env.local.example .env.local
# Configure environment variables
npm run dev
```

### Access
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api/docs
