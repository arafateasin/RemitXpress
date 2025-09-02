const express = require("express");
const remitController = require("../controllers/remitController");
const { kycMiddleware } = require("../middlewares/authMiddleware");
const Joi = require("joi");

const router = express.Router();

// Validation schemas
const remittanceSchema = Joi.object({
  recipient: Joi.object({
    email: Joi.string().email(),
    walletAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/),
    name: Joi.string().min(2).max(100),
    bankDetails: Joi.object({
      accountNumber: Joi.string(),
      routingNumber: Joi.string(),
      bankName: Joi.string(),
      swiftCode: Joi.string(),
    }),
  }).required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string()
    .valid("USD", "EUR", "GBP", "ETH", "USDT", "USDC")
    .required(),
  toCurrency: Joi.string()
    .valid("USD", "EUR", "GBP", "ETH", "USDT", "USDC")
    .required(),
  transactionType: Joi.string()
    .valid(
      "crypto_to_crypto",
      "crypto_to_fiat",
      "fiat_to_crypto",
      "fiat_to_fiat"
    )
    .required(),
  metadata: Joi.object({
    purpose: Joi.string().max(200),
    reference: Joi.string().max(100),
    sourceOfFunds: Joi.string().max(200),
  }),
});

const feeCalculationSchema = Joi.object({
  amount: Joi.number().positive().required(),
  fromCurrency: Joi.string()
    .valid("USD", "EUR", "GBP", "ETH", "USDT", "USDC")
    .required(),
  toCurrency: Joi.string()
    .valid("USD", "EUR", "GBP", "ETH", "USDT", "USDC")
    .required(),
  transactionType: Joi.string()
    .valid(
      "crypto_to_crypto",
      "crypto_to_fiat",
      "fiat_to_crypto",
      "fiat_to_fiat"
    )
    .required(),
});

// Middleware for validation
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

// Routes
router.get("/rates", remitController.getExchangeRates);
router.post(
  "/calculate-fees",
  validate(feeCalculationSchema),
  remitController.calculateFees
);
router.post(
  "/send",
  kycMiddleware,
  validate(remittanceSchema),
  remitController.initiateRemittance
);
router.get("/history", remitController.getTransactionHistory);
router.get(
  "/transaction/:transactionId",
  remitController.getTransactionDetails
);
router.patch(
  "/transaction/:transactionId/cancel",
  remitController.cancelTransaction
);

module.exports = router;
