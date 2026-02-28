// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CommitRevealVote {
    struct Proposal {
        string name;
        uint256 voteCount;
    }

    address public owner;
    uint256 public commitDeadline;
    uint256 public revealDeadline;
    Proposal[] public proposals;

    mapping(address => bytes32) public commits;
    mapping(address => bool)    public revealed;

    event Committed(address indexed voter);
    event Revealed(address indexed voter, uint256 proposalIndex);

    constructor(
        string[] memory _names,
        uint256 _commitDuration,
        uint256 _revealDuration
    ) {
        owner = msg.sender;
        commitDeadline = block.timestamp + _commitDuration;
        revealDeadline = commitDeadline + _revealDuration;
        for (uint i = 0; i < _names.length; i++) {
            proposals.push(Proposal(_names[i], 0));
        }
    }

    function commit(bytes32 _hash) external {
        require(block.timestamp < commitDeadline, "Commit phase ended");
        require(commits[msg.sender] == bytes32(0), "Already committed");
        commits[msg.sender] = _hash;
        emit Committed(msg.sender);
    }

    function reveal(uint256 _vote, bytes32 _nonce) external {
        require(block.timestamp >= commitDeadline, "Commit phase not over");
        require(block.timestamp < revealDeadline, "Reveal phase ended");
        require(!revealed[msg.sender], "Already revealed");
        require(_vote < proposals.length, "Invalid proposal index");
        bytes32 expected = keccak256(abi.encodePacked(_vote, _nonce, msg.sender));
        require(commits[msg.sender] == expected, "Hash mismatch");
        revealed[msg.sender] = true;
        proposals[_vote].voteCount++;
        emit Revealed(msg.sender, _vote);
    }

    function getWinner() external view returns (string memory winnerName, uint256 winnerVotes) {
        require(block.timestamp >= revealDeadline, "Voting not ended");
        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > winnerVotes) {
                winnerVotes = proposals[i].voteCount;
                winnerName = proposals[i].name;
            }
        }
    }

    function getProposals() external view returns (Proposal[] memory) {
        return proposals;
    }

    function timeLeft() external view returns (uint256 commitLeft, uint256 revealLeft) {
        commitLeft  = block.timestamp < commitDeadline ? commitDeadline - block.timestamp : 0;
        revealLeft  = block.timestamp < revealDeadline ? revealDeadline - block.timestamp : 0;
    }

    function currentPhase() external view returns (string memory) {
        if (block.timestamp < commitDeadline) return "COMMIT";
        if (block.timestamp < revealDeadline) return "REVEAL";
        return "ENDED";
    }
}
