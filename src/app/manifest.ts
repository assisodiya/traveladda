import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TravelAdda — Live Flight Status, Train Running Status & PNR Check",
    short_name: "TravelAdda",
    description:
      "Check live flight status, airport terminals & gates, track Indian Railways live train running status with coach position, and verify 10-digit IRCTC PNR confirmation.",
    start_url: "/",
    display: "standalone",
    background_color: "#f2f5f9",
    theme_color: "#0a223d",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48 32x32 16x16",
        type: "image/x-icon",
      },
      {
        src: "/assets/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/assets/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}

