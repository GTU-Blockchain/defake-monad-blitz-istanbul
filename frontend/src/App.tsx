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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <header className="w-full max-w-4xl flex justify-between items-center mb-10">
        <h1 className="text-3xl font-extrabold text-blue-800 tracking-tight">
          Monad Blitz Voting
        </h1>
        <ConnectButton />
      </header>

      <main className="w-full max-w-4xl flex flex-col md:flex-row gap-8">
        <div className="flex-1 flex flex-col">
          <PhaseBanner />
          {!isConnected ? (
            <div className="bg-white p-8 rounded-xl shadow-md text-center text-gray-500">
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
