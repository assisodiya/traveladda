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

export const POPULAR_CHART_TRAINS: {
  trainNumber: string;
  trainName: string;
  route: string;
  firstChart: string;
}[] = [
  {
    trainNumber: "12952",
    trainName: "Mmct Tejas Rajdhani",
    route: "NDLS → MMCT",
    firstChart: "8:55 AM",
  },
  {
    trainNumber: "12951",
    trainName: "New Delhi Tejas Rajdhani",
    route: "MMCT → NDLS",
    firstChart: "9:00 AM",
  },
  {
    trainNumber: "12301",
    trainName: "Howrah Rajdhani Express",
    route: "HWH → NDLS",
    firstChart: "8:50 AM",
  },
  {
    trainNumber: "22436",
    trainName: "Vande Bharat Express",
    route: "NDLS → BSB",
    firstChart: "8:00 PM (Prev Day)",
  },
  {
    trainNumber: "12986",
    trainName: "Jaipur Double Decker",
    route: "DEE → JP",
    firstChart: "9:25 AM",
  },
  {
    trainNumber: "12002",
    trainName: "Bhopal Shatabdi Express",
    route: "NDLS → RKMP",
    firstChart: "8:00 PM (Prev Day)",
  },
];

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

