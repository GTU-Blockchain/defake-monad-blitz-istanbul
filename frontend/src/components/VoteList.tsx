import { useState } from "react";
import { Link } from "react-router-dom";
import { useVoteList } from "../hooks/useFactory";
import { useVotingState } from "../hooks/useVotingState";

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function hasVoted(contractAddress: string): boolean {
  return localStorage.getItem(`commit_reveal_secret_${contractAddress}`) !== null;
}

type VoteData = {
  contractAddress: `0x${string}`;
  creator: `0x${string}`;
  title: string;
  createdAt: bigint;
};

function VoteCard({ vote }: { vote: VoteData }) {
  const { phase, timeLeft } = useVotingState(vote.contractAddress);
  const voted = hasVoted(vote.contractAddress);

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
      to={`/vote/${vote.contractAddress}`}
      className={`block bg-background/60 backdrop-blur-md p-5 rounded-sm border shadow-lg transition-all duration-200 relative overflow-hidden group ${
        voted
          ? "border-accent/40 hover:border-accent/70"
          : "border-border hover:border-accent/50"
      }`}
    >
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-50 transition-opacity"></div>

      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {voted && (
            <span
              title="You voted"
              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent/20 border border-accent/50 text-accent text-xs flex-shrink-0"
            >
              &#10003;
            </span>
          )}
          <h3 className="text-lg font-bold font-mono text-foreground/90 tracking-wide">
            {vote.title}
          </h3>
        </div>
        <span
          className={`text-xs font-mono px-2 py-1 rounded-sm border flex-shrink-0 ml-2 ${phaseColors[phase] || "bg-muted text-muted-foreground border-border"}`}
        >
          {phase}
        </span>
      </div>

      <div className="flex justify-between items-center text-sm text-muted-foreground font-mono">
        <span>{shortenAddress(vote.creator)}</span>
        {phase !== "ENDED" && phase !== "..." && (
          <span>{formatTime(timeRemaining)}</span>
        )}
      </div>
    </Link>
  );
}

type Filter = "all" | "voted" | "not_voted";

export function VoteList() {
  const { votes, isLoading } = useVoteList();
  const [filter, setFilter] = useState<Filter>("all");

  const filteredVotes = [...votes].reverse().filter((vote) => {
    if (filter === "all") return true;
    const voted = hasVoted(vote.contractAddress);
    return filter === "voted" ? voted : !voted;
  });

  const filterButtons: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "voted", label: "Voted" },
    { key: "not_voted", label: "Not Voted" },
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
      ) : filteredVotes.length === 0 ? (
        <div className="bg-background/60 backdrop-blur-md p-8 rounded-sm border border-border text-center text-muted-foreground font-mono">
          {filter === "all"
            ? "No votes yet. Create the first one!"
            : filter === "voted"
              ? "You haven't voted on any proposals yet."
              : "You've voted on all proposals!"}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVotes.map((vote) => (
            <VoteCard key={vote.contractAddress} vote={vote} />
          ))}
        </div>
      )}
    </div>
  );
}
