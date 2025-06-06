import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
// import { toJSON, paginate } from './plugins.js';
import { roles } from '../config/roles.js';
import toJSON from './plugins/toJSON.plugin.js';
import paginate from './plugins/paginate.plugin.js';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default:'Test User'
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      private: true,
    },
    mobileNumber: {
      type: String,
      trim: true,
      validate(value) {
        if (!validator.isMobilePhone(value, 'en-IN')) {
          throw new Error('Invalid mobile number');
        }
      },
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'inactive', 'suspended'],
      default: 'pending',
    },
    kycStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    bankAccounts: [{
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'BankAccount',
    }],
    totalCommission: {
      type: Number,
      default: 0,
    },
    totalLeads: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    lastLogin: {
      type: Date,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isMobileVerified: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
    },
    profilePictureKey: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: {
        type: String,
        default: 'India',
      },
    },
    documents: [{
      type: {
        type: String,
        enum: ['aadhaar', 'pan', 'addressProof', 'other'],
      },
      url: String,
      verified: {
        type: Boolean,
        default: false,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    onboardingStatus: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'rejected'],
      default: 'pending',
    },
    kycDetails: {
      aadhaarNumber: {
        type: String,
        trim: true,
        validate(value) {
          if (value && !validator.isLength(value, { min: 12, max: 12 })) {
            throw new Error('Invalid Aadhaar number');
          }
        },
      },
      aadhaarVerified: {
        type: Boolean,
        default: false,
      },
      aadhaarVerificationDate: Date,
      panNumber: {
        type: String,
        trim: true,
        validate(value) {
          if (value && !validator.matches(value, /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)) {
            throw new Error('Invalid PAN number');
          }
        },
      },
      panVerified: {
        type: Boolean,
        default: false,
      },
      panVerificationDate: Date,
      documents: [{
        type: {
          type: String,
          enum: ['aadhaar', 'pan', 'addressProof', 'photo', 'other'],
          required: true,
        },
        url: String,
        key: String,
        verified: {
          type: Boolean,
          default: false,
        },
        verifiedBy: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: 'User',
        },
        verifiedAt: Date,
        rejectionReason: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      }],
      aadhaarOtpRefId: {
        type: String,
      },
      aadhaarKycData: {
        type: mongoose.Schema.Types.Mixed,
      },
      panKycData: {
        type: mongoose.Schema.Types.Mixed,
      },
    },
    otp: {
      code: String,
      expiresAt: Date,
      attempts: {
        type: Number,
        default: 0,
      },
    },
    emailVerification: {
      token: String,
      expiresAt: Date,
      verified: {
        type: Boolean,
        default: false,
      },
    },
    mobileVerification: {
      token: String,
      expiresAt: Date,
      verified: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if mobile number is taken
 * @param {string} mobileNumber - The user's mobile number
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
// userSchema.statics.isMobileTaken = async function (mobileNumber, excludeUserId) {
//   const user = await this.findOne({ mobileNumber, _id: { $ne: excludeUserId } });
//   return !!user;
// };

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

export default User;

