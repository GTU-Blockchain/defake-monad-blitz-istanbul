import { useState } from "react";
import { useAccount } from "wagmi";
import { useCommit } from "../hooks/useCommit";
import { useVotingState } from "../hooks/useVotingState";

export function CommitForm({ contractAddress }: { contractAddress: `0x${string}` }) {
  const { phase, proposals } = useVotingState(contractAddress);
  const { address } = useAccount();
  const { submitCommit, isPending, getStoredSecret } = useCommit(contractAddress);
  const [selectedVote, setSelectedVote] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);

  const hasCommitted = !!getStoredSecret();

  if (phase !== "COMMIT") return null;

  const handleCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVote === null || !address) return;
    try {
      await submitCommit(selectedVote, address);
      setSuccess(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-background/60 backdrop-blur-md p-6 rounded-sm border border-border shadow-2xl w-full relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"></div>

      <h3 className="text-xl font-bold font-mono tracking-widest uppercase mb-6 text-foreground/90">
        Cast Your Vote
      </h3>
      {hasCommitted || success ? (
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 rounded-full bg-accent/10 border-2 border-accent/50 flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-accent">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="font-bold font-mono text-lg uppercase mb-2 text-accent">
            Vote Committed
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-xs">
            Your vote has been securely encrypted and submitted on-chain. Come back during the Reveal phase to finalize it.
          </p>
          <div className="w-full p-3 bg-orange-500/10 border border-orange-500/30 rounded-sm">
            <p className="text-xs text-orange-400 font-mono leading-relaxed">
              Your secret is stored in this browser. Do not clear your browser data or you will lose your vote.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCommit} className="space-y-4">
          <div className="space-y-3">
            {proposals?.map((p, index) => (
              <label
                key={index}
                onClick={() => setSelectedVote(index)}
                className={`block p-4 border rounded-sm cursor-pointer transition-all duration-200 group relative ${
                  selectedVote === index
                    ? "border-accent bg-accent/10 shadow-[0_0_15px_rgba(32,129,226,0.3)]"
                    : "border-border bg-muted/30 hover:bg-muted/70 hover:border-border/80"
                }`}
              >
                {selectedVote === index && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-sm"></div>
                )}
                <div className="flex items-center ml-2">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center mr-4 transition-colors ${
                      selectedVote === index
                        ? "border-accent bg-accent/20"
                        : "border-muted-foreground/50"
                    }`}
                  >
                    {selectedVote === index && (
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                    )}
                  </div>
                  <span
                    className={`text-lg transition-colors ${
                      selectedVote === index
                        ? "text-white font-medium"
                        : "text-muted-foreground group-hover:text-foreground/80"
                    }`}
                  >
                    {p.name}
                  </span>
                </div>
              </label>
            ))}
          </div>
          <button
            type="submit"
            disabled={isPending || selectedVote === null || !address}
            className="w-full mt-6 tracking-widest uppercase font-mono text-sm bg-transparent border border-accent text-accent hover:bg-accent hover:text-white disabled:bg-muted disabled:border-border disabled:text-muted-foreground py-3 px-4 rounded-sm transition-all duration-300"
          >
            {isPending ? "Encrypting..." : "Commit Vote"}
          </button>
        </form>
      )}
    </div>
  );
}
