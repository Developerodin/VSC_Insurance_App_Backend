import httpStatus from 'http-status';
import { LeadsFields } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { pick } from '../utils/pick.js';

export const createLeadsFields = catchAsync(async (req, res) => {
  // Check if configuration already exists for this product-category combination
  const existingConfig = await LeadsFields.findOne({
    product: req.body.product,
    category: req.body.category,
  });

  if (existingConfig) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'LeadsFields configuration already exists for this product-category combination');
  }

  const leadsFields = await LeadsFields.create(req.body);
  
  // Populate before sending response
  await leadsFields.populate('product', 'name');
  await leadsFields.populate('category', 'name');
  
  res.status(httpStatus.CREATED).send(leadsFields);
});

export const getLeadsFields = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['product', 'category']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  
  // Add population to options
  options.populate = 'product,category';
  
  const leadsFields = await LeadsFields.paginate(filter, options);
  res.send(leadsFields);
});

export const getLeadsFieldsById = catchAsync(async (req, res) => {
  const leadsFields = await LeadsFields.findById(req.params.leadsFieldsId)
    .populate('product', 'name')
    .populate('category', 'name');
  if (!leadsFields) {
    throw new ApiError(httpStatus.NOT_FOUND, 'LeadsFields not found');
  }
  res.send(leadsFields);
});

export const getLeadsFieldsByProductCategory = catchAsync(async (req, res) => {
  const { productId, categoryId } = req.params;
  
  const leadsFields = await LeadsFields.findOne({
    product: productId,
    category: categoryId,
  })
    .populate('product', 'name')
    .populate('category', 'name');
  
  if (!leadsFields) {
    throw new ApiError(httpStatus.NOT_FOUND, 'LeadsFields configuration not found for this product-category combination');
  }
  
  res.send(leadsFields);
});

export const updateLeadsFields = catchAsync(async (req, res) => {
  const leadsFields = await LeadsFields.findById(req.params.leadsFieldsId);
  if (!leadsFields) {
    throw new ApiError(httpStatus.NOT_FOUND, 'LeadsFields not found');
  }

  // If updating product-category combination, check for duplicates
  if (req.body.product || req.body.category) {
    const productId = req.body.product || leadsFields.product;
    const categoryId = req.body.category || leadsFields.category;
    
    const existingConfig = await LeadsFields.findOne({
      product: productId,
      category: categoryId,
      _id: { $ne: req.params.leadsFieldsId }
    });

    if (existingConfig) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'LeadsFields configuration already exists for this product-category combination');
    }
  }

  Object.assign(leadsFields, req.body);
  await leadsFields.save();
  
  // Populate before sending response
  await leadsFields.populate('product', 'name');
  await leadsFields.populate('category', 'name');
  
  res.send(leadsFields);
});

export const deleteLeadsFields = catchAsync(async (req, res) => {
  const leadsFields = await LeadsFields.findById(req.params.leadsFieldsId);
  if (!leadsFields) {
    throw new ApiError(httpStatus.NOT_FOUND, 'LeadsFields not found');
  }
  await leadsFields.remove();
  res.status(httpStatus.NO_CONTENT).send();
});

// Field Management Operations

export const addField = catchAsync(async (req, res) => {
  const leadsFields = await LeadsFields.findById(req.params.leadsFieldsId);
  if (!leadsFields) {
    throw new ApiError(httpStatus.NOT_FOUND, 'LeadsFields not found');
  }

  // Check if field name already exists
  const existingField = leadsFields.fields.find(field => field.name === req.body.name);
  if (existingField) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Field with this name already exists');
  }

  leadsFields.fields.push(req.body);
  await leadsFields.save();
  
  // Populate before sending response
  await leadsFields.populate('product', 'name');
  await leadsFields.populate('category', 'name');
  
  res.send(leadsFields);
});

export const updateField = catchAsync(async (req, res) => {
  const { leadsFieldsId, fieldIndex } = req.params;
  
  const leadsFields = await LeadsFields.findById(leadsFieldsId);
  if (!leadsFields) {
    throw new ApiError(httpStatus.NOT_FOUND, 'LeadsFields not found');
  }

  const index = parseInt(fieldIndex);
  if (index < 0 || index >= leadsFields.fields.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid field index');
  }

  // Check if new field name conflicts with existing fields (except current one)
  if (req.body.name) {
    const existingField = leadsFields.fields.find((field, i) => 
      i !== index && field.name === req.body.name
    );
    if (existingField) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Field with this name already exists');
    }
  }

  // Update field properties
  Object.assign(leadsFields.fields[index], req.body);
  await leadsFields.save();
  
  // Populate before sending response
  await leadsFields.populate('product', 'name');
  await leadsFields.populate('category', 'name');
  
  res.send(leadsFields);
});

export const removeField = catchAsync(async (req, res) => {
  const { leadsFieldsId, fieldIndex } = req.params;
  
  const leadsFields = await LeadsFields.findById(leadsFieldsId);
  if (!leadsFields) {
    throw new ApiError(httpStatus.NOT_FOUND, 'LeadsFields not found');
  }

  const index = parseInt(fieldIndex);
  if (index < 0 || index >= leadsFields.fields.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid field index');
  }

  leadsFields.fields.splice(index, 1);
  await leadsFields.save();
  
  // Populate before sending response
  await leadsFields.populate('product', 'name');
  await leadsFields.populate('category', 'name');
  
  res.send(leadsFields);
});

export const removeFieldByName = catchAsync(async (req, res) => {
  const { leadsFieldsId, fieldName } = req.params;
  
  const leadsFields = await LeadsFields.findById(leadsFieldsId);
  if (!leadsFields) {
    throw new ApiError(httpStatus.NOT_FOUND, 'LeadsFields not found');
  }

  const fieldIndex = leadsFields.fields.findIndex(field => field.name === fieldName);
  if (fieldIndex === -1) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Field not found');
  }

  leadsFields.fields.splice(fieldIndex, 1);
  await leadsFields.save();
  
  // Populate before sending response
  await leadsFields.populate('product', 'name');
  await leadsFields.populate('category', 'name');
  
  res.send(leadsFields);
});

export const reorderFields = catchAsync(async (req, res) => {
  const leadsFields = await LeadsFields.findById(req.params.leadsFieldsId);
  if (!leadsFields) {
    throw new ApiError(httpStatus.NOT_FOUND, 'LeadsFields not found');
  }

  const { fieldIndexes } = req.body; // Array of field indexes in new order
  
  if (!Array.isArray(fieldIndexes) || fieldIndexes.length !== leadsFields.fields.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid field indexes array');
  }

  // Validate all indexes are valid and unique
  const validIndexes = fieldIndexes.every(index => 
    Number.isInteger(index) && index >= 0 && index < leadsFields.fields.length
  );
  const uniqueIndexes = new Set(fieldIndexes).size === fieldIndexes.length;

  if (!validIndexes || !uniqueIndexes) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or duplicate field indexes');
  }

  // Reorder fields
  const reorderedFields = fieldIndexes.map(index => leadsFields.fields[index]);
  leadsFields.fields = reorderedFields;
  await leadsFields.save();
  
  // Populate before sending response
  await leadsFields.populate('product', 'name');
  await leadsFields.populate('category', 'name');
  
  res.send(leadsFields);
});

export const leadsFieldsController = {
  createLeadsFields,
  getLeadsFields,
  getLeadsFieldsById,
  getLeadsFieldsByProductCategory,
  updateLeadsFields,
  deleteLeadsFields,
  addField,
  updateField,
  removeField,
  removeFieldByName,
  reorderFields,
}; 