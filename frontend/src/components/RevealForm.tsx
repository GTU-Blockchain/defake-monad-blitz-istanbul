import { useState } from "react";
import { useReveal } from "../hooks/useReveal";
import { useCommit } from "../hooks/useCommit";
import { useVotingState } from "../hooks/useVotingState";
import { useAccount, useReadContract } from "wagmi";
import { ABI } from "../config/contract";

export function RevealForm({ contractAddress }: { contractAddress: `0x${string}` }) {
  const { phase } = useVotingState(contractAddress);
  const { submitReveal, isPending } = useReveal(contractAddress);
  const { getStoredSecret } = useCommit(contractAddress);
  const { address } = useAccount();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const { data: alreadyRevealed } = useReadContract({
    address: contractAddress,
    abi: ABI,
    functionName: "revealed",
    args: address ? [address] : undefined,
    query: { enabled: !!address && phase === "REVEAL" },
  });

  const secret = getStoredSecret();

  if (phase !== "REVEAL") return null;

  const isRevealed = success || alreadyRevealed === true;

  const handleReveal = async () => {
    setError("");
    if (!secret) {
      setError(
        "No commit secret found in this browser. Are you using a different device or incognito mode?",
      );
      return;
    }

    try {
      await submitReveal(secret.voteIndex, secret.nonce);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.shortMessage || err.message || "Failed to reveal vote.");
    }
  };

  return (
    <div className="bg-background/60 backdrop-blur-md p-6 rounded-sm border border-border shadow-2xl w-full relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#10B981] to-transparent opacity-50"></div>

      <h3 className="text-xl font-bold font-mono tracking-widest uppercase mb-6 text-foreground/90">
        Reveal Your Vote
      </h3>

      {isRevealed ? (
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/50 flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-green-400">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="font-bold font-mono text-lg uppercase mb-2 text-green-400">
            Vote Revealed
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Your vote has been successfully decrypted and counted. Results will be finalized when the reveal phase ends.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-muted-foreground text-sm">
            Submit your stored secret to have your vote officially counted.
          </p>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-sm font-mono leading-relaxed">
              {error}
            </div>
          )}

          {!secret && !error && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400/90 text-sm rounded-sm font-mono leading-relaxed">
              No local commit found. If you committed, make sure you are using
              the exact same browser profile.
            </div>
          )}

          <button
            onClick={handleReveal}
            disabled={isPending || !secret}
            className="w-full tracking-widest uppercase font-mono text-sm bg-success/10 border border-success/50 text-success hover:bg-success hover:text-background disabled:bg-muted disabled:border-border disabled:text-muted-foreground py-3 px-4 rounded-sm transition-all duration-300"
          >
            {isPending ? "Revealing..." : "Reveal Vote Now"}
          </button>
        </div>
      )}
    </div>
  );
}
