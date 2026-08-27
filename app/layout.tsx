import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const apple = Inter({
  variable: "--font-apple",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "for you",
  description: "A little machine of our memories.",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f5f5f7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${apple.variable} h-full`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
