"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildChartTimePath,
  type EnrichedChartTimeData,
  type OwnedChartTimeApiResponse,
  POPULAR_CHART_TRAINS,
} from "@/lib/chart-time-types";
import {
  buildTrainLiveStatusPath,
  type OwnedTrainSearchApiResponse,
  POPULAR_LIVE_TRAINS,
  type TrainSearchItem,
} from "@/lib/live-train-types";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  BuildingStationIcon,
  CheckCircleIcon,
  ClockIcon,
  CloseIcon,
  CopyIcon,
  MapPinIcon,
  RefreshIcon,
  SearchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TicketIcon,
  TrainIcon,
} from "./Icons";

const RECENT_CHART_TRAINS_KEY = "traveladda_recent_chart_trains_v1";

interface RecentChartSearch {
  trainNumber: string;
  trainName: string;
  route: string;
}

export interface TrainChartTimeCheckerProps {
  initialTrainNumber?: string;
  initialData?: EnrichedChartTimeData | null;
}

export function TrainChartTimeChecker({
  initialTrainNumber,
  initialData = null,
}: TrainChartTimeCheckerProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUrlTrain =
    initialData?.trainNumber ||
    initialTrainNumber ||
    searchParams.get("train") ||
    "12952";

  const [query, setQuery] = useState(initialUrlTrain);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [remoteTrains, setRemoteTrains] = useState<TrainSearchItem[] | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<EnrichedChartTimeData | null>(
    initialData
  );
  const [selectedStationCode, setSelectedStationCode] = useState<string>(
    initialData?.stations[0]?.stationCode || initialData?.originStation || ""
  );
  const [recentSearches, setRecentSearches] = useState<RecentChartSearch[]>(
    () => {
      if (typeof window === "undefined") return [];
      try {
        const saved = window.localStorage.getItem(RECENT_CHART_TRAINS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as RecentChartSearch[];
          if (Array.isArray(parsed)) {
            return parsed.slice(0, 5);
          }
        }
      } catch {
        // Ignore storage errors
      }
      return [];
    }
  );
  const [copiedSummary, setCopiedSummary] = useState(false);

  const searchBoxRef = useRef<HTMLDivElement>(null);

  const saveRecentTrain = useCallback((item: RecentChartSearch) => {
    setRecentSearches((prev) => {
      const next = [
        item,
        ...prev.filter((p) => p.trainNumber !== item.trainNumber),
      ].slice(0, 5);
      try {
        window.localStorage.setItem(
          RECENT_CHART_TRAINS_KEY,
          JSON.stringify(next)
        );
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  // Close autocomplete on outside click
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

  // Live train search autocomplete
  useEffect(() => {
    const trimmed = query.trim();
    if (!dropdownOpen || trimmed.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/trains/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const json = (await res.json()) as OwnedTrainSearchApiResponse;
          if (Array.isArray(json.data)) {
            setRemoteTrains(json.data.slice(0, 6));
          }
        }
      } catch {
        // Ignore aborted requests
      }
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, dropdownOpen]);

  const suggestions = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return POPULAR_LIVE_TRAINS.slice(0, 6);
    if (remoteTrains && remoteTrains.length > 0) return remoteTrains;
    const lower = trimmed.toLowerCase();
    return POPULAR_LIVE_TRAINS.filter(
      (t) =>
        t.trainNumber.includes(lower) ||
        t.trainName.toLowerCase().includes(lower) ||
        t.sourceCode.toLowerCase().includes(lower) ||
        t.destinationCode.toLowerCase().includes(lower)
    ).slice(0, 6);
  }, [query, remoteTrains]);

  const fetchChartSchedule = useCallback(
    async (
      trainNumInput: string,
      updateUrl = true,
      knownTrainName?: string
    ) => {
      const digits = trainNumInput.replace(/\D/g, "").slice(0, 5);
      if (digits.length < 3) {
        setError(
          "Please enter a valid 4 or 5-digit Indian Railways train number (e.g., 12952)."
        );
        return;
      }

      setLoading(true);
      setError(null);
      setDropdownOpen(false);

      if (updateUrl) {
        const targetPath = buildChartTimePath(digits, knownTrainName);
        if (initialTrainNumber === digits) {
          router.replace(targetPath, { scroll: false });
        } else {
          router.push(targetPath, { scroll: false });
        }
      }

      try {
        const res = await fetch(`/api/trains/${digits}/chart-time`);
        const json = (await res.json()) as OwnedChartTimeApiResponse;

        if (!res.ok || !json.success || !json.data) {
          setError(
            json.error?.message ||
              `Could not find published chart preparation times for train ${digits}.`
          );
          setLoading(false);
          return;
        }

        setChartData(json.data);
        setQuery(json.data.trainNumber);
        setSelectedStationCode(
          json.data.stations[0]?.stationCode || json.data.originStation
        );

        saveRecentTrain({
          trainNumber: json.data.trainNumber,
          trainName: json.data.trainName,
          route: `${json.data.originStation} → ${json.data.destinationStation}`,
        });
      } catch {
        setError(
          "Network error while fetching train chart preparation times. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [initialTrainNumber, router, saveRecentTrain]
  );

  // Initial & URL parameter load
  useEffect(() => {
    const paramTrain =
      initialTrainNumber || searchParams.get("train") || "12952";
    if (initialData && initialData.trainNumber === paramTrain) {
      return;
    }
    const timer = window.setTimeout(() => {
      setQuery(paramTrain);
      void fetchChartSchedule(paramTrain, false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialData, initialTrainNumber, searchParams, fetchChartSchedule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = query.replace(/\D/g, "").slice(0, 5);
    if (digits.length >= 3) {
      const matched = suggestions.find((s) => s.trainNumber === digits);
      void fetchChartSchedule(digits, true, matched?.trainName);
      return;
    }
    if (suggestions.length > 0) {
      void fetchChartSchedule(
        suggestions[0].trainNumber,
        true,
        suggestions[0].trainName
      );
      return;
    }
    setError("Please enter a valid 4 or 5-digit train number (e.g. 12952).");
  };

  const selectedStation = useMemo(() => {
    if (!chartData || chartData.stations.length === 0) return null;
    return (
      chartData.stations.find(
        (s) => s.stationCode === selectedStationCode
      ) || chartData.stations[0]
    );
  }, [chartData, selectedStationCode]);

  const handleCopySummary = async () => {
    if (!chartData) return;
    const text = `${chartData.trainName} (${chartData.trainNumber}) Chart Time Summary:\n${chartData.summary}\nCheck live at https://traveladda.in${buildChartTimePath(chartData.trainNumber, chartData.trainName, chartData.slug)}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      // Ignore clipboard errors
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Card */}
      <div className="rounded-2xl border border-line bg-card p-4 shadow-lg sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
              <ClockIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-ink sm:text-base">
                Search Train Chart Preparation Time &amp; Charting Station
              </h2>
              <p className="text-xs text-ink-muted">
                Enter any 5-digit train number to view station-wise 1st chart,
                2nd vacancy chart &amp; remote charting hubs
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Station-Wise PRS Chart Engine</span>
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-2">
          <div className="grid divide-y divide-line rounded-xl border border-line-strong bg-input sm:grid-cols-[1fr_auto] sm:divide-x sm:divide-y-0">
            <div ref={searchBoxRef} className="relative px-3.5 py-2.5">
              <label
                htmlFor="chart-train-input"
                className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted"
              >
                Train Number or Name
              </label>
              <div className="mt-1 flex items-center gap-2.5">
                <SearchIcon className="h-4 w-4 shrink-0 text-[#1956b4] dark:text-blue-400" />
                <input
                  id="chart-train-input"
                  type="text"
                  autoComplete="off"
                  value={query}
                  onFocus={() => setDropdownOpen(true)}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setRemoteTrains(null);
                    setDropdownOpen(true);
                    if (error) setError(null);
                  }}
                  placeholder="Enter train number (e.g. 12952, 12951, 12301...)"
                  className="w-full bg-transparent font-mono text-sm font-bold text-ink placeholder:font-sans placeholder:font-normal placeholder:text-ink-muted focus:outline-none sm:text-base"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setDropdownOpen(true);
                    }}
                    aria-label="Clear train input"
                    className="cursor-pointer text-ink-muted hover:text-ink"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Autocomplete Suggestions Dropdown */}
              {dropdownOpen && suggestions.length > 0 && (
                <div className="absolute top-full right-0 left-0 z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-line-strong bg-card p-1.5 shadow-2xl">
                  <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                    Select Train to Check Chart Time
                  </p>
                  {suggestions.map((t) => (
                    <button
                      key={t.trainNumber}
                      type="button"
                      onClick={() => {
                        setQuery(t.trainNumber);
                        setDropdownOpen(false);
                        void fetchChartSchedule(
                          t.trainNumber,
                          true,
                          t.trainName
                        );
                      }}
                      className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition hover:bg-subcard"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                          {t.trainNumber}
                        </span>
                        <span className="truncate text-xs font-bold text-ink sm:text-sm">
                          {t.trainName}
                        </span>
                      </div>
                      <span className="shrink-0 font-mono text-xs text-ink-muted">
                        {t.sourceCode} → {t.destinationCode}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-stretch p-1.5">
              <button
                type="submit"
                disabled={loading}
                className="ta-btn-primary inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-3 text-xs font-bold uppercase tracking-wide disabled:opacity-60 sm:w-auto sm:text-sm"
              >
                <ClockIcon className="h-4 w-4" />
                <span>{loading ? "Checking..." : "Check Chart Time"}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quick Popular Trains + Recent Searches */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="ta-no-scrollbar flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="shrink-0 font-semibold text-ink-muted">
              Popular Trains:
            </span>
            {POPULAR_CHART_TRAINS.map((item) => {
              const isCurrent = chartData?.trainNumber === item.trainNumber;
              return (
                <button
                  key={item.trainNumber}
                  type="button"
                  onClick={() => {
                    setQuery(item.trainNumber);
                    void fetchChartSchedule(
                      item.trainNumber,
                      true,
                      item.trainName
                    );
                  }}
                  className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 transition ${
                    isCurrent
                      ? "border-[#1956b4] bg-blue-50 font-bold text-[#1956b4] dark:bg-blue-500/20 dark:text-blue-300"
                      : "border-line bg-subcard text-ink-soft hover:border-[#1956b4]"
                  }`}
                >
                  <span className="font-mono font-bold">{item.trainNumber}</span>
                  <span className="hidden sm:inline">{item.trainName}</span>
                  <span className="text-[10px] text-ink-muted">
                    ({item.route})
                  </span>
                </button>
              );
            })}
          </div>

          {recentSearches.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setRecentSearches([]);
                try {
                  window.localStorage.removeItem(RECENT_CHART_TRAINS_KEY);
                } catch {
                  // Ignore
                }
              }}
              className="cursor-pointer text-[11px] font-semibold text-ink-muted hover:text-ink"
            >
              Clear recent
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-50/80 p-4 text-rose-900 dark:bg-rose-500/10 dark:text-rose-200">
          <AlertCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold">Unable to Load Chart Schedule</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !chartData && (
        <div className="space-y-4 rounded-2xl border border-line bg-card p-6">
          <div className="h-7 w-64 animate-pulse rounded-lg bg-subcard" />
          <div className="grid gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-20 animate-pulse rounded-xl bg-subcard"
              />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-xl bg-subcard" />
        </div>
      )}

      {/* Main Chart Time Dashboard */}
      {chartData && (
        <div className="space-y-6">
          {/* 1. Navy Cockpit Header Card */}
          <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-md">
            <div className="ta-live-cockpit p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-[#fc6203] px-2.5 py-1 font-mono text-xs font-black text-white sm:text-sm">
                    #{chartData.trainNumber}
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    {chartData.knownChartCount} of {chartData.totalStations}{" "}
                    Stations Charted
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-200">
                    {chartData.uniqueChartHubCount} Remote Charting{" "}
                    {chartData.uniqueChartHubCount === 1 ? "Zone" : "Zones"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    <CopyIcon className="h-3.5 w-3.5" />
                    <span>{copiedSummary ? "Copied!" : "Copy Summary"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      fetchChartSchedule(chartData.trainNumber, false)
                    }
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    <RefreshIcon
                      className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                    />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-3xl">
                    {chartData.trainName} ({chartData.trainNumber})
                  </h2>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-blue-100/90 sm:text-sm">
                    <span className="font-bold text-white">
                      {chartData.originStationName} ({chartData.originStation})
                    </span>
                    <span>→</span>
                    <span className="font-bold text-white">
                      {chartData.destinationStationName} (
                      {chartData.destinationStation})
                    </span>
                    <span>·</span>
                    <span>{chartData.totalDistanceKm.toLocaleString()} km</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={buildTrainLiveStatusPath(
                      chartData.trainNumber,
                      chartData.trainName
                    )}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/15 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-white/25"
                  >
                    <TrainIcon className="h-3.5 w-3.5 text-emerald-300" />
                    <span>Spot {chartData.trainNumber} Live</span>
                  </Link>
                  <Link
                    href="/rail/pnr-status"
                    className="ta-btn-primary inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold"
                  >
                    <TicketIcon className="h-3.5 w-3.5" />
                    <span>Check PNR Status</span>
                  </Link>
                </div>
              </div>

              {/* 4 Key Summary Metrics */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-white/15 bg-white/10 p-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                    Origin 1st Chart ({chartData.originStation})
                  </p>
                  <p className="mt-1 font-mono text-xl font-black text-amber-300 sm:text-2xl">
                    {chartData.originFirstChart12h}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-300">
                    Primary WL / RAC confirmation lock
                  </p>
                </div>

                <div className="rounded-xl border border-white/15 bg-white/10 p-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                    Origin 2nd (Vacancy) Chart
                  </p>
                  <p className="mt-1 font-mono text-xl font-black text-emerald-300 sm:text-2xl">
                    {chartData.originSecondChart12h}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-300">
                    Final current booking &amp; HHT sync
                  </p>
                </div>

                <div className="rounded-xl border border-white/15 bg-white/10 p-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                    Charting Stations (Hubs)
                  </p>
                  <p className="mt-1 font-mono text-xl font-black text-white sm:text-2xl">
                    {chartData.uniqueChartHubCount} Hubs
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-300">
                    {chartData.chartingZones
                      .map((z) => z.remoteStationCode)
                      .join(" · ")}
                  </p>
                </div>

                <div className="rounded-xl border border-white/15 bg-white/10 p-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                    Origin Departure
                  </p>
                  <p className="mt-1 font-mono text-xl font-black text-white sm:text-2xl">
                    {chartData.stations[0]?.departureFormatted || "—"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-300">
                    From {chartData.originStationName}
                  </p>
                </div>
              </div>
            </div>

            {/* Natural Language Chart Summary Strip */}
            {chartData.summary && (
              <div className="flex items-start gap-3 border-t border-line bg-blue-50/70 px-5 py-3.5 dark:bg-blue-500/10">
                <SparklesIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#1956b4] dark:text-blue-300" />
                <p className="text-xs leading-relaxed font-medium text-ink sm:text-sm">
                  {chartData.summary}
                </p>
              </div>
            )}
          </div>

          {/* 2. Interactive Boarding Station Charting Finder */}
          {selectedStation && (
            <section className="rounded-2xl border border-line bg-card p-5 shadow-xs sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#fc6203]">
                    Boarding Station Lookup
                  </span>
                  <h3 className="text-base font-extrabold text-ink sm:text-lg">
                    Select Your Boarding Station to Check Exact Chart Time
                  </h3>
                </div>
                <span className="text-xs text-ink-muted">
                  Tap any station along the {chartData.originStation} →{" "}
                  {chartData.destinationStation} route
                </span>
              </div>

              {/* Station Pill Selector */}
              <div className="ta-no-scrollbar mt-3.5 flex items-center gap-2 overflow-x-auto pb-1">
                {chartData.stations.map((st) => {
                  const active = st.stationCode === selectedStation.stationCode;
                  return (
                    <button
                      key={st.stationCode}
                      type="button"
                      onClick={() => setSelectedStationCode(st.stationCode)}
                      className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                        active
                          ? "border-[#1956b4] bg-[#1956b4] text-white shadow-sm"
                          : "border-line bg-subcard text-ink hover:border-[#1956b4]"
                      }`}
                    >
                      <span className="font-mono">{st.stationCode}</span>
                      <span
                        className={
                          active
                            ? "font-medium text-blue-100"
                            : "font-normal text-ink-muted"
                        }
                      >
                        {st.stationName}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Boarding Station Spotlight Card */}
              <div className="mt-4 rounded-2xl border border-blue-500/25 bg-subcard/70 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1956b4] font-mono text-sm font-black text-white">
                      {selectedStation.stationCode}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-extrabold text-ink sm:text-lg">
                          {selectedStation.stationName} (
                          {selectedStation.stationCode})
                        </h4>
                        <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                          Stop #{selectedStation.sequence} · Day{" "}
                          {selectedStation.day} · {selectedStation.distanceKm} km
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-ink-soft">
                        Arrival:{" "}
                        <strong className="font-mono text-ink">
                          {selectedStation.arrivalFormatted}
                        </strong>{" "}
                        · Departure:{" "}
                        <strong className="font-mono text-ink">
                          {selectedStation.departureFormatted}
                        </strong>
                      </p>
                    </div>
                  </div>

                  {/* Charting Station Badge */}
                  <div className="flex items-center gap-2 rounded-xl border border-line bg-card px-3.5 py-2">
                    <BuildingStationIcon className="h-4 w-4 text-[#fc6203]" />
                    <div className="text-xs">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                        Charting Station (Remote Hub)
                      </span>
                      <span className="font-bold text-ink">
                        {selectedStation.chartRemoteStationName} (
                        <span className="font-mono text-[#1956b4] dark:text-blue-300">
                          {selectedStation.chartRemoteStation}
                        </span>
                        )
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3.5 md:grid-cols-3">
                  {/* 1st Chart Card */}
                  <div className="rounded-xl border border-line bg-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                        1st Reservation Chart
                      </span>
                      <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                        {selectedStation.chartOneDayLabel}
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-2xl font-black text-[#1956b4] dark:text-blue-300">
                      {selectedStation.chartOneFormatted12h}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-ink-muted">
                      24-Hr Local: {selectedStation.chartTimeLocal} IST
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                      Primary chart when GNWL / RLWL / PQWL &amp; RAC berths are
                      allotted and SMS alerts are sent.
                    </p>
                  </div>

                  {/* 2nd Chart Card */}
                  <div className="rounded-xl border border-line bg-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                        2nd (Vacancy) Chart
                      </span>
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                        {selectedStation.chartTwoDayLabel}
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {selectedStation.chartTwoFormatted12h}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-ink-muted">
                      24-Hr Local: {selectedStation.chartTwoTimeLocal} IST
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                      Final chart before departure after last-minute current
                      reservations and cancellations.
                    </p>
                  </div>

                  {/* Remote Charting Station Intelligence Card */}
                  <div className="rounded-xl border border-line bg-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                        Charting Location Status
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          selectedStation.isPrimaryChartHub
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                        }`}
                      >
                        {selectedStation.isPrimaryChartHub
                          ? "Primary Chart Hub"
                          : `Mapped to ${selectedStation.chartRemoteStation}`}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-extrabold text-ink">
                      Prepared at {selectedStation.chartRemoteStationName} (
                      {selectedStation.chartRemoteStation})
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                      {selectedStation.isPrimaryChartHub
                        ? `${selectedStation.stationName} (${selectedStation.stationCode}) is an active PRS Charting Hub for this train.`
                        : `Boarding at ${selectedStation.stationName} (${selectedStation.stationCode}) is governed by the ${selectedStation.chartRemoteStationName} (${selectedStation.chartRemoteStation}) remote charting quota.`}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 3. Visual Charting Station Zones (Remote Charting Hubs) */}
          <section className="rounded-2xl border border-line bg-card p-5 shadow-xs sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1956b4] dark:text-blue-400">
                  Remote Location Charting Architecture
                </span>
                <h3 className="text-base font-extrabold text-ink sm:text-lg">
                  Charting Stations &amp; Covered Boarding Halts (
                  {chartData.uniqueChartHubCount} Zones)
                </h3>
                <p className="text-xs text-ink-soft">
                  See which remote charting station prepares the reservation
                  chart for each halt along the route
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {chartData.chartingZones.map((zone, idx) => (
                <div
                  key={zone.remoteStationCode}
                  className="flex flex-col justify-between rounded-xl border border-line bg-subcard/60 p-4 transition hover:border-[#1956b4]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#1956b4] px-2.5 py-1 font-mono text-xs font-extrabold text-white">
                        <BuildingStationIcon className="h-3.5 w-3.5" />
                        <span>{zone.remoteStationCode} HUB</span>
                      </span>
                      <span className="text-[11px] font-semibold text-ink-muted">
                        Zone #{idx + 1} · {zone.stationCount}{" "}
                        {zone.stationCount === 1 ? "Station" : "Stations"}
                      </span>
                    </div>

                    <h4 className="mt-2.5 text-sm font-extrabold text-ink">
                      {zone.remoteStationName} Charting Station
                    </h4>

                    <div className="mt-2.5 grid grid-cols-2 gap-2 rounded-lg border border-line bg-card p-2.5 text-xs">
                      <div>
                        <span className="block text-[10px] font-semibold text-ink-muted">
                          1st Chart
                        </span>
                        <span className="font-mono font-extrabold text-[#1956b4] dark:text-blue-300">
                          {zone.chartOneFormatted12h}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-semibold text-ink-muted">
                          2nd Chart
                        </span>
                        <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                          {zone.chartTwoFormatted12h}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-line pt-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                      Controls Boarding At:
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {zone.stationCodes.map((code, sIdx) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => setSelectedStationCode(code)}
                          className={`cursor-pointer rounded-md px-2 py-0.5 font-mono text-[11px] font-bold transition ${
                            selectedStation?.stationCode === code
                              ? "bg-[#fc6203] text-white"
                              : "border border-line bg-card text-ink hover:border-[#1956b4]"
                          }`}
                          title={zone.stationNames[sIdx]}
                        >
                          {code} ({zone.stationNames[sIdx]})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Complete Station-by-Station Charting Schedule Table */}
          <section className="overflow-hidden rounded-2xl border border-line bg-card shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-subcard/60 px-5 py-4">
              <div>
                <h3 className="text-base font-extrabold text-ink sm:text-lg">
                  Station-by-Station Chart Preparation Schedule (
                  {chartData.trainNumber})
                </h3>
                <p className="text-xs text-ink-soft">
                  Complete 1st Chart, 2nd Vacancy Chart, and Remote Charting
                  Station mapping for all {chartData.totalStations} stations
                </p>
              </div>
              <span className="rounded-lg border border-line bg-card px-3 py-1 font-mono text-xs font-bold text-ink-soft">
                {chartData.originStation} → {chartData.destinationStation}
              </span>
            </div>

            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-line bg-subcard text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                    <th className="py-3 pl-5 pr-3">#</th>
                    <th className="px-3 py-3">Boarding Station</th>
                    <th className="px-3 py-3">Arr / Dep</th>
                    <th className="px-3 py-3">Day &amp; Dist</th>
                    <th className="px-3 py-3">1st Chart Time</th>
                    <th className="px-3 py-3">2nd (Vacancy) Chart</th>
                    <th className="py-3 pl-3 pr-5">Charting Station</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {chartData.stations.map((st) => {
                    const isSelected =
                      selectedStation?.stationCode === st.stationCode;
                    return (
                      <tr
                        key={st.stationCode}
                        onClick={() => setSelectedStationCode(st.stationCode)}
                        className={`cursor-pointer transition ${
                          isSelected
                            ? "bg-blue-50/70 dark:bg-blue-500/10"
                            : "hover:bg-subcard/60"
                        }`}
                      >
                        <td className="py-3.5 pl-5 pr-3 font-mono text-xs font-bold text-ink-muted">
                          {st.sequence}
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="inline-flex h-8 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 font-mono text-xs font-extrabold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                              {st.stationCode}
                            </span>
                            <div>
                              <p className="font-bold text-ink">
                                {st.stationName}
                              </p>
                              <p className="text-[11px] text-ink-muted">
                                {st.isOrigin
                                  ? "Origin Terminal"
                                  : st.isDestination
                                    ? "Destination Terminal"
                                    : "Intermediate Halt"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 font-mono text-xs">
                          <div className="space-y-0.5">
                            <p className="text-ink-soft">
                              Arr:{" "}
                              <strong className="text-ink">
                                {st.arrivalTime || "Origin"}
                              </strong>
                            </p>
                            <p className="text-ink-soft">
                              Dep:{" "}
                              <strong className="text-ink">
                                {st.departureTime || "End"}
                              </strong>
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-xs">
                          <span className="inline-block rounded bg-subcard px-2 py-0.5 font-bold text-ink">
                            Day {st.day}
                          </span>
                          <p className="mt-1 font-mono text-[11px] text-ink-muted">
                            {st.distanceKm} km
                          </p>
                        </td>
                        <td className="px-3 py-3.5">
                          <p className="font-mono text-sm font-extrabold text-[#1956b4] dark:text-blue-300">
                            {st.chartOneFormatted12h}
                          </p>
                          <p className="text-[11px] text-ink-muted">
                            {st.chartTimeLocal} · {st.chartOneDayLabel}
                          </p>
                        </td>
                        <td className="px-3 py-3.5">
                          <p className="font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                            {st.chartTwoFormatted12h}
                          </p>
                          <p className="text-[11px] text-ink-muted">
                            {st.chartTwoTimeLocal} · {st.chartTwoDayLabel}
                          </p>
                        </td>
                        <td className="py-3.5 pl-3 pr-5">
                          <div className="inline-flex items-center gap-2 rounded-xl border border-line bg-subcard px-3 py-1.5">
                            <MapPinIcon
                              className={`h-4 w-4 ${
                                st.isPrimaryChartHub
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-[#fc6203]"
                              }`}
                            />
                            <div>
                              <p className="font-mono text-xs font-extrabold text-ink">
                                {st.chartRemoteStation}
                              </p>
                              <p className="text-[10px] text-ink-muted">
                                {st.isPrimaryChartHub
                                  ? "Self Charted"
                                  : `Via ${st.chartRemoteStationName}`}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="divide-y divide-line md:hidden">
              {chartData.stations.map((st) => (
                <div key={st.stationCode} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex h-9 w-12 items-center justify-center rounded-lg bg-blue-50 font-mono text-xs font-extrabold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                        {st.stationCode}
                      </span>
                      <div>
                        <p className="text-sm font-extrabold text-ink">
                          {st.sequence}. {st.stationName}
                        </p>
                        <p className="text-[11px] text-ink-muted">
                          Day {st.day} · {st.distanceKm} km · Dep:{" "}
                          {st.departureTime || "Destination"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold ${
                        st.isPrimaryChartHub
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                          : "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
                      }`}
                    >
                      Hub: {st.chartRemoteStation}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-line bg-subcard/70 p-3 text-xs">
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-ink-muted">
                        1st Chart Time
                      </span>
                      <span className="font-mono text-sm font-black text-[#1956b4] dark:text-blue-300">
                        {st.chartOneFormatted12h}
                      </span>
                      <span className="block text-[10px] text-ink-muted">
                        {st.chartOneDayLabel}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-ink-muted">
                        2nd Vacancy Chart
                      </span>
                      <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {st.chartTwoFormatted12h}
                      </span>
                      <span className="block text-[10px] text-ink-muted">
                        {st.chartTwoDayLabel}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Cross-Tool Action Banner */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/rail/pnr-status"
              className="group flex items-center justify-between rounded-2xl border border-line bg-card p-5 shadow-2xs transition hover:border-[#1956b4]"
            >
              <div className="flex items-center gap-3.5">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#fc6203] dark:bg-orange-500/15 dark:text-orange-300">
                  <TicketIcon className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-sm font-extrabold text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-300 sm:text-base">
                    Has Your Chart Prepared? Check 10-Digit PNR
                  </h4>
                  <p className="text-xs text-ink-muted">
                    Verify final coach, berth number &amp; RAC/WL confirmation
                  </p>
                </div>
              </div>
              <ArrowRightIcon className="h-4 w-4 shrink-0 text-ink-muted group-hover:text-[#1956b4]" />
            </Link>

            <Link
              href={`/rail/live-status?train=${chartData.trainNumber}`}
              className="group flex items-center justify-between rounded-2xl border border-line bg-card p-5 shadow-2xs transition hover:border-[#1956b4]"
            >
              <div className="flex items-center gap-3.5">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <TrainIcon className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-sm font-extrabold text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-300 sm:text-base">
                    Spot {chartData.trainNumber} Live Train Status
                  </h4>
                  <p className="text-xs text-ink-muted">
                    Check live GPS location, delay minutes &amp; coach position
                  </p>
                </div>
              </div>
              <ArrowRightIcon className="h-4 w-4 shrink-0 text-ink-muted group-hover:text-[#1956b4]" />
            </Link>
          </div>
        </div>
      )}

      {/* Educational Footer Cards: How 1st Chart, 2nd Chart & Remote Charting Work */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="flex items-center gap-2 text-sm font-extrabold text-ink">
            <CheckCircleIcon className="h-4 w-4 text-[#1956b4] dark:text-blue-400" />
            <span>What Is the 1st Reservation Chart?</span>
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
            Prepared at least 4 to 8 hours before departure (or the previous
            evening between 8:00 PM and 9:00 PM for morning trains departing
            before 12:00 PM). Most GNWL, RLWL, and RAC upgrades happen here.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="flex items-center gap-2 text-sm font-extrabold text-ink">
            <ShieldCheckIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>What Is the 2nd (Vacancy) Chart?</span>
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
            Prepared 15 to 30 minutes before train departure at the charting
            station. It locks Current Booking (CURR_AVBL) seats, last-minute
            cancellations, and syncs the final passenger manifest to the
            TTE&apos;s Hand-Held Terminal (HHT).
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="flex items-center gap-2 text-sm font-extrabold text-ink">
            <BuildingStationIcon className="h-4 w-4 text-[#fc6203]" />
            <span>Why Does Charting Station Matter?</span>
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
            Smaller or late-night halts (such as Borivali BVI on 12952) do not
            prepare their own separate chart; their quota is merged into an
            upstream Remote Charting Hub (such as Surat ST). Your ticket status
            freezes when that remote hub prepares its chart!
          </p>
        </div>
      </div>
    </div>
  );
}
