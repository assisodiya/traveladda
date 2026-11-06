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
  type AirlineSearchItem,
  type FlightLifecycleTone,
  getFlightTodayIstDateString,
  type NormalizedFlightLeg,
  type NormalizedFlightStatusData,
  type OwnedAirlineSearchApiResponse,
  type OwnedFlightStatusApiResponse,
  POPULAR_AIRLINES,
  POPULAR_LIVE_FLIGHTS,
  parseFlightInput,
  shiftIsoDateByDays,
} from "@/lib/flight-types";
import { AirlineLogo } from "./AirlineLogo";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  CloseIcon,
  CodeIcon,
  CopyIcon,
  LiveFlightBeaconIcon,
  LuggageIcon,
  MapPinIcon,
  PhoneCallIcon,
  PlaneIcon,
  PrinterIcon,
  RadarLiveIcon,
  RefreshIcon,
  SearchIcon,
  SparklesIcon,
} from "./Icons";

interface RecentFlightLookup {
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  route: string;
  departureDate: string;
}

const RECENT_FLIGHTS_STORAGE_KEY = "traveladda_recent_live_flights_v1";
const EMPTY_RECENT_FLIGHTS: RecentFlightLookup[] = [];

let cachedRawFlights: string | null = null;
let cachedParsedFlights: RecentFlightLookup[] = EMPTY_RECENT_FLIGHTS;
const flightRecentListeners = new Set<() => void>();

function subscribeRecentFlights(listener: () => void) {
  flightRecentListeners.add(listener);
  return () => {
    flightRecentListeners.delete(listener);
  };
}

function getRecentFlightsSnapshot(): RecentFlightLookup[] {
  if (typeof window === "undefined") return EMPTY_RECENT_FLIGHTS;
  try {
    const raw = window.localStorage.getItem(RECENT_FLIGHTS_STORAGE_KEY);
    if (raw === cachedRawFlights) return cachedParsedFlights;
    cachedRawFlights = raw;
    if (!raw) {
      cachedParsedFlights = EMPTY_RECENT_FLIGHTS;
      return cachedParsedFlights;
    }
    const parsed = JSON.parse(raw) as unknown;
    cachedParsedFlights = Array.isArray(parsed)
      ? (parsed.slice(0, 6) as RecentFlightLookup[])
      : EMPTY_RECENT_FLIGHTS;
    return cachedParsedFlights;
  } catch {
    return EMPTY_RECENT_FLIGHTS;
  }
}

function getRecentFlightsServerSnapshot(): RecentFlightLookup[] {
  return EMPTY_RECENT_FLIGHTS;
}

function saveRecentFlightsToStorage(items: RecentFlightLookup[]) {
  try {
    if (items.length === 0) {
      window.localStorage.removeItem(RECENT_FLIGHTS_STORAGE_KEY);
      cachedRawFlights = null;
      cachedParsedFlights = EMPTY_RECENT_FLIGHTS;
    } else {
      const serialized = JSON.stringify(items);
      window.localStorage.setItem(RECENT_FLIGHTS_STORAGE_KEY, serialized);
      cachedRawFlights = serialized;
      cachedParsedFlights = items;
    }
    for (const listener of flightRecentListeners) listener();
  } catch {
    // Ignore storage quota errors
  }
}

function noopSubscribe() {
  return () => {};
}

function getStatusBadgeClasses(tone: FlightLifecycleTone): string {
  switch (tone) {
    case "in_air":
      return "border-emerald-400/45 bg-emerald-500/20 text-emerald-200";
    case "arrived":
      return "border-emerald-400/40 bg-emerald-500/18 text-emerald-200";
    case "delayed":
      return "border-amber-400/50 bg-amber-500/22 text-amber-200";
    case "cancelled":
      return "border-rose-400/50 bg-rose-500/22 text-rose-200";
    default:
      return "border-orange-400/45 bg-orange-500/20 text-amber-200";
  }
}

function formatFriendlyDateLabel(isoDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;
  const [y, m, d] = isoDate.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(utc);
}

export function LiveFlightTracker() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const todayIst = useSyncExternalStore(
    noopSubscribe,
    getFlightTodayIstDateString,
    () => ""
  );

  const recentFlights = useSyncExternalStore(
    subscribeRecentFlights,
    getRecentFlightsSnapshot,
    getRecentFlightsServerSnapshot
  );

  const urlAirline = (
    searchParams.get("airline") ??
    searchParams.get("code") ??
    ""
  )
    .trim()
    .toUpperCase();
  const urlFlightNo = (
    searchParams.get("flight") ??
    searchParams.get("flightNumber") ??
    ""
  ).trim();
  const urlDate = (
    searchParams.get("date") ??
    searchParams.get("departureDate") ??
    ""
  ).trim();

  // Selected Airline + Search Combobox State
  const initialAirlineObj = useMemo(() => {
    if (urlAirline) {
      const match = POPULAR_AIRLINES.find((a) => a.code === urlAirline);
      if (match) return match;
      return {
        id: 0,
        code: urlAirline,
        name: urlAirline,
        aliasName: null,
        phoneFree: "",
        phoneOther: "",
        isRegionalOnly: false,
        listOnlyLookup: false,
        codeDisplay: urlAirline,
        iconUrl: `/api/flights/icon/${urlAirline}`,
        publicIconPath: `/airlines/${urlAirline}.png`,
      } satisfies AirlineSearchItem;
    }
    return POPULAR_AIRLINES[0]; // Default IndiGo (6E)
  }, [urlAirline]);

  const [selectedAirline, setSelectedAirline] =
    useState<AirlineSearchItem | null>(initialAirlineObj);
  const [airlineSearchText, setAirlineSearchText] = useState("");
  const [isAirlineDropdownOpen, setIsAirlineDropdownOpen] = useState(false);
  const [airlineSearching, setAirlineSearching] = useState(false);
  const [remoteAirlines, setRemoteAirlines] = useState<
    AirlineSearchItem[] | null
  >(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Flight Number & Departure Date State
  const [flightNumberInput, setFlightNumberInput] = useState(urlFlightNo);
  const [selectedDate, setSelectedDate] = useState(urlDate);
  const effectiveDate = selectedDate || todayIst;

  // Live Status Result State
  const [flightData, setFlightData] =
    useState<NormalizedFlightStatusData | null>(null);
  const [selectedLegIndex, setSelectedLegIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const airlineBoxRef = useRef<HTMLDivElement>(null);
  const flightNoInputRef = useRef<HTMLInputElement>(null);
  const lastFetchedSignatureRef = useRef<string>("");

  const yesterdayDate = useMemo(
    () => (todayIst ? shiftIsoDateByDays(todayIst, -1) : ""),
    [todayIst]
  );
  const tomorrowDate = useMemo(
    () => (todayIst ? shiftIsoDateByDays(todayIst, 1) : ""),
    [todayIst]
  );

  // Filtered or Remote Airline Dropdown Items
  const displayedAirlines = useMemo(() => {
    const q = airlineSearchText.trim();
    if (!q) {
      return POPULAR_AIRLINES;
    }
    if (remoteAirlines !== null) {
      return remoteAirlines;
    }
    const lower = q.toLowerCase();
    return POPULAR_AIRLINES.filter(
      (a) =>
        a.code.toLowerCase().includes(lower) ||
        a.name.toLowerCase().includes(lower) ||
        (a.aliasName?.toLowerCase().includes(lower) ?? false)
    );
  }, [airlineSearchText, remoteAirlines]);

  // Close airline dropdown when clicking outside
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        airlineBoxRef.current &&
        !airlineBoxRef.current.contains(event.target as Node)
      ) {
        setIsAirlineDropdownOpen(false);
        setAirlineSearchText("");
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Debounced Live Airline Search API Call (/api/flights/airlines?searchTerm=...)
  useEffect(() => {
    const trimmed = airlineSearchText.trim();
    if (!isAirlineDropdownOpen || trimmed.length < 1) {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setAirlineSearching(true);
      try {
        const res = await fetch(
          `/api/flights/airlines?searchTerm=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const payload = (await res.json()) as OwnedAirlineSearchApiResponse;
          if (Array.isArray(payload.data)) {
            setRemoteAirlines(payload.data);
            setHighlightedIndex(0);
          }
        }
      } catch {
        // Ignore aborted search requests
      } finally {
        if (!controller.signal.aborted) {
          setAirlineSearching(false);
        }
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [airlineSearchText, isAirlineDropdownOpen]);

  const executeFlightLookup = useCallback(
    async (
      airlineCodeRaw: string,
      flightNoRaw: string,
      depDateRaw: string,
      options?: { pushUrl?: boolean; silent?: boolean }
    ) => {
      const cleanAirline = airlineCodeRaw.trim().toUpperCase();
      const parsed = parseFlightInput(flightNoRaw);
      const finalAirline = parsed.extractedAirlineCode ?? cleanAirline;
      const finalFlightNo = parsed.extractedFlightNumber;
      const finalDate =
        depDateRaw && /^\d{4}-\d{2}-\d{2}$/.test(depDateRaw)
          ? depDateRaw
          : getFlightTodayIstDateString();

      if (!finalAirline || !/^[A-Z0-9]{2,3}$/.test(finalAirline)) {
        setErrorMsg("Please select an airline from the Airline Search list.");
        setErrorHint("Type an airline name like IndiGo, Air India, Akasa, or Emirates.");
        return;
      }

      if (!finalFlightNo || !/^\d{1,4}[A-Z]?$/.test(finalFlightNo)) {
        setErrorMsg(
          "Please enter a valid 1 to 4-digit flight number (e.g., 562, 101, 2045)."
        );
        setErrorHint(`Selected Airline: ${finalAirline}. Enter digits like 2045.`);
        return;
      }

      if (options?.pushUrl) {
        const params = new URLSearchParams();
        params.set("airline", finalAirline);
        params.set("flight", finalFlightNo);
        params.set("date", finalDate);
        router.replace(`/air/flight-status?${params.toString()}`, {
          scroll: false,
        });
      }

      if (!options?.silent) {
        setLoading(true);
        setErrorMsg(null);
        setErrorHint(null);
      }

      try {
        const res = await fetch(
          `/api/flights/status?airline=${encodeURIComponent(
            finalAirline
          )}&flightNumber=${encodeURIComponent(
            finalFlightNo
          )}&departureDate=${encodeURIComponent(finalDate)}`,
          { cache: "no-store" }
        );

        const json = (await res.json()) as OwnedFlightStatusApiResponse;

        if (!res.ok || !json.success || !json.data) {
          setFlightData(null);
          setErrorMsg(
            json.error?.message ??
              `No flight telemetry found for ${finalAirline} ${finalFlightNo} on ${finalDate}.`
          );
          setErrorHint(
            json.error?.hint ??
              "Try switching Departure Date to Yesterday, Today, or Tomorrow."
          );
          return;
        }

        setFlightData(json.data);
        setSelectedLegIndex(0);
        setErrorMsg(null);
        setErrorHint(null);

        // Sync selected airline badge name if found
        const primary = json.data.primaryFlight;
        setSelectedAirline((prev) => {
          if (prev && prev.code === finalAirline && prev.name !== finalAirline) {
            return prev;
          }
          const known = POPULAR_AIRLINES.find((a) => a.code === finalAirline);
          if (known) return known;
          return {
            id: 0,
            code: finalAirline,
            name: primary.airlineName,
            aliasName: null,
            phoneFree: prev?.phoneFree ?? "",
            phoneOther: prev?.phoneOther ?? "",
            isRegionalOnly: false,
            listOnlyLookup: false,
            codeDisplay: finalAirline,
            iconUrl: `/api/flights/icon/${finalAirline}`,
            publicIconPath: `/airlines/${finalAirline}.png`,
          };
        });

        // Save to Recent Flights in localStorage
        const routeStr = `${primary.departure.airportCode} → ${primary.arrival.airportCode}`;
        const nextEntry: RecentFlightLookup = {
          airlineCode: finalAirline,
          airlineName: primary.airlineName,
          flightNumber: finalFlightNo,
          route: routeStr,
          departureDate: finalDate,
        };
        const existing = getRecentFlightsSnapshot().filter(
          (item) =>
            !(
              item.airlineCode === finalAirline &&
              item.flightNumber === finalFlightNo
            )
        );
        saveRecentFlightsToStorage([nextEntry, ...existing].slice(0, 6));
      } catch {
        if (!options?.silent) {
          setErrorMsg(
            "Network error while contacting live flight radar. Please try again."
          );
          setErrorHint("Check your internet connection and tap Track Flight Status.");
        }
      } finally {
        if (!options?.silent) {
          setLoading(false);
        }
      }
    },
    [router]
  );

  // Trigger automatic lookup when URL query parameters are present
  useEffect(() => {
    if (!urlAirline || !urlFlightNo) return;
    const resolvedDate = urlDate || getFlightTodayIstDateString();
    const signature = `${urlAirline}|${urlFlightNo}|${resolvedDate}`;
    if (lastFetchedSignatureRef.current === signature) return;
    lastFetchedSignatureRef.current = signature;

    void Promise.resolve().then(() => {
      setFlightNumberInput(urlFlightNo);
      if (urlDate) setSelectedDate(urlDate);
      const known = POPULAR_AIRLINES.find((a) => a.code === urlAirline);
      if (known) {
        setSelectedAirline(known);
      }
      return executeFlightLookup(urlAirline, urlFlightNo, resolvedDate, {
        pushUrl: false,
      });
    });
  }, [urlAirline, urlFlightNo, urlDate, executeFlightLookup]);

  // Optional 30s Auto-Refresh when enabled
  useEffect(() => {
    if (!autoRefresh || !flightData) return;
    const interval = setInterval(() => {
      void executeFlightLookup(
        flightData.query.airlineCode,
        flightData.query.flightNumber,
        flightData.query.departureDate,
        { pushUrl: false, silent: true }
      );
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, flightData, executeFlightLookup]);

  const handleSelectAirline = (airline: AirlineSearchItem) => {
    setSelectedAirline(airline);
    setAirlineSearchText("");
    setRemoteAirlines(null);
    setIsAirlineDropdownOpen(false);
    setErrorMsg(null);
    setTimeout(() => {
      flightNoInputRef.current?.focus();
    }, 30);
  };

  const handleFlightInputChange = (rawVal: string) => {
    const upper = rawVal.toUpperCase();
    // Check if user pasted a full code like "6E 2045" or "QP-562"
    const fullMatch = upper.match(/^([A-Z0-9]{2}|[A-Z]{3})[\s-]+(\d{1,4}[A-Z]?)$/);
    if (fullMatch && /[A-Z]/.test(fullMatch[1])) {
      const extractedCode = fullMatch[1];
      const extractedNum = fullMatch[2];
      const known = POPULAR_AIRLINES.find((a) => a.code === extractedCode);
      setSelectedAirline(
        known ?? {
          id: 0,
          code: extractedCode,
          name: extractedCode,
          aliasName: null,
          phoneFree: "",
          phoneOther: "",
          isRegionalOnly: false,
          listOnlyLookup: false,
          codeDisplay: extractedCode,
          iconUrl: `/api/flights/icon/${extractedCode}`,
          publicIconPath: `/airlines/${extractedCode}.png`,
        }
      );
      setFlightNumberInput(extractedNum);
      if (errorMsg) setErrorMsg(null);
      return;
    }

    setFlightNumberInput(upper.replace(/[^0-9A-Z\s-]/g, "").slice(0, 8));
    if (errorMsg) setErrorMsg(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFlightInput(flightNumberInput);
    const codeToUse =
      parsed.extractedAirlineCode ?? selectedAirline?.code ?? "";
    const numToUse = parsed.extractedFlightNumber || flightNumberInput.trim();
    const dateToUse = effectiveDate || getFlightTodayIstDateString();
    lastFetchedSignatureRef.current = `${codeToUse}|${numToUse}|${dateToUse}`;
    void executeFlightLookup(codeToUse, numToUse, dateToUse, { pushUrl: true });
  };

  const handleQuickPresetClick = (
    airlineCode: string,
    airlineName: string,
    flightNumber: string,
    explicitDate?: string
  ) => {
    const known = POPULAR_AIRLINES.find((a) => a.code === airlineCode);
    setSelectedAirline(
      known ?? {
        id: 0,
        code: airlineCode,
        name: airlineName,
        aliasName: null,
        phoneFree: "",
        phoneOther: "",
        isRegionalOnly: false,
        listOnlyLookup: false,
        codeDisplay: airlineCode,
        iconUrl: `/api/flights/icon/${airlineCode}`,
        publicIconPath: `/airlines/${airlineCode}.png`,
      }
    );
    setFlightNumberInput(flightNumber);
    const targetDate =
      explicitDate && /^\d{4}-\d{2}-\d{2}$/.test(explicitDate)
        ? explicitDate
        : effectiveDate || getFlightTodayIstDateString();
    setSelectedDate(targetDate);
    lastFetchedSignatureRef.current = `${airlineCode}|${flightNumber}|${targetDate}`;
    void executeFlightLookup(airlineCode, flightNumber, targetDate, {
      pushUrl: true,
    });
  };

  const activeLeg: NormalizedFlightLeg | null = useMemo(() => {
    if (!flightData) return null;
    return flightData.legs[selectedLegIndex] ?? flightData.primaryFlight;
  }, [flightData, selectedLegIndex]);

  const matchedAirlineContact = useMemo(() => {
    if (!activeLeg) return null;
    if (
      selectedAirline &&
      selectedAirline.code === activeLeg.airlineCode &&
      (selectedAirline.phoneFree || selectedAirline.phoneOther)
    ) {
      return selectedAirline.phoneFree || selectedAirline.phoneOther;
    }
    const pop = POPULAR_AIRLINES.find((a) => a.code === activeLeg.airlineCode);
    return pop?.phoneFree || pop?.phoneOther || null;
  }, [activeLeg, selectedAirline]);

  const handleCopySummary = async () => {
    if (!activeLeg || !flightData) return;
    const summaryLines = [
      `✈️ ${activeLeg.titleMain} — ${activeLeg.flightStatus}`,
      `📅 Date: ${formatFriendlyDateLabel(flightData.query.departureDate)}`,
      `🛫 Departure: ${activeLeg.departure.airportCity} (${activeLeg.departure.airportCode})${
        activeLeg.departure.terminal ? ` · T${activeLeg.departure.terminal}` : ""
      }${activeLeg.departure.gate ? ` · Gate ${activeLeg.departure.gate}` : ""} — ${
        activeLeg.departure.estimatedTime ??
        activeLeg.departure.scheduledTime ??
        "TBA"
      }`,
      `🛬 Arrival: ${activeLeg.arrival.airportCity} (${activeLeg.arrival.airportCode})${
        activeLeg.arrival.terminal ? ` · T${activeLeg.arrival.terminal}` : ""
      }${activeLeg.arrival.gate ? ` · Gate ${activeLeg.arrival.gate}` : ""}${
        activeLeg.arrival.baggage ? ` · Belt ${activeLeg.arrival.baggage}` : ""
      } — ${
        activeLeg.arrival.estimatedTime ??
        activeLeg.arrival.scheduledTime ??
        "TBA"
      }`,
      activeLeg.aircraft ? `🛩️ Aircraft: ${activeLeg.aircraft.name}` : "",
      `🔗 Track Live: ${window.location.origin}/air/flight-status?airline=${activeLeg.airlineCode}&flight=${activeLeg.flightNumber}&date=${flightData.query.departureDate}`,
    ].filter(Boolean);

    try {
      await navigator.clipboard.writeText(summaryLines.join("\n"));
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2400);
    } catch {
      // Ignore clipboard failure
    }
  };

  return (
    <div className="space-y-6">
      {/* SEARCH CONSOLE CARD */}
      <div className="rounded-3xl border border-line bg-card p-4 shadow-xl shadow-black/6 dark:shadow-black/35 sm:p-6">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid gap-3.5 lg:grid-cols-[1.35fr_0.9fr_0.95fr_auto]">
            {/* 1. AIRLINE SEARCH COMBOBOX WITH DAILY CACHED PUBLIC ICONS */}
            <div ref={airlineBoxRef} className="relative">
              <label
                htmlFor="airline-search-input"
                className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-ink-soft"
              >
                <span>1. Airline Search</span>
                {selectedAirline && (
                  <span className="font-mono text-[11px] font-bold text-orange-700 dark:text-amber-300">
                    Code: {selectedAirline.code}
                  </span>
                )}
              </label>

              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  {selectedAirline && !isAirlineDropdownOpen ? (
                    <AirlineLogo
                      code={selectedAirline.code}
                      name={selectedAirline.name}
                      size="xs"
                    />
                  ) : (
                    <SearchIcon className="h-4.5 w-4.5 text-orange-600 dark:text-amber-400" />
                  )}
                </div>

                <input
                  id="airline-search-input"
                  type="text"
                  role="combobox"
                  aria-expanded={isAirlineDropdownOpen}
                  aria-controls="airline-search-listbox"
                  aria-autocomplete="list"
                  autoComplete="off"
                  value={
                    isAirlineDropdownOpen
                      ? airlineSearchText
                      : selectedAirline
                        ? `${selectedAirline.name} (${selectedAirline.code})`
                        : airlineSearchText
                  }
                  placeholder="Search airline (e.g. IndiGo, Air India, QP, EK)"
                  onFocus={() => {
                    setIsAirlineDropdownOpen(true);
                    setAirlineSearchText("");
                    setRemoteAirlines(null);
                    setHighlightedIndex(0);
                  }}
                  onChange={(e) => {
                    setAirlineSearchText(e.target.value);
                    setRemoteAirlines(null);
                    setIsAirlineDropdownOpen(true);
                    setHighlightedIndex(0);
                  }}
                  onKeyDown={(e) => {
                    if (!isAirlineDropdownOpen) return;
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setHighlightedIndex((prev) =>
                        displayedAirlines.length > 0
                          ? (prev + 1) % displayedAirlines.length
                          : 0
                      );
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setHighlightedIndex((prev) =>
                        displayedAirlines.length > 0
                          ? (prev - 1 + displayedAirlines.length) %
                            displayedAirlines.length
                          : 0
                      );
                    } else if (
                      e.key === "Enter" &&
                      displayedAirlines[highlightedIndex]
                    ) {
                      e.preventDefault();
                      handleSelectAirline(displayedAirlines[highlightedIndex]);
                    } else if (e.key === "Escape") {
                      setIsAirlineDropdownOpen(false);
                      setAirlineSearchText("");
                    }
                  }}
                  className="w-full rounded-2xl border-2 border-line bg-input py-3.5 pl-11 pr-9 text-base font-bold text-ink placeholder:text-xs placeholder:font-medium placeholder:text-ink-muted focus:border-orange-500 focus:outline-none sm:text-sm"
                />

                <button
                  type="button"
                  aria-label="Toggle airline dropdown"
                  onClick={() => {
                    if (isAirlineDropdownOpen) {
                      setIsAirlineDropdownOpen(false);
                      setAirlineSearchText("");
                    } else {
                      setIsAirlineDropdownOpen(true);
                      setAirlineSearchText("");
                      setRemoteAirlines(null);
                    }
                  }}
                  className="absolute right-2.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-ink-muted transition hover:bg-subcard hover:text-ink"
                >
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform ${
                      isAirlineDropdownOpen ? "rotate-180 text-orange-600" : ""
                    }`}
                  />
                </button>
              </div>

              {/* AIRLINE DROPDOWN WITH LOGOS */}
              {isAirlineDropdownOpen && (
                <div
                  id="airline-search-listbox"
                  role="listbox"
                  className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-line-strong bg-card p-1.5 shadow-2xl shadow-black/25"
                >
                  <div className="flex items-center justify-between px-2.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                    <span>
                      {airlineSearchText.trim()
                        ? airlineSearching
                          ? "Searching live airlines..."
                          : `Matching Airlines (${displayedAirlines.length})`
                        : "Popular Domestic & Global Airlines"}
                    </span>
                    <span className="font-mono text-[10px] text-orange-600 dark:text-amber-400">
                      IATA / ICAO
                    </span>
                  </div>

                  {displayedAirlines.length === 0 && !airlineSearching ? (
                    <div className="px-3 py-5 text-center text-xs font-semibold text-ink-muted">
                      No airlines matched &ldquo;{airlineSearchText}&rdquo;. Try an IATA
                      code like 6E, AI, IX, QP, EK, or BA.
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {displayedAirlines.map((item, idx) => {
                        const isHighlighted = idx === highlightedIndex;
                        const isSelected = selectedAirline?.code === item.code;
                        const phoneDisplay = item.phoneFree || item.phoneOther;

                        return (
                          <button
                            key={`${item.code}-${item.id}-${idx}`}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                            onClick={() => handleSelectAirline(item)}
                            className={`flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-left transition ${
                              isHighlighted
                                ? "bg-orange-500/14 text-ink"
                                : isSelected
                                  ? "bg-subcard text-ink"
                                  : "hover:bg-subcard"
                            }`}
                          >
                            <div className="flex min-w-0 items-center gap-2.5">
                              <AirlineLogo
                                code={item.code}
                                name={item.name}
                                size="sm"
                              />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-extrabold text-ink">
                                  {item.name}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
                                  {item.aliasName && (
                                    <span className="truncate">
                                      ({item.aliasName})
                                    </span>
                                  )}
                                  {phoneDisplay && (
                                    <span className="inline-flex items-center gap-1 font-mono text-[10px]">
                                      <PhoneCallIcon className="h-2.5 w-2.5" />
                                      <span>{phoneDisplay}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <span className="shrink-0 rounded-lg border border-orange-500/30 bg-orange-500/14 px-2 py-1 font-mono text-xs font-black text-orange-800 dark:text-amber-300">
                              {item.code}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. FLIGHT NUMBER INPUT */}
            <div>
              <label
                htmlFor="flight-number-input"
                className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-ink-soft"
              >
                <span>2. Flight Number</span>
                <span className="font-mono text-[10px] font-semibold text-ink-muted">
                  e.g. 562, 2045
                </span>
              </label>

              <div className="relative mt-1.5">
                {selectedAirline ? (
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 rounded-md bg-orange-500/16 px-1.5 py-0.5 font-mono text-xs font-black text-orange-800 dark:text-amber-300">
                    {selectedAirline.code}
                  </span>
                ) : (
                  <PlaneIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-600 dark:text-amber-400" />
                )}

                <input
                  ref={flightNoInputRef}
                  id="flight-number-input"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  value={flightNumberInput}
                  onChange={(e) => handleFlightInputChange(e.target.value)}
                  placeholder="Enter flight no. (e.g. 2045)"
                  className={`w-full rounded-2xl border-2 border-line bg-input py-3.5 pr-8 font-mono text-base font-extrabold tracking-wide text-ink placeholder:font-sans placeholder:text-xs placeholder:font-medium placeholder:tracking-normal placeholder:text-ink-muted focus:border-orange-500 focus:outline-none sm:text-sm ${
                    selectedAirline ? "pl-13" : "pl-10"
                  }`}
                />

                {flightNumberInput && (
                  <button
                    type="button"
                    aria-label="Clear flight number"
                    onClick={() => setFlightNumberInput("")}
                    className="absolute right-2.5 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-subcard text-ink-muted hover:text-ink"
                  >
                    <CloseIcon className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* 3. DEPARTURE DATE PICKER */}
            <div>
              <label
                htmlFor="flight-departure-date"
                className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-ink-soft"
              >
                <span>3. Departure Date</span>
                <span className="text-[10px] font-semibold text-ink-muted">
                  Origin Local
                </span>
              </label>

              <div className="relative mt-1.5">
                <CalendarIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-600 dark:text-amber-300" />
                <input
                  id="flight-departure-date"
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="w-full rounded-2xl border-2 border-line bg-input py-3.5 pl-10 pr-3 font-mono text-base font-bold text-ink focus:border-orange-500 focus:outline-none sm:text-sm"
                />
              </div>
            </div>

            {/* SUBMIT CTA */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="ta-btn-primary inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-extrabold disabled:opacity-65 lg:w-auto lg:py-4"
              >
                {loading ? (
                  <>
                    <RefreshIcon className="h-4 w-4 animate-spin" />
                    <span>Tracking...</span>
                  </>
                ) : (
                  <>
                    <RadarLiveIcon className="h-4 w-4" />
                    <span>Track Flight</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Date Pills + 1-Tap Popular Live Flights */}
          <div className="flex flex-col justify-between gap-3 border-t border-line pt-3.5 sm:flex-row sm:items-center">
            {todayIst && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="mr-1 font-extrabold text-ink-muted">
                  Quick Date:
                </span>
                {[
                  { label: "Yesterday", val: yesterdayDate },
                  { label: "Today", val: todayIst },
                  { label: "Tomorrow", val: tomorrowDate },
                ].map((pill) => {
                  const active = effectiveDate === pill.val;
                  return (
                    <button
                      key={pill.label}
                      type="button"
                      onClick={() => {
                        setSelectedDate(pill.val);
                        if (flightNumberInput.trim() && selectedAirline) {
                          lastFetchedSignatureRef.current = `${selectedAirline.code}|${flightNumberInput.trim()}|${pill.val}`;
                          void executeFlightLookup(
                            selectedAirline.code,
                            flightNumberInput,
                            pill.val,
                            { pushUrl: true }
                          );
                        }
                      }}
                      className={`cursor-pointer rounded-full px-3 py-1 font-bold transition ${
                        active
                          ? "bg-orange-500/18 text-orange-800 ring-1 ring-orange-500/40 dark:text-amber-300"
                          : "bg-subcard text-ink-soft hover:text-ink"
                      }`}
                    >
                      {pill.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Popular Flights Strip with Airline Icons */}
            <div className="ta-no-scrollbar flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="shrink-0 font-extrabold text-ink-muted">
                Live Presets:
              </span>
              {POPULAR_LIVE_FLIGHTS.slice(0, 5).map((preset) => (
                <button
                  key={`${preset.airlineCode}-${preset.flightNumber}`}
                  type="button"
                  onClick={() =>
                    handleQuickPresetClick(
                      preset.airlineCode,
                      preset.airlineName,
                      preset.flightNumber
                    )
                  }
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-subcard py-1 pl-1.5 pr-2.5 font-mono text-xs font-bold text-ink transition hover:border-orange-500"
                >
                  <AirlineLogo
                    code={preset.airlineCode}
                    name={preset.airlineName}
                    size="xs"
                  />
                  <span>
                    {preset.airlineCode} {preset.flightNumber}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Lookups Strip */}
          {recentFlights.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-subcard/75 px-3 py-2 text-xs">
              <div className="ta-no-scrollbar flex items-center gap-1.5 overflow-x-auto">
                <span className="shrink-0 font-bold text-ink-muted">
                  Recent:
                </span>
                {recentFlights.map((rec) => (
                  <button
                    key={`${rec.airlineCode}-${rec.flightNumber}`}
                    type="button"
                    onClick={() =>
                      handleQuickPresetClick(
                        rec.airlineCode,
                        rec.airlineName,
                        rec.flightNumber,
                        rec.departureDate
                      )
                    }
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-1 font-mono text-[11px] font-bold text-ink transition hover:border-orange-500"
                  >
                    <AirlineLogo
                      code={rec.airlineCode}
                      name={rec.airlineName}
                      size="xs"
                    />
                    <span>
                      {rec.airlineCode} {rec.flightNumber}
                    </span>
                    <span className="text-[10px] text-ink-muted">
                      ({rec.route})
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => saveRecentFlightsToStorage([])}
                className="cursor-pointer text-[11px] font-bold text-ink-muted hover:text-rose-600"
              >
                Clear
              </button>
            </div>
          )}
        </form>

        {/* Validation / Error Banner */}
        {errorMsg && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-500/35 bg-rose-500/10 p-4 text-sm text-rose-800 dark:text-rose-200"
          >
            <AlertCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <div className="space-y-1">
              <p className="font-extrabold">{errorMsg}</p>
              {errorHint && (
                <p className="text-xs text-rose-700/90 dark:text-rose-300/90">
                  {errorHint}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* LOADING SKELETON */}
      {loading && !flightData && (
        <div className="animate-pulse overflow-hidden rounded-3xl border border-line bg-card shadow-lg">
          <div className="ta-live-cockpit p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/15" />
              <div className="space-y-2">
                <div className="h-5 w-52 rounded-lg bg-white/20" />
                <div className="h-3.5 w-36 rounded-lg bg-white/12" />
              </div>
            </div>
            <div className="mt-8 grid grid-cols-3 items-center gap-4">
              <div className="h-14 rounded-2xl bg-white/12" />
              <div className="h-6 rounded-full bg-white/15" />
              <div className="h-14 rounded-2xl bg-white/12" />
            </div>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="h-44 rounded-2xl bg-subcard" />
            <div className="h-44 rounded-2xl bg-subcard" />
          </div>
        </div>
      )}

      {/* LIVE FLIGHT RADAR & TELEMETRY BOARDING CARD */}
      {flightData && activeLeg && (
        <article
          aria-label={`Live flight status for ${activeLeg.titleMain}`}
          className="overflow-hidden rounded-3xl border border-line bg-card shadow-2xl shadow-black/10 dark:shadow-black/40"
        >
          {/* DARK AVIATION COCKPIT HEADER */}
          <div className="ta-live-cockpit p-5 sm:p-7">
            {/* Top Bar: Airline Logo + Flight Title + Status Badge */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <AirlineLogo
                  code={activeLeg.airlineCode}
                  name={activeLeg.airlineName}
                  size="lg"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                      {activeLeg.titleMain}
                    </h2>
                    <span className="rounded-lg border border-white/20 bg-white/10 px-2 py-0.5 font-mono text-xs font-bold text-amber-300">
                      {formatFriendlyDateLabel(flightData.query.departureDate)}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2.5 text-xs text-stone-300">
                    {activeLeg.aircraft && (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-amber-200/95">
                        <PlaneIcon className="h-3.5 w-3.5" />
                        <span>
                          {activeLeg.aircraft.name}
                          {activeLeg.aircraft.code
                            ? ` (${activeLeg.aircraft.code})`
                            : ""}
                        </span>
                      </span>
                    )}
                    {activeLeg.titleSub && (
                      <span className="text-stone-400">
                        · {activeLeg.titleSub}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Flight Lifecycle Pill + Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider ${getStatusBadgeClasses(
                    activeLeg.statusTone
                  )}`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      activeLeg.statusTone === "in_air"
                        ? "ta-led-blink bg-emerald-400"
                        : activeLeg.statusTone === "arrived"
                          ? "bg-emerald-400"
                          : activeLeg.statusTone === "delayed"
                            ? "ta-led-blink bg-amber-400"
                            : activeLeg.statusTone === "cancelled"
                              ? "bg-rose-400"
                              : "bg-orange-400"
                    }`}
                  />
                  <span>{activeLeg.flightStatus}</span>
                </span>
              </div>
            </div>

            {/* Multi-leg flight selector if flight has multiple segments */}
            {flightData.legs.length > 1 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-white/15 bg-white/6 p-2 text-xs">
                <span className="px-2 font-bold text-stone-300">
                  Flight Segments:
                </span>
                {flightData.legs.map((leg, idx) => (
                  <button
                    key={`${leg.departure.airportCode}-${leg.arrival.airportCode}-${idx}`}
                    type="button"
                    onClick={() => setSelectedLegIndex(idx)}
                    className={`cursor-pointer rounded-xl px-3 py-1.5 font-mono font-bold transition ${
                      selectedLegIndex === idx
                        ? "bg-orange-500 text-white shadow-xs"
                        : "text-stone-300 hover:bg-white/10"
                    }`}
                  >
                    Leg {idx + 1}: {leg.departure.airportCode} →{" "}
                    {leg.arrival.airportCode} ({leg.flightStatus})
                  </button>
                ))}
              </div>
            )}

            {/* VISUAL FLIGHT CORRIDOR RADAR BAR */}
            <div className="mt-6 rounded-2xl border border-white/14 bg-black/28 p-4 sm:p-6">
              <div className="grid items-center gap-5 sm:grid-cols-[1fr_1.5fr_1fr]">
                {/* Origin Airport */}
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300/90">
                    Origin · Departure
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-black tracking-tight text-white sm:text-4xl">
                      {activeLeg.departure.airportCode}
                    </span>
                    {activeLeg.departure.airportCountryCode && (
                      <span className="rounded bg-white/12 px-1.5 py-0.5 font-mono text-[10px] font-bold text-stone-300">
                        {activeLeg.departure.airportCountryCode}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm font-bold text-stone-200">
                    {activeLeg.departure.airportCity}
                  </p>
                  <p className="truncate text-xs text-stone-400">
                    {activeLeg.departure.airport}
                  </p>
                </div>

                {/* Animated Flight Path Progress */}
                <div className="py-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-stone-300">
                    <span>
                      {activeLeg.departure.duration
                        ? `Duration: ${activeLeg.departure.duration}`
                        : "Direct Corridor"}
                    </span>
                    <span className="font-mono text-amber-300">
                      {activeLeg.arrival.timeRemaining
                        ? `${activeLeg.arrival.timeRemaining} left`
                        : `${activeLeg.progressPercent}%`}
                    </span>
                  </div>

                  <div className="relative my-4 flex items-center">
                    {/* Background Track */}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
                      <div
                        style={{ width: `${activeLeg.progressPercent}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 transition-all duration-700"
                      />
                    </div>

                    {/* Origin Dot */}
                    <span className="absolute left-0 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-amber-300 bg-stone-900" />

                    {/* Live Blinking Plane Beacon */}
                    <div
                      style={{
                        left: `${Math.max(
                          8,
                          Math.min(92, activeLeg.progressPercent)
                        )}%`,
                      }}
                      className="absolute -translate-x-1/2 transition-all duration-700"
                    >
                      <LiveFlightBeaconIcon
                        size="sm"
                        active={
                          activeLeg.statusTone === "in_air" ||
                          activeLeg.statusTone === "delayed"
                        }
                      />
                    </div>

                    {/* Destination Dot */}
                    <span
                      className={`absolute right-0 h-3.5 w-3.5 translate-x-1/2 rounded-full border-2 ${
                        activeLeg.statusTone === "arrived"
                          ? "border-emerald-300 bg-emerald-400"
                          : "border-stone-400 bg-stone-900"
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <span>
                      {activeLeg.departure.terminal
                        ? `Dep Terminal ${activeLeg.departure.terminal}`
                        : "Terminal TBA"}
                    </span>
                    <span>
                      {activeLeg.arrival.terminal
                        ? `Arr Terminal ${activeLeg.arrival.terminal}`
                        : "Terminal TBA"}
                    </span>
                  </div>
                </div>

                {/* Destination Airport */}
                <div className="sm:text-right">
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-300/90">
                    Destination · Arrival
                  </p>
                  <div className="mt-1 flex items-baseline gap-2 sm:justify-end">
                    <span className="font-mono text-3xl font-black tracking-tight text-white sm:text-4xl">
                      {activeLeg.arrival.airportCode}
                    </span>
                    {activeLeg.arrival.airportCountryCode && (
                      <span className="rounded bg-white/12 px-1.5 py-0.5 font-mono text-[10px] font-bold text-stone-300">
                        {activeLeg.arrival.airportCountryCode}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm font-bold text-stone-200">
                    {activeLeg.arrival.airportCity}
                  </p>
                  <p className="truncate text-xs text-stone-400">
                    {activeLeg.arrival.airport}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DEPARTURE & ARRIVAL TERMINAL / GATE / BAGGAGE TELEMETRY CARDS */}
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
            {/* DEPARTURE DETAILS CARD */}
            <div className="rounded-2xl border border-line bg-subcard/65 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/16 text-orange-700 dark:text-amber-300">
                    <PlaneIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                      Departure Airport
                    </p>
                    <h3 className="text-base font-black text-ink">
                      {activeLeg.departure.airportCity} (
                      {activeLeg.departure.airportCode})
                    </h3>
                  </div>
                </div>

                <span className="rounded-xl border border-orange-500/30 bg-orange-500/14 px-3 py-1 font-mono text-xs font-black text-orange-800 dark:text-amber-300">
                  {activeLeg.departure.terminal
                    ? `Terminal ${activeLeg.departure.terminal}`
                    : "Term TBA"}
                </span>
              </div>

              <p className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
                <MapPinIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
                <span>{activeLeg.departure.airport}</span>
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-line bg-card p-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted">
                    Scheduled Dep
                  </p>
                  <p className="mt-1 font-mono text-sm font-black text-ink sm:text-base">
                    {activeLeg.departure.scheduledTime ?? "TBA"}
                  </p>
                </div>

                <div className="rounded-xl border border-line bg-card p-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted">
                    Estimated / Actual
                  </p>
                  <p className="mt-1 font-mono text-sm font-black text-orange-700 dark:text-amber-300 sm:text-base">
                    {activeLeg.departure.estimatedTime ??
                      activeLeg.departure.offGroundTime ??
                      activeLeg.departure.scheduledTime ??
                      "On Schedule"}
                  </p>
                </div>
              </div>

              {/* Gate, Pushback & Off-Ground Badges */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-line bg-card px-2 py-2">
                  <p className="text-[10px] font-bold uppercase text-ink-muted">
                    Boarding Gate
                  </p>
                  <p className="mt-0.5 font-mono text-xs font-black text-ink">
                    {activeLeg.departure.gate ?? "TBA"}
                  </p>
                </div>

                <div className="rounded-xl border border-line bg-card px-2 py-2">
                  <p className="text-[10px] font-bold uppercase text-ink-muted">
                    Out-Gate
                  </p>
                  <p className="mt-0.5 font-mono text-xs font-black text-ink">
                    {activeLeg.departure.outGateTime ?? "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-line bg-card px-2 py-2">
                  <p className="text-[10px] font-bold uppercase text-ink-muted">
                    Takeoff
                  </p>
                  <p className="mt-0.5 font-mono text-xs font-black text-ink">
                    {activeLeg.departure.offGroundTime ?? "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* ARRIVAL DETAILS CARD */}
            <div className="rounded-2xl border border-line bg-subcard/65 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/16 text-emerald-700 dark:text-emerald-300">
                    <CheckCircleIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                      Arrival Airport
                    </p>
                    <h3 className="text-base font-black text-ink">
                      {activeLeg.arrival.airportCity} (
                      {activeLeg.arrival.airportCode})
                    </h3>
                  </div>
                </div>

                <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/14 px-3 py-1 font-mono text-xs font-black text-emerald-800 dark:text-emerald-300">
                  {activeLeg.arrival.terminal
                    ? `Terminal ${activeLeg.arrival.terminal}`
                    : "Term TBA"}
                </span>
              </div>

              <p className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
                <MapPinIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{activeLeg.arrival.airport}</span>
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-line bg-card p-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted">
                    Scheduled Arr
                  </p>
                  <p className="mt-1 font-mono text-sm font-black text-ink sm:text-base">
                    {activeLeg.arrival.scheduledTime ?? "TBA"}
                  </p>
                </div>

                <div className="rounded-xl border border-line bg-card p-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted">
                    Estimated / Actual
                  </p>
                  <p className="mt-1 font-mono text-sm font-black text-emerald-700 dark:text-emerald-300 sm:text-base">
                    {activeLeg.arrival.estimatedTime ??
                      activeLeg.arrival.inGateTime ??
                      activeLeg.arrival.onGroundTime ??
                      activeLeg.arrival.scheduledTime ??
                      "On Schedule"}
                  </p>
                </div>
              </div>

              {/* Arrival Gate, Baggage Claim & Touchdown Badges */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-line bg-card px-2 py-2">
                  <p className="text-[10px] font-bold uppercase text-ink-muted">
                    Arrival Gate
                  </p>
                  <p className="mt-0.5 font-mono text-xs font-black text-ink">
                    {activeLeg.arrival.gate ?? "TBA"}
                  </p>
                </div>

                <div className="rounded-xl border border-line bg-card px-2 py-2">
                  <p className="text-[10px] font-bold uppercase text-ink-muted">
                    Baggage Belt
                  </p>
                  <p className="mt-0.5 inline-flex items-center justify-center gap-1 font-mono text-xs font-black text-orange-700 dark:text-amber-300">
                    <LuggageIcon className="h-3 w-3" />
                    <span>{activeLeg.arrival.baggage ?? "TBA"}</span>
                  </p>
                </div>

                <div className="rounded-xl border border-line bg-card px-2 py-2">
                  <p className="text-[10px] font-bold uppercase text-ink-muted">
                    Touchdown
                  </p>
                  <p className="mt-0.5 font-mono text-xs font-black text-ink">
                    {activeLeg.arrival.onGroundTime ??
                      activeLeg.arrival.inGateTime ??
                      "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* INBOUND PREVIOUS AIRCRAFT + AIRLINE HELPLINE BAR */}
          {(activeLeg.previousFlight ||
            activeLeg.aircraft ||
            matchedAirlineContact) && (
            <div className="mx-4 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-subcard/55 px-4 py-3 text-xs sm:mx-6">
              <div className="flex flex-wrap items-center gap-4">
                {activeLeg.aircraft && (
                  <div className="flex items-center gap-2 font-semibold text-ink">
                    <SparklesIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                    <span>
                      Equipment:{" "}
                      <strong className="font-extrabold">
                        {activeLeg.aircraft.name}
                      </strong>
                    </span>
                  </div>
                )}

                {matchedAirlineContact && (
                  <div className="flex items-center gap-1.5 font-mono font-bold text-ink-soft">
                    <PhoneCallIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Helpline: {matchedAirlineContact}</span>
                  </div>
                )}
              </div>

              {activeLeg.previousFlight && (
                <button
                  type="button"
                  onClick={() => {
                    const prev = activeLeg.previousFlight;
                    if (!prev) return;
                    handleQuickPresetClick(
                      prev.airlineCode,
                      prev.airlineName ?? prev.airlineCode,
                      prev.flightNumber,
                      prev.departureDate ?? flightData.query.departureDate
                    );
                  }}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-orange-500/35 bg-orange-500/12 px-3 py-1.5 font-bold text-orange-800 transition hover:bg-orange-500/20 dark:text-amber-300"
                >
                  <AirlineLogo
                    code={activeLeg.previousFlight.airlineCode}
                    name={
                      activeLeg.previousFlight.airlineName ??
                      activeLeg.previousFlight.airlineCode
                    }
                    size="xs"
                  />
                  <span>
                    Track Inbound Aircraft ({activeLeg.previousFlight.airlineCode}{" "}
                    {activeLeg.previousFlight.flightNumber}
                    {activeLeg.previousFlight.departureAirport
                      ? ` from ${activeLeg.previousFlight.departureAirport}`
                      : ""}
                    )
                  </span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {/* ACTION TOOLBAR FOOTER */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 border-t border-line bg-band px-4 py-3.5 text-xs sm:px-6">
            <div className="flex items-center gap-2 text-ink-muted">
              <ClockIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
              <span>Synced: {flightData.fetchedAtIst} IST</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setAutoRefresh((prev) => !prev)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 font-bold transition ${
                  autoRefresh
                    ? "border-emerald-500/45 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                    : "border-line bg-subcard text-ink-soft hover:text-ink"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    autoRefresh
                      ? "ta-led-blink bg-emerald-500"
                      : "bg-stone-400"
                  }`}
                />
                <span>Auto 30s</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  void executeFlightLookup(
                    flightData.query.airlineCode,
                    flightData.query.flightNumber,
                    flightData.query.departureDate,
                    { pushUrl: false }
                  )
                }
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-line bg-subcard px-3 py-1.5 font-bold text-ink transition hover:border-orange-500"
              >
                <RefreshIcon
                  className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={() => void handleCopySummary()}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-line bg-subcard px-3 py-1.5 font-bold text-ink transition hover:border-orange-500"
              >
                <CopyIcon className="h-3.5 w-3.5" />
                <span>{copiedSummary ? "Copied!" : "Copy Status"}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="hidden cursor-pointer items-center gap-1.5 rounded-xl border border-line bg-subcard px-3 py-1.5 font-bold text-ink transition hover:border-orange-500 sm:inline-flex"
              >
                <PrinterIcon className="h-3.5 w-3.5" />
                <span>Print</span>
              </button>

              <Link
                href={`/api/flights/${encodeURIComponent(
                  flightData.query.airlineCode
                )}/${encodeURIComponent(
                  flightData.query.flightNumber
                )}?departureDate=${encodeURIComponent(
                  flightData.query.departureDate
                )}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-subcard px-3 py-1.5 font-mono font-bold text-orange-700 transition hover:border-orange-500 dark:text-amber-300"
              >
                <CodeIcon className="h-3.5 w-3.5" />
                <span>JSON API</span>
              </Link>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}

