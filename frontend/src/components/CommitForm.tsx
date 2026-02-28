import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useCommit } from "../hooks/useCommit";
import { useVotingState } from "../hooks/useVotingState";

export function CommitForm() {
  const { phase, proposals } = useVotingState();
  const { address } = useAccount();
  const { submitCommit, isPending, getStoredSecret } = useCommit();
  const [selectedVote, setSelectedVote] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);

  // Use previously saved secret as commit-check for this browser
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
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md mx-auto mb-8">
      <h3 className="text-2xl font-bold mb-4 text-gray-800">Cast Your Vote</h3>
      {hasCommitted || success ? (
        <div className="p-4 bg-orange-100 border border-orange-400 text-orange-700 rounded-lg">
          <p className="font-bold">Commit successful!</p>
          <p className="text-sm mt-2">
            ⚠️ <strong>CRITICAL:</strong> Your secret is saved in this browser.
            Do <span className="underline">NOT</span> clear your browser data or
            use incognito mode, otherwise you cannot reveal your vote.
          </p>
        </div>
      ) : (
        <form onSubmit={handleCommit} className="space-y-4">
          <div className="space-y-2">
            {proposals?.map((p, index) => (
              <label
                key={index}
                className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedVote === index
                    ? "border-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="proposal"
                  className="mr-3"
                  value={index}
                  checked={selectedVote === index}
                  onChange={() => setSelectedVote(index)}
                />
                <span className="text-lg text-gray-700">{p.name}</span>
              </label>
            ))}
          </div>
          <button
            type="submit"
            disabled={isPending || selectedVote === null || !address}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            {isPending ? "Committing..." : "Commit Vote"}
          </button>
        </form>
      )}
    </div>
  );
}
