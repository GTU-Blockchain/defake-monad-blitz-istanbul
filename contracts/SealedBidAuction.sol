// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SealedBidAuction {
    enum Phase { COMMIT, REVEAL, ENDED }

    struct Bidder {
        bytes32 commitHash;
        uint256 deposit;
        uint256 revealedAmount;
        bool revealed;
        bool withdrawn;
    }

    address public owner;
    string public title;
    uint256 public commitDeadline;
    uint256 public revealDeadline;

    address public highestBidder;
    uint256 public highestBid;
    uint256 public bidderCount;

    mapping(address => Bidder) public bidders;

    event BidCommitted(address indexed bidder, uint256 deposit);
    event BidRevealed(address indexed bidder, uint256 amount);
    event Withdrawn(address indexed bidder, uint256 amount);
    event WinningsWithdrawn(address indexed owner, uint256 amount);

    constructor(
        string memory _title,
        uint256 _commitDuration,
        uint256 _revealDuration
    ) {
        owner = msg.sender;
        title = _title;
        commitDeadline = block.timestamp + _commitDuration;
        revealDeadline = commitDeadline + _revealDuration;
    }

    function commitBid(bytes32 _hash) external payable {
        require(block.timestamp < commitDeadline, "Commit phase ended");
        require(bidders[msg.sender].commitHash == bytes32(0), "Already committed");
        require(msg.value > 0, "Deposit required");

        bidders[msg.sender] = Bidder({
            commitHash: _hash,
            deposit: msg.value,
            revealedAmount: 0,
            revealed: false,
            withdrawn: false
        });
        bidderCount++;

        emit BidCommitted(msg.sender, msg.value);
    }

    function revealBid(uint256 _amount, bytes32 _nonce) external {
        require(block.timestamp >= commitDeadline, "Commit phase not over");
        require(block.timestamp < revealDeadline, "Reveal phase ended");

        Bidder storage bidder = bidders[msg.sender];
        require(bidder.commitHash != bytes32(0), "No commit found");
        require(!bidder.revealed, "Already revealed");

        bytes32 expected = keccak256(abi.encodePacked(_amount, _nonce, msg.sender));
        require(bidder.commitHash == expected, "Hash mismatch");
        require(_amount <= bidder.deposit, "Amount exceeds deposit");

        bidder.revealed = true;
        bidder.revealedAmount = _amount;

        // Refund excess deposit immediately
        uint256 excess = bidder.deposit - _amount;
        if (excess > 0) {
            bidder.deposit = _amount;
            (bool sent, ) = payable(msg.sender).call{value: excess}("");
            require(sent, "Refund failed");
        }

        // Track highest bid
        if (_amount > highestBid) {
            highestBid = _amount;
            highestBidder = msg.sender;
        }

        emit BidRevealed(msg.sender, _amount);
    }

    function withdraw() external {
        require(block.timestamp >= revealDeadline, "Auction not ended");

        Bidder storage bidder = bidders[msg.sender];
        require(bidder.revealed, "Did not reveal");
        require(!bidder.withdrawn, "Already withdrawn");
        require(msg.sender != highestBidder, "Winner cannot withdraw");

        bidder.withdrawn = true;
        uint256 amount = bidder.deposit;
        bidder.deposit = 0;

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Withdraw failed");

        emit Withdrawn(msg.sender, amount);
    }

    function withdrawWinnings() external {
        require(block.timestamp >= revealDeadline, "Auction not ended");
        require(msg.sender == owner, "Only owner");
        require(highestBid > 0, "No bids revealed");

        uint256 amount = highestBid;
        highestBid = 0;

        (bool sent, ) = payable(owner).call{value: amount}("");
        require(sent, "Withdraw failed");

        emit WinningsWithdrawn(owner, amount);
    }

    function currentPhase() external view returns (string memory) {
        if (block.timestamp < commitDeadline) return "COMMIT";
        if (block.timestamp < revealDeadline) return "REVEAL";
        return "ENDED";
    }

    function timeLeft() external view returns (uint256 commitLeft, uint256 revealLeft) {
        commitLeft = block.timestamp < commitDeadline ? commitDeadline - block.timestamp : 0;
        revealLeft = block.timestamp < revealDeadline ? revealDeadline - block.timestamp : 0;
    }

    function getAuctionInfo() external view returns (
        string memory _title,
        address _owner,
        address _highestBidder,
        uint256 _highestBid,
        uint256 _bidderCount,
        uint256 _commitDeadline,
        uint256 _revealDeadline
    ) {
        return (title, owner, highestBidder, highestBid, bidderCount, commitDeadline, revealDeadline);
    }

    function getBidderCount() external view returns (uint256) {
        return bidderCount;
    }
}
