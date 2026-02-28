import { ethers } from "hardhat";

async function main() {
  const proposals = ["Option A", "Option B", "Option C"];
  const commitDuration = 60 * 60 * 2; // 2 hours
  const revealDuration = 60 * 60 * 1; // 1 hour

  const Factory = await ethers.getContractFactory("CommitRevealVote");
  const contract = await Factory.deploy(
    proposals,
    commitDuration,
    revealDuration,
  );
  await contract.waitForDeployment();

  console.log("Deployed at:", await contract.getAddress());
}
main().catch(console.error);
