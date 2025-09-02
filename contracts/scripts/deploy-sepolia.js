const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 Starting deployment to Sepolia testnet...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.01")) {
    console.warn(
      "⚠️  Low balance! Make sure you have enough Sepolia ETH for deployment"
    );
  }

  // Deploy PriceConverter first
  console.log("\n📊 Deploying PriceConverter contract...");
  const PriceConverter = await ethers.getContractFactory("PriceConverter");
  const priceConverter = await PriceConverter.deploy();
  await priceConverter.waitForDeployment();

  const priceConverterAddress = await priceConverter.getAddress();
  console.log("✅ PriceConverter deployed to:", priceConverterAddress);

  // Deploy RemitXpress (Optimized)
  console.log("\n💸 Deploying RemitXpress Optimized contract...");
  const RemitXpress = await ethers.getContractFactory("RemitXpress");

  // Constructor parameters
  const feeCollector = deployer.address; // Use deployer as fee collector for now
  const priceConverterAddr = priceConverterAddress;

  console.log("🔧 Constructor parameters:");
  console.log("   Fee Collector:", feeCollector);
  console.log("   Price Converter:", priceConverterAddr);

  const remitXpress = await RemitXpress.deploy(
    feeCollector,
    priceConverterAddr
  );
  await remitXpress.waitForDeployment();

  const remitXpressAddress = await remitXpress.getAddress();
  console.log("✅ RemitXpress Optimized deployed to:", remitXpressAddress);

  // Get deployment transaction details
  const deploymentTx = remitXpress.deploymentTransaction();
  const receipt = await deploymentTx.wait();

  console.log("\n📈 Deployment Summary:");
  console.log("🏗️  Block Number:", receipt.blockNumber);
  console.log("⛽ Gas Used:", receipt.gasUsed.toString());
  console.log(
    "💰 Gas Price:",
    ethers.formatUnits(deploymentTx.gasPrice, "gwei"),
    "gwei"
  );
  console.log(
    "💸 Total Cost:",
    ethers.formatEther(receipt.gasUsed * deploymentTx.gasPrice),
    "ETH"
  );

  // Verify contracts on Etherscan (optional)
  console.log("\n🔍 Contract Verification Info:");
  console.log("📋 To verify PriceConverter on Etherscan:");
  console.log(
    `   npx hardhat verify --network sepolia ${priceConverterAddress}`
  );
  console.log("📋 To verify RemitXpress on Etherscan:");
  console.log(
    `   npx hardhat verify --network sepolia ${remitXpressAddress} "${feeCollector}" "${priceConverterAddr}"`
  );

  // Save deployment addresses
  const deploymentInfo = {
    network: "sepolia",
    chainId: 11155111,
    deploymentDate: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      PriceConverter: {
        address: priceConverterAddress,
        gasUsed: "TBD", // This would need to be tracked separately
      },
      RemitXpress: {
        address: remitXpressAddress,
        gasUsed: receipt.gasUsed.toString(),
        constructorArgs: [feeCollector, priceConverterAddr],
      },
    },
    transactionHashes: {
      PriceConverter: "TBD",
      RemitXpress: deploymentTx.hash,
    },
  };

  // Write deployment info to file
  const fs = require("fs");
  const path = require("path");

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(deploymentsDir, "sepolia-deployment.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", deploymentFile);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n🔗 Explorer Links:");
  console.log(
    `   PriceConverter: https://sepolia.etherscan.io/address/${priceConverterAddress}`
  );
  console.log(
    `   RemitXpress: https://sepolia.etherscan.io/address/${remitXpressAddress}`
  );

  return {
    priceConverter: priceConverterAddress,
    remitXpress: remitXpressAddress,
  };
}

// Handle errors
main()
  .then((addresses) => {
    console.log("\n✅ All contracts deployed successfully!");
    console.log("📋 Contract Addresses:", addresses);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
