const mongoose = require("mongoose");
const argon2 = require("argon2");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false, // Made optional for OAuth users
      minlength: 8,
    },
    phone: {
      type: String,
      required: false, // Made optional for OAuth users
      trim: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Two-Factor Authentication
    twoFactorSecret: String,
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorBackupCodes: [String],

    // Password Reset
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,

    // KYC Information
    kyc: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected", "documents_requested"],
        default: "pending",
      },
      documents: [
        {
          type: {
            type: String,
            enum: ["passport", "driver_license", "national_id", "utility_bill"],
          },
          url: String,
          uploadDate: {
            type: Date,
            default: Date.now,
          },
          status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
          },
        },
      ],
      verificationLevel: {
        type: Number,
        min: 0,
        max: 3,
        default: 0,
      },
      reviewNotes: String,
      reviewDate: Date,
    },

    // Transaction Limits
    limits: {
      daily: {
        type: Number,
        default: 1000, // $1000 USD equivalent
      },
      monthly: {
        type: Number,
        default: 5000, // $5000 USD equivalent
      },
      perTransaction: {
        type: Number,
        default: 500, // $500 USD equivalent
      },
    },

    // Wallet Information
    wallet: {
      balance: {
        type: Number,
        default: 0,
      },
      address: String,
      privateKey: String, // Should be encrypted in production
    },

    // Security Settings
    security: {
      deviceFingerprints: [
        {
          fingerprint: String,
          lastUsed: {
            type: Date,
            default: Date.now,
          },
          trusted: {
            type: Boolean,
            default: false,
          },
        },
      ],
      ipWhitelist: [String],
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: false,
        },
        push: {
          type: Boolean,
          default: true,
        },
      },
    },

    // User Role
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // OAuth integration fields
    oauth: {
      google: {
        id: String,
        email: String,
      },
      facebook: {
        id: String,
        email: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  try {
    this.password = await argon2.hash(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    throw new Error("User has no password set (OAuth user)");
  }
  try {
    return await argon2.verify(this.password, candidatePassword);
  } catch (error) {
    throw error;
  }
};

// Check if user is locked
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }

  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.twoFactorSecret;
  delete user.passwordResetToken;
  delete user.emailVerificationToken;
  delete user.wallet.privateKey;
  return user;
};

module.exports = mongoose.model("User", userSchema);
