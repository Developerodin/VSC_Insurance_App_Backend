# S3 Image Upload & Subcategory Integration Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [API Endpoints](#api-endpoints)
4. [Step-by-Step Process](#step-by-step-process)
5. [Postman Examples](#postman-examples)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## 🎯 Overview

This guide explains how to upload images to AWS S3 and then save the image URL and key to the subcategory model. The process involves:

1. **Upload image to S3** using the common upload endpoint
2. **Get S3 response** with URL and key
3. **Save to subcategory** using the image URL and key

## 🔧 Prerequisites

### Environment Variables
Ensure these are set in your `.env` file:
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket_name
```

### Required Packages
The following packages are already installed in your project:
- `aws-sdk` - AWS SDK for Node.js
- `multer` - File upload middleware
- `uuid` - Unique identifier generation

## 🚀 API Endpoints

### 1. Upload Image to S3
```
POST /v1/common/upload
Content-Type: multipart/form-data
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "url": "https://bucket.s3.amazonaws.com/1234567890-uuid.jpg",
    "key": "1234567890-uuid.jpg"
  }
}
```

### 2. Create/Update Subcategory with Image
```
POST /v1/subcategories
PATCH /v1/subcategories/:subcategoryId
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```

## 📝 Step-by-Step Process

### Step 1: Upload Image to S3

#### Using Postman:
1. **Set Method**: `POST`
2. **URL**: `http://localhost:3002/v1/common/upload`
3. **Headers**:
   - `Authorization`: `Bearer <your_jwt_token>`
   - `Content-Type`: `multipart/form-data` (Postman sets this automatically)
4. **Body**: 
   - Select `form-data`
   - Add key: `file` (Type: File)
   - Select your image file

#### Using JavaScript/Fetch:
```javascript
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('http://localhost:3002/v1/common/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
const { url, key } = result.data;
```

### Step 2: Save Image Data to Subcategory

#### Create New Subcategory:
```json
{
  "name": "Life Insurance Premium",
  "description": "Premium life insurance coverage",
  "category": "64f1a2b3c4d5e6f7a8b9c0d1",
  "image": "https://bucket.s3.amazonaws.com/1234567890-uuid.jpg",
  "imageKey": "1234567890-uuid.jpg"
}
```

#### Update Existing Subcategory:
```json
{
  "image": "https://bucket.s3.amazonaws.com/1234567890-uuid.jpg",
  "imageKey": "1234567890-uuid.jpg"
}
```

## 📱 Postman Examples

### Example 1: Complete Image Upload & Subcategory Creation

#### Step 1: Upload Image
```
POST http://localhost:3002/v1/common/upload
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Body (form-data):
  file: [Select your image file]
```

**Expected Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "url": "https://your-bucket.s3.amazonaws.com/1703123456789-abc123-def456.jpg",
    "key": "1703123456789-abc123-def456.jpg"
  }
}
```

#### Step 2: Create Subcategory with Image
```
POST http://localhost:3002/v1/subcategories
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
Body (raw JSON):
{
  "name": "Life Insurance Premium",
  "description": "Premium life insurance coverage with comprehensive benefits",
  "category": "64f1a2b3c4d5e6f7a8b9c0d1",
  "features": ["Death Benefit", "Cash Value", "Tax Advantages"],
  "terms": ["30-day grace period", "Suicide clause"],
  "commission": {
    "percentage": 15,
    "minAmount": 1000,
    "maxAmount": 50000,
    "bonus": 5
  },
  "pricing": {
    "basePrice": 5000,
    "currency": "INR"
  },
  "coverage": "Death benefit up to 1 crore",
  "duration": "20 years",
  "status": "active",
  "image": "https://your-bucket.s3.amazonaws.com/1703123456789-abc123-def456.jpg",
  "imageKey": "1703123456789-abc123-def456.jpg"
}
```

**Expected Response:**
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
  "name": "Life Insurance Premium",
  "description": "Premium life insurance coverage with comprehensive benefits",
  "category": "64f1a2b3c4d5e6f7a8b9c0d1",
  "features": ["Death Benefit", "Cash Value", "Tax Advantages"],
  "terms": ["30-day grace period", "Suicide clause"],
  "commission": {
    "percentage": 15,
    "minAmount": 1000,
    "maxAmount": 50000,
    "bonus": 5
  },
  "pricing": {
    "basePrice": 5000,
    "currency": "INR"
  },
  "coverage": "Death benefit up to 1 crore",
  "duration": "20 years",
  "status": "active",
  "image": "https://your-bucket.s3.amazonaws.com/1703123456789-abc123-def456.jpg",
  "imageKey": "1703123456789-abc123-def456.jpg",
  "createdAt": "2023-12-21T10:30:00.000Z",
  "updatedAt": "2023-12-21T10:30:00.000Z"
}
```

### Example 2: Update Existing Subcategory Image

#### Step 1: Upload New Image
```
POST http://localhost:3002/v1/common/upload
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Body (form-data):
  file: [Select your new image file]
```

#### Step 2: Update Subcategory with New Image
```
PATCH http://localhost:3002/v1/subcategories/64f1a2b3c4d5e6f7a8b9c0d2
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
Body (raw JSON):
{
  "image": "https://your-bucket.s3.amazonaws.com/1703123456789-new-image.jpg",
  "imageKey": "1703123456789-new-image.jpg"
}
```

## ⚠️ Error Handling

### Common Upload Errors

#### 1. File Too Large
```json
{
  "success": false,
  "message": "File too large",
  "error": "File size exceeds 5MB limit"
}
```

#### 2. No File Provided
```json
{
  "success": false,
  "message": "No file uploaded"
}
```

#### 3. S3 Upload Failed
```json
{
  "success": false,
  "message": "Error uploading file",
  "error": "Access Denied"
}
```

### Common Subcategory Errors

#### 1. Validation Error
```json
{
  "code": 400,
  "message": "Validation Error",
  "details": [
    {
      "field": "image",
      "message": "\"image\" must be a string"
    }
  ]
}
```

#### 2. Authentication Error
```json
{
  "code": 401,
  "message": "Please authenticate"
}
```

#### 3. Permission Error
```json
{
  "code": 403,
  "message": "Forbidden"
}
```

## 🎯 Best Practices

### 1. Image Upload
- **File Size**: Keep images under 5MB for optimal performance
- **File Types**: Use common formats (JPG, PNG, GIF)
- **Naming**: Let the system generate unique names automatically
- **Error Handling**: Always handle upload failures gracefully

### 2. Data Management
- **Store Both Fields**: Always save both `image` (URL) and `imageKey` (S3 key)
- **Update Both**: When updating images, update both fields
- **Validation**: Validate image URLs before saving
- **Cleanup**: Consider deleting old S3 files when updating images

### 3. Security
- **Authentication**: Always use valid JWT tokens
- **File Validation**: Validate file types and sizes
- **Access Control**: Ensure proper permissions for subcategory operations

## 🔧 Troubleshooting

### Issue 1: Image Upload Fails
**Symptoms**: 500 error during upload
**Solutions**:
- Check AWS credentials in `.env`
- Verify S3 bucket exists and is accessible
- Check file size (max 5MB)
- Ensure proper file format

### Issue 2: Subcategory Creation Fails
**Symptoms**: 400 validation error
**Solutions**:
- Verify image URL format
- Check if imageKey is provided
- Ensure all required fields are filled
- Validate category ID exists

### Issue 3: Image Not Displaying
**Symptoms**: Image URL returns 404
**Solutions**:
- Verify S3 bucket permissions
- Check if image was actually uploaded
- Validate image URL format
- Ensure S3 bucket is publicly accessible (if needed)

### Issue 4: Permission Denied
**Symptoms**: 403 Forbidden error
**Solutions**:
- Check JWT token validity
- Verify user has required permissions
- Ensure proper role assignments
- Check authentication middleware

## 📚 Additional Resources

### API Documentation
- **Common Controller**: `/src/controllers/common.controller.js`
- **Subcategory Controller**: `/src/controllers/subcategory.controller.js`
- **Subcategory Validation**: `/src/validations/subcategory.validation.js`
- **Subcategory Model**: `/src/models/subcategory.model.js`

### AWS S3 Configuration
- **Bucket Policy**: Ensure proper access permissions
- **CORS Configuration**: Configure if needed for web applications
- **Lifecycle Rules**: Set up automatic cleanup for old files

### Testing
- **Postman Collection**: Import the provided examples
- **Environment Variables**: Set up different environments (dev, staging, prod)
- **Mock Data**: Use sample images for testing

---

## 🚀 Quick Start Checklist

- [ ] Set up AWS credentials in `.env`
- [ ] Test S3 connection
- [ ] Upload test image using `/v1/common/upload`
- [ ] Create subcategory with image data
- [ ] Verify image displays correctly
- [ ] Test image update functionality
- [ ] Implement error handling in your application

This guide covers the complete workflow from S3 image upload to subcategory integration. Follow the examples and best practices to ensure smooth implementation.
