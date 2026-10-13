
const { ethers, network } = require("hardhat");

async function main() {
  console.log("Starting RailMatte contract deployment...");

  const chain = await ethers.provider.getNetwork();

  if (Number(chain.chainId) !== 10143) {
    throw new Error(`Wrong network: expected Monad Testnet 10143, got ${chain.chainId}`);
  }

  const [deployer] = await ethers.getSigners();

  if (!deployer) {
    throw new Error("No deployer found. Check DEPLOYER_PRIVATE_KEY.");
  }

  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("Network:", network.name);
  console.log("Chain ID:", chain.chainId.toString());
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "MON");

  if (balance === 0n) {
    throw new Error("Wallet has no MON testnet funds.");
  }

  const Factory = await ethers.getContractFactory("RailMatteAgreementRegistry");
  const contract = await Factory.deploy();

  console.log("Transaction:", contract.deploymentTransaction().hash);

  await contract.waitForDeployment();

  console.log("Contract deployed at:", await contract.getAddress());
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
