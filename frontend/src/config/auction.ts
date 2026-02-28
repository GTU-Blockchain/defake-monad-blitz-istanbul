export const AUCTION_FACTORY_ADDRESS = import.meta.env
  .VITE_AUCTION_FACTORY_ADDRESS as `0x${string}`;

export const AUCTION_FACTORY_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "auctionId", type: "uint256" },
      { indexed: false, name: "contractAddress", type: "address" },
      { indexed: false, name: "creator", type: "address" },
      { indexed: false, name: "title", type: "string" },
    ],
    name: "AuctionCreated",
    type: "event",
  },
  {
    inputs: [
      { name: "_title", type: "string" },
      { name: "_commitDuration", type: "uint256" },
      { name: "_revealDuration", type: "uint256" },
    ],
    name: "createAuction",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAuctions",
    outputs: [
      {
        components: [
          { name: "contractAddress", type: "address" },
          { name: "creator", type: "address" },
          { name: "title", type: "string" },
          { name: "createdAt", type: "uint256" },
        ],
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAuctionCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const AUCTION_ABI = [
  {
    inputs: [{ name: "_hash", type: "bytes32" }],
    name: "commitBid",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { name: "_amount", type: "uint256" },
      { name: "_nonce", type: "bytes32" },
    ],
    name: "revealBid",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawWinnings",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "currentPhase",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "timeLeft",
    outputs: [
      { name: "commitLeft", type: "uint256" },
      { name: "revealLeft", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "highestBid",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "highestBidder",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getBidderCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "title",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "bidders",
    outputs: [
      { name: "commitHash", type: "bytes32" },
      { name: "deposit", type: "uint256" },
      { name: "revealedAmount", type: "uint256" },
      { name: "revealed", type: "bool" },
      { name: "withdrawn", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
