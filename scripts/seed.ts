import dotenv from 'dotenv';
import path from 'path';

// Load environment variables BEFORE importing models or dbConnect
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../src/types';
import User from '../src/models/User';
import Restaurant from '../src/models/Restaurant';
import MenuItem from '../src/models/MenuItem';
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
    { name: 'Spice Garden', country: 'India', address: 'Mumbai, India', cuisine: 'Indian' },
    { name: 'Burger King', country: 'America', address: 'New York, USA', cuisine: 'American' },
  ];

  const createdRestaurants = await Restaurant.insertMany(restaurants);
  console.log('Restaurants seeded');

  // Seed Menu Items
  const menuItems = [
    { name: 'Paneer Tikka', description: 'Grilled cottage cheese', price: 250, category: 'Starter', restaurantId: createdRestaurants[0]._id },
    { name: 'Butter Chicken', description: 'Creamy tomato gravy', price: 450, category: 'Main Course', restaurantId: createdRestaurants[0]._id },
    { name: 'Whopper', description: 'Flame-grilled beef burger', price: 10, category: 'Main Course', restaurantId: createdRestaurants[1]._id },
    { name: 'French Fries', description: 'Crispy potato fries', price: 5, category: 'Sides', restaurantId: createdRestaurants[1]._id },
  ];

  await MenuItem.insertMany(menuItems);
  console.log('Menu items seeded');

  console.log('Seeding completed successfully');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
