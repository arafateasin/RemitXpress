const Transaction = require("../models/Transaction");
const User = require("../models/User");
const blockchainConfig = require("../config/blockchain");
const logger = require("../utils/logger");
const { ethers } = require("ethers");

class RemittanceController {
  // Get exchange rates
  async getExchangeRates(req, res) {
    try {
      // Mock exchange rates - in production, integrate with real APIs
      const rates = {
        USD: { EUR: 0.85, GBP: 0.73, ETH: 0.0004, USDT: 1.0, USDC: 1.0 },
        EUR: { USD: 1.18, GBP: 0.86, ETH: 0.0005, USDT: 1.18, USDC: 1.18 },
        ETH: { USD: 2500, EUR: 2118, GBP: 1825, USDT: 2500, USDC: 2500 },
        USDT: { USD: 1.0, EUR: 0.85, GBP: 0.73, ETH: 0.0004, USDC: 1.0 },
        USDC: { USD: 1.0, EUR: 0.85, GBP: 0.73, ETH: 0.0004, USDT: 1.0 },
      };

      res.json({
        rates,
        timestamp: new Date().toISOString(),
        source: "RemitXpress Rate Engine",
      });
    } catch (error) {
      logger.error("Exchange rates error:", error);
      res.status(500).json({ error: "Failed to fetch exchange rates" });
    }
  }

  // Calculate transaction fees
  async calculateFees(req, res) {
    try {
      const { amount, fromCurrency, toCurrency, transactionType } = req.body;

      // Mock fee calculation
      const baseFee = amount * 0.01; // 1% base fee
      let gasFee = 0;
      let networkFee = 0;

      if (transactionType.includes("crypto")) {
        gasFee = 0.001; // ETH equivalent
        networkFee = 0.0005; // ETH equivalent
      }

      const totalFees = baseFee + gasFee + networkFee;
      const totalAmount = amount + totalFees;

      res.json({
        amount,
        fees: {
          platformFee: baseFee,
          gasFee,
          networkFee,
          total: totalFees,
        },
        totalAmount,
        fromCurrency,
        toCurrency,
      });
    } catch (error) {
      logger.error("Fee calculation error:", error);
      res.status(500).json({ error: "Failed to calculate fees" });
    }
  }

  // Initiate remittance
  async initiateRemittance(req, res) {
    try {
      const {
        recipient,
        amount,
        currency,
        toCurrency,
        transactionType,
        metadata,
      } = req.body;

      // Validate sender KYC
      if (req.user.kycStatus !== "approved") {
        return res.status(403).json({
          error: "KYC verification required",
          kycStatus: req.user.kycStatus,
        });
      }

      // Calculate fees
      const baseFee = amount * 0.01;
      const gasFee = transactionType.includes("crypto") ? 0.001 : 0;
      const networkFee = transactionType.includes("crypto") ? 0.0005 : 0;
      const totalAmount = amount + baseFee + gasFee + networkFee;

      // Create transaction record
      const transaction = new Transaction({
        sender: req.user._id,
        recipient,
        amount,
        currency,
        conversionRate: {
          from: currency,
          to: toCurrency,
          rate: 1, // Mock rate
          timestamp: new Date(),
        },
        fees: {
          platformFee: baseFee,
          gasFee,
          networkFee,
        },
        totalAmount,
        type: transactionType,
        metadata,
        riskScore: this.calculateRiskScore(req.user, amount, recipient),
      });

      await transaction.save();

      // Process transaction based on type
      if (transactionType.includes("crypto")) {
        await this.processBlockchainTransaction(transaction);
      } else {
        await this.processFiatTransaction(transaction);
      }

      logger.info(`Remittance initiated: ${transaction.transactionId}`);

      res.status(201).json({
        message: "Remittance initiated successfully",
        transaction: transaction.toJSON(),
      });
    } catch (error) {
      logger.error("Remittance initiation error:", error);
      res.status(500).json({ error: "Failed to initiate remittance" });
    }
  }

  // Process blockchain transaction
  async processBlockchainTransaction(transaction) {
    try {
      const contract = blockchainConfig.getRemittanceContract();
      const signer = blockchainConfig.getSigner();

      if (!contract || !signer) {
        throw new Error("Blockchain configuration not available");
      }

      // Convert amount to wei
      const amountWei = ethers.parseEther(transaction.amount.toString());

      // Send transaction
      const tx = await contract.remit(transaction.recipient.walletAddress, {
        value: amountWei,
      });

      // Update transaction with blockchain data
      transaction.blockchain = {
        network: "ethereum",
        txHash: tx.hash,
        blockNumber: tx.blockNumber,
        confirmations: 0,
      };
      transaction.status = "processing";
      await transaction.save();

      // Wait for confirmation
      const receipt = await tx.wait();
      transaction.blockchain.blockNumber = receipt.blockNumber;
      transaction.blockchain.confirmations = 1;
      transaction.status = "completed";
      await transaction.save();
    } catch (error) {
      transaction.status = "failed";
      await transaction.save();
      throw error;
    }
  }

  // Process fiat transaction
  async processFiatTransaction(transaction) {
    try {
      // Mock fiat processing
      transaction.status = "processing";
      await transaction.save();

      // Simulate processing delay
      setTimeout(async () => {
        transaction.status = "completed";
        await transaction.save();
      }, 5000);
    } catch (error) {
      transaction.status = "failed";
      await transaction.save();
      throw error;
    }
  }

  // Calculate risk score
  calculateRiskScore(user, amount, recipient) {
    let score = 0;

    // Amount-based risk
    if (amount > 10000) score += 30;
    else if (amount > 5000) score += 20;
    else if (amount > 1000) score += 10;

    // User history risk
    if (!user.lastLogin) score += 20;
    if (user.kycStatus !== "approved") score += 40;

    // Recipient risk
    if (!recipient.walletAddress && !recipient.bankDetails) score += 10;

    return Math.min(score, 100);
  }

  // Get transaction history
  async getTransactionHistory(req, res) {
    try {
      const { page = 1, limit = 10, status, type } = req.query;
      const query = { sender: req.user._id };

      if (status) query.status = status;
      if (type) query.type = type;

      const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate("sender", "firstName lastName email");

      const total = await Transaction.countDocuments(query);

      res.json({
        transactions,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      });
    } catch (error) {
      logger.error("Transaction history error:", error);
      res.status(500).json({ error: "Failed to fetch transaction history" });
    }
  }

  // Get transaction details
  async getTransactionDetails(req, res) {
    try {
      const { transactionId } = req.params;

      const transaction = await Transaction.findOne({
        transactionId,
        sender: req.user._id,
      }).populate("sender", "firstName lastName email");

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      res.json(transaction);
    } catch (error) {
      logger.error("Transaction details error:", error);
      res.status(500).json({ error: "Failed to fetch transaction details" });
    }
  }

  // Cancel transaction
  async cancelTransaction(req, res) {
    try {
      const { transactionId } = req.params;

      const transaction = await Transaction.findOne({
        transactionId,
        sender: req.user._id,
      });

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      if (transaction.status !== "pending") {
        return res.status(400).json({
          error: "Transaction cannot be cancelled",
          status: transaction.status,
        });
      }

      transaction.status = "cancelled";
      await transaction.save();

      logger.info(`Transaction cancelled: ${transactionId}`);

      res.json({ message: "Transaction cancelled successfully" });
    } catch (error) {
      logger.error("Transaction cancellation error:", error);
      res.status(500).json({ error: "Failed to cancel transaction" });
    }
  }
}

module.exports = new RemittanceController();
