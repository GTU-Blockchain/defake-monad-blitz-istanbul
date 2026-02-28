import React from "react";
import { useVotingState } from "../hooks/useVotingState";

export function PhaseBanner() {
  const { phase, timeLeft } = useVotingState();

  let phaseColor = "bg-muted border-border";
  let timeRemaining = 0;

  if (phase === "COMMIT") {
    phaseColor = "bg-orange-500/20 border-orange-500/50 text-orange-400";
    timeRemaining = timeLeft ? Number(timeLeft[0]) : 0;
  } else if (phase === "REVEAL") {
    phaseColor = "bg-green-500/20 border-green-500/50 text-green-400";
    timeRemaining = timeLeft ? Number(timeLeft[1]) : 0;
  } else if (phase === "ENDED") {
    phaseColor = "bg-purple-500/20 border-purple-500/50 text-purple-400";
  }

  return (
    <div
      className={`w-full text-white text-center py-4 px-6 md:rounded-xl shadow-lg flex flex-col items-center justify-center space-y-2 mb-8 ${phaseColor}`}
    >
      <h2 className="text-xl font-bold tracking-wider">
        CURRENT PHASE: {phase}
      </h2>
      {phase !== "ENDED" && (
        <p className="text-lg opacity-90">
          Time Remaining: {timeRemaining} seconds
        </p>
      )}
    </div>
  );
}
