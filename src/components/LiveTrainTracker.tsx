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
  formatIstTime,
  formatReadableDate,
  getTodayIstDateString,
  shiftDateString,
  type CoachRole,
  type NormalizedLiveTrainData,
  type NormalizedRouteStop,
  type OwnedLiveTrainApiResponse,
} from "@/lib/live-train-types";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  BuildingStationIcon,
  CalendarIcon,
  ClockIcon,
  CoachTrainIcon,
  CompassIcon,
  CopyIcon,
  EngineTrainIcon,
  FilterIcon,
  GaugeSpeedIcon,
  NavigationIcon,
  PrinterIcon,
  RadarLiveIcon,
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

    // Downsample dense polylines to ~180 points for crisp SVG rendering
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

    const projectedHalts = haltStops.map((stop) => {
      const [x, y] = project(stop.lat, stop.lng);
      return { stop, x, y };
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
    mapProjection.projectedHalts[0]?.stop;

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-card shadow-lg shadow-black/5 dark:shadow-black/30">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4 sm:px-7">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-700 dark:text-amber-300">
            <CompassIcon className="h-5 w-5" />
          </span>
          <div>
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-ink">
              Live Railway Corridor Geometry Map
            </h4>
            <p className="text-xs text-ink-muted">
              Plotted from real track polyline coordinates · Click any halt pin
              to inspect station timings
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
            <span>Train Position</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-amber-500 bg-card" />
            <span>Commercial Halts ({mapProjection.projectedHalts.length})</span>
          </span>
        </div>
      </div>

      <div className="bg-subcard/70 px-3 py-4 sm:px-6">
        <svg
          viewBox={`0 0 ${mapProjection.width} ${mapProjection.height}`}
          className="h-56 w-full select-none sm:h-64"
          role="img"
          aria-label={`Route map from ${data.train.source.name} to ${data.train.destination.name}`}
        >
          <defs>
            <linearGradient
              id="taRouteGlow"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* Subtle horizontal guide rails */}
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
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={mapProjection.fullPath}
            fill="none"
            stroke="#d97706"
            strokeOpacity="0.55"
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
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Commercial Halt Station Pins */}
          {mapProjection.projectedHalts.map(({ stop, x, y }, idx) => {
            const isSelected = activeStop?.stationCode === stop.stationCode;
            const isEndpoint =
              idx === 0 || idx === mapProjection.projectedHalts.length - 1;
            const labelAbove = idx % 2 === 0;

            return (
              <g
                key={stop.stationCode}
                onClick={() => setSelectedCode(stop.stationCode)}
                className="cursor-pointer"
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 8.5 : isEndpoint ? 6.5 : 5}
                  fill={isSelected || isEndpoint ? "#ea580c" : "#fbbf24"}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={labelAbove ? y - 12 : y + 19}
                  textAnchor="middle"
                  className="fill-ink font-mono text-[11px] font-extrabold"
                >
                  {stop.stationCode}
                </text>
              </g>
            );
          })}

          {/* Live Train Position Beacon */}
          {mapProjection.currentMarker && (
            <g>
              <circle
                cx={mapProjection.currentMarker.x}
                cy={mapProjection.currentMarker.y}
                r="14"
                fill="#f97316"
                fillOpacity="0.22"
              />
              <circle
                cx={mapProjection.currentMarker.x}
                cy={mapProjection.currentMarker.y}
                r="6.5"
                fill="#ea580c"
                stroke="#fef3c7"
                strokeWidth="2.5"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Selected Halt Inspector Strip */}
      {activeStop && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-card px-6 py-3.5 text-xs sm:px-7">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-lg bg-orange-500/18 px-2.5 py-1 font-mono font-extrabold text-orange-800 dark:text-amber-300">
              {activeStop.stationCode}
            </span>
            <span className="text-sm font-extrabold text-ink">
              {activeStop.stationName}
            </span>
            <span className="text-ink-muted">
              · {activeStop.distanceKm} km from origin
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-semibold text-ink-soft">
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
    "border-orange-500/60 bg-orange-500/20 text-orange-900 dark:text-amber-200",
  executive:
    "border-amber-500/50 bg-amber-500/22 text-amber-950 dark:text-amber-200",
  ac: "border-orange-500/35 bg-subcard text-ink",
  sleeper: "border-yellow-500/40 bg-yellow-500/15 text-ink",
  pantry: "border-rose-500/35 bg-rose-500/15 text-rose-800 dark:text-rose-300",
  power: "border-line-strong bg-subcard text-ink-soft",
  general: "border-line bg-subcard text-ink-soft",
};

function noopSubscribe() {
  return () => {};
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

  const [trainInput, setTrainInput] = useState(initialQueryTrain);
  const [dateInput, setDateInput] = useState(initialQueryDate);
  const effectiveDateInput = dateInput || todayIst;
  const [loading, setLoading] = useState(initialQueryTrain.length >= 3);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [apiResponse, setApiResponse] =
    useState<OwnedLiveTrainApiResponse | null>(null);
  const [copied, setCopied] = useState(false);

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
    async (digits: string, targetDate: string) => {
      try {
        const res = await fetch(
          `/api/trains/${encodeURIComponent(digits)}/live?date=${encodeURIComponent(
            targetDate
          )}`,
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
    async (targetTrain: string, targetDate: string, syncUrl = true) => {
      const digits = targetTrain.replace(/\D/g, "").slice(0, 5);
      if (digits.length < 3) {
        setErrorMsg(
          "Please enter a valid 4 or 5-digit Indian Railways train number."
        );
        return;
      }
      const cleanDate = /^\d{4}-\d{2}-\d{2}$/.test(targetDate)
        ? targetDate
        : todayIst || getTodayIstDateString();

      setTrainInput(digits);
      setDateInput(cleanDate);
      setLoading(true);
      setErrorMsg(null);
      setCopied(false);
      lastCheckedKeyRef.current = `${digits}|${cleanDate}`;

      if (syncUrl) {
        router.replace(
          `/rail/live-status?train=${digits}&date=${cleanDate}`,
          { scroll: false }
        );
      }

      await performLookup(digits, cleanDate);
    },
    [performLookup, router, todayIst]
  );

  useEffect(() => {
    const qTrain = (searchParams.get("train") ?? "")
      .replace(/\D/g, "")
      .slice(0, 5);
    const rawDate = searchParams.get("date") ?? "";
    const qDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
      ? rawDate
      : todayIst || getTodayIstDateString();
    const lookupKey = `${qTrain}|${qDate}`;

    if (qTrain.length >= 3 && lastCheckedKeyRef.current !== lookupKey) {
      lastCheckedKeyRef.current = lookupKey;
      setTrainInput(qTrain);
      setDateInput(qDate);
      setLoading(true);
      void performLookup(qTrain, qDate);
    }
  }, [searchParams, performLookup, todayIst]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void checkLiveTrain(trainInput, effectiveDateInput, true);
  };

  const trainData = apiResponse?.success ? apiResponse.data : undefined;

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
    const loc = trainData.currentLocation;
    const lines = [
      `TravelAdda Live Train Running Status`,
      `Train: #${trainData.trainNumber} ${trainData.trainName} (${trainData.train.type})`,
      `Start Date: ${formatReadableDate(trainData.startDate)}`,
      `Status: ${trainData.statusLabel} | Delay: ${
        trainData.delayMinutes > 0
          ? `+${trainData.delayMinutes} min`
          : "On Time"
      }`,
      `Route: ${trainData.train.source.name} (${trainData.train.source.code}) -> ${trainData.train.destination.name} (${trainData.train.destination.code})`,
      loc
        ? `Current Position: ${loc.stationName} (${loc.stationCode}) - ${loc.distanceFromOriginKm} km covered`
        : "",
      trainData.nextHalt
        ? `Next Halt: ${trainData.nextHalt.stationName} (${trainData.nextHalt.stationCode}) at ${formatIstTime(
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

  return (
    <div className="w-full space-y-6">
      {/* Live Train Search Card */}
      <div className="rounded-3xl border border-line bg-card p-5 shadow-xl shadow-black/8 dark:shadow-black/35 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-700 dark:text-amber-300">
              <RadarLiveIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-ink sm:text-lg">
                Track Live Train Running Status
              </h2>
              <p className="text-xs text-ink-muted">
                Enter your 5-digit train number and journey start date for live
                location, platform, coach rake &amp; station timings
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/12 px-3 py-1 text-xs font-bold text-orange-700 dark:text-amber-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500 dark:bg-amber-400" />
            <span>Real-Time Rail Radar</span>
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-1 grid gap-3 md:grid-cols-[1.25fr_0.95fr_auto]"
        >
          {/* Train Number Input */}
          <div className="relative">
            <label htmlFor="live-train-input" className="sr-only">
              Train Number
            </label>
            <TrainIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-orange-600 dark:text-amber-400" />
            <input
              id="live-train-input"
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={trainInput}
              onChange={(e) => {
                setTrainInput(e.target.value.replace(/\D/g, "").slice(0, 5));
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Enter 5-digit Train No."
              className="w-full rounded-2xl border-2 border-line bg-input py-3.5 pl-12 pr-16 font-mono text-lg font-bold tracking-wider text-ink placeholder:font-sans placeholder:text-sm placeholder:font-medium placeholder:tracking-normal placeholder:text-ink-muted transition focus:border-orange-500 focus:outline-none"
            />
            <span
              className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 font-mono text-xs font-bold ${
                trainInput.length === 5
                  ? "bg-amber-500/20 text-amber-800 dark:text-amber-300"
                  : "bg-subcard text-ink-muted"
              }`}
            >
              {trainInput.length}/5
            </span>
          </div>

          {/* Journey Start Date Input */}
          <div className="relative">
            <label htmlFor="live-train-date" className="sr-only">
              Train Start Date
            </label>
            <CalendarIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-amber-600 dark:text-amber-300" />
            <input
              id="live-train-date"
              type="date"
              value={effectiveDateInput}
              onChange={(e) => {
                setDateInput(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              className="w-full rounded-2xl border-2 border-line bg-input py-3.5 pl-12 pr-4 font-mono text-sm font-bold text-ink transition focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="ta-btn-primary inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-extrabold sm:text-base disabled:cursor-not-allowed disabled:opacity-65"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/35 border-t-current" />
                <span>Tracking...</span>
              </>
            ) : (
              <>
                <span>Track Live Status</span>
                <ArrowRightIcon className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Start-Date Selector Pills + Recent History */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-ink-muted">Start Date:</span>
            {[
              { label: "Yesterday", value: yesterdayIst },
              { label: "Today", value: todayIst },
              { label: "Tomorrow", value: tomorrowIst },
            ].map((opt) => {
              const active = Boolean(opt.value) && effectiveDateInput === opt.value;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => {
                    if (!opt.value) return;
                    setDateInput(opt.value);
                    if (trainInput.length >= 3) {
                      void checkLiveTrain(trainInput, opt.value, true);
                    }
                  }}
                  className={`cursor-pointer rounded-full border px-3 py-1 font-bold transition ${
                    active
                      ? "border-orange-500/45 bg-orange-500/18 text-orange-800 dark:text-amber-300"
                      : "border-line bg-subcard text-ink-soft hover:border-orange-500/40 hover:text-ink"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {recentTrains.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-ink-muted">Recent:</span>
              {recentTrains.slice(0, 3).map((item) => (
                <button
                  key={item.trainNumber}
                  type="button"
                  onClick={() =>
                    void checkLiveTrain(
                      item.trainNumber,
                      item.lastDate || effectiveDateInput,
                      true
                    )
                  }
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-subcard px-3 py-1 font-mono font-bold text-ink transition hover:border-orange-500"
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
                className="cursor-pointer font-semibold text-ink-muted underline-offset-2 hover:text-ink hover:underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/12 p-4 text-sm"
          >
            <AlertCircleIcon className="mt-0.5 h-5 w-5 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-bold text-ink">
                Unable to load live train running status
              </p>
              <p className="mt-0.5 text-ink-soft">{errorMsg}</p>
            </div>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && !trainData && (
        <div className="animate-pulse space-y-4">
          <div className="overflow-hidden rounded-3xl border border-line bg-card shadow-lg">
            <div className="h-36 bg-subcard p-6">
              <div className="h-5 w-52 rounded bg-line" />
              <div className="mt-4 h-8 w-96 max-w-full rounded bg-line" />
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-4">
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
        <div className="space-y-6">
          {/* 1. Primary Train Command Card */}
          <div className="overflow-hidden rounded-3xl border border-line bg-card shadow-2xl shadow-black/10 dark:shadow-black/45">
            <div className="ta-ticket-header px-6 py-6 sm:px-8 sm:py-7">
              {/* Top Badges Row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)",
                      color: "#ffffff",
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1 font-mono text-sm font-black shadow-xs"
                  >
                    <TrainIcon className="h-4 w-4" />
                    <span>#{trainData.trainNumber}</span>
                  </span>

                  <span className="rounded-full border border-orange-500/35 bg-orange-500/15 px-3 py-1 text-xs font-extrabold text-orange-800 dark:text-amber-200">
                    {trainData.train.type}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/35 bg-amber-500/18 px-3 py-1 text-xs font-extrabold text-amber-900 dark:text-amber-200">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        trainData.isLive
                          ? "animate-ping bg-orange-500"
                          : "bg-amber-500"
                      }`}
                    />
                    <span>{trainData.statusLabel}</span>
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold ${
                      trainData.delayMinutes > 0
                        ? "border-rose-500/35 bg-rose-500/18 text-rose-800 dark:text-rose-300"
                        : "border-amber-500/35 bg-card/85 text-amber-900 dark:text-amber-300"
                    }`}
                  >
                    <ClockIcon className="h-3.5 w-3.5" />
                    <span>
                      {trainData.delayMinutes > 0
                        ? `Delayed by ${trainData.delayMinutes} min`
                        : "Right On Time"}
                    </span>
                  </span>
                </div>

                {/* Start Date & Return Train Button */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card/85 px-3 py-1.5 text-xs font-bold text-ink">
                    <CalendarIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
                    <span>{formatReadableDate(trainData.startDate)}</span>
                  </span>

                  {trainData.train.returnTrain && (
                    <button
                      type="button"
                      onClick={() =>
                        void checkLiveTrain(
                          trainData.train.returnTrain!,
                          effectiveDateInput,
                          true
                        )
                      }
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-orange-500/35 bg-card/90 px-3 py-1.5 text-xs font-extrabold text-orange-700 transition hover:border-orange-500 dark:text-amber-300"
                    >
                      <SwapArrowsIcon className="h-3.5 w-3.5" />
                      <span>Return #{trainData.train.returnTrain}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Train Title & Operating Days */}
              <div className="mt-5 flex flex-col justify-between gap-4 border-t border-line pt-5 lg:flex-row lg:items-center">
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">
                    {trainData.trainName}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-ink-soft">
                    {trainData.train.distanceKm} km Total Distance ·{" "}
                    {trainData.train.durationFormatted} Scheduled Run ·{" "}
                    {trainData.train.totalHalts} Commercial Halts
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
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-lg font-mono text-xs font-extrabold ${
                            runs
                              ? "bg-orange-500/20 text-orange-800 ring-1 ring-orange-500/35 dark:text-amber-300"
                              : "bg-card/60 text-ink-muted opacity-50"
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

            {/* Origin -> Journey Progress Bar -> Destination */}
            <div className="border-b border-line bg-subcard px-6 py-6 sm:px-8">
              <div className="grid items-center gap-6 md:grid-cols-[1fr_1.2fr_1fr]">
                {/* Source */}
                <div>
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-ink-muted">
                    <BuildingStationIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
                    <span>Origin Station</span>
                  </p>
                  <div className="mt-1 flex items-baseline gap-2.5">
                    <span className="font-mono text-2xl font-black text-ink">
                      {trainData.train.source.code}
                    </span>
                    <span className="text-base font-bold text-ink-soft">
                      {trainData.train.source.name}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-semibold text-ink-muted">
                    {originStop?.scheduledDeparture && (
                      <span>
                        Dep:{" "}
                        <strong className="font-mono text-ink">
                          {formatIstTime(
                            originStop.actualDeparture ??
                              originStop.scheduledDeparture
                          )}
                        </strong>
                      </span>
                    )}
                    {originStop?.platform && (
                      <span className="rounded bg-amber-500/20 px-2 py-0.5 font-mono font-bold text-amber-900 dark:text-amber-300">
                        PF #{originStop.platform}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Track */}
                <div className="rounded-2xl border border-line bg-card p-4 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-orange-700 dark:text-amber-300">
                      {trainData.currentLocation?.distanceFromOriginKm ?? 0} km
                      covered
                    </span>
                    <span className="font-mono text-ink-muted">
                      {Math.round(trainData.progressPercent)}% ·{" "}
                      {trainData.train.durationFormatted}
                    </span>
                  </div>
                  <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-subcard ring-1 ring-line">
                    <div
                      style={{
                        width: `${Math.max(4, trainData.progressPercent)}%`,
                        backgroundImage:
                          "linear-gradient(90deg, #ea580c 0%, #f59e0b 100%)",
                      }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                  <p className="mt-2 text-center text-[11px] font-semibold text-ink-soft">
                    {trainData.currentLocation
                      ? `${trainData.currentLocation.statusLabel}: ${trainData.currentLocation.stationName} (${trainData.currentLocation.stationCode})`
                      : `${trainData.statusLabel}`}
                  </p>
                </div>

                {/* Destination */}
                <div className="md:text-right">
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-ink-muted md:justify-end">
                    <BuildingStationIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" />
                    <span>Destination Station</span>
                  </p>
                  <div className="mt-1 flex items-baseline gap-2.5 md:justify-end">
                    <span className="font-mono text-2xl font-black text-ink">
                      {trainData.train.destination.code}
                    </span>
                    <span className="text-base font-bold text-ink-soft">
                      {trainData.train.destination.name}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-semibold text-ink-muted md:justify-end">
                    {destStop?.scheduledArrival && (
                      <span>
                        Arr:{" "}
                        <strong className="font-mono text-ink">
                          {formatIstTime(
                            destStop.actualArrival ?? destStop.scheduledArrival
                          )}
                        </strong>
                      </span>
                    )}
                    {destStop?.platform && (
                      <span className="rounded bg-amber-500/20 px-2 py-0.5 font-mono font-bold text-amber-900 dark:text-amber-300">
                        PF #{destStop.platform}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Exceptions Notice (if any) */}
            {trainData.exceptions.length > 0 && (
              <div className="border-b border-line bg-rose-500/12 px-6 py-3.5 text-xs font-bold text-rose-800 dark:text-rose-300 sm:px-8">
                {trainData.exceptions.join(" · ")}
              </div>
            )}

            {/* 2. Four High-Clarity Telemetry Spotlight Cards */}
            <div className="grid gap-4 bg-card p-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
              {/* Current Position */}
              <div className="rounded-2xl border border-line bg-subcard p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                    Current Location
                  </span>
                  <NavigationIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                </div>
                <p className="mt-2 text-base font-extrabold text-ink">
                  {trainData.currentLocation
                    ? `${trainData.currentLocation.stationName} (${trainData.currentLocation.stationCode})`
                    : `${trainData.train.source.name} (${trainData.train.source.code})`}
                </p>
                <p className="mt-1 text-xs font-semibold text-orange-700 dark:text-amber-300">
                  {trainData.currentLocation?.statusLabel ??
                    trainData.statusLabel}
                </p>
                {trainData.currentLocation?.lat !== null &&
                  trainData.currentLocation?.lat !== undefined &&
                  trainData.currentLocation?.lng !== null &&
                  trainData.currentLocation?.lng !== undefined && (
                    <p className="mt-1.5 font-mono text-[11px] text-ink-muted">
                      GPS {trainData.currentLocation.lat.toFixed(4)}°N,{" "}
                      {trainData.currentLocation.lng.toFixed(4)}°E
                    </p>
                  )}
              </div>

              {/* Next Commercial Halt */}
              <div className="rounded-2xl border border-line bg-subcard p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                    Next Official Halt
                  </span>
                  <BuildingStationIcon className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                </div>
                {trainData.nextHalt ? (
                  <>
                    <p className="mt-2 text-base font-extrabold text-ink">
                      {trainData.nextHalt.stationName} (
                      {trainData.nextHalt.stationCode})
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-orange-700 dark:text-amber-300">
                      <span>
                        ETA {formatIstTime(trainData.nextHalt.expectedArrival)}
                      </span>
                      {trainData.nextHalt.platform && (
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[11px]">
                          PF #{trainData.nextHalt.platform}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[11px] font-medium text-ink-muted">
                      At {trainData.nextHalt.distanceKm} km from origin
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm font-bold text-ink-soft">
                    Final destination reached
                  </p>
                )}
              </div>

              {/* Speed Telemetry */}
              <div className="rounded-2xl border border-line bg-subcard p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                    Speed Profile
                  </span>
                  <GaugeSpeedIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                </div>
                <p className="mt-2 font-mono text-xl font-black text-ink">
                  {trainData.currentLocation?.speedKmh ?? 0}{" "}
                  <span className="text-xs font-bold text-ink-muted">
                    km/h live
                  </span>
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-semibold text-ink-soft">
                  {trainData.train.avgSpeedKmph !== null && (
                    <span>Avg: {trainData.train.avgSpeedKmph} km/h</span>
                  )}
                  {trainData.train.maxSpeedKmph !== null && (
                    <span className="text-orange-700 dark:text-amber-300">
                      · Max: {trainData.train.maxSpeedKmph} km/h
                    </span>
                  )}
                </div>
              </div>

              {/* Halts & Schedule Coverage */}
              <div className="rounded-2xl border border-line bg-subcard p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                    Route &amp; Halts
                  </span>
                  <RouteTrackIcon className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                </div>
                <p className="mt-2 font-mono text-xl font-black text-ink">
                  {trainData.train.totalHalts}{" "}
                  <span className="font-sans text-xs font-bold text-ink-muted">
                    Commercial Stops
                  </span>
                </p>
                <p className="mt-1.5 text-xs font-semibold text-ink-soft">
                  {trainData.train.totalRouteStations} total route stations ·{" "}
                  {trainData.train.category}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Interactive SVG Route Polyline Map */}
          <RoutePolylineMap data={trainData} />

          {/* 4. Visual Coach Position / Rake Composition Diagram */}
          {trainData.train.coaches.length > 0 && (
            <div className="overflow-hidden rounded-3xl border border-line bg-card p-6 shadow-lg shadow-black/5 dark:shadow-black/30 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/18 text-amber-800 dark:text-amber-300">
                    <CoachTrainIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="text-sm font-extrabold uppercase tracking-wider text-ink">
                      Coach Position &amp; Rake Order ({trainData.train.coaches.length}{" "}
                      Units)
                    </h4>
                    <p className="text-xs text-ink-muted">
                      Exact coach sequence from Locomotive Engine to help you
                      stand at the right spot on the platform
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
                    placeholder="Find coach (e.g. C8)"
                    className="w-full rounded-xl border border-line bg-input py-2 pl-9 pr-3 font-mono text-xs font-bold uppercase text-ink placeholder:font-sans placeholder:font-medium placeholder:normal-case placeholder:text-ink-muted focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {highlightedCoach && (
                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-orange-500/35 bg-orange-500/12 px-4 py-2.5 text-xs font-bold text-orange-800 dark:text-amber-200">
                  <ZapIcon className="h-4 w-4 shrink-0" />
                  <span>
                    Coach <strong>{highlightedCoach.code}</strong> (
                    {highlightedCoach.label}) is{" "}
                    {highlightedCoach.role === "locomotive"
                      ? "at the front Locomotive head"
                      : `position #${highlightedCoach.coachOrderFromEngine} from the Engine`}
                    .
                  </span>
                </div>
              )}

              {/* Horizontal Scrollable Train Rake */}
              <div className="mt-5 overflow-x-auto pb-2">
                <div className="inline-flex min-w-max items-stretch gap-2">
                  {trainData.train.coaches.map((unit) => {
                    const isMatch =
                      highlightedCoach?.index === unit.index &&
                      coachFilter.trim().length > 0;
                    const isLoco = unit.role === "locomotive";

                    return (
                      <button
                        key={`${unit.index}-${unit.code}`}
                        type="button"
                        onClick={() =>
                          setCoachFilter((prev) =>
                            prev.toUpperCase() === unit.code ? "" : unit.code
                          )
                        }
                        className={`group relative flex min-w-[76px] cursor-pointer flex-col items-center justify-between rounded-2xl border-2 px-3 py-2.5 text-center transition ${
                          isMatch
                            ? "scale-105 border-orange-500 bg-orange-500/25 shadow-md ring-2 ring-orange-500/35"
                            : COACH_ROLE_STYLES[unit.role]
                        }`}
                      >
                        <span className="text-[10px] font-bold text-ink-muted">
                          {isLoco ? "HEAD" : `#${unit.coachOrderFromEngine}`}
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
                        <span className="max-w-[78px] truncate text-[10px] font-semibold text-ink-soft">
                          {unit.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 5. Station-by-Station Live Running Timeline & Timetable */}
          <div className="overflow-hidden rounded-3xl border border-line bg-card shadow-xl shadow-black/5 dark:shadow-black/30">
            {/* Timeline Controls Header */}
            <div className="flex flex-col justify-between gap-4 border-b border-line bg-subcard/60 px-6 py-5 sm:px-8 lg:flex-row lg:items-center">
              <div>
                <h4 className="text-base font-extrabold text-ink sm:text-lg">
                  Live Station-by-Station Schedule &amp; Platform Status
                </h4>
                <p className="mt-0.5 text-xs text-ink-muted">
                  Showing {filteredRoute.length} of{" "}
                  {trainData.train.totalRouteStations} stations · Scheduled vs
                  expected timings, delays, platforms &amp; section speeds
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Halts Only vs All Passing Stations Toggle */}
                <div className="inline-flex rounded-xl border border-line bg-card p-1">
                  <button
                    type="button"
                    onClick={() => setShowAllStations(false)}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                      !showAllStations
                        ? "ta-btn-primary"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    <FilterIcon className="h-3.5 w-3.5" />
                    <span>Official Halts ({trainData.train.totalHalts})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAllStations(true)}
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                      showAllStations
                        ? "ta-btn-primary"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    All Stations ({trainData.train.totalRouteStations})
                  </button>
                </div>

                {/* Station Filter Input */}
                <div className="relative flex-1 sm:w-52 sm:flex-initial">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                  <input
                    type="text"
                    value={stationSearch}
                    onChange={(e) => setStationSearch(e.target.value)}
                    placeholder="Search station or code..."
                    className="w-full rounded-xl border border-line bg-card py-2 pl-9 pr-3 text-xs font-bold text-ink placeholder:font-medium placeholder:text-ink-muted focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Station Rows */}
            <div className="divide-y divide-line">
              {filteredRoute.map((stop, idx) => {
                const isCurrent = stop.stopState === "current";
                const isDeparted = stop.stopState === "departed";
                const isFirst = stop.sequence === 1;
                const isLast =
                  stop.sequence === trainData.train.totalRouteStations;

                const effectiveDelay = Math.max(
                  stop.delayArrival,
                  stop.delayDeparture
                );
                const arrScheduledStr = formatIstTime(stop.scheduledArrival);
                const arrActualStr = stop.actualArrival
                  ? formatIstTime(stop.actualArrival)
                  : null;
                const depScheduledStr = formatIstTime(stop.scheduledDeparture);
                const depActualStr = stop.actualDeparture
                  ? formatIstTime(stop.actualDeparture)
                  : null;

                return (
                  <div
                    key={`${stop.sequence}-${stop.stationCode}`}
                    className={`relative grid gap-3 px-5 py-4 transition sm:px-8 md:grid-cols-[auto_1.5fr_1.15fr_1.15fr_0.9fr_0.95fr] md:items-center ${
                      isCurrent
                        ? "bg-orange-500/10"
                        : stop.isHalt
                          ? "bg-card hover:bg-subcard/55"
                          : "bg-subcard/35 hover:bg-subcard/70"
                    }`}
                  >
                    {/* Track Node Indicator */}
                    <div className="hidden flex-col items-center md:flex">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full border-2 font-mono text-[11px] font-black ${
                          isCurrent
                            ? "border-orange-500 bg-orange-500 text-white ring-4 ring-orange-500/25"
                            : isDeparted
                              ? "border-amber-500 bg-amber-500/20 text-amber-900 dark:text-amber-300"
                              : stop.isHalt
                                ? "border-orange-500/45 bg-card text-ink"
                                : "border-line-strong bg-subcard text-ink-muted"
                        }`}
                      >
                        {isDeparted ? "✓" : idx + 1}
                      </span>
                    </div>

                    {/* Station Name & Code */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-lg px-2.5 py-0.5 font-mono text-xs font-black ${
                            stop.isHalt
                              ? "bg-orange-500/18 text-orange-800 dark:text-amber-300"
                              : "bg-subcard text-ink-muted"
                          }`}
                        >
                          {stop.stationCode}
                        </span>
                        <span
                          className={`text-sm sm:text-base ${
                            stop.isHalt
                              ? "font-extrabold text-ink"
                              : "font-semibold text-ink-soft"
                          }`}
                        >
                          {stop.stationName}
                        </span>
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-current" />
                            <span>Train Here</span>
                          </span>
                        )}
                        {!stop.isHalt && (
                          <span className="rounded bg-subcard px-2 py-0.5 text-[10px] font-bold uppercase text-ink-muted">
                            Pass-through
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-ink-muted">
                        Stop #{stop.sequence} · Day {stop.arrivalDay || stop.departureDay || 1}
                        {stop.haltMinutes
                          ? ` · ${stop.haltMinutes}m halt`
                          : isFirst
                            ? " · Origin Departure"
                            : isLast
                              ? " · Final Termination"
                              : ""}
                      </p>
                    </div>

                    {/* Arrival Column */}
                    <div className="text-xs">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                        Arrival
                      </span>
                      {isFirst && !stop.scheduledArrival ? (
                        <span className="font-semibold text-ink-muted">
                          Starts Here
                        </span>
                      ) : (
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 font-mono">
                          {arrActualStr && arrActualStr !== arrScheduledStr ? (
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

                    {/* Departure Column */}
                    <div className="text-xs">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                        Departure
                      </span>
                      {isLast && !stop.scheduledDeparture ? (
                        <span className="font-semibold text-ink-muted">
                          Ends Here
                        </span>
                      ) : (
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 font-mono">
                          {depActualStr && depActualStr !== depScheduledStr ? (
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

                    {/* Platform & Delay Status */}
                    <div className="flex flex-wrap items-center gap-2">
                      {stop.platform && (
                        <span className="rounded-lg border border-amber-500/35 bg-amber-500/18 px-2.5 py-1 font-mono text-xs font-extrabold text-amber-900 dark:text-amber-300">
                          PF #{stop.platform}
                        </span>
                      )}
                      {stop.isHalt && (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                            effectiveDelay > 0
                              ? "bg-rose-500/18 text-rose-800 dark:text-rose-300"
                              : "bg-orange-500/12 text-orange-800 dark:text-amber-300"
                          }`}
                        >
                          {effectiveDelay > 0
                            ? `+${effectiveDelay}m late`
                            : "On Time"}
                        </span>
                      )}
                    </div>

                    {/* Distance & Section Speed */}
                    <div className="text-xs md:text-right">
                      <p className="font-mono text-sm font-extrabold text-ink">
                        {stop.distanceKm} km
                      </p>
                      {stop.speedToNextStationKmph !== null && (
                        <p className="font-mono text-[11px] text-ink-muted">
                          {stop.speedToNextStationKmph} km/h next
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Action Bar */}
            <div className="no-print flex flex-wrap items-center justify-between gap-3 border-t border-line bg-subcard px-6 py-4 sm:px-8">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    void checkLiveTrain(
                      trainData.trainNumber,
                      trainData.startDate,
                      false
                    )
                  }
                  disabled={loading}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-card px-3.5 py-2 text-xs font-bold text-ink transition hover:border-orange-500"
                >
                  <RefreshIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
                  <span>Refresh Live Status</span>
                </button>

                <button
                  type="button"
                  onClick={() => void handleCopySummary()}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-card px-3.5 py-2 text-xs font-bold text-ink transition hover:border-orange-500"
                >
                  <CopyIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
                  <span>
                    {copied ? "Copied Live Summary!" : "Copy Running Summary"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-card px-3.5 py-2 text-xs font-bold text-ink transition hover:border-orange-500"
                >
                  <PrinterIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
                  <span>Print Timetable</span>
                </button>
              </div>

              <Link
                href="/rail/pnr-status"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-orange-700 hover:text-orange-900 dark:text-amber-300 dark:hover:text-amber-200"
              >
                <TicketIcon className="h-4 w-4" />
                <span>Have a ticket? Check 10-digit PNR Status</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
