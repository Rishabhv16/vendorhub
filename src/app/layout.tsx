import type { Metadata } from "next";
import "./globals.css";
import FirebaseProvider from "@/components/FirebaseProvider";

export const metadata: Metadata = {
  title: "VendorHub — Hyperlocal Multi-Vendor Marketplace",
  description: "Discover local vendors, shop unique products, and support your community with VendorHub — the hyperlocal multi-vendor e-commerce platform.",
  keywords: "marketplace, vendors, local shopping, e-commerce, hyperlocal",
  openGraph: {
    title: "VendorHub",
    description: "Shop local. Support vendors. Discover unique products.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <FirebaseProvider>
          {children}
        </FirebaseProvider>
      </body>
    </html>
  );
}

