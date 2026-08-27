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
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
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
            className="product-shadow absolute inset-0 overflow-hidden rounded-[18px] bg-[var(--color-canvas)]"
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
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-[18px] px-8 text-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: palette.deep,
            }}
          >
            <p className="apple-display text-[34px] tracking-[-0.374px] text-white">
              {photo.title}
            </p>
            <p className="text-[17px] leading-[1.47] tracking-[-0.374px] text-[var(--color-body-muted)]">
              {photo.note}
            </p>
            <p className="apple-fine text-[var(--color-body-muted)]">
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
            className="apple-caption text-[var(--color-body-muted)]"
          >
            Tap the card for a note
          </motion.p>
        )}
      </AnimatePresence>

      {onKeep && (
        <button type="button" onClick={onKeep} className="btn-primary w-full">
          {keepLabel}
        </button>
      )}
    </div>
  );
}
