import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("VoteFactory", function () {
  async function deployFactoryFixture() {
    const [owner, voter1, voter2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("VoteFactory");
    const factory = await Factory.deploy();
    return { factory, owner, voter1, voter2 };
  }

  describe("Vote Creation", function () {
    it("Should create a new vote and store it", async function () {
      const { factory, owner } = await deployFactoryFixture();

      const tx = await factory.createVote(
        "Test Vote",
        ["Option A", "Option B"],
        3600,
        3600,
      );
      await tx.wait();

      expect(await factory.getVoteCount()).to.equal(1);

      const votes = await factory.getVotes();
      expect(votes[0].creator).to.equal(owner.address);
      expect(votes[0].title).to.equal("Test Vote");
      expect(votes[0].contractAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("Should emit VoteCreated event", async function () {
      const { factory, owner } = await deployFactoryFixture();

      await expect(
        factory.createVote("Event Test", ["A", "B"], 3600, 3600),
      )
        .to.emit(factory, "VoteCreated")
        .withArgs(0, (addr: string) => addr !== ethers.ZeroAddress, owner.address, "Event Test");
    });

    it("Should create multiple votes", async function () {
      const { factory } = await deployFactoryFixture();

      await factory.createVote("Vote 1", ["A", "B"], 3600, 3600);
      await factory.createVote("Vote 2", ["X", "Y", "Z"], 7200, 3600);

      expect(await factory.getVoteCount()).to.equal(2);

      const votes = await factory.getVotes();
      expect(votes[0].title).to.equal("Vote 1");
      expect(votes[1].title).to.equal("Vote 2");
    });
  });

  describe("End-to-end via Factory", function () {
    it("Should allow commit-reveal flow on factory-created vote", async function () {
      const { factory, voter1, voter2 } = await deployFactoryFixture();

      const tx = await factory.createVote(
        "E2E Test",
        ["Option A", "Option B"],
        3600,
        3600,
      );
      const receipt = await tx.wait();

      const votes = await factory.getVotes();
      const voteAddress = votes[0].contractAddress;

      const Vote = await ethers.getContractFactory("CommitRevealVote");
      const vote = Vote.attach(voteAddress);

      // Commit Phase
      expect(await vote.currentPhase()).to.equal("COMMIT");

      const nonce1 = ethers.hexlify(ethers.randomBytes(32));
      const hash1 = ethers.solidityPackedKeccak256(
        ["uint256", "bytes32", "address"],
        [0, nonce1, voter1.address],
      );
      await vote.connect(voter1).commit(hash1);

      const nonce2 = ethers.hexlify(ethers.randomBytes(32));
      const hash2 = ethers.solidityPackedKeccak256(
        ["uint256", "bytes32", "address"],
        [1, nonce2, voter2.address],
      );
      await vote.connect(voter2).commit(hash2);

      // Fast forward to Reveal Phase
      await time.increase(3600);
      expect(await vote.currentPhase()).to.equal("REVEAL");

      await vote.connect(voter1).reveal(0, nonce1);
      await vote.connect(voter2).reveal(1, nonce2);

      // Fast forward to Ended Phase
      await time.increase(3600);
      expect(await vote.currentPhase()).to.equal("ENDED");

      const proposals = await vote.getProposals();
      expect(proposals[0].voteCount).to.equal(1);
      expect(proposals[1].voteCount).to.equal(1);
    });
  });
});
