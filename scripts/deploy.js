import { network } from "hardhat";

async function main() {

  const { ethers } = await network.connect();

  const [deployer] = await ethers.getSigners();

  const LandRegistry = await ethers.getContractFactory("LandRegistry", deployer);
  const landRegistry = await LandRegistry.deploy();
  await landRegistry.waitForDeployment();

  console.log("LandRegistry deployed to:", await landRegistry.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
