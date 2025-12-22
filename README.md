# Food Ordering Application

This is a full-stack food ordering application built with Next.js, MongoDB, and JWT authentication. It features Role-Based Access Control (RBAC) and Location-Based Access Control.

## Tech Stack
- **Frontend**: Next.js (App Router), Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT

## Core Features
- **RBAC**: Admin, Manager, and Member roles with specific permissions.
- **Location-Based Access Control**: Users can only access data (restaurants/orders) within their own country (except Admins).
- **Seeding**: Pre-populated with specific user personas (Nick Fury, Captain Marvel, etc.).

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 2. Environment Variables
Create a .env.local file in the root directory and add:
```env
MONGODB_URI=mongodb://localhost:27017/food-ordering-app
JWT_SECRET=your-secret-key
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed the Database
Run the seeding script to populate the database with test users and restaurants:
```bash
npx tsx scripts/seed.ts
```

### 5. Run the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## User Personas
| Name | Role | Country | Email |
|------|------|---------|-------|
| Nick Fury | ADMIN | Global | nick@shield.com |
| Captain Marvel | MANAGER | India | carol@shield.com |
| Captain America | MANAGER | America | steve@shield.com |
| Thanos | MEMBER | India | thanos@titan.com |
| Thor | MEMBER | India | thor@asgard.com |
| Travis | MEMBER | America | travis@scott.com |

*Password for all accounts: password123*

## Access Control Matrix
- **View Restaurants & Menu**: Everyone
- **Create Order**: Everyone
- **Place Order (Pay)**: ADMIN, MANAGER only
- **Cancel Order**: ADMIN, MANAGER only
- **Update Payment Method**: ADMIN only
- **Location Restriction**: Managers/Members can only see/act on data in their country.
