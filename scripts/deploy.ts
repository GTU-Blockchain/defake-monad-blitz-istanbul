import { ethers } from "hardhat";

async function main() {
  const Factory = await ethers.getContractFactory("VoteFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();

  console.log("VoteFactory deployed at:", await factory.getAddress());
}
main().catch(console.error);
