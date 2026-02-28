import { useParams, Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { AuctionPhaseBanner } from "./AuctionPhaseBanner";
import { AuctionCommitForm } from "./AuctionCommitForm";
import { AuctionRevealForm } from "./AuctionRevealForm";
import { AuctionResultsDisplay } from "./AuctionResultsDisplay";

function ContractInfo({
  contractAddress,
  isAuction = false,
}: {
  contractAddress: `0x${string}`;
  isAuction?: boolean;
}) {
  const short = `${contractAddress.slice(0, 8)}...${contractAddress.slice(-6)}`;
  return (
    <div className="flex items-center gap-3 mb-6 p-4 bg-muted/20 border border-border rounded-sm">
      <div
        className={`w-10 h-10 rounded-sm flex items-center justify-center bg-background border border-border shrink-0`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={`w-5 h-5 ${isAuction ? "text-purple-400" : "text-accent"}`}
        >
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M9 12l2 2 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
          Contract
        </p>
        <p className="text-sm font-mono text-foreground/80 truncate">{short}</p>
      </div>
    </div>
  );
}

export function AuctionDetailPage() {
  const { address } = useParams<{ address: string }>();
  const { isConnected } = useAccount();

  const contractAddress = address as `0x${string}`;

  return (
    <main className="w-full max-w-2xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 mb-6 text-sm font-mono text-muted-foreground hover:text-purple-400 transition-colors group"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-4 h-4 transition-transform group-hover:-translate-x-1"
        >
          <path
            d="M19 12H5M12 19l-7-7 7-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to Home
      </Link>

      <ContractInfo contractAddress={contractAddress} isAuction />

      <AuctionPhaseBanner contractAddress={contractAddress} />

      {!isConnected ? (
        <div className="bg-background/60 backdrop-blur-md border border-border p-10 rounded-sm shadow-lg text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30"></div>
          <div className="w-14 h-14 rounded-full bg-muted/50 border border-border flex items-center justify-center mx-auto mb-4">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-7 h-7 text-muted-foreground"
            >
              <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M7 11V7a5 5 0 0110 0v4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="text-foreground/80 font-mono text-sm mb-1">
            Wallet Not Connected
          </p>
          <p className="text-muted-foreground text-xs">
            Connect your wallet to participate in this auction.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <AuctionCommitForm contractAddress={contractAddress} />
          <AuctionRevealForm contractAddress={contractAddress} />
          <AuctionResultsDisplay contractAddress={contractAddress} />
        </div>
      )}
    </main>
  );
}
