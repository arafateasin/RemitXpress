const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  console.log("🚀 Starting RemitXpress deployment to Sepolia testnet...");
  console.log("⚡ Powered by Alchemy RPC");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.05")) {
    console.warn(
      "⚠️  Low balance! You need at least 0.05 Sepolia ETH for deployment"
    );
    console.log("🚰 Get Sepolia ETH from: https://sepoliafaucet.com/");
    return;
  }

  const deploymentData = {
    network: "sepolia",
    chainId: 11155111,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {},
  };

  try {
    // Deploy PriceConverter first
    console.log("\n📊 Deploying PriceConverter contract...");
    const PriceConverter = await ethers.getContractFactory("PriceConverter");
    const priceConverter = await PriceConverter.deploy();
    await priceConverter.waitForDeployment();

    const priceConverterAddress = await priceConverter.getAddress();
    console.log("✅ PriceConverter deployed to:", priceConverterAddress);

    deploymentData.contracts.PriceConverter = {
      address: priceConverterAddress,
      txHash: priceConverter.deploymentTransaction()?.hash,
    };

    // Deploy RemitXpress (Optimized)
    console.log("\n💸 Deploying RemitXpress contract...");
    const RemitXpress = await ethers.getContractFactory("RemitXpress");

    // Constructor parameters
    const feeCollector = deployer.address;
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
    console.log("✅ RemitXpress deployed to:", remitXpressAddress);

    deploymentData.contracts.RemitXpress = {
      address: remitXpressAddress,
      txHash: remitXpress.deploymentTransaction()?.hash,
      feeCollector: feeCollector,
      priceConverter: priceConverterAddr,
    };

    // Test basic functionality
    console.log("\n🧪 Testing deployed contracts...");

    // Test PriceConverter
    try {
      const latestPrice = await priceConverter.getLatestPrice();
      console.log(
        "📈 Latest ETH/USD price:",
        ethers.formatUnits(latestPrice, 8)
      );
    } catch (error) {
      console.warn(
        "⚠️  Price feed test failed (normal on testnet):",
        error.message
      );
    }

    // Test RemitXpress
    const transferFee = await remitXpress.transferFee();
    console.log("💰 Transfer fee:", ethers.formatEther(transferFee), "ETH");

    // Save deployment info for frontend
    const configPath = path.join(
      __dirname,
      "../../client/src/config/contracts.json"
    );

    // Ensure directory exists
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(deploymentData, null, 2));
    console.log("📄 Contract addresses saved to:", configPath);

    // Create ABI files for frontend
    const artifacts = {
      RemitXpress: require("../artifacts/contracts/RemitXpressOptimized.sol/RemitXpress.json"),
      PriceConverter: require("../artifacts/contracts/PriceConverter.sol/PriceConverter.json"),
    };

    const abiPath = path.join(__dirname, "../../client/src/config/abis.json");
    const abis = {
      RemitXpress: artifacts.RemitXpress.abi,
      PriceConverter: artifacts.PriceConverter.abi,
    };

    fs.writeFileSync(abiPath, JSON.stringify(abis, null, 2));
    console.log("📜 Contract ABIs saved to:", abiPath);

    console.log("\n🎉 Deployment completed successfully!");
    console.log("🔗 Sepolia Etherscan:");
    console.log(
      `   PriceConverter: https://sepolia.etherscan.io/address/${priceConverterAddress}`
    );
    console.log(
      `   RemitXpress: https://sepolia.etherscan.io/address/${remitXpressAddress}`
    );

    console.log("\n📋 Next steps:");
    console.log("1. Verify contracts on Etherscan");
    console.log("2. Update your frontend to use these contract addresses");
    console.log("3. Test transactions with small amounts first");
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("💥 Script execution failed:", error);
  process.exitCode = 1;
});
