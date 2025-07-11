import mongoose from 'mongoose';
import { LeadsFields } from '../src/models/index.js';
import { mongoose as mongooseConfig } from '../src/config/config.js';

// Connect to MongoDB
mongoose.connect(mongooseConfig.url, mongooseConfig.options);

const updateLeadsFieldsFieldOption = async () => {
  try {
    console.log('Starting LeadsFields fieldOption update...');
    
    // Find all LeadsFields documents
    const leadsFieldsDocs = await LeadsFields.find({});
    console.log(`Found ${leadsFieldsDocs.length} LeadsFields documents to update`);
    
    let updatedCount = 0;
    
    for (const doc of leadsFieldsDocs) {
      let needsUpdate = false;
      
      // Check if any fields don't have fieldOption
      if (doc.fields && Array.isArray(doc.fields)) {
        for (const field of doc.fields) {
          if (!field.fieldOption) {
            field.fieldOption = 'optional'; // Default to optional
            needsUpdate = true;
          }
        }
      }
      
      if (needsUpdate) {
        await doc.save();
        updatedCount++;
        console.log(`Updated document: ${doc._id}`);
      }
    }
    
    console.log(`Successfully updated ${updatedCount} LeadsFields documents`);
    console.log('All existing documents now have fieldOption field');
    
  } catch (error) {
    console.error('Error updating LeadsFields:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the update script
updateLeadsFieldsFieldOption(); 