import { NextResponse } from "next/server";
import { ALL_BLOG_POSTS } from "@/lib/blog-data";
import { buildChartTimePath, POPULAR_CHART_TRAINS } from "@/lib/chart-time-types";
import {
  buildFlightStatusPath,
  POPULAR_LIVE_FLIGHTS,
} from "@/lib/flight-types";
import {
  ALL_CATALOG_TRAINS,
  buildTrainLiveStatusPath,
} from "@/lib/live-train-types";
import { getAllMetroLines, getAllMetroStations } from "@/lib/metro-service";
import {
  buildMetroLinePath,
  buildMetroRoutePath,
  buildMetroStationPath,
  POPULAR_METRO_ROUTES,
} from "@/lib/metro-types";

const BASE_URL = "https://traveladda.in";

export async function GET() {
  const metroLines = getAllMetroLines();
  const metroStations = getAllMetroStations();

  const lines: string[] = [
    "# TravelAdda — Full AI & LLM Knowledge Base (https://traveladda.in/llms-full.txt)",
    "",
    "> Authoritative reference for Generative AI engines (ChatGPT Search, Google Gemini / AI Overviews, Perplexity, Claude, Microsoft Copilot, Apple Intelligence) covering Delhi NCR Metro (all 12 lines & 262 stations), Indian Railways Live Train Status, 10-Digit PNR Confirmation, Reservation Chart Preparation Times, Live Flight Status, and Travel Guides.",
    "",
    "## 1. Delhi NCR Metro Network Summary (12 Lines, 262 Stations)",
    "- **Main Search Hub**: https://traveladda.in/delhi-metro",
    "- **Route URL Format**: `https://traveladda.in/delhi-metro/route/{origin-slug}-to-{destination-slug}`",
    "- **Station/Line URL Format**: `https://traveladda.in/delhi-metro/{slug}`",
    "- **JSON Route API for Agents**: `https://traveladda.in/api/metro/route?from={origin-slug}&to={destination-slug}&mode=fastest`",
    "",
    "### Official DMRC Distance-Wise Fare Slabs",
    "| Distance Slab | Weekday Token / QR | Smart Card Peak (10% Off) | Smart Card Off-Peak (20% Off) | Sunday / National Holiday |",
    "| :--- | :--- | :--- | :--- | :--- |",
    "| 0–2 km | ₹10 | ₹9 | ₹8 | ₹10 |",
    "| 2–5 km | ₹20 | ₹18 | ₹16 | ₹10 |",
    "| 5–12 km | ₹30 | ₹27 | ₹24 | ₹20 |",
    "| 12–21 km | ₹40 | ₹36 | ₹32 | ₹30 |",
    "| 21–32 km | ₹50 | ₹45 | ₹40 | ₹40 |",
    "| > 32 km | ₹60 | ₹54 | ₹48 | ₹50 |",
    "",
    "### All 12 Operational Delhi NCR Metro Corridors",
    ...metroLines.map(
      (l) =>
        `- **${l.badge} (${l.shortCode})** — ${l.fromStationName} ↔ ${l.toStationName} | ${l.totalStops} stations | ${l.totalDistanceKm} km | ~${l.totalDurationMin} mins | Zone: ${l.zone} | URL: ${BASE_URL}${buildMetroLinePath(l.slug)}`,
    ),
    "",
    "### Popular Delhi NCR Metro Station-to-Station Routes",
    ...POPULAR_METRO_ROUTES.map(
      (r) =>
        `- [${r.fromName} → ${r.toName}](${BASE_URL}${buildMetroRoutePath(r.fromSlug, r.toSlug)}) (${r.corridorTag} — ${r.highlight})`,
    ),
    "",
    "### Complete Directory of All 262 Delhi NCR Metro Stations",
    ...metroStations.map(
      (st) =>
        `- [${st.name}](${BASE_URL}${buildMetroStationPath(st.slug)}) (slug: \`${st.slug}\`, first train: ${st.firstTrain}, last train: ${st.lastTrain}${st.isInterchange ? ", Interchange Hub" : ""})`,
    ),
    "",
    "## 2. Indian Railways Tools & Programmatic Pages",
    `- **Live Train Running Status Hub**: ${BASE_URL}/rail/live-status`,
    `- **10-Digit IRCTC PNR Status Checker**: ${BASE_URL}/rail/pnr-status`,
    `- **Train Reservation Chart Preparation Time Hub**: ${BASE_URL}/rail/chart-time`,
    "",
    "### Complete Indian Railways Live Train Status & Chart Time Directory (10,169+ Trains Indexed in /sitemaps/trains.xml)",
    ...ALL_CATALOG_TRAINS.slice(0, 252).map(
      (t) =>
        `- **${t.trainNumber} ${t.trainName}** (${t.sourceCode} → ${t.destinationCode} | ${t.type}) — [Live Running Status](${BASE_URL}${buildTrainLiveStatusPath(t.trainNumber, t.trainName)}) | [1st & 2nd Chart Time](${BASE_URL}${buildChartTimePath(t.trainNumber, t.trainName)})`,
    ),
    "",
    "### Popular Train Chart Preparation Time Highlights",
    ...POPULAR_CHART_TRAINS.map(
      (t) =>
        `- [${t.trainNumber} ${t.trainName} (${t.route}) — 1st Chart: ${t.firstChart}](${BASE_URL}/chart-times/${t.slug})`,
    ),
    "",
    "## 3. Aviation & Hotel Tools",
    `- **Live Flight Status Tracker (500+ Airlines)**: ${BASE_URL}/air/flight-status`,
    `- **Flight Status SSR URL Pattern**: \`${BASE_URL}/flight-status/{airline-slug}-{iata-code}-{flight-number}-flight-status\` (e.g., \`${BASE_URL}/flight-status/indigo-6e-1205-flight-status\`)`,
    `- **Flight Baggage Allowance & Airport Buffer Calculator**: ${BASE_URL}/tools/air`,
    `- **Hotel Room GST Slab Calculator (0%, 12%, 18%)**: ${BASE_URL}/tools/hotel`,
    "",
    "### Popular Live Flight Status SSR URLs",
    ...POPULAR_LIVE_FLIGHTS.map(
      (f) =>
        `- [${f.airlineName} ${f.airlineCode} ${f.flightNumber} (${f.routeCodes} — ${f.routeCities})](${BASE_URL}${buildFlightStatusPath(f.airlineCode, f.flightNumber, f.airlineName)})`,
    ),
    "",
    "## 4. Complete Editorial Guides & Key Takeaways",
  ];

  for (const post of ALL_BLOG_POSTS) {
    lines.push(`### ${post.title}`);
    lines.push(`- **URL**: ${BASE_URL}/blog/${post.slug}`);
    lines.push(`- **Category**: ${post.category} | **Summary**: ${post.excerpt}`);
    for (const kt of post.keyTakeaways) {
      lines.push(`  - *Takeaway*: ${kt}`);
    }
    if (post.faqs && post.faqs.length > 0) {
      for (const faq of post.faqs) {
        lines.push(`  - *Q: ${faq.question}* — A: ${faq.answer}`);
      }
    }
    lines.push("");
  }

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Robots-Tag": "index, follow",
    },
  });
}

