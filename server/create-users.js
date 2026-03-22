import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Import existing models
import OwnerUser from './models/OwnerUser.js';
import TenantUser from './models/TenantUser.js';

async function createDemoUsers() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Delete existing demo users
    await OwnerUser.deleteMany({ email: { $in: ['test_owner_user@property.com'] } });
    await TenantUser.deleteMany({ email: { $in: ['test_tenant_user@property.com'] } });
    
    // Hash password for demo users (secret)
    const password = 'secret';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create owner user
    const owner = await OwnerUser.create({
      email: 'test_owner_user@property.com',
      password: hashedPassword,
      role: 'owner',
      accountStatus: true,
      firstName: 'Test',
      lastName: 'Owner',
      address: '123 Test St',
      city: 'Test City',
      country: 'Test Country',
      phoneNumber: '+1234567890',
      dateOfBirth: '1990-01-01',
      gender: 'Male'
    });
    
    // Create tenant user
    const tenant = await TenantUser.create({
      email: 'test_tenant_user@property.com',
      password: hashedPassword,
      role: 'tenant',
      accountStatus: true,
      firstName: 'Test',
      lastName: 'Tenant',
      address: '456 Demo Ave',
      city: 'Demo City',
      country: 'Demo Country',
      phoneNumber: '+0987654321',
      dateOfBirth: '1995-05-05',
      gender: 'Female'
    });
    
    console.log('✅ Demo users created successfully!');
    console.log('Owner:', owner.email, 'Password:', password);
    console.log('Tenant:', tenant.email, 'Password:', password);
    
    // Verify users
    const ownerCheck = await OwnerUser.findOne({ email: 'test_owner_user@property.com' });
    const tenantCheck = await TenantUser.findOne({ email: 'test_tenant_user@property.com' });
    
    console.log('✅ Owner verified:', !!ownerCheck, 'Account Status:', ownerCheck?.accountStatus);
    console.log('✅ Tenant verified:', !!tenantCheck, 'Account Status:', tenantCheck?.accountStatus);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating demo users:', error);
    process.exit(1);
  }
}

createDemoUsers();
