const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log(
    "Account balance:",
    (await deployer.provider.getBalance(deployer.address)).toString()
  );

  // Deploy RemitXpress contract
  const feeCollector = deployer.address; // Use deployer as initial fee collector
  const RemitXpress = await hre.ethers.getContractFactory("RemitXpress");
  const remitxpress = await RemitXpress.deploy(feeCollector);

  await remitxpress.waitForDeployment();

  console.log("RemitXpress deployed to:", await remitxpress.getAddress());
  console.log("Fee collector set to:", feeCollector);

  // Verify deployer is authorized operator
  const isAuthorized = await remitxpress.authorizedOperators(deployer.address);
  console.log("Deployer is authorized operator:", isAuthorized);

  // Get initial fee rate
  const feeRate = await remitxpress.baseFeeRate();
  console.log("Initial fee rate (basis points):", feeRate.toString());

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: await remitxpress.getAddress(),
    feeCollector: feeCollector,
    deployer: deployer.address,
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return deploymentInfo;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
