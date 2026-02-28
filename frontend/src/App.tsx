import { useState } from "react";
import { Routes, Route, Link, useParams } from "react-router-dom";
import { PhaseBanner } from "./components/PhaseBanner";
import { CommitForm } from "./components/CommitForm";
import { RevealForm } from "./components/RevealForm";
import { ResultsDisplay } from "./components/ResultsDisplay";
import { VoteList } from "./components/VoteList";
import { CreateVoteForm } from "./components/CreateVoteForm";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

function HomePage() {
  const { isConnected } = useAccount();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <main className="w-full max-w-4xl flex flex-col md:flex-row gap-8">
      <div className="flex-1">
        <VoteList />
      </div>
      <div className="flex-1">
        {!isConnected ? (
          <div className="bg-black/40 backdrop-blur-md border border-border p-8 rounded-xl shadow-lg text-center text-muted-foreground font-mono">
            Connect your wallet to create a vote.
          </div>
        ) : showCreate ? (
          <CreateVoteForm />
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="w-full tracking-widest uppercase font-mono text-sm bg-transparent border border-accent text-accent hover:bg-accent hover:text-white py-3 px-4 rounded-sm transition-all duration-300"
          >
            Create New Vote
          </button>
        )}
      </div>
    </main>
  );
}

function VoteDetailPage() {
  const { address } = useParams<{ address: string }>();
  const { isConnected } = useAccount();

  const contractAddress = address as `0x${string}`;

  return (
    <main className="w-full max-w-4xl">
      <Link
        to="/"
        className="inline-block mb-6 text-sm font-mono text-accent hover:text-accent/80 transition-colors"
      >
        &larr; Back to Votes
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 flex flex-col">
          <PhaseBanner contractAddress={contractAddress} />
          {!isConnected ? (
            <div className="bg-black/40 backdrop-blur-md border border-border p-8 rounded-xl shadow-lg text-center text-muted-foreground font-mono">
              Please connect your wallet to participate.
            </div>
          ) : (
            <>
              <CommitForm contractAddress={contractAddress} />
              <RevealForm contractAddress={contractAddress} />
            </>
          )}
        </div>

        <div className="flex-1">
          <ResultsDisplay contractAddress={contractAddress} />
        </div>
      </div>
    </main>
  );
}

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-transparent text-foreground">
      <header className="w-full max-w-4xl flex justify-between items-center mb-10 border-b border-border pb-4">
        <Link to="/" className="flex items-center gap-3">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white">
            <path d="M12 2L2 22h20L12 2z" fill="currentColor" />
          </svg>
          <h1 className="text-2xl font-bold text-white tracking-widest font-mono uppercase">
            Monad Blitz
          </h1>
        </Link>
        <ConnectButton />
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/vote/:address" element={<VoteDetailPage />} />
      </Routes>
    </div>
  );
}

export default App;
