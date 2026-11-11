"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  ALL_WEEK_DAYS,
  buildTrainLiveStatusPath,
  formatDelayText,
  formatIstTime,
  formatReadableDate,
  getTodayIstDateString,
  POPULAR_LIVE_TRAINS,
  shiftDateString,
  type CoachRole,
  type NormalizedLiveTrainData,
  type NormalizedRouteStop,
  type OwnedLiveTrainApiResponse,
  type OwnedTrainSearchApiResponse,
  type TrainSearchItem,
} from "@/lib/live-train-types";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  CloseIcon,
  CoachTrainIcon,
  CompassIcon,
  CopyIcon,
  EngineTrainIcon,
  LiveTrainBeaconIcon,
  PrinterIcon,
  RefreshIcon,
  SearchIcon,
  SwapArrowsIcon,
  TicketIcon,
  TrainIcon,
} from "./Icons";

interface RecentLiveTrainItem {
  trainNumber: string;
  trainName: string;
  route: string;
  lastDate: string;
}

const RECENT_TRAINS_KEY = "traveladda_recent_live_trains_v1";
const EMPTY_RECENT_TRAINS: RecentLiveTrainItem[] = [];

let cachedRawTrains: string | null = null;
let cachedParsedTrains: RecentLiveTrainItem[] = EMPTY_RECENT_TRAINS;
const trainRecentListeners = new Set<() => void>();

function subscribeRecentTrains(listener: () => void) {
  trainRecentListeners.add(listener);
  return () => {
    trainRecentListeners.delete(listener);
  };
}

function getRecentTrainsSnapshot(): RecentLiveTrainItem[] {
  if (typeof window === "undefined") return EMPTY_RECENT_TRAINS;
  try {
    const raw = window.localStorage.getItem(RECENT_TRAINS_KEY);
    if (raw === cachedRawTrains) return cachedParsedTrains;
    cachedRawTrains = raw;
    if (!raw) {
      cachedParsedTrains = EMPTY_RECENT_TRAINS;
      return cachedParsedTrains;
    }
    const parsed = JSON.parse(raw) as unknown;
    cachedParsedTrains = Array.isArray(parsed)
      ? (parsed.slice(0, 5) as RecentLiveTrainItem[])
      : EMPTY_RECENT_TRAINS;
    return cachedParsedTrains;
  } catch {
    return EMPTY_RECENT_TRAINS;
  }
}

function getRecentTrainsServerSnapshot(): RecentLiveTrainItem[] {
  return EMPTY_RECENT_TRAINS;
}

function writeRecentTrainsStorage(next: RecentLiveTrainItem[]) {
  try {
    if (next.length === 0) {
      window.localStorage.removeItem(RECENT_TRAINS_KEY);
      cachedRawTrains = null;
      cachedParsedTrains = EMPTY_RECENT_TRAINS;
    } else {
      const serialized = JSON.stringify(next);
      window.localStorage.setItem(RECENT_TRAINS_KEY, serialized);
      cachedRawTrains = serialized;
      cachedParsedTrains = next;
    }
    for (const listener of trainRecentListeners) listener();
  } catch {
    // Ignore storage write errors
  }
}

function RoutePolylineMap({ data }: { data: NormalizedLiveTrainData }) {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const isActivelyMovingOrHalted =
    data.trackingState === "running" || data.trackingState === "halted";

  const mapProjection = useMemo(() => {
    const rawCoords = data.geometry.coordinates;
    const haltStops = data.route.filter(
      (s): s is NormalizedRouteStop & { lat: number; lng: number } =>
        s.isHalt && s.lat !== null && s.lng !== null
    );

    const allPoints: Array<[number, number]> =
      rawCoords.length >= 2
        ? rawCoords
        : haltStops.map((s) => [s.lat, s.lng]);

    if (allPoints.length < 2) return null;

    const step = Math.max(1, Math.floor(allPoints.length / 180));
    const sampled = allPoints.filter(
      (_, i) => i % step === 0 || i === allPoints.length - 1
    );

    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    for (const [lat, lng] of sampled) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }
    for (const stop of haltStops) {
      if (stop.lat < minLat) minLat = stop.lat;
      if (stop.lat > maxLat) maxLat = stop.lat;
      if (stop.lng < minLng) minLng = stop.lng;
      if (stop.lng > maxLng) maxLng = stop.lng;
    }

    const width = 820;
    const height = 260;
    const padX = 56;
    const padY = 38;

    const latSpan = Math.max(maxLat - minLat, 0.05);
    const lngSpan = Math.max(maxLng - minLng, 0.05);
    const innerW = width - padX * 2;
    const innerH = height - padY * 2;

    const scale = Math.min(innerW / lngSpan, innerH / latSpan);
    const offsetX = padX + (innerW - lngSpan * scale) / 2;
    const offsetY = padY + (innerH - latSpan * scale) / 2;

    const project = (lat: number, lng: number): [number, number] => {
      const x = offsetX + (lng - minLng) * scale;
      const y = offsetY + (maxLat - lat) * scale;
      return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
    };

    const svgPoints = sampled.map(([lat, lng]) => project(lat, lng));
    const fullPath = svgPoints
      .map(([x, y], idx) => `${idx === 0 ? "M" : "L"}${x},${y}`)
      .join(" ");

    const splitIdx = Math.max(
      1,
      Math.round((data.progressPercent / 100) * (svgPoints.length - 1))
    );
    const coveredPath =
      data.progressPercent > 0
        ? svgPoints
          .slice(0, splitIdx + 1)
          .map(([x, y], idx) => `${idx === 0 ? "M" : "L"}${x},${y}`)
          .join(" ")
        : "";

    let lastLabelX = -999;
    let lastLabelY = -999;
    const projectedHalts = haltStops.map((stop, idx) => {
      const [x, y] = project(stop.lat, stop.lng);
      const isEndpoint = idx === 0 || idx === haltStops.length - 1;
      const distSq = (x - lastLabelX) ** 2 + (y - lastLabelY) ** 2;
      const showLabel = isEndpoint || distSq > 46 * 46;
      if (showLabel) {
        lastLabelX = x;
        lastLabelY = y;
      }
      return { stop, x, y, showLabel, isEndpoint };
    });

    const currentMarker =
      data.currentLocation?.lat !== null &&
        data.currentLocation?.lat !== undefined &&
        data.currentLocation?.lng !== null &&
        data.currentLocation?.lng !== undefined
        ? (() => {
          const [x, y] = project(
            data.currentLocation.lat,
            data.currentLocation.lng
          );
          return { x, y };
        })()
        : data.progressPercent > 0 && svgPoints[splitIdx]
          ? { x: svgPoints[splitIdx][0], y: svgPoints[splitIdx][1] }
          : svgPoints[0]
            ? { x: svgPoints[0][0], y: svgPoints[0][1] }
            : null;

    return {
      width,
      height,
      fullPath,
      coveredPath,
      projectedHalts,
      currentMarker,
    };
  }, [data]);

  if (!mapProjection) return null;

  const activeStop =
    mapProjection.projectedHalts.find(
      (h) => h.stop.stationCode === selectedCode
    )?.stop ??
    mapProjection.projectedHalts.find((h) => h.stop.stopState === "current")
      ?.stop ??
    (data.nextHalt
      ? mapProjection.projectedHalts.find(
        (h) => h.stop.stationCode === data.nextHalt?.stationCode
      )?.stop
      : undefined) ??
    mapProjection.projectedHalts[0]?.stop;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-line px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
            <CompassIcon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink sm:text-sm">
              Route Corridor Map
            </h3>
            <p className="text-[11px] text-ink-muted">
              Tap any station pin to view arrival &amp; platform details
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <span className="ta-led-blink h-2 w-2 rounded-full bg-emerald-500" />
            <span>Live Train</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border-2 border-[#1956b4] bg-card" />
            <span>Halts ({mapProjection.projectedHalts.length})</span>
          </span>
        </div>
      </div>

      <div className="bg-subcard/70 px-2 py-3 sm:px-6">
        <svg
          viewBox={`0 0 ${mapProjection.width} ${mapProjection.height}`}
          className="h-48 w-full select-none sm:h-60"
          role="img"
          aria-label={`Railway corridor map from ${data.train.source.name} to ${data.train.destination.name}`}
        >
          <defs>
            <linearGradient id="taRouteGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#1956b4" />
            </linearGradient>
          </defs>

          {[52, 130, 208].map((gy) => (
            <line
              key={gy}
              x1="24"
              y1={gy}
              x2={mapProjection.width - 24}
              y2={gy}
              stroke="currentColor"
              className="text-line"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
          ))}

          {/* Base Railway Track Bed */}
          <path
            d={mapProjection.fullPath}
            fill="none"
            stroke="currentColor"
            className="text-line-strong"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Completed Track Segment */}
          {mapProjection.coveredPath && (
            <path
              d={mapProjection.coveredPath}
              fill="none"
              stroke="url(#taRouteGlow)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Commercial Halt Station Pins */}
          {mapProjection.projectedHalts.map(
            ({ stop, x, y, showLabel, isEndpoint }, idx) => {
              const isSelected = activeStop?.stationCode === stop.stationCode;
              const isPassed = stop.stopState === "departed";
              const labelAbove = idx % 2 === 0;

              return (
                <g
                  key={stop.stationCode}
                  onClick={() => setSelectedCode(stop.stationCode)}
                  className="cursor-pointer"
                >
                  <circle cx={x} cy={y} r="14" fill="transparent" />
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 8 : isEndpoint ? 6.5 : 5}
                    fill={
                      isSelected
                        ? "#fc6203"
                        : isPassed
                          ? "#10b981"
                          : "#1956b4"
                    }
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  {(showLabel || isSelected) && (
                    <text
                      x={x}
                      y={labelAbove ? y - 12 : y + 19}
                      textAnchor="middle"
                      className="fill-ink font-mono text-[11px] font-bold"
                    >
                      {stop.stationCode}
                    </text>
                  )}
                </g>
              );
            }
          )}

          {/* Blinking Live Train Position Beacon on Map */}
          {mapProjection.currentMarker && (
            <g
              transform={`translate(${mapProjection.currentMarker.x}, ${mapProjection.currentMarker.y})`}
            >
              {isActivelyMovingOrHalted && (
                <circle r="12" fill="#10b981" fillOpacity="0.3">
                  <animate
                    attributeName="r"
                    values="9;22;9"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="fill-opacity"
                    values="0.5;0;0.5"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <circle
                r="10.5"
                fill={isActivelyMovingOrHalted ? "#0d9458" : "#64748b"}
                stroke="#ffffff"
                strokeWidth="2.5"
              />
              <rect
                x="-4.5"
                y="-5"
                width="9"
                height="8.5"
                rx="1.8"
                fill="#ffffff"
              />
              <rect
                x="-3.2"
                y="-3.6"
                width="6.4"
                height="2.8"
                rx="0.7"
                fill="#0d9458"
              />
              <circle cx="-2.2" cy="1.5" r="0.9" fill="#0d9458" />
              <circle cx="2.2" cy="1.5" r="0.9" fill="#0d9458" />
            </g>
          )}
        </svg>
      </div>

      {/* Selected Halt Inspector Strip */}
      {activeStop && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-card px-4 py-3 text-xs sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-blue-50 px-2 py-0.5 font-mono font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
              {activeStop.stationCode}
            </span>
            <span className="text-sm font-bold text-ink">
              {activeStop.stationName}
            </span>
            <span className="text-ink-muted">· {activeStop.distanceKm} km</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 font-medium text-ink-soft">
            {activeStop.scheduledArrival && (
              <span>
                Arr:{" "}
                <strong className="font-mono text-ink">
                  {formatIstTime(
                    activeStop.actualArrival ?? activeStop.scheduledArrival
                  )}
                </strong>
              </span>
            )}
            {activeStop.scheduledDeparture && (
              <span>
                Dep:{" "}
                <strong className="font-mono text-ink">
                  {formatIstTime(
                    activeStop.actualDeparture ?? activeStop.scheduledDeparture
                  )}
                </strong>
              </span>
            )}
            {activeStop.platform && (
              <span className="rounded bg-subcard px-2 py-0.5 font-mono font-bold text-ink">
                PF #{activeStop.platform}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const COACH_ROLE_STYLES: Record<CoachRole, string> = {
  locomotive:
    "border-emerald-500/50 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200",
  executive:
    "border-blue-500/45 bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-200",
  ac: "border-blue-500/30 bg-card text-ink",
  sleeper: "border-line-strong bg-subcard text-ink",
  pantry:
    "border-amber-500/40 bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  power: "border-line-strong bg-subcard text-ink-soft",
  general: "border-line bg-subcard text-ink-soft",
};

function noopSubscribe() {
  return () => { };
}

export interface LiveTrainTrackerProps {
  initialTrainNumber?: string;
  initialData?: NormalizedLiveTrainData | null;
}

export function LiveTrainTracker({
  initialTrainNumber,
  initialData = null,
}: LiveTrainTrackerProps = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const todayIst = useSyncExternalStore(
    noopSubscribe,
    getTodayIstDateString,
    () => ""
  );
  const yesterdayIst = useMemo(
    () => (todayIst ? shiftDateString(todayIst, -1) : ""),
    [todayIst]
  );
  const tomorrowIst = useMemo(
    () => (todayIst ? shiftDateString(todayIst, 1) : ""),
    [todayIst]
  );

  const initialQueryTrain = (
    initialTrainNumber ||
    searchParams.get("train") ||
    ""
  )
    .replace(/\D/g, "")
    .slice(0, 5);
  const rawQueryDate = searchParams.get("date") ?? "";
  const initialQueryDate = /^\d{4}-\d{2}-\d{2}$/.test(rawQueryDate)
    ? rawQueryDate
    : "";

  const [searchQuery, setSearchQuery] = useState(
    initialData?.trainNumber || initialQueryTrain
  );
  const [dateInput, setDateInput] = useState(
    initialQueryDate || initialData?.startDate || ""
  );
  const [isAutoDate, setIsAutoDate] = useState(!initialQueryDate);
  const [loading, setLoading] = useState(
    initialQueryTrain.length >= 3 && !initialData
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [apiResponse, setApiResponse] =
    useState<OwnedLiveTrainApiResponse | null>(() =>
      initialData
        ? {
          success: true,
          provider: "TravelAdda Owned Rail API v2",
          endpoint: `/api/trains/${initialData.trainNumber}/live?date=${initialData.startDate}`,
          data: initialData,
          meta: {
            timestamp: initialData.lastUpdatedAt,
            traceId: "ssr-initial",
            source: "ssr-cache",
            executionTime: 0,
            poweredBy: "TravelAdda Live Train Gateway v2",
            fetchedAt: initialData.lastUpdatedAt,
            responseTimeMs: 0,
          },
        }
        : null
    );
  const [copied, setCopied] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Train Name / Number Autocomplete state
  const [remoteSuggestions, setRemoteSuggestions] = useState<{
    query: string;
    items: TrainSearchItem[];
  } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchingTrains, setSearchingTrains] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const liveTrainRowRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      return POPULAR_LIVE_TRAINS.slice(0, 6);
    }
    if (
      remoteSuggestions &&
      remoteSuggestions.query === trimmed &&
      remoteSuggestions.items.length > 0
    ) {
      return remoteSuggestions.items;
    }
    const lower = trimmed.toLowerCase();
    return POPULAR_LIVE_TRAINS.filter(
      (t) =>
        t.trainNumber.includes(lower) ||
        t.trainName.toLowerCase().includes(lower) ||
        t.sourceCode.toLowerCase().includes(lower) ||
        t.destinationCode.toLowerCase().includes(lower)
    ).slice(0, 6);
  }, [searchQuery, remoteSuggestions]);

  // Interactive Filters for Coach Rake & Route Stops
  const [coachFilter, setCoachFilter] = useState("");
  const [showAllStations, setShowAllStations] = useState(false);
  const [stationSearch, setStationSearch] = useState("");

  const recentTrains = useSyncExternalStore(
    subscribeRecentTrains,
    getRecentTrainsSnapshot,
    getRecentTrainsServerSnapshot
  );

  const lastCheckedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!dropdownOpen || trimmed.length < 2) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearchingTrains(true);
      try {
        const res = await fetch(
          `/api/trains/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const json = (await res.json()) as OwnedTrainSearchApiResponse;
          if (Array.isArray(json.data) && json.data.length > 0) {
            setRemoteSuggestions({
              query: trimmed,
              items: json.data.slice(0, 7),
            });
          }
        }
      } catch {
        // Ignore aborted autocomplete lookups
      } finally {
        if (!controller.signal.aborted) {
          setSearchingTrains(false);
        }
      }
    }, 220);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, dropdownOpen]);

  const saveRecentTrain = useCallback((data: NormalizedLiveTrainData) => {
    const entry: RecentLiveTrainItem = {
      trainNumber: data.trainNumber,
      trainName: data.trainName,
      route: `${data.train.source.code} → ${data.train.destination.code}`,
      lastDate: data.startDate,
    };
    const current = getRecentTrainsSnapshot();
    const next = [
      entry,
      ...current.filter((item) => item.trainNumber !== entry.trainNumber),
    ].slice(0, 5);
    writeRecentTrainsStorage(next);
  }, []);

  const performLookup = useCallback(
    async (digits: string, targetDate: string, useAutoDate: boolean) => {
      try {
        const query = new URLSearchParams();
        if (targetDate && !useAutoDate) {
          query.set("date", targetDate);
        } else {
          query.set("auto", "1");
        }
        const res = await fetch(
          `/api/trains/${encodeURIComponent(digits)}/live?${query.toString()}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
          }
        );

        const payload = (await res.json()) as OwnedLiveTrainApiResponse;
        setApiResponse(payload);

        if (!res.ok || !payload.success || !payload.data) {
          setErrorMsg(
            payload.error?.message ||
            "Unable to fetch live running status for this train right now. Please verify the train number and start date."
          );
        } else {
          setErrorMsg(null);
          setDateInput(payload.data.startDate);
          saveRecentTrain(payload.data);
        }
      } catch {
        setErrorMsg(
          "Network error while checking live train status. Please retry."
        );
      } finally {
        setLoading(false);
      }
    },
    [saveRecentTrain]
  );

  const checkLiveTrain = useCallback(
    async (
      targetTrain: string,
      targetDate: string,
      options?: { syncUrl?: boolean; useAutoDate?: boolean; trainName?: string }
    ) => {
      const syncUrl = options?.syncUrl ?? true;
      const useAutoDate = options?.useAutoDate ?? false;
      const digits = targetTrain.replace(/\D/g, "").slice(0, 5);

      if (digits.length < 3) {
        if (suggestions.length > 0) {
          const first = suggestions[0];
          setDropdownOpen(false);
          setSearchQuery(`${first.trainNumber} - ${first.trainName}`);
          setLoading(true);
          setErrorMsg(null);
          const cleanDate = /^\d{4}-\d{2}-\d{2}$/.test(targetDate)
            ? targetDate
            : "";
          lastCheckedKeyRef.current = `${first.trainNumber}|${useAutoDate ? "auto" : cleanDate}`;
          if (syncUrl) {
            const url = buildTrainLiveStatusPath(
              first.trainNumber,
              first.trainName,
              !useAutoDate && cleanDate ? cleanDate : undefined
            );
            router.push(url, { scroll: false });
          }
          await performLookup(first.trainNumber, cleanDate, useAutoDate);
          return;
        }
        setErrorMsg(
          "Please enter a valid 4 or 5-digit train number or choose a train from suggestions."
        );
        return;
      }

      const cleanDate = /^\d{4}-\d{2}-\d{2}$/.test(targetDate)
        ? targetDate
        : todayIst || getTodayIstDateString();

      setDropdownOpen(false);
      setSearchQuery(digits);
      if (!useAutoDate) setDateInput(cleanDate);
      setIsAutoDate(useAutoDate);
      setLoading(true);
      setErrorMsg(null);
      setCopied(false);
      lastCheckedKeyRef.current = `${digits}|${useAutoDate ? "auto" : cleanDate}`;

      if (syncUrl) {
        const knownName =
          options?.trainName ||
          (initialData?.trainNumber === digits
            ? initialData.trainName
            : undefined) ||
          suggestions.find((s) => s.trainNumber === digits)?.trainName;
        const url = buildTrainLiveStatusPath(
          digits,
          knownName,
          useAutoDate ? undefined : cleanDate
        );
        if (initialTrainNumber === digits) {
          router.replace(url, { scroll: false });
        } else {
          router.push(url, { scroll: false });
        }
      }

      await performLookup(digits, cleanDate, useAutoDate);
    },
    [initialData, initialTrainNumber, performLookup, router, suggestions, todayIst]
  );

  useEffect(() => {
    const qTrain = (
      initialTrainNumber ||
      searchParams.get("train") ||
      ""
    )
      .replace(/\D/g, "")
      .slice(0, 5);
    const rawDate = searchParams.get("date") ?? "";
    const hasExplicit = /^\d{4}-\d{2}-\d{2}$/.test(rawDate);
    const qDate = hasExplicit ? rawDate : todayIst || getTodayIstDateString();
    const lookupKey = `${qTrain}|${hasExplicit ? qDate : "auto"}`;

    if (qTrain.length >= 3 && lastCheckedKeyRef.current !== lookupKey) {
      lastCheckedKeyRef.current = lookupKey;
      const hasSsrMatch =
        Boolean(initialData) &&
        initialData?.trainNumber === qTrain &&
        !hasExplicit;
      void Promise.resolve().then(() => {
        setSearchQuery(qTrain);
        setIsAutoDate(!hasExplicit);
        if (hasExplicit) setDateInput(qDate);
        if (!hasSsrMatch) {
          setLoading(true);
        }
        return performLookup(qTrain, qDate, !hasExplicit);
      });
    }
  }, [initialData, initialTrainNumber, searchParams, performLookup, todayIst]);

  const trainData = apiResponse?.success ? apiResponse.data : undefined;

  useEffect(() => {
    if (!autoRefresh || !trainData) return;
    const interval = setInterval(() => {
      void performLookup(trainData.trainNumber, trainData.startDate, false);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, trainData, performLookup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveDate = dateInput || todayIst;
    void checkLiveTrain(searchQuery, effectiveDate, {
      syncUrl: true,
      useAutoDate: isAutoDate,
    });
  };

  const scrollToLiveTrain = () => {
    if (liveTrainRowRef.current) {
      liveTrainRowRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const filteredRoute = useMemo(() => {
    if (!trainData) return [];
    const q = stationSearch.trim().toLowerCase();
    return trainData.route.filter((stop) => {
      if (q) {
        return (
          stop.stationCode.toLowerCase().includes(q) ||
          stop.stationName.toLowerCase().includes(q)
        );
      }
      return showAllStations ? true : stop.isHalt;
    });
  }, [trainData, showAllStations, stationSearch]);

  const highlightedCoach = useMemo(() => {
    if (!trainData || !coachFilter.trim()) return null;
    const needle = coachFilter.trim().toUpperCase();
    return (
      trainData.train.coaches.find((c) => c.code === needle) ??
      trainData.train.coaches.find((c) => c.code.includes(needle)) ??
      null
    );
  }, [trainData, coachFilter]);

  const handleCopySummary = async () => {
    if (!trainData) return;
    const lines = [
      `TravelAdda Live Train Running Status`,
      `Train: #${trainData.trainNumber} ${trainData.trainName} (${trainData.train.type})`,
      `Start Date: ${formatReadableDate(trainData.startDate)}`,
      `Live Status: ${trainData.livePosition.headline}`,
      `Delay: ${trainData.livePosition.delayStatus}`,
      `Route: ${trainData.train.source.name} (${trainData.train.source.code}) -> ${trainData.train.destination.name} (${trainData.train.destination.code})`,
      trainData.nextHalt
        ? `Next Halt: ${trainData.nextHalt.stationName} (${trainData.nextHalt.stationCode}) in ${trainData.nextHalt.distanceFromCurrentKm} km · ETA ${formatIstTime(
          trainData.nextHalt.expectedArrival
        )}`
        : "",
    ].filter(Boolean);

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore clipboard restrictions
    }
  };

  const originStop = trainData?.route[0];
  const destStop =
    trainData && trainData.route.length > 0
      ? trainData.route[trainData.route.length - 1]
      : undefined;

  const isRunningOrHalted =
    trainData?.trackingState === "running" ||
    trainData?.trackingState === "halted";

  const effectiveDateDisplay = dateInput || todayIst;

  const betweenAfterSeq = useMemo(() => {
    if (
      !trainData ||
      !trainData.livePosition.isMoving ||
      stationSearch.trim().length > 0
    ) {
      return null;
    }
    return showAllStations
      ? trainData.livePosition.betweenAllAfterSeq
      : trainData.livePosition.betweenHaltAfterSeq;
  }, [trainData, showAllStations, stationSearch]);

  return (
    <div className="w-full space-y-5">
      {/* Clean Segmented ConfirmTkt / ixigo Search Box */}
      <div className="rounded-2xl border border-line bg-card p-4 shadow-md sm:p-5">
        <form onSubmit={handleSubmit}>
          <div className="grid divide-y divide-line rounded-xl border border-line-strong bg-input md:grid-cols-[1.55fr_0.9fr_auto] md:divide-x md:divide-y-0">
            {/* Train Number or Name */}
            <div ref={searchBoxRef} className="relative px-3.5 py-2.5">
              <label
                htmlFor="live-train-input"
                className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted"
              >
                Train Number or Name
              </label>
              <div className="mt-1 flex items-center gap-2.5">
                <TrainIcon className="h-4 w-4 shrink-0 text-[#0d9458] dark:text-emerald-400" />
                <input
                  id="live-train-input"
                  type="text"
                  autoComplete="off"
                  value={searchQuery}
                  onFocus={() => setDropdownOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setDropdownOpen(true);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Enter 12002, 22436 or Rajdhani"
                  className="w-full bg-transparent text-sm font-bold text-ink placeholder:font-normal placeholder:text-ink-muted focus:outline-none sm:text-base"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setDropdownOpen(true);
                    }}
                    aria-label="Clear train input"
                    className="inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full bg-subcard text-ink-muted hover:text-ink"
                  >
                    <CloseIcon className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {dropdownOpen && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-line-strong bg-card p-1.5 shadow-xl">
                  <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                    <span>
                      {searchQuery.trim().length < 2
                        ? "Popular Trains"
                        : "Matching Trains"}
                    </span>
                    {searchingTrains && <span>Searching...</span>}
                  </div>
                  {suggestions.map((item) => (
                    <button
                      key={item.trainNumber}
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        void checkLiveTrain(
                          item.trainNumber,
                          effectiveDateDisplay,
                          {
                            syncUrl: true,
                            useAutoDate: isAutoDate,
                          }
                        );
                      }}
                      className="flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-subcard"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-xs font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                            #{item.trainNumber}
                          </span>
                          <span className="truncate text-xs font-bold text-ink sm:text-sm">
                            {item.trainName}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-ink-muted">
                          {item.sourceCode} → {item.destinationCode} · {item.type}
                        </p>
                      </div>
                      <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Start Date */}
            <div className="px-3.5 py-2.5">
              <label
                htmlFor="live-train-date"
                className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted"
              >
                Start Date
              </label>
              <div className="mt-1 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 shrink-0 text-ink-muted" />
                <input
                  id="live-train-date"
                  type="date"
                  value={effectiveDateDisplay}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDateInput(val);
                    setIsAutoDate(false);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="w-full bg-transparent text-sm font-bold text-ink focus:outline-none sm:text-base"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="flex items-center p-2">
              <button
                type="submit"
                disabled={loading}
                className="ta-btn-primary inline-flex h-12 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-6 text-sm font-bold md:w-auto disabled:cursor-not-allowed disabled:opacity-65"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                    <span>Spotting...</span>
                  </>
                ) : (
                  <>
                    <SearchIcon className="h-4 w-4" />
                    <span>Spot Train</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Smart Start-Date Pills & Recent Searches */}
        <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="ta-no-scrollbar flex items-center gap-1.5 overflow-x-auto">
            <span className="shrink-0 font-semibold text-ink-muted">
              Start Date:
            </span>
            {[
              { label: "Auto (Live)", value: "auto", isAuto: true },
              { label: "Yesterday", value: yesterdayIst, isAuto: false },
              { label: "Today", value: todayIst, isAuto: false },
              { label: "Tomorrow", value: tomorrowIst, isAuto: false },
            ].map((opt) => {
              const active = opt.isAuto
                ? isAutoDate
                : !isAutoDate &&
                Boolean(opt.value) &&
                effectiveDateDisplay === opt.value;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => {
                    if (opt.isAuto) {
                      setIsAutoDate(true);
                      const digits = searchQuery.replace(/\D/g, "").slice(0, 5);
                      if (digits.length >= 3) {
                        void checkLiveTrain(digits, todayIst, {
                          syncUrl: true,
                          useAutoDate: true,
                        });
                      }
                      return;
                    }
                    if (!opt.value) return;
                    setIsAutoDate(false);
                    setDateInput(opt.value);
                    const digits = searchQuery.replace(/\D/g, "").slice(0, 5);
                    if (digits.length >= 3) {
                      void checkLiveTrain(digits, opt.value, {
                        syncUrl: true,
                        useAutoDate: false,
                      });
                    }
                  }}
                  className={`shrink-0 cursor-pointer rounded-md border px-2.5 py-1 font-semibold transition ${active
                      ? "border-[#1956b4]/40 bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                      : "border-line bg-subcard text-ink-soft hover:text-ink"
                    }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {recentTrains.length > 0 ? (
            <div className="ta-no-scrollbar flex items-center gap-1.5 overflow-x-auto">
              <span className="shrink-0 font-semibold text-ink-muted">
                Recent:
              </span>
              {recentTrains.slice(0, 3).map((item) => (
                <button
                  key={item.trainNumber}
                  type="button"
                  onClick={() =>
                    void checkLiveTrain(item.trainNumber, todayIst, {
                      syncUrl: true,
                      useAutoDate: true,
                    })
                  }
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-md border border-line bg-subcard px-2.5 py-1 font-mono font-bold text-ink transition hover:border-[#1956b4]"
                >
                  <span>#{item.trainNumber}</span>
                  <span className="font-sans text-[11px] font-normal text-ink-muted">
                    ({item.route})
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => writeRecentTrainsStorage([])}
                className="shrink-0 cursor-pointer px-1 font-medium text-ink-muted hover:text-ink hover:underline"
              >
                Clear
              </button>
            </div>
          ) : (
            <div className="ta-no-scrollbar flex items-center gap-1.5 overflow-x-auto">
              <span className="shrink-0 font-semibold text-ink-muted">
                Quick Try:
              </span>
              {POPULAR_LIVE_TRAINS.slice(0, 3).map((t) => (
                <button
                  key={t.trainNumber}
                  type="button"
                  onClick={() =>
                    void checkLiveTrain(t.trainNumber, todayIst, {
                      syncUrl: true,
                      useAutoDate: true,
                    })
                  }
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-md border border-line bg-subcard px-2.5 py-1 font-mono font-bold text-ink transition hover:border-[#1956b4]"
                >
                  <span>#{t.trainNumber}</span>
                  <span className="font-sans text-[11px] font-normal text-ink-muted">
                    ({t.sourceCode}→{t.destinationCode})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            role="alert"
            className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-50 p-3.5 text-sm dark:bg-rose-500/10"
          >
            <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-bold text-ink">
                Unable to load live train running status
              </p>
              <p className="mt-0.5 text-xs text-ink-soft">{errorMsg}</p>
            </div>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && !trainData && (
        <div className="animate-pulse overflow-hidden rounded-2xl border border-line bg-card p-6 shadow-sm">
          <div className="h-5 w-48 rounded bg-subcard" />
          <div className="mt-4 h-16 rounded-xl bg-subcard" />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="h-20 rounded-xl bg-subcard" />
            <div className="h-20 rounded-xl bg-subcard" />
            <div className="h-20 rounded-xl bg-subcard" />
            <div className="h-20 rounded-xl bg-subcard" />
          </div>
        </div>
      )}

      {/* Clean ConfirmTkt / ixigo Live Train Dashboard */}
      {trainData && (
        <div className="space-y-5">
          {/* 1. LIVE SUMMARY CARD */}
          <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-md">
            {/* Deep Navy Live Radar Strip */}
            <div className="ta-live-cockpit px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${isRunningOrHalted
                        ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-300"
                        : "border-white/20 bg-white/10 text-slate-200"
                      }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${isRunningOrHalted
                          ? "ta-led-blink bg-emerald-400"
                          : "bg-slate-300"
                        }`}
                    />
                    <span>{trainData.statusLabel}</span>
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${trainData.delayMinutes > 0
                        ? "border-rose-400/40 bg-rose-500/20 text-rose-200"
                        : "border-emerald-400/35 bg-emerald-500/15 text-emerald-200"
                      }`}
                  >
                    <ClockIcon className="h-3 w-3" />
                    <span>{trainData.livePosition.delayStatus}</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[11px] text-slate-300">
                    Updated {trainData.summary.lastUpdatedIst}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAutoRefresh((prev) => !prev)}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition ${autoRefresh
                        ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-200"
                        : "border-white/15 bg-white/10 text-slate-200 hover:bg-white/15"
                      }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${autoRefresh
                          ? "ta-led-blink bg-emerald-400"
                          : "bg-slate-400"
                        }`}
                    />
                    <span>Auto 30s</span>
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      void performLookup(
                        trainData.trainNumber,
                        trainData.startDate,
                        false
                      )
                    }
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-white/15 disabled:opacity-60"
                  >
                    <RefreshIcon
                      className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                    />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Blinking Train Beacon + Headline */}
              <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3 sm:items-center">
                  <LiveTrainBeaconIcon size="md" active={isRunningOrHalted} />
                  <div>
                    <p className="text-base font-extrabold leading-snug text-white sm:text-lg">
                      {trainData.livePosition.headline}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-300 sm:text-sm">
                      {trainData.livePosition.subheadline}
                    </p>
                  </div>
                </div>

                {isRunningOrHalted && (
                  <button
                    type="button"
                    onClick={scrollToLiveTrain}
                    className="ta-btn-primary inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold"
                  >
                    <span>Jump to Live Station</span>
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Clean Route Progress Bar */}
              <div className="mt-4 rounded-xl border border-white/12 bg-black/20 px-3.5 py-3 sm:px-4">
                <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-200">
                  <span>
                    <strong className="font-mono text-white">
                      {trainData.train.source.code}
                    </strong>{" "}
                    <span className="hidden text-slate-300 sm:inline">
                      {trainData.train.source.name}
                    </span>
                  </span>
                  <span className="font-mono text-[11px] text-emerald-300">
                    {trainData.summary.distanceCoveredKm} /{" "}
                    {trainData.summary.distanceTotalKm} km (
                    {Math.round(trainData.progressPercent)}%)
                  </span>
                  <span>
                    <span className="hidden text-slate-300 sm:inline">
                      {trainData.train.destination.name}{" "}
                    </span>
                    <strong className="font-mono text-white">
                      {trainData.train.destination.code}
                    </strong>
                  </span>
                </div>

                <div className="relative my-4 h-2 w-full rounded-full bg-white/15">
                  <div
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(3, trainData.progressPercent)
                      )}%`,
                    }}
                    className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                  />
                  <div
                    style={{
                      left: `${Math.min(
                        97,
                        Math.max(3, trainData.progressPercent)
                      )}%`,
                    }}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
                  >
                    <LiveTrainBeaconIcon size="sm" active={isRunningOrHalted} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
                  <span>
                    Dep{" "}
                    <strong className="font-mono text-white">
                      {originStop?.scheduledDeparture
                        ? formatIstTime(
                          originStop.actualDeparture ??
                          originStop.scheduledDeparture
                        )
                        : "--:--"}
                    </strong>
                    {originStop?.platform ? ` · PF #${originStop.platform}` : ""}
                  </span>
                  <span>
                    {trainData.livePosition.estimatedSpeedKmh > 0
                      ? `~${trainData.livePosition.estimatedSpeedKmh} km/h`
                      : `${trainData.summary.haltsRemaining} halts left`}
                  </span>
                  <span>
                    Arr{" "}
                    <strong className="font-mono text-white">
                      {destStop?.scheduledArrival
                        ? formatIstTime(
                          destStop.actualArrival ?? destStop.scheduledArrival
                        )
                        : "--:--"}
                    </strong>
                    {destStop?.platform ? ` · PF #${destStop.platform}` : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Clean Train Header Strip */}
            <div className="ta-ticket-header px-4 py-3.5 sm:px-6">
              <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-[#1956b4] px-2 py-0.5 font-mono text-xs font-bold text-white">
                      #{trainData.trainNumber}
                    </span>
                    <h3 className="text-base font-extrabold text-ink sm:text-lg">
                      {trainData.trainName}
                    </h3>
                    <span className="rounded bg-card px-2 py-0.5 text-[11px] font-semibold text-ink-soft">
                      {trainData.train.type}
                    </span>
                    {trainData.train.returnTrain && (
                      <button
                        type="button"
                        onClick={() =>
                          void checkLiveTrain(
                            trainData.train.returnTrain!,
                            todayIst,
                            { syncUrl: true, useAutoDate: true }
                          )
                        }
                        className="inline-flex cursor-pointer items-center gap-1 rounded border border-line bg-card px-2 py-0.5 text-[11px] font-bold text-[#1956b4] hover:border-[#1956b4] dark:text-blue-300"
                      >
                        <SwapArrowsIcon className="h-3 w-3" />
                        <span>Return #{trainData.train.returnTrain}</span>
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-ink-soft">
                    Start: {formatReadableDate(trainData.startDate)} ·{" "}
                    {trainData.train.distanceKm} km ·{" "}
                    {trainData.train.durationFormatted} ·{" "}
                    {trainData.train.totalHalts} Halts
                  </p>
                </div>

                {/* Run Days */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-ink-muted">
                    {trainData.train.isDaily ? "Daily:" : "Runs:"}
                  </span>
                  <div className="flex items-center gap-1">
                    {ALL_WEEK_DAYS.map((day) => {
                      const runs = trainData.train.runDays.includes(day.key);
                      return (
                        <span
                          key={day.key}
                          title={day.label}
                          className={`inline-flex h-6 w-6 items-center justify-center rounded font-mono text-[11px] font-bold ${runs
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300"
                              : "bg-card/60 text-ink-muted opacity-45"
                            }`}
                        >
                          {day.short}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {trainData.exceptions.length > 0 && (
              <div className="border-b border-line bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 sm:px-6">
                {trainData.exceptions.join(" · ")}
              </div>
            )}

            {/* 4 Clean Key Metrics */}
            <div className="grid grid-cols-2 divide-x divide-y divide-line bg-card sm:grid-cols-4 sm:divide-y-0">
              <div className="p-3.5 sm:p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  Current Station
                </p>
                <p className="mt-1 text-sm font-bold text-ink">
                  {trainData.currentLocation
                    ? `${trainData.currentLocation.stationName} (${trainData.currentLocation.stationCode})`
                    : `${trainData.train.source.name} (${trainData.train.source.code})`}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {trainData.currentLocation?.statusLabel ??
                    trainData.statusLabel}
                </p>
              </div>

              <div className="p-3.5 sm:p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  Next Stop
                </p>
                {trainData.nextHalt ? (
                  <>
                    <p className="mt-1 text-sm font-bold text-ink">
                      {trainData.nextHalt.stationName} (
                      {trainData.nextHalt.stationCode})
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-[#1956b4] dark:text-blue-300">
                      ETA {formatIstTime(trainData.nextHalt.expectedArrival)}
                      {trainData.nextHalt.platform
                        ? ` · PF #${trainData.nextHalt.platform}`
                        : ""}{" "}
                      ({trainData.nextHalt.distanceFromCurrentKm} km)
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-sm font-bold text-ink-soft">
                    Destination reached
                  </p>
                )}
              </div>

              <div className="p-3.5 sm:p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  Speed
                </p>
                <p className="mt-1 font-mono text-base font-extrabold text-ink">
                  {trainData.livePosition.estimatedSpeedKmh}{" "}
                  <span className="font-sans text-xs font-normal text-ink-muted">
                    km/h
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {trainData.train.avgSpeedKmph !== null
                    ? `Avg ${trainData.train.avgSpeedKmph} km/h`
                    : "Scheduled speed"}
                </p>
              </div>

              <div className="p-3.5 sm:p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  Distance Left
                </p>
                <p className="mt-1 font-mono text-base font-extrabold text-ink">
                  {trainData.summary.distanceRemainingKm}{" "}
                  <span className="font-sans text-xs font-normal text-ink-muted">
                    km
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {trainData.summary.haltsCompleted}/
                  {trainData.summary.haltsTotal} halts done
                </p>
              </div>
            </div>
          </div>

          {/* 2. STATION-BY-STATION VERTICAL TIMELINE (ConfirmTkt / ixigo Style) */}
          <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
            {/* Controls Header */}
            <div className="flex flex-col justify-between gap-3 border-b border-line bg-subcard/60 px-4 py-3.5 sm:px-6 lg:flex-row lg:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-ink sm:text-base">
                    Station-by-Station Running Status
                  </h3>
                  {isRunningOrHalted && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      <span className="ta-led-blink h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>LIVE</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-muted">
                  Showing {filteredRoute.length} of{" "}
                  {trainData.train.totalRouteStations} stations
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="grid grid-cols-2 rounded-lg border border-line bg-card p-0.5 sm:inline-flex">
                  <button
                    type="button"
                    onClick={() => setShowAllStations(false)}
                    className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-bold transition ${!showAllStations
                        ? "bg-[#1956b4] text-white"
                        : "text-ink-soft hover:text-ink"
                      }`}
                  >
                    Stops ({trainData.train.totalHalts})
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAllStations(true)}
                    className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-bold transition ${showAllStations
                        ? "bg-[#1956b4] text-white"
                        : "text-ink-soft hover:text-ink"
                      }`}
                  >
                    All ({trainData.train.totalRouteStations})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-44">
                    <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
                    <input
                      type="text"
                      value={stationSearch}
                      onChange={(e) => setStationSearch(e.target.value)}
                      placeholder="Search station..."
                      className="w-full rounded-lg border border-line bg-card py-1.5 pl-8 pr-2.5 text-xs font-semibold text-ink placeholder:font-normal placeholder:text-ink-muted focus:border-[#1956b4] focus:outline-none"
                    />
                  </div>

                  {isRunningOrHalted && (
                    <button
                      type="button"
                      onClick={scrollToLiveTrain}
                      className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-500/35 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300"
                    >
                      <span className="ta-led-blink h-2 w-2 rounded-full bg-emerald-500" />
                      <span>Locate</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Station Rows */}
            <div>
              {filteredRoute.map((stop, idx) => {
                const isCurrent = stop.stopState === "current";
                const isDeparted = stop.stopState === "departed";
                const isFirst = idx === 0;
                const isLast = idx === filteredRoute.length - 1;
                const injectMovingTrainAfter =
                  betweenAfterSeq !== null && stop.sequence === betweenAfterSeq;

                const effectiveDelay =
                  stop.delayDeparture !== 0
                    ? stop.delayDeparture
                    : stop.delayArrival;
                const arrScheduledStr = formatIstTime(stop.scheduledArrival);
                const arrActualStr = stop.actualArrival
                  ? formatIstTime(stop.actualArrival)
                  : null;
                const depScheduledStr = formatIstTime(stop.scheduledDeparture);
                const depActualStr = stop.actualDeparture
                  ? formatIstTime(stop.actualDeparture)
                  : null;

                return (
                  <div key={`${stop.sequence}-${stop.stationCode}`}>
                    <div
                      ref={isCurrent ? liveTrainRowRef : undefined}
                      className={`relative flex items-stretch gap-3 px-3.5 sm:gap-4 sm:px-6 ${isCurrent
                          ? "bg-emerald-50/70 dark:bg-emerald-500/10"
                          : stop.isHalt
                            ? "bg-card hover:bg-subcard/45"
                            : "bg-subcard/30 hover:bg-subcard/55"
                        }`}
                    >
                      {/* Vertical Track Column */}
                      <div className="relative flex w-8 shrink-0 flex-col items-center sm:w-9">
                        <div
                          className={`w-0.5 flex-1 ${isFirst
                              ? "bg-transparent"
                              : isDeparted || isCurrent
                                ? "bg-emerald-500"
                                : "border-l-2 border-dashed border-line-strong"
                            }`}
                        />

                        <div className="relative z-10 my-1 flex items-center justify-center">
                          {isCurrent ? (
                            <LiveTrainBeaconIcon size="sm" active />
                          ) : (
                            <span
                              className={`inline-flex items-center justify-center rounded-full border-2 font-mono text-[10px] font-bold ${isDeparted
                                  ? "h-5 w-5 border-emerald-500 bg-emerald-500 text-white"
                                  : stop.isHalt
                                    ? "h-5 w-5 border-[#1956b4] bg-card text-[#1956b4] dark:border-blue-400 dark:text-blue-300"
                                    : "h-3 w-3 border-line-strong bg-subcard text-transparent"
                                }`}
                            >
                              {isDeparted ? "✓" : ""}
                            </span>
                          )}
                        </div>

                        <div
                          className={`w-0.5 flex-1 ${isLast && !injectMovingTrainAfter
                              ? "bg-transparent"
                              : isDeparted
                                ? "bg-emerald-500"
                                : "border-l-2 border-dashed border-line-strong"
                            }`}
                        />
                      </div>

                      {/* Station Content */}
                      <div className="flex flex-1 flex-col justify-between gap-2 border-b border-line py-3 md:grid md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-center md:gap-4 md:py-3.5">
                        <div className="flex items-start justify-between gap-2 md:block">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={`rounded px-1.5 py-0.5 font-mono text-xs font-bold ${stop.isHalt
                                    ? "bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                                    : "bg-subcard text-ink-muted"
                                  }`}
                              >
                                {stop.stationCode}
                              </span>
                              <span
                                className={`text-sm ${stop.isHalt
                                    ? "font-bold text-ink"
                                    : "font-medium text-ink-soft"
                                  }`}
                              >
                                {stop.stationName}
                              </span>
                              {isCurrent && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                                  <span className="ta-led-blink h-1.5 w-1.5 rounded-full bg-white" />
                                  <span>At Station</span>
                                </span>
                              )}
                            </div>

                            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-muted">
                              <span>{stop.distanceKm} km</span>
                              <span>·</span>
                              <span>
                                Day {stop.arrivalDay || stop.departureDay || 1}
                              </span>
                              {stop.haltMinutes ? (
                                <>
                                  <span>·</span>
                                  <span>{stop.haltMinutes}m halt</span>
                                </>
                              ) : null}
                            </div>

                            {/* Mobile PF + Status */}
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 md:hidden">
                              {stop.platform && (
                                <span className="rounded border border-line bg-subcard px-1.5 py-0.5 font-mono text-[10px] font-bold text-ink">
                                  PF #{stop.platform}
                                </span>
                              )}
                              {stop.isHalt && (
                                <span
                                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${effectiveDelay > 0
                                      ? "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
                                      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                                    }`}
                                >
                                  {effectiveDelay > 0
                                    ? `+${effectiveDelay}m late`
                                    : effectiveDelay < 0
                                      ? `${Math.abs(effectiveDelay)}m early`
                                      : "On Time"}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Mobile Right Timings */}
                          <div className="shrink-0 text-right font-mono text-xs md:hidden">
                            {!(stop.sequence === 1 && !stop.scheduledArrival) && (
                              <div>
                                <span className="mr-1 font-sans text-[10px] text-ink-muted">
                                  Arr
                                </span>
                                <span
                                  className={`font-bold ${arrActualStr &&
                                      arrActualStr !== arrScheduledStr
                                      ? "text-rose-600 dark:text-rose-400"
                                      : "text-ink"
                                    }`}
                                >
                                  {arrActualStr ?? arrScheduledStr}
                                </span>
                              </div>
                            )}
                            {!(
                              stop.sequence ===
                              trainData.train.totalRouteStations &&
                              !stop.scheduledDeparture
                            ) && (
                                <div className="mt-0.5">
                                  <span className="mr-1 font-sans text-[10px] text-ink-muted">
                                    Dep
                                  </span>
                                  <span
                                    className={`font-bold ${depActualStr &&
                                        depActualStr !== depScheduledStr
                                        ? "text-rose-600 dark:text-rose-400"
                                        : "text-ink"
                                      }`}
                                  >
                                    {depActualStr ?? depScheduledStr}
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Desktop Arrival */}
                        <div className="hidden text-xs md:block">
                          <span className="block text-[10px] font-semibold uppercase text-ink-muted">
                            Arrival
                          </span>
                          {stop.sequence === 1 && !stop.scheduledArrival ? (
                            <span className="text-ink-muted">Source</span>
                          ) : (
                            <div className="mt-0.5 flex items-center gap-1.5 font-mono">
                              {arrActualStr &&
                                arrActualStr !== arrScheduledStr ? (
                                <>
                                  <span className="text-ink-muted line-through">
                                    {arrScheduledStr}
                                  </span>
                                  <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                                    {arrActualStr}
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm font-bold text-ink">
                                  {arrActualStr ?? arrScheduledStr}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Desktop Departure */}
                        <div className="hidden text-xs md:block">
                          <span className="block text-[10px] font-semibold uppercase text-ink-muted">
                            Departure
                          </span>
                          {stop.sequence ===
                            trainData.train.totalRouteStations &&
                            !stop.scheduledDeparture ? (
                            <span className="text-ink-muted">Destination</span>
                          ) : (
                            <div className="mt-0.5 flex items-center gap-1.5 font-mono">
                              {depActualStr &&
                                depActualStr !== depScheduledStr ? (
                                <>
                                  <span className="text-ink-muted line-through">
                                    {depScheduledStr}
                                  </span>
                                  <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                                    {depActualStr}
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm font-bold text-ink">
                                  {depActualStr ?? depScheduledStr}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Desktop Platform & Status */}
                        <div className="hidden items-center justify-end gap-2 md:flex">
                          {stop.platform && (
                            <span className="rounded border border-line bg-subcard px-2 py-0.5 font-mono text-xs font-bold text-ink">
                              PF #{stop.platform}
                            </span>
                          )}
                          {stop.isHalt && (
                            <span
                              className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${effectiveDelay > 0
                                  ? "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
                                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                                }`}
                            >
                              {effectiveDelay > 0
                                ? `+${effectiveDelay}m late`
                                : effectiveDelay < 0
                                  ? `${Math.abs(effectiveDelay)}m early`
                                  : "On Time"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Between-Stations Live Moving Train Row */}
                    {injectMovingTrainAfter && (
                      <div
                        ref={liveTrainRowRef}
                        id="live-train-anchor"
                        className="relative flex items-stretch gap-3 bg-emerald-50/70 px-3.5 dark:bg-emerald-500/10 sm:gap-4 sm:px-6"
                      >
                        <div className="relative flex w-8 shrink-0 flex-col items-center sm:w-9">
                          <div className="w-0.5 flex-1 bg-emerald-500" />
                          <div className="my-2">
                            <LiveTrainBeaconIcon size="md" active />
                          </div>
                          <div className="w-0.5 flex-1 border-l-2 border-dashed border-emerald-500" />
                        </div>

                        <div className="my-2.5 flex-1 rounded-xl border border-emerald-500/35 bg-card p-3.5 shadow-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                              <span className="ta-led-blink h-1.5 w-1.5 rounded-full bg-white" />
                              <span>Moving Live</span>
                            </span>
                            <div className="flex items-center gap-2 text-xs font-bold">
                              {trainData.livePosition.estimatedSpeedKmh > 0 && (
                                <span className="font-mono text-ink">
                                  ~{trainData.livePosition.estimatedSpeedKmh} km/h
                                </span>
                              )}
                              <span
                                className={`rounded px-2 py-0.5 text-[10px] font-bold ${trainData.delayMinutes > 0
                                    ? "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
                                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                                  }`}
                              >
                                {formatDelayText(trainData.delayMinutes)}
                              </span>
                            </div>
                          </div>

                          <p className="mt-1.5 text-sm font-bold text-ink">
                            {trainData.livePosition.headline}
                          </p>
                          <p className="mt-0.5 text-xs text-ink-soft">
                            {trainData.livePosition.subheadline}
                          </p>

                          {trainData.nextHalt && (
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-subcard">
                              <div
                                style={{
                                  width: `${Math.round(
                                    trainData.livePosition.haltSegmentProgress *
                                    100
                                  )}%`,
                                }}
                                className="h-full rounded-full bg-emerald-500"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer Utility Bar */}
            <div className="no-print flex flex-col justify-between gap-3 border-t border-line bg-subcard/60 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    void performLookup(
                      trainData.trainNumber,
                      trainData.startDate,
                      false
                    )
                  }
                  disabled={loading}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-semibold text-ink hover:border-[#1956b4]"
                >
                  <RefreshIcon className="h-3.5 w-3.5 text-[#1956b4] dark:text-blue-400" />
                  <span>Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={() => void handleCopySummary()}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-semibold text-ink hover:border-[#1956b4]"
                >
                  <CopyIcon className="h-3.5 w-3.5 text-[#1956b4] dark:text-blue-400" />
                  <span>{copied ? "Copied!" : "Copy Status"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-semibold text-ink hover:border-[#1956b4]"
                >
                  <PrinterIcon className="h-3.5 w-3.5 text-[#1956b4] dark:text-blue-400" />
                  <span>Print</span>
                </button>
              </div>

              <Link
                href="/rail/pnr-status"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-400"
              >
                <TicketIcon className="h-4 w-4" />
                <span>Check 10-Digit PNR Status</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* 3. Corridor Map */}
          <RoutePolylineMap data={trainData} />

          {/* 4. Coach Position from Engine */}
          {trainData.train.coaches.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                    <CoachTrainIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-ink">
                      Coach Position from Engine (
                      {trainData.train.coaches.length} Coaches)
                    </h3>
                    <p className="text-xs text-ink-muted">
                      Tap or search your coach code to see standing order on the
                      platform
                    </p>
                  </div>
                </div>

                <div className="relative w-full sm:w-48">
                  <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
                  <input
                    type="text"
                    value={coachFilter}
                    onChange={(e) => setCoachFilter(e.target.value)}
                    placeholder="Find coach (e.g. B4, A1)"
                    className="w-full rounded-lg border border-line bg-input py-1.5 pl-8 pr-2.5 font-mono text-xs font-bold uppercase text-ink placeholder:font-sans placeholder:font-normal placeholder:normal-case placeholder:text-ink-muted focus:border-[#1956b4] focus:outline-none"
                  />
                </div>
              </div>

              {highlightedCoach && (
                <div className="mt-3 rounded-lg border border-blue-500/30 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-200">
                  Coach <strong>{highlightedCoach.code}</strong> (
                  {highlightedCoach.label}) is{" "}
                  {highlightedCoach.role === "locomotive"
                    ? "at the front Locomotive head"
                    : `coach #${highlightedCoach.coachOrderFromEngine} from the Engine`}
                  .
                </div>
              )}

              <div className="ta-no-scrollbar mt-3.5 overflow-x-auto pb-1">
                <div className="inline-flex min-w-max items-center gap-1.5">
                  {trainData.train.coaches.map((unit, idx) => {
                    const isMatch =
                      highlightedCoach?.index === unit.index &&
                      coachFilter.trim().length > 0;
                    const isLoco = unit.role === "locomotive";

                    return (
                      <div
                        key={`${unit.index}-${unit.code}`}
                        className="inline-flex items-center gap-1"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setCoachFilter((prev) =>
                              prev.toUpperCase() === unit.code ? "" : unit.code
                            )
                          }
                          className={`relative flex min-w-[70px] cursor-pointer flex-col items-center justify-between rounded-xl border px-2.5 py-2 text-center transition ${isMatch
                              ? "border-[#fc6203] bg-orange-50 ring-2 ring-[#fc6203]/30 dark:bg-orange-500/15"
                              : COACH_ROLE_STYLES[unit.role]
                            }`}
                        >
                          <span className="text-[10px] font-semibold text-ink-muted">
                            {isLoco ? "ENG" : `#${unit.coachOrderFromEngine}`}
                          </span>
                          <div className="my-0.5 flex items-center gap-1">
                            {isLoco ? (
                              <EngineTrainIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <CoachTrainIcon className="h-3.5 w-3.5 opacity-70" />
                            )}
                            <span className="font-mono text-xs font-extrabold text-ink sm:text-sm">
                              {unit.code}
                            </span>
                          </div>
                          <span className="max-w-[68px] truncate text-[10px] text-ink-soft">
                            {unit.label}
                          </span>
                        </button>
                        {idx < trainData.train.coaches.length - 1 && (
                          <span
                            aria-hidden="true"
                            className="h-0.5 w-1.5 bg-line-strong"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
