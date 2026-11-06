import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://traveladda.in"),
  title: {
    default:
      "TravelAdda | Live Train Running Status, PNR Check, Air & Hotel Portal",
    template: "%s | TravelAdda",
  },
  description:
    "Track live Indian Railways train running status with blinking GPS station radar, check 10-digit IRCTC PNR status, flight baggage allowances, and hotel GST tariffs on TravelAdda.",
  keywords: [
    "TravelAdda",
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
    title: "TravelAdda | Live Train Running Status, PNR & Smart Travel Tools",
    description:
      "Real-time Indian Railways train radar, 10-digit PNR confirmation, coach rake order, flight baggage & hotel GST utilities.",
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
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var useDark = saved === 'dark' || (!saved && prefersDark);
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
