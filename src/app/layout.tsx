import type { Metadata, Viewport } from "next";

import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { WebLLMProvider } from '@/contexts/WebLLMContext';

export const metadata: Metadata = {
  title: "LocaLLM",
  description: "Run LLMs locally in your browser or on your machine with ease.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <WebLLMProvider>
          {children}
        </WebLLMProvider>
      </body>
    </html>
  );
}
