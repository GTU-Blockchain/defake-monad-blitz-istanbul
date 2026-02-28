import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("CommitRevealVote", function () {
  async function deployFixture() {
    const proposals = ["Option A", "Option B", "Option C"];
    const commitDuration = 3600; // 1 hr
    const revealDuration = 3600; // 1 hr

    const [owner, voter1, voter2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("CommitRevealVote");
    const vote = await Factory.deploy(
      proposals,
      commitDuration,
      revealDuration,
    );

    return {
      vote,
      proposals,
      commitDuration,
      revealDuration,
      owner,
      voter1,
      voter2,
    };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { vote, owner } = await deployFixture();
      expect(await vote.owner()).to.equal(owner.address);
    });

    it("Should initialize proper phases", async function () {
      const { vote } = await deployFixture();
      expect(await vote.currentPhase()).to.equal("COMMIT");
    });
  });

  describe("End-to-end Voting", function () {
    it("Should allow commit, reveal, and get winner", async function () {
      const { vote, voter1, voter2 } = await deployFixture();

      // Commit Phase
      const nonce1 = ethers.hexlify(ethers.randomBytes(32));
      const hash1 = ethers.solidityPackedKeccak256(
        ["uint256", "bytes32", "address"],
        [0, nonce1, voter1.address],
      );
      await vote.connect(voter1).commit(hash1);

      const nonce2 = ethers.hexlify(ethers.randomBytes(32));
      const hash2 = ethers.solidityPackedKeccak256(
        ["uint256", "bytes32", "address"],
        [0, nonce2, voter2.address],
      );
      await vote.connect(voter2).commit(hash2);

      // Fast forward to Reveal Phase
      await time.increase(3600);

      // Reveal Phase
      await vote.connect(voter1).reveal(0, nonce1);
      await vote.connect(voter2).reveal(0, nonce2);

      // Fast forward to Ended Phase
      await time.increase(3600);

      const [winnerName, winnerVotes] = await vote.getWinner();
      expect(winnerName).to.equal("Option A");
      expect(winnerVotes).to.equal(2);
    });

    it("Should revert if double commit", async function () {
      const { vote, voter1 } = await deployFixture();
      const nonce1 = ethers.hexlify(ethers.randomBytes(32));
      const hash1 = ethers.solidityPackedKeccak256(
        ["uint256", "bytes32", "address"],
        [0, nonce1, voter1.address],
      );
      await vote.connect(voter1).commit(hash1);
      await expect(vote.connect(voter1).commit(hash1)).to.be.revertedWith(
        "Already committed",
      );
    });
  });
});
