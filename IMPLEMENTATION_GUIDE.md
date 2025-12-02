# KmerCart E-Commerce Platform - Complete Implementation Guide

This guide provides complete code examples for implementing all backend modules, frontend features, and integrations.

## Table of Contents
1. [Backend Implementation](#backend-implementation)
2. [Authentication System](#authentication-system)
3. [API Modules](#api-modules)
4. [Frontend Implementation](#frontend-implementation)
5. [Vendor Dashboard](#vendor-dashboard)
6. [Customer Features](#customer-features)
7. [Integration Examples](#integration-examples)

---

## Backend Implementation

### Directory Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── decorators/
│   │   │   │   ├── current-user.decorator.ts
│   │   │   │   ├── public.decorator.ts
│   │   │   │   └── roles.decorator.ts
│   │   │   ├── dto/
│   │   │   │   ├── register.dto.ts
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── refresh-token.dto.ts
│   │   │   │   └── reset-password.dto.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   ├── jwt-refresh.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── jwt-refresh.strategy.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   ├── users/
│   │   │   ├── dto/
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   ├── update-user.dto.ts
│   │   │   │   └── create-address.dto.ts
│   │   │   ├── schemas/
│   │   │   │   └── user.schema.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   ├── products/
│   │   │   ├── dto/
│   │   │   │   ├── create-product.dto.ts
│   │   │   │   ├── update-product.dto.ts
│   │   │   │   └── filter-product.dto.ts
│   │   │   ├── schemas/
│   │   │   │   └── product.schema.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   └── products.module.ts
│   │   ├── orders/
│   │   ├── cart/
│   │   ├── categories/
│   │   ├── reviews/
│   │   ├── vendors/
│   │   ├── payouts/
│   │   ├── notifications/
│   │   ├── payments/
│   │   └── analytics/
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   ├── logger/
│   │   │   ├── logger.service.ts
│   │   │   └── logger.module.ts
│   │   ├── utils/
│   │   │   ├── pagination.util.ts
│   │   │   └── slug.util.ts
│   │   └── interfaces/
│   │       └── pagination.interface.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── stripe.config.ts
│   ├── app.module.ts
│   ├── main.ts
│   └── health.controller.ts
├── test/
├── logs/
├── uploads/
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## Authentication System

### auth.module.ts
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

### auth.service.ts
```typescript
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, role } = registerDto;

    // Check if user exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.userModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || 'customer',
    });

    // Generate tokens
    const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);

    // Save refresh token
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user with password
    const user = await this.userModel.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);

    // Save refresh token
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userModel.findById(userId).select('+refreshToken');
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
    return { message: 'Logged out successfully' };
  }

  async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  private sanitizeUser(user: any) {
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.refreshToken;
    return userObject;
  }

  async validateUser(userId: string) {
    return this.userModel.findById(userId);
  }
}
```

### auth.controller.ts
```typescript
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Res,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(registerDto);

    // Set refresh token in HTTP-only cookie
    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);

    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refreshToken'];
    const tokens = await this.authService.refreshTokens(userId, refreshToken);

    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: tokens.accessToken,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  async logout(
    @CurrentUser('sub') userId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    response.clearCookie('refreshToken');
    return this.authService.logout(userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async getMe(@CurrentUser('sub') userId: string) {
    return this.authService.validateUser(userId);
  }
}
```

### DTOs

#### register.dto.ts
```typescript
import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/schemas/user.schema';

export class RegisterDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER, required: false })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
```

#### login.dto.ts
```typescript
import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  password: string;
}
```

### Guards and Strategies

#### jwt.strategy.ts
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    const user = await this.userModel.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
```

#### jwt-refresh.strategy.ts
```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.refreshToken;
        },
      ]),
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    const refreshToken = req.cookies?.refreshToken;
    return { ...payload, refreshToken };
  }
}
```

#### jwt-auth.guard.ts
```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

#### roles.guard.ts
```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/schemas/user.schema';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

### Decorators

#### current-user.decorator.ts
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
```

#### public.decorator.ts
```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

#### roles.decorator.ts
```typescript
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/schemas/user.schema';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

---

## Products Module

### products.service.ts
```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import slugify from 'slugify';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { PaginationUtil } from '../../common/utils/pagination.util';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto, vendorId: string) {
    const slug = slugify(createProductDto.name, { lower: true, strict: true });

    const product = await this.productModel.create({
      ...createProductDto,
      slug,
      vendorId,
    });

    return product;
  }

  async findAll(filterDto: FilterProductDto) {
    const {
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc',
      search,
      category,
      minPrice,
      maxPrice,
      inStock,
      vendor,
      isFeatured,
    } = filterDto;

    const query: any = { isActive: true };

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category) {
      query.categoryId = category;
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }

    // Stock filter
    if (inStock !== undefined) {
      query.stock = inStock ? { $gt: 0 } : 0;
    }

    // Vendor filter
    if (vendor) {
      query.vendorId = vendor;
    }

    // Featured filter
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured;
    }

    const sortOptions: any = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('vendorId', 'firstName lastName vendorProfile')
        .populate('categoryId', 'name slug')
        .exec(),
      this.productModel.countDocuments(query),
    ]);

    return PaginationUtil.paginate(products, page, limit, total);
  }

  async findOne(id: string) {
    const product = await this.productModel
      .findById(id)
      .populate('vendorId', 'firstName lastName vendorProfile email')
      .populate('categoryId', 'name slug')
      .populate('subcategoryId', 'name slug');

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.productModel
      .findOne({ slug, isActive: true })
      .populate('vendorId', 'firstName lastName vendorProfile email')
      .populate('categoryId', 'name slug')
      .populate('subcategoryId', 'name slug');

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string, userRole: string) {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check authorization
    if (userRole !== 'admin' && product.vendorId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own products');
    }

    if (updateProductDto.name) {
      updateProductDto['slug'] = slugify(updateProductDto.name, { lower: true, strict: true });
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .populate('vendorId', 'firstName lastName vendorProfile')
      .populate('categoryId', 'name slug');

    return updatedProduct;
  }

  async remove(id: string, userId: string, userRole: string) {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (userRole !== 'admin' && product.vendorId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own products');
    }

    await this.productModel.findByIdAndDelete(id);
    return { message: 'Product deleted successfully' };
  }

  async updateStock(productId: string, quantity: number) {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.stock -= quantity;
    if (product.stock < 0) product.stock = 0;

    await product.save();
    return product;
  }
}
```

### products.controller.ts
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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create product (vendor/admin only)' })
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.productsService.create(createProductDto, userId);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all products with filters' })
  findAll(@Query() filterDto: FilterProductDto) {
    return this.productsService.findAll(filterDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get product by ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get product by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Patch(':id')
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product (owner/admin only)' })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.productsService.update(id, updateProductDto, userId, userRole);
  }

  @Delete(':id')
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product (owner/admin only)' })
  remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.productsService.remove(id, userId, userRole);
  }
}
```

---

## Common Utilities

### pagination.util.ts
```typescript
export class PaginationUtil {
  static paginate(data: any[], page: number, limit: number, total: number) {
    const pages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
      },
    };
  }
}
```

### pagination.interface.ts
```typescript
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

---

## Frontend Implementation - API Service

### lib/api/client.ts
```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
```

### lib/api/auth.ts
```typescript
import { apiClient } from './client';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'customer' | 'vendor';
}

export interface LoginData {
  email: string;
  password: string;
}

export const authAPI = {
  register: async (data: RegisterData) => {
    const response = await apiClient.post('/auth/register', data);
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await apiClient.post('/auth/login', data);
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('accessToken');
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
```

### lib/api/products.ts
```typescript
import { apiClient } from './client';

export const productsAPI = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await apiClient.get(`/products/slug/${slug}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post('/products', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.patch(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};
```

---

## Vendor Dashboard Components

### app/vendor/dashboard/page.tsx
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api/auth';
import VendorStats from '@/components/vendor/VendorStats';
import RecentOrders from '@/components/vendor/RecentOrders';
import ProductsOverview from '@/components/vendor/ProductsOverview';
import SalesChart from '@/components/vendor/SalesChart';

export default function VendorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await authAPI.getMe();
      if (userData.role !== 'vendor') {
        router.push('/');
        return;
      }
      setUser(userData);
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Vendor Dashboard
        </h1>

        {/* Stats Overview */}
        <VendorStats />

        {/* Sales Chart */}
        <div className="mt-8">
          <SalesChart />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <RecentOrders />

          {/* Products Overview */}
          <ProductsOverview />
        </div>
      </div>
    </div>
  );
}
```

### components/vendor/VendorStats.tsx
```typescript
'use client';

import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Package, TrendingUp } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export default function VendorStats() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    revenue: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await apiClient.get('/vendor/dashboard');
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const statCards = [
    {
      name: 'Total Revenue',
      value: `${stats.revenue.toLocaleString()} CFA`,
      icon: DollarSign,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'bg-green-500',
    },
    {
      name: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-purple-500',
    },
    {
      name: 'Total Sales',
      value: stats.totalSales,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <div key={stat.name} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stat.value}
              </p>
            </div>
            <div className={`${stat.color} p-3 rounded-full`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Complete Checkout Flow

### app/checkout/page.tsx
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { apiClient } from '@/lib/api/client';
import CheckoutSummary from '@/components/checkout/CheckoutSummary';
import ShippingForm from '@/components/checkout/ShippingForm';
import PaymentForm from '@/components/checkout/PaymentForm';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [shippingData, setShippingData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items]);

  const handleShippingSubmit = (data: any) => {
    setShippingData(data);
    setStep(2);
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    setLoading(true);
    try {
      // Create order
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: shippingData,
        paymentMethod: paymentData.method,
      };

      const { data } = await apiClient.post('/orders', orderData);

      // Clear cart
      clearCart();

      // Redirect to success page
      router.push(`/orders/${data._id}/success`);
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center">
                1
              </div>
              <span className="ml-2">Shipping</span>
            </div>
            <div className="w-24 h-1 mx-4 bg-gray-300" />
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center">
                2
              </div>
              <span className="ml-2">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <ShippingForm onSubmit={handleShippingSubmit} />
            )}
            {step === 2 && (
              <PaymentForm
                onSubmit={handlePaymentSubmit}
                loading={loading}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <CheckoutSummary items={items} total={total} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Installation and Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env file with your configurations
# Set MongoDB URI, JWT secrets, Stripe keys, etc.

# Start development server
npm run start:dev
```

### 2. Frontend Setup

```bash
# Navigate to project root
cd KmerCart

# Install dependencies (if not already installed)
npm install

# Install additional dependencies
npm install axios

# Create .env.local file
cp .env.local.example .env.local

# Add backend API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" >> .env.local

# Start development server
npm run dev
```

### 3. MongoDB Setup

```bash
# Install MongoDB locally or use MongoDB Atlas

# If using local MongoDB:
brew install mongodb-community@7.0  # macOS
# or
sudo apt install mongodb  # Ubuntu

# Start MongoDB
brew services start mongodb-community@7.0

# Verify MongoDB is running
mongosh
```

### 4. Stripe Setup

1. Create account at https://stripe.com
2. Get API keys from Dashboard
3. Add to backend `.env`:
   - STRIPE_SECRET_KEY
   - STRIPE_PUBLISHABLE_KEY
4. Install Stripe CLI for webhook testing:
```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3001/api/payments/webhook
```

---

## Testing the Implementation

### Test Authentication
```bash
# Register new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@test.com",
    "password": "Password123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "vendor"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@test.com",
    "password": "Password123!"
  }'
```

### Test Product Creation
```bash
# Create product (use token from login)
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Test Product",
    "description": "This is a test product",
    "price": 1000,
    "stock": 50,
    "categoryId": "CATEGORY_ID",
    "sku": "TEST-001"
  }'
```

---

## Deployment Checklist

### Backend Deployment

- [ ] Set all environment variables in production
- [ ] Use strong JWT secrets
- [ ] Configure MongoDB with authentication
- [ ] Set up SSL/TLS certificates
- [ ] Configure CORS for production domain
- [ ] Set up logging and monitoring
- [ ] Configure rate limiting
- [ ] Set up automated backups
- [ ] Configure CDN for static files

### Frontend Deployment

- [ ] Build production bundle: `npm run build`
- [ ] Set NEXT_PUBLIC_API_URL to production API
- [ ] Configure environment variables
- [ ] Set up CDN
- [ ] Enable caching
- [ ] Configure analytics
- [ ] Set up error tracking (Sentry)

---

## Additional Resources

- NestJS Documentation: https://docs.nestjs.com
- MongoDB Mongoose: https://mongoosejs.com
- Next.js Documentation: https://nextjs.org/docs
- Stripe API: https://stripe.com/docs/api
- JWT Best Practices: https://jwt.io/introduction

---

## Support

For issues or questions, refer to:
- Backend logs: `backend/logs/`
- API Documentation: `http://localhost:3001/api/docs`
- Health Check: `http://localhost:3001/api/health`
