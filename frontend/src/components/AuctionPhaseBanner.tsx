import { useAuctionState } from "../hooks/useAuctionState";

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
    s,
  ).padStart(2, "0")}`;
}

const phaseConfig: Record<
  string,
  { color: string; gradient: string; label: string; description: string }
> = {
  COMMIT: {
    color: "text-orange-400",
    gradient: "from-orange-500/20 to-orange-500/5",
    label: "Commit Phase",
    description:
      "Submit a sealed bid. Your bid amount is hidden until the reveal phase.",
  },
  REVEAL: {
    color: "text-green-400",
    gradient: "from-green-500/20 to-green-500/5",
    label: "Reveal Phase",
    description:
      "Time to reveal your bid. Decrypt your commitment to have it counted.",
  },
  ENDED: {
    color: "text-purple-400",
    gradient: "from-purple-500/20 to-purple-500/5",
    label: "Auction Ended",
    description: "This auction has concluded. The highest bidder has won.",
  },
};

export function AuctionPhaseBanner({
  contractAddress,
}: {
  contractAddress: `0x${string}`;
}) {
  const { phase, timeLeft } = useAuctionState(contractAddress);

  const config = phaseConfig[phase] || phaseConfig.COMMIT;

  let timeRemaining = 0;
  if (phase === "COMMIT") {
    timeRemaining = timeLeft ? Number(timeLeft[0]) : 0;
  } else if (phase === "REVEAL") {
    timeRemaining = timeLeft ? Number(timeLeft[1]) : 0;
  }

  return (
    <div
      className={`w-full rounded-sm border border-border bg-gradient-to-b ${config.gradient} backdrop-blur-md p-6 mb-6 relative overflow-hidden`}
    >
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-current to-transparent opacity-30"></div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-2 h-2 rounded-full ${
                phase === "ENDED" ? "bg-purple-400" : "bg-current animate-pulse"
              } ${config.color}`}
            ></span>
            <span
              className={`font-mono text-sm font-bold uppercase tracking-widest ${config.color}`}
            >
              {config.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
            {config.description}
          </p>
        </div>

        {phase !== "ENDED" && (
          <div className="flex flex-col items-center sm:items-end">
            <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">
              Time Left
            </span>
            <span
              className={`text-3xl font-mono font-bold tabular-nums ${config.color}`}
            >
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
