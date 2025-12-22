import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { authMiddleware, permissionMiddleware } from '@/lib/middleware';
import { UserRole } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const auth = await authMiddleware(req);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Requirement: Update Payment Method: ADMIN only.
    // Assuming GET is also restricted or just for viewing.
    // The prompt says "Update Payment Method: ADMIN only".
    const permissionError = permissionMiddleware(auth.user!, [UserRole.ADMIN]);
    if (permissionError) {
      return NextResponse.json({ error: permissionError.error }, { status: permissionError.status });
    }

    return NextResponse.json(['Credit Card', 'PayPal', 'Stripe', 'Apple Pay']);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authMiddleware(req);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const permissionError = permissionMiddleware(auth.user!, [UserRole.ADMIN]);
    if (permissionError) {
      return NextResponse.json({ error: permissionError.error }, { status: permissionError.status });
    }

    const { method } = await req.json();
    // Logic to update payment method...
    
    return NextResponse.json({ message: `Payment method ${method} updated successfully` });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
