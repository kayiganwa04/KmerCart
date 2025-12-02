# KmerCart - Quick Start Guide

Get your e-commerce platform up and running in 15 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] MongoDB installed (or MongoDB Atlas account)
- [ ] Git installed
- [ ] Stripe account (for payments)
- [ ] Email account (Gmail recommended)

---

## 🚀 Installation (5 minutes)

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Edit `backend/.env`:**
```bash
# Required - Change these!
MONGODB_URI=mongodb://localhost:27017/kmercart
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # Use app password, not regular password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

```bash
# Start backend server
npm run start:dev

# Backend running at http://localhost:3001
# API docs at http://localhost:3001/api/docs
```

### Step 2: Frontend Setup

```bash
# Open new terminal, go to project root
cd ..

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local

# Start frontend
npm run dev

# Frontend running at http://localhost:3000
```

### Step 3: MongoDB Setup

**Option A: Local MongoDB**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt install mongodb
sudo systemctl start mongodb

# Verify
mongosh
```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up/Login
3. Create free cluster
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kmercart
   ```

---

## ✅ Verification (2 minutes)

### Test Backend
```bash
# Health check
curl http://localhost:3001/api/health

# Should return:
# {"status":"ok","timestamp":"...","uptime":...}
```

### Test Frontend
Open browser: `http://localhost:3000`

You should see the KmerCart homepage!

---

## 👤 Create Test Accounts (3 minutes)

### Method 1: Using API (Recommended)

**Create Customer Account:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "Password123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "customer"
  }'
```

**Create Vendor Account:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@test.com",
    "password": "Password123!",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "vendor"
  }'
```

**Create Admin Account:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Password123!",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

### Method 2: Using Frontend

1. Go to `http://localhost:3000/register`
2. Fill in the form
3. Select role (Customer/Vendor)
4. Click Register

---

## 🛍️ Create Sample Products (5 minutes)

### Using Swagger UI (Easiest)

1. Go to `http://localhost:3001/api/docs`
2. Click on `POST /api/auth/login`
3. Click "Try it out"
4. Login with vendor account:
   ```json
   {
     "email": "vendor@test.com",
     "password": "Password123!"
   }
   ```
5. Copy the `accessToken` from response
6. Click "Authorize" button (🔒 at top)
7. Paste token: `Bearer <your-token-here>`
8. Click on `POST /api/products`
9. Click "Try it out"
10. Enter product data:
    ```json
    {
      "name": "Smartphone X1",
      "description": "Latest smartphone with amazing features",
      "shortDescription": "Premium smartphone",
      "price": 150000,
      "originalPrice": 200000,
      "stock": 50,
      "sku": "PHONE-X1-001",
      "categoryId": "use-existing-category-id",
      "tags": ["electronics", "featured", "new"]
    }
    ```
11. Click "Execute"

### Using Frontend (Vendor Portal)

1. Go to `http://localhost:3000/login`
2. Login with vendor credentials
3. You'll be redirected to `http://localhost:3000/vendor/dashboard`
4. Click "Products" in sidebar
5. Click "Add Product" button
6. Fill in the form
7. Click "Create Product"

---

## 🧪 Test Complete Flow (5 minutes)

### 1. Customer Journey

**Browse & Add to Cart:**
1. Go to homepage: `http://localhost:3000`
2. Browse products
3. Click on a product
4. Click "Add to Cart"
5. View cart icon (should show 1)

**Checkout:**
1. Click cart icon
2. Review items
3. Click "Proceed to Checkout"
4. Login if not logged in
5. Enter shipping address:
   - Full Name: John Doe
   - Street: 123 Main Street
   - City: Douala
   - State: Littoral
   - Zip: 12345
   - Country: Cameroon
   - Phone: +237123456789
6. Click "Continue to Payment"
7. Select payment method: "Stripe"
8. Review order
9. Click "Place Order"

**Track Order:**
1. Go to Profile → Orders
2. View order status
3. Click on order to see details

### 2. Vendor Journey

**View Dashboard:**
1. Login as vendor
2. Go to `http://localhost:3000/vendor/dashboard`
3. View stats: Orders, Revenue, Products

**Manage Order:**
1. Click "Orders" in sidebar
2. View order list
3. Click on an order
4. Update status: "Processing" → "Shipped"
5. Add tracking number
6. Save

**View Analytics:**
1. Click "Analytics" in sidebar
2. View sales chart
3. View top products
4. Check low stock items

---

## 🎨 Customization

### Change Currency

**Backend:** Edit `backend/.env`
```bash
DEFAULT_CURRENCY=USD  # or EUR, GBP, etc.
```

**Frontend:** Edit `src/app/cart/page.tsx` and all price displays

### Change Commission Rate

Edit `backend/.env`:
```bash
DEFAULT_COMMISSION_RATE=0.15  # 15%
```

### Change Tax Rate

Edit `backend/.env`:
```bash
TAX_RATE=0.10  # 10%
```

### Add Languages

1. Add translation file: `translation/es.json`
2. Copy structure from `translation/en.json`
3. Translate all keys
4. Update language selector in `src/components/Header.tsx`

---

## 🐛 Troubleshooting

### Backend won't start

**Error: "Cannot connect to MongoDB"**
```bash
# Check if MongoDB is running
mongosh

# If not running:
brew services start mongodb-community  # macOS
sudo systemctl start mongodb  # Linux
```

**Error: "Port 3001 already in use"**
```bash
# Find and kill process
lsof -ti:3001 | xargs kill -9

# Or change port in backend/.env
PORT=3002
```

### Frontend won't start

**Error: "Port 3000 already in use"**
```bash
# Kill process
lsof -ti:3000 | xargs kill -9

# Or run on different port
npm run dev -- -p 3001
```

**Error: "Cannot connect to API"**
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify backend is running on correct port
- Check for CORS errors in browser console

### Authentication issues

**Error: "Unauthorized"**
- Token might be expired
- Logout and login again
- Clear localStorage: `localStorage.clear()`

**Error: "Invalid credentials"**
- Check email and password
- Passwords are case-sensitive
- Must have uppercase, lowercase, and number

### Payment issues

**Error: "Stripe key not found"**
- Check `STRIPE_SECRET_KEY` in `backend/.env`
- Get test keys from: https://dashboard.stripe.com/test/apikeys

**Error: "Payment failed"**
Use Stripe test cards:
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- Expiry: Any future date
- CVC: Any 3 digits

---

## 📚 Next Steps

1. **Read Full Documentation:**
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
   - [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Code examples
   - [COMPLETE_API_MODULES.md](./COMPLETE_API_MODULES.md) - All API modules
   - [FRONTEND_IMPLEMENTATION.md](./FRONTEND_IMPLEMENTATION.md) - Frontend code

2. **Explore API:**
   - Swagger UI: http://localhost:3001/api/docs
   - Test all endpoints
   - Understand request/response formats

3. **Customize:**
   - Update branding colors in `tailwind.config.ts`
   - Add your logo to `public/`
   - Modify email templates
   - Add custom features

4. **Deploy:**
   - See deployment guide in [README_COMPLETE.md](./README_COMPLETE.md)
   - Set up production database
   - Configure production Stripe keys
   - Set up SSL/HTTPS

---

## 🎯 Quick Commands Reference

```bash
# Backend
cd backend
npm run start:dev      # Start development server
npm run build          # Build for production
npm run start:prod     # Start production server
npm run test           # Run tests

# Frontend
npm run dev            # Start development server
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Lint code

# Database
mongosh                # Open MongoDB shell
mongosh --eval "use kmercart; db.dropDatabase()"  # Reset database

# Useful URLs
http://localhost:3000              # Frontend
http://localhost:3001              # Backend
http://localhost:3001/api/docs     # API Documentation
http://localhost:3001/api/health   # Health Check
```

---

## ✨ Features to Try

- [ ] Customer registration and login
- [ ] Browse products with filters
- [ ] Add products to cart
- [ ] Complete checkout process
- [ ] Track order status
- [ ] Write product review
- [ ] Vendor dashboard
- [ ] Create new products
- [ ] Manage inventory
- [ ] Process orders
- [ ] View analytics
- [ ] Request payout
- [ ] Admin panel
- [ ] Manage all users
- [ ] Approve vendors
- [ ] Process payouts

---

## 💡 Tips

1. **Use Swagger UI** for API testing - it's interactive and easy
2. **Enable auto-save** in your code editor for hot reload
3. **Check logs** in `backend/logs/` for debugging
4. **Use MongoDB Compass** for visual database management
5. **Test with different roles** (customer, vendor, admin)
6. **Use browser DevTools** to inspect API requests
7. **Keep backend and frontend terminals** open side-by-side

---

## 🆘 Need Help?

- **API Documentation:** http://localhost:3001/api/docs
- **Check Logs:** `backend/logs/application-*.log`
- **MongoDB Issues:** https://docs.mongodb.com/
- **NestJS Docs:** https://docs.nestjs.com/
- **Next.js Docs:** https://nextjs.org/docs
- **Stripe Docs:** https://stripe.com/docs

---

**Congratulations! 🎉 Your e-commerce platform is ready!**

Now start customizing and building your business! 🚀
