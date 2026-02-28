<div align="center">
  <img src="frontend/public/logo.svg" alt="Obscura" width="80" />
  <h1>Obscura</h1>
  <p><strong>Privacy-first voting & sealed-bid auctions on Monad</strong></p>

  <p>
    <a href="#features">Features</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#smart-contracts">Smart Contracts</a> •
    <a href="#frontend">Frontend</a> •
    <a href="#deployment">Deployment</a>
  </p>
</div>

---

## Overview

Obscura is a privacy-preserving dApp built on **Monad Testnet** that implements the **commit-reveal** cryptographic protocol for two use cases:

1. **Anonymous Voting** — Cast votes without revealing your choice until the reveal phase begins
2. **Sealed-Bid Auctions** — Submit encrypted bids that stay hidden until all bids are locked in

By leveraging Monad's **500ms block time** and **parallel EVM execution**, Obscura handles the high transaction throughput of the reveal phase without congestion.

> Built at **Monad Blitz Istanbul 2025** hackathon. See [PRD.md](PRD.md) for the full product requirements and [SPEC.md](SPEC.md) for the technical specification.

---

## Features

### 🗳️ Commit-Reveal Voting
- **Front-running resistant** — Votes are encrypted with `keccak256(vote || nonce || sender)` during commit phase
- **Double-vote protection** — Each address can only commit and reveal once
- **Factory pattern** — Anyone can create new votes via `VoteFactory`
- **Automatic phase transitions** — COMMIT → REVEAL → ENDED with configurable durations
- **Live countdown timers** — Real-time phase tracking with instant UI transitions

### 🔨 Sealed-Bid Auctions
- **Hidden bids** — Bid amounts are encrypted until reveal phase
- **Deposit-based commitment** — Bidders send MON as deposit with their commit
- **Excess refund on reveal** — Overpaid deposits are refunded immediately
- **Owner restrictions** — Auction creators cannot bid on their own auctions
- **Winner/loser separation** — Losers withdraw deposits; owner collects winning bid

### 🎨 UI/UX
- **Cyberpunk minimalist** dark theme with glassmorphism
- **Orbitron** font for brand identity
- **Custom RainbowKit** wallet modal matching the app theme
- **Responsive design** with smooth animations and transitions

---

## Architecture

```
COMMIT PHASE                      REVEAL PHASE                 ENDED
┌─────────────┐                  ┌──────────────┐          ┌──────────────┐
│ User picks  │  keccak256(...)  │ User submits │  verify  │ Results are  │
│ vote/bid    │ ───────────────► │ stored nonce │ ───────► │ tallied and  │
│ + random    │  commit(hash)    │ + original   │  reveal  │ winner shown │
│   nonce     │                  │   value      │          │              │
└─────────────┘                  └──────────────┘          └──────────────┘
     │                                                            │
     └── Secret saved to localStorage ────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|---|---|
| Blockchain | [Monad Testnet](https://testnet-rpc.monad.xyz) (Chain ID: 10143) |
| Smart Contracts | Solidity ^0.8.19 |
| Dev Tooling | Hardhat |
| Frontend | React + Vite + TypeScript |
| Web3 | viem + wagmi v2 |
| Wallet | RainbowKit (custom themed) |
| Styling | Tailwind CSS |

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- A wallet with Monad Testnet MON ([faucet](https://faucet.monad.xyz))

### Installation

```bash
# Clone the repository
git clone https://github.com/GTU-Blockchain/defake-monad-blitz-istanbul.git
cd defake-monad-blitz-istanbul

# Install root dependencies (Hardhat, contracts)
npm install

# Install frontend dependencies
cd frontend && npm install
```

### Environment Setup

Create a `.env` file in the project root:

```env
PRIVATE_KEY=your_deployer_private_key
VITE_FACTORY_ADDRESS=0x85cfECBA55b7a22Cc229e6ea5A19906883BB6b12
VITE_AUCTION_FACTORY_ADDRESS=0xc5BDaCfC39EC01e006F60c424b1160028632134F
```

### Run Development Server

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Smart Contracts

### Contract Overview

| Contract | Purpose | Source |
|---|---|---|
| `CommitRevealVote` | Individual voting instance with commit-reveal phases | [`contracts/CommitRevealVote.sol`](contracts/CommitRevealVote.sol) |
| `VoteFactory` | Factory that deploys new voting instances | [`contracts/VoteFactory.sol`](contracts/VoteFactory.sol) |
| `SealedBidAuction` | Individual auction with commit-reveal bidding | [`contracts/SealedBidAuction.sol`](contracts/SealedBidAuction.sol) |
| `AuctionFactory` | Factory that deploys new auction instances | [`contracts/AuctionFactory.sol`](contracts/AuctionFactory.sol) |

### Deployed Addresses (Monad Testnet)

| Contract | Address |
|---|---|
| VoteFactory | `0x85cfECBA55b7a22Cc229e6ea5A19906883BB6b12` |
| AuctionFactory | `0xc5BDaCfC39EC01e006F60c424b1160028632134F` |

### Commit-Reveal Protocol

The core security mechanism used by both voting and auctions:

```
# Commit Phase
nonce    = crypto.getRandomValues(32 bytes)
hash     = keccak256(abi.encodePacked(value, nonce, msg.sender))
TX       → contract.commit(hash)  // + payable deposit for auctions
Storage  → localStorage: { value, nonce }

# Reveal Phase
secret   = localStorage.getItem(key)
TX       → contract.reveal(secret.value, secret.nonce)
Contract → verify: keccak256(value, nonce, msg.sender) == stored hash
```

Including `msg.sender` in the hash prevents replay attacks — a valid commit from one address cannot be replayed by another.

### Auction-Specific Logic

| Function | Who Can Call | When |
|---|---|---|
| `commitBid(hash)` | Any address except owner | COMMIT phase |
| `revealBid(amount, nonce)` | Committed bidders | REVEAL phase |
| `withdraw()` | Losing bidders (revealed) | ENDED phase |
| `withdrawWinnings()` | Auction owner only | ENDED phase |

---

## Frontend

### Project Structure

```
frontend/src/
├── config/
│   ├── monad.ts              # Monad Testnet chain definition
│   ├── contract.ts           # Vote contract ABI & factory address
│   └── auction.ts            # Auction contract ABI & factory address
├── hooks/
│   ├── useVotingState.ts     # Vote phase, proposals, countdown
│   ├── useCommit.ts          # Vote commit with localStorage
│   ├── useReveal.ts          # Vote reveal
│   ├── useFactory.ts         # Vote factory: create & list
│   ├── useAuctionState.ts    # Auction phase, bids, countdown
│   ├── useAuctionCommit.ts   # Auction bid commit
│   ├── useAuctionReveal.ts   # Auction bid reveal
│   └── useAuctionFactory.ts  # Auction factory: create & list
├── components/
│   ├── PhaseBanner.tsx        # Vote phase indicator + countdown
│   ├── CommitForm.tsx         # Vote commit UI
│   ├── RevealForm.tsx         # Vote reveal UI
│   ├── ResultsDisplay.tsx     # Vote results with bar chart
│   ├── CreateVoteForm.tsx     # New vote creation form
│   ├── VoteList.tsx           # All votes with filter
│   ├── AuctionPhaseBanner.tsx # Auction phase indicator
│   ├── AuctionCommitForm.tsx  # Bid commit with deposit
│   ├── AuctionRevealForm.tsx  # Bid reveal + loser withdraw
│   ├── AuctionResultsDisplay.tsx # Highest bid display
│   ├── CreateAuctionForm.tsx  # New auction creation
│   ├── AuctionList.tsx        # All auctions with filter
│   ├── AuctionDetailPage.tsx  # Auction detail route + owner panel
│   └── CustomConnectButton.tsx # Themed wallet connect button
├── App.tsx                    # Routes, tabs, homepage layout
└── main.tsx                   # Providers, RainbowKit theme config
```

### Key Design Decisions

- **localStorage for secrets** — Commit nonces are stored client-side. Clearing browser data before reveal = lost vote/bid. Users are warned about this.
- **Eager phase transitions** — When countdown hits zero, UI transitions immediately without waiting for the next blockchain poll ([`useVotingState.ts`](frontend/src/hooks/useVotingState.ts), [`useAuctionState.ts`](frontend/src/hooks/useAuctionState.ts)).
- **Query invalidation** — After creating a vote/auction, `queryClient.invalidateQueries()` forces immediate list refresh.
- **Owner gating** — Auction owners see an `OwnerPanel` with "Collect Winnings" instead of bid forms ([`AuctionDetailPage.tsx`](frontend/src/components/AuctionDetailPage.tsx)).

---

## Deployment

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

### Deploy to Monad Testnet

```bash
npx hardhat run scripts/deploy.ts --network monadTestnet
```

The deploy script outputs the factory addresses. Update `.env` with the new addresses.

### Build Frontend for Production

```bash
cd frontend
npm run build
```

The production build will be in `frontend/dist/`.

---

## Documentation

| Document | Description |
|---|---|
| [PRD.md](PRD.md) | Product Requirements Document — problem statement, user stories, success criteria |
| [SPEC.md](SPEC.md) | Technical Specification — contract code, hook implementations, UI component specs |
| [CLAUDE.md](CLAUDE.md) | AI assistant project context and conventions |

---

## Security Considerations

| Concern | Mitigation |
|---|---|
| Replay attacks | `msg.sender` included in commit hash |
| Double voting/bidding | Contract enforces single commit per address |
| Front-running | Votes/bids hidden until reveal phase |
| Phase manipulation | Deadlines set at deploy time, immutable |
| Secret loss | localStorage persistence + clear warnings |
| Auction self-bidding | Owner address checked, bid forms hidden |

---

## License

MIT

---

<div align="center">
  <sub>Built with ❤️ at Monad Blitz Istanbul 2025</sub>
</div>
