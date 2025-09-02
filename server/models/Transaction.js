const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      email: String,
      walletAddress: String,
      name: String,
      bankDetails: {
        accountNumber: String,
        routingNumber: String,
        bankName: String,
        swiftCode: String,
      },
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      enum: ["USD", "EUR", "GBP", "ETH", "USDT", "USDC"],
    },
    conversionRate: {
      from: String,
      to: String,
      rate: Number,
      timestamp: Date,
    },
    fees: {
      platformFee: {
        type: Number,
        default: 0,
      },
      gasFee: {
        type: Number,
        default: 0,
      },
      networkFee: {
        type: Number,
        default: 0,
      },
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled"],
      default: "pending",
    },
    type: {
      type: String,
      enum: [
        "crypto_to_crypto",
        "crypto_to_fiat",
        "fiat_to_crypto",
        "fiat_to_fiat",
      ],
      required: true,
    },
    blockchain: {
      network: String,
      txHash: String,
      blockNumber: Number,
      confirmations: {
        type: Number,
        default: 0,
      },
    },
    metadata: {
      purpose: String,
      reference: String,
      sourceOfFunds: String,
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    complianceChecks: {
      amlCheck: {
        status: String,
        checkedAt: Date,
        provider: String,
      },
      sanctionsCheck: {
        status: String,
        checkedAt: Date,
        provider: String,
      },
    },
    timeline: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        message: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Generate unique transaction ID
transactionSchema.pre("save", function (next) {
  if (!this.transactionId) {
    this.transactionId =
      "TXN-" +
      Date.now() +
      "-" +
      Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

// Add timeline entry when status changes
transactionSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      message: `Transaction ${this.status}`,
    });
  }
  next();
});

module.exports = mongoose.model("Transaction", transactionSchema);
