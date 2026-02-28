export const FACTORY_ADDRESS = import.meta.env
  .VITE_FACTORY_ADDRESS as `0x${string}`;

export const FACTORY_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "voteId", type: "uint256" },
      { indexed: false, name: "contractAddress", type: "address" },
      { indexed: false, name: "creator", type: "address" },
      { indexed: false, name: "title", type: "string" },
    ],
    name: "VoteCreated",
    type: "event",
  },
  {
    inputs: [
      { name: "_title", type: "string" },
      { name: "_proposalNames", type: "string[]" },
      { name: "_commitDuration", type: "uint256" },
      { name: "_revealDuration", type: "uint256" },
    ],
    name: "createVote",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getVotes",
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
    name: "getVoteCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const ABI = [
  {
    inputs: [{ name: "_hash", type: "bytes32" }],
    name: "commit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_vote", type: "uint256" },
      { name: "_nonce", type: "bytes32" },
    ],
    name: "reveal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getProposals",
    outputs: [
      {
        components: [
          { name: "name", type: "string" },
          { name: "voteCount", type: "uint256" },
        ],
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getWinner",
    outputs: [
      { name: "winnerName", type: "string" },
      { name: "winnerVotes", type: "uint256" },
    ],
    stateMutability: "view",
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
    inputs: [{ name: "", type: "address" }],
    name: "commits",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "revealed",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
