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
  BuildingStationIcon,
  CalendarIcon,
  ClockIcon,
  CloseIcon,
  CoachTrainIcon,
  CompassIcon,
  CopyIcon,
  EngineTrainIcon,
  FilterIcon,
  GaugeSpeedIcon,
  LiveTrainBeaconIcon,
  NavigationIcon,
  PrinterIcon,
  RefreshIcon,
  RouteTrackIcon,
  SearchIcon,
  SwapArrowsIcon,
  TicketIcon,
  TrainIcon,
  ZapIcon,
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
    const height = 270;
    const padX = 56;
    const padY = 40;

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

    // Prevent label crowding on mobile by spacing visible text labels >= 46px apart
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
    <div className="overflow-hidden rounded-3xl border border-line bg-card shadow-lg shadow-black/5 dark:shadow-black/30">
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-line px-4 py-3.5 sm:px-7 sm:py-4">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-700 dark:text-amber-300">
            <CompassIcon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink sm:text-sm">
              Live Railway Corridor Map
            </h3>
            <p className="text-[11px] text-ink-muted sm:text-xs">
              Tap any station pin to inspect platform &amp; arrival timings
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-ink-soft sm:text-xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="ta-led-blink h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>Live Train</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-amber-500 bg-card" />
            <span>Halts ({mapProjection.projectedHalts.length})</span>
          </span>
        </div>
      </div>

      <div className="bg-subcard/70 px-2 py-3 sm:px-6 sm:py-4">
        <svg
          viewBox={`0 0 ${mapProjection.width} ${mapProjection.height}`}
          className="h-48 w-full select-none sm:h-64"
          role="img"
          aria-label={`Live railway corridor map from ${data.train.source.name} to ${data.train.destination.name}`}
        >
          <defs>
            <linearGradient
              id="taRouteGlow"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="55%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {[55, 135, 215].map((gy) => (
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
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={mapProjection.fullPath}
            fill="none"
            stroke="#d97706"
            strokeOpacity="0.5"
            strokeWidth="2.4"
            strokeDasharray="6 5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Completed Track Segment */}
          {mapProjection.coveredPath && (
            <path
              d={mapProjection.coveredPath}
              fill="none"
              stroke="url(#taRouteGlow)"
              strokeWidth="5.5"
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
                    r={isSelected ? 8.5 : isEndpoint ? 6.5 : 5}
                    fill={
                      isSelected
                        ? "#ea580c"
                        : isPassed
                          ? "#10b981"
                          : isEndpoint
                            ? "#ea580c"
                            : "#fbbf24"
                    }
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  {(showLabel || isSelected) && (
                    <text
                      x={x}
                      y={labelAbove ? y - 12 : y + 19}
                      textAnchor="middle"
                      className="fill-ink font-mono text-[11px] font-extrabold"
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
                <>
                  <circle r="10" fill="#f97316" fillOpacity="0.35">
                    <animate
                      attributeName="r"
                      values="9;24;9"
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="fill-opacity"
                      values="0.55;0;0.55"
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle r="15" fill="#10b981" fillOpacity="0.25">
                    <animate
                      attributeName="r"
                      values="7;19;7"
                      dur="1.4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </>
              )}
              <circle
                r="11"
                fill={isActivelyMovingOrHalted ? "#ea580c" : "#57534e"}
                stroke="#ffffff"
                strokeWidth="2.5"
              />
              {/* Mini Train Glyph Inside SVG Pin */}
              <rect
                x="-5"
                y="-5.5"
                width="10"
                height="9"
                rx="2"
                fill="#ffffff"
              />
              <rect
                x="-3.5"
                y="-4"
                width="7"
                height="3"
                rx="0.8"
                fill="#ea580c"
              />
              <circle cx="-2.4" cy="1.5" r="1" fill="#ea580c" />
              <circle cx="2.4" cy="1.5" r="1" fill="#ea580c" />
            </g>
          )}
        </svg>
      </div>

      {/* Selected Halt Inspector Strip */}
      {activeStop && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-line bg-card px-4 py-3 text-xs sm:px-7 sm:py-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-orange-500/18 px-2.5 py-1 font-mono font-extrabold text-orange-800 dark:text-amber-300">
              {activeStop.stationCode}
            </span>
            <span className="text-sm font-extrabold text-ink">
              {activeStop.stationName}
            </span>
            <span className="text-ink-muted">
              · {activeStop.distanceKm} km
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 font-semibold text-ink-soft">
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
              <span className="rounded-md bg-amber-500/20 px-2 py-0.5 font-mono font-bold text-amber-900 dark:text-amber-300">
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
    "border-orange-500/60 bg-orange-500/20 text-orange-950 dark:text-amber-200",
  executive:
    "border-amber-500/50 bg-amber-500/22 text-amber-950 dark:text-amber-200",
  ac: "border-orange-500/35 bg-subcard text-ink",
  sleeper: "border-yellow-500/40 bg-yellow-500/15 text-ink",
  pantry: "border-rose-500/35 bg-rose-500/15 text-rose-800 dark:text-rose-300",
  power: "border-line-strong bg-subcard text-ink-soft",
  general: "border-line bg-subcard text-ink-soft",
};

function noopSubscribe() {
  return () => { };
}

export function LiveTrainTracker() {
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

  const initialQueryTrain = (searchParams.get("train") ?? "")
    .replace(/\D/g, "")
    .slice(0, 5);
  const rawQueryDate = searchParams.get("date") ?? "";
  const initialQueryDate = /^\d{4}-\d{2}-\d{2}$/.test(rawQueryDate)
    ? rawQueryDate
    : "";

  const [searchQuery, setSearchQuery] = useState(initialQueryTrain);
  const [dateInput, setDateInput] = useState(initialQueryDate);
  const [isAutoDate, setIsAutoDate] = useState(!initialQueryDate);
  const [loading, setLoading] = useState(initialQueryTrain.length >= 3);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [apiResponse, setApiResponse] =
    useState<OwnedLiveTrainApiResponse | null>(null);
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

  // Close autocomplete dropdown on outside click
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

  // Fetch autocomplete train suggestions when user types name or partial number
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
      options?: { syncUrl?: boolean; useAutoDate?: boolean }
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
            const url =
              !useAutoDate && cleanDate
                ? `/rail/live-status?train=${first.trainNumber}&date=${cleanDate}`
                : `/rail/live-status?train=${first.trainNumber}`;
            router.replace(url, { scroll: false });
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
        const url = useAutoDate
          ? `/rail/live-status?train=${digits}`
          : `/rail/live-status?train=${digits}&date=${cleanDate}`;
        router.replace(url, { scroll: false });
      }

      await performLookup(digits, cleanDate, useAutoDate);
    },
    [performLookup, router, suggestions, todayIst]
  );

  useEffect(() => {
    const qTrain = (searchParams.get("train") ?? "")
      .replace(/\D/g, "")
      .slice(0, 5);
    const rawDate = searchParams.get("date") ?? "";
    const hasExplicit = /^\d{4}-\d{2}-\d{2}$/.test(rawDate);
    const qDate = hasExplicit ? rawDate : todayIst || getTodayIstDateString();
    const lookupKey = `${qTrain}|${hasExplicit ? qDate : "auto"}`;

    if (qTrain.length >= 3 && lastCheckedKeyRef.current !== lookupKey) {
      lastCheckedKeyRef.current = lookupKey;
      void Promise.resolve().then(() => {
        setSearchQuery(qTrain);
        setIsAutoDate(!hasExplicit);
        if (hasExplicit) setDateInput(qDate);
        setLoading(true);
        return performLookup(qTrain, qDate, !hasExplicit);
      });
    }
  }, [searchParams, performLookup, todayIst]);

  const trainData = apiResponse?.success ? apiResponse.data : undefined;

  // Optional 30s Live Radar Auto-Refresh when enabled
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

  // Determine where the moving between-stations train card sits in the filtered list
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
    <div className="w-full space-y-5 sm:space-y-6">
      {/* Live Train Search Card */}
      <div className="rounded-3xl border border-line bg-card p-4 shadow-xl shadow-black/8 dark:shadow-black/35 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 sm:pb-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <LiveTrainBeaconIcon size="md" active />
            <div>
              <h2 className="text-base font-extrabold leading-tight text-ink sm:text-lg">
                Spot Your Train Live
              </h2>
              <p className="text-[11px] text-ink-muted sm:text-xs">
                Search by 5-digit train number or train name for live GPS radar,
                platform &amp; coach order
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/12 px-3 py-1 text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 sm:text-xs">
            <span className="ta-led-blink h-2 w-2 rounded-full bg-emerald-500" />
            <span>NTES + GPS Live Radar</span>
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-1 grid gap-2.5 md:grid-cols-[1.45fr_0.85fr_auto]"
        >
          {/* Train Number OR Name Autocomplete Input */}
          <div ref={searchBoxRef} className="relative">
            <label htmlFor="live-train-input" className="sr-only">
              Train Number or Train Name
            </label>
            <TrainIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-orange-600 dark:text-amber-400" />
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
              placeholder="Train No. or Name (e.g. 12002, Rajdhani)"
              className="w-full rounded-2xl border-2 border-line bg-input py-3.5 pl-11 pr-10 text-base font-bold text-ink placeholder:text-sm placeholder:font-medium placeholder:text-ink-muted transition focus:border-orange-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setDropdownOpen(true);
                }}
                aria-label="Clear train input"
                className="absolute right-3 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-subcard text-ink-muted hover:text-ink"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Instant Autocomplete Dropdown */}
            {dropdownOpen && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-line-strong bg-card p-1.5 shadow-2xl shadow-black/25">
                <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-ink-muted">
                  <span>
                    {searchQuery.trim().length < 2
                      ? "Popular Live Trains"
                      : "Matching Indian Railways Trains"}
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
                    className="flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-left transition hover:bg-subcard"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-orange-500/18 px-2 py-0.5 font-mono text-xs font-black text-orange-800 dark:text-amber-300">
                          #{item.trainNumber}
                        </span>
                        <span className="truncate text-xs font-extrabold text-ink sm:text-sm">
                          {item.trainName}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] font-medium text-ink-muted">
                        {item.sourceCode} → {item.destinationCode} · {item.type}
                      </p>
                    </div>
                    <ArrowRightIcon className="h-4 w-4 shrink-0 text-ink-muted" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Journey Start Date Input */}
          <div className="relative">
            <label htmlFor="live-train-date" className="sr-only">
              Train Origin Start Date
            </label>
            <CalendarIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-amber-600 dark:text-amber-300" />
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
              className="w-full rounded-2xl border-2 border-line bg-input py-3.5 pl-11 pr-3 font-mono text-base font-bold text-ink transition focus:border-orange-500 focus:outline-none sm:text-sm"
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="ta-btn-primary inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-extrabold md:w-auto sm:text-base disabled:cursor-not-allowed disabled:opacity-65"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/35 border-t-current" />
                <span>Locating Train...</span>
              </>
            ) : (
              <>
                <span className="ta-led-blink h-2 w-2 rounded-full bg-white dark:bg-stone-900" />
                <span>Track Live Status</span>
                <ArrowRightIcon className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Smart Start-Date Pills (Mobile Touch Scrollable) */}
        <div className="mt-3.5 flex flex-col gap-2.5 border-t border-line pt-3 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="ta-no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-0.5">
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
                  className={`shrink-0 cursor-pointer rounded-full border px-3 py-1 font-bold transition ${active
                    ? "border-orange-500/45 bg-orange-500/18 text-orange-800 dark:text-amber-300"
                    : "border-line bg-subcard text-ink-soft hover:border-orange-500/40 hover:text-ink"
                    }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Recent History Chips */}
          {recentTrains.length > 0 && (
            <div className="ta-no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-0.5">
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
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-line bg-subcard px-2.5 py-1 font-mono font-bold text-ink transition hover:border-orange-500"
                >
                  <span>#{item.trainNumber}</span>
                  <span className="font-sans text-[11px] font-medium text-ink-muted">
                    ({item.route})
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => writeRecentTrainsStorage([])}
                className="shrink-0 cursor-pointer px-1 font-semibold text-ink-muted underline-offset-2 hover:text-ink hover:underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* 1-Tap Quick Try Live Trains Strip (Shown when no train is loaded yet) */}
        {!trainData && !loading && (
          <div className="mt-3.5 rounded-2xl border border-line bg-subcard/70 p-3">
            <div className="flex items-center justify-between gap-2 text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="ta-led-blink h-2 w-2 rounded-full bg-orange-500" />
                <span>Instant 1-Tap Live Train Check</span>
              </span>
              <span className="hidden sm:inline">Tap any train to track live</span>
            </div>
            <div className="ta-no-scrollbar mt-2 flex items-center gap-2 overflow-x-auto pb-0.5">
              {POPULAR_LIVE_TRAINS.slice(0, 5).map((t) => (
                <button
                  key={t.trainNumber}
                  type="button"
                  onClick={() =>
                    void checkLiveTrain(t.trainNumber, todayIst, {
                      syncUrl: true,
                      useAutoDate: true,
                    })
                  }
                  className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-line bg-card px-3 py-2 text-left text-xs transition hover:border-orange-500"
                >
                  <TrainIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
                  <span className="font-mono font-black text-ink">
                    #{t.trainNumber}
                  </span>
                  <span className="font-semibold text-ink-soft">
                    {t.sourceCode}→{t.destinationCode}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/12 p-4 text-sm"
          >
            <AlertCircleIcon className="mt-0.5 h-5 w-5 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-bold text-ink">
                Unable to load live train running status
              </p>
              <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
                {errorMsg}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && !trainData && (
        <div className="animate-pulse space-y-4">
          <div className="overflow-hidden rounded-3xl border border-line bg-card shadow-lg">
            <div className="h-40 bg-subcard p-5 sm:p-7">
              <div className="h-5 w-44 rounded bg-line" />
              <div className="mt-4 h-8 w-80 max-w-full rounded bg-line" />
              <div className="mt-4 h-3 w-full rounded-full bg-line" />
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:gap-4 sm:p-6">
              <div className="h-24 rounded-2xl bg-subcard" />
              <div className="h-24 rounded-2xl bg-subcard" />
              <div className="h-24 rounded-2xl bg-subcard" />
              <div className="h-24 rounded-2xl bg-subcard" />
            </div>
          </div>
        </div>
      )}

      {/* Rich Live Train Status Dashboard */}
      {trainData && (
        <div className="space-y-5 sm:space-y-6">
          {/* 1. LIVE BLINKING TRAIN RADAR COCKPIT + COMMAND CARD */}
          <div className="overflow-hidden rounded-3xl border border-line bg-card shadow-2xl shadow-black/10 dark:shadow-black/45">
            {/* Dark High-Contrast Live GPS Radar Banner */}
            <div className="ta-live-cockpit px-4 py-5 sm:px-8 sm:py-6">
              {/* Top Radar Status & Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${isRunningOrHalted
                      ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-300"
                      : trainData.trackingState === "completed"
                        ? "border-amber-400/40 bg-amber-500/20 text-amber-200"
                        : "border-stone-500/50 bg-stone-700/45 text-stone-200"
                      }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${isRunningOrHalted
                        ? "ta-led-blink bg-emerald-400"
                        : "bg-amber-400"
                        }`}
                    />
                    <span>{trainData.statusLabel}</span>
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${trainData.delayMinutes > 0
                      ? "border-rose-400/40 bg-rose-500/20 text-rose-200"
                      : "border-emerald-400/35 bg-emerald-500/15 text-emerald-200"
                      }`}
                  >
                    <ClockIcon className="h-3 w-3" />
                    <span>{trainData.livePosition.delayStatus}</span>
                  </span>

                  {trainData.autoDetectedStartDate && (
                    <span className="rounded-full border border-amber-400/35 bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-200">
                      Active Overnight Run ({formatReadableDate(trainData.startDate)})
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[11px] font-semibold text-stone-300">
                    Synced {trainData.summary.lastUpdatedIst}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAutoRefresh((prev) => !prev)}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-bold transition ${autoRefresh
                      ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-200"
                      : "border-white/15 bg-white/8 text-stone-200 hover:border-orange-400"
                      }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${autoRefresh
                        ? "ta-led-blink bg-emerald-400"
                        : "bg-stone-400"
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
                    className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-white/15 bg-white/10 px-2.5 py-1.5 text-[11px] font-extrabold text-white transition hover:border-orange-400 disabled:opacity-60"
                  >
                    <RefreshIcon
                      className={`h-3.5 w-3.5 text-amber-300 ${loading ? "animate-spin" : ""
                        }`}
                    />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Blinking Train Icon + Live Status Narrative */}
              <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3.5 sm:items-center">
                  <LiveTrainBeaconIcon size="lg" active={isRunningOrHalted} />
                  <div className="min-w-0">
                    <p className="text-base font-black leading-snug text-white sm:text-xl">
                      {trainData.livePosition.headline}
                    </p>
                    <p className="mt-1 text-xs font-medium leading-relaxed text-amber-200/90 sm:text-sm">
                      {trainData.livePosition.subheadline}
                    </p>
                  </div>
                </div>

                {isRunningOrHalted && (
                  <button
                    type="button"
                    onClick={scrollToLiveTrain}
                    className="ta-btn-primary inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-extrabold"
                  >
                    <TrainIcon className="h-4 w-4" />
                    <span>Spot on Timeline</span>
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Interactive Animated Horizontal Train Journey Track */}
              <div className="mt-6 rounded-2xl border border-white/12 bg-black/30 px-4 py-4 sm:px-5">
                <div className="flex items-center justify-between gap-2 text-xs font-bold">
                  <div className="min-w-0">
                    <span className="font-mono text-sm font-black text-amber-300 sm:text-base">
                      {trainData.train.source.code}
                    </span>
                    <span className="ml-1.5 hidden text-stone-300 sm:inline">
                      {trainData.train.source.name}
                    </span>
                  </div>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[11px] font-extrabold text-amber-200">
                    {trainData.summary.distanceCoveredKm} /{" "}
                    {trainData.summary.distanceTotalKm} km (
                    {Math.round(trainData.progressPercent)}%)
                  </span>
                  <div className="min-w-0 text-right">
                    <span className="mr-1.5 hidden text-stone-300 sm:inline">
                      {trainData.train.destination.name}
                    </span>
                    <span className="font-mono text-sm font-black text-emerald-300 sm:text-base">
                      {trainData.train.destination.code}
                    </span>
                  </div>
                </div>

                {/* Railway Track with Blinking Train Marker */}
                <div className="relative my-5 h-3 w-full rounded-full bg-stone-800 ring-1 ring-white/15">
                  <div
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(3, trainData.progressPercent)
                      )}%`,
                      backgroundImage:
                        "linear-gradient(90deg, #10b981 0%, #ea580c 60%, #fbbf24 100%)",
                    }}
                    className="h-full rounded-full transition-all duration-700"
                  />
                  {/* Floating Blinking Train Icon on Progress Track */}
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

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-stone-300">
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
                      ? `Live Speed ~${trainData.livePosition.estimatedSpeedKmh} km/h`
                      : `${trainData.summary.haltsRemaining} halts remaining`}
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

            {/* Train Identity Sub-Header */}
            <div className="ta-ticket-header px-4 py-4 sm:px-8 sm:py-5">
              <div className="flex flex-col justify-between gap-3.5 lg:flex-row lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      style={{
                        backgroundImage:
                          "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)",
                        color: "#ffffff",
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 font-mono text-xs font-black shadow-xs sm:text-sm"
                    >
                      <TrainIcon className="h-3.5 w-3.5" />
                      <span>#{trainData.trainNumber}</span>
                    </span>
                    <span className="rounded-full border border-orange-500/35 bg-orange-500/15 px-2.5 py-0.5 text-[11px] font-extrabold text-orange-800 dark:text-amber-200">
                      {trainData.train.type}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-card/80 px-2.5 py-0.5 text-[11px] font-bold text-ink">
                      <CalendarIcon className="h-3 w-3 text-orange-600 dark:text-amber-400" />
                      <span>{formatReadableDate(trainData.startDate)}</span>
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
                        className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-orange-500/35 bg-card/90 px-2.5 py-0.5 text-[11px] font-extrabold text-orange-700 transition hover:border-orange-500 dark:text-amber-300"
                      >
                        <SwapArrowsIcon className="h-3 w-3" />
                        <span>Return #{trainData.train.returnTrain}</span>
                      </button>
                    )}
                  </div>

                  <h3 className="mt-2.5 text-xl font-black leading-snug tracking-tight text-ink sm:text-2xl">
                    {trainData.trainName}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-ink-soft">
                    {trainData.train.distanceKm} km ·{" "}
                    {trainData.train.durationFormatted} Run ·{" "}
                    {trainData.train.totalHalts} Official Halts
                  </p>
                </div>

                {/* Operating Run Days */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                    {trainData.train.isDaily ? "Runs Daily" : "Run Days"}
                  </span>
                  <div className="flex items-center gap-1">
                    {ALL_WEEK_DAYS.map((day) => {
                      const runs = trainData.train.runDays.includes(day.key);
                      return (
                        <span
                          key={day.key}
                          title={day.label}
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-lg font-mono text-[11px] font-extrabold sm:h-7 sm:w-7 sm:text-xs ${runs
                            ? "bg-orange-500/20 text-orange-800 ring-1 ring-orange-500/35 dark:text-amber-300"
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

            {/* Exceptions Notice (if any) */}
            {trainData.exceptions.length > 0 && (
              <div className="border-b border-line bg-rose-500/12 px-4 py-3 text-xs font-bold text-rose-800 dark:text-rose-300 sm:px-8">
                {trainData.exceptions.join(" · ")}
              </div>
            )}

            {/* 2. Four Compact Mobile-Friendly 2x2 Telemetry Cards */}
            <div className="grid grid-cols-2 gap-2.5 bg-card p-4 sm:gap-4 sm:p-6 lg:grid-cols-4 lg:px-8">
              {/* Current Position */}
              <div className="rounded-2xl border border-line bg-subcard p-3.5 sm:p-4">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted sm:text-[11px]">
                    Live Position
                  </span>
                  <NavigationIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                </div>
                <p className="mt-1.5 text-sm font-extrabold leading-snug text-ink sm:text-base">
                  {trainData.currentLocation
                    ? `${trainData.currentLocation.stationName} (${trainData.currentLocation.stationCode})`
                    : `${trainData.train.source.name} (${trainData.train.source.code})`}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-orange-700 dark:text-amber-300 sm:text-xs">
                  {trainData.currentLocation?.statusLabel ??
                    trainData.statusLabel}
                </p>
              </div>

              {/* Next Commercial Halt */}
              <div className="rounded-2xl border border-line bg-subcard p-3.5 sm:p-4">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted sm:text-[11px]">
                    Next Halt
                  </span>
                  <BuildingStationIcon className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                </div>
                {trainData.nextHalt ? (
                  <>
                    <p className="mt-1.5 text-sm font-extrabold leading-snug text-ink sm:text-base">
                      {trainData.nextHalt.stationName} (
                      {trainData.nextHalt.stationCode})
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-orange-700 dark:text-amber-300 sm:text-xs">
                      <span>
                        ETA {formatIstTime(trainData.nextHalt.expectedArrival)}
                      </span>
                      {trainData.nextHalt.platform && (
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[10px]">
                          PF #{trainData.nextHalt.platform}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[10px] font-medium text-ink-muted sm:text-[11px]">
                      {trainData.nextHalt.distanceFromCurrentKm} km ahead
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-xs font-bold text-ink-soft sm:text-sm">
                    Destination reached
                  </p>
                )}
              </div>

              {/* Speed Telemetry */}
              <div className="rounded-2xl border border-line bg-subcard p-3.5 sm:p-4">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted sm:text-[11px]">
                    Speed Radar
                  </span>
                  <GaugeSpeedIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                </div>
                <p className="mt-1.5 font-mono text-lg font-black text-ink sm:text-xl">
                  {trainData.livePosition.estimatedSpeedKmh}{" "}
                  <span className="font-sans text-[11px] font-bold text-ink-muted">
                    km/h
                  </span>
                </p>
                <p className="mt-1 text-[11px] font-semibold text-ink-soft sm:text-xs">
                  {trainData.train.avgSpeedKmph !== null
                    ? `Avg ${trainData.train.avgSpeedKmph} km/h`
                    : "Scheduled speed"}
                  {trainData.train.maxSpeedKmph !== null
                    ? ` · Max ${trainData.train.maxSpeedKmph}`
                    : ""}
                </p>
              </div>

              {/* Distance & Halts Remaining */}
              <div className="rounded-2xl border border-line bg-subcard p-3.5 sm:p-4">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted sm:text-[11px]">
                    Remaining
                  </span>
                  <RouteTrackIcon className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                </div>
                <p className="mt-1.5 font-mono text-lg font-black text-ink sm:text-xl">
                  {trainData.summary.distanceRemainingKm}{" "}
                  <span className="font-sans text-[11px] font-bold text-ink-muted">
                    km left
                  </span>
                </p>
                <p className="mt-1 text-[11px] font-semibold text-ink-soft sm:text-xs">
                  {trainData.summary.haltsCompleted}/
                  {trainData.summary.haltsTotal} halts completed
                </p>
              </div>
            </div>
          </div>

          {/* 3. STATION-BY-STATION VERTICAL TRACK TIMELINE WITH BLINKING LIVE TRAIN */}
          <div className="overflow-hidden rounded-3xl border border-line bg-card shadow-xl shadow-black/5 dark:shadow-black/30">
            {/* Timeline Controls Header */}
            <div className="flex flex-col justify-between gap-3.5 border-b border-line bg-subcard/60 px-4 py-4 sm:px-8 sm:py-5 lg:flex-row lg:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-ink sm:text-lg">
                    Live Train Track &amp; Station Status
                  </h3>
                  {isRunningOrHalted && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      <span className="ta-led-blink h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>LIVE</span>
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-ink-muted">
                  Showing {filteredRoute.length} of{" "}
                  {trainData.train.totalRouteStations} stations · Real-time
                  platform, arrival &amp; delay radar
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                {/* Halts Only vs All Passing Stations Toggle */}
                <div className="grid grid-cols-2 rounded-xl border border-line bg-card p-1 sm:inline-flex">
                  <button
                    type="button"
                    onClick={() => setShowAllStations(false)}
                    className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${!showAllStations
                      ? "ta-btn-primary"
                      : "text-ink-soft hover:text-ink"
                      }`}
                  >
                    <FilterIcon className="h-3.5 w-3.5" />
                    <span>Halts ({trainData.train.totalHalts})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAllStations(true)}
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${showAllStations
                      ? "ta-btn-primary"
                      : "text-ink-soft hover:text-ink"
                      }`}
                  >
                    All ({trainData.train.totalRouteStations})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Station Filter Input */}
                  <div className="relative flex-1 sm:w-48">
                    <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                    <input
                      type="text"
                      value={stationSearch}
                      onChange={(e) => setStationSearch(e.target.value)}
                      placeholder="Filter station..."
                      className="w-full rounded-xl border border-line bg-card py-2 pl-9 pr-3 text-base font-bold text-ink placeholder:text-xs placeholder:font-medium placeholder:text-ink-muted focus:border-orange-500 focus:outline-none sm:text-xs"
                    />
                  </div>

                  {isRunningOrHalted && (
                    <button
                      type="button"
                      onClick={scrollToLiveTrain}
                      className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-orange-500/40 bg-orange-500/15 px-3 py-2 text-xs font-extrabold text-orange-800 transition hover:bg-orange-500/25 dark:text-amber-300"
                    >
                      <span className="ta-led-blink h-2 w-2 rounded-full bg-orange-500" />
                      <span>Locate</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Vertical Railway Track Rows (Mobile & Desktop) */}
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
                      className={`relative flex items-stretch gap-3 px-3.5 sm:gap-5 sm:px-7 ${isCurrent
                        ? "bg-orange-500/12 ring-1 ring-inset ring-orange-500/30"
                        : stop.isHalt
                          ? "bg-card hover:bg-subcard/50"
                          : "bg-subcard/35 hover:bg-subcard/65"
                        }`}
                    >
                      {/* Continuous Vertical Railway Track Column */}
                      <div className="relative flex w-8 shrink-0 flex-col items-center sm:w-10">
                        {/* Upper Rail Connector */}
                        <div
                          className={`w-1 flex-1 ${isFirst
                            ? "bg-transparent"
                            : isDeparted || isCurrent
                              ? "bg-emerald-500 dark:bg-amber-400"
                              : "border-l-2 border-dashed border-line-strong"
                            }`}
                        />

                        {/* Station Node or Blinking Train Icon if Halted Here */}
                        <div className="relative z-10 my-1 flex items-center justify-center">
                          {isCurrent ? (
                            <LiveTrainBeaconIcon size="sm" active />
                          ) : (
                            <span
                              className={`inline-flex h-6 w-6 items-center justify-center rounded-full border-2 font-mono text-[10px] font-black sm:h-7 sm:w-7 sm:text-[11px] ${isDeparted
                                ? "border-emerald-500 bg-emerald-500/20 text-emerald-800 dark:border-amber-400 dark:bg-amber-400/20 dark:text-amber-300"
                                : stop.isHalt
                                  ? "border-orange-500/50 bg-card text-ink"
                                  : "h-4 w-4 border-line-strong bg-subcard text-transparent"
                                }`}
                            >
                              {isDeparted
                                ? "✓"
                                : stop.isHalt
                                  ? idx + 1
                                  : ""}
                            </span>
                          )}
                        </div>

                        {/* Lower Rail Connector */}
                        <div
                          className={`w-1 flex-1 ${isLast && !injectMovingTrainAfter
                            ? "bg-transparent"
                            : isDeparted
                              ? "bg-emerald-500 dark:bg-amber-400"
                              : "border-l-2 border-dashed border-line-strong"
                            }`}
                        />
                      </div>

                      {/* Station Info + Timings Grid */}
                      <div className="flex flex-1 flex-col justify-between gap-2.5 border-b border-line py-3.5 md:grid md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-center md:gap-4 md:py-4">
                        {/* Top/Left on Mobile: Station Name + Timings Side-by-Side */}
                        <div className="flex items-start justify-between gap-2 md:block">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={`rounded-md px-2 py-0.5 font-mono text-xs font-black ${stop.isHalt
                                  ? "bg-orange-500/18 text-orange-800 dark:text-amber-300"
                                  : "bg-subcard text-ink-muted"
                                  }`}
                              >
                                {stop.stationCode}
                              </span>
                              <span
                                className={`text-sm leading-snug sm:text-base ${stop.isHalt
                                  ? "font-extrabold text-ink"
                                  : "font-semibold text-ink-soft"
                                  }`}
                              >
                                {stop.stationName}
                              </span>
                              {isCurrent && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-orange-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                                  <span className="ta-led-blink h-1.5 w-1.5 rounded-full bg-emerald-300" />
                                  <span>Halted Here</span>
                                </span>
                              )}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-ink-muted">
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
                              ) : !stop.isHalt ? (
                                <>
                                  <span>·</span>
                                  <span>Pass-through</span>
                                </>
                              ) : null}
                            </div>

                            {/* Mobile Pills Row (PF + Delay) */}
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 md:hidden">
                              {stop.platform && (
                                <span className="rounded-md border border-amber-500/35 bg-amber-500/18 px-2 py-0.5 font-mono text-[10px] font-extrabold text-amber-900 dark:text-amber-300">
                                  PF #{stop.platform}
                                </span>
                              )}
                              {stop.isHalt && (
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${effectiveDelay > 0
                                    ? "bg-rose-500/18 text-rose-800 dark:text-rose-300"
                                    : "bg-emerald-500/14 text-emerald-800 dark:text-emerald-300"
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

                          {/* Compact Right-Aligned Arrival/Departure Column for Mobile */}
                          <div className="shrink-0 text-right font-mono text-xs md:hidden">
                            {!(stop.sequence === 1 && !stop.scheduledArrival) && (
                              <div>
                                <span className="mr-1 font-sans text-[10px] font-bold uppercase text-ink-muted">
                                  Arr
                                </span>
                                {arrActualStr &&
                                  arrActualStr !== arrScheduledStr ? (
                                  <span className="font-extrabold text-rose-700 dark:text-rose-300">
                                    {arrActualStr}
                                  </span>
                                ) : (
                                  <span className="font-bold text-ink">
                                    {arrActualStr ?? arrScheduledStr}
                                  </span>
                                )}
                              </div>
                            )}
                            {!(
                              stop.sequence ===
                              trainData.train.totalRouteStations &&
                              !stop.scheduledDeparture
                            ) && (
                                <div className="mt-0.5">
                                  <span className="mr-1 font-sans text-[10px] font-bold uppercase text-ink-muted">
                                    Dep
                                  </span>
                                  {depActualStr &&
                                    depActualStr !== depScheduledStr ? (
                                    <span className="font-extrabold text-rose-700 dark:text-rose-300">
                                      {depActualStr}
                                    </span>
                                  ) : (
                                    <span className="font-bold text-ink">
                                      {depActualStr ?? depScheduledStr}
                                    </span>
                                  )}
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Desktop Arrival Column */}
                        <div className="hidden text-xs md:block">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                            Arrival
                          </span>
                          {stop.sequence === 1 && !stop.scheduledArrival ? (
                            <span className="font-semibold text-ink-muted">
                              Origin Start
                            </span>
                          ) : (
                            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 font-mono">
                              {arrActualStr &&
                                arrActualStr !== arrScheduledStr ? (
                                <>
                                  <span className="text-ink-muted line-through">
                                    {arrScheduledStr}
                                  </span>
                                  <span className="text-sm font-extrabold text-rose-700 dark:text-rose-300">
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

                        {/* Desktop Departure Column */}
                        <div className="hidden text-xs md:block">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                            Departure
                          </span>
                          {stop.sequence ===
                            trainData.train.totalRouteStations &&
                            !stop.scheduledDeparture ? (
                            <span className="font-semibold text-ink-muted">
                              Terminates
                            </span>
                          ) : (
                            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 font-mono">
                              {depActualStr &&
                                depActualStr !== depScheduledStr ? (
                                <>
                                  <span className="text-ink-muted line-through">
                                    {depScheduledStr}
                                  </span>
                                  <span className="text-sm font-extrabold text-rose-700 dark:text-rose-300">
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

                        {/* Desktop Platform & Delay Badges */}
                        <div className="hidden items-center justify-end gap-2 md:flex">
                          {stop.platform && (
                            <span className="rounded-lg border border-amber-500/35 bg-amber-500/18 px-2.5 py-1 font-mono text-xs font-extrabold text-amber-900 dark:text-amber-300">
                              PF #{stop.platform}
                            </span>
                          )}
                          {stop.isHalt && (
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${effectiveDelay > 0
                                ? "bg-rose-500/18 text-rose-800 dark:text-rose-300"
                                : "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
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

                    {/* INJECTED BETWEEN-STATIONS LIVE BLINKING TRAIN CARD ON THE TRACK */}
                    {injectMovingTrainAfter && (
                      <div
                        ref={liveTrainRowRef}
                        id="live-train-anchor"
                        className="relative flex items-stretch gap-3 bg-gradient-to-r from-orange-500/16 via-amber-500/12 to-emerald-500/10 px-3.5 sm:gap-5 sm:px-7"
                      >
                        {/* Active Glowing Vertical Track Segment with Blinking Train */}
                        <div className="relative flex w-8 shrink-0 flex-col items-center sm:w-10">
                          <div className="w-1 flex-1 bg-emerald-500 dark:bg-amber-400" />
                          <div className="my-2">
                            <LiveTrainBeaconIcon size="md" active />
                          </div>
                          <div className="w-1 flex-1 border-l-2 border-dashed border-orange-500" />
                        </div>

                        {/* Live Moving Train Card */}
                        <div className="my-2.5 flex-1 rounded-2xl border-2 border-orange-500/45 bg-card p-3.5 shadow-md sm:p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                              <span className="ta-led-blink h-2 w-2 rounded-full bg-emerald-300" />
                              <span>Train Moving Live</span>
                            </span>
                            <div className="flex items-center gap-2 text-xs font-bold">
                              {trainData.livePosition.estimatedSpeedKmh > 0 && (
                                <span className="font-mono text-orange-700 dark:text-amber-300">
                                  ~{trainData.livePosition.estimatedSpeedKmh}{" "}
                                  km/h
                                </span>
                              )}
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${trainData.delayMinutes > 0
                                  ? "bg-rose-500/18 text-rose-800 dark:text-rose-300"
                                  : "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                                  }`}
                              >
                                {formatDelayText(trainData.delayMinutes)}
                              </span>
                            </div>
                          </div>

                          <p className="mt-2 text-sm font-black text-ink sm:text-base">
                            {trainData.livePosition.headline}
                          </p>
                          <p className="mt-0.5 text-xs font-semibold text-ink-soft">
                            {trainData.livePosition.subheadline}
                          </p>

                          {/* Segment Progress Bar Between Previous & Next Halt */}
                          {trainData.nextHalt && (
                            <div className="mt-2.5">
                              <div className="h-2 w-full overflow-hidden rounded-full bg-subcard">
                                <div
                                  style={{
                                    width: `${Math.round(
                                      trainData.livePosition
                                        .haltSegmentProgress * 100
                                    )}%`,
                                    backgroundImage:
                                      "linear-gradient(90deg, #10b981 0%, #ea580c 100%)",
                                  }}
                                  className="h-full rounded-full"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Action Bar */}
            <div className="no-print flex flex-col justify-between gap-3 border-t border-line bg-subcard px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:px-8">
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
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
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-line bg-card px-3 py-2.5 text-xs font-bold text-ink transition hover:border-orange-500"
                >
                  <RefreshIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
                  <span>Refresh Live</span>
                </button>

                <button
                  type="button"
                  onClick={() => void handleCopySummary()}
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-line bg-card px-3 py-2.5 text-xs font-bold text-ink transition hover:border-orange-500"
                >
                  <CopyIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
                  <span>{copied ? "Copied!" : "Copy Summary"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="col-span-2 inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-line bg-card px-3 py-2.5 text-xs font-bold text-ink transition hover:border-orange-500 sm:col-span-1"
                >
                  <PrinterIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
                  <span>Print Timetable</span>
                </button>
              </div>

              <Link
                href="/rail/pnr-status"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-extrabold text-orange-700 hover:text-orange-900 dark:text-amber-300 dark:hover:text-amber-200"
              >
                <TicketIcon className="h-4 w-4" />
                <span>Check 10-Digit PNR Status</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* 4. Interactive SVG Route Polyline Map */}
          <RoutePolylineMap data={trainData} />

          {/* 5. Visual Coach Position / Rake Composition Diagram */}
          {trainData.train.coaches.length > 0 && (
            <div className="overflow-hidden rounded-3xl border border-line bg-card p-4 shadow-lg shadow-black/5 dark:shadow-black/30 sm:p-7">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/18 text-amber-800 dark:text-amber-300">
                    <CoachTrainIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink sm:text-sm">
                      Coach Position from Engine (
                      {trainData.train.coaches.length} Units)
                    </h3>
                    <p className="text-[11px] text-ink-muted sm:text-xs">
                      Swipe left/right on mobile · Tap any coach to check exact
                      standing order on platform
                    </p>
                  </div>
                </div>

                {/* Find My Coach Input */}
                <div className="relative w-full sm:w-52">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                  <input
                    type="text"
                    value={coachFilter}
                    onChange={(e) => setCoachFilter(e.target.value)}
                    placeholder="Find coach (e.g. B4, C8)"
                    className="w-full rounded-xl border border-line bg-input py-2 pl-9 pr-3 font-mono text-base font-bold uppercase text-ink placeholder:font-sans placeholder:text-xs placeholder:font-medium placeholder:normal-case placeholder:text-ink-muted focus:border-orange-500 focus:outline-none sm:text-xs"
                  />
                </div>
              </div>

              {highlightedCoach && (
                <div className="mt-3.5 flex items-center gap-2 rounded-2xl border border-orange-500/35 bg-orange-500/12 px-4 py-2.5 text-xs font-bold text-orange-800 dark:text-amber-200">
                  <ZapIcon className="h-4 w-4 shrink-0" />
                  <span>
                    Coach <strong>{highlightedCoach.code}</strong> (
                    {highlightedCoach.label}) is{" "}
                    {highlightedCoach.role === "locomotive"
                      ? "at the front Locomotive head"
                      : `coach #${highlightedCoach.coachOrderFromEngine} from the Engine`}
                    .
                  </span>
                </div>
              )}

              {/* Horizontal Touch-Scrollable Train Rake */}
              <div className="ta-no-scrollbar mt-4 overflow-x-auto pb-2">
                <div className="inline-flex min-w-max items-center gap-1.5">
                  {trainData.train.coaches.map((unit, idx) => {
                    const isMatch =
                      highlightedCoach?.index === unit.index &&
                      coachFilter.trim().length > 0;
                    const isLoco = unit.role === "locomotive";

                    return (
                      <div
                        key={`${unit.index}-${unit.code}`}
                        className="inline-flex items-center gap-1.5"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setCoachFilter((prev) =>
                              prev.toUpperCase() === unit.code ? "" : unit.code
                            )
                          }
                          className={`group relative flex min-w-[74px] cursor-pointer flex-col items-center justify-between rounded-2xl border-2 px-2.5 py-2.5 text-center transition ${isMatch
                            ? "scale-105 border-orange-500 bg-orange-500/25 shadow-md ring-2 ring-orange-500/35"
                            : COACH_ROLE_STYLES[unit.role]
                            }`}
                        >
                          {isLoco && (
                            <span
                              aria-hidden="true"
                              className="ta-led-blink absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500"
                            />
                          )}
                          <span className="text-[10px] font-bold text-ink-muted">
                            {isLoco ? "ENGINE" : `#${unit.coachOrderFromEngine}`}
                          </span>
                          <div className="my-1 flex items-center gap-1">
                            {isLoco ? (
                              <EngineTrainIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                            ) : (
                              <CoachTrainIcon className="h-3.5 w-3.5 opacity-75" />
                            )}
                            <span className="font-mono text-sm font-black tracking-tight text-ink">
                              {unit.code}
                            </span>
                          </div>
                          <span className="max-w-[74px] truncate text-[10px] font-semibold text-ink-soft">
                            {unit.label}
                          </span>
                        </button>
                        {idx < trainData.train.coaches.length - 1 && (
                          <span
                            aria-hidden="true"
                            className="h-1 w-2 rounded-full bg-line-strong"
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
