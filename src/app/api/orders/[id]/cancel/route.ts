import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { authMiddleware, permissionMiddleware, locationMiddleware } from '@/lib/middleware';
import { UserRole, OrderStatus } from '@/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const auth = await authMiddleware(req);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Requirement: Cancel Order: ADMIN, MANAGER only.
    const permissionError = permissionMiddleware(auth.user!, [UserRole.ADMIN, UserRole.MANAGER]);
    if (permissionError) {
      return NextResponse.json({ error: permissionError.error }, { status: permissionError.status });
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Location check
    const locationError = locationMiddleware(auth.user!, order.country);
    if (locationError) {
      return NextResponse.json({ error: locationError.error }, { status: locationError.status });
    }

    order.status = OrderStatus.CANCELLED;
    await order.save();

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
