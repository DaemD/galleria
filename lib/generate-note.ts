import { readFile } from "fs/promises";
import path from "path";

export type GeneratedNote = {
  title: string;
  note: string;
};

const cache = new Map<string, GeneratedNote>();

const EXT_CANDIDATES = [".jpeg", ".jpg", ".png", ".webp", ".gif"];

function mimeFor(ext: string) {
  switch (ext.toLowerCase()) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    default:
      return "image/jpeg";
  }
}

async function readPhotoAsDataUrl(id: string) {
  const dir = path.join(process.cwd(), "public", "photos");
  for (const ext of EXT_CANDIDATES) {
    const filePath = path.join(dir, `${id}${ext}`);
    try {
      const buf = await readFile(filePath);
      const b64 = buf.toString("base64");
      return `data:${mimeFor(ext)};base64,${b64}`;
    } catch {
      // try next extension
    }
  }
  throw new Error(`Photo not found for id ${id}`);
}

function parseModelJson(raw: string): GeneratedNote {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "");
  const parsed = JSON.parse(cleaned) as { title?: string; note?: string };
  const title = (parsed.title ?? "Us").trim().slice(0, 48);
  const note = (parsed.note ?? "A little piece of us.").trim().slice(0, 280);
  return { title, note };
}

export async function generateNoteForPhoto(id: string): Promise<GeneratedNote> {
  const hit = cache.get(id);
  if (hit) return hit;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const dataUrl = await readPhotoAsDataUrl(id);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.9,
      max_tokens: 180,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You write short intimate notes for the back of a private photo shared with a girlfriend. Look carefully at the image. Speak in second person (you). Warm, specific, playful, never generic AI fluff. No hashtags. No emojis unless one feels natural. Return JSON only with keys title and note. title: 2-4 words. note: 1-2 short sentences.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Write a title and note for the back of this memory photo.",
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
                detail: "low",
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${errText.slice(0, 200)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty OpenAI response");

  const note = parseModelJson(content);
  cache.set(id, note);
  return note;
}

export function getCachedNote(id: string) {
  return cache.get(id);
}
