/**
 * Seed script to create an admin user
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' src/scripts/seed-admin.ts
 * Or add to package.json scripts and run: npm run seed:admin
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define MONGODB_URI in .env.local');
  process.exit(1);
}

// Admin user details - CHANGE THESE!
const ADMIN_USER = {
  email: 'admin@ambujaneotia.com',
  password: 'Admin@123', // Change this password!
  name: 'Admin User',
  employeeId: 'AN-ADMIN-001',
  phone: '9999999999',
  department: 'Administration',
  role: 'admin',
  isActive: true,
  addresses: [],
};

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    const usersCollection = db.collection('users');

    // Check if admin already exists
    const existingAdmin = await usersCollection.findOne({ email: ADMIN_USER.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists with email:', ADMIN_USER.email);
      console.log('Role:', existingAdmin.role);
      
      // Update to admin role if not already
      if (existingAdmin.role !== 'admin') {
        await usersCollection.updateOne(
          { email: ADMIN_USER.email },
          { $set: { role: 'admin' } }
        );
        console.log('Updated user role to admin');
      }
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_USER.password, salt);

      // Create admin user
      const result = await usersCollection.insertOne({
        ...ADMIN_USER,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('Admin user created successfully!');
      console.log('ID:', result.insertedId);
    }

    console.log('\n========================================');
    console.log('Admin Login Credentials:');
    console.log('Email:', ADMIN_USER.email);
    console.log('Password:', ADMIN_USER.password);
    console.log('========================================');
    console.log('\nLogin at: http://localhost:3000/login');
    console.log('After login, you will be redirected to /vendor/dashboard');

  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

seedAdmin();
