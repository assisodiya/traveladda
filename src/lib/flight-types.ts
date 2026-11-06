export interface UpstreamFlightViewAirline {
  id: number;
  code: string;
  name: string;
  useForRandom?: boolean;
  phoneFree?: string;
  phoneOther?: string;
  isRegionalOnly?: boolean;
  listOnlyLookup?: boolean;
  codeDisplay?: string;
}

export interface AirlineSearchItem {
  id: number;
  code: string;
  name: string;
  aliasName: string | null;
  phoneFree: string;
  phoneOther: string;
  isRegionalOnly: boolean;
  listOnlyLookup: boolean;
  codeDisplay: string;
  /** Served via daily local public cache route (/api/flights/icon/{CODE}) */
  iconUrl: string;
  /** Direct local static path saved daily in public/airlines/{CODE}.png */
  publicIconPath: string;
}

export interface NormalizedFlightEndpoint {
  airport: string;
  airportCity: string;
  airportCode: string;
  airportCountryCode: string;
  airportSlug: string;
  scheduledTime: string | null;
  estimatedTime: string | null;
  dateTimeIso: string | null;
  terminal: string | null;
  gate: string | null;
  baggage: string | null;
  duration: string | null;
  timeRemaining: string | null;
  offGroundTime: string | null;
  outGateTime: string | null;
  onGroundTime: string | null;
  inGateTime: string | null;
}

export interface NormalizedFlightAircraft {
  id: number | null;
  code: string;
  name: string;
}

export interface NormalizedPreviousFlight {
  airlineCode: string;
  airlineName: string | null;
  flightNumber: string;
  departureDate: string | null;
  departureAirport: string | null;
}

export type FlightLifecycleTone =
  | "in_air"
  | "arrived"
  | "scheduled"
  | "delayed"
  | "cancelled";

export interface NormalizedFlightLeg {
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  flightCodeLabel: string;
  departureDate: string;
  titleMain: string;
  titleSub: string | null;
  flightStatus: string;
  statusTone: FlightLifecycleTone;
  progressPercent: number;
  isLiveInAir: boolean;
  showMap: boolean;
  scheduleInstanceKey: string | null;
  iconUrl: string;
  publicIconPath: string;
  departure: NormalizedFlightEndpoint;
  arrival: NormalizedFlightEndpoint;
  aircraft: NormalizedFlightAircraft | null;
  previousFlight: NormalizedPreviousFlight | null;
}

export interface NormalizedFlightStatusData {
  query: {
    airlineCode: string;
    flightNumber: string;
    departureDate: string;
  };
  primaryFlight: NormalizedFlightLeg;
  legs: NormalizedFlightLeg[];
  emptyResults: boolean;
  fetchedAtIst: string;
}

export interface OwnedAirlineSearchApiResponse {
  success: boolean;
  provider: string;
  query: string;
  count: number;
  data: AirlineSearchItem[];
  error?: {
    code: string;
    message: string;
  };
}

export interface OwnedFlightStatusApiResponse {
  success: boolean;
  provider: string;
  data?: NormalizedFlightStatusData;
  error?: {
    code: string;
    message: string;
    hint?: string;
  };
}

export interface PopularFlightPreset {
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  routeCodes: string;
  routeCities: string;
  category: "Domestic" | "International";
}

export const AIRLINE_DISPLAY_ALIASES: Record<
  string,
  { preferredName: string; keywords: string[] }
> = {
  "6E": {
    preferredName: "IndiGo",
    keywords: ["indigo", "indigo air", "6e", "interglobe"],
  },
  AI: {
    preferredName: "Air India",
    keywords: ["air india", "ai", "maharaja", "tata"],
  },
  IX: {
    preferredName: "Air India Express",
    keywords: ["air india express", "ix", "aix", "airasia india"],
  },
  QP: {
    preferredName: "Akasa Air",
    keywords: ["akasa", "akasa air", "qp", "starlight"],
  },
  SG: {
    preferredName: "SpiceJet",
    keywords: ["spicejet", "spice jet", "sg"],
  },
  I5: {
    preferredName: "AIX Connect (AirAsia India)",
    keywords: ["airasia", "aix connect", "i5"],
  },
  S5: {
    preferredName: "Star Air",
    keywords: ["star air", "s5"],
  },
  "9I": {
    preferredName: "Alliance Air",
    keywords: ["alliance air", "9i"],
  },
  IC: {
    preferredName: "Fly91",
    keywords: ["fly91", "ic", "indian airlines"],
  },
  EK: {
    preferredName: "Emirates",
    keywords: ["emirates", "ek", "dubai"],
  },
  QR: {
    preferredName: "Qatar Airways",
    keywords: ["qatar", "qatar airways", "qr", "doha"],
  },
  EY: {
    preferredName: "Etihad Airways",
    keywords: ["etihad", "etihad airways", "ey", "abu dhabi"],
  },
  SQ: {
    preferredName: "Singapore Airlines",
    keywords: ["singapore", "singapore airlines", "sq"],
  },
  BA: {
    preferredName: "British Airways",
    keywords: ["british", "british airways", "ba", "london"],
  },
  LH: {
    preferredName: "Lufthansa",
    keywords: ["lufthansa", "lh", "frankfurt", "munich"],
  },
  TG: {
    preferredName: "Thai Airways",
    keywords: ["thai", "thai airways", "tg", "bangkok"],
  },
};

export const POPULAR_AIRLINES: AirlineSearchItem[] = [
  {
    id: 113430,
    code: "6E",
    name: "IndiGo",
    aliasName: "IndiGo Air",
    phoneFree: "",
    phoneOther: "+91.0124.6173838",
    isRegionalOnly: false,
    listOnlyLookup: false,
    codeDisplay: "6E",
    iconUrl: "/api/flights/icon/6E",
    publicIconPath: "/airlines/6E.png",
  },
  {
    id: 113471,
    code: "AI",
    name: "Air India",
    aliasName: null,
    phoneFree: "1800.180.1407",
    phoneOther: "+91.0116.9329333",
    isRegionalOnly: false,
    listOnlyLookup: false,
    codeDisplay: "AI",
    iconUrl: "/api/flights/icon/AI",
    publicIconPath: "/airlines/AI.png",
  },
  {
    id: 113472,
    code: "IX",
    name: "Air India Express",
    aliasName: null,
    phoneFree: "",
    phoneOther: "+91.044.40013001",
    isRegionalOnly: false,
    listOnlyLookup: false,
    codeDisplay: "IX",
    iconUrl: "/api/flights/icon/IX",
    publicIconPath: "/airlines/IX.png",
  },
  {
    id: 114200,
    code: "QP",
    name: "Akasa Air",
    aliasName: "Starlight Airlines",
    phoneFree: "",
    phoneOther: "+91.9606.112131",
    isRegionalOnly: false,
    listOnlyLookup: false,
    codeDisplay: "QP",
    iconUrl: "/api/flights/icon/QP",
    publicIconPath: "/airlines/QP.png",
  },
  {
    id: 114281,
    code: "SG",
    name: "SpiceJet",
    aliasName: null,
    phoneFree: "",
    phoneOther: "+91.124.4983410",
    isRegionalOnly: false,
    listOnlyLookup: false,
    codeDisplay: "SG",
    iconUrl: "/api/flights/icon/SG",
    publicIconPath: "/airlines/SG.png",
  },
  {
    id: 113797,
    code: "EK",
    name: "Emirates",
    aliasName: null,
    phoneFree: "",
    phoneOther: "+91.9167003333",
    isRegionalOnly: false,
    listOnlyLookup: false,
    codeDisplay: "EK",
    iconUrl: "/api/flights/icon/EK",
    publicIconPath: "/airlines/EK.png",
  },
  {
    id: 114199,
    code: "QR",
    name: "Qatar Airways",
    aliasName: null,
    phoneFree: "",
    phoneOther: "+91.79.61556000",
    isRegionalOnly: false,
    listOnlyLookup: false,
    codeDisplay: "QR",
    iconUrl: "/api/flights/icon/QR",
    publicIconPath: "/airlines/QR.png",
  },
  {
    id: 113812,
    code: "EY",
    name: "Etihad Airways",
    aliasName: null,
    phoneFree: "1800.123.3901",
    phoneOther: "",
    isRegionalOnly: false,
    listOnlyLookup: false,
    codeDisplay: "EY",
    iconUrl: "/api/flights/icon/EY",
    publicIconPath: "/airlines/EY.png",
  },
  {
    id: 114266,
    code: "SQ",
    name: "Singapore Airlines",
    aliasName: null,
    phoneFree: "1800.121.212",
    phoneOther: "",
    isRegionalOnly: false,
    listOnlyLookup: false,
    codeDisplay: "SQ",
    iconUrl: "/api/flights/icon/SQ",
    publicIconPath: "/airlines/SQ.png",
  },
  {
    id: 113654,
    code: "BA",
    name: "British Airways",
    aliasName: null,
    phoneFree: "",
    phoneOther: "+91.124.4120715",
    isRegionalOnly: false,
    listOnlyLookup: false,
    codeDisplay: "BA",
    iconUrl: "/api/flights/icon/BA",
    publicIconPath: "/airlines/BA.png",
  },
  {
    id: 114011,
    code: "LH",
    name: "Lufthansa",
    aliasName: null,
    phoneFree: "1800.102.5838",
    phoneOther: "",
    isRegionalOnly: false,
    listOnlyLookup: false,
    codeDisplay: "LH",
    iconUrl: "/api/flights/icon/LH",
    publicIconPath: "/airlines/LH.png",
  },
  {
    id: 114328,
    code: "TG",
    name: "Thai Airways",
    aliasName: null,
    phoneFree: "",
    phoneOther: "+91.11.41497777",
    isRegionalOnly: false,
    listOnlyLookup: false,
    codeDisplay: "TG",
    iconUrl: "/api/flights/icon/TG",
    publicIconPath: "/airlines/TG.png",
  },
];

export const POPULAR_LIVE_FLIGHTS: PopularFlightPreset[] = [
  {
    airlineCode: "6E",
    airlineName: "IndiGo",
    flightNumber: "2045",
    routeCodes: "DEL → BOM",
    routeCities: "New Delhi to Mumbai",
    category: "Domestic",
  },
  {
    airlineCode: "AI",
    airlineName: "Air India",
    flightNumber: "101",
    routeCodes: "DEL → JFK",
    routeCities: "New Delhi to New York",
    category: "International",
  },
  {
    airlineCode: "QP",
    airlineName: "Akasa Air",
    flightNumber: "1103",
    routeCodes: "BOM → BLR",
    routeCities: "Mumbai to Bengaluru",
    category: "Domestic",
  },
  {
    airlineCode: "EK",
    airlineName: "Emirates",
    flightNumber: "511",
    routeCodes: "DEL → DXB",
    routeCities: "New Delhi to Dubai",
    category: "International",
  },
  {
    airlineCode: "6E",
    airlineName: "IndiGo",
    flightNumber: "2131",
    routeCodes: "DEL → BLR",
    routeCities: "New Delhi to Bengaluru",
    category: "Domestic",
  },
  {
    airlineCode: "BA",
    airlineName: "British Airways",
    flightNumber: "142",
    routeCodes: "DEL → LHR",
    routeCities: "New Delhi to London Heathrow",
    category: "International",
  },
  {
    airlineCode: "IX",
    airlineName: "Air India Express",
    flightNumber: "194",
    routeCodes: "DXB → COK",
    routeCities: "Dubai to Kochi",
    category: "International",
  },
  {
    airlineCode: "QR",
    airlineName: "Qatar Airways",
    flightNumber: "571",
    routeCodes: "DEL → DOH",
    routeCities: "New Delhi to Doha",
    category: "International",
  },
];

export function getFlightTodayIstDateString(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

export function shiftIsoDateByDays(isoDate: string, offsetDays: number): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return isoDate;
  }
  const [y, m, d] = isoDate.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + offsetDays));
  const yyyy = utc.getUTCFullYear();
  const mm = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(utc.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Parses pasted flight strings like "6E 2045", "6E-2045", "AI101", "QP 562", or "562"
 */
export function parseFlightInput(raw: string): {
  extractedAirlineCode: string | null;
  extractedFlightNumber: string;
} {
  const cleaned = raw.trim().toUpperCase().replace(/\s+/g, " ");
  // Match 2-char alphanumeric IATA (must contain at least 1 letter) or 3-letter ICAO + 1-4 digits
  const match = cleaned.match(
    /^([A-Z0-9]{2}|[A-Z]{3})[\s-]*0*(\d{1,4}[A-Z]?)$/
  );
  if (match && /[A-Z]/.test(match[1])) {
    return {
      extractedAirlineCode: match[1],
      extractedFlightNumber: match[2],
    };
  }
  const digitsOnly = cleaned.replace(/[^0-9A-Z]/g, "");
  if (/^\d{1,4}$/.test(digitsOnly)) {
    return {
      extractedAirlineCode: null,
      extractedFlightNumber: digitsOnly,
    };
  }
  const numPart = cleaned.replace(/\D/g, "").slice(0, 4);
  return {
    extractedAirlineCode: null,
    extractedFlightNumber: numPart,
  };
}

