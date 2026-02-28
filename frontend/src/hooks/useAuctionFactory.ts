import { useWriteContract, useReadContract } from "wagmi";
import { AUCTION_FACTORY_ABI, AUCTION_FACTORY_ADDRESS } from "../config/auction";

export function useCreateAuction() {
  const { writeContractAsync, isPending } = useWriteContract();

  const createAuction = async (
    title: string,
    commitDuration: number,
    revealDuration: number,
  ) => {
    return writeContractAsync({
      address: AUCTION_FACTORY_ADDRESS,
      abi: AUCTION_FACTORY_ABI,
      functionName: "createAuction",
      args: [title, BigInt(commitDuration), BigInt(revealDuration)],
    });
  };

  return { createAuction, isPending };
}

export function useAuctionList() {
  const { data, refetch, isLoading } = useReadContract({
    address: AUCTION_FACTORY_ADDRESS,
    abi: AUCTION_FACTORY_ABI,
    functionName: "getAuctions",
    query: { refetchInterval: 10000 },
  });

  const auctions = (data as {
    contractAddress: `0x${string}`;
    creator: `0x${string}`;
    title: string;
    createdAt: bigint;
  }[]) ?? [];

  return { auctions, refetch, isLoading };
}
