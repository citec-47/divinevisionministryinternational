import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

/**
 * Root layout for the staff area.
 *
 * The admin gets its own <html> rather than inheriting the public site's
 * header, footer, and locale routing. It is English-only on purpose: the people
 * using it are a handful of church staff, and translating an internal tool is
 * effort better spent on the pages visitors actually read.
 */
export const metadata: Metadata = {
  title: "Admin — Divine Vision",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
