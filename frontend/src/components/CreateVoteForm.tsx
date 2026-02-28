import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateVote } from "../hooks/useFactory";
import { decodeEventLog } from "viem";
import { usePublicClient } from "wagmi";
import { FACTORY_ABI } from "../config/contract";

export function CreateVoteForm() {
  const navigate = useNavigate();
  const { createVote, isPending } = useCreateVote();
  const publicClient = usePublicClient();

  const [title, setTitle] = useState("");
  const [proposals, setProposals] = useState(["", ""]);
  const [commitMinutes, setCommitMinutes] = useState(120);
  const [revealMinutes, setRevealMinutes] = useState(60);
  const [error, setError] = useState("");

  const addProposal = () => {
    if (proposals.length < 10) {
      setProposals([...proposals, ""]);
    }
  };

  const removeProposal = (index: number) => {
    if (proposals.length > 2) {
      setProposals(proposals.filter((_, i) => i !== index));
    }
  };

  const updateProposal = (index: number, value: string) => {
    const updated = [...proposals];
    updated[index] = value;
    setProposals(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedTitle = title.trim();
    const trimmedProposals = proposals.map((p) => p.trim()).filter(Boolean);

    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }
    if (trimmedProposals.length < 2) {
      setError("At least 2 proposals are required.");
      return;
    }
    if (commitMinutes < 1 || revealMinutes < 1) {
      setError("Durations must be at least 1 minute.");
      return;
    }

    try {
      const hash = await createVote(
        trimmedTitle,
        trimmedProposals,
        commitMinutes * 60,
        revealMinutes * 60,
      );

      const receipt = await publicClient!.waitForTransactionReceipt({ hash });

      const voteCreatedLog = receipt.logs.find((log) => {
        try {
          const decoded = decodeEventLog({
            abi: FACTORY_ABI,
            data: log.data,
            topics: log.topics,
          });
          return decoded.eventName === "VoteCreated";
        } catch {
          return false;
        }
      });

      if (voteCreatedLog) {
        const decoded = decodeEventLog({
          abi: FACTORY_ABI,
          data: voteCreatedLog.data,
          topics: voteCreatedLog.topics,
        });
        const args = decoded.args as { contractAddress?: string } | undefined;
        if (args?.contractAddress) {
          navigate(`/vote/${args.contractAddress}`);
          return;
        }
      }

      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError(err.shortMessage || err.message || "Transaction failed.");
    }
  };

  return (
    <div className="bg-background/60 backdrop-blur-md p-6 rounded-sm border border-border shadow-2xl w-full relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"></div>

      <h3 className="text-xl font-bold font-mono tracking-widest uppercase mb-6 text-foreground/90">
        Create New Vote
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-mono text-muted-foreground mb-1 uppercase tracking-wider">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Best Framework 2026"
            className="w-full bg-muted/30 border border-border rounded-sm px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-mono text-muted-foreground mb-2 uppercase tracking-wider">
            Proposals
          </label>
          <div className="space-y-2">
            {proposals.map((p, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={p}
                  onChange={(e) => updateProposal(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 bg-muted/30 border border-border rounded-sm px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent"
                />
                {proposals.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeProposal(i)}
                    className="px-3 py-2 border border-red-500/30 text-red-400 rounded-sm hover:bg-red-500/10 transition-colors font-mono text-sm"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
          </div>
          {proposals.length < 10 && (
            <button
              type="button"
              onClick={addProposal}
              className="mt-2 text-sm font-mono text-accent hover:text-accent/80 transition-colors"
            >
              + Add Option
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-mono text-muted-foreground mb-1 uppercase tracking-wider">
              Commit (min)
            </label>
            <input
              type="number"
              min={1}
              value={commitMinutes}
              onChange={(e) => setCommitMinutes(Number(e.target.value))}
              className="w-full bg-muted/30 border border-border rounded-sm px-3 py-2 text-foreground focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-mono text-muted-foreground mb-1 uppercase tracking-wider">
              Reveal (min)
            </label>
            <input
              type="number"
              min={1}
              value={revealMinutes}
              onChange={(e) => setRevealMinutes(Number(e.target.value))}
              className="w-full bg-muted/30 border border-border rounded-sm px-3 py-2 text-foreground focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-sm font-mono">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full tracking-widest uppercase font-mono text-sm bg-transparent border border-accent text-accent hover:bg-accent hover:text-white disabled:bg-muted disabled:border-border disabled:text-muted-foreground py-3 px-4 rounded-sm transition-all duration-300"
        >
          {isPending ? "Creating..." : "Create Vote"}
        </button>
      </form>
    </div>
  );
}
