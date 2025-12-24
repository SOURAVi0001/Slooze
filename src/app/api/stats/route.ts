import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { authMiddleware, permissionMiddleware } from '@/lib/middleware';
import { UserRole } from '@/types';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const auth = await authMiddleware(req);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Only Admin and Manager can see stats
    const permissionError = permissionMiddleware(auth.user!, [UserRole.ADMIN, UserRole.MANAGER]);
    if (permissionError) {
      return NextResponse.json({ error: permissionError.error }, { status: permissionError.status });
    }

    const countryFilter = auth.user!.role === UserRole.ADMIN ? {} : { country: auth.user!.country };

    // Advanced Aggregation: Sales by Restaurant
    const salesByRestaurant = await Order.aggregate([
      { $match: countryFilter },
      {
        $group: {
          _id: '$restaurantId',
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $count: {} },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'restaurants',
          localField: '_id',
          foreignField: '_id',
          as: 'restaurant'
        }
      },
      { $unwind: '$restaurant' },
      {
        $project: {
          name: '$restaurant.name',
          totalSales: 1,
          orderCount: 1,
          avgOrderValue: { $round: ['$avgOrderValue', 2] }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    // Advanced Aggregation: Sales over time (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesOverTime = await Order.aggregate([
      { 
        $match: { 
          ...countryFilter,
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          dailySales: { $sum: "$totalAmount" },
          dailyOrders: { $count: {} }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Advanced Aggregation: Popular Menu Items
    const popularItems = await Order.aggregate([
      { $match: countryFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItemId',
          totalQuantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'item'
        }
      },
      { $unwind: '$item' },
      {
        $project: {
          name: '$item.name',
          totalQuantity: 1,
          revenue: 1
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    return NextResponse.json({
      salesByRestaurant,
      salesOverTime,
      popularItems,
      summary: {
        totalRevenue: salesByRestaurant.reduce((acc, curr) => acc + curr.totalSales, 0),
        totalOrders: salesByRestaurant.reduce((acc, curr) => acc + curr.orderCount, 0)
      }
    });
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
