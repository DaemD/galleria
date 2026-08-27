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
    <main className="relative flex min-h-dvh flex-col items-center justify-center bg-[var(--color-canvas-parchment)] px-6">
      <form
        onSubmit={onSubmit}
        className="relative z-10 flex w-full max-w-[420px] flex-col items-center gap-6 text-center"
      >
        <div className="opacity-50 grayscale-[40%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hint-panda.png"
            alt=""
            width={72}
            height={72}
            draggable={false}
            className="pointer-events-none mx-auto select-none"
          />
        </div>

        <div className="space-y-3">
          <h1 className="apple-display text-[40px] text-[var(--color-ink)] max-[640px]:text-[34px]">
            for you
          </h1>
          <p className="mx-auto max-w-[18rem] text-[17px] leading-[1.47] tracking-[-0.374px] text-[var(--color-ink-muted-80)]">
            A little machine of our memories. Enter the word only you know.
          </p>
        </div>

        <input
          type="password"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="passphrase"
          className="input-pill"
        />

        {error && (
          <p className="apple-caption text-[var(--color-ink-muted-48)]">
            Not that one. Try again.
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="btn-primary w-full max-w-xs"
        >
          {loading ? "Opening…" : "Open"}
        </button>
      </form>
    </main>
  );
}
