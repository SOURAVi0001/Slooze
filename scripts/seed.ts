import dotenv from 'dotenv';
import path from 'path';

// Load environment variables BEFORE importing models or dbConnect
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole, OrderStatus } from '../src/types';
import User from '../src/models/User';
import Restaurant from '../src/models/Restaurant';
import MenuItem from '../src/models/MenuItem';
import Order from '../src/models/Order';
import dbConnect from '../src/lib/db';

console.log('Using MONGODB_URI:', process.env.MONGODB_URI ? 'URI found in env' : 'URI NOT FOUND, using default');

const seed = async () => {
  await dbConnect();

  // Clear existing data
  await User.deleteMany({});
  await Restaurant.deleteMany({});
  await MenuItem.deleteMany({});

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Seed Users
  const users = [
    { name: 'Nick Fury', email: 'nick@shield.com', password: hashedPassword, role: UserRole.ADMIN, country: 'Global' },
    { name: 'Captain Marvel', email: 'carol@shield.com', password: hashedPassword, role: UserRole.MANAGER, country: 'India' },
    { name: 'Captain America', email: 'steve@shield.com', password: hashedPassword, role: UserRole.MANAGER, country: 'America' },
    { name: 'Thanos', email: 'thanos@titan.com', password: hashedPassword, role: UserRole.MEMBER, country: 'India' },
    { name: 'Thor', email: 'thor@asgard.com', password: hashedPassword, role: UserRole.MEMBER, country: 'India' },
    { name: 'Travis', email: 'travis@scott.com', password: hashedPassword, role: UserRole.MEMBER, country: 'America' },
  ];

  await User.insertMany(users);
  console.log('Users seeded');

  // Seed Restaurants
  const restaurants = [
    { 
      name: 'Spice Garden', 
      country: 'India', 
      address: 'Mumbai, India', 
      cuisine: 'Indian',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=1000&auto=format&fit=crop',
      isPromoted: true,
      openingHours: { open: '11:00', close: '23:00' }
    },
    { 
      name: 'Burger King', 
      country: 'America', 
      address: 'New York, USA', 
      cuisine: 'American',
      rating: 4.2,
      imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1000&auto=format&fit=crop',
      isPromoted: false,
      openingHours: { open: '08:00', close: '22:00' }
    },
    { 
      name: 'Pasta Palace', 
      country: 'America', 
      address: 'Chicago, USA', 
      cuisine: 'Italian',
      rating: 4.6,
      imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1000&auto=format&fit=crop',
      isPromoted: true,
      openingHours: { open: '12:00', close: '22:00' }
    },
  ];

  const createdRestaurants = await Restaurant.insertMany(restaurants);
  console.log('Restaurants seeded');

  // Seed Menu Items
  const menuItemsData = [
    { name: 'Paneer Tikka', description: 'Grilled cottage cheese', price: 250, category: 'Starter', restaurantId: createdRestaurants[0]._id },
    { name: 'Butter Chicken', description: 'Creamy tomato gravy', price: 450, category: 'Main Course', restaurantId: createdRestaurants[0]._id },
    { name: 'Whopper', description: 'Flame-grilled beef burger', price: 10, category: 'Main Course', restaurantId: createdRestaurants[1]._id },
    { name: 'French Fries', description: 'Crispy potato fries', price: 5, category: 'Sides', restaurantId: createdRestaurants[1]._id },
    { name: 'Fettuccine Alfredo', description: 'Creamy pasta', price: 15, category: 'Main Course', restaurantId: createdRestaurants[2]._id },
  ];

  const createdMenuItems = await MenuItem.insertMany(menuItemsData);
  console.log('Menu items seeded');

  // Update Restaurants with Menu Item IDs
  await Restaurant.findByIdAndUpdate(createdRestaurants[0]._id, {
    $push: { menuItems: { $each: [createdMenuItems[0]._id, createdMenuItems[1]._id] } }
  });
  await Restaurant.findByIdAndUpdate(createdRestaurants[1]._id, {
    $push: { menuItems: { $each: [createdMenuItems[2]._id, createdMenuItems[3]._id] } }
  });
  await Restaurant.findByIdAndUpdate(createdRestaurants[2]._id, {
    $push: { menuItems: { $each: [createdMenuItems[4]._id] } }
  });
  console.log('Restaurant menuItems updated');

  // Seed some Orders for Stats
  const orders = [
    {
      userId: (await User.findOne({ email: 'nick@shield.com' }))._id,
      restaurantId: createdRestaurants[1]._id,
      items: [{ menuItemId: createdMenuItems[2]._id, quantity: 2, price: 10 }],
      totalAmount: 20,
      status: OrderStatus.COMPLETED,
      country: 'America',
      paymentMethod: 'Credit Card',
      createdAt: new Date(Date.now() - 86400000) // 1 day ago
    },
    {
      userId: (await User.findOne({ email: 'carol@shield.com' }))._id,
      restaurantId: createdRestaurants[0]._id,
      items: [{ menuItemId: createdMenuItems[1]._id, quantity: 1, price: 450 }],
      totalAmount: 450,
      status: OrderStatus.COMPLETED,
      country: 'India',
      paymentMethod: 'UPI',
      createdAt: new Date(Date.now() - 172800000) // 2 days ago
    }
  ];
  await Order.insertMany(orders);
  console.log('Orders seeded for stats');

  console.log('Seeding completed successfully');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
