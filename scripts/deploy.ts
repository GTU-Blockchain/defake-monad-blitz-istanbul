import { ethers } from "hardhat";

async function main() {
  const VoteFactory = await ethers.getContractFactory("VoteFactory");
  const voteFactory = await VoteFactory.deploy();
  await voteFactory.waitForDeployment();
  console.log("VoteFactory deployed at:", await voteFactory.getAddress());

  const AuctionFactory = await ethers.getContractFactory("AuctionFactory");
  const auctionFactory = await AuctionFactory.deploy();
  await auctionFactory.waitForDeployment();
  console.log("AuctionFactory deployed at:", await auctionFactory.getAddress());
}
main().catch(console.error);
