import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";

const inter = localFont({
  src: [
    { path: "../public/fonts/inter-variable-latin.woff2", weight: "100 900" },
    { path: "../public/fonts/inter-variable-vietnamese.woff2", weight: "100 900" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The No. 7 Archive | Ronaldo Gallery",
  description: "A visual archive of Cristiano Ronaldo's football career.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
