import { useReadContracts } from "wagmi";
import { ABI } from "../config/contract";

export function useVotingState(contractAddress: `0x${string}`) {
  const { data, refetch } = useReadContracts({
    contracts: [
      { address: contractAddress, abi: ABI, functionName: "currentPhase" },
      { address: contractAddress, abi: ABI, functionName: "timeLeft" },
      { address: contractAddress, abi: ABI, functionName: "getProposals" },
    ],
    query: { refetchInterval: 5000 },
  });

  const phase = (data?.[0]?.result as string) ?? "COMMIT";
  const timeLeft = data?.[1]?.result as [bigint, bigint] | undefined;
  const proposals = data?.[2]?.result as
    | { name: string; voteCount: bigint }[]
    | undefined;

  return { phase, timeLeft, proposals, refetch };
}
