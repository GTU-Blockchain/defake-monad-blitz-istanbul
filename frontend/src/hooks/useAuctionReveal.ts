import { useWriteContract } from "wagmi";
import { AUCTION_ABI } from "../config/auction";

export function useAuctionReveal(contractAddress: `0x${string}`) {
  const { writeContractAsync, isPending } = useWriteContract();

  const submitReveal = async (amountStr: string, nonce: `0x${string}`) => {
    return writeContractAsync({
      address: contractAddress,
      abi: AUCTION_ABI,
      functionName: "revealBid",
      args: [BigInt(amountStr), nonce],
    });
  };

  return { submitReveal, isPending };
}
