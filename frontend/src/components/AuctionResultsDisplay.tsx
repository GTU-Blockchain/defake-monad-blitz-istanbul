import { useAuctionState } from "../hooks/useAuctionState";
import { formatEther } from "viem";

export function AuctionResultsDisplay({
  contractAddress,
}: {
  contractAddress: `0x${string}`;
}) {
  const { phase, highestBid, highestBidder } = useAuctionState(contractAddress);

  // Don't show results during COMMIT
  if (phase === "COMMIT") return null;

  return (
    <div className="bg-background/60 backdrop-blur-md p-6 rounded-sm border border-border shadow-2xl w-full relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>

      <h3 className="text-xl font-bold font-mono tracking-widest uppercase mb-6 text-foreground/90">
        {phase === "ENDED" ? "Final Auction Result" : "Current Highest Bid"}
      </h3>

      <div className="space-y-6">
        <div className="relative p-6 border border-accent/30 rounded-sm bg-accent/5">
          <div className="absolute top-0 left-0 w-1 h-full bg-accent rounded-l-sm"></div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
              Highest Bidder
            </span>
            <span
              className="font-mono text-lg text-foreground truncate"
              title={highestBidder}
            >
              {highestBidder || "No bids revealed yet"}
            </span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-accent">
                {formatEther(highestBid)}
              </span>
              <span className="text-sm font-mono text-accent/70 uppercase">
                MON
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
