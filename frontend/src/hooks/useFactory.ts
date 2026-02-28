import { useWriteContract, useReadContract } from "wagmi";
import { FACTORY_ABI, FACTORY_ADDRESS } from "../config/contract";

export function useCreateVote() {
  const { writeContractAsync, isPending } = useWriteContract();

  const createVote = async (
    title: string,
    proposals: string[],
    commitDuration: number,
    revealDuration: number,
  ) => {
    return writeContractAsync({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "createVote",
      args: [title, proposals, BigInt(commitDuration), BigInt(revealDuration)],
    });
  };

  return { createVote, isPending };
}

export function useVoteList() {
  const { data, refetch, isLoading } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "getVotes",
    query: { refetchInterval: 10000 },
  });

  const votes = (data as {
    contractAddress: `0x${string}`;
    creator: `0x${string}`;
    title: string;
    createdAt: bigint;
  }[]) ?? [];

  return { votes, refetch, isLoading };
}
