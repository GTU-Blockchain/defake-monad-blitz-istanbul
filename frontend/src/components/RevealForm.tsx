import React, { useState } from "react";
import { useReveal } from "../hooks/useReveal";
import { useCommit } from "../hooks/useCommit";
import { useVotingState } from "../hooks/useVotingState";

export function RevealForm() {
  const { phase } = useVotingState();
  const { submitReveal, isPending } = useReveal();
  const { getStoredSecret } = useCommit();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const secret = getStoredSecret();

  if (phase !== "REVEAL") return null;

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
      setError(err.message || "Failed to reveal vote.");
    }
  };

  return (
    <div className="bg-background/60 backdrop-blur-md p-6 rounded-sm border border-border shadow-2xl w-full max-w-md mx-auto mb-8 relative overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#10B981] to-transparent opacity-50"></div>

      <h3 className="text-xl font-bold font-mono tracking-widest uppercase mb-6 text-foreground/90">
        Reveal Your Vote
      </h3>

      {success ? (
        <div className="p-4 bg-success/10 border border-success/30 text-success rounded-sm">
          <p className="font-mono text-sm uppercase">
            Vote Revealed Successfully!
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
