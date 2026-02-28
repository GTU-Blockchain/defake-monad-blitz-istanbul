import { keccak256, encodePacked, toHex } from "viem";
import { useWriteContract } from "wagmi";
import { ABI, CONTRACT_ADDRESS } from "../config/contract";

const STORAGE_KEY = "commit_reveal_secret";

export function useCommit() {
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

    // Persist secret — user MUST keep this to reveal
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ voteIndex, nonce, hash }),
    );

    return writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: "commit",
      args: [hash],
    });
  };

  const getStoredSecret = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
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
