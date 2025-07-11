# LeadsFields FieldOption Feature

## Overview
The LeadsFields API now supports a `fieldOption` property that allows you to mark fields as either `optional` or `mandatory`. This feature gives you control over which fields are required when collecting lead information.

## New Field Structure

Each field in the LeadsFields configuration now includes a `fieldOption` property:

```json
{
  "name": "customer_name",
  "type": "text",
  "fieldOption": "mandatory"  // or "optional"
}
```

## Field Option Values

- **`optional`** (default): The field is not required when collecting lead data
- **`mandatory`**: The field is required and must be filled when collecting lead data

## Usage Examples

### 1. Creating a New Configuration with Mixed Field Options

```json
POST /v1/leadsFields
{
  "product": "507f1f77bcf86cd799439011",
  "category": "507f1f77bcf86cd799439012",
  "fields": [
    {
      "name": "full_name",
      "type": "text",
      "fieldOption": "mandatory"
    },
    {
      "name": "email",
      "type": "email",
      "fieldOption": "optional"
    },
    {
      "name": "phone",
      "type": "phone",
      "fieldOption": "mandatory"
    },
    {
      "name": "address",
      "type": "textarea",
      "fieldOption": "optional"
    }
  ]
}
```

### 2. Adding a New Field with Mandatory Option

```json
POST /v1/leadsFields/{leadsFieldsId}/fields
{
  "name": "date_of_birth",
  "type": "date",
  "fieldOption": "mandatory"
}
```

### 3. Updating an Existing Field's Option

```json
PATCH /v1/leadsFields/{leadsFieldsId}/fields/{fieldIndex}
{
  "fieldOption": "mandatory"
}
```

### 4. Making a Field Optional

```json
PATCH /v1/leadsFields/{leadsFieldsId}/fields/{fieldIndex}
{
  "fieldOption": "optional"
}
```

## Backward Compatibility

### Existing Documents
- All existing LeadsFields documents will automatically have `fieldOption: "optional"` added to their fields
- No data migration is required - the system handles this automatically
- Existing API calls will continue to work without modification

### Default Behavior
- If `fieldOption` is not specified when creating a field, it defaults to `"optional"`
- This ensures backward compatibility with existing code

## Database Migration

If you have existing LeadsFields documents in your database, run the migration script:

```bash
node scripts/updateLeadsFieldsFieldOption.js
```

This script will:
1. Find all existing LeadsFields documents
2. Add `fieldOption: "optional"` to any fields that don't have it
3. Save the updated documents

## API Endpoints Supporting FieldOption

### Create/Update Operations
- `POST /v1/leadsFields` - Create new configuration
- `PATCH /v1/leadsFields/{id}` - Update entire configuration
- `POST /v1/leadsFields/{id}/fields` - Add new field
- `PATCH /v1/leadsFields/{id}/fields/{index}` - Update specific field

### Read Operations
- `GET /v1/leadsFields` - List all configurations
- `GET /v1/leadsFields/{id}` - Get specific configuration
- `GET /v1/leadsFields/product/{productId}/category/{categoryId}` - Get by product-category

## Validation Rules

### FieldOption Validation
- Must be either `"optional"` or `"mandatory"`
- Case-sensitive
- Defaults to `"optional"` if not provided

### Field Name Validation
- Field names must be unique within a configuration
- Cannot update a field name to conflict with existing fields

## Frontend Integration

### Form Validation
When building forms based on LeadsFields configurations:

```javascript
// Example frontend validation logic
const validateForm = (formData, leadsFieldsConfig) => {
  const errors = {};
  
  leadsFieldsConfig.fields.forEach(field => {
    const value = formData[field.name];
    
    if (field.fieldOption === 'mandatory' && (!value || value.trim() === '')) {
      errors[field.name] = `${field.name} is required`;
    }
  });
  
  return errors;
};
```

### UI Indicators
- Show asterisk (*) for mandatory fields
- Use different styling for optional vs mandatory fields
- Disable form submission if mandatory fields are empty

## Best Practices

### 1. Field Naming
- Use descriptive, lowercase names with underscores
- Examples: `customer_name`, `phone_number`, `date_of_birth`

### 2. Field Types
- Choose appropriate types for validation
- Common types: `text`, `email`, `phone`, `number`, `date`, `textarea`

### 3. Field Options
- Make truly essential fields mandatory
- Keep optional fields for additional information
- Consider user experience when setting field options

### 4. Configuration Management
- Use meaningful product-category combinations
- Document field purposes and requirements
- Test configurations before deploying

## Error Handling

### Common Error Responses

```json
// Field name conflict
{
  "code": 400,
  "message": "Field with this name already exists"
}

// Invalid field option
{
  "code": 400,
  "message": "\"fieldOption\" must be one of [optional, mandatory]"
}

// Missing mandatory field
{
  "code": 400,
  "message": "Field validation failed"
}
```

## Testing

### Test Cases to Consider
1. Create configuration with mixed field options
2. Update field option from optional to mandatory
3. Update field option from mandatory to optional
4. Add new field with different options
5. Validate form submission with mandatory fields
6. Test backward compatibility with existing data

### Sample Test Data
```json
{
  "product": "test_product_id",
  "category": "test_category_id",
  "fields": [
    {
      "name": "required_field",
      "type": "text",
      "fieldOption": "mandatory"
    },
    {
      "name": "optional_field",
      "type": "email",
      "fieldOption": "optional"
    }
  ]
}
```

## Migration Checklist

- [ ] Run the migration script for existing documents
- [ ] Update frontend forms to respect field options
- [ ] Test all API endpoints with new fieldOption
- [ ] Update documentation for your team
- [ ] Test backward compatibility
- [ ] Deploy to staging environment
- [ ] Monitor for any issues
- [ ] Deploy to production

This feature provides flexible control over field requirements while maintaining backward compatibility with existing configurations. 