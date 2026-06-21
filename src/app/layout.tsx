import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "@/components/ui/Toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Jay Geli Ambe Maa Trader — Wholesale & Retail Supplies",
  description:
    "Shop disposable products, cleaning supplies, paper products, and more. Retail and wholesale pricing available. Fast delivery across India.",
  keywords: "disposable products, cleaning supplies, wholesale, bulk order, paper cups, garbage bags",
  openGraph: {
    title: "Jay Geli Ambe Maa Trader — Wholesale & Retail Supplies",
    description: "Shop 200+ products at retail and wholesale prices",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans">
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />

          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
