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
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md mx-auto mb-8">
      <h3 className="text-2xl font-bold mb-4 text-gray-800">
        Reveal Your Vote
      </h3>

      {success ? (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg">
          Successfully revealed! Your vote is now counted.
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">
            Submit your stored secret to have your vote officially counted.
          </p>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          {!secret && !error && (
            <div className="p-3 bg-yellow-100 text-yellow-800 text-sm rounded-lg">
              No local commit found. If you committed, make sure you are using
              the exact same browser profile.
            </div>
          )}

          <button
            onClick={handleReveal}
            disabled={isPending || !secret}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            {isPending ? "Revealing..." : "Reveal Vote Now"}
          </button>
        </div>
      )}
    </div>
  );
}
