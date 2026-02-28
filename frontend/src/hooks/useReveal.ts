import { useWriteContract } from "wagmi";
import { ABI, CONTRACT_ADDRESS } from "../config/contract";

export function useReveal() {
  const { writeContractAsync, isPending } = useWriteContract();

  const submitReveal = async (voteIndex: number, nonce: `0x${string}`) => {
    return writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: "reveal",
      args: [BigInt(voteIndex), nonce],
    });
  };

  return { submitReveal, isPending };
}
