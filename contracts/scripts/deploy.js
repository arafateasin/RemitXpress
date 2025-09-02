const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying RemitXpress Optimized contracts...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  // Deploy PriceConverter first
  console.log("\n📊 Deploying PriceConverter...");
  const PriceConverter = await ethers.getContractFactory("PriceConverter");
  const priceConverter = await PriceConverter.deploy();
  await priceConverter.waitForDeployment();

  const priceConverterAddress = await priceConverter.getAddress();
  console.log("✅ PriceConverter deployed to:", priceConverterAddress);

  // Deploy the optimized RemitXpress contract
  console.log("\n💸 Deploying RemitXpress Optimized...");
  const RemitXpress = await ethers.getContractFactory(
    "contracts/RemitXpressOptimized.sol:RemitXpress"
  );

  // Deploy with fee collector (RemitXpress doesn't need PriceConverter in constructor)
  const remitXpress = await RemitXpress.deploy(deployer.address);
  await remitXpress.waitForDeployment();

  const contractAddress = await remitXpress.getAddress();
  console.log("✅ RemitXpress Optimized deployed to:", contractAddress);
  console.log("🔧 Fee Collector:", deployer.address);
  console.log("📊 Price Converter:", priceConverterAddress);
  console.log("🌐 Network:", (await ethers.provider.getNetwork()).name);

  // Get deployment gas costs
  const deploymentTx = remitXpress.deploymentTransaction();
  const receipt = await deploymentTx.wait();

  console.log("\n📈 Gas Usage:");
  console.log("⛽ Gas Used:", receipt.gasUsed.toString());
  console.log(
    "💰 Gas Price:",
    ethers.formatUnits(deploymentTx.gasPrice, "gwei"),
    "gwei"
  );

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Contract Addresses:");
  console.log(`   PriceConverter: ${priceConverterAddress}`);
  console.log(`   RemitXpress: ${contractAddress}`);

  return {
    priceConverter: priceConverterAddress,
    remitXpress: contractAddress,
  };

  // Save deployment info
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    network: network.name,
    chainId: network.chainId.toString(),
    deploymentTime: new Date().toISOString(),
    transactionHash: remitXpress.deploymentTransaction().hash,
  };

  console.log("\nDeployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Verify basic contract functionality
  console.log("\nVerifying contract deployment...");
  try {
    const owner = await remitXpress.owner();
    console.log("Contract owner:", owner);
    console.log("Contract is paused:", await remitXpress.paused());
    console.log("✅ Contract deployed and verified successfully!");
  } catch (error) {
    console.error("❌ Error verifying contract:", error.message);
  }

  return contractAddress;
}

// Execute deployment
main()
  .then((address) => {
    console.log(`\n🎉 Deployment completed! Contract address: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
