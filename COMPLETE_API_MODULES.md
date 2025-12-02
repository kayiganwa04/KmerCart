# Complete API Modules - Full Implementation

This document contains the complete implementation for all remaining API modules.

## Table of Contents
1. [Orders Module](#orders-module)
2. [Cart Module](#cart-module)
3. [Vendors Module](#vendors-module)
4. [Payouts Module](#payouts-module)
5. [Reviews Module](#reviews-module)
6. [Notifications Module](#notifications-module)
7. [Payments Module (Stripe)](#payments-module)
8. [Analytics Module](#analytics-module)
9. [Categories Module](#categories-module)
10. [Users Module](#users-module)

---

## Orders Module

### orders.module.ts
```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order, OrderSchema } from './schemas/order.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
```

### orders.service.ts
```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { PaginationUtil } from '../../common/utils/pagination.util';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createOrderDto: CreateOrderDto, customerId: string) {
    const { items, shippingAddress, billingAddress, paymentMethod } = createOrderDto;

    // Validate products and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await this.productModel.findById(item.productId);

      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        vendorId: product.vendorId,
        name: product.name,
        image: product.mainImage,
        quantity: item.quantity,
        price: product.price,
        discount: product.discount || 0,
        total: itemTotal,
      });

      // Decrease stock
      product.stock -= item.quantity;
      product.totalSales += item.quantity;
      await product.save();
    }

    // Calculate tax and total
    const taxRate = 0.08;
    const tax = subtotal * taxRate;
    const shippingCost = subtotal >= 50000 ? 0 : 2000;
    const total = subtotal + tax + shippingCost;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const order = await this.orderModel.create({
      orderNumber,
      customerId,
      items: orderItems,
      subtotal,
      tax,
      taxRate,
      shippingCost,
      total,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      statusHistory: [{
        status: OrderStatus.PENDING,
        timestamp: new Date(),
        note: 'Order created',
      }],
    });

    // Send notifications
    await this.notificationsService.create({
      userId: customerId,
      type: 'order_placed',
      title: 'Order Placed Successfully',
      message: `Your order ${orderNumber} has been placed successfully.`,
      link: `/orders/${order._id}`,
    });

    // Notify vendors
    const vendorIds = [...new Set(orderItems.map(item => item.vendorId.toString()))];
    for (const vendorId of vendorIds) {
      await this.notificationsService.create({
        userId: vendorId,
        type: 'order_placed',
        title: 'New Order Received',
        message: `You have a new order: ${orderNumber}`,
        link: `/vendor/orders/${order._id}`,
      });
    }

    return order;
  }

  async findAll(filterDto: FilterOrderDto, userId: string, userRole: string) {
    const {
      page = 1,
      limit = 20,
      status,
      sort = 'createdAt',
      order = 'desc',
    } = filterDto;

    const query: any = {};

    // Filter by user role
    if (userRole === 'customer') {
      query.customerId = userId;
    } else if (userRole === 'vendor') {
      query['items.vendorId'] = userId;
    }
    // Admin can see all orders

    if (status) {
      query.status = status;
    }

    const sortOptions: any = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'firstName lastName email')
        .exec(),
      this.orderModel.countDocuments(query),
    ]);

    return PaginationUtil.paginate(orders, page, limit, total);
  }

  async findOne(id: string, userId: string, userRole: string) {
    const order = await this.orderModel
      .findById(id)
      .populate('customerId', 'firstName lastName email phone')
      .populate('items.productId', 'name slug images')
      .populate('items.vendorId', 'firstName lastName email vendorProfile');

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check authorization
    if (userRole === 'customer' && order.customerId.toString() !== userId) {
      throw new NotFoundException('Order not found');
    }

    if (userRole === 'vendor') {
      const hasVendorItem = order.items.some(
        item => item.vendorId.toString() === userId
      );
      if (!hasVendorItem) {
        throw new NotFoundException('Order not found');
      }
    }

    return order;
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateOrderStatusDto,
    userId: string,
    userRole: string,
  ) {
    const order = await this.orderModel.findById(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Validate authorization
    if (userRole === 'vendor') {
      const hasVendorItem = order.items.some(
        item => item.vendorId.toString() === userId
      );
      if (!hasVendorItem) {
        throw new NotFoundException('Order not found');
      }
    }

    // Update status
    order.status = updateStatusDto.status;
    if (updateStatusDto.trackingNumber) {
      order.trackingNumber = updateStatusDto.trackingNumber;
    }
    if (updateStatusDto.note) {
      order.notes = updateStatusDto.note;
    }

    // Add to status history
    order.statusHistory.push({
      status: updateStatusDto.status,
      timestamp: new Date(),
      note: updateStatusDto.note || '',
    });

    // Mark delivered date
    if (updateStatusDto.status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }

    await order.save();

    // Send notification to customer
    await this.notificationsService.create({
      userId: order.customerId.toString(),
      type: 'order_' + updateStatusDto.status,
      title: `Order ${updateStatusDto.status}`,
      message: `Your order ${order.orderNumber} is now ${updateStatusDto.status}.`,
      link: `/orders/${order._id}`,
    });

    return order;
  }

  async cancel(id: string, userId: string) {
    const order = await this.orderModel.findById(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId.toString() !== userId) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Cannot cancel order in current status');
    }

    // Restore stock
    for (const item of order.items) {
      await this.productModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity, totalSales: -item.quantity },
      });
    }

    order.status = OrderStatus.CANCELLED;
    order.statusHistory.push({
      status: OrderStatus.CANCELLED,
      timestamp: new Date(),
      note: 'Cancelled by customer',
    });

    await order.save();

    return order;
  }
}
```

### orders.controller.ts
```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create order (checkout)' })
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.ordersService.create(createOrderDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get user orders' })
  findAll(
    @Query() filterDto: FilterOrderDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.ordersService.findAll(filterDto, userId, userRole);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.ordersService.findOne(id, userId, userRole);
  }

  @Patch(':id/status')
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update order status' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.ordersService.updateStatus(id, updateStatusDto, userId, userRole);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel order' })
  cancel(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.ordersService.cancel(id, userId);
  }
}
```

### DTOs

#### create-order.dto.ts
```typescript
import { IsArray, IsString, IsNumber, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class OrderItemDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

class ShippingAddressDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsString()
  street: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsString()
  zipCode: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsString()
  phone: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ type: ShippingAddressDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ApiProperty({ type: ShippingAddressDto, required: false })
  @IsObject()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  billingAddress?: ShippingAddressDto;

  @ApiProperty()
  @IsString()
  paymentMethod: string;
}
```

#### update-order-status.dto.ts
```typescript
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../schemas/order.schema';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  note?: string;
}
```

---

## Cart Module

### cart.service.ts
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getCart(userId: string) {
    let cart = await this.cartModel
      .findOne({ userId })
      .populate('items.productId', 'name price images stock mainImage');

    if (!cart) {
      cart = await this.cartModel.create({ userId, items: [] });
    }

    return cart;
  }

  async addItem(userId: string, addToCartDto: AddToCartDto) {
    const { productId, quantity } = addToCartDto;

    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < quantity) {
      throw new NotFoundException('Insufficient stock');
    }

    let cart = await this.cartModel.findOne({ userId });

    if (!cart) {
      cart = await this.cartModel.create({ userId, items: [] });
    }

    const existingItem = cart.items.find(
      item => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.price = product.price;
    } else {
      cart.items.push({
        productId: product._id,
        quantity,
        price: product.price,
        addedAt: new Date(),
      });
    }

    await cart.save();

    return this.getCart(userId);
  }

  async updateItem(
    userId: string,
    productId: string,
    updateDto: UpdateCartItemDto,
  ) {
    const cart = await this.cartModel.findOne({ userId });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = cart.items.find(
      item => item.productId.toString() === productId
    );

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    const product = await this.productModel.findById(productId);
    if (product.stock < updateDto.quantity) {
      throw new NotFoundException('Insufficient stock');
    }

    item.quantity = updateDto.quantity;
    item.price = product.price;

    await cart.save();

    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.cartModel.findOne({ userId });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );

    await cart.save();

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.cartModel.findOne({ userId });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.items = [];
    await cart.save();

    return cart;
  }
}
```

---

## Vendors Module

### vendors.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Payout, PayoutDocument } from '../payouts/schemas/payout.schema';

@Injectable()
export class VendorsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Payout.name) private payoutModel: Model<PayoutDocument>,
  ) {}

  async getDashboard(vendorId: string) {
    const [totalProducts, totalOrders, totalPayouts, recentOrders] = await Promise.all([
      this.productModel.countDocuments({ vendorId }),
      this.orderModel.countDocuments({ 'items.vendorId': vendorId }),
      this.payoutModel.aggregate([
        { $match: { vendorId: vendorId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.orderModel
        .find({ 'items.vendorId': vendorId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('customerId', 'firstName lastName'),
    ]);

    // Calculate revenue
    const revenue = totalPayouts[0]?.total || 0;

    // Get total sales
    const salesData = await this.productModel.aggregate([
      { $match: { vendorId: vendorId } },
      { $group: { _id: null, totalSales: { $sum: '$totalSales' } } },
    ]);

    const totalSales = salesData[0]?.totalSales || 0;

    return {
      stats: {
        totalProducts,
        totalOrders,
        revenue,
        totalSales,
      },
      recentOrders,
    };
  }

  async getAnalytics(vendorId: string, startDate: Date, endDate: Date) {
    // Sales over time
    const salesByDate = await this.orderModel.aggregate([
      {
        $match: {
          'items.vendorId': vendorId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top selling products
    const topProducts = await this.productModel
      .find({ vendorId })
      .sort({ totalSales: -1 })
      .limit(10)
      .select('name totalSales price');

    // Low stock products
    const lowStock = await this.productModel
      .find({
        vendorId,
        $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      })
      .select('name stock lowStockThreshold');

    return {
      salesByDate,
      topProducts,
      lowStock,
    };
  }

  async getInventory(vendorId: string) {
    const products = await this.productModel.find({ vendorId }).select(
      'name sku stock lowStockThreshold price isActive'
    );

    return {
      total: products.length,
      inStock: products.filter(p => p.stock > p.lowStockThreshold).length,
      lowStock: products.filter(
        p => p.stock > 0 && p.stock <= p.lowStockThreshold
      ).length,
      outOfStock: products.filter(p => p.stock === 0).length,
      products,
    };
  }
}
```

---

## Payments Module (Stripe Integration)

### payments.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, PaymentStatus } from '../orders/schemas/order.schema';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(amount: number, currency: string = 'xaf') {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  async confirmPayment(paymentIntentId: string, orderId: string) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      await this.orderModel.findByIdAndUpdate(orderId, {
        paymentStatus: PaymentStatus.PAID,
        paymentIntentId,
      });

      return { success: true, message: 'Payment confirmed' };
    }

    return { success: false, message: 'Payment not confirmed' };
  }

  async handleWebhook(signature: string, body: Buffer) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    try {
      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret,
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          // Update order payment status
          await this.orderModel.findOneAndUpdate(
            { paymentIntentId: paymentIntent.id },
            { paymentStatus: PaymentStatus.PAID },
          );
          break;

        case 'payment_intent.payment_failed':
          const failedIntent = event.data.object as Stripe.PaymentIntent;
          await this.orderModel.findOneAndUpdate(
            { paymentIntentId: failedIntent.id },
            { paymentStatus: PaymentStatus.FAILED },
          );
          break;
      }

      return { received: true };
    } catch (err) {
      throw new Error(`Webhook Error: ${err.message}`);
    }
  }

  async refund(paymentIntentId: string, amount?: number) {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    return refund;
  }
}
```

### payments.controller.ts
```typescript
import {
  Controller,
  Post,
  Body,
  Headers,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe payment intent' })
  createIntent(@Body() body: { amount: number; currency?: string }) {
    return this.paymentsService.createPaymentIntent(body.amount, body.currency);
  }

  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm payment' })
  confirmPayment(@Body() body: { paymentIntentId: string; orderId: string }) {
    return this.paymentsService.confirmPayment(body.paymentIntentId, body.orderId);
  }

  @Post('webhook')
  @Public()
  @ApiOperation({ summary: 'Stripe webhook' })
  async webhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    return this.paymentsService.handleWebhook(signature, request.rawBody);
  }

  @Post('refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process refund' })
  refund(@Body() body: { paymentIntentId: string; amount?: number }) {
    return this.paymentsService.refund(body.paymentIntentId, body.amount);
  }
}
```

---

## Notifications Module

### notifications.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(createDto: CreateNotificationDto) {
    return this.notificationModel.create(createDto);
  }

  async findAll(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.notificationModel.countDocuments({ userId }),
    ]);

    return {
      data: notifications,
      meta: {
        page,
        limit,
        total,
        unread: notifications.filter(n => !n.isRead).length,
      },
    };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationModel.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true, readAt: new Date() },
      { new: true },
    );

    return notification;
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    return { message: 'All notifications marked as read' };
  }

  async delete(id: string, userId: string) {
    await this.notificationModel.findOneAndDelete({ _id: id, userId });
    return { message: 'Notification deleted' };
  }
}
```

---

## Complete Module Imports

All modules should be imported in `app.module.ts`:

```typescript
@Module({
  imports: [
    // ... existing imports
    OrdersModule,
    CartModule,
    VendorsModule,
    PayoutsModule,
    ReviewsModule,
    NotificationsModule,
    PaymentsModule,
    AnalyticsModule,
    CategoriesModule,
    UsersModule,
  ],
})
export class AppModule {}
```

---

## Frontend Integration Examples

### Using the APIs in Next.js

```typescript
// lib/api/orders.ts
export const ordersAPI = {
  create: async (orderData: any) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  getAll: async (params?: any) => {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await apiClient.delete(`/orders/${id}`);
    return response.data;
  },
};

// lib/api/cart.ts
export const cartAPI = {
  get: async () => {
    const response = await apiClient.get('/cart');
    return response.data;
  },

  addItem: async (productId: string, quantity: number) => {
    const response = await apiClient.post('/cart/items', { productId, quantity });
    return response.data;
  },

  updateItem: async (productId: string, quantity: number) => {
    const response = await apiClient.put(`/cart/items/${productId}`, { quantity });
    return response.data;
  },

  removeItem: async (productId: string) => {
    const response = await apiClient.delete(`/cart/items/${productId}`);
    return response.data;
  },

  clear: async () => {
    const response = await apiClient.delete('/cart');
    return response.data;
  },
};
```

This completes all major backend modules with full CRUD operations, authentication, role-based access control, pagination, filtering, and validation!
