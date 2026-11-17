import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TravelAdda — Delhi Metro Route, Live Train Status & PNR",
    short_name: "TravelAdda",
    description:
      "100% Ad-Free & Safe daily travel companion: Check Delhi NCR Metro routes, fares & offline interchanges, Indian Railways live train running status, 10-digit PNR & flight status.",
    start_url: "/delhi-metro",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f2f5f9",
    theme_color: "#0a223d",
    categories: ["travel", "navigation", "utilities"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48 32x32 16x16",
        type: "image/x-icon",
      },
      {
        src: "/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: "/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/assets/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/assets/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/assets/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/assets/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Delhi Metro Route & Fare",
        short_name: "Metro Route",
        description: "Plan Delhi NCR Metro routes, interchanges & fares",
        url: "/delhi-metro",
        icons: [{ src: "/assets/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Live Train Running Status",
        short_name: "Train Status",
        description: "Spot your train live with platform & coach position",
        url: "/rail/live-status",
        icons: [{ src: "/assets/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "10-Digit IRCTC PNR Status",
        short_name: "PNR Check",
        description: "Check IRCTC PNR confirmation & chart status",
        url: "/rail/pnr-status",
        icons: [{ src: "/assets/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
