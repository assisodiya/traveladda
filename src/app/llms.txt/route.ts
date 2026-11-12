import { NextResponse } from "next/server";
import { ALL_BLOG_POSTS, METRO_BLOG_POSTS } from "@/lib/blog-data";
import { POPULAR_CHART_TRAINS } from "@/lib/chart-time-types";
import {
  buildFlightStatusPath,
  POPULAR_LIVE_FLIGHTS,
} from "@/lib/flight-types";
import {
  buildTrainLiveStatusPath,
  POPULAR_LIVE_TRAINS,
} from "@/lib/live-train-types";
import { getAllMetroLines } from "@/lib/metro-service";
import {
  buildMetroLinePath,
  buildMetroRoutePath,
  POPULAR_METRO_ROUTES,
} from "@/lib/metro-types";

const BASE_URL = "https://traveladda.in";

export async function GET() {
  const metroLines = getAllMetroLines();

  const lines: string[] = [
    "# TravelAdda (https://traveladda.in)",
    "",
    "> TravelAdda is an Indian travel intelligence and real-time transit platform providing Delhi NCR Metro route, fare, timing & interchange planning (all 12 lines & 262 stations), Indian Railways live train running status with coach positions, 10-digit IRCTC PNR status verification, train reservation chart preparation times, live domestic & international flight status tracking, and aviation/hotel GST calculators.",
    "",
    "For the complete dataset including all 262 Delhi NCR Metro stations, fare charts, and full article summaries, read: https://traveladda.in/llms-full.txt",
    "",
    "## Core Interactive Tools & Hubs",
    `- [Delhi NCR Metro Route, Fare & Station Finder](${BASE_URL}/delhi-metro): Search station-to-station metro routes across DMRC, Airport Express, Noida Aqua Line & Gurgaon Rapid Metro (12 lines, 262 stations) with Fastest, Minimum Interchange, and Minimum Stops routing.`,
    `- [Live Train Running Status ("Spot Your Train")](${BASE_URL}/rail/live-status): Track live Indian Railways station progress, arrival/departure delays, platform numbers, and full coach position from the engine.`,
    `- [IRCTC 10-Digit PNR Status Checker](${BASE_URL}/rail/pnr-status): Real-time CNF / RAC / WL seat confirmation status, coach & berth code decoder, and chart preparation indicator.`,
    `- [Train Reservation Chart Preparation Time Finder](${BASE_URL}/rail/chart-time): Check exact 1st and 2nd reservation chart locking times and remote charting rules for Indian Railways trains.`,
    `- [IRCTC Train Ticket Cancellation & Refund Calculator (PRS Verified)](${BASE_URL}/rail/refund-calculator): Calculate exact Indian Railways refund for Confirmed (CNF), RAC, Waiting List (WL), Tatkal, TQWL, Vande Bharat Chair Car (48h/12h/4h) & Vande Bharat Sleeper (72h/8h Gazette G.S.R. 41(E)) with CRIS PRS double ₹5 rounding.`,
    `- [Live Flight Status Tracker](${BASE_URL}/air/flight-status): Real-time flight arrival/departure times, airport terminal numbers, boarding gates, and baggage carousel belts across 500+ airlines.`,
    `- [DGCA Flight Delay, Cancellation & Denied Boarding Compensation Checker](${BASE_URL}/air/flight-compensation): Calculate official DGCA CAR Section 3 Series M Part IV (₹5,000 to ₹20,000) & EU261 (€250–€600) payouts, view Airline Nodal Officer & Appellate emails, and generate legal AirSewa claim letters.`,
    `- [NHAI FASTag Highway Toll, Distance & Fuel / EV Cost Calculator](${BASE_URL}/toll-calculator): Plaza-by-plaza NHAI FASTag toll tax, 24-hour return discount, and Petrol, Diesel, CNG & Electric EV cost across 158+ city-to-city Indian highway corridors.`,
    `- [Flight Baggage & Airport Buffer Calculator](${BASE_URL}/tools/air): Calculate cabin + check-in excess baggage charges and recommended airport reporting time.`,
    `- [Hotel Room GST Slab Calculator](${BASE_URL}/tools/hotel): Calculate 0%, 12%, and 18% Indian GST slabs on hotel room tariffs.`,
    `- [TravelAdda Editorial Blog & Guides](${BASE_URL}/blog): In-depth guides on Delhi NCR Metro, Indian Railways PNR/charting rules, flight tracking, and 2026-27 India travel.`,
    "",
    "## Programmatic URL Patterns for AI Agents & Citations",
    `- **Delhi NCR Metro Route Details**: \`${BASE_URL}/delhi-metro/route/{origin-station-slug}-to-{destination-station-slug}\` (e.g., \`${BASE_URL}/delhi-metro/route/mg-road-to-anand-vihar\`, \`${BASE_URL}/delhi-metro/route/hauz-khas-to-botanical-garden\`)`,
    `- **Delhi NCR Metro Line Details**: \`${BASE_URL}/delhi-metro/{line-slug}\` (e.g., \`${BASE_URL}/delhi-metro/yellow-line\`, \`${BASE_URL}/delhi-metro/magenta-line\`)`,
    `- **Delhi NCR Metro Station Details**: \`${BASE_URL}/delhi-metro/{station-slug}\` (e.g., \`${BASE_URL}/delhi-metro/rajiv-chowk\`, \`${BASE_URL}/delhi-metro/new-delhi\`)`,
    `- **Delhi NCR Metro JSON Route API**: \`${BASE_URL}/api/metro/route?from={origin-slug}&to={destination-slug}&mode=fastest\``,
    `- **Live Flight Status by Airline & Number**: \`${BASE_URL}/flight-status/{airline-slug}-{iata-code}-{flight-number}-flight-status\` (e.g., \`${BASE_URL}/flight-status/indigo-6e-1205-flight-status\`, \`${BASE_URL}/flight-status/air-india-ai-101-flight-status\`)`,
    `- **DGCA Airline Compensation & Nodal Officer Rules**: \`${BASE_URL}/air/flight-compensation/{airline-slug}\` (e.g., \`${BASE_URL}/air/flight-compensation/indigo-6e-delay-cancellation-compensation\`, \`${BASE_URL}/air/flight-compensation/air-india-ai-delay-cancellation-compensation\`)`,
    `- **NHAI FASTag Highway Toll & Fuel Cost by Route**: \`${BASE_URL}/toll-calculator/{origin-city}-to-{destination-city}-toll-tax-and-fuel-cost\` (e.g., \`${BASE_URL}/toll-calculator/delhi-to-jaipur-toll-tax-and-fuel-cost\`, \`${BASE_URL}/toll-calculator/mumbai-to-pune-toll-tax-and-fuel-cost\`)`,
    `- **Train Chart Preparation Time**: \`${BASE_URL}/chart-times/{trainNumber}-{trainNameSlug}-chart-times\` (e.g., \`${BASE_URL}/chart-times/12952-mmct-tejas-raj-chart-times\`)`,
    `- **Live Train Running Status**: \`${BASE_URL}/rail/live-status/{trainNumber}-{trainNameSlug}\` (e.g., \`${BASE_URL}/rail/live-status/12952-new-delhi-mumbai-central-tejas-rajdhani-express\`)`,
    "",
    "## Popular Live Flight Status SSR Pages",
    ...POPULAR_LIVE_FLIGHTS.map(
      (f) =>
        `- [${f.airlineName} ${f.airlineCode} ${f.flightNumber} Flight Status (${f.routeCodes})](${BASE_URL}${buildFlightStatusPath(f.airlineCode, f.flightNumber, f.airlineName)}): ${f.routeCities}`,
    ),
    "",
    "## All 12 Delhi NCR Metro Lines",
    ...metroLines.map(
      (line) =>
        `- [${line.badge} (${line.shortCode}): ${line.fromStationName} ↔ ${line.toStationName}](${BASE_URL}${buildMetroLinePath(line.slug)}): ${line.totalStops} stations, ${line.totalDistanceKm} km, ~${line.totalDurationMin} mins (${line.zone})`,
    ),
    "",
    "## Popular Delhi NCR Metro Routes",
    ...POPULAR_METRO_ROUTES.map(
      (r) =>
        `- [${r.fromName} to ${r.toName} Metro Route, Fare & Timings](${BASE_URL}${buildMetroRoutePath(r.fromSlug, r.toSlug)}): ${r.corridorTag} (${r.highlight})`,
    ),
    "",
    "## Delhi NCR Metro Authority Guides",
    ...METRO_BLOG_POSTS.map(
      (post) =>
        `- [${post.title}](${BASE_URL}/blog/${post.slug}): ${post.excerpt}`,
    ),
    "",
    "## Popular Live Train Status & Chart Time Pages",
    ...POPULAR_LIVE_TRAINS.slice(0, 8).map(
      (t) =>
        `- [${t.trainNumber} ${t.trainName} Live Running Status](${BASE_URL}${buildTrainLiveStatusPath(t.trainNumber, t.trainName)}): ${t.sourceCode} to ${t.destinationCode}`,
    ),
    ...POPULAR_CHART_TRAINS.slice(0, 8).map(
      (t) =>
        `- [${t.trainNumber} ${t.trainName} Chart Preparation Time](${BASE_URL}/chart-times/${t.slug}): ${t.route} (1st Chart: ${t.firstChart})`,
    ),
    "",
    "## All Travel, Rail, Flight & Stay Guides",
    ...ALL_BLOG_POSTS.map(
      (post) =>
        `- [${post.title}](${BASE_URL}/blog/${post.slug}) [${post.category}]: ${post.excerpt}`,
    ),
    "",
  ];

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Robots-Tag": "index, follow",
    },
  });
}
