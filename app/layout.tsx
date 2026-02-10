import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: " Sekar - Nền tảng xe ghép, xe tiện chuyến",
  description:
    "Kết nối hành khách và tài xế để chia sẻ chuyến đi một cách tiện lợi và tiết kiệm.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
