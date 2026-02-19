import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "StockBoard — Live Aquarium Livestock Availability",
    template: "%s | StockBoard",
  },
  description:
    "Real-time livestock availability boards for local fish stores and aquarium breeders.",
  keywords: ["aquarium", "fish", "livestock", "LFS", "coral", "shrimp"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "StockBoard",
  },
};

export const viewport: Viewport = {
  themeColor: "#1B6B4A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
