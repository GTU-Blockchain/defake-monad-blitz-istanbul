import { keccak256, encodePacked, toHex } from "viem";
import { useWriteContract } from "wagmi";
import { ABI } from "../config/contract";

function storageKey(contractAddress: string) {
  return `commit_reveal_secret_${contractAddress}`;
}

export function useCommit(contractAddress: `0x${string}`) {
  const { writeContractAsync, isPending } = useWriteContract();

  const submitCommit = async (
    voteIndex: number,
    voterAddress: `0x${string}`,
  ) => {
    const rawNonce = crypto.getRandomValues(new Uint8Array(32));
    const nonce = toHex(rawNonce) as `0x${string}`;

    const hash = keccak256(
      encodePacked(
        ["uint256", "bytes32", "address"],
        [BigInt(voteIndex), nonce, voterAddress],
      ),
    );

    localStorage.setItem(
      storageKey(contractAddress),
      JSON.stringify({ voteIndex, nonce, hash }),
    );

    return writeContractAsync({
      address: contractAddress,
      abi: ABI,
      functionName: "commit",
      args: [hash],
    });
  };

  const getStoredSecret = () => {
    const raw = localStorage.getItem(storageKey(contractAddress));
    return raw
      ? (JSON.parse(raw) as {
          voteIndex: number;
          nonce: `0x${string}`;
          hash: `0x${string}`;
        })
      : null;
  };

  return { submitCommit, getStoredSecret, isPending };
}
