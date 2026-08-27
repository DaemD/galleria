import { NextResponse } from "next/server";

import { loadMemories } from "@/lib/memories";

export async function GET() {
  try {
    const photos = await loadMemories();
    return NextResponse.json({ photos });
  } catch {
    return NextResponse.json(
      { photos: [], error: "Could not load photos" },
      { status: 500 },
    );
  }
}
