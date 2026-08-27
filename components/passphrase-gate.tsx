"use client";

import { FormEvent, useState } from "react";

type PassphraseGateProps = {
  onUnlocked: () => void;
};

export function PassphraseGate({ onUnlocked }: PassphraseGateProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch("/api/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passphrase: value }),
    });

    setLoading(false);

    if (!res.ok) {
      setError(true);
      return;
    }

    onUnlocked();
  }

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#fff7ed_0%,_#f5f4f3_45%,_#ebe6df_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-24 size-64 rounded-full bg-[#f0c9a8]/35 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-20 size-72 rounded-full bg-[#c9d4c5]/40 blur-3xl"
      />

      <form
        onSubmit={onSubmit}
        className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6 text-center"
      >
        {/* Decorative mark — soft hint, not a caption */}
        <div className="mb-1 opacity-[0.55] grayscale-[35%] contrast-75">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hint-panda.png"
            alt=""
            width={88}
            height={88}
            draggable={false}
            className="pointer-events-none mx-auto select-none"
          />
        </div>

        <p className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-[#2a241c]">
          for you
        </p>
        <p className="max-w-[18rem] text-sm leading-relaxed text-[#2a241c]/65">
          A little machine of our memories. Enter the word only you know.
        </p>
        <input
          type="password"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="passphrase"
          className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3.5 text-center text-base text-[#2a241c] outline-none backdrop-blur placeholder:text-black/30 focus:border-black/25"
        />
        {error && (
          <p className="text-sm text-[#9a4a3a]">Not that one. Try again.</p>
        )}
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="w-full rounded-full bg-[#2a241c] px-6 py-3.5 text-sm font-medium tracking-wide text-[#f5f4f3] disabled:opacity-40"
        >
          {loading ? "Opening…" : "Open"}
        </button>
      </form>
    </main>
  );
}
