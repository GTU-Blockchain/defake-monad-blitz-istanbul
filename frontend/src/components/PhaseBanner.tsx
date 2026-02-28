import React from "react";
import { useVotingState } from "../hooks/useVotingState";

export function PhaseBanner() {
  const { phase, timeLeft } = useVotingState();

  let phaseColor = "bg-gray-500";
  let timeRemaining = 0;

  if (phase === "COMMIT") {
    phaseColor = "bg-orange-500";
    timeRemaining = timeLeft ? Number(timeLeft[0]) : 0;
  } else if (phase === "REVEAL") {
    phaseColor = "bg-green-500";
    timeRemaining = timeLeft ? Number(timeLeft[1]) : 0;
  } else if (phase === "ENDED") {
    phaseColor = "bg-purple-500";
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
