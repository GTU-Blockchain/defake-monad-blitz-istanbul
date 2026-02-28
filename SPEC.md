# SPEC: Commit-Reveal Voting dApp on Monad

## Context
You are building a commit-reveal voting dApp on Monad Testnet (Chain ID: 10143) for a 6-hour hackathon. The app allows users to vote on proposals without revealing their choices until all votes are cast — preventing front-running and bandwagon effects.

---

## Stack

| Layer | Technology |
|---|---|
| Blockchain | Monad Testnet (`https://testnet-rpc.monad.xyz`, chainId: 10143) |
| Smart Contract | Solidity ^0.8.19 |
| Dev Tooling | Hardhat |
| Frontend | React + Vite + TypeScript |
| Web3 | viem + wagmi v2 |
| Wallet | RainbowKit |
| Styling | Tailwind CSS |

---

## Repository Structure

```
commit-reveal-vote/
├── contracts/
│   └── CommitRevealVote.sol
├── scripts/
│   └── deploy.ts
├── test/
│   └── CommitRevealVote.test.ts
├── frontend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── monad.ts          # chain config
│   │   │   └── contract.ts       # ABI + address
│   │   ├── hooks/
│   │   │   ├── useCommit.ts
│   │   │   ├── useReveal.ts
│   │   │   └── useVotingState.ts
│   │   ├── components/
│   │   │   ├── PhaseBanner.tsx
│   │   │   ├── CommitForm.tsx
│   │   │   ├── RevealForm.tsx
│   │   │   └── ResultsDisplay.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   └── vite.config.ts
├── hardhat.config.ts
├── package.json
└── .env
```

---

## Task 1 — Smart Contract

### File: `contracts/CommitRevealVote.sol`

Implement the following contract **exactly**:

```solidity
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
```

### Security Rules (MUST follow)
- Hash formula: `keccak256(abi.encodePacked(_vote, _nonce, msg.sender))` — `msg.sender` inclusion prevents replay attacks.
- Never allow double commit: check `commits[msg.sender] == bytes32(0)`.
- Never allow reveal before commit deadline.
- Never allow double reveal: check `revealed[msg.sender]`.

---

## Task 2 — Hardhat Configuration

### File: `hardhat.config.ts`

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    monadTestnet: {
      url: "https://testnet-rpc.monad.xyz",
      chainId: 10143,
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
};
export default config;
```

### File: `scripts/deploy.ts`

```typescript
import { ethers } from "hardhat";

async function main() {
  const proposals = ["Option A", "Option B", "Option C"];
  const commitDuration = 60 * 60 * 2;  // 2 hours
  const revealDuration = 60 * 60 * 1;  // 1 hour

  const Factory = await ethers.getContractFactory("CommitRevealVote");
  const contract = await Factory.deploy(proposals, commitDuration, revealDuration);
  await contract.waitForDeployment();

  console.log("Deployed at:", await contract.getAddress());
}
main().catch(console.error);
```

Run: `npx hardhat run scripts/deploy.ts --network monadTestnet`

---

## Task 3 — Chain Config

### File: `frontend/src/config/monad.ts`

```typescript
import { defineChain } from "viem";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz"] },
  },
  blockExplorers: {
    default: { name: "MonadExplorer", url: "https://testnet.monadexplorer.com" },
  },
});
```

### File: `frontend/src/config/contract.ts`

```typescript
export const CONTRACT_ADDRESS = "0xYOUR_DEPLOYED_ADDRESS" as `0x${string}`;

export const ABI = [
  {
    "inputs": [{ "name": "_hash", "type": "bytes32" }],
    "name": "commit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "_vote", "type": "uint256" },
      { "name": "_nonce", "type": "bytes32" }
    ],
    "name": "reveal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getProposals",
    "outputs": [{ "components": [{ "name": "name", "type": "string" }, { "name": "voteCount", "type": "uint256" }], "type": "tuple[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getWinner",
    "outputs": [{ "name": "winnerName", "type": "string" }, { "name": "winnerVotes", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentPhase",
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "timeLeft",
    "outputs": [{ "name": "commitLeft", "type": "uint256" }, { "name": "revealLeft", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "", "type": "address" }],
    "name": "commits",
    "outputs": [{ "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "", "type": "address" }],
    "name": "revealed",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
```

---

## Task 4 — Core Hooks

### File: `frontend/src/hooks/useCommit.ts`

```typescript
import { keccak256, encodePacked, toHex } from "viem";
import { useWriteContract } from "wagmi";
import { ABI, CONTRACT_ADDRESS } from "../config/contract";

const STORAGE_KEY = "commit_reveal_secret";

export function useCommit() {
  const { writeContractAsync, isPending } = useWriteContract();

  const submitCommit = async (voteIndex: number, voterAddress: `0x${string}`) => {
    const rawNonce = crypto.getRandomValues(new Uint8Array(32));
    const nonce = toHex(rawNonce) as `0x${string}`;

    const hash = keccak256(
      encodePacked(
        ["uint256", "bytes32", "address"],
        [BigInt(voteIndex), nonce, voterAddress]
      )
    );

    // Persist secret — user MUST keep this to reveal
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ voteIndex, nonce, hash }));

    return writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: "commit",
      args: [hash],
    });
  };

  const getStoredSecret = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as { voteIndex: number; nonce: `0x${string}`; hash: `0x${string}` } : null;
  };

  return { submitCommit, getStoredSecret, isPending };
}
```

### File: `frontend/src/hooks/useReveal.ts`

```typescript
import { useWriteContract } from "wagmi";
import { ABI, CONTRACT_ADDRESS } from "../config/contract";

export function useReveal() {
  const { writeContractAsync, isPending } = useWriteContract();

  const submitReveal = async (voteIndex: number, nonce: `0x${string}`) => {
    return writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: "reveal",
      args: [BigInt(voteIndex), nonce],
    });
  };

  return { submitReveal, isPending };
}
```

### File: `frontend/src/hooks/useVotingState.ts`

```typescript
import { useReadContracts } from "wagmi";
import { ABI, CONTRACT_ADDRESS } from "../config/contract";

export function useVotingState() {
  const { data, refetch } = useReadContracts({
    contracts: [
      { address: CONTRACT_ADDRESS, abi: ABI, functionName: "currentPhase" },
      { address: CONTRACT_ADDRESS, abi: ABI, functionName: "timeLeft" },
      { address: CONTRACT_ADDRESS, abi: ABI, functionName: "getProposals" },
    ],
    query: { refetchInterval: 5000 },
  });

  const phase    = (data?.[0]?.result as string) ?? "COMMIT";
  const timeLeft = data?.[1]?.result as [bigint, bigint] | undefined;
  const proposals = data?.[2]?.result as { name: string; voteCount: bigint }[] | undefined;

  return { phase, timeLeft, proposals, refetch };
}
```

---

## Task 5 — UI Components

### Component: `PhaseBanner`
- Show current phase: COMMIT / REVEAL / ENDED
- Show countdown timer (seconds) from `timeLeft`
- Color coding: COMMIT = orange, REVEAL = green, ENDED = purple

### Component: `CommitForm`
- Only visible when `phase === "COMMIT"`
- Render proposal options as radio buttons
- On submit: call `useCommit().submitCommit(selectedIndex, address)`
- After success: show "Secret saved to browser. Don't clear your browser data!" warning
- Disable if user already committed (`commits[address] !== bytes32(0)`)

### Component: `RevealForm`
- Only visible when `phase === "REVEAL"`
- Read stored secret from `useCommit().getStoredSecret()`
- If no secret found: show "No commit found in this browser" error
- On submit: call `useReveal().submitReveal(voteIndex, nonce)`
- Disable if user already revealed

### Component: `ResultsDisplay`
- Always visible (shows live counts in REVEAL, final results in ENDED)
- Map proposals to bar chart (width proportional to vote count)
- In ENDED phase: highlight winner with crown icon

---

## Task 6 — App Entry Point

### File: `frontend/src/main.tsx`

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { monadTestnet } from "./config/monad";
import App from "./App";
import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";

const wagmiConfig = createConfig({
  chains: [monadTestnet],
  transports: { [monadTestnet.id]: http() },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
```

---

## Environment Variables

### File: `.env`
```
PRIVATE_KEY=your_deployer_private_key_here
VITE_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_ADDRESS
```

---

## Constraints & Rules

1. **Never** change the hash formula. It must be `keccak256(abi.encodePacked(_vote, _nonce, msg.sender))`.
2. **Never** allow state-changing functions to be called out of phase order.
3. **Always** store the commit secret in `localStorage` immediately after commit TX confirms, before showing success UI.
4. **Never** fetch proposals inside a loop — always use `getProposals()` in a single call.
5. **Always** use `useReadContracts` (batched) instead of multiple `useReadContract` calls.
6. Contract address must be configurable via env var `VITE_CONTRACT_ADDRESS`.
7. The frontend must be functional without backend — pure on-chain state.
8. After deploy, print the contract address and paste it into `frontend/src/config/contract.ts` and `.env`.

---

## Definition of Done

- [ ] Contract compiles with `npx hardhat compile`
- [ ] All tests pass with `npx hardhat test`
- [ ] Contract deployed on Monad Testnet and address is confirmed in explorer
- [ ] Frontend connects to wallet on Monad Testnet
- [ ] Commit TX submits successfully and secret is stored in localStorage
- [ ] Reveal TX succeeds with correct nonce and vote index
- [ ] Phase transitions correctly (COMMIT → REVEAL → ENDED)
- [ ] Results display correctly after reveal phase ends
