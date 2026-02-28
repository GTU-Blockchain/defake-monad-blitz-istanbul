import React from "react";
import { PhaseBanner } from "./components/PhaseBanner";
import { CommitForm } from "./components/CommitForm";
import { RevealForm } from "./components/RevealForm";
import { ResultsDisplay } from "./components/ResultsDisplay";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

function App() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-transparent text-foreground">
      <header className="w-full max-w-4xl flex justify-between items-center mb-10 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white">
            <path d="M12 2L2 22h20L12 2z" fill="currentColor" />
          </svg>
          <h1 className="text-2xl font-bold text-white tracking-widest font-mono uppercase">
            Monad Blitz
          </h1>
        </div>
        <ConnectButton />
      </header>

      <main className="w-full max-w-4xl flex flex-col md:flex-row gap-8">
        <div className="flex-1 flex flex-col">
          <PhaseBanner />
          {!isConnected ? (
            <div className="bg-black/40 backdrop-blur-md border border-border p-8 rounded-xl shadow-lg text-center text-muted-foreground font-mono">
              Please connect your wallet to participate.
            </div>
          ) : (
            <>
              <CommitForm />
              <RevealForm />
            </>
          )}
        </div>

        <div className="flex-1">
          <ResultsDisplay />
        </div>
      </main>
    </div>
  );
}

export default App;
