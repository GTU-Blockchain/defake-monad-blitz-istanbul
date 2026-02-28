import { useState } from "react";
import { useAuctionReveal } from "../hooks/useAuctionReveal";
import { useAuctionCommit } from "../hooks/useAuctionCommit";
import { useAuctionState } from "../hooks/useAuctionState";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { AUCTION_ABI } from "../config/auction";

export function AuctionRevealForm({
  contractAddress,
}: {
  contractAddress: `0x${string}`;
}) {
  const { phase } = useAuctionState(contractAddress);
  const { submitReveal, isPending } = useAuctionReveal(contractAddress);
  const { getStoredSecret } = useAuctionCommit(contractAddress);
  const { address } = useAccount();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const { data: bidderInfo, refetch } = useReadContract({
    address: contractAddress,
    abi: AUCTION_ABI,
    functionName: "bidders",
    args: address ? [address] : undefined,
    query: { enabled: !!address && phase !== "COMMIT" },
  });

  const { writeContractAsync: withdrawAsync, isPending: isWithdrawing } =
    useWriteContract();

  const handleWithdraw = async () => {
    setError("");
    try {
      await withdrawAsync({
        address: contractAddress,
        abi: AUCTION_ABI,
        functionName: "withdraw",
      });
      refetch();
    } catch (err: any) {
      console.error(err);
      setError(err.shortMessage || err.message || "Failed to withdraw.");
    }
  };

  const secret = getStoredSecret();

  if (phase === "COMMIT") return null;

  const isRevealed = success || (bidderInfo && (bidderInfo as any)[3] === true);
  const isWithdrawn = bidderInfo && (bidderInfo as any)[4] === true;

  const handleReveal = async () => {
    setError("");
    if (!secret) {
      setError("No commit secret found in this browser.");
      return;
    }

    try {
      await submitReveal(secret.bidAmountStr, secret.nonce);
      setSuccess(true);
      refetch();
    } catch (err: any) {
      console.error(err);
      setError(err.shortMessage || err.message || "Failed to reveal bid.");
    }
  };

  return (
    <div className="bg-background/60 backdrop-blur-md p-6 rounded-sm border border-border shadow-2xl w-full relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#10B981] to-transparent opacity-50"></div>

      <h3 className="text-xl font-bold font-mono tracking-widest uppercase mb-6 text-foreground/90">
        {phase === "REVEAL" ? "Reveal Your Bid" : "Auction Ended"}
      </h3>

      {isRevealed ? (
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/50 flex items-center justify-center mb-4">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-8 h-8 text-green-400"
            >
              <path
                d="M20 6L9 17l-5-5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="font-bold font-mono text-lg uppercase mb-2 text-green-400">
            Bid Revealed
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-4">
            Your bid decrypts successfully. You can withdraw your unsuccessful
            bid (if any) or excess deposit.
          </p>
          {phase === "ENDED" && !isWithdrawn && (
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="w-full tracking-widest uppercase font-mono text-sm bg-transparent border border-accent text-accent hover:bg-accent hover:text-white disabled:bg-muted disabled:border-border disabled:text-muted-foreground py-3 px-4 rounded-sm transition-all duration-300"
            >
              {isWithdrawing ? "Withdrawing..." : "Withdraw Funds"}
            </button>
          )}
          {isWithdrawn && (
            <p className="text-sm text-purple-400 font-mono">
              Funds withdrawn successfully.
            </p>
          )}
        </div>
      ) : phase === "REVEAL" ? (
        <div className="space-y-6">
          <p className="text-muted-foreground text-sm">
            Submit your stored secret to have your bid officially counted.
          </p>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-sm font-mono leading-relaxed">
              {error}
            </div>
          )}

          {!secret && !error && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400/90 text-sm rounded-sm font-mono leading-relaxed">
              No local commit found. Make sure you are using the exact same
              browser profile.
            </div>
          )}

          <button
            onClick={handleReveal}
            disabled={isPending || !secret}
            className="w-full tracking-widest uppercase font-mono text-sm bg-success/10 border border-success/50 text-success hover:bg-success hover:text-background disabled:bg-muted disabled:border-border disabled:text-muted-foreground py-3 px-4 rounded-sm transition-all duration-300"
          >
            {isPending ? "Revealing..." : "Reveal Bid Now"}
          </button>
        </div>
      ) : (
        <div className="p-4 bg-muted/20 border border-border rounded-sm text-center">
          <p className="text-muted-foreground text-sm">
            You did not reveal your bid in time.
          </p>
        </div>
      )}
    </div>
  );
}
