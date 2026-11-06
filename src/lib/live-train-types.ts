export interface TrainEndpointStation {
  code: string;
  name: string;
  lat: number | null;
  lng: number | null;
}

export type CoachRole =
  | "locomotive"
  | "power"
  | "pantry"
  | "executive"
  | "ac"
  | "sleeper"
  | "general";

export interface CoachUnit {
  index: number; // 0-based position in rake (0 is Engine)
  coachOrderFromEngine: number; // 1-based coach count after Engine (0 for Engine)
  code: string;
  role: CoachRole;
  label: string;
}

export type TrainTrackingState =
  | "running"
  | "halted"
  | "not-started"
  | "completed"
  | "cancelled";

export interface NormalizedNextHalt {
  stationCode: string;
  stationName: string;
  sequence: number;
  distanceKm: number;
  distanceFromCurrentKm: number;
  scheduledArrival: string | null;
  expectedArrival: string | null;
  platform: string | null;
  delayMinutes: number;
}

export interface NormalizedCurrentLocation {
  stationCode: string;
  stationName: string;
  sequence: number;
  status: string;
  statusLabel: string;
  isHalt: boolean;
  lat: number | null;
  lng: number | null;
  distanceFromOriginKm: number;
  distanceFromLastStationKm: number;
  segmentProgress: number;
  speedKmh: number;
  delayMinutes: number;
}

export interface NormalizedLivePosition {
  trackingState: TrainTrackingState;
  isMoving: boolean;
  isHaltedAtStation: boolean;
  headline: string;
  subheadline: string;
  delayStatus: string;
  lastStation: {
    code: string;
    name: string;
    sequence: number;
    distanceKm: number;
    isHalt: boolean;
  } | null;
  nextStation: {
    code: string;
    name: string;
    sequence: number;
    distanceKm: number;
    isHalt: boolean;
  } | null;
  previousHalt: {
    code: string;
    name: string;
    sequence: number;
    distanceKm: number;
    departedAt: string | null;
    platform: string | null;
  } | null;
  distanceCoveredKm: number;
  distanceRemainingKm: number;
  distanceToNextHaltKm: number | null;
  haltSegmentProgress: number;
  betweenHaltAfterSeq: number | null;
  betweenAllAfterSeq: number | null;
  estimatedSpeedKmh: number;
  speedSource: "gps" | "section" | "average" | "stationary";
}

export interface NormalizedLiveSummary {
  trainLabel: string;
  routeLabel: string;
  currentStatusText: string;
  delayText: string;
  progressPercent: number;
  distanceCoveredKm: number;
  distanceTotalKm: number;
  distanceRemainingKm: number;
  haltsCompleted: number;
  haltsTotal: number;
  haltsRemaining: number;
  lastUpdatedIst: string;
}

export type RouteStopState = "departed" | "current" | "upcoming";

export interface NormalizedRouteStop {
  sequence: number;
  stationCode: string;
  stationName: string;
  isHalt: boolean;
  rawStatus: string;
  stopState: RouteStopState;
  coachPosition: string | null;
  lat: number | null;
  lng: number | null;
  scheduledArrival: string | null;
  actualArrival: string | null;
  arrivalDay: number;
  delayArrival: number;
  scheduledDeparture: string | null;
  actualDeparture: string | null;
  departureDay: number;
  delayDeparture: number;
  haltMinutes: number | null;
  platform: string | null;
  distanceKm: number;
  speedToNextStationKmph: number | null;
  provenance: string | null;
}

export interface NormalizedLiveTrainData {
  trainNumber: string;
  trainName: string;
  startDate: string;
  autoDetectedStartDate: boolean;
  lastUpdatedAt: string;
  status: string;
  statusLabel: string;
  trackingState: TrainTrackingState;
  isLive: boolean;
  trackingMode: string;
  delayMinutes: number;
  summary: NormalizedLiveSummary;
  livePosition: NormalizedLivePosition;
  train: {
    number: string;
    name: string;
    type: string;
    category: string;
    source: TrainEndpointStation;
    destination: TrainEndpointStation;
    runDays: string[];
    isDaily: boolean;
    distanceKm: number;
    durationMinutes: number;
    durationFormatted: string;
    avgSpeedKmph: number | null;
    maxSpeedKmph: number | null;
    totalHalts: number;
    totalRouteStations: number;
    returnTrain: string | null;
    coachPositionRaw: string | null;
    coaches: CoachUnit[];
  };
  nextHalt: NormalizedNextHalt | null;
  currentLocation: NormalizedCurrentLocation | null;
  geometry: {
    encodedPolyline: string | null;
    coordinates: Array<[number, number]>; // [lat, lng]
  };
  progressPercent: number;
  route: NormalizedRouteStop[];
  exceptions: string[];
}

export interface OwnedLiveTrainApiResponse {
  success: boolean;
  provider: "TravelAdda Owned Rail API v2";
  endpoint: string;
  data?: NormalizedLiveTrainData;
  error?: {
    code: string;
    message: string;
  };
  meta: {
    timestamp: string;
    traceId: string;
    source: string;
    executionTime: number;
    poweredBy: string;
    fetchedAt: string;
    responseTimeMs: number;
  };
}

export interface TrainSearchItem {
  trainNumber: string;
  trainName: string;
  sourceCode: string;
  sourceName: string;
  destinationCode: string;
  destinationName: string;
  type: string;
  runDays: string[];
  isDaily: boolean;
}

export interface OwnedTrainSearchApiResponse {
  success: boolean;
  provider: "TravelAdda Owned Rail API v2";
  query: string;
  count: number;
  data: TrainSearchItem[];
  meta: {
    fetchedAt: string;
    responseTimeMs: number;
  };
}

export const POPULAR_LIVE_TRAINS: TrainSearchItem[] = [
  {
    trainNumber: "12002",
    trainName: "New Delhi - Rani Kamlapati Shatabdi Express",
    sourceCode: "NDLS",
    sourceName: "New Delhi",
    destinationCode: "RKMP",
    destinationName: "Rani Kamlapati",
    type: "Shatabdi",
    runDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    isDaily: true,
  },
  {
    trainNumber: "12951",
    trainName: "Mumbai Central - New Delhi Tejas Rajdhani Express",
    sourceCode: "MMCT",
    sourceName: "Mumbai Central",
    destinationCode: "NDLS",
    destinationName: "New Delhi",
    type: "Rajdhani",
    runDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    isDaily: true,
  },
  {
    trainNumber: "22436",
    trainName: "New Delhi - Varanasi Vande Bharat Express",
    sourceCode: "NDLS",
    sourceName: "New Delhi",
    destinationCode: "BSB",
    destinationName: "Varanasi Jn",
    type: "Vande Bharat",
    runDays: ["mon", "tue", "wed", "fri", "sat", "sun"],
    isDaily: false,
  },
  {
    trainNumber: "12986",
    trainName: "Delhi Sarai Rohilla - Jaipur AC Double Decker Express",
    sourceCode: "DEE",
    sourceName: "Delhi Sarai Rohilla",
    destinationCode: "JP",
    destinationName: "Jaipur Jn",
    type: "Double Decker",
    runDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    isDaily: true,
  },
  {
    trainNumber: "12622",
    trainName: "New Delhi - MGR Chennai Central Tamil Nadu Express",
    sourceCode: "NDLS",
    sourceName: "New Delhi",
    destinationCode: "MAS",
    destinationName: "MGR Chennai Central",
    type: "Superfast",
    runDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    isDaily: true,
  },
  {
    trainNumber: "12301",
    trainName: "Howrah - New Delhi Rajdhani Express",
    sourceCode: "HWH",
    sourceName: "Howrah Jn",
    destinationCode: "NDLS",
    destinationName: "New Delhi",
    type: "Rajdhani",
    runDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
    isDaily: false,
  },
  {
    trainNumber: "12424",
    trainName: "New Delhi - Dibrugarh Town Rajdhani Express",
    sourceCode: "NDLS",
    sourceName: "New Delhi",
    destinationCode: "DBRG",
    destinationName: "Dibrugarh",
    type: "Rajdhani",
    runDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    isDaily: true,
  },
  {
    trainNumber: "12051",
    trainName: "Mumbai CSMT - Madgaon Jan Shatabdi Express",
    sourceCode: "CSMT",
    sourceName: "Mumbai CSMT",
    destinationCode: "MAO",
    destinationName: "Madgaon Jn",
    type: "Jan Shatabdi",
    runDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    isDaily: true,
  },
];

export const ALL_WEEK_DAYS = [
  { key: "mon", short: "M", label: "Mon" },
  { key: "tue", short: "T", label: "Tue" },
  { key: "wed", short: "W", label: "Wed" },
  { key: "thu", short: "T", label: "Thu" },
  { key: "fri", short: "F", label: "Fri" },
  { key: "sat", short: "S", label: "Sat" },
  { key: "sun", short: "S", label: "Sun" },
] as const;

export function getTodayIstDateString(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

export function shiftDateString(yyyyMmDd: string, offsetDays: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyyMmDd);
  const base = match
    ? new Date(
        Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
      )
    : new Date();
  base.setUTCDate(base.getUTCDate() + offsetDays);
  const y = base.getUTCFullYear();
  const m = String(base.getUTCMonth() + 1).padStart(2, "0");
  const d = String(base.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatReadableDate(yyyyMmDd: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyyMmDd);
  if (!match) return yyyyMmDd;
  const dt = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 6, 0, 0)
  );
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(dt);
}

export function formatDurationMinutes(
  minutes: number | null | undefined
): string {
  if (
    typeof minutes !== "number" ||
    !Number.isFinite(minutes) ||
    minutes <= 0
  ) {
    return "--";
  }
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${String(mins).padStart(2, "0")}m`;
}

export function formatDelayText(delayMinutes: number): string {
  if (!Number.isFinite(delayMinutes) || delayMinutes === 0) {
    return "Right On Time";
  }
  if (delayMinutes < 0) {
    return `${Math.abs(Math.round(delayMinutes))} min Early`;
  }
  const rounded = Math.round(delayMinutes);
  if (rounded >= 60) {
    const hrs = Math.floor(rounded / 60);
    const mins = rounded % 60;
    return mins > 0
      ? `Delayed by ${hrs}h ${mins}m`
      : `Delayed by ${hrs}h`;
  }
  return `Delayed by ${rounded} min`;
}

export function formatIstTime(iso: string | null | undefined): string {
  if (!iso) return "--:--";
  const timeMatch = /T(\d{2}):(\d{2})/.exec(iso);
  if (timeMatch && (iso.endsWith("+05:30") || !iso.endsWith("Z"))) {
    const h24 = Number(timeMatch[1]);
    const mm = timeMatch[2];
    const period = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${String(h12).padStart(2, "0")}:${mm} ${period}`;
  }
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
    .format(parsed)
    .toUpperCase();
}

export function computeHaltMinutes(
  arrivalIso?: string | null,
  departureIso?: string | null
): number | null {
  if (!arrivalIso || !departureIso) return null;
  const a = new Date(arrivalIso).getTime();
  const d = new Date(departureIso).getTime();
  if (Number.isNaN(a) || Number.isNaN(d) || d < a) return null;
  const diff = Math.round((d - a) / 60000);
  return diff > 0 ? diff : null;
}

/**
 * Decodes Google-format encoded polyline (1e-5 precision) into [lat, lng] pairs.
 */
export function decodePolyline(
  encoded: string | null | undefined
): Array<[number, number]> {
  if (!encoded || typeof encoded !== "string") return [];
  const points: Array<[number, number]> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  const len = encoded.length;

  while (index < len) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      if (index >= len) return points;
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dLat;

    shift = 0;
    result = 0;
    do {
      if (index >= len) return points;
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dLng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

export function classifyCoach(rawCode: string): {
  role: CoachRole;
  label: string;
} {
  const code = rawCode.trim().toUpperCase();
  if (/^(ENG|LOCO|WDP|WAP|WAG)/.test(code)) {
    return { role: "locomotive", label: "Locomotive Engine" };
  }
  if (/^(LPR|EOG|SLR|PWR|DL|SLRD|LWLRRM)/.test(code)) {
    return { role: "power", label: "Power & Guard Van" };
  }
  if (/^PC/.test(code)) {
    return { role: "pantry", label: "Pantry Car" };
  }
  if (/^(E\d+|EC|EV\d*|EA\d*|K\d+|H\d+|HA\d+)/.test(code)) {
    return {
      role: "executive",
      label: /^H/.test(code) ? "First AC" : "Executive / Vistadome",
    };
  }
  if (/^(C\d+|CC|A\d+|B\d+|M\d+|G\d+|BE\d+|AB\d+)/.test(code)) {
    if (/^C/.test(code)) return { role: "ac", label: "AC Chair Car" };
    if (/^A/.test(code)) return { role: "ac", label: "AC 2-Tier" };
    if (/^M/.test(code)) return { role: "ac", label: "AC 3-Tier Economy" };
    return { role: "ac", label: "AC 3-Tier" };
  }
  if (/^(S\d+|SL|D\d+|2S|SE\d+)/.test(code)) {
    return {
      role: "sleeper",
      label: /^D|^2S/.test(code) ? "Second Sitting" : "Sleeper Class",
    };
  }
  return { role: "general", label: "General / Unreserved" };
}

export function parseCoachPosition(raw: string | null | undefined): CoachUnit[] {
  if (!raw || typeof raw !== "string") return [];
  const tokens = raw
    .split(/[-,\s]+/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  let coachCounter = 0;
  return tokens.map((code, idx) => {
    const { role, label } = classifyCoach(code);
    const isLoco = role === "locomotive";
    if (!isLoco) coachCounter += 1;
    return {
      index: idx,
      coachOrderFromEngine: isLoco ? 0 : coachCounter,
      code,
      role,
      label,
    };
  });
}

export function deriveTrackingState(
  status: string,
  locStatus?: string | null
): TrainTrackingState {
  const s = (status || "").toLowerCase().trim();
  const loc = (locStatus || "").toLowerCase().trim();

  if (s === "cancelled" || s === "diverted-cancelled") return "cancelled";
  if (s === "completed" || s === "arrived" || s === "terminated") {
    return "completed";
  }
  if (s === "not-started" || s === "scheduled" || !s) {
    return "not-started";
  }
  if (
    s === "at-station" ||
    s === "halted" ||
    loc === "at-station" ||
    loc === "halted" ||
    loc === "arrived"
  ) {
    return "halted";
  }
  return "running";
}

export function formatTrainStatusLabel(
  status: string,
  isActivelyTracked: boolean,
  locStatus?: string | null
): string {
  const state = deriveTrackingState(status, locStatus);
  switch (state) {
    case "not-started":
      return "Not Started Yet";
    case "halted":
      return "Halted at Station";
    case "running":
      return isActivelyTracked ? "Running Live" : "In Transit";
    case "completed":
      return "Journey Completed";
    case "cancelled":
      return "Train Cancelled";
  }
}
