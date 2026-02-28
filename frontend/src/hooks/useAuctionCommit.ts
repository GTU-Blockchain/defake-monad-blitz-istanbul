import { keccak256, encodePacked, toHex } from "viem";
import { useWriteContract } from "wagmi";
import { AUCTION_ABI } from "../config/auction";

function storageKey(contractAddress: string) {
  return `auction_commit_secret_${contractAddress}`;
}

export function useAuctionCommit(contractAddress: `0x${string}`) {
  const { writeContractAsync, isPending } = useWriteContract();

  const submitCommit = async (
    bidAmountStr: string,
    depositAmountStr: string,
    bidderAddress: `0x${string}`,
  ) => {
    // Generate random 32-byte nonce
    const rawNonce = crypto.getRandomValues(new Uint8Array(32));
    const nonce = toHex(rawNonce) as `0x${string}`;

    // Convert string inputs to BigInt natively since they represent wei usually
    // Assuming bidAmountStr is already parsed to wei externally
    const bidAmount = BigInt(bidAmountStr);
    const depositAmount = BigInt(depositAmountStr);

    // Keccak256(abi.encodePacked(_amount, _nonce, msg.sender))
    const hash = keccak256(
      encodePacked(
        ["uint256", "bytes32", "address"],
        [bidAmount, nonce, bidderAddress],
      ),
    );

    const txHash = await writeContractAsync({
      address: contractAddress,
      abi: AUCTION_ABI,
      functionName: "commitBid",
      args: [hash],
      value: depositAmount,
    });

    // Save strictly required secret info to localStorage so we can reveal later
    // Storing it after wallet confirmation to avoid cluttering on rejection
    localStorage.setItem(
      storageKey(contractAddress),
      JSON.stringify({ bidAmountStr, nonce, hash }),
    );

    return txHash;
  };

  const getStoredSecret = () => {
    const raw = localStorage.getItem(storageKey(contractAddress));
    return raw
      ? (JSON.parse(raw) as {
          bidAmountStr: string;
          nonce: `0x${string}`;
          hash: `0x${string}`;
        })
      : null;
  };

  return { submitCommit, getStoredSecret, isPending };
}
