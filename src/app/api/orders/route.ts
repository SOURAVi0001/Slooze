import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Restaurant from '@/models/Restaurant';
import { authMiddleware, getCountryFilter, permissionMiddleware } from '@/lib/middleware';
import { UserRole } from '@/types';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const auth = await authMiddleware(req);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const filter = getCountryFilter(auth.user!);
    const orders = await Order.find(filter).populate('restaurantId').populate('items.menuItemId');

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

    const { restaurantId, items, totalAmount, paymentMethod } = await req.json();

    // Check if restaurant is in the same country (unless Admin)
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    if (auth.user!.role !== UserRole.ADMIN && auth.user!.country !== restaurant.country) {
      return NextResponse.json({ error: 'Cannot order from a different country' }, { status: 403 });
    }

    // Check if user can place order (Checkout/Pay)
    // Requirement: Place Order (Checkout/Pay): ADMIN, MANAGER only. (Members cannot pay).
    // If this POST represents "Placing Order", we check permissions.
    const permissionError = permissionMiddleware(auth.user!, [UserRole.ADMIN, UserRole.MANAGER]);
    if (permissionError) {
      return NextResponse.json({ error: 'Members cannot place orders (Checkout/Pay)' }, { status: 403 });
    }

    const newOrder = new Order({
      userId: auth.user!.userId,
      restaurantId,
      items,
      totalAmount,
      country: restaurant.country,
      paymentMethod,
    });

    await newOrder.save();
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
