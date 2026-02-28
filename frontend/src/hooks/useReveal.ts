import { useWriteContract } from "wagmi";
import { ABI } from "../config/contract";

export function useReveal(contractAddress: `0x${string}`) {
  const { writeContractAsync, isPending } = useWriteContract();

  const submitReveal = async (voteIndex: number, nonce: `0x${string}`) => {
    return writeContractAsync({
      address: contractAddress,
      abi: ABI,
      functionName: "reveal",
      args: [BigInt(voteIndex), nonce],
    });
  };

  return { submitReveal, isPending };
}
