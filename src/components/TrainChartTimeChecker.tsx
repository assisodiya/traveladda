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
  type ChartUiLang,
  formatChartDayLabelHi,
  getStationHindiName,
  matchesBilingualStation,
  normalizeBilingualRailQuery,
  normalizeRailHindiDigits,
} from "@/lib/rail-bilingual";
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
const CHART_LANG_STORAGE_KEY = "traveladda_chart_lang_v1";

interface RecentChartSearch {
  trainNumber: string;
  trainName: string;
  route: string;
}

export interface TrainChartTimeCheckerProps {
  initialTrainNumber?: string;
  initialData?: EnrichedChartTimeData | null;
}

function formatBilingualStationName(
  stationName: string,
  stationCode: string,
  lang: ChartUiLang
): string {
  const hi = getStationHindiName(stationCode);
  if (!hi) return stationName;
  if (lang === "en") return stationName;
  if (lang === "hi") return `${hi} (${stationName})`;
  return `${stationName} · ${hi}`;
}

function buildChartWhatsAppShareUrl(
  chartData: EnrichedChartTimeData,
  station: EnrichedChartStation,
  lang: ChartUiLang
): string {
  const pageUrl = `https://traveladda.in${buildChartTimePath(
    chartData.trainNumber,
    chartData.trainName,
    chartData.slug
  )}`;
  const hiStation = getStationHindiName(station.stationCode);
  const hiRemote = getStationHindiName(station.chartRemoteStation);
  const dayOneHi = formatChartDayLabelHi(station.chartOneDayLabel);
  const dayTwoHi = formatChartDayLabelHi(station.chartTwoDayLabel);

  const lines =
    lang === "hi"
      ? [
          `🕒 *ट्रेन चार्ट बनने का समय: #${chartData.trainNumber} ${chartData.trainName}*`,
          `📍 *बोर्डिंग स्टेशन:* ${hiStation ? `${hiStation} / ${station.stationName}` : station.stationName} (${station.stationCode}) · प्रस्थान ${station.departureFormatted}`,
          "",
          `• *पहला रिज़र्वेशन चार्ट (1st Chart):* ${station.chartOneFormatted12h} (${dayOneHi})`,
          `• *दूसरा वैकेंसी चार्ट (2nd Chart):* ${station.chartTwoFormatted12h} (${dayTwoHi})`,
          `• *चार्टिंग स्टेशन (Hub):* ${hiRemote ? `${hiRemote} (${station.chartRemoteStation})` : `${station.chartRemoteStationName} (${station.chartRemoteStation})`}`,
          "",
          `हर स्टेशन का 1st व 2nd चार्ट टाइम और PNR स्टेटस देखें (Ad-Free):`,
          pageUrl,
        ]
      : lang === "both"
        ? [
            `🕒 *Train Chart Time / चार्ट समय: #${chartData.trainNumber} ${chartData.trainName}*`,
            `📍 *Boarding / बोर्डिंग:* ${station.stationName}${hiStation ? ` (${hiStation})` : ""} [${station.stationCode}] · Dep ${station.departureFormatted}`,
            "",
            `• *1st Chart (पहला चार्ट):* ${station.chartOneFormatted12h} (${station.chartOneDayLabel})`,
            `• *2nd Vacancy Chart (दूसरा चार्ट):* ${station.chartTwoFormatted12h} (${station.chartTwoDayLabel})`,
            `• *Charting Hub (चार्टिंग स्टेशन):* ${station.chartRemoteStationName} (${station.chartRemoteStation})`,
            "",
            `Check station-wise chart time & PNR status (English / हिंदी):`,
            pageUrl,
          ]
        : [
            `🕒 *Train Chart Preparation Time: #${chartData.trainNumber} ${chartData.trainName}*`,
            `📍 *Boarding Station:* ${station.stationName} (${station.stationCode}) · Dep ${station.departureFormatted}`,
            "",
            `• *1st Reservation Chart:* ${station.chartOneFormatted12h} (${station.chartOneDayLabel})`,
            `• *2nd Vacancy Chart:* ${station.chartTwoFormatted12h} (${station.chartTwoDayLabel})`,
            `• *Charting Hub:* ${station.chartRemoteStationName} (${station.chartRemoteStation})`,
            "",
            `Check station-wise chart times & PNR status (Ad-Free):`,
            pageUrl,
          ];

  return `https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`;
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

  const [lang, setLang] = useState<ChartUiLang>("both");
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

  // Default strictly to the 1st boarding station (Origin — stations[0])
  const [selectedStationCode, setSelectedStationCode] = useState<string>(
    initialData?.stations[0]?.stationCode || initialData?.originStation || ""
  );

  const [recentSearches, setRecentSearches] = useState<RecentChartSearch[]>([]);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const searchBoxRef = useRef<HTMLDivElement>(null);
  const boardingBoxRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  // Bilingual text helper: returns English, Hindi, or clean combined string
  const t = useCallback(
    (en: string, hi: string, bothSep = " · ") => {
      if (lang === "en") return en;
      if (lang === "hi") return hi;
      return `${en}${bothSep}${hi}`;
    },
    [lang]
  );

  // Hydrate recent searches & saved language preference safely on client
  useEffect(() => {
    try {
      const savedLang = window.localStorage.getItem(CHART_LANG_STORAGE_KEY);
      if (savedLang === "both" || savedLang === "en" || savedLang === "hi") {
        setLang(savedLang);
      }
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

  const handleSetLang = (nextLang: ChartUiLang) => {
    setLang(nextLang);
    try {
      window.localStorage.setItem(CHART_LANG_STORAGE_KEY, nextLang);
    } catch {
      // Ignore storage errors
    }
  };

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

  // Live train search autocomplete (supports English, Hindi Devanagari, Hindi digits & Hinglish)
  useEffect(() => {
    const trimmed = query.trim();
    if (!dropdownOpen || trimmed.length < 2) return;
    const { primaryQuery } = normalizeBilingualRailQuery(trimmed);
    if (primaryQuery.length < 2) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/trains/search?q=${encodeURIComponent(primaryQuery)}`,
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
    const { tokens } = normalizeBilingualRailQuery(trimmed);
    const searchTokens = tokens.length > 0 ? tokens : [trimmed.toLowerCase()];
    return POPULAR_LIVE_TRAINS.filter((tr) => {
      const srcHi = getStationHindiName(tr.sourceCode) || "";
      const dstHi = getStationHindiName(tr.destinationCode) || "";
      const hay = `${tr.trainNumber} ${tr.trainName} ${tr.sourceCode} ${tr.sourceName} ${srcHi} ${tr.destinationCode} ${tr.destinationName} ${dstHi}`.toLowerCase();
      return searchTokens.some((tok) => tok.length >= 2 && hay.includes(tok));
    }).slice(0, 6);
  }, [query, remoteTrains]);

  const fetchChartSchedule = useCallback(
    async (
      trainNumInput: string,
      updateUrl = true,
      knownTrainName?: string
    ) => {
      const normalizedDigits = normalizeRailHindiDigits(trainNumInput)
        .replace(/\D/g, "")
        .slice(0, 5);
      if (normalizedDigits.length < 3) {
        setError(
          lang === "hi"
            ? "कृपया सही 4 या 5 अंकों का ट्रेन नंबर दर्ज करें (जैसे 12952)।"
            : lang === "both"
              ? "Please enter a valid 4 or 5-digit train number (e.g., 12952) · कृपया सही ट्रेन नंबर दर्ज करें।"
              : "Please enter a valid 4 or 5-digit Indian Railways train number (e.g., 12952)."
        );
        return;
      }

      setLoading(true);
      setError(null);
      setDropdownOpen(false);
      setBoardingDropdownOpen(false);

      if (updateUrl) {
        const targetPath = buildChartTimePath(normalizedDigits, knownTrainName);
        if (initialTrainNumber === normalizedDigits) {
          router.replace(targetPath, { scroll: false });
        } else {
          router.push(targetPath, { scroll: false });
        }
      }

      try {
        const res = await fetch(`/api/trains/${normalizedDigits}/chart-time`);
        const json = (await res.json()) as OwnedChartTimeApiResponse;

        if (!res.ok || !json.success || !json.data) {
          setError(
            json.error?.message ||
              `Could not find published chart preparation times for train ${normalizedDigits}.`
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
          lang === "hi"
            ? "चार्ट समय लोड करने में नेटवर्क त्रुटि हुई। कृपया पुनः प्रयास करें।"
            : "Network error while fetching train chart preparation times. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [initialTrainNumber, lang, router, saveRecentTrain]
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = normalizeRailHindiDigits(query)
      .replace(/\D/g, "")
      .slice(0, 5);
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

    // If user typed a Hindi/English train name and pressed Enter immediately before debounce completed
    const { primaryQuery } = normalizeBilingualRailQuery(query);
    if (primaryQuery.length >= 2) {
      try {
        const res = await fetch(
          `/api/trains/search?q=${encodeURIComponent(primaryQuery)}`
        );
        if (res.ok) {
          const json = (await res.json()) as OwnedTrainSearchApiResponse;
          if (Array.isArray(json.data) && json.data.length > 0) {
            void fetchChartSchedule(
              json.data[0].trainNumber,
              true,
              json.data[0].trainName
            );
            return;
          }
        }
      } catch {
        // Fall through to error message
      }
    }

    setError(
      t(
        "Please enter a valid 4 or 5-digit train number or name (e.g. 12952 / राजधानी)",
        "कृपया सही ट्रेन नंबर या नाम लिखें (जैसे 12952 / राजधानी)"
      )
    );
  };

  const boardingStations = useMemo(() => {
    if (!chartData) return [];
    return chartData.stations;
  }, [chartData]);

  // Supports filtering boarding stations in BOTH English & Hindi (e.g., "Surat", "ST", "सूरत")
  const filteredBoardingDropdownStations = useMemo(() => {
    if (!boardingFilter.trim()) return boardingStations;
    return boardingStations.filter((st) =>
      matchesBilingualStation(st, boardingFilter)
    );
  }, [boardingStations, boardingFilter]);

  const filteredTableStations = useMemo(() => {
    if (!chartData) return [];
    if (!tableFilter.trim()) return chartData.stations;
    return chartData.stations.filter((st) =>
      matchesBilingualStation(st, tableFilter)
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

  const selectedStationHindi = selectedStation
    ? getStationHindiName(selectedStation.stationCode)
    : null;
  const selectedRemoteHindi = selectedStation
    ? getStationHindiName(selectedStation.chartRemoteStation)
    : null;

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
    const text =
      lang === "hi"
        ? [
            `${chartData.trainName} (${chartData.trainNumber}) — बोर्डिंग: ${selectedStationHindi ? `${selectedStationHindi} (${selectedStation.stationName})` : selectedStation.stationName} [${selectedStation.stationCode}]`,
            `पहला चार्ट (1st Chart): ${selectedStation.chartOneFormatted12h} (${formatChartDayLabelHi(selectedStation.chartOneDayLabel)})`,
            `दूसरा वैकेंसी चार्ट (2nd Chart): ${selectedStation.chartTwoFormatted12h} (${formatChartDayLabelHi(selectedStation.chartTwoDayLabel)})`,
            `चार्टिंग स्टेशन (Hub): ${selectedStation.chartRemoteStationName} (${selectedStation.chartRemoteStation})`,
            `देखें: https://traveladda.in${buildChartTimePath(
              chartData.trainNumber,
              chartData.trainName,
              chartData.slug
            )}`,
          ].join("\n")
        : [
            `${chartData.trainName} (${chartData.trainNumber}) — Boarding at ${selectedStation.stationName} (${selectedStation.stationCode})`,
            `1st Chart (पहला चार्ट): ${selectedStation.chartOneFormatted12h} (${selectedStation.chartOneDayLabel})`,
            `2nd Vacancy Chart (दूसरा चार्ट): ${selectedStation.chartTwoFormatted12h} (${selectedStation.chartTwoDayLabel})`,
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

  // Segmented Language Switcher UI (reused cleanly on mobile & desktop)
  const renderLanguageSwitcher = () => (
    <div
      role="group"
      aria-label="Select chart language (English or Hindi)"
      className="inline-flex items-center rounded-xl border border-line bg-subcard p-0.5 text-[11px] font-extrabold"
    >
      {(
        [
          { id: "both", label: "EN + हिंदी" },
          { id: "en", label: "English" },
          { id: "hi", label: "हिंदी" },
        ] as const
      ).map((opt) => {
        const active = lang === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => handleSetLang(opt.id)}
            className={`cursor-pointer rounded-lg px-2.5 py-1 transition ${
              active
                ? "bg-[#1956b4] text-white shadow-2xs"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* MOBILE COMPACT BAR (When train is already loaded, keeps screen clean & shows Language + Change Train) */}
      {chartData && !mobileSearchExpanded && (
        <div className="space-y-2.5 rounded-2xl border border-line bg-card p-3.5 shadow-md md:hidden">
          <div className="flex items-center justify-between gap-2 border-b border-line pb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted">
              Language / भाषा
            </span>
            {renderLanguageSwitcher()}
          </div>

          <div className="flex items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={() => setMobileSearchExpanded(true)}
              className="min-w-0 flex-1 text-left"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                <ClockIcon className="h-3.5 w-3.5 shrink-0 text-[#fc6203]" />
                <span>
                  {t(
                    `Train #${chartData.trainNumber} Chart Time`,
                    `ट्रेन #${chartData.trainNumber} चार्ट समय`
                  )}
                </span>
              </div>
              <p className="mt-0.5 truncate text-sm font-extrabold text-ink">
                {chartData.trainName}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-ink-muted">
                {chartData.originStation} → {chartData.destinationStation} ·{" "}
                {chartData.totalStations}{" "}
                {lang === "hi" ? "स्टेशन" : "Stops"}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMobileSearchExpanded(true)}
              className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1 rounded-xl border border-[#1956b4]/30 bg-blue-50/90 px-3 text-xs font-extrabold text-[#1956b4] transition hover:bg-[#1956b4] hover:text-white dark:border-blue-400/30 dark:bg-blue-500/15 dark:text-blue-300"
            >
              <span>{lang === "hi" ? "ट्रेन बदलें" : "Change Train"}</span>
              <ChevronDownIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* UNIFIED BILINGUAL TRAIN + BOARDING STATION SEARCH CARD */}
      <div
        className={`rounded-2xl border border-line bg-card p-4 shadow-lg sm:p-5 ${
          chartData && !mobileSearchExpanded ? "hidden md:block" : "block"
        }`}
      >
        {/* Top Bar: Bilingual Search Hint + Language Switcher */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-ink-soft">
              {lang === "hi"
                ? "हिंदी या English में ट्रेन नंबर, नाम या स्टेशन खोजें (जैसे 12952, राजधानी, सूरत)"
                : lang === "en"
                  ? "Search train or boarding station in English or Hindi (e.g. 12952, Rajdhani, Surat)"
                  : "Search in English or हिंदी — ट्रेन नंबर, नाम या बोर्डिंग स्टेशन खोजें"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {renderLanguageSwitcher()}
            {chartData && mobileSearchExpanded && (
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  setBoardingDropdownOpen(false);
                  setMobileSearchExpanded(false);
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-line bg-subcard px-2.5 py-1 text-[11px] font-bold text-ink-soft hover:text-ink md:hidden"
              >
                <CloseIcon className="h-3.5 w-3.5" />
                <span>{lang === "hi" ? "बंद करें" : "Close"}</span>
              </button>
            )}
          </div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className="grid divide-y divide-line rounded-xl border border-line-strong bg-input lg:grid-cols-[1.25fr_1.15fr_auto] lg:divide-x lg:divide-y-0">
            {/* Field 1: Train Number or Name (English + Hindi) */}
            <div ref={searchBoxRef} className="relative px-3.5 py-2.5">
              <label
                htmlFor="chart-train-input"
                className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted"
              >
                {t(
                  "1. Train No. or Name",
                  "1. ट्रेन नंबर या नाम",
                  " / "
                )}
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
                  placeholder={
                    lang === "hi"
                      ? "12952, राजधानी, वंदे भारत या नई दिल्ली लिखें..."
                      : lang === "en"
                        ? "Enter 12952, Rajdhani, Vande Bharat..."
                        : "12952, Rajdhani or राजधानी, वंदे भारत..."
                  }
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
                    {t("Select Train", "ट्रेन चुनें", " / ")}
                  </p>
                  {suggestions.map((tr) => {
                    const srcHi = getStationHindiName(tr.sourceCode);
                    const dstHi = getStationHindiName(tr.destinationCode);
                    return (
                      <button
                        key={tr.trainNumber}
                        type="button"
                        onClick={() => {
                          setQuery(tr.trainNumber);
                          setDropdownOpen(false);
                          void fetchChartSchedule(
                            tr.trainNumber,
                            true,
                            tr.trainName
                          );
                        }}
                        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition hover:bg-subcard"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                            #{tr.trainNumber}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-ink sm:text-sm">
                              {tr.trainName}
                            </p>
                            {lang !== "en" && (srcHi || dstHi) && (
                              <p className="truncate text-[10px] text-ink-muted">
                                {srcHi || tr.sourceCode} →{" "}
                                {dstHi || tr.destinationCode}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="shrink-0 font-mono text-xs text-ink-muted">
                          {tr.sourceCode} → {tr.destinationCode}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Field 2: Boarding Station Selector (Defaults to 1st Boarding Station!) */}
            <div className="px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="chart-boarding-select-top"
                  className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted"
                >
                  {t(
                    "2. Boarding Station",
                    "2. बोर्डिंग स्टेशन",
                    " / "
                  )}
                </label>
                {chartData &&
                  selectedStation &&
                  selectedStation.sequence !== 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        handleChooseBoardingStation(
                          chartData.stations[0].stationCode,
                          false
                        )
                      }
                      className="cursor-pointer text-[10px] font-bold text-[#1956b4] hover:underline dark:text-blue-300"
                    >
                      {lang === "hi"
                        ? "पहला स्टेशन चुनें"
                        : "Reset to 1st Station"}
                    </button>
                  )}
              </div>
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
                    {chartData.stations.map((st, idx) => {
                      const stLabel = formatBilingualStationName(
                        st.stationName,
                        st.stationCode,
                        lang
                      );
                      return (
                        <option key={st.stationCode} value={st.stationCode}>
                          {idx + 1}. {stLabel} ({st.stationCode})
                          {idx === 0
                            ? lang === "hi"
                              ? " — पहला स्टेशन (डिफ़ॉल्ट)"
                              : " — 1st Station (Origin)"
                            : st.isDestination
                              ? lang === "hi"
                                ? " — अंतिम स्टेशन"
                                : " — Destination"
                              : ` — Dep ${st.departureFormatted}`}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <span className="text-sm text-ink-muted">
                    {t(
                      "Auto-selects 1st boarding station...",
                      "पहला बोर्डिंग स्टेशन अपने-आप चुनेगा..."
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Search CTA */}
            <div className="flex items-stretch p-1.5">
              <button
                type="submit"
                disabled={loading}
                className="ta-btn-primary inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-5 text-xs font-extrabold uppercase tracking-wide disabled:opacity-60 lg:h-auto lg:w-auto sm:text-sm"
              >
                <ClockIcon className="h-4 w-4" />
                <span>
                  {loading
                    ? lang === "hi"
                      ? "खोज रहे हैं..."
                      : "Loading..."
                    : lang === "hi"
                      ? "चार्ट समय देखें"
                      : lang === "both"
                        ? "Check Chart / चार्ट देखें"
                        : "Check Chart Time"}
                </span>
              </button>
            </div>
          </div>
        </form>

        {/* Popular Trains Quick Strip */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="ta-no-scrollbar flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="shrink-0 font-semibold text-ink-muted">
              {lang === "hi" ? "प्रमुख ट्रेनें:" : "Popular:"}
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
              {lang === "hi" ? "हाल की खोज हटाएं" : "Clear recent"}
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-50/80 p-4 text-rose-900 dark:bg-rose-500/10 dark:text-rose-200">
          <AlertCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold">
              {t(
                "Unable to Load Chart Schedule",
                "चार्ट समय लोड नहीं हो सका"
              )}
            </p>
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
                      · {chartData.totalStations}{" "}
                      {lang === "hi" ? "स्टेशन" : "Stops"}
                    </span>
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                      {chartData.uniqueChartHubCount}{" "}
                      {lang === "hi"
                        ? "चार्टिंग हब"
                        : `Charting ${chartData.uniqueChartHubCount === 1 ? "Hub" : "Hubs"}`}
                    </span>
                  </div>

                  <h2 className="mt-2 text-lg font-extrabold tracking-tight text-white sm:text-2xl">
                    {chartData.trainName} ({chartData.trainNumber})
                  </h2>
                  {lang !== "en" && (
                    <p className="mt-0.5 text-xs font-medium text-blue-100/90">
                      बोर्डिंग स्टेशन के अनुसार पहला और दूसरा रिज़र्वेशन चार्ट बनने का सटीक समय
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={buildChartWhatsAppShareUrl(
                      chartData,
                      selectedStation,
                      lang
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#1fa855] px-3.5 py-2 text-xs font-extrabold text-white shadow-2xs transition hover:bg-[#198c46]"
                  >
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                    <span>{lang === "hi" ? "शेयर करें" : "WhatsApp"}</span>
                  </a>

                  <Link
                    href={buildTrainLiveStatusPath(
                      chartData.trainNumber,
                      chartData.trainName
                    )}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/12 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20"
                  >
                    <TrainIcon className="h-3.5 w-3.5 text-emerald-300" />
                    <span>{lang === "hi" ? "लाइव स्टेटस" : "Live Status"}</span>
                  </Link>

                  <Link
                    href="/rail/pnr-status"
                    className="ta-btn-primary inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold"
                  >
                    <TicketIcon className="h-3.5 w-3.5" />
                    <span>{lang === "hi" ? "PNR चेक करें" : "Check PNR"}</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* PROMINENT BOARDING STATION SELECTOR BAR (Supports English & Hindi Station Search!) */}
            <div className="border-b border-line bg-blue-50/60 px-4 py-3.5 sm:px-6 dark:bg-blue-950/25">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1956b4] text-white shadow-2xs">
                    <MapPinIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                      {t(
                        `Your Boarding Station ${selectedStation.sequence === 1 ? "(1st Station Default)" : ""}`,
                        `आपका बोर्डिंग स्टेशन ${selectedStation.sequence === 1 ? "(पहला स्टेशन डिफ़ॉल्ट)" : ""}`
                      )}
                    </p>
                    <p className="text-xs text-ink-soft">
                      {lang === "hi"
                        ? "किसी भी बोर्डिंग स्टेशन का पहला और दूसरा चार्ट समय देखने के लिए स्टेशन चुनें"
                        : lang === "en"
                          ? "Select your boarding station to check its exact 1st & 2nd chart preparation time"
                          : "Select boarding station (English / हिंदी) to see exact 1st & 2nd chart time"}
                    </p>
                  </div>
                </div>

                {/* Searchable Custom Boarding Station Picker */}
                <div ref={boardingBoxRef} className="relative w-full md:w-88">
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
                        {formatBilingualStationName(
                          selectedStation.stationName,
                          selectedStation.stationCode,
                          lang
                        )}
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
                            placeholder={
                              lang === "hi"
                                ? "स्टेशन खोजें (जैसे सूरत, कोटा, ST)..."
                                : "Search station (English / हिंदी e.g. Surat, सूरत)..."
                            }
                            className="w-full rounded-lg border border-line bg-input py-1.5 pr-2.5 pl-8 text-xs font-semibold text-ink placeholder:font-normal focus:border-[#1956b4] focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto p-1.5">
                        {filteredBoardingDropdownStations.length === 0 ? (
                          <p className="px-3 py-4 text-center text-xs text-ink-muted">
                            {t(
                              `No station matching "${boardingFilter}"`,
                              `"${boardingFilter}" से मिलता कोई स्टेशन नहीं मिला`
                            )}
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
                                    {formatBilingualStationName(
                                      st.stationName,
                                      st.stationCode,
                                      lang
                                    )}
                                  </span>
                                </div>
                                <span className="shrink-0 font-mono text-[10px] text-ink-muted">
                                  {st.isOrigin
                                    ? lang === "hi"
                                      ? "प्रारंभ"
                                      : "Origin"
                                    : st.isDestination
                                      ? lang === "hi"
                                        ? "अंतिम"
                                        : "End"
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
                {chartData.stations.map((st, idx) => {
                  const active =
                    st.stationCode === selectedStation.stationCode;
                  const hiName = getStationHindiName(st.stationCode);
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
                        className={`max-w-[125px] truncate text-[11px] ${
                          active ? "text-blue-100" : "text-ink-muted"
                        }`}
                      >
                        {lang === "hi" && hiName ? hiName : st.stationName}
                      </span>
                      {idx === 0 && (
                        <span
                          className={`rounded px-1 py-0.2 text-[9px] font-extrabold uppercase ${
                            active
                              ? "bg-white/20 text-white"
                              : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          }`}
                        >
                          {lang === "hi" ? "पहला" : "1st"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CLEAR, ATTRACTIVE 1ST & 2ND CHART CARDS FOR SELECTED BOARDING STATION */}
            <div className="p-4 sm:p-6">
              {/* Selected Station Context Header */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black text-ink sm:text-xl">
                      {lang === "hi"
                        ? `${selectedStationHindi || selectedStation.stationName} (${selectedStation.stationCode}) से बोर्डिंग का चार्ट समय`
                        : `Chart Time for Boarding at ${selectedStation.stationName} (${selectedStation.stationCode})`}
                    </h3>
                    <span className="rounded-full bg-subcard px-2.5 py-0.5 font-mono text-[11px] font-bold text-ink-soft ring-1 ring-line">
                      {lang === "hi"
                        ? `स्टॉप #${selectedStation.sequence} · दिन ${selectedStation.day} · ${selectedStation.distanceKm} किमी`
                        : `Stop #${selectedStation.sequence} · Day ${selectedStation.day} · ${selectedStation.distanceKm} km`}
                    </span>
                  </div>
                  {lang === "both" && (
                    <p className="mt-0.5 text-xs font-semibold text-ink-muted">
                      {selectedStationHindi
                        ? `${selectedStationHindi} (${selectedStation.stationCode})`
                        : selectedStation.stationName}{" "}
                      बोर्डिंग स्टेशन के लिए पहला और दूसरा रिज़र्वेशन चार्ट समय
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleCopySummary()}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-subcard px-2.5 py-1 text-xs font-bold text-ink-soft transition hover:border-[#1956b4] hover:text-[#1956b4]"
                  >
                    <CopyIcon className="h-3.5 w-3.5" />
                    <span>
                      {copiedSummary
                        ? lang === "hi"
                          ? "कॉपी हो गया!"
                          : "Copied!"
                        : lang === "hi"
                          ? "कॉपी करें"
                          : "Copy Timings"}
                    </span>
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
                    <span>{lang === "hi" ? "रीफ़्रेश" : "Refresh"}</span>
                  </button>
                </div>
              </div>

              {/* 3 Big Visual Metric Cards: 1st Chart | 2nd Chart | Charting Hub & Departure */}
              <div className="grid gap-3.5 md:grid-cols-3">
                {/* CARD 1: 1ST RESERVATION CHART */}
                <div className="relative overflow-hidden rounded-2xl border border-[#1956b4]/30 bg-gradient-to-br from-blue-50/80 via-card to-card p-4 shadow-2xs sm:p-5 dark:from-blue-950/30">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                        <ClockIcon className="h-4 w-4 shrink-0" />
                        <span>
                          {lang === "hi"
                            ? "पहला रिज़र्वेशन चार्ट"
                            : "1st Reservation Chart"}
                        </span>
                      </span>
                      {lang === "both" && (
                        <span className="block pl-5 text-[11px] font-bold text-[#1956b4]/80 dark:text-blue-300/80">
                          पहला चार्ट (Primary Chart)
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800 dark:text-amber-300">
                      {lang === "hi"
                        ? formatChartDayLabelHi(selectedStation.chartOneDayLabel)
                        : selectedStation.chartOneDayLabel}
                    </span>
                  </div>

                  <p className="mt-2.5 font-mono text-3xl font-black tracking-tight text-[#1956b4] sm:text-4xl dark:text-blue-300">
                    {selectedStation.chartOneFormatted12h}
                  </p>
                  <p className="mt-0.5 font-mono text-xs font-semibold text-ink-muted">
                    24-Hour IST: {selectedStation.chartTimeLocal} hrs
                    {lang === "both"
                      ? ` · ${formatChartDayLabelHi(selectedStation.chartOneDayLabel)}`
                      : ""}
                  </p>

                  <div className="mt-3 border-t border-line/80 pt-2.5 text-xs leading-relaxed text-ink-soft">
                    {lang !== "hi" && (
                      <p>
                        Main chart when{" "}
                        <strong className="text-ink">
                          WL &amp; RAC berths confirm
                        </strong>
                        , coach/seat numbers are allotted, and IRCTC SMS is sent.
                      </p>
                    )}
                    {lang !== "en" && (
                      <p className={lang === "both" ? "mt-1 text-ink-muted" : ""}>
                        इसी मुख्य चार्ट में{" "}
                        <strong className="text-ink">WL और RAC टिकट कन्फर्म</strong>{" "}
                        होते हैं व कोच/सीट नंबर SMS द्वारा मिलता है।
                      </p>
                    )}
                  </div>
                </div>

                {/* CARD 2: 2ND (VACANCY / FINAL) CHART */}
                <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50/80 via-card to-card p-4 shadow-2xs sm:p-5 dark:from-emerald-950/30">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                        <CheckCircleIcon className="h-4 w-4 shrink-0" />
                        <span>
                          {lang === "hi"
                            ? "दूसरा (वैकेंसी) चार्ट"
                            : "2nd (Vacancy) Chart"}
                        </span>
                      </span>
                      {lang === "both" && (
                        <span className="block pl-5 text-[11px] font-bold text-emerald-700/80 dark:text-emerald-300/80">
                          दूसरा / फ़ाइनल वैकेंसी चार्ट
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">
                      {lang === "hi"
                        ? formatChartDayLabelHi(selectedStation.chartTwoDayLabel)
                        : selectedStation.chartTwoDayLabel}
                    </span>
                  </div>

                  <p className="mt-2.5 font-mono text-3xl font-black tracking-tight text-emerald-700 sm:text-4xl dark:text-emerald-400">
                    {selectedStation.chartTwoFormatted12h}
                  </p>
                  <p className="mt-0.5 font-mono text-xs font-semibold text-ink-muted">
                    24-Hour IST: {selectedStation.chartTwoTimeLocal} hrs
                    {lang === "both"
                      ? ` · ${formatChartDayLabelHi(selectedStation.chartTwoDayLabel)}`
                      : ""}
                  </p>

                  <div className="mt-3 border-t border-line/80 pt-2.5 text-xs leading-relaxed text-ink-soft">
                    {lang !== "hi" && (
                      <p>
                        Final chart (~30 mins before departure) locking{" "}
                        <strong className="text-ink">Current Booking</strong>{" "}
                        seats &amp; TTE Hand-Held Terminal.
                      </p>
                    )}
                    {lang !== "en" && (
                      <p className={lang === "both" ? "mt-1 text-ink-muted" : ""}>
                        ट्रेन छूटने से ~30 मिनट पहले{" "}
                        <strong className="text-ink">करंट बुकिंग (CURR_AVBL)</strong>{" "}
                        और बची खाली सीटें लॉक होती हैं।
                      </p>
                    )}
                  </div>
                </div>

                {/* CARD 3: BOARDING DEPARTURE + REMOTE CHARTING HUB */}
                <div className="flex flex-col justify-between rounded-2xl border border-line bg-subcard/45 p-4 sm:p-5">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-ink-soft">
                          <BuildingStationIcon className="h-4 w-4 shrink-0 text-[#fc6203]" />
                          <span>
                            {lang === "hi"
                              ? "चार्टिंग स्टेशन व समय"
                              : "Charting Hub & Train Time"}
                          </span>
                        </span>
                        {lang === "both" && (
                          <span className="block pl-5 text-[11px] font-bold text-ink-muted">
                            चार्ट बनने का स्टेशन व ट्रेन समय
                          </span>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          selectedStation.isPrimaryChartHub
                            ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                            : "bg-orange-500/15 text-[#fc6203]"
                        }`}
                      >
                        {selectedStation.isPrimaryChartHub
                          ? lang === "hi"
                            ? "मुख्य चार्टिंग हब"
                            : "Self Charted"
                          : `Hub: ${selectedStation.chartRemoteStation}`}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-line bg-card p-2.5 text-xs">
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-ink-muted">
                          {t("Arrival", "आगमन", " / ")}
                        </span>
                        <span className="font-mono text-sm font-extrabold text-ink">
                          {selectedStation.arrivalFormatted}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-ink-muted">
                          {t("Departure", "प्रस्थान", " / ")}
                        </span>
                        <span className="font-mono text-sm font-extrabold text-[#1956b4] dark:text-blue-300">
                          {selectedStation.departureFormatted}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs leading-relaxed text-ink-soft">
                    {selectedStation.isPrimaryChartHub ? (
                      <>
                        {lang !== "hi" && (
                          <p>
                            Prepared directly at{" "}
                            <strong className="text-ink">
                              {selectedStation.chartRemoteStationName} (
                              {selectedStation.chartRemoteStation})
                            </strong>{" "}
                            PRS charting hub.
                          </p>
                        )}
                        {lang !== "en" && (
                          <p className={lang === "both" ? "mt-1 text-ink-muted" : ""}>
                            इस स्टेशन का चार्ट सीधे{" "}
                            <strong className="text-ink">
                              {selectedRemoteHindi ||
                                selectedStation.chartRemoteStationName}{" "}
                              ({selectedStation.chartRemoteStation})
                            </strong>{" "}
                            पर ही तैयार होता है।
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        {lang !== "hi" && (
                          <p>
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
                          </p>
                        )}
                        {lang !== "en" && (
                          <p className={lang === "both" ? "mt-1 text-ink-muted" : ""}>
                            ध्यान दें:{" "}
                            <strong className="text-ink">
                              {selectedStation.stationCode}
                            </strong>{" "}
                            का चार्ट पिछले मुख्य स्टेशन{" "}
                            <strong className="text-ink">
                              {selectedRemoteHindi ||
                                selectedStation.chartRemoteStationName}{" "}
                              ({selectedStation.chartRemoteStation})
                            </strong>{" "}
                            पर ही बन जाता है!
                          </p>
                        )}
                      </>
                    )}
                  </div>
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
                      {t("1st Chart", "पहला चार्ट", " / ")}:{" "}
                      <strong className="font-mono text-ink">
                        {selectedStation.chartOneFormatted12h}
                      </strong>{" "}
                      <span className="text-ink-muted">
                        ({lang === "hi" ? "करंट बुकिंग शुरू" : "CURR_AVBL opens"})
                      </span>
                    </span>
                  </div>

                  <span className="hidden text-ink-muted sm:inline">➔</span>

                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">
                      2
                    </span>
                    <span>
                      {t("2nd Chart", "दूसरा चार्ट", " / ")}:{" "}
                      <strong className="font-mono text-ink">
                        {selectedStation.chartTwoFormatted12h}
                      </strong>{" "}
                      <span className="text-ink-muted">
                        ({lang === "hi" ? "फ़ाइनल लॉक" : "Final lock"})
                      </span>
                    </span>
                  </div>

                  <span className="hidden text-ink-muted sm:inline">➔</span>

                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#fc6203] text-[10px] font-black text-white">
                      3
                    </span>
                    <span>
                      {selectedStation.stationCode}{" "}
                      {t("Departure", "प्रस्थान", " / ")}:{" "}
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
                  {t(
                    `Remote Charting Zones (${chartData.uniqueChartHubCount} Hubs)`,
                    `चार्टिंग स्टेशन ज़ोन (${chartData.uniqueChartHubCount} हब)`
                  )}
                </span>
                <h3 className="text-base font-extrabold text-ink sm:text-lg">
                  {lang === "hi"
                    ? "आपके बोर्डिंग स्टेशन का चार्ट किस स्टेशन पर बनता है?"
                    : lang === "both"
                      ? "Which Station Prepares Your Boarding Quota's Chart? · आपका चार्ट कहाँ बनता है?"
                      : "Which Station Prepares Your Boarding Quota's Chart?"}
                </h3>
                <p className="text-xs text-ink-soft">
                  {lang === "hi"
                    ? "नीचे किसी भी स्टेशन पर टैप करके उसका पहला और दूसरा चार्ट समय देखें"
                    : "Tap any station badge below to view its 1st & 2nd chart preparation timing above"}
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
                        {lang === "hi"
                          ? "स्टेशन"
                          : zone.stationCount === 1
                            ? "Stop"
                            : "Stops"}
                      </span>
                    </div>

                    <h4 className="mt-2 text-sm font-extrabold text-ink">
                      {formatBilingualStationName(
                        zone.remoteStationName,
                        zone.remoteStationCode,
                        lang
                      )}
                    </h4>

                    <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-line bg-card p-2 text-xs">
                      <div>
                        <span className="block text-[10px] font-semibold text-ink-muted">
                          {t("1st Chart", "पहला चार्ट", " / ")}
                        </span>
                        <span className="font-mono font-extrabold text-[#1956b4] dark:text-blue-300">
                          {zone.chartOneFormatted12h}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-semibold text-ink-muted">
                          {t("2nd Chart", "दूसरा चार्ट", " / ")}
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
                        const chipHi = getStationHindiName(code);
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
                            {code} ·{" "}
                            {lang === "hi" && chipHi
                              ? chipHi
                              : zone.stationNames[sIdx]}
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
                  {lang === "hi"
                    ? `सभी ${chartData.totalStations} स्टेशनों का पहला और दूसरा चार्ट समय (${chartData.trainNumber})`
                    : `All ${chartData.totalStations} Stations — 1st & 2nd Chart Schedule (${chartData.trainNumber})`}
                </h3>
                <p className="text-xs text-ink-soft">
                  {t(
                    "Tap any boarding station row to view its details above",
                    "किसी भी स्टेशन पर क्लिक करके उसका चार्ट विवरण ऊपर देखें"
                  )}
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
                <input
                  type="text"
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value)}
                  placeholder={
                    lang === "hi"
                      ? "स्टेशन खोजें (जैसे सूरत, कोटा)..."
                      : "Filter station (English / हिंदी)..."
                  }
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
                    <th className="px-3 py-3">
                      {t("Boarding Station", "बोर्डिंग स्टेशन", " / ")}
                    </th>
                    <th className="px-3 py-3">
                      {t("Arr / Dep", "आगमन / प्रस्थान", " · ")}
                    </th>
                    <th className="px-3 py-3">
                      {t("Day & Dist", "दिन व दूरी", " · ")}
                    </th>
                    <th className="px-3 py-3">
                      {t("1st Chart", "पहला चार्ट", " / ")}
                    </th>
                    <th className="px-3 py-3">
                      {t("2nd Chart", "दूसरा चार्ट", " / ")}
                    </th>
                    <th className="py-3 pr-5 pl-3">
                      {t("Charting Hub", "चार्टिंग हब", " / ")}
                    </th>
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
                                  {formatBilingualStationName(
                                    st.stationName,
                                    st.stationCode,
                                    lang
                                  )}
                                </span>
                                <span className="rounded-md bg-blue-50 px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                                  {st.stationCode}
                                </span>
                                {isSelected && (
                                  <span className="rounded-full bg-[#fc6203]/15 px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#fc6203]">
                                    {lang === "hi" ? "चयनित" : "Selected"}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-ink-muted">
                                {st.isOrigin
                                  ? t(
                                      "1st Boarding Station (Origin)",
                                      "पहला बोर्डिंग स्टेशन (प्रारंभ)"
                                    )
                                  : st.isDestination
                                    ? t(
                                        "Destination Terminal",
                                        "अंतिम गंतव्य स्टेशन"
                                      )
                                    : t(
                                        "Intermediate Boarding Halt",
                                        "बीच का बोर्डिंग स्टेशन"
                                      )}
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
                            {lang === "hi" ? `दिन ${st.day}` : `Day ${st.day}`}
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
                            {st.chartTimeLocal} ·{" "}
                            {lang === "hi"
                              ? formatChartDayLabelHi(st.chartOneDayLabel)
                              : st.chartOneDayLabel}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                            {st.chartTwoFormatted12h}
                          </p>
                          <p className="text-[11px] text-ink-muted">
                            {st.chartTwoTimeLocal} ·{" "}
                            {lang === "hi"
                              ? formatChartDayLabelHi(st.chartTwoDayLabel)
                              : st.chartTwoDayLabel}
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
                                  ? lang === "hi"
                                    ? "यहीं बनता है"
                                    : "Self Charted"
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
                              {st.sequence}.{" "}
                              {formatBilingualStationName(
                                st.stationName,
                                st.stationCode,
                                lang
                              )}
                            </p>
                            {isSelected && (
                              <span className="rounded-full bg-[#fc6203] px-2 py-0.5 text-[9px] font-extrabold uppercase text-white">
                                {lang === "hi" ? "चयनित" : "Selected"}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-ink-muted">
                            {lang === "hi" ? `दिन ${st.day}` : `Day ${st.day}`}{" "}
                            · {st.distanceKm} km · Dep:{" "}
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
                          {t("1st Chart", "पहला चार्ट", " / ")}
                        </span>
                        <span className="font-mono text-sm font-black text-[#1956b4] dark:text-blue-300">
                          {st.chartOneFormatted12h}
                        </span>
                        <span className="block text-[10px] text-ink-muted">
                          {lang === "hi"
                            ? formatChartDayLabelHi(st.chartOneDayLabel)
                            : st.chartOneDayLabel}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-ink-muted">
                          {t("2nd Chart", "दूसरा चार्ट", " / ")}
                        </span>
                        <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400">
                          {st.chartTwoFormatted12h}
                        </span>
                        <span className="block text-[10px] text-ink-muted">
                          {lang === "hi"
                            ? formatChartDayLabelHi(st.chartTwoDayLabel)
                            : st.chartTwoDayLabel}
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
                    {t(
                      "Chart Prepared? Check 10-Digit PNR",
                      "चार्ट बन गया? 10-अंकों का PNR स्टेटस देखें"
                    )}
                  </h4>
                  <p className="text-xs text-ink-muted">
                    {lang === "hi"
                      ? "अपना कन्फर्म कोच, सीट/बर्थ नंबर और RAC/WL स्थिति जांचें"
                      : "Verify final coach, berth number & RAC/WL confirmation"}
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
                    {t(
                      `Spot ${chartData.trainNumber} Live Train Status`,
                      `ट्रेन ${chartData.trainNumber} की लाइव लोकेशन देखें`
                    )}
                  </h4>
                  <p className="text-xs text-ink-muted">
                    {lang === "hi"
                      ? "ट्रेन अभी कहाँ है, देरी और कोच पोज़िशन लाइव देखें"
                      : "Check live GPS location, delay minutes & coach position"}
                  </p>
                </div>
              </div>
              <ArrowRightIcon className="h-4 w-4 shrink-0 text-ink-muted group-hover:text-[#1956b4]" />
            </Link>
          </div>
        </div>
      )}

      {/* Educational Footer Cards (Bilingual Aware) */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="flex items-center gap-2 text-sm font-extrabold text-ink">
            <CheckCircleIcon className="h-4 w-4 shrink-0 text-[#1956b4] dark:text-blue-400" />
            <span>
              {t(
                "1st Reservation Chart",
                "पहला चार्ट कब बनता है?",
                " · "
              )}
            </span>
          </p>
          {lang !== "hi" && (
            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
              Prepared at least 4 to 8 hours before departure (or the previous
              evening between 8:00 PM and 9:00 PM for morning trains departing
              before 12:00 PM). Most GNWL, RLWL, and RAC upgrades happen here.
            </p>
          )}
          {lang !== "en" && (
            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
              ट्रेन छूटने से 4–8 घंटे पहले (और सुबह 12 बजे से पहले की ट्रेनों के लिए पिछली रात 8–9 बजे के बीच) पहला चार्ट तैयार होता है। ज़्यादातर वेटिंग (WL) व RAC टिकट इसी समय कन्फर्म होते हैं।
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="flex items-center gap-2 text-sm font-extrabold text-ink">
            <ShieldCheckIcon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              {t(
                "2nd (Vacancy) Chart",
                "दूसरा वैकेंसी चार्ट क्या है?",
                " · "
              )}
            </span>
          </p>
          {lang !== "hi" && (
            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
              Prepared 15 to 30 minutes before train departure at the charting
              station. It locks Current Booking (CURR_AVBL) seats, last-minute
              cancellations, and syncs to the TTE&apos;s Hand-Held Terminal.
            </p>
          )}
          {lang !== "en" && (
            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
              ट्रेन छूटने से 15–30 मिनट पहले दूसरा (फ़ाइनल वैकेंसी) चार्ट लॉक होता है। इसमें करंट बुकिंग और अंतिम समय में रद्द हुई सीटें अपडेट होकर TTE के टैबलेट (HHT) पर जाती हैं।
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="flex items-center gap-2 text-sm font-extrabold text-ink">
            <BuildingStationIcon className="h-4 w-4 shrink-0 text-[#fc6203]" />
            <span>
              {t(
                "Remote Charting Hub",
                "रिमोट चार्टिंग स्टेशन क्यों ज़रूरी है?",
                " · "
              )}
            </span>
          </p>
          {lang !== "hi" && (
            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
              Smaller or downstream halts do not prepare a separate chart; their
              quota is merged into an upstream Remote Charting Hub. Your ticket
              status locks when that upstream hub prepares its chart!
            </p>
          )}
          {lang !== "en" && (
            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
              छोटे या आगे के स्टेशनों का अलग चार्ट नहीं बनता—उनका कोटा पिछले बड़े चार्टिंग हब (Remote Hub) से जुड़ा होता है, इसलिए आपका टिकट उसी बड़े स्टेशन के चार्ट समय पर लॉक हो जाता है!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
