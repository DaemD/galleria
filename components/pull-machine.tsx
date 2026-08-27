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
    <section className="relative flex min-h-dvh flex-col bg-[var(--color-canvas-parchment)] px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="apple-display text-[28px] tracking-[-0.28px] text-[var(--color-ink)]">
            for you
          </p>
          <p className="apple-caption mt-1 text-[var(--color-ink-muted-48)]">
            {collectedCount} collected · {totalCount} in the pool
          </p>
        </div>
        <button type="button" onClick={onOpenCollection} className="btn-pearl">
          Deck
        </button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-10">
        <motion.div
          animate={pulling ? { scale: [1, 0.95, 1] } : { scale: 1 }}
          transition={{ duration: 0.45 }}
          className="relative flex size-56 items-center justify-center rounded-[18px] bg-[var(--color-canvas)] product-shadow"
        >
          <p className="apple-display text-[56px] text-[var(--color-ink)] max-[419px]:text-[40px]">
            ?
          </p>
          {newCount > 0 && (
            <span className="absolute -right-2 -top-2 rounded-full bg-[var(--color-primary)] px-2.5 py-1 text-[12px] font-normal tracking-[-0.12px] text-white">
              {newCount} new
            </span>
          )}
        </motion.div>

        <div className="max-w-xs space-y-2 text-center">
          <p className="apple-display text-[34px] tracking-[-0.374px] text-[var(--color-ink)] max-[640px]:text-[28px]">
            Pull a memory
          </p>
          <p className="text-[17px] leading-[1.47] tracking-[-0.374px] text-[var(--color-ink-muted-80)]">
            New photos land here first. Tap once — something of us comes out.
          </p>
        </div>
      </div>

      <div className="mb-2 flex flex-col items-center gap-3">
        <button
          type="button"
          disabled={pulling || totalCount === 0}
          onClick={onPull}
          className="btn-primary w-full max-w-sm py-[14px] text-[18px] font-light tracking-normal"
        >
          {pulling ? "Pulling…" : "Pull"}
        </button>
      </div>
    </section>
  );
}
