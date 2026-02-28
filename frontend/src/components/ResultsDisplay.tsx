import React from "react";
import { useVotingState } from "../hooks/useVotingState";

export function ResultsDisplay() {
  const { phase, proposals } = useVotingState();

  if (!proposals || proposals.length === 0) return null;

  const totalVotes = proposals.reduce((acc, p) => acc + Number(p.voteCount), 0);

  // Find winner(s)
  let maxVotes = -1;
  const winners = [];
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
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md mx-auto">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">
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
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-gray-700 flex items-center gap-2">
                  {p.name}
                  {isWinner && <span title="Winner">👑</span>}
                </span>
                <span className="text-gray-600 font-medium">
                  {voteCount} {voteCount === 1 ? "vote" : "votes"}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    isWinner ? "bg-yellow-400" : "bg-blue-500"
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
