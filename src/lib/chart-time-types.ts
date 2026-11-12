import { ALL_CATALOG_TRAINS } from "./live-train-types";

export interface UpstreamChartStation {
  stationCode: string;
  stationName: string;
  arrivalTime: string;
  departureTime: string;
  day: number;
  distance: string;
  chartTimeLocal: string;
  chartOneDayOffset: number;
  chartTwoTimeLocal: string;
  chartTwoDayOffset: number;
  chartRemoteStation: string;
}

export interface UpstreamChartTimeResponse {
  trainNumber: string;
  trainName: string;
  originStation: string;
  destinationStation: string;
  slug: string;
  stations: UpstreamChartStation[];
  summary: string;
  generatedAt: string;
  knownChartCount: number;
}

export interface EnrichedChartStation extends UpstreamChartStation {
  sequence: number;
  distanceKm: number;
  arrivalFormatted: string;
  departureFormatted: string;
  chartOneFormatted12h: string;
  chartOneDayLabel: string;
  chartOneChartDayNumber: number;
  chartTwoFormatted12h: string;
  chartTwoDayLabel: string;
  chartTwoChartDayNumber: number;
  chartRemoteStationName: string;
  isPrimaryChartHub: boolean;
  isOrigin: boolean;
  isDestination: boolean;
}

export interface ChartingZoneCluster {
  remoteStationCode: string;
  remoteStationName: string;
  chartOneTimeLocal: string;
  chartOneFormatted12h: string;
  chartTwoTimeLocal: string;
  chartTwoFormatted12h: string;
  stationCodes: string[];
  stationNames: string[];
  stationCount: number;
}

export interface EnrichedChartTimeData {
  trainNumber: string;
  trainName: string;
  originStation: string;
  originStationName: string;
  destinationStation: string;
  destinationStationName: string;
  slug: string;
  summary: string;
  generatedAt: string;
  knownChartCount: number;
  totalStations: number;
  totalDistanceKm: number;
  originFirstChart12h: string;
  originSecondChart12h: string;
  uniqueChartHubCount: number;
  chartingZones: ChartingZoneCluster[];
  stations: EnrichedChartStation[];
}

export interface OwnedChartTimeApiResponse {
  success: boolean;
  data?: EnrichedChartTimeData;
  error?: {
    code: string;
    message: string;
  };
  meta: {
    timestamp: string;
    source: string;
    provider: string;
    executionTime: number;
    fallbackUsed?: boolean;
  };
}

export function format24hTo12h(time24: string | undefined | null): string {
  if (!time24 || !time24.includes(":")) return "—";
  const [hStr, mStr] = time24.trim().split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return time24;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export interface PopularChartTrainItem {
  trainNumber: string;
  trainName: string;
  route: string;
  firstChart: string;
  slug: string;
}

export const POPULAR_CHART_TRAINS: PopularChartTrainItem[] = [
  {
    trainNumber: "12952",
    trainName: "Mmct Tejas Rajdhani",
    route: "NDLS → MMCT",
    firstChart: "8:55 AM",
    slug: "12952-mmct-tejas-raj-chart-times",
  },
  {
    trainNumber: "12951",
    trainName: "New Delhi Tejas Rajdhani",
    route: "MMCT → NDLS",
    firstChart: "9:00 AM",
    slug: "12951-new-delhi-tejas-rajdhani-chart-times",
  },
  {
    trainNumber: "12301",
    trainName: "Howrah Rajdhani Express",
    route: "HWH → NDLS",
    firstChart: "8:50 AM",
    slug: "12301-howrah-rajdhani-express-chart-times",
  },
  {
    trainNumber: "12302",
    trainName: "New Delhi Howrah Rajdhani",
    route: "NDLS → HWH",
    firstChart: "8:50 AM",
    slug: "12302-new-delhi-howrah-rajdhani-chart-times",
  },
  {
    trainNumber: "22436",
    trainName: "Vande Bharat Express",
    route: "NDLS → BSB",
    firstChart: "8:00 PM (Prev Day)",
    slug: "22436-vande-bharat-express-chart-times",
  },
  {
    trainNumber: "22435",
    trainName: "Varanasi Vande Bharat",
    route: "BSB → NDLS",
    firstChart: "7:00 AM",
    slug: "22435-varanasi-vande-bharat-chart-times",
  },
  {
    trainNumber: "12986",
    trainName: "Jaipur Double Decker",
    route: "DEE → JP",
    firstChart: "9:25 PM (Prev Day)",
    slug: "12986-jaipur-double-decker-chart-times",
  },
  {
    trainNumber: "12002",
    trainName: "Bhopal Shatabdi Express",
    route: "NDLS → RKMP",
    firstChart: "8:00 PM (Prev Day)",
    slug: "12002-bhopal-shatabdi-express-chart-times",
  },
  {
    trainNumber: "12622",
    trainName: "Tamil Nadu Express",
    route: "NDLS → MAS",
    firstChart: "1:55 PM",
    slug: "12622-tamil-nadu-express-chart-times",
  },
  {
    trainNumber: "12424",
    trainName: "Dibrugarh Rajdhani Express",
    route: "NDLS → DBRG",
    firstChart: "8:20 AM",
    slug: "12424-dibrugarh-rajdhani-express-chart-times",
  },
  {
    trainNumber: "12051",
    trainName: "Madgaon Jan Shatabdi",
    route: "CSMT → MAO",
    firstChart: "8:00 PM (Prev Day)",
    slug: "12051-madgaon-jan-shatabdi-chart-times",
  },
  {
    trainNumber: "20901",
    trainName: "Gandhinagar Vande Bharat",
    route: "MMCT → GNC",
    firstChart: "8:00 PM (Prev Day)",
    slug: "20901-gandhinagar-vande-bharat-chart-times",
  },
];

function slugifyChartToken(input: string): string {
  return (input || "")
    .replace(/\([^)]*\)/g, " ")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function extractTrainNumberFromChartSlug(rawSlug: string): string {
  const decoded = decodeURIComponent(rawSlug || "").trim();
  const leading = /^(\d{3,5})(?:-|$)/.exec(decoded);
  if (leading) return leading[1];

  const anyNum = /\b(\d{4,5})\b/.exec(decoded);
  if (anyNum) return anyNum[1];

  const cleanSlug = slugifyChartToken(decoded).replace(/-chart-times?$/, "");
  if (cleanSlug.length >= 3) {
    const matched = POPULAR_CHART_TRAINS.find((t) => {
      const s = t.slug.replace(/-chart-times?$/, "");
      return (
        s === cleanSlug ||
        s.includes(cleanSlug) ||
        slugifyChartToken(t.trainName) === cleanSlug
      );
    });
    if (matched) return matched.trainNumber;

    const matchedCatalog = ALL_CATALOG_TRAINS.find((t) => {
      const s = slugifyChartToken(t.trainName);
      return s === cleanSlug || s.includes(cleanSlug) || cleanSlug.includes(s);
    });
    if (matchedCatalog) return matchedCatalog.trainNumber;
  }

  return decoded.replace(/\D/g, "").slice(0, 5);
}

export function buildChartTimeSlug(
  trainNumber: string,
  trainName?: string | null,
  upstreamSlug?: string | null
): string {
  const cleanNum = extractTrainNumberFromChartSlug(trainNumber);
  const catalogMatch = POPULAR_CHART_TRAINS.find(
    (t) => t.trainNumber === cleanNum
  );
  if (catalogMatch) {
    return catalogMatch.slug;
  }

  const allCatalogMatch = ALL_CATALOG_TRAINS.find(
    (t) => t.trainNumber === cleanNum
  );
  if (allCatalogMatch) {
    const catPart = slugifyChartToken(allCatalogMatch.trainName);
    const strippedCat = catPart.startsWith(`${cleanNum}-`)
      ? catPart.slice(cleanNum.length + 1)
      : catPart.replace(/-chart-times?$/, "");
    if (strippedCat) {
      return `${cleanNum}-${strippedCat}-chart-times`;
    }
  }

  if (upstreamSlug && upstreamSlug.trim()) {
    const s = slugifyChartToken(upstreamSlug);
    if (s.startsWith(cleanNum)) {
      return s.endsWith("-chart-times") ? s : `${s}-chart-times`;
    }
  }

  const resolvedName =
    (trainName &&
      !trainName.startsWith("Indian Railways Express #") &&
      trainName) ||
    "";

  const namePart = slugifyChartToken(resolvedName);
  if (!namePart || namePart === cleanNum) {
    return `${cleanNum}-chart-times`;
  }
  const stripped = namePart.startsWith(`${cleanNum}-`)
    ? namePart.slice(cleanNum.length + 1)
    : namePart.replace(/-chart-times?$/, "");
  return stripped
    ? `${cleanNum}-${stripped}-chart-times`
    : `${cleanNum}-chart-times`;
}

export function buildChartTimePath(
  trainNumber: string,
  trainName?: string | null,
  upstreamSlug?: string | null
): string {
  const slug = buildChartTimeSlug(trainNumber, trainName, upstreamSlug);
  return slug ? `/chart-times/${slug}` : "/rail/chart-time";
}

export const FALLBACK_12952_CHART_DATA: UpstreamChartTimeResponse = {
  trainNumber: "12952",
  trainName: "Mmct Tejas Raj",
  originStation: "NDLS",
  destinationStation: "MMCT",
  slug: "12952-mmct-tejas-raj-chart-times",
  stations: [
    {
      stationCode: "NDLS",
      stationName: "New Delhi",
      arrivalTime: "",
      departureTime: "16:55",
      day: 1,
      distance: "0.0",
      chartTimeLocal: "08:55",
      chartOneDayOffset: 0,
      chartTwoTimeLocal: "16:40",
      chartTwoDayOffset: 0,
      chartRemoteStation: "NDLS",
    },
    {
      stationCode: "KOTA",
      stationName: "Kota Jn",
      arrivalTime: "21:30",
      departureTime: "21:40",
      day: 1,
      distance: "465.0",
      chartTimeLocal: "11:24",
      chartOneDayOffset: 0,
      chartTwoTimeLocal: "21:25",
      chartTwoDayOffset: 0,
      chartRemoteStation: "KOTA",
    },
    {
      stationCode: "NAD",
      stationName: "Nagda Jn",
      arrivalTime: "23:57",
      departureTime: "23:59",
      day: 1,
      distance: "690.0",
      chartTimeLocal: "13:36",
      chartOneDayOffset: 0,
      chartTwoTimeLocal: "23:35",
      chartTwoDayOffset: 0,
      chartRemoteStation: "NAD",
    },
    {
      stationCode: "RTM",
      stationName: "Ratlam Jn",
      arrivalTime: "00:30",
      departureTime: "00:33",
      day: 2,
      distance: "731.0",
      chartTimeLocal: "14:31",
      chartOneDayOffset: 0,
      chartTwoTimeLocal: "00:15",
      chartTwoDayOffset: 1,
      chartRemoteStation: "RTM",
    },
    {
      stationCode: "BRC",
      stationName: "Vadodara Jn",
      arrivalTime: "03:40",
      departureTime: "03:50",
      day: 2,
      distance: "993.0",
      chartTimeLocal: "17:48",
      chartOneDayOffset: 0,
      chartTwoTimeLocal: "03:35",
      chartTwoDayOffset: 1,
      chartRemoteStation: "BRC",
    },
    {
      stationCode: "ST",
      stationName: "Surat",
      arrivalTime: "05:13",
      departureTime: "05:18",
      day: 2,
      distance: "1122.0",
      chartTimeLocal: "19:29",
      chartOneDayOffset: 0,
      chartTwoTimeLocal: "05:03",
      chartTwoDayOffset: 1,
      chartRemoteStation: "ST",
    },
    {
      stationCode: "BVI",
      stationName: "Borivali",
      arrivalTime: "07:38",
      departureTime: "07:40",
      day: 2,
      distance: "1355.0",
      chartTimeLocal: "19:29",
      chartOneDayOffset: 0,
      chartTwoTimeLocal: "05:03",
      chartTwoDayOffset: 1,
      chartRemoteStation: "ST",
    },
    {
      stationCode: "MMCT",
      stationName: "Mumbai Central",
      arrivalTime: "08:35",
      departureTime: "",
      day: 2,
      distance: "1384.0",
      chartTimeLocal: "19:29",
      chartOneDayOffset: 0,
      chartTwoTimeLocal: "05:03",
      chartTwoDayOffset: 1,
      chartRemoteStation: "ST",
    },
  ],
  summary:
    "The first reservation chart for Mmct Tejas Raj (12952) is prepared at New Delhi (NDLS) around 8:55 AM, with a second (vacancy) chart around 4:40 PM. 8 of 8 stations on the NDLS to MMCT route have published chart preparation times, listed station-by-station below.",
  generatedAt: "2026-10-06T21:35:13.381Z",
  knownChartCount: 8,
};

