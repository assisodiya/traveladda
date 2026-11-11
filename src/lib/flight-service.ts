import { promises as fs } from "node:fs";
import path from "node:path";
import { cacheLife } from "next/cache";
import {
  AIRLINE_DISPLAY_ALIASES,
  type AirlineSearchItem,
  type FlightLifecycleTone,
  getFlightTodayIstDateString,
  type NormalizedFlightAircraft,
  type NormalizedFlightEndpoint,
  type NormalizedFlightLeg,
  type NormalizedFlightStatusData,
  type NormalizedPreviousFlight,
  type OwnedAirlineSearchApiResponse,
  type OwnedFlightStatusApiResponse,
  POPULAR_AIRLINES,
  shiftIsoDateByDays,
  type UpstreamFlightViewAirline,
} from "./flight-types";

const FLIGHTVIEW_ORIGIN = "https://app.flightview.com";
const FLIGHTVIEW_AIRLINES_URL =
  "https://app-api.flightview.com/api/static/airlines";
const FLIGHTVIEW_FLIGHT_V2_URL =
  "https://app-api.flightview.com/api/v2/flight";
const MMT_AIRLINE_ICON_BASE_URL =
  "https://imgak.mmtcdn.com/flights/assets/media/dt/common/icons";

const PUBLIC_AIRLINES_DIR = path.join(process.cwd(), "public", "airlines");

const FLIGHTVIEW_HEADERS: Record<string, string> = {
  Origin: FLIGHTVIEW_ORIGIN,
  Referer: FLIGHTVIEW_ORIGIN,
  Accept: "application/json",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
};

export interface AirlineIconResult {
  buffer: Buffer;
  contentType: string;
  source:
    | "local-public-daily-cache"
    | "mmt-cdn-saved-to-public"
    | "local-public-stale-fallback"
    | "generated-svg-fallback";
  publicPath: string | null;
}

const inFlightIconDownloads = new Map<string, Promise<AirlineIconResult>>();
const missingCdnIconDayCache = new Map<string, string>();

function formatTimestampToIstDate(ms: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(ms));
}

function getCurrentIstDateTimeLabel(): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(new Date());
}

export function sanitizeAirlineCode(rawCode: string): string | null {
  const cleaned = rawCode
    .trim()
    .replace(/\.png$/i, "")
    .toUpperCase();
  if (!/^[A-Z0-9]{2,3}$/.test(cleaned)) {
    return null;
  }
  return cleaned;
}

function buildFallbackAirlineBadgeSvg(code: string): Buffer {
  const safeCode = code.replace(/[^A-Z0-9]/g, "").slice(0, 3) || "AIR";
  const fontSize = safeCode.length >= 3 ? 17 : 20;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" role="img" aria-label="${safeCode}">
  <defs>
    <linearGradient id="taAirGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#taAirGrad)"/>
  <rect x="3" y="3" width="58" height="58" rx="13" fill="none" stroke="#ffffff" stroke-opacity="0.28" stroke-width="1.5"/>
  <text x="32" y="39" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" font-weight="800" font-size="${fontSize}" letter-spacing="0.5" fill="#ffffff">${safeCode}</text>
</svg>`;
  return Buffer.from(svg, "utf-8");
}

/**
 * Ensures the airline's PNG icon from MMT CDN is downloaded and saved locally
 * in `public/airlines/{CODE}.png` on a daily basis (refreshed once per IST day).
 */
export async function ensureDailyAirlineIcon(
  rawCode: string
): Promise<AirlineIconResult> {
  const code = sanitizeAirlineCode(rawCode);
  if (!code) {
    return {
      buffer: buildFallbackAirlineBadgeSvg("AIR"),
      contentType: "image/svg+xml",
      source: "generated-svg-fallback",
      publicPath: null,
    };
  }

  const existingPromise = inFlightIconDownloads.get(code);
  if (existingPromise) {
    return existingPromise;
  }

  const task = (async (): Promise<AirlineIconResult> => {
    const todayIst = getFlightTodayIstDateString();
    const localFilePath = path.join(PUBLIC_AIRLINES_DIR, `${code}.png`);
    const publicRelPath = `/airlines/${code}.png`;

    let staleBuffer: Buffer | null = null;

    try {
      const stat = await fs.stat(localFilePath);
      if (stat.isFile() && stat.size > 64) {
        const fileDayIst = formatTimestampToIstDate(stat.mtimeMs);
        const ageMs = Date.now() - stat.mtimeMs;
        if (fileDayIst === todayIst && ageMs < 24 * 60 * 60 * 1000) {
          const cachedBytes = await fs.readFile(localFilePath);
          return {
            buffer: cachedBytes,
            contentType: "image/png",
            source: "local-public-daily-cache",
            publicPath: publicRelPath,
          };
        }
        staleBuffer = await fs.readFile(localFilePath);
      }
    } catch {
      // File does not exist locally yet; proceed to download from CDN
    }

    // Avoid repeatedly hitting MMT CDN today if it already returned 404 today
    if (missingCdnIconDayCache.get(code) === todayIst && !staleBuffer) {
      return {
        buffer: buildFallbackAirlineBadgeSvg(code),
        contentType: "image/svg+xml",
        source: "generated-svg-fallback",
        publicPath: null,
      };
    }

    try {
      const cdnUrl = `${MMT_AIRLINE_ICON_BASE_URL}/${encodeURIComponent(code)}.png`;
      const response = await fetch(cdnUrl, {
        headers: {
          Accept: "image/png,image/*;q=0.9,*/*;q=0.5",
          "User-Agent": FLIGHTVIEW_HEADERS["User-Agent"],
        },
        signal: AbortSignal.timeout(7000),
        cache: "no-store",
      });

      const contentType = response.headers.get("content-type") ?? "";
      if (response.ok && contentType.toLowerCase().startsWith("image/")) {
        const arrayBuf = await response.arrayBuffer();
        const imgBuffer = Buffer.from(arrayBuf);

        if (imgBuffer.byteLength > 64) {
          try {
            await fs.mkdir(PUBLIC_AIRLINES_DIR, { recursive: true });
            const tempPath = path.join(
              PUBLIC_AIRLINES_DIR,
              `${code}.${process.pid}.${Date.now()}.tmp`
            );
            await fs.writeFile(tempPath, imgBuffer);
            await fs.rename(tempPath, localFilePath);
          } catch {
            // Even on read-only serverless fs, still serve the fetched buffer cleanly
            try {
              await fs.writeFile(localFilePath, imgBuffer);
            } catch {
              // Ignore fs write failure if read-only deployment environment
            }
          }

          missingCdnIconDayCache.delete(code);
          return {
            buffer: imgBuffer,
            contentType: "image/png",
            source: "mmt-cdn-saved-to-public",
            publicPath: publicRelPath,
          };
        }
      }

      if (response.status === 404) {
        missingCdnIconDayCache.set(code, todayIst);
      }
    } catch {
      // Network timeout; fall back to stale local icon or generated SVG badge
    }

    if (staleBuffer) {
      return {
        buffer: staleBuffer,
        contentType: "image/png",
        source: "local-public-stale-fallback",
        publicPath: publicRelPath,
      };
    }

    return {
      buffer: buildFallbackAirlineBadgeSvg(code),
      contentType: "image/svg+xml",
      source: "generated-svg-fallback",
      publicPath: null,
    };
  })();

  inFlightIconDownloads.set(code, task);
  try {
    return await task;
  } finally {
    inFlightIconDownloads.delete(code);
  }
}

export function warmDailyAirlineIcons(codes: string[]): void {
  const unique = Array.from(
    new Set(
      codes
        .map((c) => sanitizeAirlineCode(c))
        .filter((c): c is string => Boolean(c))
    )
  ).slice(0, 10);

  for (const code of unique) {
    void ensureDailyAirlineIcon(code).catch(() => {});
  }
}

function normalizeUpstreamAirlineItem(
  item: UpstreamFlightViewAirline
): AirlineSearchItem | null {
  const cleanCode = sanitizeAirlineCode(String(item.code ?? ""));
  if (!cleanCode) return null;

  const rawName = String(item.name ?? "").trim() || cleanCode;
  const aliasEntry = AIRLINE_DISPLAY_ALIASES[cleanCode];
  const preferredName = aliasEntry ? aliasEntry.preferredName : rawName;
  const aliasName =
    aliasEntry && aliasEntry.preferredName.toLowerCase() !== rawName.toLowerCase()
      ? rawName
      : null;

  return {
    id: typeof item.id === "number" ? item.id : 0,
    code: cleanCode,
    name: preferredName,
    aliasName,
    phoneFree: typeof item.phoneFree === "string" ? item.phoneFree.trim() : "",
    phoneOther:
      typeof item.phoneOther === "string" ? item.phoneOther.trim() : "",
    isRegionalOnly: Boolean(item.isRegionalOnly),
    listOnlyLookup: Boolean(item.listOnlyLookup),
    codeDisplay:
      typeof item.codeDisplay === "string" && item.codeDisplay.trim()
        ? item.codeDisplay.trim()
        : cleanCode,
    iconUrl: `/api/flights/icon/${cleanCode}`,
    publicIconPath: `/airlines/${cleanCode}.png`,
  };
}

export async function searchOwnedAirlines(
  rawSearchTerm: string
): Promise<{ httpStatus: number; body: OwnedAirlineSearchApiResponse }> {
  const query = rawSearchTerm.trim();

  if (!query) {
    warmDailyAirlineIcons(POPULAR_AIRLINES.map((a) => a.code));
    return {
      httpStatus: 200,
      body: {
        success: true,
        provider: "TravelAdda Owned Flight API v1",
        query: "",
        count: POPULAR_AIRLINES.length,
        data: POPULAR_AIRLINES,
      },
    };
  }

  const lowerQuery = query.toLowerCase();

  // Check local alias matches (e.g., "akasa" -> QP, "indigo" -> 6E)
  const localAliasMatches = POPULAR_AIRLINES.filter((airline) => {
    const aliasInfo = AIRLINE_DISPLAY_ALIASES[airline.code];
    const matchesKeyword = aliasInfo?.keywords.some((kw) =>
      kw.includes(lowerQuery)
    );
    return (
      airline.code.toLowerCase().includes(lowerQuery) ||
      airline.name.toLowerCase().includes(lowerQuery) ||
      (airline.aliasName?.toLowerCase().includes(lowerQuery) ?? false) ||
      Boolean(matchesKeyword)
    );
  });

  try {
    const upstreamUrl = `${FLIGHTVIEW_AIRLINES_URL}?searchTerm=${encodeURIComponent(query)}`;
    const response = await fetch(upstreamUrl, {
      method: "GET",
      headers: FLIGHTVIEW_HEADERS,
      signal: AbortSignal.timeout(8500),
      cache: "no-store",
    });

    if (!response.ok) {
      if (localAliasMatches.length > 0) {
        warmDailyAirlineIcons(localAliasMatches.map((a) => a.code));
        return {
          httpStatus: 200,
          body: {
            success: true,
            provider: "TravelAdda Owned Flight API v1",
            query,
            count: localAliasMatches.length,
            data: localAliasMatches,
          },
        };
      }

      return {
        httpStatus: 502,
        body: {
          success: false,
          provider: "TravelAdda Owned Flight API v1",
          query,
          count: 0,
          data: [],
          error: {
            code: "UPSTREAM_AIRLINE_SEARCH_FAILED",
            message: `Airline directory returned HTTP ${response.status}.`,
          },
        },
      };
    }

    const rawJson = (await response.json()) as unknown;
    const rawList: UpstreamFlightViewAirline[] = Array.isArray(rawJson)
      ? (rawJson as UpstreamFlightViewAirline[])
      : [];

    const mergedByCode = new Map<string, AirlineSearchItem>();

    // Prioritize exact code or popular Indian/international alias matches first
    for (const localItem of localAliasMatches) {
      mergedByCode.set(localItem.code, localItem);
    }

    for (const upstreamItem of rawList) {
      const normalized = normalizeUpstreamAirlineItem(upstreamItem);
      if (!normalized) continue;
      const existing = mergedByCode.get(normalized.code);
      if (existing) {
        // Enrich phone numbers & upstream ID while preserving friendly alias
        mergedByCode.set(normalized.code, {
          ...existing,
          id: normalized.id || existing.id,
          phoneFree: normalized.phoneFree || existing.phoneFree,
          phoneOther: normalized.phoneOther || existing.phoneOther,
          isRegionalOnly: normalized.isRegionalOnly,
          listOnlyLookup: normalized.listOnlyLookup,
        });
      } else {
        mergedByCode.set(normalized.code, normalized);
      }
    }

    const sortedResults = Array.from(mergedByCode.values()).sort((a, b) => {
      const aExact = a.code.toLowerCase() === lowerQuery ? 0 : 1;
      const bExact = b.code.toLowerCase() === lowerQuery ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;

      const aStartsWith = a.name.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
      const bStartsWith = b.name.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
      if (aStartsWith !== bStartsWith) return aStartsWith - bStartsWith;

      return a.name.localeCompare(b.name);
    });

    const limited = sortedResults.slice(0, 25);
    warmDailyAirlineIcons(limited.map((a) => a.code));

    return {
      httpStatus: 200,
      body: {
        success: true,
        provider: "TravelAdda Owned Flight API v1",
        query,
        count: limited.length,
        data: limited,
      },
    };
  } catch {
    if (localAliasMatches.length > 0) {
      warmDailyAirlineIcons(localAliasMatches.map((a) => a.code));
      return {
        httpStatus: 200,
        body: {
          success: true,
          provider: "TravelAdda Owned Flight API v1",
          query,
          count: localAliasMatches.length,
          data: localAliasMatches,
        },
      };
    }

    return {
      httpStatus: 504,
      body: {
        success: false,
        provider: "TravelAdda Owned Flight API v1",
        query,
        count: 0,
        data: [],
        error: {
          code: "AIRLINE_SEARCH_TIMEOUT",
          message:
            "Unable to reach live airline directory right now. Please try again in a moment.",
        },
      },
    };
  }
}

interface RawFlightEndpoint {
  timeRemaining?: string | null;
  onGroundTime?: string | null;
  inGateTime?: string | null;
  offGroundTime?: string | null;
  outGateTime?: string | null;
  gate?: string | null;
  baggage?: string | null;
  arrivalDateTime?: string | null;
  departureDateTime?: string | null;
  duration?: string | null;
  airport?: string | null;
  airportCity?: string | null;
  airportCode?: string | null;
  airportCountryCode?: string | null;
  airportSlug?: string | null;
  scheduledTime?: string | null;
  estimatedTime?: string | null;
  terminal?: string | null;
}

interface RawFlightObject {
  arrival?: RawFlightEndpoint | null;
  departure?: RawFlightEndpoint | null;
  titles?: {
    main?: string | null;
    sub?: string | null;
  } | null;
  aircraft?: {
    id?: number | null;
    code?: string | null;
    name?: string | null;
  } | null;
  flightStatus?: string | null;
  showMap?: boolean | null;
  scheduleInstanceKey?: string | null;
  previousFlight?: {
    airlineCode?: string | null;
    airlineName?: string | null;
    flightNumber?: string | number | null;
    departureDate?: string | null;
    departureAirport?: string | null;
  } | null;
}

interface RawFlightViewV2Response {
  flights?: RawFlightObject[] | null;
  flight?: RawFlightObject | null;
  emptyResults?: boolean;
}

function cleanNullableText(val: unknown): string | null {
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseDurationMinutes(durationStr: string | null): number | null {
  if (!durationStr) return null;
  const hrMatch = durationStr.match(/(\d+)\s*(?:hr|hrs|h)/i);
  const minMatch = durationStr.match(/(\d+)\s*(?:min|mins|m)/i);
  const hours = hrMatch ? Number(hrMatch[1]) : 0;
  const minutes = minMatch ? Number(minMatch[1]) : 0;
  const total = hours * 60 + minutes;
  return total > 0 ? total : null;
}

function classifyFlightStatusTone(statusText: string): FlightLifecycleTone {
  const lower = statusText.toLowerCase();
  if (
    lower.includes("cancel") ||
    lower.includes("divert")
  ) {
    return "cancelled";
  }
  if (lower.includes("delay") || lower.includes("late")) {
    return "delayed";
  }
  if (
    lower.includes("in air") ||
    lower.includes("en route") ||
    lower.includes("enroute") ||
    lower.includes("airborne") ||
    lower.includes("departed") ||
    lower.includes("off ground")
  ) {
    return "in_air";
  }
  if (
    lower.includes("arrived") ||
    lower.includes("landed") ||
    lower.includes("in gate") ||
    lower.includes("on ground") ||
    lower.includes("completed")
  ) {
    return "arrived";
  }
  return "scheduled";
}

function computeFlightProgressPercent(
  tone: FlightLifecycleTone,
  depIso: string | null,
  arrIso: string | null,
  durationText: string | null,
  remainingText: string | null,
  outGateTime: string | null
): number {
  if (tone === "arrived") return 100;
  if (tone === "cancelled") return 0;
  if (tone === "scheduled") {
    return outGateTime ? 8 : 0;
  }

  const totalMins = parseDurationMinutes(durationText);
  const remMins = parseDurationMinutes(remainingText);
  if (totalMins && remMins !== null && remMins <= totalMins) {
    const pct = Math.round(((totalMins - remMins) / totalMins) * 100);
    return Math.max(10, Math.min(95, pct));
  }

  if (depIso && arrIso) {
    const depMs = Date.parse(depIso);
    const arrMs = Date.parse(arrIso);
    const nowMs = Date.now();
    if (Number.isFinite(depMs) && Number.isFinite(arrMs) && arrMs > depMs) {
      if (tone === "in_air") {
        const rawPct = Math.round(((nowMs - depMs) / (arrMs - depMs)) * 100);
        if (rawPct >= 5 && rawPct <= 97) {
          return rawPct;
        }
      } else if (tone === "delayed" && nowMs > depMs && nowMs < arrMs) {
        return 12;
      }
    }
  }

  return tone === "in_air" ? 56 : 0;
}

function extractAirlineDisplayName(
  airlineCode: string,
  rawTitleMain: string | null
): { airlineName: string; titleMain: string } {
  const alias = AIRLINE_DISPLAY_ALIASES[airlineCode];
  if (alias) {
    return {
      airlineName: alias.preferredName,
      titleMain: `${alias.preferredName} (${airlineCode})`,
    };
  }

  if (rawTitleMain) {
    // Example: "Starlight Airlines (QP) 562" -> extract "Starlight Airlines"
    const match = rawTitleMain.match(/^(.+?)\s*\([A-Z0-9]{2,3}\)/i);
    if (match && match[1]) {
      return {
        airlineName: match[1].trim(),
        titleMain: rawTitleMain.trim(),
      };
    }
  }

  return {
    airlineName: airlineCode,
    titleMain: rawTitleMain?.trim() || airlineCode,
  };
}

function normalizeEndpoint(
  raw: RawFlightEndpoint | null | undefined,
  kind: "departure" | "arrival"
): NormalizedFlightEndpoint {
  const dateTimeIso =
    kind === "departure"
      ? cleanNullableText(raw?.departureDateTime)
      : cleanNullableText(raw?.arrivalDateTime);

  return {
    airport: cleanNullableText(raw?.airport) ?? "Airport TBA",
    airportCity: cleanNullableText(raw?.airportCity) ?? "City TBA",
    airportCode: cleanNullableText(raw?.airportCode) ?? "---",
    airportCountryCode: cleanNullableText(raw?.airportCountryCode) ?? "",
    airportSlug: cleanNullableText(raw?.airportSlug) ?? "",
    scheduledTime: cleanNullableText(raw?.scheduledTime),
    estimatedTime: cleanNullableText(raw?.estimatedTime),
    dateTimeIso,
    terminal: cleanNullableText(raw?.terminal),
    gate: cleanNullableText(raw?.gate),
    baggage: cleanNullableText(raw?.baggage),
    duration: cleanNullableText(raw?.duration),
    timeRemaining: cleanNullableText(raw?.timeRemaining),
    offGroundTime: cleanNullableText(raw?.offGroundTime),
    outGateTime: cleanNullableText(raw?.outGateTime),
    onGroundTime: cleanNullableText(raw?.onGroundTime),
    inGateTime: cleanNullableText(raw?.inGateTime),
  };
}

function normalizeFlightLeg(
  rawFlight: RawFlightObject,
  airlineCode: string,
  flightNumber: string,
  departureDate: string
): NormalizedFlightLeg {
  const departure = normalizeEndpoint(rawFlight.departure, "departure");
  const arrival = normalizeEndpoint(rawFlight.arrival, "arrival");
  const flightStatus = cleanNullableText(rawFlight.flightStatus) ?? "Scheduled";
  const statusTone = classifyFlightStatusTone(flightStatus);

  const rawTitleMain = cleanNullableText(rawFlight.titles?.main);
  const { airlineName } = extractAirlineDisplayName(airlineCode, rawTitleMain);
  const formattedMainTitle = `${airlineName} (${airlineCode}) ${flightNumber}`;

  const progressPercent = computeFlightProgressPercent(
    statusTone,
    departure.dateTimeIso,
    arrival.dateTimeIso,
    departure.duration,
    arrival.timeRemaining,
    departure.outGateTime
  );

  let aircraft: NormalizedFlightAircraft | null = null;
  if (rawFlight.aircraft && (rawFlight.aircraft.name || rawFlight.aircraft.code)) {
    aircraft = {
      id: typeof rawFlight.aircraft.id === "number" ? rawFlight.aircraft.id : null,
      code: cleanNullableText(rawFlight.aircraft.code) ?? "",
      name:
        cleanNullableText(rawFlight.aircraft.name) ??
        cleanNullableText(rawFlight.aircraft.code) ??
        "Commercial Aircraft",
    };
  }

  let previousFlight: NormalizedPreviousFlight | null = null;
  if (
    rawFlight.previousFlight &&
    rawFlight.previousFlight.airlineCode &&
    rawFlight.previousFlight.flightNumber
  ) {
    const prevCode =
      sanitizeAirlineCode(String(rawFlight.previousFlight.airlineCode)) ??
      String(rawFlight.previousFlight.airlineCode).trim().toUpperCase();
    const prevAlias = AIRLINE_DISPLAY_ALIASES[prevCode];
    previousFlight = {
      airlineCode: prevCode,
      airlineName:
        prevAlias?.preferredName ??
        cleanNullableText(rawFlight.previousFlight.airlineName),
      flightNumber: String(rawFlight.previousFlight.flightNumber).trim(),
      departureDate: cleanNullableText(rawFlight.previousFlight.departureDate),
      departureAirport: cleanNullableText(
        rawFlight.previousFlight.departureAirport
      ),
    };
  }

  return {
    airlineCode,
    airlineName,
    flightNumber,
    flightCodeLabel: `${airlineCode} ${flightNumber}`,
    departureDate,
    titleMain: formattedMainTitle,
    titleSub: cleanNullableText(rawFlight.titles?.sub),
    flightStatus,
    statusTone,
    progressPercent,
    isLiveInAir: statusTone === "in_air",
    showMap: Boolean(rawFlight.showMap),
    scheduleInstanceKey: cleanNullableText(rawFlight.scheduleInstanceKey),
    iconUrl: `/api/flights/icon/${airlineCode}`,
    publicIconPath: `/airlines/${airlineCode}.png`,
    departure,
    arrival,
    aircraft,
    previousFlight,
  };
}

export async function fetchOwnedFlightStatus(
  rawAirlineCode: string,
  rawFlightNumber: string,
  rawDepartureDate?: string | null
): Promise<{ httpStatus: number; body: OwnedFlightStatusApiResponse }> {
  const airlineCode = sanitizeAirlineCode(rawAirlineCode);
  if (!airlineCode) {
    return {
      httpStatus: 400,
      body: {
        success: false,
        provider: "TravelAdda Owned Flight API v1",
        error: {
          code: "INVALID_AIRLINE_CODE",
          message:
            "Please select a valid 2 or 3-character airline code (e.g., 6E, AI, IX, QP, EK).",
          hint: "Use the Airline Search box to look up any airline by name or IATA code.",
        },
      },
    };
  }

  // Strip optional airline prefix if user pasted "6E 2045" into flightNumber field
  let cleanedNum = rawFlightNumber.trim().toUpperCase();
  if (cleanedNum.startsWith(airlineCode)) {
    cleanedNum = cleanedNum.slice(airlineCode.length).replace(/^[\s-]+/, "");
  }
  cleanedNum = cleanedNum.replace(/\s+/g, "").replace(/^0+(?=\d)/, "");

  if (!/^\d{1,4}[A-Z]?$/.test(cleanedNum)) {
    return {
      httpStatus: 400,
      body: {
        success: false,
        provider: "TravelAdda Owned Flight API v1",
        error: {
          code: "INVALID_FLIGHT_NUMBER",
          message:
            "Please enter a valid numeric flight number (1 to 4 digits, e.g., 562, 101, 2045).",
          hint: `Example: Airline ${airlineCode} + Flight Number 562`,
        },
      },
    };
  }

  const todayIst = getFlightTodayIstDateString();
  const departureDate =
    rawDepartureDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDepartureDate.trim())
      ? rawDepartureDate.trim()
      : todayIst;

  // Ensure daily local icon is saved in public/airlines/{CODE}.png
  void ensureDailyAirlineIcon(airlineCode).catch(() => {});

  try {
    const upstreamUrl = `${FLIGHTVIEW_FLIGHT_V2_URL}/${encodeURIComponent(
      airlineCode
    )}/${encodeURIComponent(cleanedNum)}?departureDate=${encodeURIComponent(
      departureDate
    )}`;

    const response = await fetch(upstreamUrl, {
      method: "GET",
      headers: FLIGHTVIEW_HEADERS,
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        httpStatus: response.status === 404 ? 404 : 502,
        body: {
          success: false,
          provider: "TravelAdda Owned Flight API v1",
          error: {
            code: "UPSTREAM_FLIGHT_STATUS_ERROR",
            message: `Unable to fetch flight ${airlineCode} ${cleanedNum} for ${departureDate} (HTTP ${response.status}).`,
            hint: "Double-check the airline code, flight number, and departure date.",
          },
        },
      };
    }

    const payload = (await response.json()) as RawFlightViewV2Response;

    const rawLegs: RawFlightObject[] = [];
    if (Array.isArray(payload.flights) && payload.flights.length > 0) {
      for (const item of payload.flights) {
        if (item && (item.departure || item.arrival)) {
          rawLegs.push(item);
        }
      }
    }
    if (
      payload.flight &&
      (payload.flight.departure || payload.flight.arrival) &&
      rawLegs.length === 0
    ) {
      rawLegs.push(payload.flight);
    }

    if (payload.emptyResults || rawLegs.length === 0) {
      return {
        httpStatus: 404,
        body: {
          success: false,
          provider: "TravelAdda Owned Flight API v1",
          error: {
            code: "FLIGHT_NOT_FOUND_FOR_DATE",
            message: `No scheduled or active flight found for ${airlineCode} ${cleanedNum} departing on ${departureDate}.`,
            hint: "Check if this flight operates on selected weekdays, or switch Departure Date to Yesterday / Today / Tomorrow.",
          },
        },
      };
    }

    const normalizedLegs = rawLegs.map((leg) =>
      normalizeFlightLeg(leg, airlineCode, cleanedNum, departureDate)
    );

    const primaryFlight =
      normalizedLegs.find((l) => l.isLiveInAir) ?? normalizedLegs[0];

    if (primaryFlight.previousFlight?.airlineCode) {
      void ensureDailyAirlineIcon(
        primaryFlight.previousFlight.airlineCode
      ).catch(() => {});
    }

    const normalizedData: NormalizedFlightStatusData = {
      query: {
        airlineCode,
        flightNumber: cleanedNum,
        departureDate,
      },
      primaryFlight,
      legs: normalizedLegs,
      emptyResults: false,
      fetchedAtIst: getCurrentIstDateTimeLabel(),
    };

    return {
      httpStatus: 200,
      body: {
        success: true,
        provider: "TravelAdda Owned Flight API v1",
        data: normalizedData,
      },
    };
  } catch {
    return {
      httpStatus: 504,
      body: {
        success: false,
        provider: "TravelAdda Owned Flight API v1",
        error: {
          code: "FLIGHT_RADAR_TIMEOUT",
          message:
            "Live aviation telemetry timed out while looking up this flight. Please tap Track Flight Status again.",
          hint: "Try refreshing in a few seconds.",
        },
      },
    };
  }
}

export async function fetchCachedFlightStatusForSeo(
  airlineCode: string,
  flightNumber: string,
  departureDate?: string | null
): Promise<NormalizedFlightStatusData | null> {
  "use cache";
  cacheLife("minutes");

  const todayIst = getFlightTodayIstDateString();
  const primaryDate =
    departureDate && /^\d{4}-\d{2}-\d{2}$/.test(departureDate)
      ? departureDate
      : todayIst;

  const res = await fetchOwnedFlightStatus(
    airlineCode,
    flightNumber,
    primaryDate
  );
  if (res.body.success && res.body.data) {
    return res.body.data;
  }

  // Fallback to tomorrow or yesterday if flight only operates on specific days or crossed midnight UTC
  if (!departureDate) {
    const tomorrowRes = await fetchOwnedFlightStatus(
      airlineCode,
      flightNumber,
      shiftIsoDateByDays(todayIst, 1)
    );
    if (tomorrowRes.body.success && tomorrowRes.body.data) {
      return tomorrowRes.body.data;
    }

    const yesterdayRes = await fetchOwnedFlightStatus(
      airlineCode,
      flightNumber,
      shiftIsoDateByDays(todayIst, -1)
    );
    if (yesterdayRes.body.success && yesterdayRes.body.data) {
      return yesterdayRes.body.data;
    }
  }

  return null;
}


