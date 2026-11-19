"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  EnrichedChartStation,
  EnrichedChartTimeData,
  OwnedChartTimeApiResponse,
} from "@/lib/chart-time-types";
import {
  buildClientChartTimePath as buildChartTimePath,
  buildClientTrainLiveStatusPath as buildTrainLiveStatusPath,
  CLIENT_POPULAR_CHART_TRAINS as POPULAR_CHART_TRAINS,
  CLIENT_POPULAR_TRAINS as POPULAR_LIVE_TRAINS,
} from "@/lib/live-train-client";
import type {
  OwnedTrainSearchApiResponse,
  TrainSearchItem,
} from "@/lib/live-train-types";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  BuildingStationIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  CloseIcon,
  CopyIcon,
  MapPinIcon,
  RefreshIcon,
  SearchIcon,
  ShieldCheckIcon,
  TicketIcon,
  TrainIcon,
} from "./Icons";
import { WhatsAppIcon } from "./MetroCommuterToolkit";

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

function buildChartWhatsAppShareUrl(
  chartData: EnrichedChartTimeData,
  station: EnrichedChartStation
): string {
  const pageUrl = `https://traveladda.in${buildChartTimePath(
    chartData.trainNumber,
    chartData.trainName,
    chartData.slug
  )}`;

  const message = [
    `🕒 *Train Chart Preparation Time: #${chartData.trainNumber} ${chartData.trainName}*`,
    `📍 *Boarding Station:* ${station.stationName} (${station.stationCode}) · Dep ${station.departureFormatted}`,
    "",
    `• *1st Reservation Chart:* ${station.chartOneFormatted12h} (${station.chartOneDayLabel})`,
    `• *2nd Vacancy Chart:* ${station.chartTwoFormatted12h} (${station.chartTwoDayLabel})`,
    `• *Charting Hub:* ${station.chartRemoteStationName} (${station.chartRemoteStation})`,
    "",
    `Check station-wise chart times & PNR status (Ad-Free):`,
    pageUrl,
  ].join("\n");

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
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
  const [boardingDropdownOpen, setBoardingDropdownOpen] = useState(false);
  const [boardingFilter, setBoardingFilter] = useState("");
  const [tableFilter, setTableFilter] = useState("");
  const [mobileSearchExpanded, setMobileSearchExpanded] = useState<boolean>(
    () => !initialData
  );
  const [remoteTrains, setRemoteTrains] = useState<TrainSearchItem[] | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<EnrichedChartTimeData | null>(
    initialData
  );

  // Default to the 1st boarding station (Origin — stations[0])
  const [selectedStationCode, setSelectedStationCode] = useState<string>(
    initialData?.stations[0]?.stationCode || initialData?.originStation || ""
  );

  const [recentSearches, setRecentSearches] = useState<RecentChartSearch[]>([]);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const searchBoxRef = useRef<HTMLDivElement>(null);
  const boardingBoxRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  // Hydrate recent searches safely on client
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(RECENT_CHART_TRAINS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as RecentChartSearch[];
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 5));
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Sync SSR initialData when navigating across train chart pages & select 1st boarding station by default
  useEffect(() => {
    if (initialData) {
      setChartData(initialData);
      setQuery(initialData.trainNumber);
      setSelectedStationCode(
        initialData.stations[0]?.stationCode || initialData.originStation || ""
      );
      setBoardingFilter("");
      setTableFilter("");
      setMobileSearchExpanded(false);
    }
  }, [initialData]);

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

  // Close dropdowns on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (searchBoxRef.current && !searchBoxRef.current.contains(target)) {
        setDropdownOpen(false);
      }
      if (boardingBoxRef.current && !boardingBoxRef.current.contains(target)) {
        setBoardingDropdownOpen(false);
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
      setBoardingDropdownOpen(false);

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
        // Always default to the 1st boarding station (Origin)
        setSelectedStationCode(
          json.data.stations[0]?.stationCode || json.data.originStation
        );
        setBoardingFilter("");
        setTableFilter("");
        setMobileSearchExpanded(false);

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

  // Initial & URL parameter load when landing on /rail/chart-time
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

  // Eligible boarding stations (excludes only if single station; marks final stop clearly while keeping #1 selected by default)
  const boardingStations = useMemo(() => {
    if (!chartData) return [];
    if (chartData.stations.length <= 1) return chartData.stations;
    // Passengers board from Station #1 up to the penultimate halt (though we still allow viewing all stations if searched)
    return chartData.stations;
  }, [chartData]);

  const filteredBoardingDropdownStations = useMemo(() => {
    const q = boardingFilter.trim().toLowerCase();
    if (!q) return boardingStations;
    return boardingStations.filter(
      (st) =>
        st.stationCode.toLowerCase().includes(q) ||
        st.stationName.toLowerCase().includes(q)
    );
  }, [boardingStations, boardingFilter]);

  const filteredTableStations = useMemo(() => {
    if (!chartData) return [];
    const q = tableFilter.trim().toLowerCase();
    if (!q) return chartData.stations;
    return chartData.stations.filter(
      (st) =>
        st.stationCode.toLowerCase().includes(q) ||
        st.stationName.toLowerCase().includes(q) ||
        st.chartRemoteStation.toLowerCase().includes(q)
    );
  }, [chartData, tableFilter]);

  // Selected boarding station — defaults strictly to stations[0] (1st boarding station)
  const selectedStation = useMemo(() => {
    if (!chartData || chartData.stations.length === 0) return null;
    return (
      chartData.stations.find((s) => s.stationCode === selectedStationCode) ||
      chartData.stations[0]
    );
  }, [chartData, selectedStationCode]);

  const handleChooseBoardingStation = (
    code: string,
    scrollToCard = false
  ) => {
    setSelectedStationCode(code);
    setBoardingDropdownOpen(false);
    setBoardingFilter("");
    if (scrollToCard && spotlightRef.current) {
      spotlightRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  };

  const handleCopySummary = async () => {
    if (!chartData || !selectedStation) return;
    const text = [
      `${chartData.trainName} (${chartData.trainNumber}) — Boarding at ${selectedStation.stationName} (${selectedStation.stationCode})`,
      `1st Chart: ${selectedStation.chartOneFormatted12h} (${selectedStation.chartOneDayLabel})`,
      `2nd Vacancy Chart: ${selectedStation.chartTwoFormatted12h} (${selectedStation.chartTwoDayLabel})`,
      `Charting Station: ${selectedStation.chartRemoteStationName} (${selectedStation.chartRemoteStation})`,
      `Check at https://traveladda.in${buildChartTimePath(
        chartData.trainNumber,
        chartData.trainName,
        chartData.slug
      )}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      // Ignore clipboard errors
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* MOBILE COMPACT BAR (When train is already loaded, keeps screen clean & shows Edit button) */}
      {chartData && !mobileSearchExpanded && (
        <div className="rounded-2xl border border-line bg-card p-3.5 shadow-md md:hidden">
          <div className="flex items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={() => setMobileSearchExpanded(true)}
              className="min-w-0 flex-1 text-left"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                <ClockIcon className="h-3.5 w-3.5 shrink-0 text-[#fc6203]" />
                <span>Train #{chartData.trainNumber} Chart Timings</span>
              </div>
              <p className="mt-0.5 truncate text-sm font-extrabold text-ink">
                {chartData.trainName}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-ink-muted">
                {chartData.originStation} → {chartData.destinationStation} ·{" "}
                {chartData.totalStations} Stops
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMobileSearchExpanded(true)}
              className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1 rounded-xl border border-[#1956b4]/30 bg-blue-50/90 px-3 text-xs font-extrabold text-[#1956b4] transition hover:bg-[#1956b4] hover:text-white dark:border-blue-400/30 dark:bg-blue-500/15 dark:text-blue-300"
            >
              <span>Change Train</span>
              <ChevronDownIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* UNIFIED TRAIN + BOARDING STATION SEARCH CARD */}
      <div
        className={`rounded-2xl border border-line bg-card p-4 shadow-lg sm:p-5 ${
          chartData && !mobileSearchExpanded ? "hidden md:block" : "block"
        }`}
      >
        {chartData && mobileSearchExpanded && (
          <div className="mb-3 flex items-center justify-between border-b border-line pb-2.5 md:hidden">
            <span className="text-xs font-extrabold uppercase tracking-wider text-ink-muted">
              Search Train &amp; Boarding Station
            </span>
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                setBoardingDropdownOpen(false);
                setMobileSearchExpanded(false);
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-line bg-subcard px-2.5 py-1 text-[11px] font-bold text-ink-soft hover:text-ink"
            >
              <CloseIcon className="h-3.5 w-3.5" />
              <span>Close</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid divide-y divide-line rounded-xl border border-line-strong bg-input lg:grid-cols-[1.2fr_1.1fr_auto] lg:divide-x lg:divide-y-0">
            {/* Field 1: Train Number or Name */}
            <div ref={searchBoxRef} className="relative px-3.5 py-2.5">
              <label
                htmlFor="chart-train-input"
                className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted"
              >
                1. Train Number or Name
              </label>
              <div className="mt-1 flex items-center gap-2.5">
                <TrainIcon className="h-4 w-4 shrink-0 text-[#1956b4] dark:text-blue-400" />
                <input
                  id="chart-train-input"
                  type="text"
                  autoComplete="off"
                  value={query}
                  onFocus={() => {
                    setDropdownOpen(true);
                    setBoardingDropdownOpen(false);
                  }}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setRemoteTrains(null);
                    setDropdownOpen(true);
                    if (error) setError(null);
                  }}
                  placeholder="Enter 12952, 12622 or Rajdhani..."
                  className="w-full bg-transparent text-sm font-bold text-ink placeholder:font-normal placeholder:text-ink-muted focus:outline-none sm:text-base"
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

              {/* Train Autocomplete Suggestions */}
              {dropdownOpen && suggestions.length > 0 && (
                <div className="absolute top-full right-0 left-0 z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-line-strong bg-card p-1.5 shadow-2xl">
                  <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                    Select Train
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
                          #{t.trainNumber}
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

            {/* Field 2: Boarding Station Selector (Defaults to 1st Boarding Station!) */}
            <div className="px-3.5 py-2.5">
              <label
                htmlFor="chart-boarding-select-top"
                className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted"
              >
                2. Boarding Station
              </label>
              <div className="mt-1 flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 shrink-0 text-[#fc6203]" />
                {chartData && chartData.stations.length > 0 ? (
                  <select
                    id="chart-boarding-select-top"
                    value={selectedStation?.stationCode || ""}
                    onChange={(e) =>
                      handleChooseBoardingStation(e.target.value, false)
                    }
                    className="w-full cursor-pointer bg-transparent text-sm font-bold text-ink focus:outline-none sm:text-base"
                  >
                    {chartData.stations.map((st, idx) => (
                      <option key={st.stationCode} value={st.stationCode}>
                        {idx + 1}. {st.stationName} ({st.stationCode})
                        {idx === 0
                          ? " — Origin (Default)"
                          : st.isDestination
                            ? " — Destination"
                            : ` — Dep ${st.departureFormatted}`}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm text-ink-muted">
                    Auto-loads 1st boarding station...
                  </span>
                )}
              </div>
            </div>

            {/* Search CTA */}
            <div className="flex items-stretch p-1.5">
              <button
                type="submit"
                disabled={loading}
                className="ta-btn-primary inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-6 text-xs font-extrabold uppercase tracking-wide disabled:opacity-60 lg:h-auto lg:w-auto sm:text-sm"
              >
                <ClockIcon className="h-4 w-4" />
                <span>{loading ? "Loading..." : "Check Chart Time"}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Popular Trains Quick Strip */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="ta-no-scrollbar flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="shrink-0 font-semibold text-ink-muted">
              Popular:
            </span>
            {POPULAR_CHART_TRAINS.slice(0, 6).map((item) => {
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
                  <span className="font-mono font-bold">
                    #{item.trainNumber}
                  </span>
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
          <div className="grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-28 animate-pulse rounded-xl bg-subcard"
              />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-xl bg-subcard" />
        </div>
      )}

      {/* MAIN CLEAR & ATTRACTIVE BOARDING STATION CHART DASHBOARD */}
      {chartData && selectedStation && (
        <div ref={spotlightRef} className="space-y-5 sm:space-y-6">
          {/* 1. PRIMARY BOARDING STATION CHART SPOTLIGHT CARD */}
          <section className="overflow-hidden rounded-2xl border border-line bg-card shadow-md">
            {/* Sleek Navy Train Header + Action Buttons */}
            <div className="ta-live-cockpit px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-[#fc6203] px-2.5 py-0.5 font-mono text-xs font-black text-white">
                      TRAIN #{chartData.trainNumber}
                    </span>
                    <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-100">
                      {chartData.originStation} → {chartData.destinationStation}{" "}
                      · {chartData.totalStations} Stops
                    </span>
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                      {chartData.uniqueChartHubCount} Charting{" "}
                      {chartData.uniqueChartHubCount === 1 ? "Hub" : "Hubs"}
                    </span>
                  </div>

                  <h2 className="mt-2 text-lg font-extrabold tracking-tight text-white sm:text-2xl">
                    {chartData.trainName} ({chartData.trainNumber})
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={buildChartWhatsAppShareUrl(chartData, selectedStation)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#1fa855] px-3.5 py-2 text-xs font-extrabold text-white shadow-2xs transition hover:bg-[#198c46]"
                  >
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <Link
                    href={buildTrainLiveStatusPath(
                      chartData.trainNumber,
                      chartData.trainName
                    )}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/12 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20"
                  >
                    <TrainIcon className="h-3.5 w-3.5 text-emerald-300" />
                    <span>Live Status</span>
                  </Link>

                  <Link
                    href="/rail/pnr-status"
                    className="ta-btn-primary inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold"
                  >
                    <TicketIcon className="h-3.5 w-3.5" />
                    <span>Check PNR</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* PROMINENT BOARDING STATION SELECTOR BAR (Always Visible on Mobile & Desktop!) */}
            <div className="border-b border-line bg-blue-50/60 px-4 py-3.5 sm:px-6 dark:bg-blue-950/25">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1956b4] text-white shadow-2xs">
                    <MapPinIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                      Your Boarding Station{" "}
                      {selectedStation.sequence === 1 ? "(Origin Default)" : ""}
                    </p>
                    <p className="text-xs text-ink-soft">
                      Change station below to see its exact 1st &amp; 2nd chart
                      preparation time
                    </p>
                  </div>
                </div>

                {/* Searchable Custom Boarding Station Picker */}
                <div ref={boardingBoxRef} className="relative w-full md:w-80">
                  <button
                    type="button"
                    onClick={() =>
                      setBoardingDropdownOpen((prev) => !prev)
                    }
                    className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-[#1956b4]/40 bg-card px-3.5 py-2.5 text-left shadow-2xs transition hover:border-[#1956b4]"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="rounded-md bg-[#1956b4] px-2 py-0.5 font-mono text-xs font-extrabold text-white">
                        {selectedStation.stationCode}
                      </span>
                      <span className="truncate text-sm font-extrabold text-ink">
                        {selectedStation.sequence}.{" "}
                        {selectedStation.stationName}
                      </span>
                    </div>
                    <ChevronDownIcon
                      className={`h-4 w-4 shrink-0 text-ink-muted transition-transform ${
                        boardingDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {boardingDropdownOpen && (
                    <div className="absolute top-full right-0 left-0 z-40 mt-1.5 overflow-hidden rounded-2xl border border-line-strong bg-card shadow-2xl">
                      <div className="border-b border-line p-2">
                        <div className="relative">
                          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
                          <input
                            type="text"
                            value={boardingFilter}
                            onChange={(e) => setBoardingFilter(e.target.value)}
                            placeholder="Filter boarding station..."
                            className="w-full rounded-lg border border-line bg-input py-1.5 pr-2.5 pl-8 text-xs font-semibold text-ink placeholder:font-normal focus:border-[#1956b4] focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto p-1.5">
                        {filteredBoardingDropdownStations.length === 0 ? (
                          <p className="px-3 py-4 text-center text-xs text-ink-muted">
                            No station matching &ldquo;{boardingFilter}&rdquo;
                          </p>
                        ) : (
                          filteredBoardingDropdownStations.map((st) => {
                            const isSel =
                              st.stationCode === selectedStation.stationCode;
                            return (
                              <button
                                key={st.stationCode}
                                type="button"
                                onClick={() =>
                                  handleChooseBoardingStation(
                                    st.stationCode,
                                    false
                                  )
                                }
                                className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs transition ${
                                  isSel
                                    ? "bg-blue-50 font-extrabold text-[#1956b4] dark:bg-blue-500/20 dark:text-blue-300"
                                    : "font-semibold text-ink hover:bg-subcard"
                                }`}
                              >
                                <div className="flex min-w-0 items-center gap-2">
                                  <span className="w-5 shrink-0 font-mono text-[10px] text-ink-muted">
                                    #{st.sequence}
                                  </span>
                                  <span className="rounded bg-subcard px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#1956b4] dark:text-blue-300">
                                    {st.stationCode}
                                  </span>
                                  <span className="truncate">
                                    {st.stationName}
                                  </span>
                                </div>
                                <span className="shrink-0 font-mono text-[10px] text-ink-muted">
                                  {st.isOrigin
                                    ? "Origin"
                                    : st.isDestination
                                      ? "End"
                                      : `Dep ${st.departureTime}`}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 1-Tap Horizontal Boarding Station Pills */}
              <div className="ta-no-scrollbar mt-3 flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {chartData.stations.map((st) => {
                  const active =
                    st.stationCode === selectedStation.stationCode;
                  return (
                    <button
                      key={st.stationCode}
                      type="button"
                      onClick={() =>
                        handleChooseBoardingStation(st.stationCode, false)
                      }
                      className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
                        active
                          ? "border-[#1956b4] bg-[#1956b4] text-white shadow-2xs"
                          : "border-line bg-card text-ink-soft hover:border-[#1956b4] hover:text-[#1956b4]"
                      }`}
                    >
                      <span className="font-mono">{st.stationCode}</span>
                      <span
                        className={`max-w-[110px] truncate text-[11px] ${
                          active ? "text-blue-100" : "text-ink-muted"
                        }`}
                      >
                        {st.stationName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CLEAR, ATTRACTIVE 1ST & 2ND CHART CARDS FOR SELECTED BOARDING STATION */}
            <div className="p-4 sm:p-6">
              {/* Selected Station Context Header */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-black text-ink sm:text-xl">
                    Chart Time for Boarding at {selectedStation.stationName} (
                    {selectedStation.stationCode})
                  </h3>
                  <span className="rounded-full bg-subcard px-2.5 py-0.5 font-mono text-[11px] font-bold text-ink-soft ring-1 ring-line">
                    Stop #{selectedStation.sequence} · Day {selectedStation.day}{" "}
                    · {selectedStation.distanceKm} km
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleCopySummary()}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-subcard px-2.5 py-1 text-xs font-bold text-ink-soft transition hover:border-[#1956b4] hover:text-[#1956b4]"
                  >
                    <CopyIcon className="h-3.5 w-3.5" />
                    <span>{copiedSummary ? "Copied!" : "Copy Timings"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void fetchChartSchedule(chartData.trainNumber, false)
                    }
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-line bg-subcard px-2.5 py-1 text-xs font-bold text-ink-soft transition hover:border-[#1956b4] hover:text-[#1956b4]"
                  >
                    <RefreshIcon
                      className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                    />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* 3 Big Visual Metric Cards: 1st Chart | 2nd Chart | Charting Hub & Departure */}
              <div className="grid gap-3.5 md:grid-cols-3">
                {/* CARD 1: 1ST RESERVATION CHART */}
                <div className="relative overflow-hidden rounded-2xl border border-[#1956b4]/30 bg-gradient-to-br from-blue-50/80 via-card to-card p-4 shadow-2xs sm:p-5 dark:from-blue-950/30">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                      <ClockIcon className="h-4 w-4" />
                      <span>1st Reservation Chart</span>
                    </span>
                    <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800 dark:text-amber-300">
                      {selectedStation.chartOneDayLabel}
                    </span>
                  </div>

                  <p className="mt-2.5 font-mono text-3xl font-black tracking-tight text-[#1956b4] sm:text-4xl dark:text-blue-300">
                    {selectedStation.chartOneFormatted12h}
                  </p>
                  <p className="mt-0.5 font-mono text-xs font-semibold text-ink-muted">
                    24-Hour IST: {selectedStation.chartTimeLocal} hrs
                  </p>

                  <p className="mt-3 border-t border-line/80 pt-2.5 text-xs leading-relaxed text-ink-soft">
                    Main chart when <strong>WL &amp; RAC berths confirm</strong>
                    , coach/seat numbers are allotted, and IRCTC SMS is sent.
                  </p>
                </div>

                {/* CARD 2: 2ND (VACANCY / FINAL) CHART */}
                <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50/80 via-card to-card p-4 shadow-2xs sm:p-5 dark:from-emerald-950/30">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>2nd (Vacancy) Chart</span>
                    </span>
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">
                      {selectedStation.chartTwoDayLabel}
                    </span>
                  </div>

                  <p className="mt-2.5 font-mono text-3xl font-black tracking-tight text-emerald-700 sm:text-4xl dark:text-emerald-400">
                    {selectedStation.chartTwoFormatted12h}
                  </p>
                  <p className="mt-0.5 font-mono text-xs font-semibold text-ink-muted">
                    24-Hour IST: {selectedStation.chartTwoTimeLocal} hrs
                  </p>

                  <p className="mt-3 border-t border-line/80 pt-2.5 text-xs leading-relaxed text-ink-soft">
                    Final chart (~30 mins before departure) locking{" "}
                    <strong>Current Booking</strong> seats &amp; TTE Hand-Held
                    Terminal.
                  </p>
                </div>

                {/* CARD 3: BOARDING DEPARTURE + REMOTE CHARTING HUB */}
                <div className="flex flex-col justify-between rounded-2xl border border-line bg-subcard/45 p-4 sm:p-5">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-ink-soft">
                        <BuildingStationIcon className="h-4 w-4 text-[#fc6203]" />
                        <span>Charting Hub &amp; Train Time</span>
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          selectedStation.isPrimaryChartHub
                            ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                            : "bg-orange-500/15 text-[#fc6203]"
                        }`}
                      >
                        {selectedStation.isPrimaryChartHub
                          ? "Self Charted"
                          : `Remote Hub: ${selectedStation.chartRemoteStation}`}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-line bg-card p-2.5 text-xs">
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-ink-muted">
                          Arrival
                        </span>
                        <span className="font-mono text-sm font-extrabold text-ink">
                          {selectedStation.arrivalFormatted}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-ink-muted">
                          Departure
                        </span>
                        <span className="font-mono text-sm font-extrabold text-[#1956b4] dark:text-blue-300">
                          {selectedStation.departureFormatted}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-ink-soft">
                    {selectedStation.isPrimaryChartHub ? (
                      <>
                        Prepared directly at{" "}
                        <strong className="text-ink">
                          {selectedStation.chartRemoteStationName} (
                          {selectedStation.chartRemoteStation})
                        </strong>{" "}
                        PRS charting hub.
                      </>
                    ) : (
                      <>
                        Your chart for{" "}
                        <strong className="text-ink">
                          {selectedStation.stationCode}
                        </strong>{" "}
                        is prepared upstream at{" "}
                        <strong className="text-ink">
                          {selectedStation.chartRemoteStationName} (
                          {selectedStation.chartRemoteStation})
                        </strong>
                        !
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Clean Visual 3-Step Timeline Bar for Selected Station */}
              <div className="mt-4 rounded-xl border border-line bg-subcard/45 px-4 py-3">
                <div className="flex flex-col justify-between gap-2 text-xs sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1956b4] text-[10px] font-black text-white">
                      1
                    </span>
                    <span>
                      1st Chart:{" "}
                      <strong className="font-mono text-ink">
                        {selectedStation.chartOneFormatted12h}
                      </strong>{" "}
                      <span className="text-ink-muted">
                        (CURR_AVBL opens)
                      </span>
                    </span>
                  </div>

                  <span className="hidden text-ink-muted sm:inline">➔</span>

                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">
                      2
                    </span>
                    <span>
                      2nd Chart:{" "}
                      <strong className="font-mono text-ink">
                        {selectedStation.chartTwoFormatted12h}
                      </strong>{" "}
                      <span className="text-ink-muted">(Final lock)</span>
                    </span>
                  </div>

                  <span className="hidden text-ink-muted sm:inline">➔</span>

                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#fc6203] text-[10px] font-black text-white">
                      3
                    </span>
                    <span>
                      {selectedStation.stationCode} Departure:{" "}
                      <strong className="font-mono text-ink">
                        {selectedStation.departureFormatted}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. REMOTE CHARTING HUB ZONES (Tap Any Station Chip to Inspect) */}
          <section className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-400">
                  Remote Charting Zones ({chartData.uniqueChartHubCount} Hubs)
                </span>
                <h3 className="text-base font-extrabold text-ink sm:text-lg">
                  Which Station Prepares Your Boarding Quota&apos;s Chart?
                </h3>
                <p className="text-xs text-ink-soft">
                  Tap any station badge below to view its 1st &amp; 2nd chart
                  preparation timing above
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {chartData.chartingZones.map((zone, idx) => (
                <div
                  key={zone.remoteStationCode}
                  className="flex flex-col justify-between rounded-xl border border-line bg-subcard/45 p-3.5 transition hover:border-[#1956b4]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#1956b4] px-2.5 py-1 font-mono text-xs font-extrabold text-white">
                        <BuildingStationIcon className="h-3.5 w-3.5" />
                        <span>{zone.remoteStationCode} HUB</span>
                      </span>
                      <span className="text-[11px] font-semibold text-ink-muted">
                        Zone {idx + 1} · {zone.stationCount}{" "}
                        {zone.stationCount === 1 ? "Stop" : "Stops"}
                      </span>
                    </div>

                    <h4 className="mt-2 text-sm font-extrabold text-ink">
                      {zone.remoteStationName}
                    </h4>

                    <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-line bg-card p-2 text-xs">
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
                    <div className="flex flex-wrap gap-1.5">
                      {zone.stationCodes.map((code, sIdx) => {
                        const isSel = selectedStation.stationCode === code;
                        return (
                          <button
                            key={code}
                            type="button"
                            onClick={() =>
                              handleChooseBoardingStation(code, true)
                            }
                            className={`cursor-pointer rounded-lg px-2 py-0.5 font-mono text-[11px] font-bold transition ${
                              isSel
                                ? "bg-[#fc6203] text-white shadow-2xs"
                                : "border border-line bg-card text-ink hover:border-[#1956b4]"
                            }`}
                            title={zone.stationNames[sIdx]}
                          >
                            {code} · {zone.stationNames[sIdx]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. COMPLETE STATION-BY-STATION CHARTING SCHEDULE TABLE */}
          <section className="overflow-hidden rounded-2xl border border-line bg-card shadow-xs">
            <div className="flex flex-col justify-between gap-3 border-b border-line bg-card px-4 py-4 sm:flex-row sm:items-center sm:px-6">
              <div>
                <h3 className="text-base font-extrabold text-ink sm:text-lg">
                  All {chartData.totalStations} Stations — 1st &amp; 2nd Chart
                  Schedule ({chartData.trainNumber})
                </h3>
                <p className="text-xs text-ink-soft">
                  Tap any boarding station row to pin it in the chart spotlight
                  above
                </p>
              </div>

              <div className="relative w-full sm:w-56">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
                <input
                  type="text"
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value)}
                  placeholder="Filter station..."
                  className="w-full rounded-xl border border-line bg-input py-1.5 pr-2.5 pl-8 text-xs font-semibold text-ink placeholder:font-normal focus:border-[#1956b4] focus:outline-none"
                />
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-line bg-subcard/60 text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                    <th className="py-3 pr-3 pl-5">#</th>
                    <th className="px-3 py-3">Boarding Station</th>
                    <th className="px-3 py-3">Arr / Dep</th>
                    <th className="px-3 py-3">Day &amp; Dist</th>
                    <th className="px-3 py-3">1st Chart Time</th>
                    <th className="px-3 py-3">2nd (Vacancy) Chart</th>
                    <th className="py-3 pr-5 pl-3">Charting Hub</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/80">
                  {filteredTableStations.map((st) => {
                    const isSelected =
                      selectedStation.stationCode === st.stationCode;
                    return (
                      <tr
                        key={st.stationCode}
                        onClick={() =>
                          handleChooseBoardingStation(st.stationCode, true)
                        }
                        className={`cursor-pointer transition ${
                          isSelected
                            ? "bg-blue-50/80 dark:bg-blue-500/15"
                            : "even:bg-subcard/20 hover:bg-subcard/55"
                        }`}
                      >
                        <td className="py-3 pr-3 pl-5 font-mono text-xs font-semibold text-ink-muted">
                          {String(st.sequence).padStart(2, "0")}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                                isSelected
                                  ? "bg-[#fc6203] ring-3 ring-orange-500/20"
                                  : st.isOrigin
                                    ? "bg-emerald-500"
                                    : "border-2 border-[#1956b4] bg-card dark:border-blue-400"
                              }`}
                            />
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-bold text-ink">
                                  {st.stationName}
                                </span>
                                <span className="rounded-md bg-blue-50 px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                                  {st.stationCode}
                                </span>
                                {isSelected && (
                                  <span className="rounded-full bg-[#fc6203]/15 px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#fc6203]">
                                    Selected
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-ink-muted">
                                {st.isOrigin
                                  ? "1st Boarding Station (Origin)"
                                  : st.isDestination
                                    ? "Destination Terminal"
                                    : "Intermediate Boarding Halt"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 font-mono text-xs">
                          <div className="space-y-0.5">
                            <p className="text-ink-soft">
                              Arr:{" "}
                              <strong className="text-ink">
                                {st.arrivalTime || "Starts"}
                              </strong>
                            </p>
                            <p className="text-ink-soft">
                              Dep:{" "}
                              <strong className="text-ink">
                                {st.departureTime || "Ends"}
                              </strong>
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs">
                          <span className="inline-block rounded-md bg-subcard px-2 py-0.5 font-mono font-bold text-ink">
                            Day {st.day}
                          </span>
                          <p className="mt-1 font-mono text-[11px] text-ink-muted">
                            {st.distanceKm} km
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-mono text-sm font-extrabold text-[#1956b4] dark:text-blue-300">
                            {st.chartOneFormatted12h}
                          </p>
                          <p className="text-[11px] text-ink-muted">
                            {st.chartTimeLocal} · {st.chartOneDayLabel}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                            {st.chartTwoFormatted12h}
                          </p>
                          <p className="text-[11px] text-ink-muted">
                            {st.chartTwoTimeLocal} · {st.chartTwoDayLabel}
                          </p>
                        </td>
                        <td className="py-3 pr-5 pl-3">
                          <div className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card px-2.5 py-1.5">
                            <MapPinIcon
                              className={`h-3.5 w-3.5 ${
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

            {/* Mobile Station List (Tap Any Card to Select Boarding Station) */}
            <div className="divide-y divide-line md:hidden">
              {filteredTableStations.map((st) => {
                const isSelected =
                  selectedStation.stationCode === st.stationCode;
                return (
                  <button
                    key={st.stationCode}
                    type="button"
                    onClick={() =>
                      handleChooseBoardingStation(st.stationCode, true)
                    }
                    className={`block w-full space-y-2.5 p-4 text-left transition ${
                      isSelected ? "bg-blue-50/70 dark:bg-blue-500/12" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-8 min-w-[44px] items-center justify-center rounded-lg bg-blue-50 px-1.5 font-mono text-xs font-extrabold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                          {st.stationCode}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="text-sm font-extrabold text-ink">
                              {st.sequence}. {st.stationName}
                            </p>
                            {isSelected && (
                              <span className="rounded-full bg-[#fc6203] px-2 py-0.5 text-[9px] font-extrabold uppercase text-white">
                                Selected
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-ink-muted">
                            Day {st.day} · {st.distanceKm} km · Dep:{" "}
                            {st.departureTime || "Ends"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-lg px-2 py-0.5 font-mono text-[10px] font-bold ${
                          st.isPrimaryChartHub
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
                        }`}
                      >
                        Hub: {st.chartRemoteStation}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-line bg-card p-2.5 text-xs">
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-ink-muted">
                          1st Chart
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
                  </button>
                );
              })}
            </div>
          </section>

          {/* Quick Cross-Tool Action Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/rail/pnr-status"
              className="group flex items-center justify-between rounded-2xl border border-line bg-card p-4 shadow-2xs transition hover:border-[#1956b4] sm:p-5"
            >
              <div className="flex items-center gap-3.5">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#fc6203] dark:bg-orange-500/15 dark:text-orange-300">
                  <TicketIcon className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-sm font-extrabold text-ink group-hover:text-[#1956b4] sm:text-base dark:group-hover:text-blue-300">
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
              href={buildTrainLiveStatusPath(
                chartData.trainNumber,
                chartData.trainName
              )}
              className="group flex items-center justify-between rounded-2xl border border-line bg-card p-4 shadow-2xs transition hover:border-[#1956b4] sm:p-5"
            >
              <div className="flex items-center gap-3.5">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <TrainIcon className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-sm font-extrabold text-ink group-hover:text-[#1956b4] sm:text-base dark:group-hover:text-blue-300">
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

      {/* Educational Footer Cards */}
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
