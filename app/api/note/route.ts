import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { generateNoteForPhoto } from "@/lib/generate-note";

export async function POST(request: Request) {
  const jar = await cookies();
  if (jar.get("galleria_gate")?.value !== "open") {
    return NextResponse.json({ error: "Locked" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is missing" },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as { id?: string };
    const id = body.id?.trim();
    if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const note = await generateNoteForPhoto(id);
    return NextResponse.json(note);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not generate note";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
