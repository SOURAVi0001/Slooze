import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Restaurant from '@/models/Restaurant';
import { authMiddleware, getCountryFilter, permissionMiddleware } from '@/lib/middleware';
import { UserRole } from '@/types';
import { z } from 'zod';

const OrderItemSchema = z.object({
  menuItemId: z.string(),
  quantity: z.number().min(1),
  price: z.number().min(0),
});

const CreateOrderSchema = z.object({
  restaurantId: z.string(),
  items: z.array(OrderItemSchema),
  totalAmount: z.number().min(0),
  paymentMethod: z.string().default('Credit Card'),
  deliveryAddress: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const auth = await authMiddleware(req);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const filter = getCountryFilter(auth.user!);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('restaurantId')
      .populate('items.menuItemId');

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const auth = await authMiddleware(req);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const validatedData = CreateOrderSchema.parse(body);

    // Check if restaurant is in the same country (unless Admin)
    const restaurant = await Restaurant.findById(validatedData.restaurantId);
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    if (auth.user!.role !== UserRole.ADMIN && auth.user!.country !== restaurant.country) {
      return NextResponse.json({ error: 'Cannot order from a different country' }, { status: 403 });
    }

    // Check if user can place order (Checkout/Pay)
    const permissionError = permissionMiddleware(auth.user!, [UserRole.ADMIN, UserRole.MANAGER]);
    if (permissionError) {
      return NextResponse.json({ error: 'Members cannot place orders (Checkout/Pay)' }, { status: 403 });
    }

    const newOrder = new Order({
      userId: auth.user!.userId,
      restaurantId: validatedData.restaurantId,
      items: validatedData.items,
      totalAmount: validatedData.totalAmount,
      country: restaurant.country,
      paymentMethod: validatedData.paymentMethod,
      deliveryAddress: validatedData.deliveryAddress || 'Default Address',
      estimatedDeliveryTime: Math.floor(Math.random() * 20) + 20, // 20-40 mins
    });

    await newOrder.save();
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Order API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
