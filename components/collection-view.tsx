"use client";

import { useCallback, useEffect, useState } from "react";

import { Carousel_006 } from "@/components/skiper54";
import {
  DEFAULT_PALETTE,
  extractPalette,
  type ImagePalette,
} from "@/lib/extract-palette";
import type { CollectedMemory } from "@/lib/types";

type CollectionViewProps = {
  items: CollectedMemory[];
  onBack: () => void;
  onPaletteChange?: (palette: ImagePalette) => void;
};

export function CollectionView({
  items,
  onBack,
  onPaletteChange,
}: CollectionViewProps) {
  const [palette, setPalette] = useState<ImagePalette>(DEFAULT_PALETTE);

  const handleCurrentChange = useCallback(
    async (_index: number, image: { src: string }) => {
      const next = await extractPalette(image.src);
      setPalette(next);
      onPaletteChange?.(next);
    },
    [onPaletteChange],
  );

  useEffect(() => {
    if (items[0]) {
      void handleCurrentChange(0, items[0]);
    } else {
      setPalette(DEFAULT_PALETTE);
      onPaletteChange?.(DEFAULT_PALETTE);
    }
  }, [items, handleCurrentChange, onPaletteChange]);

  return (
    <section
      className="flex h-full min-h-dvh w-screen flex-col overflow-hidden transition-[background-color] duration-700 ease-out pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]"
      style={{ backgroundColor: palette.deep || "var(--color-surface-tile-1)" }}
    >
      <header className="relative z-10 flex items-center justify-between px-5 pb-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full bg-[rgba(210,210,215,0.28)] px-[15px] py-2 text-[14px] tracking-[-0.224px] text-white transition-transform active:scale-95"
        >
          Back
        </button>
        <p className="text-[21px] font-semibold tracking-[0.231px] text-white">
          Your deck
        </p>
        <span className="w-16 text-right text-[14px] tracking-[-0.224px] text-[var(--color-body-muted)]">
          {items.length}
        </span>
      </header>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <Carousel_006
          images={items.map((item) => ({
            src: item.src,
            alt: item.alt,
            title: item.title,
          }))}
          className=""
          tone="dark"
          loop={items.length > 1}
          showNavigation={items.length > 1}
          showPagination={items.length > 1}
          onCurrentChange={handleCurrentChange}
        />
      </div>
    </section>
  );
}
