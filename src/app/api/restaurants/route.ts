import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Restaurant from '@/models/Restaurant';
import { authMiddleware, getCountryFilter } from '@/lib/middleware';
import { z } from 'zod';

const QuerySchema = z.object({
  search: z.string().optional(),
  cuisine: z.string().optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  sortBy: z.enum(['name', 'rating', 'createdAt']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const auth = await authMiddleware(req);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const query = QuerySchema.parse(Object.fromEntries(searchParams));

    // Base filter from RBAC/Location
    const baseFilter = getCountryFilter(auth.user!);
    
    // Advanced filters
    const filter: any = { ...baseFilter };
    
    if (query.search) {
      filter.name = { $regex: query.search, $options: 'i' };
    }
    
    if (query.cuisine) {
      filter.cuisine = query.cuisine;
    }

    const skip = (query.page - 1) * query.limit;
    const sortOptions: any = {};
    sortOptions[query.sortBy] = query.order === 'asc' ? 1 : -1;

    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(query.limit)
        .populate('menuItems'),
      Restaurant.countDocuments(filter)
    ]);

    return NextResponse.json({
      data: restaurants,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit)
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.errors }, { status: 400 });
    }
    console.error('Restaurant API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
