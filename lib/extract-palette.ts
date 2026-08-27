"use client";

/**
 * Extract a Spotify-like palette from an image URL (same-origin).
 * Samples pixels, prefers saturated mid-tones, returns CSS-ready colors.
 */

export type ImagePalette = {
  dominant: string;
  soft: string;
  deep: string;
  muted: string;
  isDark: boolean;
};

const FALLBACK: ImagePalette = {
  dominant: "#272729",
  soft: "#2a2a2c",
  deep: "#252527",
  muted: "#7a7a7a",
  isDark: true,
};

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    default:
      h = ((r - g) / d + 4) / 6;
  }
  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number) {
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

function toCss({ r, g, b }: { r: number; g: number; b: number }) {
  return `rgb(${r}, ${g}, ${b})`;
}

function scorePixel(r: number, g: number, b: number) {
  const { s, l } = rgbToHsl(r, g, b);
  if (l < 0.12 || l > 0.92) return 0;
  if (s < 0.08) return l * 0.15;
  return s * 1.6 + (1 - Math.abs(l - 0.45)) * 0.8;
}

const cache = new Map<string, ImagePalette>();

export async function extractPalette(src: string): Promise<ImagePalette> {
  if (cache.has(src)) return cache.get(src)!;

  try {
    const img = await loadImage(src);
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return FALLBACK;

    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);

    let best = { r: 196, g: 181, b: 165, score: -1 };
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    let count = 0;

    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 200) continue;

      sumR += r;
      sumG += g;
      sumB += b;
      count += 1;

      const score = scorePixel(r, g, b);
      if (score > best.score) best = { r, g, b, score };
    }

    if (count === 0) return FALLBACK;

    const avg = {
      r: Math.round(sumR / count),
      g: Math.round(sumG / count),
      b: Math.round(sumB / count),
    };

    const dominantRgb =
      best.score > 0.2
        ? { r: best.r, g: best.g, b: best.b }
        : avg;

    const hsl = rgbToHsl(dominantRgb.r, dominantRgb.g, dominantRgb.b);
    const soft = hslToRgb(hsl.h, Math.min(1, hsl.s * 0.55), Math.min(0.88, hsl.l + 0.28));
    const deep = hslToRgb(hsl.h, Math.min(1, hsl.s * 0.75), Math.max(0.08, hsl.l * 0.22));
    const muted = hslToRgb(hsl.h, Math.min(0.45, hsl.s * 0.5), 0.42);

    const palette: ImagePalette = {
      dominant: toCss(dominantRgb),
      soft: toCss(soft),
      deep: toCss(deep),
      muted: toCss(muted),
      isDark: hsl.l < 0.45,
    };

    cache.set(src, palette);
    return palette;
  } catch {
    return FALLBACK;
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

export { FALLBACK as DEFAULT_PALETTE };
