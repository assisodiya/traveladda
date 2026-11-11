export type MetroRoutePreference = "fastest" | "min-interchange" | "min-stops";

export interface MetroLine {
  id: string;
  agencyId: string;
  shortName: string;
  longName: string;
  badge: string;
  shortCode: string;
  slug: string;
  zone: string;
  color: string;
  textColor: string;
  sortOrder: number;
  stopIds: string[];
  fromStopId: string;
  toStopId: string;
  fromStationName: string;
  toStationName: string;
  totalStops: number;
  totalDistanceKm: number;
  totalDurationMin: number;
}

export interface MetroStation {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lon: number;
  routeIds: string[];
  isInterchange: boolean;
  firstTrain: string;
  lastTrain: string;
}

export interface MetroTrackEdge {
  from: string;
  to: string;
  routeId: string;
  durationSec: number;
  distanceMeters: number;
  headsign: string;
}

export interface MetroWalkwayTransfer {
  from: string;
  to: string;
  durationSec: number;
  distanceMeters: number;
  note: string;
}

export interface MetroNetworkGraph {
  agency: {
    id: string;
    name: string;
    url: string;
    timezone: string;
  };
  routes: MetroLine[];
  stops: MetroStation[];
  edges: MetroTrackEdge[];
  walkways: MetroWalkwayTransfer[];
}

export interface MetroStopStep {
  stopId: string;
  name: string;
  slug: string;
  lat: number;
  lon: number;
  cumulativeDurationMin: number;
  cumulativeDistanceKm: number;
  isInterchange: boolean;
  routeIds: string[];
}

export interface MetroJourneySegment {
  segmentIndex: number;
  type: "metro" | "walkway";
  line: MetroLine | null;
  fromStation: MetroStation;
  toStation: MetroStation;
  towardsTerminal: string;
  platformHint: string;
  stopsCount: number;
  durationMin: number;
  distanceKm: number;
  intermediateStops: MetroStopStep[];
  walkwayNote?: string;
}

export interface MetroJourneyInterchange {
  station: MetroStation;
  arriveStation: MetroStation;
  departStation: MetroStation;
  fromLine: MetroLine;
  toLine: MetroLine;
  transferDurationMin: number;
  isWalkway: boolean;
  note: string;
}

export interface MetroFareBreakdown {
  tokenFareInr: number;
  smartCardPeakInr: number;
  smartCardOffPeakInr: number;
  sundayHolidayInr: number;
  distanceSlabLabel: string;
  includesAirportExpress: boolean;
  includesNoidaAqua: boolean;
  includesRapidMetro: boolean;
  fareNote: string;
}

export interface MetroRouteOption {
  id: string;
  preference: MetroRoutePreference;
  label: string;
  badgeText: string;
  fromStation: MetroStation;
  toStation: MetroStation;
  totalDurationMin: number;
  inTrainDurationMin: number;
  interchangeDurationMin: number;
  totalDistanceKm: number;
  totalStops: number;
  interchangeCount: number;
  fare: MetroFareBreakdown;
  segments: MetroJourneySegment[];
  interchanges: MetroJourneyInterchange[];
  allStops: MetroStopStep[];
  firstTrainFromOrigin: string;
  lastTrainFromOrigin: string;
  peakFrequencyMin: string;
}

export interface MetroRoutePlanResult {
  fromStation: MetroStation;
  toStation: MetroStation;
  routeSlug: string;
  reverseRouteSlug: string;
  selectedPreference: MetroRoutePreference;
  recommended: MetroRouteOption;
  alternatives: MetroRouteOption[];
}

export interface PopularMetroRouteItem {
  fromSlug: string;
  toSlug: string;
  fromName: string;
  toName: string;
  corridorTag: string;
  highlight: string;
}

export const POPULAR_METRO_ROUTES: PopularMetroRouteItem[] = [
  {
    fromSlug: "mg-road",
    toSlug: "anand-vihar",
    fromName: "MG Road (Gurugram)",
    toName: "Anand Vihar ISBT",
    corridorTag: "Yellow + Blue Line",
    highlight: "Via Rajiv Chowk Interchange • Gurugram to East Delhi",
  },
  {
    fromSlug: "new-delhi",
    toSlug: "igi-airport",
    fromName: "New Delhi",
    toName: "IGI Airport (T3)",
    corridorTag: "Airport Express",
    highlight: "Direct Orange Line • 19 mins",
  },
  {
    fromSlug: "rajiv-chowk",
    toSlug: "huda-city-centre",
    fromName: "Rajiv Chowk",
    toName: "Huda City Centre (Gurugram)",
    corridorTag: "Yellow Line",
    highlight: "Direct Yellow Line • 0 Interchange",
  },
  {
    fromSlug: "rajiv-chowk",
    toSlug: "noida-electronic-city",
    fromName: "Rajiv Chowk",
    toName: "Noida Electronic City",
    corridorTag: "Blue Line",
    highlight: "Direct Blue Line • IT Hub Corridor",
  },
  {
    fromSlug: "kashmere-gate",
    toSlug: "huda-city-centre",
    fromName: "Kashmere Gate ISBT",
    toName: "Huda City Centre",
    corridorTag: "North–South Spine",
    highlight: "Direct Yellow Line • Old Delhi to Gurgaon",
  },
  {
    fromSlug: "anand-vihar",
    toSlug: "rajiv-chowk",
    fromName: "Anand Vihar ISBT",
    toName: "Rajiv Chowk (Connaught Place)",
    corridorTag: "Blue Vaishali Branch",
    highlight: "Direct Blue Line • 0 Interchange",
  },
  {
    fromSlug: "hauz-khas",
    toSlug: "botanical-garden",
    fromName: "Hauz Khas",
    toName: "Botanical Garden (Noida)",
    corridorTag: "Magenta Line",
    highlight: "Direct Magenta Express • South Delhi to Noida",
  },
  {
    fromSlug: "new-delhi",
    toSlug: "cyber-city-rapid-metro",
    fromName: "New Delhi Railway Station",
    toName: "Cyber City (Gurugram)",
    corridorTag: "Yellow + Rapid Metro",
    highlight: "Via Sikanderpur Interchange",
  },
  {
    fromSlug: "rajiv-chowk",
    toSlug: "pari-chowk",
    fromName: "Rajiv Chowk",
    toName: "Pari Chowk (Greater Noida)",
    corridorTag: "Blue + Noida Aqua Line",
    highlight: "Via Noida Sec-52 / Sector 51 Walkway",
  },
  {
    fromSlug: "kashmere-gate",
    toSlug: "raja-nahar-singh",
    fromName: "Kashmere Gate",
    toName: "Raja Nahar Singh (Ballabhgarh)",
    corridorTag: "Violet Line",
    highlight: "Direct Violet Line • Old Delhi to Faridabad",
  },
  {
    fromSlug: "majlis-park",
    toSlug: "lajpat-nagar",
    fromName: "Majlis Park",
    toName: "Lajpat Nagar",
    corridorTag: "Pink Ring Line",
    highlight: "Direct Pink Line • Ring Corridor",
  },
  {
    fromSlug: "dwarka-sector-21",
    toSlug: "vaishali",
    fromName: "Dwarka Sector - 21",
    toName: "Vaishali (Ghaziabad)",
    corridorTag: "Blue Line Branch",
    highlight: "Direct Blue Line • West to East NCR",
  },
  {
    fromSlug: "rithala",
    toSlug: "shaheed-sthal-new-bus-adda",
    fromName: "Rithala (Rohini)",
    toName: "Shaheed Sthal (Ghaziabad)",
    corridorTag: "Red Line",
    highlight: "Direct Red Line • End-to-End",
  },
];

export function buildMetroRouteSlug(fromSlug: string, toSlug: string): string {
  return `${fromSlug.trim().toLowerCase()}-to-${toSlug.trim().toLowerCase()}`;
}

export function buildMetroRoutePath(fromSlug: string, toSlug: string): string {
  return `/delhi-metro/route/${buildMetroRouteSlug(fromSlug, toSlug)}`;
}

export function buildMetroStationPath(stationSlug: string): string {
  return `/delhi-metro/${stationSlug.trim().toLowerCase()}`;
}

export function buildMetroLinePath(lineSlug: string): string {
  return `/delhi-metro/${lineSlug.trim().toLowerCase()}`;
}

export function parseMetroRouteSlug(
  rawSlug: string,
): { fromSlug: string; toSlug: string } | null {
  const clean = decodeURIComponent(rawSlug || "")
    .trim()
    .toLowerCase();
  const idx = clean.indexOf("-to-");
  if (idx <= 0) return null;
  const fromSlug = clean.slice(0, idx).replace(/^-+|-+$/g, "");
  const toSlug = clean.slice(idx + 4).replace(/^-+|-+$/g, "");
  if (!fromSlug || !toSlug) return null;
  return { fromSlug, toSlug };
}
