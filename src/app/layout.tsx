import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "TravelAdda | Flight & Train Travel Tools", template: "%s | TravelAdda" },
  description: "Discover TravelAdda, a growing collection of flight and train travel tools to help you plan your next journey.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="antialiased">{children}</body></html>;
}
