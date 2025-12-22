import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Restaurant from '@/models/Restaurant';
import { authMiddleware, getCountryFilter } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const auth = await authMiddleware(req);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const filter = getCountryFilter(auth.user!);
    const restaurants = await Restaurant.find(filter);

    return NextResponse.json(restaurants);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
