import { useState, useEffect } from "react";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useAuctionCommit } from "../hooks/useAuctionCommit";
import { useAuctionState } from "../hooks/useAuctionState";
import { parseEther } from "viem";

export function AuctionCommitForm({
  contractAddress,
}: {
  contractAddress: `0x${string}`;
}) {
  const { phase, refetch } = useAuctionState(contractAddress);
  const { address } = useAccount();
  const {
    submitCommit,
    isPending: isWritePending,
    getStoredSecret,
  } = useAuctionCommit(contractAddress);

  const [bidAmount, setBidAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [error, setError] = useState("");

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  const hasCommittedLocally = !!getStoredSecret();
  const hasCommitted = hasCommittedLocally || isConfirmed;

  useEffect(() => {
    if (isConfirmed) {
      refetch();
    }
  }, [isConfirmed, refetch]);

  if (phase !== "COMMIT") return null;

  const handleCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!bidAmount || !depositAmount || !address) return;

    try {
      const bidWei = parseEther(bidAmount).toString();
      const depositWei = parseEther(depositAmount).toString();

      if (BigInt(bidWei) > BigInt(depositWei)) {
        setError("Deposit must be greater than or equal to bid amount.");
        return;
      }

      const hash = await submitCommit(bidWei, depositWei, address);
      setTxHash(hash);
    } catch (err: any) {
      console.error(err);
      setError(err.shortMessage || err.message || "Commit failed.");
    }
  };

  const isPending = isWritePending || isConfirming;

  return (
    <div className="bg-background/60 backdrop-blur-md p-6 rounded-sm border border-border shadow-2xl w-full relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"></div>

      <h3 className="text-xl font-bold font-mono tracking-widest uppercase mb-6 text-foreground/90">
        Submit Sealed Bid
      </h3>
      {hasCommitted ? (
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 rounded-full bg-accent/10 border-2 border-accent/50 flex items-center justify-center mb-4">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-8 h-8 text-accent"
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
          <p className="font-bold font-mono text-lg uppercase mb-2 text-accent">
            Bid Committed
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-xs">
            Your bid has been securely encrypted and submitted on-chain. Come
            back during the Reveal phase to finalize it.
          </p>
          <div className="w-full p-3 bg-orange-500/10 border border-orange-500/30 rounded-sm">
            <p className="text-xs text-orange-400 font-mono leading-relaxed">
              Your secret is stored in this browser. Do not clear your browser
              data or you will lose your bid.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCommit} className="space-y-4">
          <div>
            <label className="block text-sm font-mono text-muted-foreground mb-1 uppercase tracking-wider">
              True Bid Amount (MON)
            </label>
            <input
              type="text"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="e.g. 1.5"
              className="w-full bg-muted/30 border border-border rounded-sm px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              This amount will be hidden on-chain.
            </p>
          </div>

          <div>
            <label className="block text-sm font-mono text-muted-foreground mb-1 uppercase tracking-wider">
              Deposit Amount (MON)
            </label>
            <input
              type="text"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="e.g. 2.0"
              className="w-full bg-muted/30 border border-border rounded-sm px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              Must be ≥ True Bid. Sent to contract now to disguise your bid.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-sm font-mono">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || !bidAmount || !depositAmount || !address}
            className="w-full mt-6 tracking-widest uppercase font-mono text-sm bg-transparent border border-accent text-accent hover:bg-accent hover:text-white disabled:bg-muted disabled:border-border disabled:text-muted-foreground py-3 px-4 rounded-sm transition-all duration-300"
          >
            {isConfirming
              ? "Confirming..."
              : isWritePending
              ? "Encrypting..."
              : "Commit Bid"}
          </button>
        </form>
      )}
    </div>
  );
}
