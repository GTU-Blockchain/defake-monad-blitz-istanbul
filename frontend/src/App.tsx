import { useState } from "react";
import { Routes, Route, Link, useParams } from "react-router-dom";
import { PhaseBanner } from "./components/PhaseBanner";
import { CommitForm } from "./components/CommitForm";
import { RevealForm } from "./components/RevealForm";
import { ResultsDisplay } from "./components/ResultsDisplay";
import { VoteList } from "./components/VoteList";
import { CreateVoteForm } from "./components/CreateVoteForm";
import { AuctionList } from "./components/AuctionList";
import { CreateAuctionForm } from "./components/CreateAuctionForm";
import { AuctionDetailPage } from "./components/AuctionDetailPage";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

function HomePage() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"votes" | "auctions">("votes");

  // States for Votes
  const [showCreateVote, setShowCreateVote] = useState(false);

  // States for Auctions
  const [showCreateAuction, setShowCreateAuction] = useState(false);

  return (
    <main className="w-full max-w-2xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white mb-3">
          Decentralized Governance & Asset Exchange
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
          Create and participate in secure, front-running resistant votes and
          sealed-bid auctions powered by commit-reveal on Monad.
        </p>
      </div>

      {/* Tabs */}
      <div className="relative flex bg-muted/20 border border-border rounded-sm p-1 mb-8">
        {/* Sliding Indicator */}
        <div
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-sm transition-transform duration-500 ease-out shadow-sm border"
          style={{
            transform:
              activeTab === "votes"
                ? "translateX(0)"
                : "translateX(calc(100% + 1px))",
            backgroundColor:
              activeTab === "votes"
                ? "rgba(32, 129, 226, 0.15)"
                : "rgba(168, 85, 247, 0.15)",
            borderColor:
              activeTab === "votes"
                ? "rgba(32, 129, 226, 0.3)"
                : "rgba(168, 85, 247, 0.3)",
          }}
        />
        <button
          onClick={() => {
            setActiveTab("votes");
          }}
          className={`relative z-10 flex-1 py-2 text-sm font-mono uppercase tracking-widest rounded-sm transition-colors duration-300 ${
            activeTab === "votes"
              ? "text-accent font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Votes
        </button>
        <button
          onClick={() => {
            setActiveTab("auctions");
          }}
          className={`relative z-10 flex-1 py-2 text-sm font-mono uppercase tracking-widest rounded-sm transition-colors duration-300 ${
            activeTab === "auctions"
              ? "text-purple-400 font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Auctions
        </button>
      </div>

      {activeTab === "votes" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
          {/* Create Vote Section */}
          {isConnected ? (
            showCreateVote ? (
              <div className="mb-8">
                <button
                  onClick={() => setShowCreateVote(false)}
                  className="inline-flex items-center gap-2 mb-4 text-sm font-mono text-muted-foreground hover:text-accent transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                    <path
                      d="M18 6L6 18M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Cancel
                </button>
                <CreateVoteForm />
              </div>
            ) : (
              <button
                onClick={() => setShowCreateVote(true)}
                className="w-full mb-8 py-4 px-6 bg-background/60 backdrop-blur-md border border-dashed border-accent/40 rounded-sm text-accent hover:bg-accent/5 hover:border-accent transition-all duration-200 flex items-center justify-center gap-3 group"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300"
                >
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="font-mono text-sm tracking-widest uppercase">
                  Create New Vote
                </span>
              </button>
            )
          ) : (
            <div className="w-full mb-8 py-6 px-6 bg-background/60 backdrop-blur-md border border-border rounded-sm text-center">
              <div className="w-12 h-12 rounded-full bg-muted/50 border border-border flex items-center justify-center mx-auto mb-3">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-6 h-6 text-muted-foreground"
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M7 11V7a5 5 0 0110 0v4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="text-foreground/80 font-mono text-sm mb-1">
                Wallet Not Connected
              </p>
              <p className="text-muted-foreground text-xs">
                Connect your wallet to create votes and participate.
              </p>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Proposals
            </span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <VoteList />
        </div>
      )}

      {activeTab === "auctions" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
          {isConnected ? (
            showCreateAuction ? (
              <div className="mb-8">
                <button
                  onClick={() => setShowCreateAuction(false)}
                  className="inline-flex items-center gap-2 mb-4 text-sm font-mono text-muted-foreground hover:text-purple-400 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                    <path
                      d="M18 6L6 18M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Cancel
                </button>
                <CreateAuctionForm
                  onCreated={() => {
                    setShowCreateAuction(false);
                  }}
                />
              </div>
            ) : (
              <button
                onClick={() => setShowCreateAuction(true)}
                className="w-full mb-8 py-4 px-6 bg-background/60 backdrop-blur-md border border-dashed border-purple-400/40 rounded-sm text-purple-400 hover:bg-purple-400/5 hover:border-purple-400 transition-all duration-200 flex items-center justify-center gap-3 group"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300"
                >
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="font-mono text-sm tracking-widest uppercase">
                  Create Sealed-Bid Auction
                </span>
              </button>
            )
          ) : (
            <div className="w-full mb-8 py-6 px-6 bg-background/60 backdrop-blur-md border border-border rounded-sm text-center">
              <div className="w-12 h-12 rounded-full bg-muted/50 border border-border flex items-center justify-center mx-auto mb-3">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-6 h-6 text-muted-foreground"
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M7 11V7a5 5 0 0110 0v4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="text-foreground/80 font-mono text-sm mb-1">
                Wallet Not Connected
              </p>
              <p className="text-muted-foreground text-xs">
                Connect your wallet to create and participate in auctions.
              </p>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Active Auctions
            </span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <AuctionList />
        </div>
      )}
    </main>
  );
}

function ContractInfo({
  contractAddress,
  isAuction = false,
}: {
  contractAddress: `0x${string}`;
  isAuction?: boolean;
}) {
  const short = `${contractAddress.slice(0, 8)}...${contractAddress.slice(-6)}`;
  return (
    <div className="flex items-center gap-3 mb-6 p-4 bg-muted/20 border border-border rounded-sm">
      <div
        className={`w-10 h-10 rounded-full ${
          isAuction
            ? "bg-purple-500/10 border-purple-500/30"
            : "bg-accent/10 border-accent/30"
        } border flex items-center justify-center flex-shrink-0`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={`w-5 h-5 ${isAuction ? "text-purple-400" : "text-accent"}`}
        >
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M9 12l2 2 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
          Contract
        </p>
        <p className="text-sm font-mono text-foreground/80 truncate">{short}</p>
      </div>
    </div>
  );
}

function VoteDetailPage() {
  const { address } = useParams<{ address: string }>();
  const { isConnected } = useAccount();

  const contractAddress = address as `0x${string}`;

  return (
    <main className="w-full max-w-2xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 mb-6 text-sm font-mono text-muted-foreground hover:text-accent transition-colors group"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-4 h-4 transition-transform group-hover:-translate-x-1"
        >
          <path
            d="M19 12H5M12 19l-7-7 7-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to Votes
      </Link>

      <ContractInfo contractAddress={contractAddress} />

      <PhaseBanner contractAddress={contractAddress} />

      {!isConnected ? (
        <div className="bg-background/60 backdrop-blur-md border border-border p-10 rounded-sm shadow-lg text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-30"></div>
          <div className="w-14 h-14 rounded-full bg-muted/50 border border-border flex items-center justify-center mx-auto mb-4">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-7 h-7 text-muted-foreground"
            >
              <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M7 11V7a5 5 0 0110 0v4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="text-foreground/80 font-mono text-sm mb-1">
            Wallet Not Connected
          </p>
          <p className="text-muted-foreground text-xs">
            Connect your wallet to participate in this vote.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <CommitForm contractAddress={contractAddress} />
          <RevealForm contractAddress={contractAddress} />
          <ResultsDisplay contractAddress={contractAddress} />
        </div>
      )}
    </main>
  );
}

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-transparent text-foreground">
      <header className="w-full max-w-2xl flex justify-between items-center mb-10 border-b border-border pb-4">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.svg" alt="Obscura" className="w-12 h-12" />
          <h1
            className="text-2xl font-bold text-white tracking-[0.3em] uppercase"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            Obscura
          </h1>
        </Link>
        <ConnectButton />
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/vote/:address" element={<VoteDetailPage />} />
        <Route path="/auction/:address" element={<AuctionDetailPage />} />
      </Routes>
    </div>
  );
}

export default App;
