import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuctionList } from "../hooks/useAuctionFactory";
import { useAuctionState } from "../hooks/useAuctionState";

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function hasCommitted(contractAddress: string): boolean {
  return (
    localStorage.getItem(`auction_commit_secret_${contractAddress}`) !== null
  );
}

type AuctionData = {
  contractAddress: `0x${string}`;
  creator: `0x${string}`;
  title: string;
  createdAt: bigint;
};

function AuctionCard({ auction }: { auction: AuctionData }) {
  const { phase, timeLeft } = useAuctionState(auction.contractAddress);
  const committed = hasCommitted(auction.contractAddress);

  let timeRemaining = 0;
  if (phase === "COMMIT" && timeLeft) {
    timeRemaining = Number(timeLeft[0]);
  } else if (phase === "REVEAL" && timeLeft) {
    timeRemaining = Number(timeLeft[1]);
  }

  const phaseColors: Record<string, string> = {
    COMMIT: "bg-orange-500/20 text-orange-400 border-orange-500/50",
    REVEAL: "bg-green-500/20 text-green-400 border-green-500/50",
    ENDED: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <Link
      to={`/auction/${auction.contractAddress}`}
      className={`block w-full text-left bg-background/60 backdrop-blur-md p-5 rounded-sm border shadow-lg transition-all duration-200 relative overflow-hidden group ${
        committed
          ? "border-accent/40 hover:border-accent/70"
          : "border-border hover:border-accent/50"
      }`}
    >
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-50 transition-opacity"></div>

      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {committed && (
            <span
              title="You committed a bid"
              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent/20 border border-accent/50 text-accent text-xs flex-shrink-0"
            >
              &#10003;
            </span>
          )}
          <h3 className="text-lg font-bold font-mono text-foreground/90 tracking-wide">
            {auction.title}
          </h3>
        </div>
        <span
          className={`text-xs font-mono px-2 py-1 rounded-sm border flex-shrink-0 ml-2 ${
            phaseColors[phase] || "bg-muted text-muted-foreground border-border"
          }`}
        >
          {phase}
        </span>
      </div>

      <div className="flex justify-between items-center text-sm text-muted-foreground font-mono">
        <span>{shortenAddress(auction.creator)}</span>
        {phase !== "ENDED" && phase !== "..." && (
          <span>{formatTime(timeRemaining)}</span>
        )}
      </div>
    </Link>
  );
}

type Filter = "all" | "committed" | "not_committed";

export function AuctionList() {
  const { auctions, isLoading } = useAuctionList();
  const [filter, setFilter] = useState<Filter>("all");

  const filteredAuctions = [...auctions].reverse().filter((auction) => {
    if (filter === "all") return true;
    const committed = hasCommitted(auction.contractAddress);
    return filter === "committed" ? committed : !committed;
  });

  const filterButtons: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "committed", label: "Committed" },
    { key: "not_committed", label: "Not Committed" },
  ];

  return (
    <div className="w-full">
      <div className="flex justify-end items-center mb-4">
        <div className="flex gap-1">
          {filterButtons.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 text-xs font-mono rounded-sm border transition-colors ${
                filter === f.key
                  ? "border-accent text-accent bg-accent/10"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground font-mono text-sm text-center py-8">
          Loading...
        </p>
      ) : filteredAuctions.length === 0 ? (
        <div className="bg-background/60 backdrop-blur-md p-8 rounded-sm border border-border text-center text-muted-foreground font-mono">
          {filter === "all"
            ? "No auctions yet. Create the first one!"
            : filter === "committed"
            ? "You haven't committed to any auctions yet."
            : "You've committed to all auctions!"}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAuctions.map((auction) => (
            <AuctionCard key={auction.contractAddress} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
}
