import mongoose from 'mongoose';
import { mongoose as mongooseConfig } from '../src/config/config.js';

async function removeCategoryNameUniqueIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongooseConfig.url, mongooseConfig.options);
    console.log('Connected to MongoDB');

    // Get the database instance
    const db = mongoose.connection.db;
    
    // Get the categories collection
    const categoriesCollection = db.collection('categories');
    
    // List all indexes on the categories collection
    const indexes = await categoriesCollection.indexes();
    console.log('Current indexes on categories collection:');
    indexes.forEach(index => {
      console.log('Index:', index);
    });
    
    // Find and remove the unique index on the name field
    const nameIndex = indexes.find(index => 
      index.key && index.key.name === 1 && index.unique === true
    );
    
    if (nameIndex) {
      console.log('Found unique index on name field, removing it...');
      await categoriesCollection.dropIndex(nameIndex.name);
      console.log('Successfully removed unique index on name field');
    } else {
      console.log('No unique index found on name field');
    }
    
    // List indexes again to confirm
    const updatedIndexes = await categoriesCollection.indexes();
    console.log('Updated indexes on categories collection:');
    updatedIndexes.forEach(index => {
      console.log('Index:', index);
    });
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the migration
removeCategoryNameUniqueIndex(); 