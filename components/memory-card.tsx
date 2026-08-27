"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import {
  DEFAULT_PALETTE,
  extractPalette,
  type ImagePalette,
} from "@/lib/extract-palette";
import type { MemoryPhoto } from "@/lib/types";

type MemoryCardProps = {
  photo: MemoryPhoto;
  onKeep?: () => void;
  keepLabel?: string;
  onPaletteChange?: (palette: ImagePalette) => void;
};

export function MemoryCard({
  photo,
  onKeep,
  keepLabel = "Keep in my deck",
  onPaletteChange,
}: MemoryCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [palette, setPalette] = useState<ImagePalette>(DEFAULT_PALETTE);

  useEffect(() => {
    let cancelled = false;
    extractPalette(photo.src).then((next) => {
      if (cancelled) return;
      setPalette(next);
      onPaletteChange?.(next);
    });
    return () => {
      cancelled = true;
    };
  }, [photo.src, onPaletteChange]);

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5">
      <button
        type="button"
        onClick={() => setFlipped((v) => !v)}
        className="relative h-[58vh] w-full max-h-[420px]"
        style={{ perspective: 1200 }}
        aria-label={flipped ? "Show photo" : "Show note"}
      >
        <motion.div
          className="relative h-full w-full"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="absolute inset-0 overflow-hidden rounded-[1.75rem] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.alt}
              className="h-full w-full object-cover"
            />
          </div>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-[1.75rem] px-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: `linear-gradient(160deg, ${palette.deep} 0%, ${palette.dominant} 100%)`,
            }}
          >
            <p className="font-[family-name:var(--font-display)] text-3xl text-white">
              {photo.title}
            </p>
            <p className="text-base leading-relaxed text-white/85">
              {photo.note}
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">
              tap to flip back
            </p>
          </div>
        </motion.div>
      </button>

      <AnimatePresence>
        {!flipped && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-white/70"
          >
            Tap the card for a note
          </motion.p>
        )}
      </AnimatePresence>

      {onKeep && (
        <button
          type="button"
          onClick={onKeep}
          className="w-full rounded-full bg-white/95 px-6 py-3.5 text-sm font-medium text-black"
        >
          {keepLabel}
        </button>
      )}
    </div>
  );
}
