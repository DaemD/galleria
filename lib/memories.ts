import { readdir } from "fs/promises";
import path from "path";

import notes from "@/data/notes.json";
import type { MemoryPhoto } from "@/lib/types";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

export async function loadMemories(): Promise<MemoryPhoto[]> {
  const dir = path.join(process.cwd(), "public", "photos");
  const files = await readdir(dir);
  const noteMap = notes as Record<string, { title?: string; note?: string }>;

  return files
    .filter((file) => IMAGE_EXT.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((file) => {
      const id = path.parse(file).name;
      const meta = noteMap[id] ?? {};
      return {
        id,
        src: `/photos/${encodeURIComponent(file)}`,
        alt: meta.title ?? `Memory ${id}`,
        title: meta.title ?? `Memory ${id}`,
        note: meta.note ?? "A little piece of us.",
      };
    });
}
