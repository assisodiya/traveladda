import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TravelAdda | Live Indian Railways PNR Status, Rail & Flight Portal",
    template: "%s | TravelAdda",
  },
  description:
    "Track live 10-digit Indian Railways PNR status, decode coach & berth numbers, explore scenic corridors, and read smart rail & air travel guides on TravelAdda.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
