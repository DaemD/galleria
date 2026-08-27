"use client";

import { motion } from "framer-motion";

type PullMachineProps = {
  newCount: number;
  collectedCount: number;
  totalCount: number;
  pulling: boolean;
  onPull: () => void;
  onOpenCollection: () => void;
};

export function PullMachine({
  newCount,
  collectedCount,
  totalCount,
  pulling,
  onPull,
  onOpenCollection,
}: PullMachineProps) {
  return (
    <section className="relative flex min-h-dvh flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[#2a241c]">
            for you
          </p>
          <p className="mt-1 text-sm text-[#2a241c]/55">
            {collectedCount} collected · {totalCount} in the pool
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenCollection}
          className="rounded-full border border-black/10 bg-white/60 px-4 py-2 text-sm text-[#2a241c]/80 backdrop-blur"
        >
          Deck
        </button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <motion.div
          animate={
            pulling
              ? { scale: [1, 0.96, 1.04, 1], rotate: [0, -2, 2, 0] }
              : { scale: 1, rotate: 0 }
          }
          transition={{ duration: 0.7 }}
          className="relative flex size-56 items-center justify-center rounded-[2.5rem] bg-[linear-gradient(160deg,#fffaf4_0%,#efe6da_55%,#e4d5c4_100%)] shadow-[0_30px_60px_rgba(42,36,28,0.14)]"
        >
          <div className="absolute inset-4 rounded-[2rem] border border-black/5" />
          <div className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rounded-full bg-[#d7c4ae]" />
          <p className="font-[family-name:var(--font-display)] text-5xl text-[#2a241c]/90">
            ?
          </p>
          {newCount > 0 && (
            <span className="absolute -right-2 -top-2 rounded-full bg-[#9a4a3a] px-2.5 py-1 text-xs font-medium text-white">
              {newCount} new
            </span>
          )}
        </motion.div>

        <div className="max-w-xs text-center">
          <p className="font-[family-name:var(--font-display)] text-2xl text-[#2a241c]">
            Pull a memory
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#2a241c]/55">
            New photos land here first. Tap once — something of us comes out.
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={pulling || totalCount === 0}
        onClick={onPull}
        className="mb-2 w-full rounded-full bg-[#2a241c] py-4 text-base font-medium tracking-wide text-[#f5f4f3] disabled:opacity-40"
      >
        {pulling ? "Pulling…" : "Pull"}
      </button>
    </section>
  );
}
