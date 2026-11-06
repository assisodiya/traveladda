import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0a223d",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://traveladda.in"),
  applicationName: "TravelAdda",
  title: {
    default:
      "TravelAdda | Live Flight Status, Train Running Status, PNR & Travel Tools",
    template: "%s | TravelAdda",
  },
  description:
    "Check live flight status, airport terminals & gates, track Indian Railways live train running status with coach position, verify 10-digit IRCTC PNR status, and calculate baggage & hotel GST on TravelAdda.",
  keywords: [
    "TravelAdda",
    "live flight status",
    "flight tracker",
    "live train running status",
    "spot your train",
    "PNR status check",
    "Indian Railways live train tracker",
    "coach position",
    "flight baggage allowance",
    "hotel GST calculator",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "TravelAdda",
    title: "TravelAdda | Live Flight Status, Train Status, PNR & Travel Tools",
    description:
      "Simple, fast live flight tracker, Indian Railways running status, 10-digit PNR confirmation, coach rake order, baggage & hotel GST tools.",
    images: [
      {
        url: "/assets/TravelAdda-travel-logo.png",
        width: 2056,
        height: 765,
        alt: "TravelAdda Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TravelAdda | Live Flight Status, Train Status, PNR & Travel Tools",
    description:
      "Simple, fast live flight tracker, Indian Railways running status, 10-digit PNR confirmation, coach rake order, baggage & hotel GST tools.",
    images: ["/assets/TravelAdda-travel-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

const THEME_INIT_SCRIPT = `
(function() {
  try {
    var saved = localStorage.getItem('traveladda-theme');
    var useDark = saved === 'dark';
    document.documentElement.classList.toggle('dark', useDark);
    document.documentElement.style.colorScheme = useDark ? 'dark' : 'light';
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col bg-canvas text-ink antialiased">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
