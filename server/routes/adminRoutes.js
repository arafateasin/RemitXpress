const express = require("express");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { adminMiddleware } = require("../middlewares/authMiddleware");
const logger = require("../utils/logger");

const router = express.Router();

// Apply admin middleware to all routes
router.use(adminMiddleware);

// Get dashboard statistics
router.get("/dashboard", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const pendingKyc = await User.countDocuments({ kycStatus: "pending" });
    const totalTransactions = await Transaction.countDocuments();
    const pendingTransactions = await Transaction.countDocuments({
      status: "pending",
    });
    const completedTransactions = await Transaction.countDocuments({
      status: "completed",
    });

    // Calculate total volume (simplified)
    const volumeResult = await Transaction.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, totalVolume: { $sum: "$amount" } } },
    ]);

    const totalVolume = volumeResult[0]?.totalVolume || 0;

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        pendingKyc,
      },
      transactions: {
        total: totalTransactions,
        pending: pendingTransactions,
        completed: completedTransactions,
      },
      volume: {
        total: totalVolume,
      },
    });
  } catch (error) {
    logger.error("Admin dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// Get all users with pagination
router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 20, search, kycStatus } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }

    if (kycStatus) {
      query.kycStatus = kycStatus;
    }

    const users = await User.find(query)
      .select("-password -twoFactorAuth.secret")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    logger.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get user details
router.get("/users/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "-password -twoFactorAuth.secret"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's transaction count
    const transactionCount = await Transaction.countDocuments({
      sender: user._id,
    });

    res.json({
      user,
      transactionCount,
    });
  } catch (error) {
    logger.error("Get user details error:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

// Update user status
router.patch("/users/:userId/status", async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isActive = isActive;
    await user.save();

    logger.info(
      `User ${user.email} status updated to ${
        isActive ? "active" : "inactive"
      } by admin ${req.user.email}`
    );

    res.json({
      message: "User status updated successfully",
      user: user.toJSON(),
    });
  } catch (error) {
    logger.error("Update user status error:", error);
    res.status(500).json({ error: "Failed to update user status" });
  }
});

// Review KYC
router.patch("/users/:userId/kyc", async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid KYC status" });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.kycStatus !== "pending") {
      return res.status(400).json({ error: "KYC not in pending status" });
    }

    user.kycStatus = status;
    user.kycData.reviewedAt = new Date();
    user.kycData.reviewNotes = notes;

    await user.save();

    logger.info(
      `KYC ${status} for user ${user.email} by admin ${req.user.email}`
    );

    res.json({
      message: `KYC ${status} successfully`,
      user: user.toJSON(),
    });
  } catch (error) {
    logger.error("KYC review error:", error);
    res.status(500).json({ error: "Failed to review KYC" });
  }
});

// Get all transactions with advanced filtering
router.get("/transactions", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      minAmount,
      maxAmount,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (minAmount)
      query.amount = { ...query.amount, $gte: parseFloat(minAmount) };
    if (maxAmount)
      query.amount = { ...query.amount, $lte: parseFloat(maxAmount) };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate("sender", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    logger.error("Get transactions error:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Get suspicious transactions
router.get("/transactions/suspicious", async (req, res) => {
  try {
    const suspiciousTransactions = await Transaction.find({
      riskScore: { $gte: 70 },
    })
      .populate("sender", "firstName lastName email")
      .sort({ riskScore: -1, createdAt: -1 })
      .limit(50);

    res.json({ transactions: suspiciousTransactions });
  } catch (error) {
    logger.error("Get suspicious transactions error:", error);
    res.status(500).json({ error: "Failed to fetch suspicious transactions" });
  }
});

// Flag transaction for review
router.patch("/transactions/:transactionId/flag", async (req, res) => {
  try {
    const { reason } = req.body;

    const transaction = await Transaction.findOne({
      transactionId: req.params.transactionId,
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    transaction.flagged = true;
    transaction.flagReason = reason;
    transaction.flaggedBy = req.user._id;
    transaction.flaggedAt = new Date();

    await transaction.save();

    logger.info(
      `Transaction ${transaction.transactionId} flagged by admin ${req.user.email}: ${reason}`
    );

    res.json({
      message: "Transaction flagged successfully",
      transaction,
    });
  } catch (error) {
    logger.error("Flag transaction error:", error);
    res.status(500).json({ error: "Failed to flag transaction" });
  }
});

// Generate compliance report
router.get("/reports/compliance", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const query = dateFilter.length ? { createdAt: dateFilter } : {};

    // Aggregate transaction data
    const report = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          avgRiskScore: { $avg: "$riskScore" },
        },
      },
    ]);

    // High-risk transactions
    const highRiskTransactions = await Transaction.find({
      ...query,
      riskScore: { $gte: 80 },
    }).populate("sender", "firstName lastName email");

    res.json({
      summary: report,
      highRiskTransactions,
      generatedAt: new Date(),
      period: { startDate, endDate },
    });
  } catch (error) {
    logger.error("Compliance report error:", error);
    res.status(500).json({ error: "Failed to generate compliance report" });
  }
});

module.exports = router;
