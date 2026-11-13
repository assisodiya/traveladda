import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const viewport: Viewport = {
  themeColor: "#0a223d",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://traveladda.in"),
  applicationName: "TravelAdda",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/assets/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
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

  window.__taToggleTheme = function() {
    var now = Date.now();
    if (window.__taLastThemeToggle && now - window.__taLastThemeToggle < 150) return;
    window.__taLastThemeToggle = now;
    var nextDark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', nextDark);
    document.documentElement.style.colorScheme = nextDark ? 'dark' : 'light';
    try {
      localStorage.setItem('traveladda-theme', nextDark ? 'dark' : 'light');
    } catch (err) {}
  };

  document.addEventListener('click', function(e) {
    var target = e.target;
    if (!target || typeof target.closest !== 'function') return;

    var themeBtn = target.closest('[data-theme-toggle]');
    if (themeBtn) {
      window.__taToggleTheme();
      return;
    }

    var openDetails = document.querySelectorAll('header details[open]');
    if (!openDetails.length) return;

    var clickedLink = target.closest('header details[open] a[href]');
    for (var i = 0; i < openDetails.length; i++) {
      var d = openDetails[i];
      if (clickedLink || !d.contains(target)) {
        d.removeAttribute('open');
      }
    }
  });
})();
`;

const GLOBAL_AI_SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://traveladda.in/#organization",
      name: "TravelAdda",
      url: "https://traveladda.in",
      logo: {
        "@type": "ImageObject",
        url: "https://traveladda.in/assets/icon-512.png",
        width: 512,
        height: 512,
      },
      image: "https://traveladda.in/assets/TravelAdda-travel-logo.png",
      description:
        "Indian real-time transit and travel intelligence platform covering Delhi NCR Metro (12 lines, 262 stations), Indian Railways Live Train Running Status, 10-Digit IRCTC PNR Status, Reservation Chart Preparation Times, and Live Flight Tracking.",
    },
    {
      "@type": "WebSite",
      "@id": "https://traveladda.in/#website",
      name: "TravelAdda",
      url: "https://traveladda.in",
      publisher: {
        "@id": "https://traveladda.in/#organization",
      },
      inLanguage: "en-IN",
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", "h2", "article p"],
      },
      potentialAction: [
        {
          "@type": "SearchAction",
          name: "Search Delhi NCR Metro Route",
          target: {
            "@type": "EntryPoint",
            urlTemplate:
              "https://traveladda.in/delhi-metro?from={origin_slug}&to={destination_slug}",
          },
          "query-input": [
            "required name=origin_slug",
            "required name=destination_slug",
          ],
        },
        {
          "@type": "SearchAction",
          name: "Track Live Train Running Status",
          target: {
            "@type": "EntryPoint",
            urlTemplate:
              "https://traveladda.in/rail/live-status?train={train_number}",
          },
          "query-input": "required name=train_number",
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="alternate"
          type="text/plain"
          href="/llms.txt"
          title="LLM & Generative AI Agent Index (llms.txt)"
        />
        <link
          rel="alternate"
          type="text/plain"
          href="/llms-full.txt"
          title="Full LLM Knowledge Base (llms-full.txt)"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(GLOBAL_AI_SITE_JSON_LD).replace(
              /</g,
              "\\u003c",
            ),
          }}
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col bg-canvas text-ink antialiased">
        <Navbar />
        <div className="flex-1">
          <Suspense fallback={null}>{children}</Suspense>
        </div>
        <Footer />
      </body>
    </html>
  );
}
