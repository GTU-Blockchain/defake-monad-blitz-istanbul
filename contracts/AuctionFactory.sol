// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./SealedBidAuction.sol";

contract AuctionFactory {
    struct AuctionInfo {
        address contractAddress;
        address creator;
        string title;
        uint256 createdAt;
    }

    AuctionInfo[] public auctions;

    event AuctionCreated(uint256 indexed auctionId, address contractAddress, address creator, string title);

    function createAuction(
        string memory _title,
        uint256 _commitDuration,
        uint256 _revealDuration
    ) external returns (address) {
        SealedBidAuction newAuction = new SealedBidAuction(_title, _commitDuration, _revealDuration);
        auctions.push(AuctionInfo(address(newAuction), msg.sender, _title, block.timestamp));
        emit AuctionCreated(auctions.length - 1, address(newAuction), msg.sender, _title);
        return address(newAuction);
    }

    function getAuctions() external view returns (AuctionInfo[] memory) {
        return auctions;
    }

    function getAuctionCount() external view returns (uint256) {
        return auctions.length;
    }
}
