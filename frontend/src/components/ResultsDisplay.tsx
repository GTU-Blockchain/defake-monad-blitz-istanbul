import { useVotingState } from "../hooks/useVotingState";

export function ResultsDisplay({ contractAddress }: { contractAddress: `0x${string}` }) {
  const { phase, proposals } = useVotingState(contractAddress);

  // Don't show during COMMIT phase
  if (phase === "COMMIT") return null;
  if (!proposals || proposals.length === 0) return null;

  const totalVotes = proposals.reduce((acc, p) => acc + Number(p.voteCount), 0);

  let maxVotes = -1;
  const winners: { name: string; voteCount: bigint }[] = [];
  for (const p of proposals) {
    const v = Number(p.voteCount);
    if (v > maxVotes) {
      maxVotes = v;
      winners.length = 0;
      winners.push(p);
    } else if (v === maxVotes && v > 0) {
      winners.push(p);
    }
  }

  return (
    <div className="bg-background/60 backdrop-blur-md p-6 rounded-sm border border-border shadow-2xl w-full relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent opacity-50"></div>

      <h3 className="text-xl font-bold font-mono tracking-widest uppercase mb-6 text-foreground/90">
        {phase === "ENDED" ? "Final Results" : "Live Tally"}
      </h3>

      <div className="space-y-6">
        {proposals.map((p, index) => {
          const voteCount = Number(p.voteCount);
          const percentage =
            totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
          const isWinner =
            phase === "ENDED" && winners.includes(p) && voteCount > 0;

          return (
            <div key={index} className="relative">
              <div className="flex justify-between mb-2">
                <span
                  className={`font-mono text-sm tracking-wider uppercase flex items-center gap-2 ${
                    isWinner ? "text-purple-400" : "text-foreground/80"
                  }`}
                >
                  {p.name}
                </span>
                <span className="text-muted-foreground font-mono text-sm">
                  {voteCount} {voteCount === 1 ? "VOTE" : "VOTES"}
                </span>
              </div>
              <div className="w-full bg-muted/50 rounded-sm h-2 overflow-hidden border border-border/30">
                <div
                  className={`h-2 rounded-sm transition-all duration-1000 ${
                    isWinner
                      ? "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                      : "bg-accent opacity-80"
                  }`}
                  style={{ width: `${Math.max(percentage, 2)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
