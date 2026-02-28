import { Link } from "react-router-dom";
import { useVoteList } from "../hooks/useFactory";
import { useReadContracts } from "wagmi";
import { ABI } from "../config/contract";

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function VoteCard({
  vote,
}: {
  vote: {
    contractAddress: `0x${string}`;
    creator: `0x${string}`;
    title: string;
    createdAt: bigint;
  };
}) {
  const { data } = useReadContracts({
    contracts: [
      { address: vote.contractAddress, abi: ABI, functionName: "currentPhase" },
      { address: vote.contractAddress, abi: ABI, functionName: "timeLeft" },
    ],
    query: { refetchInterval: 5000 },
  });

  const phase = (data?.[0]?.result as string) ?? "...";
  const timeLeft = data?.[1]?.result as [bigint, bigint] | undefined;

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
      className="block bg-background/60 backdrop-blur-md p-5 rounded-sm border border-border hover:border-accent/50 shadow-lg transition-all duration-200 relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-50 transition-opacity"></div>

      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold font-mono text-foreground/90 tracking-wide">
          {vote.title}
        </h3>
        <span
          className={`text-xs font-mono px-2 py-1 rounded-sm border ${phaseColors[phase] || "bg-muted text-muted-foreground border-border"}`}
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

export function VoteList() {
  const { votes, isLoading } = useVoteList();

  return (
    <div className="w-full max-w-lg mx-auto">
      <h2 className="text-xl font-bold font-mono tracking-widest uppercase mb-6 text-foreground/90">
        All Votes
      </h2>

      {isLoading ? (
        <p className="text-muted-foreground font-mono text-sm text-center py-8">
          Loading...
        </p>
      ) : votes.length === 0 ? (
        <div className="bg-background/60 backdrop-blur-md p-8 rounded-sm border border-border text-center text-muted-foreground font-mono">
          No votes yet. Create the first one!
        </div>
      ) : (
        <div className="space-y-3">
          {[...votes].reverse().map((vote) => (
            <VoteCard key={vote.contractAddress} vote={vote} />
          ))}
        </div>
      )}
    </div>
  );
}
