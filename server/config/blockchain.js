const { ethers } = require("ethers");
const logger = require("../utils/logger");

class BlockchainConfig {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.remittanceContract = null;
  }

  async initialize() {
    try {
      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(
        process.env.RPC_URL || "http://localhost:8545"
      );

      // Initialize signer (for contract interactions)
      if (process.env.PRIVATE_KEY) {
        this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
      }

      // Initialize contract
      if (
        process.env.REMITTANCE_CONTRACT_ADDRESS &&
        process.env.REMITTANCE_CONTRACT_ABI
      ) {
        const abi = JSON.parse(process.env.REMITTANCE_CONTRACT_ABI);
        this.remittanceContract = new ethers.Contract(
          process.env.REMITTANCE_CONTRACT_ADDRESS,
          abi,
          this.signer
        );
      }

      logger.info("Blockchain configuration initialized");
    } catch (error) {
      logger.error("Blockchain initialization failed:", error);
    }
  }

  getProvider() {
    return this.provider;
  }

  getSigner() {
    return this.signer;
  }

  getRemittanceContract() {
    return this.remittanceContract;
  }
}

module.exports = new BlockchainConfig();
