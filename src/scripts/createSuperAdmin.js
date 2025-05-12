import mongoose from 'mongoose';
import User from '../models/user.model.js';
import * as config from '../config/config.js';

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    
    const superAdmin = {
      name: 'Super Admin',
      email: 'superadmin@gmail.com',
      password: 'Admin@123',
      role: 'superAdmin',
      mobileNumber: '9876543210',
      status: 'active',
      isEmailVerified: true,
      isMobileVerified: true
    };

    const existingAdmin = await User.findOne({ email: superAdmin.email });
    if (existingAdmin) {
      console.log('Super admin already exists');
      process.exit(0);
    }

    const user = await User.create(superAdmin);
    console.log('Super admin created successfully:', user);
    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
};

createSuperAdmin(); 