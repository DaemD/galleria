"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

import { CollectionView } from "@/components/collection-view";
import { MemoryCard } from "@/components/memory-card";
import { PassphraseGate } from "@/components/passphrase-gate";
import { PullMachine } from "@/components/pull-machine";
import {
  DEFAULT_PALETTE,
  type ImagePalette,
} from "@/lib/extract-palette";
import type { CollectedMemory, MemoryPhoto } from "@/lib/types";

const STORAGE_KEY = "galleria-collection-v1";

type Screen = "machine" | "reveal" | "collection";

function weightedPick(
  pool: MemoryPhoto[],
  collectedIds: Set<string>,
): MemoryPhoto | null {
  if (pool.length === 0) return null;

  const weights = pool.map((photo) =>
    collectedIds.has(photo.id) ? 1 : 6,
  );
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * total;

  for (let i = 0; i < pool.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return pool[i];
  }

  return pool[pool.length - 1];
}

export function GalleriaApp({ initiallyUnlocked }: { initiallyUnlocked: boolean }) {
  const [unlocked, setUnlocked] = useState(initiallyUnlocked);
  const [photos, setPhotos] = useState<MemoryPhoto[]>([]);
  const [collection, setCollection] = useState<CollectedMemory[]>([]);
  const [screen, setScreen] = useState<Screen>("machine");
  const [current, setCurrent] = useState<MemoryPhoto | null>(null);
  const [pulling, setPulling] = useState(false);
  const [ready, setReady] = useState(false);
  const [palette, setPalette] = useState<ImagePalette>(DEFAULT_PALETTE);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setCollection(JSON.parse(raw) as CollectedMemory[]);
      } catch {
        // ignore bad local data
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!unlocked) return;

    let cancelled = false;
    fetch("/api/photos")
      .then((res) => res.json())
      .then((data: { photos: MemoryPhoto[] }) => {
        if (!cancelled) setPhotos(data.photos ?? []);
      })
      .catch(() => {
        if (!cancelled) setPhotos([]);
      });

    return () => {
      cancelled = true;
    };
  }, [unlocked]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
  }, [collection, ready]);

  useEffect(() => {
    if (screen === "machine") {
      setPalette(DEFAULT_PALETTE);
    }
  }, [screen]);

  const onPaletteChange = useCallback((next: ImagePalette) => {
    setPalette(next);
  }, []);

  const collectedIds = useMemo(
    () => new Set(collection.map((item) => item.id)),
    [collection],
  );

  const newCount = photos.filter((photo) => !collectedIds.has(photo.id)).length;

  function pull() {
    if (pulling || photos.length === 0) return;
    setPulling(true);

    window.setTimeout(() => {
      const picked = weightedPick(photos, collectedIds);
      if (picked) {
        setCurrent(picked);
        setScreen("reveal");
      }
      setPulling(false);
    }, 650);
  }

  function keepCurrent() {
    if (!current) return;
    setCollection((prev) => {
      if (prev.some((item) => item.id === current.id)) return prev;
      return [
        { ...current, pulledAt: new Date().toISOString() },
        ...prev,
      ];
    });
    setCurrent(null);
    setScreen("machine");
  }

  if (!unlocked) {
    return <PassphraseGate onUnlocked={() => setUnlocked(true)} />;
  }

  const ambient =
    screen === "machine"
      ? {
          background: "radial-gradient(ellipse at top, #fff7ed 0%, #f5f4f3 50%, #ebe6df 100%)",
          color: "#2a241c",
        }
      : {
          background: `linear-gradient(180deg, ${palette.dominant} 0%, ${palette.deep} 65%, #090807 100%)`,
          color: "#f5f4f3",
        };

  return (
    <div
      className="relative min-h-dvh overflow-hidden transition-[background] duration-700 ease-out"
      style={ambient}
    >
      {screen === "machine" && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 top-32 size-72 rounded-full bg-[#f0c9a8]/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 bottom-28 size-80 rounded-full bg-[#c9d4c5]/35 blur-3xl"
          />
        </>
      )}

      {(screen === "reveal" || screen === "collection") && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-700"
          style={{
            background: `radial-gradient(ellipse at 50% 20%, ${palette.soft} 0%, transparent 55%)`,
          }}
        />
      )}

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {screen === "machine" && (
            <motion.div
              key="machine"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              <PullMachine
                newCount={newCount}
                collectedCount={collection.length}
                totalCount={photos.length}
                pulling={pulling}
                onPull={pull}
                onOpenCollection={() => setScreen("collection")}
              />
            </motion.div>
          )}

          {screen === "reveal" && current && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4 }}
              className="flex min-h-dvh flex-col items-center justify-center px-5 py-8"
            >
              <MemoryCard
                photo={current}
                onKeep={keepCurrent}
                onPaletteChange={onPaletteChange}
                keepLabel={
                  collectedIds.has(current.id)
                    ? "Already in deck · Back"
                    : "Keep in my deck"
                }
              />
            </motion.div>
          )}

          {screen === "collection" && (
            <motion.div
              key="collection"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              <CollectionView
                items={collection}
                onBack={() => setScreen("machine")}
                onPaletteChange={onPaletteChange}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
