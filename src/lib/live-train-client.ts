import type { PopularChartTrainItem } from "./chart-time-types";
import type { TrainSearchItem } from "./live-train-types";

const DAILY_RUN_DAYS: string[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];
const VB_RUN_DAYS: string[] = ["mon", "tue", "thu", "fri", "sat", "sun"];

/**
 * Lightweight client-side flagship train list (~4 KB instead of 2.24 MB full server catalog).
 * Full 10,173-train search runs via /api/trains/search?q=...
 */
export const CLIENT_POPULAR_TRAINS: TrainSearchItem[] = [
  { trainNumber: "12952", trainName: "New Delhi - Mumbai Central Tejas Rajdhani Express", sourceCode: "NDLS", sourceName: "New Delhi", destinationCode: "MMCT", destinationName: "Mumbai Central", type: "Rajdhani", runDays: DAILY_RUN_DAYS, isDaily: true },
  { trainNumber: "12951", trainName: "Mumbai Central - New Delhi Tejas Rajdhani Express", sourceCode: "MMCT", sourceName: "Mumbai Central", destinationCode: "NDLS", destinationName: "New Delhi", type: "Rajdhani", runDays: DAILY_RUN_DAYS, isDaily: true },
  { trainNumber: "12002", trainName: "New Delhi - Rani Kamalapati Bhopal Shatabdi Express", sourceCode: "NDLS", sourceName: "New Delhi", destinationCode: "RKMP", destinationName: "Rani Kamalapati", type: "Shatabdi", runDays: DAILY_RUN_DAYS, isDaily: true },
  { trainNumber: "12001", trainName: "Rani Kamalapati - New Delhi Bhopal Shatabdi Express", sourceCode: "RKMP", sourceName: "Rani Kamalapati", destinationCode: "NDLS", destinationName: "New Delhi", type: "Shatabdi", runDays: DAILY_RUN_DAYS, isDaily: true },
  { trainNumber: "22436", trainName: "New Delhi - Varanasi Vande Bharat Express", sourceCode: "NDLS", sourceName: "New Delhi", destinationCode: "BSB", destinationName: "Varanasi Jn", type: "Vande Bharat", runDays: ["mon", "tue", "wed", "fri", "sat", "sun"], isDaily: false },
  { trainNumber: "22435", trainName: "Varanasi - New Delhi Vande Bharat Express", sourceCode: "BSB", sourceName: "Varanasi Jn", destinationCode: "NDLS", destinationName: "New Delhi", type: "Vande Bharat", runDays: ["mon", "tue", "wed", "fri", "sat", "sun"], isDaily: false },
  { trainNumber: "12986", trainName: "Delhi Sarai Rohilla - Jaipur Double Decker Express", sourceCode: "DEE", sourceName: "Delhi S Rohilla", destinationCode: "JP", destinationName: "Jaipur Jn", type: "Double Decker", runDays: DAILY_RUN_DAYS, isDaily: true },
  { trainNumber: "12985", trainName: "Jaipur - Delhi Sarai Rohilla Double Decker Express", sourceCode: "JP", sourceName: "Jaipur Jn", destinationCode: "DEE", destinationName: "Delhi S Rohilla", type: "Double Decker", runDays: DAILY_RUN_DAYS, isDaily: true },
  { trainNumber: "12622", trainName: "New Delhi - MGR Chennai Central Tamil Nadu Express", sourceCode: "NDLS", sourceName: "New Delhi", destinationCode: "MAS", destinationName: "MGR Chennai Central", type: "Superfast", runDays: DAILY_RUN_DAYS, isDaily: true },
  { trainNumber: "12621", trainName: "MGR Chennai Central - New Delhi Tamil Nadu Express", sourceCode: "MAS", sourceName: "MGR Chennai Central", destinationCode: "NDLS", destinationName: "New Delhi", type: "Superfast", runDays: DAILY_RUN_DAYS, isDaily: true },
  { trainNumber: "12301", trainName: "Howrah - New Delhi Rajdhani Express (via Gaya)", sourceCode: "HWH", sourceName: "Howrah Jn", destinationCode: "NDLS", destinationName: "New Delhi", type: "Rajdhani", runDays: ["mon", "wed", "thu", "fri", "sat", "sun"], isDaily: false },
  { trainNumber: "12302", trainName: "New Delhi - Howrah Rajdhani Express (via Gaya)", sourceCode: "NDLS", sourceName: "New Delhi", destinationCode: "HWH", destinationName: "Howrah Jn", type: "Rajdhani", runDays: ["mon", "wed", "thu", "fri", "sat", "sun"], isDaily: false },
  { trainNumber: "12424", trainName: "New Delhi - Dibrugarh Town Rajdhani Express", sourceCode: "NDLS", sourceName: "New Delhi", destinationCode: "DBRT", destinationName: "Dibrugarh Town", type: "Rajdhani", runDays: DAILY_RUN_DAYS, isDaily: true },
  { trainNumber: "12423", trainName: "Dibrugarh Town - New Delhi Rajdhani Express", sourceCode: "DBRT", sourceName: "Dibrugarh Town", destinationCode: "NDLS", destinationName: "New Delhi", type: "Rajdhani", runDays: DAILY_RUN_DAYS, isDaily: true },
  { trainNumber: "12051", trainName: "Mumbai CSMT - Madgaon Jan Shatabdi Express", sourceCode: "CSMT", sourceName: "Mumbai CSMT", destinationCode: "MAO", destinationName: "Madgaon Jn", type: "Jan Shatabdi", runDays: DAILY_RUN_DAYS, isDaily: true },
  { trainNumber: "12052", trainName: "Madgaon - Mumbai CSMT Jan Shatabdi Express", sourceCode: "MAO", sourceName: "Madgaon Jn", destinationCode: "CSMT", destinationName: "Mumbai CSMT", type: "Jan Shatabdi", runDays: DAILY_RUN_DAYS, isDaily: true },
  { trainNumber: "20901", trainName: "Mumbai Central - Gandhinagar Capital Vande Bharat Express", sourceCode: "MMCT", sourceName: "Mumbai Central", destinationCode: "GNC", destinationName: "Gandhinagar Capital", type: "Vande Bharat", runDays: VB_RUN_DAYS, isDaily: false },
  { trainNumber: "20902", trainName: "Gandhinagar Capital - Mumbai Central Vande Bharat Express", sourceCode: "GNC", sourceName: "Gandhinagar Capital", destinationCode: "MMCT", destinationName: "Mumbai Central", type: "Vande Bharat", runDays: VB_RUN_DAYS, isDaily: false },
  { trainNumber: "22439", trainName: "New Delhi - SMVD Katra Vande Bharat Express", sourceCode: "NDLS", sourceName: "New Delhi", destinationCode: "SVDK", destinationName: "SMVD Katra", type: "Vande Bharat", runDays: VB_RUN_DAYS, isDaily: false },
  { trainNumber: "12627", trainName: "KSR Bengaluru - New Delhi Karnataka Express", sourceCode: "SBC", sourceName: "KSR Bengaluru", destinationCode: "NDLS", destinationName: "New Delhi", type: "Superfast", runDays: DAILY_RUN_DAYS, isDaily: true },
  { trainNumber: "12628", trainName: "New Delhi - KSR Bengaluru Karnataka Express", sourceCode: "NDLS", sourceName: "New Delhi", destinationCode: "SBC", destinationName: "KSR Bengaluru", type: "Superfast", runDays: DAILY_RUN_DAYS, isDaily: true },
  { trainNumber: "12802", trainName: "Anand Vihar Terminal - Puri Purushottam Express", sourceCode: "ANVT", sourceName: "Anand Vihar Trm", destinationCode: "PURI", destinationName: "Puri", type: "Superfast", runDays: DAILY_RUN_DAYS, isDaily: true },
  { trainNumber: "12801", trainName: "Puri - Anand Vihar Terminal Purushottam Express", sourceCode: "PURI", sourceName: "Puri", destinationCode: "ANVT", destinationName: "Anand Vihar Trm", type: "Superfast", runDays: DAILY_RUN_DAYS, isDaily: true },
  { trainNumber: "12138", trainName: "Firozpur Cantt - Mumbai CSMT Punjab Mail", sourceCode: "FZR", sourceName: "Firozpur Cantt", destinationCode: "CSMT", destinationName: "Mumbai CSMT", type: "Superfast", runDays: DAILY_RUN_DAYS, isDaily: true },
  { trainNumber: "12137", trainName: "Mumbai CSMT - Firozpur Cantt Punjab Mail", sourceCode: "CSMT", sourceName: "Mumbai CSMT", destinationCode: "FZR", destinationName: "Firozpur Cantt", type: "Superfast", runDays: DAILY_RUN_DAYS, isDaily: true },
  { trainNumber: "12904", trainName: "Amritsar - Mumbai Central Golden Temple Mail", sourceCode: "ASR", sourceName: "Amritsar Jn", destinationCode: "MMCT", destinationName: "Mumbai Central", type: "Superfast", runDays: DAILY_RUN_DAYS, isDaily: true },
  { trainNumber: "12903", trainName: "Mumbai Central - Amritsar Golden Temple Mail", sourceCode: "MMCT", sourceName: "Mumbai Central", destinationCode: "ASR", destinationName: "Amritsar Jn", type: "Superfast", runDays: DAILY_RUN_DAYS, isDaily: true },
  { trainNumber: "12724", trainName: "New Delhi - Hyderabad Deccan Telangana Express", sourceCode: "NDLS", sourceName: "New Delhi", destinationCode: "HYB", destinationName: "Hyderabad Deccan", type: "Superfast", runDays: DAILY_RUN_DAYS, isDaily: true },
  { trainNumber: "12723", trainName: "Hyderabad Deccan - New Delhi Telangana Express", sourceCode: "HYB", sourceName: "Hyderabad Deccan", destinationCode: "NDLS", destinationName: "New Delhi", type: "Superfast", runDays: DAILY_RUN_DAYS, isDaily: true },
  { trainNumber: "12394", trainName: "New Delhi - Rajendra Nagar Patna Sampoorna Kranti Express", sourceCode: "NDLS", sourceName: "New Delhi", destinationCode: "RJPB", destinationName: "Rajendra Nagar T", type: "Superfast", runDays: DAILY_RUN_DAYS, isDaily: true },
  { trainNumber: "12393", trainName: "Rajendra Nagar Patna - New Delhi Sampoorna Kranti Express", sourceCode: "RJPB", sourceName: "Rajendra Nagar T", destinationCode: "NDLS", destinationName: "New Delhi", type: "Superfast", runDays: DAILY_RUN_DAYS, isDaily: true },
  { trainNumber: "12839", trainName: "Howrah - MGR Chennai Central Mail", sourceCode: "HWH", sourceName: "Howrah Jn", destinationCode: "MAS", destinationName: "MGR Chennai Central", type: "Superfast", runDays: DAILY_RUN_DAYS, isDaily: true },
];

export const CLIENT_POPULAR_CHART_TRAINS: PopularChartTrainItem[] = [
  { trainNumber: "12952", trainName: "Mmct Tejas Rajdhani", route: "NDLS → MMCT", firstChart: "8:55 AM", slug: "12952-mmct-tejas-raj-chart-times" },
  { trainNumber: "12951", trainName: "New Delhi Tejas Rajdhani", route: "MMCT → NDLS", firstChart: "9:00 AM", slug: "12951-new-delhi-tejas-rajdhani-chart-times" },
  { trainNumber: "12301", trainName: "Howrah Rajdhani Express", route: "HWH → NDLS", firstChart: "8:50 AM", slug: "12301-howrah-rajdhani-express-chart-times" },
  { trainNumber: "12302", trainName: "New Delhi Howrah Rajdhani", route: "NDLS → HWH", firstChart: "8:50 AM", slug: "12302-new-delhi-howrah-rajdhani-chart-times" },
  { trainNumber: "22436", trainName: "Vande Bharat Express", route: "NDLS → BSB", firstChart: "8:00 PM (Prev Day)", slug: "22436-vande-bharat-express-chart-times" },
  { trainNumber: "22435", trainName: "Varanasi Vande Bharat", route: "BSB → NDLS", firstChart: "7:00 AM", slug: "22435-varanasi-vande-bharat-chart-times" },
  { trainNumber: "12986", trainName: "Jaipur Double Decker", route: "DEE → JP", firstChart: "9:25 PM (Prev Day)", slug: "12986-jaipur-double-decker-chart-times" },
  { trainNumber: "12002", trainName: "Bhopal Shatabdi Express", route: "NDLS → RKMP", firstChart: "8:00 PM (Prev Day)", slug: "12002-bhopal-shatabdi-express-chart-times" },
  { trainNumber: "12622", trainName: "Tamil Nadu Express", route: "NDLS → MAS", firstChart: "1:55 PM", slug: "12622-tamil-nadu-express-chart-times" },
  { trainNumber: "12424", trainName: "Dibrugarh Rajdhani Express", route: "NDLS → DBRG", firstChart: "8:20 AM", slug: "12424-dibrugarh-rajdhani-express-chart-times" },
  { trainNumber: "12051", trainName: "Madgaon Jan Shatabdi", route: "CSMT → MAO", firstChart: "8:00 PM (Prev Day)", slug: "12051-madgaon-jan-shatabdi-chart-times" },
  { trainNumber: "20901", trainName: "Gandhinagar Vande Bharat", route: "MMCT → GNC", firstChart: "8:00 PM (Prev Day)", slug: "20901-gandhinagar-vande-bharat-chart-times" },
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

const UNRESERVED_TYPES = new Set([
  "suburban / emu",
  "memu",
  "demu",
  "passenger",
]);

export function isReservedChartEligibleClient(train: {
  trainNumber: string;
  type?: string | null;
}): boolean {
  if (!train.trainNumber || train.trainNumber.startsWith("0")) return false;
  const normalizedType = (train.type || "").trim().toLowerCase();
  if (!normalizedType) return true;
  return !UNRESERVED_TYPES.has(normalizedType);
}

function slugifyToken(name: string): string {
  return (name || "")
    .replace(/\([^)]*\)/g, " ")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function extractCleanTrainNumber(raw: string): string {
  const decoded = decodeURIComponent(raw || "").trim();
  const leading = /^(\d{3,5})(?:-|$)/.exec(decoded);
  if (leading) return leading[1];
  const anyMatch = /\b(\d{4,5})\b/.exec(decoded);
  if (anyMatch) return anyMatch[1];
  return decoded.replace(/\D/g, "").slice(0, 5);
}

export function buildClientTrainLiveStatusPath(
  trainNumber: string,
  trainName?: string | null,
  date?: string | null
): string {
  const cleanNum = extractCleanTrainNumber(trainNumber);
  if (!cleanNum) return "/rail/live-status";

  const popularName = CLIENT_POPULAR_TRAINS.find(
    (t) => t.trainNumber === cleanNum
  )?.trainName;
  const resolvedName =
    popularName ||
    (trainName &&
      !trainName.startsWith("Indian Railways Express #") &&
      trainName) ||
    "";

  const nameSlug = slugifyToken(resolvedName);
  const stripped = nameSlug.startsWith(`${cleanNum}-`)
    ? nameSlug.slice(cleanNum.length + 1)
    : nameSlug;
  const slug =
    !stripped || stripped === cleanNum ? cleanNum : `${cleanNum}-${stripped}`;

  const cleanDate =
    date && /^\d{4}-\d{2}-\d{2}$/.test(date.trim()) ? date.trim() : "";
  return cleanDate
    ? `/rail/live-status/${slug}?date=${cleanDate}`
    : `/rail/live-status/${slug}`;
}

export function buildClientChartTimePath(
  trainNumber: string,
  trainName?: string | null,
  upstreamSlug?: string | null
): string {
  const cleanNum = extractCleanTrainNumber(trainNumber);
  if (!cleanNum) return "/rail/chart-time";

  const popularMatch = CLIENT_POPULAR_CHART_TRAINS.find(
    (t) => t.trainNumber === cleanNum
  );
  if (popularMatch) return `/chart-times/${popularMatch.slug}`;

  if (upstreamSlug && upstreamSlug.trim()) {
    const s = slugifyToken(upstreamSlug);
    if (s.startsWith(cleanNum)) {
      return `/chart-times/${s.endsWith("-chart-times") ? s : `${s}-chart-times`}`;
    }
  }

  const popularTrainName = CLIENT_POPULAR_TRAINS.find(
    (t) => t.trainNumber === cleanNum
  )?.trainName;
  const resolvedName =
    popularTrainName ||
    (trainName &&
      !trainName.startsWith("Indian Railways Express #") &&
      trainName) ||
    "";

  const namePart = slugifyToken(resolvedName);
  const stripped = namePart.startsWith(`${cleanNum}-`)
    ? namePart.slice(cleanNum.length + 1)
    : namePart.replace(/-chart-times?$/, "");
  const slug = stripped
    ? `${cleanNum}-${stripped}-chart-times`
    : `${cleanNum}-chart-times`;
  return `/chart-times/${slug}`;
}

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
    return mins > 0 ? `Delayed by ${hrs}h ${mins}m` : `Delayed by ${hrs}h`;
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
