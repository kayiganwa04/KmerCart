# KmerCart - Complete E-Commerce Platform

A full-featured multi-vendor e-commerce platform with customer and vendor portals, built with Next.js, NestJS, and MongoDB.

## 📋 Table of Contents

1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [Architecture Overview](#architecture-overview)
4. [Installation](#installation)
5. [API Documentation](#api-documentation)
6. [Folder Structure](#folder-structure)
7. [Workflows](#workflows)
8. [Security](#security)
9. [Deployment](#deployment)

---

## 🚀 Features

### Customer Features
- ✅ User registration and authentication
- ✅ Product browsing with advanced filtering and search
- ✅ Shopping cart management (persistent)
- ✅ Secure checkout process
- ✅ Order tracking
- ✅ Profile management
- ✅ Address book
- ✅ Order history
- ✅ Product reviews
- ✅ Wishlist
- ✅ Multi-language support (EN/FR)

### Vendor Features
- ✅ Vendor dashboard with analytics
- ✅ Product management (CRUD)
- ✅ Inventory tracking
- ✅ Order management
- ✅ Sales analytics
- ✅ Payout management
- ✅ Customer reviews management
- ✅ Low stock alerts
- ✅ Revenue tracking

### Admin Features
- ✅ Platform-wide analytics
- ✅ User management
- ✅ Product approval/moderation
- ✅ Order oversight
- ✅ Payout processing
- ✅ Category management
- ✅ Vendor approval

### Technical Features
- ✅ JWT authentication with refresh tokens
- ✅ Role-based access control (Customer, Vendor, Admin)
- ✅ Secure password hashing (bcrypt)
- ✅ MongoDB with Mongoose ODM
- ✅ Input validation and sanitization
- ✅ Pagination and filtering
- ✅ Error handling and logging
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ API documentation (Swagger)
- ✅ Stripe payment integration
- ✅ Email notifications
- ✅ Real-time notifications
- ✅ File upload support

---

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **i18n**: Custom implementation

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT (Passport)
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Payment**: Stripe
- **Email**: Nodemailer
- **Logging**: Winston

### DevOps
- **Version Control**: Git
- **Package Manager**: npm/pnpm
- **Environment**: Node.js 18+
- **Database**: MongoDB 6+

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Next.js)                          │
│  - Customer Portal                                           │
│  - Vendor Dashboard                                          │
│  - Admin Panel                                               │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────────────┐
│                  API LAYER (NestJS)                          │
│  - Authentication & Authorization                            │
│  - Request Validation                                        │
│  - Rate Limiting                                             │
│  - Error Handling                                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                 BUSINESS LOGIC                               │
│  Auth | Products | Orders | Cart | Vendors                  │
│  Payouts | Reviews | Notifications | Payments               │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  DATA LAYER (MongoDB)                        │
│  users | products | orders | carts | payouts                │
│  reviews | notifications | categories                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/pnpm
- MongoDB 6+ (local or Atlas)
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd KmerCart
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configurations
# Required variables:
# - MONGODB_URI
# - JWT_ACCESS_SECRET
# - JWT_REFRESH_SECRET
# - STRIPE_SECRET_KEY
# - EMAIL credentials

# Start development server
npm run start:dev

# Server will run on http://localhost:3001
```

### 3. Frontend Setup

```bash
# Navigate to project root
cd ..

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local

# Start development server
npm run dev

# Frontend will run on http://localhost:3000
```

### 4. Database Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB
brew install mongodb-community@7.0  # macOS
# or
sudo apt install mongodb  # Ubuntu

# Start MongoDB
brew services start mongodb-community@7.0

# Verify
mongosh
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Add to `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kmercart
   ```

### 5. Stripe Setup

```bash
# 1. Create Stripe account at https://stripe.com
# 2. Get API keys from Dashboard
# 3. Add to backend/.env:
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# 4. For webhook testing (optional):
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3001/api/payments/webhook
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Interactive Documentation
Once the backend is running, visit:
```
http://localhost:3001/api/docs
```

### Authentication Endpoints

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "customer"
}
```

**Response:**
```json
{
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "customer"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /auth/login
Login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "user": { ... },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### GET /auth/me
Get current user (requires authentication).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "_id": "...",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "customer"
}
```

### Products Endpoints

#### GET /products
Get all products with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search query
- `category` (string): Category ID
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `inStock` (boolean): Filter by stock
- `sort` (string): Sort field (default: createdAt)
- `order` (string): Sort order (asc/desc)

**Example:**
```
GET /products?page=1&limit=20&category=electronics&minPrice=1000&inStock=true&sort=price&order=asc
```

**Response:**
```json
{
  "data": [
    {
      "_id": "...",
      "name": "Product Name",
      "price": 1500,
      "stock": 50,
      "images": ["..."],
      "category": { ... },
      "vendor": { ... }
    }
  ],
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

#### POST /products
Create a new product (vendor/admin only).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 1500,
  "stock": 50,
  "categoryId": "...",
  "sku": "PROD-001"
}
```

### Orders Endpoints

#### POST /orders
Create a new order (checkout).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": "...",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "street": "123 Main St",
    "city": "Douala",
    "state": "Littoral",
    "zipCode": "12345",
    "country": "Cameroon",
    "phone": "+237..."
  },
  "paymentMethod": "stripe"
}
```

**Response:**
```json
{
  "_id": "...",
  "orderNumber": "ORD-1234567890-ABC",
  "total": 3000,
  "status": "pending",
  "items": [ ... ],
  "shippingAddress": { ... }
}
```

#### GET /orders
Get user orders.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `status`: Filter by status

**Response:**
```json
{
  "data": [
    {
      "_id": "...",
      "orderNumber": "ORD-...",
      "total": 3000,
      "status": "delivered",
      "createdAt": "2025-12-02T..."
    }
  ],
  "meta": { ... }
}
```

### Cart Endpoints

#### GET /cart
Get user cart.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "userId": "...",
  "items": [
    {
      "productId": { ... },
      "quantity": 2,
      "price": 1500
    }
  ]
}
```

#### POST /cart/items
Add item to cart.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "productId": "...",
  "quantity": 2
}
```

### Vendor Endpoints

#### GET /vendor/dashboard
Get vendor dashboard data.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "stats": {
    "totalProducts": 50,
    "totalOrders": 125,
    "revenue": 150000,
    "totalSales": 300
  },
  "recentOrders": [ ... ]
}
```

#### GET /vendor/analytics
Get vendor analytics.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `startDate`: Start date (ISO format)
- `endDate`: End date (ISO format)

**Response:**
```json
{
  "salesByDate": [
    {
      "_id": "2025-12-01",
      "sales": 5000,
      "orders": 10
    }
  ],
  "topProducts": [ ... ],
  "lowStock": [ ... ]
}
```

---

## 📁 Folder Structure

### Complete Project Structure

```
KmerCart/
├── backend/                      # NestJS Backend
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/            # Authentication
│   │   │   │   ├── decorators/
│   │   │   │   ├── dto/
│   │   │   │   ├── guards/
│   │   │   │   ├── strategies/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.module.ts
│   │   │   ├── users/           # User management
│   │   │   ├── products/        # Product management
│   │   │   ├── orders/          # Order management
│   │   │   ├── cart/            # Shopping cart
│   │   │   ├── categories/      # Category management
│   │   │   ├── reviews/         # Product reviews
│   │   │   ├── vendors/         # Vendor operations
│   │   │   ├── payouts/         # Vendor payouts
│   │   │   ├── notifications/   # Notifications
│   │   │   ├── payments/        # Payment processing
│   │   │   └── analytics/       # Analytics
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   ├── interceptors/
│   │   │   ├── logger/
│   │   │   └── utils/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/
│   ├── logs/
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── src/                          # Next.js Frontend
│   ├── app/
│   │   ├── vendor/              # Vendor portal
│   │   │   ├── dashboard/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── inventory/
│   │   │   ├── payouts/
│   │   │   ├── analytics/
│   │   │   └── layout.tsx
│   │   ├── profile/             # Customer profile
│   │   │   ├── orders/
│   │   │   ├── addresses/
│   │   │   └── settings/
│   │   ├── checkout/            # Checkout flow
│   │   ├── orders/              # Order tracking
│   │   ├── cart/                # Shopping cart
│   │   ├── product/[id]/        # Product details
│   │   ├── category/[id]/       # Category pages
│   │   ├── login/               # Login page
│   │   ├── register/            # Registration
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── vendor/
│   │   ├── checkout/
│   │   ├── profile/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── api/                 # API services
│   │   └── hooks/               # Custom hooks
│   ├── contexts/                # React contexts
│   ├── store/                   # State management
│   ├── types/                   # TypeScript types
│   └── data/                    # Mock data
│
├── translation/                  # i18n files
│   ├── en.json
│   └── fr.json
│
├── public/                       # Static assets
│
├── ARCHITECTURE.md              # Architecture documentation
├── IMPLEMENTATION_GUIDE.md      # Implementation guide
├── COMPLETE_API_MODULES.md      # API modules code
├── FRONTEND_IMPLEMENTATION.md   # Frontend code
├── README_COMPLETE.md           # This file
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## 🔄 Workflows

### 1. Customer Purchase Flow

```
1. Browse Products
   ↓
2. Add to Cart
   ↓
3. View Cart & Update Quantities
   ↓
4. Proceed to Checkout
   ↓
5. Enter Shipping Address
   ↓
6. Select Payment Method
   ↓
7. Confirm Order
   ↓
8. Process Payment (Stripe)
   ↓
9. Order Created
   ↓
10. Confirmation Email Sent
    ↓
11. Vendor Notified
    ↓
12. Track Order Status
```

### 2. Vendor Order Fulfillment

```
1. Receive Order Notification
   ↓
2. View Order Details
   ↓
3. Confirm Order
   ↓
4. Update Status: Processing
   ↓
5. Prepare Items
   ↓
6. Ship Order
   ↓
7. Update Status: Shipped
   ↓
8. Add Tracking Number
   ↓
9. Customer Notified
   ↓
10. Order Delivered
    ↓
11. Update Status: Delivered
    ↓
12. Customer Can Review
```

### 3. Vendor Payout Flow

```
1. Vendor Views Sales Dashboard
   ↓
2. Reviews Earnings
   ↓
3. Requests Payout
   ↓
4. System Calculates Amount
   (Total Sales - Commission - Fees)
   ↓
5. Payout Request Created (Pending)
   ↓
6. Admin Reviews Request
   ↓
7. Admin Approves & Processes
   ↓
8. Payment Sent to Vendor Bank
   ↓
9. Payout Status: Completed
   ↓
10. Vendor Notified
```

---

## 🔒 Security

### Authentication
- JWT with access + refresh tokens
- Access token expiry: 15 minutes
- Refresh token expiry: 7 days
- HTTP-only cookies for refresh tokens
- Password hashing with bcrypt (10 rounds)

### Authorization
- Role-based access control (RBAC)
- Route guards for protected endpoints
- Resource ownership validation

### Data Protection
- Input validation with class-validator
- XSS protection
- CORS configuration
- Rate limiting (100 req/15min per IP)
- Helmet.js security headers
- SQL/NoSQL injection prevention

### Payment Security
- PCI DSS compliant (via Stripe)
- No card data stored
- Webhook signature verification
- 3D Secure support

---

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/DigitalOcean)

```bash
# 1. Build application
npm run build

# 2. Set environment variables on platform
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
STRIPE_SECRET_KEY=...
FRONTEND_URL=https://yourdomain.com

# 3. Deploy
# Follow platform-specific instructions
```

### Frontend Deployment (Vercel/Netlify)

```bash
# 1. Build application
npm run build

# 2. Set environment variable
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api

# 3. Deploy
vercel deploy --prod
# or
netlify deploy --prod
```

### Database (MongoDB Atlas)

1. Create production cluster
2. Configure IP whitelist
3. Enable authentication
4. Set up automated backups
5. Monitor performance

---

## 📝 Environment Variables

### Backend (.env)
```bash
NODE_ENV=production
PORT=3001
API_PREFIX=api

MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-password

FRONTEND_URL=https://yourdomain.com
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 🧪 Testing

### Run Tests

```bash
# Backend unit tests
cd backend
npm run test

# Backend e2e tests
npm run test:e2e

# Frontend tests
cd ..
npm run test
```

### Test Accounts

After seeding, you can use these accounts:

**Customer:**
- Email: customer@test.com
- Password: Password123!

**Vendor:**
- Email: vendor@test.com
- Password: Password123!

**Admin:**
- Email: admin@test.com
- Password: Password123!

---

## 📈 Monitoring & Logging

### Logs Location
```
backend/logs/
├── application-YYYY-MM-DD.log
└── error-YYYY-MM-DD.log
```

### Health Check
```bash
curl http://localhost:3001/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-02T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 💬 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@kmercart.com

---

## 🎉 Acknowledgments

- Next.js team for the amazing framework
- NestJS team for the robust backend framework
- MongoDB team for the excellent database
- Stripe for payment processing
- All contributors and testers

---

**Built with ❤️ by the KmerCart Team**
