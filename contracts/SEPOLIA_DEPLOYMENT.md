# 🚀 Sepolia Deployment Guide

## Prerequisites

1. **Alchemy Account & API Key**

   - Go to https://www.alchemy.com/
   - Create free account
   - Create new app for "Ethereum Sepolia"
   - Copy your API key

2. **MetaMask Wallet Setup**

   - Install MetaMask extension
   - Create/import wallet
   - Add Sepolia network to MetaMask
   - Get Sepolia ETH from faucet: https://sepoliafaucet.com/

3. **Etherscan API Key** (for verification)
   - Go to https://etherscan.io/apis
   - Create free account
   - Generate API key

## Deployment Steps

### 1. Setup Environment

```bash
cd contracts
cp .env.example .env
```

### 2. Edit .env file with your credentials:

```env
ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
PRIVATE_KEY=your_wallet_private_key_without_0x
ETHERSCAN_API_KEY=your_etherscan_api_key
REPORT_GAS=true
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Compile Contracts

```bash
npx hardhat compile
```

### 5. Deploy to Sepolia

```bash
npx hardhat run scripts/deploy-production.js --network sepolia
```

### 6. Verify Contracts (Optional)

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS CONSTRUCTOR_ARGS
```

## After Deployment

✅ Contract addresses will be automatically saved to `client/src/config/contracts.json`
✅ ABIs will be saved to `client/src/config/abis.json`
✅ Your frontend will automatically connect to Sepolia contracts

## Troubleshooting

- **Insufficient funds**: Get more Sepolia ETH from faucet
- **Network issues**: Check Alchemy URL and API key
- **Gas estimation failed**: Increase gas limit in hardhat.config.js

## Security Notes

⚠️ Never commit your `.env` file
⚠️ Use a separate wallet for testnet deployment
⚠️ Double-check contract addresses before mainnet deployment
