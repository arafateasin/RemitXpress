const express = require("express");
const User = require("../models/User");
const logger = require("../utils/logger");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/kyc/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      req.user._id + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, and PDF files are allowed."
        )
      );
    }
  },
});

// Get user profile
router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.toJSON());
  } catch (error) {
    logger.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update user profile
router.patch("/profile", async (req, res) => {
  try {
    const allowedUpdates = ["firstName", "lastName", "phone"];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ error: "Invalid updates" });
    }

    const user = await User.findById(req.user._id);
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();

    res.json(user.toJSON());
  } catch (error) {
    logger.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Submit KYC documents
router.post("/kyc", upload.array("documents", 3), async (req, res) => {
  try {
    const { documentType, documentNumber, address, dateOfBirth } = req.body;

    const user = await User.findById(req.user._id);

    if (user.kycStatus === "approved") {
      return res.status(400).json({ error: "KYC already approved" });
    }

    const documentImages = req.files ? req.files.map((file) => file.path) : [];

    user.kycData = {
      documentType,
      documentNumber,
      documentImages,
      address: JSON.parse(address),
      dateOfBirth: new Date(dateOfBirth),
      submittedAt: new Date(),
    };
    user.kycStatus = "pending";

    await user.save();

    logger.info(`KYC submitted for user: ${user.email}`);

    res.json({
      message: "KYC documents submitted successfully",
      status: user.kycStatus,
    });
  } catch (error) {
    logger.error("KYC submission error:", error);
    res.status(500).json({ error: "Failed to submit KYC documents" });
  }
});

// Get KYC status
router.get("/kyc/status", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      status: user.kycStatus,
      submittedAt: user.kycData?.submittedAt,
      reviewedAt: user.kycData?.reviewedAt,
    });
  } catch (error) {
    logger.error("KYC status error:", error);
    res.status(500).json({ error: "Failed to fetch KYC status" });
  }
});

// Update security settings
router.patch("/security", async (req, res) => {
  try {
    const { loginNotifications, transactionNotifications } = req.body;

    const user = await User.findById(req.user._id);

    if (loginNotifications !== undefined) {
      user.securitySettings.loginNotifications = loginNotifications;
    }

    if (transactionNotifications !== undefined) {
      user.securitySettings.transactionNotifications = transactionNotifications;
    }

    await user.save();

    res.json({
      message: "Security settings updated",
      settings: user.securitySettings,
    });
  } catch (error) {
    logger.error("Security settings error:", error);
    res.status(500).json({ error: "Failed to update security settings" });
  }
});

// Get user balances
router.get("/balances", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ balances: user.balances });
  } catch (error) {
    logger.error("Get balances error:", error);
    res.status(500).json({ error: "Failed to fetch balances" });
  }
});

// Connect wallet
router.post("/wallet/connect", async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;

    // Verify wallet ownership (simplified)
    if (!walletAddress || !signature) {
      return res
        .status(400)
        .json({ error: "Wallet address and signature required" });
    }

    const user = await User.findById(req.user._id);
    user.walletAddress = walletAddress;
    await user.save();

    logger.info(`Wallet connected for user: ${user.email}`);

    res.json({
      message: "Wallet connected successfully",
      walletAddress: user.walletAddress,
    });
  } catch (error) {
    logger.error("Wallet connection error:", error);
    res.status(500).json({ error: "Failed to connect wallet" });
  }
});

// Disconnect wallet
router.delete("/wallet/disconnect", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.walletAddress = undefined;
    await user.save();

    res.json({ message: "Wallet disconnected successfully" });
  } catch (error) {
    logger.error("Wallet disconnection error:", error);
    res.status(500).json({ error: "Failed to disconnect wallet" });
  }
});

module.exports = router;
