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
  const [noteLoading, setNoteLoading] = useState(false);
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

  async function loadNoteFor(photo: MemoryPhoto) {
    setNoteLoading(true);
    try {
      const res = await fetch("/api/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: photo.id }),
      });
      if (!res.ok) throw new Error("note failed");
      const data = (await res.json()) as { title: string; note: string };
      setCurrent((prev) =>
        prev && prev.id === photo.id
          ? {
              ...prev,
              title: data.title,
              note: data.note,
              alt: data.title,
            }
          : prev,
      );
    } catch {
      setCurrent((prev) =>
        prev && prev.id === photo.id
          ? {
              ...prev,
              title: "This one",
              note: "Couldn't write a note just now — but I still love this frame.",
              alt: "This one",
            }
          : prev,
      );
    } finally {
      setNoteLoading(false);
    }
  }

  function pull() {
    if (pulling || photos.length === 0) return;
    setPulling(true);

    window.setTimeout(() => {
      const picked = weightedPick(photos, collectedIds);
      if (picked) {
        const existing = collection.find((item) => item.id === picked.id);
        const next = existing
          ? { ...picked, title: existing.title, note: existing.note, alt: existing.alt }
          : picked;
        setCurrent(next);
        setScreen("reveal");
        if (!existing?.note) {
          void loadNoteFor(next);
        } else {
          setNoteLoading(false);
        }
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

  const shellStyle =
    screen === "machine"
      ? {
          backgroundColor: "var(--color-canvas-parchment)",
          color: "var(--color-ink)",
        }
      : {
          backgroundColor: palette.deep || "var(--color-surface-tile-1)",
          color: "var(--color-body-on-dark)",
        };

  return (
    <div
      className="relative min-h-dvh overflow-hidden transition-[background-color] duration-700 ease-out"
      style={shellStyle}
    >
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {screen === "machine" && (
            <motion.div
              key="machine"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
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
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              className="flex min-h-dvh flex-col items-center justify-center px-5 py-8"
            >
              <MemoryCard
                photo={current}
                noteLoading={noteLoading}
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
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
