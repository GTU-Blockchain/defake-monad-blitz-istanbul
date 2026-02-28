// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./CommitRevealVote.sol";

contract VoteFactory {
    struct VoteInfo {
        address contractAddress;
        address creator;
        string title;
        uint256 createdAt;
    }

    VoteInfo[] public votes;

    event VoteCreated(uint256 indexed voteId, address contractAddress, address creator, string title);

    function createVote(
        string memory _title,
        string[] memory _proposalNames,
        uint256 _commitDuration,
        uint256 _revealDuration
    ) external returns (address) {
        CommitRevealVote newVote = new CommitRevealVote(_proposalNames, _commitDuration, _revealDuration);
        votes.push(VoteInfo(address(newVote), msg.sender, _title, block.timestamp));
        emit VoteCreated(votes.length - 1, address(newVote), msg.sender, _title);
        return address(newVote);
    }

    function getVotes() external view returns (VoteInfo[] memory) {
        return votes;
    }

    function getVoteCount() external view returns (uint256) {
        return votes.length;
    }
}
