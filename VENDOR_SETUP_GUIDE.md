# KmerCart Vendor Dashboard - Setup & Testing Guide

## Quick Start

### 1. Start the Backend
```bash
cd backend
npm install
npm run start:dev
```

The backend will run on `http://localhost:3001`

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

### 3. Prerequisites
- MongoDB running and accessible
- Create a vendor user account (see below)

---

## Creating a Vendor User

You need a user with the `vendor` role. You can either:

### Option A: Register and Update via MongoDB
1. Register a new user at `/register`
2. Update the user in MongoDB:
```javascript
db.users.updateOne(
  { email: "vendor@example.com" },
  {
    $set: {
      role: "vendor"
    }
  }
)
```

### Option B: Create Directly in MongoDB
```javascript
db.users.insertOne({
  email: "vendor@example.com",
  password: "$2b$10$...", // hashed password
  firstName: "John",
  lastName: "Vendor",
  role: "vendor",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Note:** The vendor doesn't need a `vendorProfile` initially - the system will help them create one on first login!

---

## First-Time Vendor Setup Flow

When a vendor logs in for the first time without a vendor profile:

1. They'll see a **Welcome Banner** with instructions
2. A **Setup Profile** button will be displayed
3. They can fill in:
   - Business Name (required)
   - Business Description
   - Tax ID (required)
4. After saving, their profile status will be "Pending Approval"
5. They won't be able to list products until approved

### To Approve a Vendor
Update in MongoDB:
```javascript
db.users.updateOne(
  { email: "vendor@example.com" },
  {
    $set: {
      "vendorProfile.isApproved": true
    }
  }
)
```

---

## Testing the Vendor Dashboard

### 1. Login as Vendor
- Navigate to `/login`
- Use vendor credentials
- You'll be redirected to `/vendor/dashboard`

### 2. Set Up Vendor Profile (First Time)
- Fill in Business Name and Tax ID
- Click "Save Profile"
- Profile will be saved with `isApproved: false`

### 3. After Approval
Once approved, vendors can:

#### Product Management
- **Add Product**: Click "Add New Product" or visit `/vendor/products/new`
  - Fill in all product details (name, description, price, SKU, stock, etc.)
  - Add images via URLs
  - Set SEO metadata
  - Mark as active/featured

- **View Products**: Visit `/vendor/products`
  - Search products by name, SKU, or description
  - Filter by status (active, inactive, low stock, out of stock)
  - Quick actions: Edit, Activate/Deactivate, Delete

- **Edit Product**: Click on any product
  - Update all product fields
  - Quick stock update button
  - SKU cannot be changed

#### Order Management
- **View Orders**: Visit `/vendor/orders`
  - Filter by status (pending, confirmed, processing, shipped, delivered)
  - See customer info and order items
  - View your vendor-specific total (only your items)

- **Order Details**: Click on any order
  - Full order information
  - Customer and shipping details
  - Update order status with tracking number
  - Add notes to status changes
  - View status history timeline

#### Dashboard Features
- **Statistics Cards**:
  - Total products (active count)
  - Total orders (pending count)
  - Total sales revenue
  - Low stock alerts

- **Recent Products**: Quick view of 10 latest products
- **Recent Orders**: Last 5 orders with your items
- **Order Status Breakdown**: Pending, Processing, Shipped, Delivered counts

---

## API Endpoints

All vendor endpoints require JWT authentication with `role: "vendor"`.

### Profile
- `GET /vendors/profile` - Get vendor profile (no approval needed)
- `PUT /vendors/profile` - Update vendor profile (no approval needed)

### Dashboard
- `GET /vendors/dashboard/stats` - Get dashboard statistics (requires profile)

### Products
- `POST /vendors/products` - Create product (requires approval)
- `GET /vendors/products` - List products with pagination, search, filters (requires approval)
- `GET /vendors/products/:id` - Get single product (requires approval)
- `PUT /vendors/products/:id` - Update product (requires approval)
- `DELETE /vendors/products/:id` - Soft delete product (requires approval)
- `PATCH /vendors/products/:id/stock` - Update stock only (requires approval)

### Orders
- `GET /vendors/orders` - List orders with filters (requires approval)
- `GET /vendors/orders/:id` - Get order details (requires approval)
- `PATCH /vendors/orders/:id/status` - Update order status (requires approval)

### Analytics
- `GET /vendors/analytics/sales?startDate=&endDate=` - Get sales analytics (requires approval)

---

## Security Features

✅ **JWT Authentication**: All endpoints protected with JWT tokens
✅ **Role-Based Access**: Only users with `role: "vendor"` can access
✅ **Profile Validation**: Checks for vendor profile existence
✅ **Approval Workflow**: Products/orders only accessible after approval
✅ **Vendor Isolation**: Vendors only see their own products and orders
✅ **Secure Sessions**: No data stored in cookies/localStorage

---

## Troubleshooting

### "Vendor profile not found" Error
- **Cause**: User has `role: "vendor"` but no `vendorProfile` object
- **Fix**: The system will automatically show the profile setup form. Just fill it out and save.

### "Vendor account pending approval" Error
- **Cause**: Vendor profile exists but `isApproved: false`
- **Fix**: Approve the vendor in MongoDB (see above)

### Can't Create Products
- **Cause**: Not approved or no vendor profile
- **Fix**: Complete profile setup and get approval

### Products Not Showing
- **Cause**: No products created or database connection issue
- **Fix**: Create a product via `/vendor/products/new`

### Backend Connection Errors
- **Cause**: Backend not running or MongoDB not connected
- **Fix**:
  1. Check backend is running on port 3001
  2. Verify MongoDB connection in `.env`
  3. Check console for errors

---

## Test Data Examples

### Sample Product
```json
{
  "name": "iPhone 15 Pro Max",
  "description": "Latest flagship smartphone from Apple",
  "shortDescription": "6.7-inch Super Retina XDR display",
  "categoryId": "507f1f77bcf86cd799439011",
  "price": 1199.99,
  "sku": "IPHONE-15-PRO-256",
  "stock": 50,
  "lowStockThreshold": 10,
  "images": ["https://example.com/image1.jpg"],
  "tags": ["smartphone", "apple", "5g"],
  "isActive": true,
  "isFeatured": false
}
```

### Expected Flow
1. **New vendor** → Setup profile → Wait for approval
2. **Approved vendor** → Add products → Manage inventory
3. **Customer orders** → Vendor receives notification → Updates status
4. **Order shipped** → Add tracking → Mark as shipped
5. **Order delivered** → Mark as delivered → Payment processed

---

## Next Steps

After testing the basics:
1. Test product search and filtering
2. Test order status workflow
3. Test stock management (low stock alerts)
4. Verify pagination works with 20+ items
5. Test error handling (invalid SKU, etc.)

---

## Support

For issues or questions:
- Check console logs (browser & backend)
- Verify JWT token is present in requests
- Check MongoDB for data
- Review backend logs for errors

Happy testing! 🚀
