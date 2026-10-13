const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment of RailMatteAgreementRegistry...");

  const [deployer] = await ethers.getSigners();
  if (deployer) {
    console.log(`Deploying with account: ${deployer.address}`);
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`Account balance: ${ethers.formatEther(balance)} MON`);
  } else {
    console.log("No signer available. Verify DEPLOYER_PRIVATE_KEY configuration.");
  }

  const RegistryFactory = await ethers.getContractFactory("RailMatteAgreementRegistry");
  const registry = await RegistryFactory.deploy();
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  console.log("\n========================================================");
  console.log(`RailMatteAgreementRegistry successfully deployed!`);
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Network: ${network.name} (Chain ID: ${network.config.chainId})`);
  console.log("========================================================\n");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
