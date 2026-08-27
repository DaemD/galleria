import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  const body = (await request.json()) as { passphrase?: string };
  const expected = process.env.APP_PASSPHRASE ?? "us";
  const given = (body.passphrase ?? "").trim();

  if (!given || !safeEqual(given, expected)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("galleria_gate", "open", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
