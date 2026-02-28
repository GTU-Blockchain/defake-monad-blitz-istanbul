import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("SealedBidAuction", function () {
  const COMMIT_DURATION = 3600;
  const REVEAL_DURATION = 3600;
  const TITLE = "Test Auction";

  async function deployFixture() {
    const [owner, bidder1, bidder2, bidder3] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("SealedBidAuction");
    const auction = await Factory.deploy(TITLE, COMMIT_DURATION, REVEAL_DURATION);
    return { auction, owner, bidder1, bidder2, bidder3 };
  }

  function makeCommit(amount: bigint, nonce: string, address: string) {
    return ethers.solidityPackedKeccak256(
      ["uint256", "bytes32", "address"],
      [amount, nonce, address],
    );
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { auction, owner } = await deployFixture();
      expect(await auction.owner()).to.equal(owner.address);
    });

    it("Should set the title", async function () {
      const { auction } = await deployFixture();
      expect(await auction.title()).to.equal(TITLE);
    });

    it("Should start in COMMIT phase", async function () {
      const { auction } = await deployFixture();
      expect(await auction.currentPhase()).to.equal("COMMIT");
    });
  });

  describe("Commit", function () {
    it("Should accept a bid with deposit", async function () {
      const { auction, bidder1 } = await deployFixture();
      const nonce = ethers.hexlify(ethers.randomBytes(32));
      const amount = ethers.parseEther("1");
      const hash = makeCommit(amount, nonce, bidder1.address);

      await expect(
        auction.connect(bidder1).commitBid(hash, { value: ethers.parseEther("2") }),
      ).to.emit(auction, "BidCommitted");

      expect(await auction.bidderCount()).to.equal(1);
    });

    it("Should reject zero deposit", async function () {
      const { auction, bidder1 } = await deployFixture();
      const nonce = ethers.hexlify(ethers.randomBytes(32));
      const hash = makeCommit(ethers.parseEther("1"), nonce, bidder1.address);

      await expect(
        auction.connect(bidder1).commitBid(hash, { value: 0 }),
      ).to.be.revertedWith("Deposit required");
    });

    it("Should reject double commit", async function () {
      const { auction, bidder1 } = await deployFixture();
      const nonce = ethers.hexlify(ethers.randomBytes(32));
      const hash = makeCommit(ethers.parseEther("1"), nonce, bidder1.address);

      await auction.connect(bidder1).commitBid(hash, { value: ethers.parseEther("2") });
      await expect(
        auction.connect(bidder1).commitBid(hash, { value: ethers.parseEther("2") }),
      ).to.be.revertedWith("Already committed");
    });
  });

  describe("Reveal", function () {
    it("Should verify hash and accept reveal", async function () {
      const { auction, bidder1 } = await deployFixture();
      const nonce = ethers.hexlify(ethers.randomBytes(32));
      const amount = ethers.parseEther("1");
      const hash = makeCommit(amount, nonce, bidder1.address);

      await auction.connect(bidder1).commitBid(hash, { value: ethers.parseEther("2") });
      await time.increase(COMMIT_DURATION);

      await expect(
        auction.connect(bidder1).revealBid(amount, nonce),
      ).to.emit(auction, "BidRevealed");
    });

    it("Should reject if amount exceeds deposit", async function () {
      const { auction, bidder1 } = await deployFixture();
      const nonce = ethers.hexlify(ethers.randomBytes(32));
      const amount = ethers.parseEther("3");
      const hash = makeCommit(amount, nonce, bidder1.address);

      await auction.connect(bidder1).commitBid(hash, { value: ethers.parseEther("2") });
      await time.increase(COMMIT_DURATION);

      await expect(
        auction.connect(bidder1).revealBid(amount, nonce),
      ).to.be.revertedWith("Amount exceeds deposit");
    });

    it("Should refund excess deposit on reveal", async function () {
      const { auction, bidder1 } = await deployFixture();
      const nonce = ethers.hexlify(ethers.randomBytes(32));
      const amount = ethers.parseEther("1");
      const deposit = ethers.parseEther("3");
      const hash = makeCommit(amount, nonce, bidder1.address);

      await auction.connect(bidder1).commitBid(hash, { value: deposit });
      await time.increase(COMMIT_DURATION);

      const balBefore = await ethers.provider.getBalance(bidder1.address);
      const tx = await auction.connect(bidder1).revealBid(amount, nonce);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balAfter = await ethers.provider.getBalance(bidder1.address);

      // Should receive back 2 ETH (3 deposit - 1 bid)
      const refund = balAfter - balBefore + gasUsed;
      expect(refund).to.equal(ethers.parseEther("2"));
    });

    it("Should track highest bid", async function () {
      const { auction, bidder1, bidder2 } = await deployFixture();
      const nonce1 = ethers.hexlify(ethers.randomBytes(32));
      const nonce2 = ethers.hexlify(ethers.randomBytes(32));
      const amount1 = ethers.parseEther("1");
      const amount2 = ethers.parseEther("2");

      await auction.connect(bidder1).commitBid(
        makeCommit(amount1, nonce1, bidder1.address),
        { value: ethers.parseEther("3") },
      );
      await auction.connect(bidder2).commitBid(
        makeCommit(amount2, nonce2, bidder2.address),
        { value: ethers.parseEther("3") },
      );

      await time.increase(COMMIT_DURATION);

      await auction.connect(bidder1).revealBid(amount1, nonce1);
      await auction.connect(bidder2).revealBid(amount2, nonce2);

      expect(await auction.highestBid()).to.equal(amount2);
      expect(await auction.highestBidder()).to.equal(bidder2.address);
    });

    it("Should reject hash mismatch", async function () {
      const { auction, bidder1 } = await deployFixture();
      const nonce = ethers.hexlify(ethers.randomBytes(32));
      const hash = makeCommit(ethers.parseEther("1"), nonce, bidder1.address);

      await auction.connect(bidder1).commitBid(hash, { value: ethers.parseEther("2") });
      await time.increase(COMMIT_DURATION);

      await expect(
        auction.connect(bidder1).revealBid(ethers.parseEther("0.5"), nonce),
      ).to.be.revertedWith("Hash mismatch");
    });
  });

  describe("E2E: 3 bidders", function () {
    it("Should handle full auction lifecycle", async function () {
      const { auction, owner, bidder1, bidder2, bidder3 } = await deployFixture();

      // --- COMMIT ---
      const nonce1 = ethers.hexlify(ethers.randomBytes(32));
      const nonce2 = ethers.hexlify(ethers.randomBytes(32));
      const nonce3 = ethers.hexlify(ethers.randomBytes(32));

      const amt1 = ethers.parseEther("1");
      const amt2 = ethers.parseEther("3"); // winner
      const amt3 = ethers.parseEther("2");

      await auction.connect(bidder1).commitBid(
        makeCommit(amt1, nonce1, bidder1.address),
        { value: ethers.parseEther("5") },
      );
      await auction.connect(bidder2).commitBid(
        makeCommit(amt2, nonce2, bidder2.address),
        { value: ethers.parseEther("5") },
      );
      await auction.connect(bidder3).commitBid(
        makeCommit(amt3, nonce3, bidder3.address),
        { value: ethers.parseEther("5") },
      );

      expect(await auction.bidderCount()).to.equal(3);

      // --- REVEAL ---
      await time.increase(COMMIT_DURATION);
      expect(await auction.currentPhase()).to.equal("REVEAL");

      await auction.connect(bidder1).revealBid(amt1, nonce1);
      await auction.connect(bidder2).revealBid(amt2, nonce2);
      await auction.connect(bidder3).revealBid(amt3, nonce3);

      expect(await auction.highestBidder()).to.equal(bidder2.address);
      expect(await auction.highestBid()).to.equal(amt2);

      // --- ENDED ---
      await time.increase(REVEAL_DURATION);
      expect(await auction.currentPhase()).to.equal("ENDED");

      // Losers withdraw
      await expect(auction.connect(bidder1).withdraw()).to.emit(auction, "Withdrawn");
      await expect(auction.connect(bidder3).withdraw()).to.emit(auction, "Withdrawn");

      // Winner cannot withdraw
      await expect(auction.connect(bidder2).withdraw()).to.be.revertedWith("Winner cannot withdraw");

      // Owner withdraws winnings
      const ownerBalBefore = await ethers.provider.getBalance(owner.address);
      const tx = await auction.connect(owner).withdrawWinnings();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const ownerBalAfter = await ethers.provider.getBalance(owner.address);

      expect(ownerBalAfter - ownerBalBefore + gasUsed).to.equal(amt2);
    });
  });

  describe("AuctionFactory", function () {
    it("Should create auctions and emit events", async function () {
      const [deployer] = await ethers.getSigners();
      const Factory = await ethers.getContractFactory("AuctionFactory");
      const factory = await Factory.deploy();

      await expect(
        factory.createAuction("Auction 1", 3600, 3600),
      ).to.emit(factory, "AuctionCreated");

      await factory.createAuction("Auction 2", 7200, 3600);

      const auctions = await factory.getAuctions();
      expect(auctions.length).to.equal(2);
      expect(auctions[0].title).to.equal("Auction 1");
      expect(auctions[0].creator).to.equal(deployer.address);
      expect(await factory.getAuctionCount()).to.equal(2);
    });

    it("Should deploy working auction via factory", async function () {
      const [deployer, bidder1] = await ethers.getSigners();
      const Factory = await ethers.getContractFactory("AuctionFactory");
      const factory = await Factory.deploy();

      const tx = await factory.createAuction("Factory Auction", 3600, 3600);
      const receipt = await tx.wait();

      const auctions = await factory.getAuctions();
      const auctionAddr = auctions[0].contractAddress;

      const auction = await ethers.getContractAt("SealedBidAuction", auctionAddr);
      expect(await auction.title()).to.equal("Factory Auction");
      expect(await auction.currentPhase()).to.equal("COMMIT");

      // Bid via factory-created auction
      const nonce = ethers.hexlify(ethers.randomBytes(32));
      const amount = ethers.parseEther("1");
      const hash = ethers.solidityPackedKeccak256(
        ["uint256", "bytes32", "address"],
        [amount, nonce, bidder1.address],
      );

      await auction.connect(bidder1).commitBid(hash, { value: ethers.parseEther("2") });
      expect(await auction.bidderCount()).to.equal(1);
    });
  });
});
