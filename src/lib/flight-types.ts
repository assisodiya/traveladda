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
  FZ: {
    preferredName: "flydubai",
    keywords: ["flydubai", "fly dubai", "fz"],
  },
  G9: {
    preferredName: "Air Arabia",
    keywords: ["air arabia", "g9", "sharjah"],
  },
  WY: {
    preferredName: "Oman Air",
    keywords: ["oman air", "wy", "muscat"],
  },
  GF: {
    preferredName: "Gulf Air",
    keywords: ["gulf air", "gf", "bahrain"],
  },
  KU: {
    preferredName: "Kuwait Airways",
    keywords: ["kuwait airways", "ku"],
  },
  SV: {
    preferredName: "Saudia",
    keywords: ["saudia", "saudi arabian airlines", "sv", "jeddah", "riyadh"],
  },
  XY: {
    preferredName: "flynas",
    keywords: ["flynas", "fly nas", "xy"],
  },
  J9: {
    preferredName: "Jazeera Airways",
    keywords: ["jazeera", "jazeera airways", "j9"],
  },
  UL: {
    preferredName: "SriLankan Airlines",
    keywords: ["srilankan", "srilankan airlines", "ul", "colombo"],
  },
  MH: {
    preferredName: "Malaysia Airlines",
    keywords: ["malaysia airlines", "mh", "kuala lumpur"],
  },
  OD: {
    preferredName: "Batik Air Malaysia",
    keywords: ["batik air", "malindo", "od"],
  },
  AK: {
    preferredName: "AirAsia",
    keywords: ["airasia", "air asia", "ak"],
  },
  FD: {
    preferredName: "Thai AirAsia",
    keywords: ["thai airasia", "fd"],
  },
  VN: {
    preferredName: "Vietnam Airlines",
    keywords: ["vietnam airlines", "vn", "hanoi", "ho chi minh"],
  },
  VJ: {
    preferredName: "VietJet Air",
    keywords: ["vietjet", "vietjet air", "vj"],
  },
  CX: {
    preferredName: "Cathay Pacific",
    keywords: ["cathay", "cathay pacific", "cx", "hong kong"],
  },
  JL: {
    preferredName: "Japan Airlines",
    keywords: ["japan airlines", "jal", "jl", "tokyo"],
  },
  NH: {
    preferredName: "ANA All Nippon Airways",
    keywords: ["ana", "all nippon", "nh", "tokyo"],
  },
  KE: {
    preferredName: "Korean Air",
    keywords: ["korean air", "ke", "seoul"],
  },
  TK: {
    preferredName: "Turkish Airlines",
    keywords: ["turkish", "turkish airlines", "tk", "istanbul"],
  },
  AF: {
    preferredName: "Air France",
    keywords: ["air france", "af", "paris"],
  },
  KL: {
    preferredName: "KLM Royal Dutch Airlines",
    keywords: ["klm", "royal dutch", "kl", "amsterdam"],
  },
  LX: {
    preferredName: "SWISS",
    keywords: ["swiss", "swiss international", "lx", "zurich"],
  },
  AY: {
    preferredName: "Finnair",
    keywords: ["finnair", "ay", "helsinki"],
  },
  VS: {
    preferredName: "Virgin Atlantic",
    keywords: ["virgin", "virgin atlantic", "vs", "london"],
  },
  UA: {
    preferredName: "United Airlines",
    keywords: ["united", "united airlines", "ua"],
  },
  AA: {
    preferredName: "American Airlines",
    keywords: ["american", "american airlines", "aa"],
  },
  DL: {
    preferredName: "Delta Air Lines",
    keywords: ["delta", "delta air lines", "dl"],
  },
  AC: {
    preferredName: "Air Canada",
    keywords: ["air canada", "ac", "toronto"],
  },
  QF: {
    preferredName: "Qantas",
    keywords: ["qantas", "qf", "sydney", "melbourne"],
  },
  ET: {
    preferredName: "Ethiopian Airlines",
    keywords: ["ethiopian", "ethiopian airlines", "et", "addis ababa"],
  },
  MK: {
    preferredName: "Air Mauritius",
    keywords: ["air mauritius", "mk"],
  },
  KQ: {
    preferredName: "Kenya Airways",
    keywords: ["kenya airways", "kq", "nairobi"],
  },
  HY: {
    preferredName: "Uzbekistan Airways",
    keywords: ["uzbekistan airways", "hy", "tashkent"],
  },
  KC: {
    preferredName: "Air Astana",
    keywords: ["air astana", "kc", "almaty"],
  },
  AZ: {
    preferredName: "ITA Airways",
    keywords: ["ita airways", "alitalia", "az", "rome"],
  },
  LO: {
    preferredName: "LOT Polish Airlines",
    keywords: ["lot polish", "lo", "warsaw"],
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
    flightNumber: "1205",
    routeCodes: "DEL → BOM",
    routeCities: "New Delhi to Mumbai",
    category: "Domestic",
  },
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

function slugifyAirlineToken(input: string): string {
  return (input || "")
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function getAirlineNameByCode(
  airlineCode: string,
  fallbackName?: string | null
): string {
  const upper = (airlineCode || "").trim().toUpperCase();
  if (AIRLINE_DISPLAY_ALIASES[upper]?.preferredName) {
    return AIRLINE_DISPLAY_ALIASES[upper].preferredName;
  }
  const popular = POPULAR_AIRLINES.find((a) => a.code === upper);
  if (popular?.name) {
    return popular.name;
  }
  if (fallbackName && fallbackName.trim() && fallbackName.trim().toUpperCase() !== upper) {
    return fallbackName.trim();
  }
  return upper;
}

/**
 * Builds canonical SEO flight status slug:
 * e.g., buildFlightStatusSlug("6E", "1205", "IndiGo") => "indigo-6e-1205-flight-status"
 * e.g., buildFlightStatusSlug("AI", "101", "Air India") => "air-india-ai-101-flight-status"
 */
export function buildFlightStatusSlug(
  airlineCode: string,
  flightNumber: string,
  airlineName?: string | null
): string {
  const cleanCode = (airlineCode || "").trim().toLowerCase();
  const cleanNum = (flightNumber || "")
    .trim()
    .replace(/^0+(?=\d)/, "")
    .toLowerCase();
  const resolvedName = getAirlineNameByCode(airlineCode, airlineName);
  const nameSlug = slugifyAirlineToken(resolvedName);

  if (!nameSlug || nameSlug === cleanCode) {
    return `${cleanCode}-${cleanNum}-flight-status`;
  }
  // Avoid duplicating code if nameSlug already ends with "-6e"
  if (nameSlug.endsWith(`-${cleanCode}`)) {
    return `${nameSlug}-${cleanNum}-flight-status`;
  }
  return `${nameSlug}-${cleanCode}-${cleanNum}-flight-status`;
}

export function buildFlightStatusPath(
  airlineCode: string,
  flightNumber: string,
  airlineName?: string | null,
  departureDate?: string | null
): string {
  const slug = buildFlightStatusSlug(airlineCode, flightNumber, airlineName);
  const basePath = `/flight-status/${slug}`;
  if (
    departureDate &&
    /^\d{4}-\d{2}-\d{2}$/.test(departureDate) &&
    departureDate !== getFlightTodayIstDateString()
  ) {
    return `${basePath}?date=${encodeURIComponent(departureDate)}`;
  }
  return basePath;
}

export interface ParsedFlightStatusSlug {
  airlineCode: string;
  flightNumber: string;
  airlineName: string;
  canonicalSlug: string;
}

/**
 * Parses any SEO flight slug such as:
 * - "indigo-6e-1205-flight-status"
 * - "air-india-ai-101-flight-status"
 * - "6e-1205-flight-status"
 * - "6e1205-flight-status"
 * - "indigo-1205-flight-status"
 * - "lufthansa-lh-761"
 */
export function parseFlightStatusSlug(
  rawSlug: string
): ParsedFlightStatusSlug | null {
  const decoded = decodeURIComponent(rawSlug || "")
    .trim()
    .toLowerCase()
    .replace(/-?(?:live-)?flight-status$/i, "")
    .replace(/-?status$/i, "")
    .replace(/^-+|-+$/g, "");

  if (!decoded) return null;

  // Pattern 1: "...-<2-or-3-char-code>-<1-to-4-digit-flight-num>" or "<code-slug>-<flight-num>"
  const tokens = decoded.split("-").filter(Boolean);
  if (tokens.length >= 2) {
    const lastToken = tokens[tokens.length - 1];
    const secondLastToken = tokens[tokens.length - 2];

    // Case 1A: secondLastToken is a 2-3 char IATA/ICAO code and lastToken is flight number
    if (
      /^\d{1,4}[a-z]?$/i.test(lastToken) &&
      /^[a-z0-9]{2,3}$/i.test(secondLastToken) &&
      /[a-z]/i.test(secondLastToken)
    ) {
      const airlineCode = secondLastToken.toUpperCase();
      const flightNumber = lastToken.replace(/^0+(?=\d)/, "").toUpperCase();
      const prefixSlug = tokens.slice(0, -2).join("-");
      const fallbackName = prefixSlug
        ? prefixSlug
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
        : undefined;
      const airlineName = getAirlineNameByCode(airlineCode, fallbackName);
      return {
        airlineCode,
        flightNumber,
        airlineName,
        canonicalSlug: buildFlightStatusSlug(
          airlineCode,
          flightNumber,
          airlineName
        ),
      };
    }

    // Case 1B: lastToken is combined "<code2><digits>" e.g. "indigo-6e1205"
    const combinedMatch = /^([a-z0-9]{2}|[a-z]{3})0*(\d{1,4}[a-z]?)$/i.exec(
      lastToken
    );
    if (combinedMatch && /[a-z]/i.test(combinedMatch[1])) {
      const airlineCode = combinedMatch[1].toUpperCase();
      const flightNumber = combinedMatch[2].toUpperCase();
      const airlineName = getAirlineNameByCode(airlineCode);
      return {
        airlineCode,
        flightNumber,
        airlineName,
        canonicalSlug: buildFlightStatusSlug(
          airlineCode,
          flightNumber,
          airlineName
        ),
      };
    }

    // Case 1C: "<airline-name-slug>-<flight-number>" e.g. "indigo-1205" or "air-india-101"
    if (/^\d{1,4}[a-z]?$/i.test(lastToken)) {
      const namePart = tokens.slice(0, -1).join(" ");
      for (const [code, aliasInfo] of Object.entries(AIRLINE_DISPLAY_ALIASES)) {
        if (
          slugifyAirlineToken(aliasInfo.preferredName) ===
            tokens.slice(0, -1).join("-") ||
          aliasInfo.keywords.some((k) => k === namePart)
        ) {
          const flightNumber = lastToken.replace(/^0+(?=\d)/, "").toUpperCase();
          return {
            airlineCode: code,
            flightNumber,
            airlineName: aliasInfo.preferredName,
            canonicalSlug: buildFlightStatusSlug(
              code,
              flightNumber,
              aliasInfo.preferredName
            ),
          };
        }
      }
    }
  }

  // Pattern 2: Single token like "6e1205" or "ai101"
  const singleMatch = /^([a-z0-9]{2}|[a-z]{3})0*(\d{1,4}[a-z]?)$/i.exec(
    decoded
  );
  if (singleMatch && /[a-z]/i.test(singleMatch[1])) {
    const airlineCode = singleMatch[1].toUpperCase();
    const flightNumber = singleMatch[2].toUpperCase();
    const airlineName = getAirlineNameByCode(airlineCode);
    return {
      airlineCode,
      flightNumber,
      airlineName,
      canonicalSlug: buildFlightStatusSlug(
        airlineCode,
        flightNumber,
        airlineName
      ),
    };
  }

  return null;
}

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

