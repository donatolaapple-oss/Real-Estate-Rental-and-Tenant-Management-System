import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Import existing models
import OwnerUser from './models/OwnerUser.js';
import TenantUser from './models/TenantUser.js';

async function updateDemoUsers() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Hash password for demo users (secret) - using the same method as models
    const password = 'secret';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('New hash for "secret":', hashedPassword);
    
    // Update owner user
    const owner = await OwnerUser.findOneAndUpdate(
      { email: 'test_owner_user@property.com' },
      { password: hashedPassword },
      { new: true }
    );
    
    // Update tenant user
    const tenant = await TenantUser.findOneAndUpdate(
      { email: 'test_tenant_user@property.com' },
      { password: hashedPassword },
      { new: true }
    );
    
    console.log('✅ Demo users updated successfully!');
    console.log('Owner:', owner.email);
    console.log('Tenant:', tenant.email);
    
    // Re-fetch users to test password comparison
    const updatedOwner = await OwnerUser.findOne({ email: 'test_owner_user@property.com' }).select('+password');
    const updatedTenant = await TenantUser.findOne({ email: 'test_tenant_user@property.com' }).select('+password');
    
    // Test password comparison
    const ownerMatch = await bcrypt.compare(password, updatedOwner.password);
    const tenantMatch = await bcrypt.compare(password, updatedTenant.password);
    
    console.log('✅ Owner password match:', ownerMatch);
    console.log('✅ Tenant password match:', tenantMatch);
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating demo users:', error);
    process.exit(1);
  }
}

updateDemoUsers();
