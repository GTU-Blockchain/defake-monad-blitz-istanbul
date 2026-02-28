import React, { useState } from "react";
import { useCreateAuction } from "../hooks/useAuctionFactory";
import { decodeEventLog } from "viem";
import { usePublicClient } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { AUCTION_FACTORY_ABI } from "../config/auction";

export function CreateAuctionForm({
  onCreated,
}: {
  onCreated?: (address: string) => void;
}) {
  const { createAuction, isPending } = useCreateAuction();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [commitMinutes, setCommitMinutes] = useState(120);
  const [revealMinutes, setRevealMinutes] = useState(60);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }
    if (commitMinutes < 1 || revealMinutes < 1) {
      setError("Durations must be at least 1 minute.");
      return;
    }

    try {
      const hash = await createAuction(
        trimmedTitle,
        commitMinutes * 60,
        revealMinutes * 60,
      );

      const receipt = await publicClient!.waitForTransactionReceipt({ hash });

      // Force auction list to refetch
      await queryClient.invalidateQueries();

      const auctionCreatedLog = receipt.logs.find((log) => {
        try {
          const decoded = decodeEventLog({
            abi: AUCTION_FACTORY_ABI,
            data: log.data,
            topics: log.topics,
          });
          return decoded.eventName === "AuctionCreated";
        } catch {
          return false;
        }
      });

      if (auctionCreatedLog) {
        const decoded = decodeEventLog({
          abi: AUCTION_FACTORY_ABI,
          data: auctionCreatedLog.data,
          topics: auctionCreatedLog.topics,
        });
        const args = decoded.args as { contractAddress?: string } | undefined;
        if (args?.contractAddress && onCreated) {
          onCreated(args.contractAddress);
          return;
        }
      }

      if (onCreated) onCreated(""); // Let parent handle success maybe
    } catch (err: any) {
      console.error(err);
      setError(err.shortMessage || err.message || "Transaction failed.");
    }
  };

  return (
    <div className="bg-background/60 backdrop-blur-md p-6 rounded-sm border border-border shadow-lg w-full relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"></div>

      <h3 className="text-xl font-bold font-mono tracking-widest uppercase mb-6 text-foreground/90">
        Create Sealed Bid Auction
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-mono text-muted-foreground mb-1 uppercase tracking-wider">
            Title/Asset Name
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Rare NFT #1234"
            className="w-full bg-muted/30 border border-border rounded-sm px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-mono text-muted-foreground mb-1 uppercase tracking-wider">
              Commit (min)
            </label>
            <input
              type="number"
              min={1}
              value={commitMinutes}
              onChange={(e) => setCommitMinutes(Number(e.target.value))}
              className="w-full bg-muted/30 border border-border rounded-sm px-3 py-2 text-foreground focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-mono text-muted-foreground mb-1 uppercase tracking-wider">
              Reveal (min)
            </label>
            <input
              type="number"
              min={1}
              value={revealMinutes}
              onChange={(e) => setRevealMinutes(Number(e.target.value))}
              className="w-full bg-muted/30 border border-border rounded-sm px-3 py-2 text-foreground focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-sm font-mono">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full tracking-widest uppercase font-mono text-sm bg-transparent border border-accent text-accent hover:bg-accent hover:text-white disabled:bg-muted disabled:border-border disabled:text-muted-foreground py-3 px-4 rounded-sm transition-all duration-300"
        >
          {isPending ? "Creating..." : "Create Auction"}
        </button>
      </form>
    </div>
  );
}
