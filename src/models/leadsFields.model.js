import mongoose from 'mongoose';
import { toJSON, paginate } from './plugins/index.js';

// Schema for individual field definition
const fieldDefinitionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    fieldOption: {
        type: String,
        enum: ['optional', 'mandatory'],
        default: 'optional',
        trim: true
    }
}, { _id: false }); // Disable _id for subdocuments

// Main LeadsFields Schema
const leadsFieldsSchema = mongoose.Schema({
    product: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },
    category: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Category',
        required: true,
        index: true
    },
    fields: [fieldDefinitionSchema],
}, {
    timestamps: true,
    collection: 'leadsfields'
});

// Compound indexes for better query performance
leadsFieldsSchema.index({ product: 1, category: 1 }, { unique: true });
leadsFieldsSchema.index({ 'fields.name': 1 });
leadsFieldsSchema.index({ createdAt: -1 });

// add plugin that converts mongoose to json
leadsFieldsSchema.plugin(toJSON);
leadsFieldsSchema.plugin(paginate);

// Virtual for field count
leadsFieldsSchema.virtual('fieldCount').get(function() {
    return this.fields ? this.fields.length : 0;
});

/**
 * @typedef LeadsFields
 */
const LeadsFields = mongoose.model('LeadsFields', leadsFieldsSchema);

export default LeadsFields;