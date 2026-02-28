import { useReadContracts } from "wagmi";
import { ABI, CONTRACT_ADDRESS } from "../config/contract";

export function useVotingState() {
  const { data, refetch } = useReadContracts({
    contracts: [
      { address: CONTRACT_ADDRESS, abi: ABI, functionName: "currentPhase" },
      { address: CONTRACT_ADDRESS, abi: ABI, functionName: "timeLeft" },
      { address: CONTRACT_ADDRESS, abi: ABI, functionName: "getProposals" },
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
