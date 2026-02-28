import { useEffect, useRef, useState } from "react";
import { useReadContracts } from "wagmi";
import { AUCTION_ABI } from "../config/auction";

export function useAuctionState(contractAddress: `0x${string}`) {
  const [phase, setPhase] = useState<string>("COMMIT");

  const { data, refetch } = useReadContracts({
    contracts: [
      {
        address: contractAddress,
        abi: AUCTION_ABI,
        functionName: "currentPhase",
      },
      { address: contractAddress, abi: AUCTION_ABI, functionName: "timeLeft" },
      {
        address: contractAddress,
        abi: AUCTION_ABI,
        functionName: "highestBid",
      },
      {
        address: contractAddress,
        abi: AUCTION_ABI,
        functionName: "highestBidder",
      },
    ],
    query: { refetchInterval: phase === "REVEAL" ? 5000 : 30000 },
  });

  const chainPhase = (data?.[0]?.result as string) ?? "COMMIT";

  useEffect(() => {
    setPhase(chainPhase);
  }, [chainPhase]);

  const chainTimeLeft = data?.[1]?.result as
    | readonly [bigint, bigint]
    | undefined;
  const highestBid = (data?.[2]?.result as bigint) ?? 0n;
  const highestBidder = (data?.[3]?.result as string) ?? "";

  // Local countdown: sync from chain, then tick every second
  const [localCommitLeft, setLocalCommitLeft] = useState<number>(0);
  const [localRevealLeft, setLocalRevealLeft] = useState<number>(0);
  const syncedAt = useRef<number>(0);

  // Sync when chain data arrives
  useEffect(() => {
    if (chainTimeLeft) {
      setLocalCommitLeft(Number(chainTimeLeft[0]));
      setLocalRevealLeft(Number(chainTimeLeft[1]));
      syncedAt.current = Date.now();
    }
  }, [chainTimeLeft?.[0], chainTimeLeft?.[1]]);

  // Tick every second
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - syncedAt.current) / 1000);
      if (chainTimeLeft) {
        const newCommit = Math.max(0, Number(chainTimeLeft[0]) - elapsed);
        const newReveal = Math.max(0, Number(chainTimeLeft[1]) - elapsed);
        setLocalCommitLeft(newCommit);
        setLocalRevealLeft(newReveal);

        // Phase transition detected — refetch and proactively transition
        if (newCommit === 0 && phase === "COMMIT") {
          setPhase("REVEAL");
          refetch();
        } else if (newReveal === 0 && phase === "REVEAL") {
          setPhase("ENDED");
          refetch();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, chainTimeLeft, refetch]);

  const timeLeft: [bigint, bigint] = [
    BigInt(localCommitLeft),
    BigInt(localRevealLeft),
  ];

  return { phase, timeLeft, highestBid, highestBidder, refetch };
}
