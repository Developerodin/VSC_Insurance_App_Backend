import initPermissions from './initPermissions.js';
import updateRolePermissions from './updateRolePermissions.js';
import mongoose from 'mongoose';
import * as config from '../config/config.js';
import { fileURLToPath } from 'url';

const updateAllPermissions = async () => {
  try {
    console.log('Starting permission system update...');
    
    // Connect to MongoDB
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    console.log('Connected to MongoDB');
    
    // First initialize permissions
    console.log('\n=== INITIALIZING PERMISSIONS ===');
    const initSuccess = await initPermissions();
    if (!initSuccess) {
      console.error('Failed to initialize permissions');
      return false;
    }
    
    // Wait a moment for operations to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Then update role permissions
    console.log('\n=== UPDATING ROLE PERMISSIONS ===');
    const updateSuccess = await updateRolePermissions();
    if (!updateSuccess) {
      console.error('Failed to update role permissions');
      return false;
    }
    
    console.log('\nPermission system update complete!');
    return true;
  } catch (error) {
    console.error('Error updating permission system:', error);
    return false;
  } finally {
    // Close the MongoDB connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Closed MongoDB connection');
    }
  }
};

// Execute if this file is run directly (not imported)
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  updateAllPermissions().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

export default updateAllPermissions; 