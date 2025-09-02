const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying PriceConverter contract...");

  // Get the contract factory
  const PriceConverter = await ethers.getContractFactory("PriceConverter");

  // Get deployment info
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  // Deploy the contract
  const priceConverter = await PriceConverter.deploy();
  await priceConverter.waitForDeployment();

  const contractAddress = await priceConverter.getAddress();
  console.log("PriceConverter deployed to:", contractAddress);
  console.log("Deployed by:", deployer.address);
  console.log("Network:", await ethers.provider.getNetwork());

  // Save deployment info
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    network: network.name,
    chainId: network.chainId.toString(),
    deploymentTime: new Date().toISOString(),
    transactionHash: priceConverter.deploymentTransaction().hash,
  };

  console.log("\nDeployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Verify contract deployment
  console.log("\nVerifying contract deployment...");
  const owner = await priceConverter.owner();
  const supportedCurrencies = await priceConverter.getSupportedCurrencies();

  console.log("Contract owner:", owner);
  console.log("Supported currencies:", supportedCurrencies.length);
  console.log("Default currencies:", supportedCurrencies.slice(0, 5));

  // Test getting an exchange rate
  try {
    const [rate, lastUpdated, isActive] = await priceConverter.getExchangeRate(
      "USD",
      "EUR"
    );
    console.log("USD to EUR rate:", ethers.formatEther(rate));
    console.log("Rate is active:", isActive);
  } catch (error) {
    console.log("No initial USD/EUR rate set");
  }

  console.log("✅ PriceConverter deployed and verified successfully!");
  console.log(
    `\n🎉 Deployment completed! Contract address: ${contractAddress}`
  );

  return {
    contractAddress,
    deploymentInfo,
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
