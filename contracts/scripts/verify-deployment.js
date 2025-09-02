const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔍 Verifying deployment on Sepolia testnet...");

  // Load deployment info
  const fs = require("fs");
  const path = require("path");
  const deploymentFile = path.join(
    __dirname,
    "../deployments/sepolia-deployment.json"
  );

  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ No deployment file found. Please deploy first.");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  console.log("📋 Loaded deployment info:", deploymentInfo.deploymentDate);

  const priceConverterAddress = deploymentInfo.contracts.PriceConverter.address;
  const remitXpressAddress = deploymentInfo.contracts.RemitXpress.address;

  console.log("\n🔗 Contract Addresses:");
  console.log("   PriceConverter:", priceConverterAddress);
  console.log("   RemitXpress:", remitXpressAddress);

  // Verify contracts are deployed and working
  try {
    // Test PriceConverter
    console.log("\n📊 Testing PriceConverter...");
    const priceConverter = await ethers.getContractAt(
      "PriceConverter",
      priceConverterAddress
    );
    const owner = await priceConverter.owner();
    console.log("✅ PriceConverter owner:", owner);

    // Test RemitXpress
    console.log("\n💸 Testing RemitXpress...");
    const remitXpress = await ethers.getContractAt(
      "RemitXpress",
      remitXpressAddress
    );
    const feeCollector = await remitXpress.feeCollector();
    const priceConverterFromContract = await remitXpress.priceConverter();
    const isPaused = await remitXpress.paused();

    console.log("✅ RemitXpress fee collector:", feeCollector);
    console.log("✅ RemitXpress price converter:", priceConverterFromContract);
    console.log("✅ RemitXpress paused status:", isPaused);

    // Verify price converter integration
    if (
      priceConverterFromContract.toLowerCase() ===
      priceConverterAddress.toLowerCase()
    ) {
      console.log("✅ Price converter integration verified!");
    } else {
      console.error("❌ Price converter integration mismatch!");
    }

    console.log("\n🎉 All contracts verified and working correctly!");

    // Display useful information for frontend integration
    console.log("\n🔧 Frontend Integration Info:");
    console.log("=".repeat(50));
    console.log(`Network: Sepolia Testnet`);
    console.log(`Chain ID: 11155111`);
    console.log(
      `RPC URL: https://eth-sepolia.g.alchemy.com/v2/plxrsDTIKjqXyslhzToOi`
    );
    console.log(`PriceConverter Address: ${priceConverterAddress}`);
    console.log(`RemitXpress Address: ${remitXpressAddress}`);
    console.log(`Block Explorer: https://sepolia.etherscan.io/`);

    console.log("\n📝 Update your blockchain config with these addresses:");
    console.log(`export const CONTRACTS = {`);
    console.log(`  PRICE_CONVERTER: "${priceConverterAddress}",`);
    console.log(`  REMIT_XPRESS: "${remitXpressAddress}"`);
    console.log(`};`);
  } catch (error) {
    console.error("❌ Verification failed:");
    console.error(error.message);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("\n✅ Verification completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Verification failed:");
    console.error(error);
    process.exit(1);
  });
