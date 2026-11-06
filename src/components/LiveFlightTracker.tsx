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
  ChevronDownIcon,
  ClockIcon,
  CloseIcon,
  CodeIcon,
  CopyIcon,
  LiveFlightBeaconIcon,
  LuggageIcon,
  PhoneCallIcon,
  PlaneIcon,
  PrinterIcon,
  RefreshIcon,
  SearchIcon,
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

function getStatusPillStyle(tone: FlightLifecycleTone): string {
  switch (tone) {
    case "in_air":
      return "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
    case "arrived":
      return "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
    case "delayed":
      return "border-amber-500/35 bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300";
    case "cancelled":
      return "border-rose-500/35 bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300";
    default:
      return "border-blue-500/30 bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300";
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
    return POPULAR_AIRLINES[0];
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

  const [flightNumberInput, setFlightNumberInput] = useState(urlFlightNo);
  const [selectedDate, setSelectedDate] = useState(urlDate);
  const effectiveDate = selectedDate || todayIst;

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

  const displayedAirlines = useMemo(() => {
    const q = airlineSearchText.trim();
    if (!q) return POPULAR_AIRLINES;
    if (remoteAirlines !== null) return remoteAirlines;
    const lower = q.toLowerCase();
    return POPULAR_AIRLINES.filter(
      (a) =>
        a.code.toLowerCase().includes(lower) ||
        a.name.toLowerCase().includes(lower) ||
        (a.aliasName?.toLowerCase().includes(lower) ?? false)
    );
  }, [airlineSearchText, remoteAirlines]);

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

  useEffect(() => {
    const trimmed = airlineSearchText.trim();
    if (!isAirlineDropdownOpen || trimmed.length < 1) return;

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
    }, 180);

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
        setErrorMsg("Please select an airline from the Airline dropdown.");
        setErrorHint("Search by airline name (IndiGo, Air India, Akasa) or code.");
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
              `No flight schedule found for ${finalAirline} ${finalFlightNo} on ${finalDate}.`
          );
          setErrorHint(
            json.error?.hint ??
              "Try changing Departure Date to Yesterday, Today, or Tomorrow."
          );
          return;
        }

        setFlightData(json.data);
        setSelectedLegIndex(0);
        setErrorMsg(null);
        setErrorHint(null);

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
            "Unable to reach live flight status right now. Please try again."
          );
          setErrorHint("Check your connection and click Search.");
        }
      } finally {
        if (!options?.silent) {
          setLoading(false);
        }
      }
    },
    [router]
  );

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
      if (known) setSelectedAirline(known);
      return executeFlightLookup(urlAirline, urlFlightNo, resolvedDate, {
        pushUrl: false,
      });
    });
  }, [urlAirline, urlFlightNo, urlDate, executeFlightLookup]);

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
    const fullMatch = upper.match(
      /^([A-Z0-9]{2}|[A-Z]{3})[\s-]+(\d{1,4}[A-Z]?)$/
    );
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
      `${activeLeg.titleMain} — ${activeLeg.flightStatus}`,
      `Date: ${formatFriendlyDateLabel(flightData.query.departureDate)}`,
      `Departure: ${activeLeg.departure.airportCity} (${activeLeg.departure.airportCode})${
        activeLeg.departure.terminal ? ` · T${activeLeg.departure.terminal}` : ""
      }${activeLeg.departure.gate ? ` · Gate ${activeLeg.departure.gate}` : ""} — ${
        activeLeg.departure.estimatedTime ??
        activeLeg.departure.scheduledTime ??
        "TBA"
      }`,
      `Arrival: ${activeLeg.arrival.airportCity} (${activeLeg.arrival.airportCode})${
        activeLeg.arrival.terminal ? ` · T${activeLeg.arrival.terminal}` : ""
      }${activeLeg.arrival.gate ? ` · Gate ${activeLeg.arrival.gate}` : ""}${
        activeLeg.arrival.baggage ? ` · Belt ${activeLeg.arrival.baggage}` : ""
      } — ${
        activeLeg.arrival.estimatedTime ??
        activeLeg.arrival.scheduledTime ??
        "TBA"
      }`,
      activeLeg.aircraft ? `Aircraft: ${activeLeg.aircraft.name}` : "",
      `${window.location.origin}/air/flight-status?airline=${activeLeg.airlineCode}&flight=${activeLeg.flightNumber}&date=${flightData.query.departureDate}`,
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
    <div className="space-y-5">
      {/* CLEAN SEGMENTED SEARCH BAR (ixigo / Goibibo style) */}
      <div className="rounded-2xl border border-line bg-card p-4 shadow-md shadow-slate-900/5 dark:shadow-black/30 sm:p-5">
        <form onSubmit={handleFormSubmit} className="space-y-3.5">
          <div className="grid divide-y divide-line rounded-xl border border-line-strong bg-input lg:grid-cols-[1.35fr_0.95fr_0.85fr_auto] lg:divide-x lg:divide-y-0">
            {/* 1. AIRLINE SEARCH CELL */}
            <div ref={airlineBoxRef} className="relative px-3.5 py-2.5">
              <label
                htmlFor="airline-search-input"
                className="block text-[11px] font-semibold uppercase tracking-wide text-ink-muted"
              >
                Airline
              </label>

              <div className="mt-1 flex items-center gap-2.5">
                {selectedAirline && !isAirlineDropdownOpen ? (
                  <AirlineLogo
                    code={selectedAirline.code}
                    name={selectedAirline.name}
                    size="xs"
                  />
                ) : (
                  <SearchIcon className="h-4 w-4 shrink-0 text-[#1956b4]" />
                )}

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
                  placeholder="Search airline (IndiGo, Air India, QP...)"
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
                  className="w-full bg-transparent text-sm font-bold text-ink placeholder:font-normal placeholder:text-ink-muted focus:outline-none sm:text-base"
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
                  className="text-ink-muted hover:text-ink"
                >
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform ${
                      isAirlineDropdownOpen ? "rotate-180 text-[#1956b4]" : ""
                    }`}
                  />
                </button>
              </div>

              {/* AIRLINE DROPDOWN WITH DAILY LOCAL LOGOS */}
              {isAirlineDropdownOpen && (
                <div
                  id="airline-search-listbox"
                  role="listbox"
                  className="absolute top-full right-0 left-0 z-50 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-line-strong bg-card p-1.5 shadow-xl"
                >
                  <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-semibold text-ink-muted">
                    <span>
                      {airlineSearchText.trim()
                        ? airlineSearching
                          ? "Searching airlines..."
                          : `Matching Airlines (${displayedAirlines.length})`
                        : "Popular Airlines"}
                    </span>
                    <span>Code</span>
                  </div>

                  {displayedAirlines.length === 0 && !airlineSearching ? (
                    <div className="px-3 py-4 text-center text-xs text-ink-muted">
                      No airlines found for &ldquo;{airlineSearchText}&rdquo;.
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
                            className={`flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left transition ${
                              isHighlighted || isSelected
                                ? "bg-blue-50 text-ink dark:bg-blue-500/15"
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
                                <p className="truncate text-sm font-semibold text-ink">
                                  {item.name}
                                </p>
                                {(item.aliasName || phoneDisplay) && (
                                  <p className="truncate text-[11px] text-ink-muted">
                                    {item.aliasName
                                      ? `${item.aliasName}${phoneDisplay ? ` · ${phoneDisplay}` : ""}`
                                      : phoneDisplay}
                                  </p>
                                )}
                              </div>
                            </div>

                            <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-[#1956b4] dark:bg-slate-800 dark:text-blue-300">
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

            {/* 2. FLIGHT NUMBER CELL */}
            <div className="px-3.5 py-2.5">
              <label
                htmlFor="flight-number-input"
                className="block text-[11px] font-semibold uppercase tracking-wide text-ink-muted"
              >
                Flight Number
              </label>

              <div className="mt-1 flex items-center gap-2">
                {selectedAirline && (
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-bold text-ink-soft dark:bg-slate-800">
                    {selectedAirline.code}
                  </span>
                )}

                <input
                  ref={flightNoInputRef}
                  id="flight-number-input"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  value={flightNumberInput}
                  onChange={(e) => handleFlightInputChange(e.target.value)}
                  placeholder="e.g. 2045 or 562"
                  className="w-full bg-transparent text-sm font-bold text-ink placeholder:font-normal placeholder:text-ink-muted focus:outline-none sm:text-base"
                />

                {flightNumberInput && (
                  <button
                    type="button"
                    aria-label="Clear flight number"
                    onClick={() => setFlightNumberInput("")}
                    className="text-ink-muted hover:text-ink"
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 3. DEPARTURE DATE CELL */}
            <div className="px-3.5 py-2.5">
              <label
                htmlFor="flight-departure-date"
                className="block text-[11px] font-semibold uppercase tracking-wide text-ink-muted"
              >
                Departure Date
              </label>
              <input
                id="flight-departure-date"
                type="date"
                value={effectiveDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="mt-1 w-full bg-transparent text-sm font-bold text-ink focus:outline-none sm:text-base"
              />
            </div>

            {/* 4. SUBMIT BUTTON */}
            <div className="flex items-stretch p-1.5">
              <button
                type="submit"
                disabled={loading}
                className="ta-btn-primary inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-7 py-3 text-sm font-bold uppercase tracking-wide disabled:opacity-65 lg:w-auto"
              >
                {loading ? (
                  <>
                    <RefreshIcon className="h-4 w-4 animate-spin" />
                    <span>Searching</span>
                  </>
                ) : (
                  <span>Search Flight</span>
                )}
              </button>
            </div>
          </div>

          {/* Clean Quick Date & Popular Presets Bar */}
          <div className="flex flex-col justify-between gap-2.5 pt-0.5 sm:flex-row sm:items-center">
            {todayIst && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="font-medium text-ink-muted">Day:</span>
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
                      className={`cursor-pointer rounded-full px-3 py-1 font-semibold transition ${
                        active
                          ? "bg-[#1956b4] text-white"
                          : "border border-line bg-subcard text-ink-soft hover:text-ink"
                      }`}
                    >
                      {pill.label}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="ta-no-scrollbar flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="shrink-0 font-medium text-ink-muted">
                Quick check:
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
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-subcard px-2.5 py-1 font-semibold text-ink transition hover:border-[#1956b4]"
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

          {/* Recent Flight Lookups */}
          {recentFlights.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2.5 text-xs">
              <div className="ta-no-scrollbar flex items-center gap-1.5 overflow-x-auto">
                <span className="shrink-0 font-medium text-ink-muted">
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
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-subcard px-2.5 py-1 font-medium text-ink transition hover:border-[#1956b4]"
                  >
                    <AirlineLogo code={rec.airlineCode} size="xs" />
                    <span className="font-semibold">
                      {rec.airlineCode} {rec.flightNumber}
                    </span>
                    <span className="text-ink-muted">({rec.route})</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => saveRecentFlightsToStorage([])}
                className="cursor-pointer text-xs font-medium text-ink-muted hover:text-rose-600"
              >
                Clear
              </button>
            </div>
          )}
        </form>

        {errorMsg && (
          <div
            role="alert"
            className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-50 p-3.5 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-200"
          >
            <AlertCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <div>
              <p className="font-bold">{errorMsg}</p>
              {errorHint && (
                <p className="mt-0.5 text-xs opacity-90">{errorHint}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* LOADING SKELETON */}
      {loading && !flightData && (
        <div className="animate-pulse rounded-2xl border border-line bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-subcard" />
            <div className="space-y-2">
              <div className="h-4 w-48 rounded bg-subcard" />
              <div className="h-3 w-32 rounded bg-subcard" />
            </div>
          </div>
          <div className="mt-6 h-28 rounded-xl bg-subcard" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="h-32 rounded-xl bg-subcard" />
            <div className="h-32 rounded-xl bg-subcard" />
          </div>
        </div>
      )}

      {/* CLEAN IXIGO / GOIBIBO STYLE FLIGHT STATUS RESULT CARD */}
      {flightData && activeLeg && (
        <article
          aria-label={`Live flight status for ${activeLeg.titleMain}`}
          className="overflow-hidden rounded-2xl border border-line bg-card shadow-md shadow-slate-900/5 dark:shadow-black/35"
        >
          {/* Clean Top Flight Summary Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <AirlineLogo
                code={activeLeg.airlineCode}
                name={activeLeg.airlineName}
                size="md"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-extrabold text-ink sm:text-xl">
                    {activeLeg.titleMain}
                  </h2>
                  <span className="rounded bg-subcard px-2 py-0.5 text-xs font-semibold text-ink-soft">
                    {formatFriendlyDateLabel(flightData.query.departureDate)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {activeLeg.aircraft
                    ? `${activeLeg.aircraft.name}${
                        activeLeg.aircraft.code
                          ? ` (${activeLeg.aircraft.code})`
                          : ""
                      }`
                    : "Scheduled Commercial Flight"}
                  {activeLeg.titleSub ? ` · ${activeLeg.titleSub}` : ""}
                </p>
              </div>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${getStatusPillStyle(
                activeLeg.statusTone
              )}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  activeLeg.statusTone === "in_air"
                    ? "ta-led-blink bg-emerald-500"
                    : activeLeg.statusTone === "arrived"
                      ? "bg-emerald-500"
                      : activeLeg.statusTone === "delayed"
                        ? "bg-amber-500"
                        : activeLeg.statusTone === "cancelled"
                          ? "bg-rose-500"
                          : "bg-[#1956b4]"
                }`}
              />
              <span>{activeLeg.flightStatus}</span>
            </span>
          </div>

          {/* Multi-Leg Segment Switcher */}
          {flightData.legs.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 border-b border-line bg-subcard px-4 py-2.5 text-xs sm:px-6">
              <span className="font-semibold text-ink-muted">Segments:</span>
              {flightData.legs.map((leg, idx) => (
                <button
                  key={`${leg.departure.airportCode}-${leg.arrival.airportCode}-${idx}`}
                  type="button"
                  onClick={() => setSelectedLegIndex(idx)}
                  className={`cursor-pointer rounded-lg px-3 py-1 font-semibold transition ${
                    selectedLegIndex === idx
                      ? "bg-[#1956b4] text-white"
                      : "bg-card text-ink-soft hover:text-ink"
                  }`}
                >
                  {leg.departure.airportCode} → {leg.arrival.airportCode}
                </button>
              ))}
            </div>
          )}

          {/* MAIN HORIZONTAL ROUTE & PROGRESS STRIP */}
          <div className="bg-subcard/70 px-4 py-5 sm:px-6 sm:py-6">
            <div className="grid items-center gap-5 sm:grid-cols-[1fr_1.4fr_1fr]">
              {/* Origin */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-extrabold text-ink sm:text-3xl">
                    {activeLeg.departure.airportCode}
                  </span>
                  <span className="text-sm font-bold text-ink-soft">
                    {activeLeg.departure.airportCity}
                  </span>
                </div>
                <p className="mt-1 font-mono text-base font-bold text-[#1956b4] dark:text-blue-300 sm:text-lg">
                  {activeLeg.departure.estimatedTime ??
                    activeLeg.departure.scheduledTime ??
                    "TBA"}
                </p>
                <p className="mt-0.5 truncate text-xs text-ink-muted">
                  {activeLeg.departure.airport}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-semibold">
                  <span className="rounded bg-card px-2 py-0.5 text-ink ring-1 ring-line">
                    {activeLeg.departure.terminal
                      ? `Terminal ${activeLeg.departure.terminal}`
                      : "Terminal TBA"}
                  </span>
                  <span className="rounded bg-card px-2 py-0.5 text-ink ring-1 ring-line">
                    {activeLeg.departure.gate
                      ? `Gate ${activeLeg.departure.gate}`
                      : "Gate TBA"}
                  </span>
                </div>
              </div>

              {/* Center Flight Progress Line */}
              <div className="px-2">
                <div className="flex items-center justify-between text-xs font-medium text-ink-muted">
                  <span>{activeLeg.departure.duration ?? "Non-stop"}</span>
                  {activeLeg.arrival.timeRemaining && (
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                      {activeLeg.arrival.timeRemaining} left
                    </span>
                  )}
                </div>

                <div className="relative my-4 flex items-center">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      style={{ width: `${activeLeg.progressPercent}%` }}
                      className="h-full rounded-full bg-[#1956b4] transition-all duration-500"
                    />
                  </div>

                  <span className="absolute left-0 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-[#1956b4] bg-card" />

                  <div
                    style={{
                      left: `${Math.max(
                        8,
                        Math.min(92, activeLeg.progressPercent)
                      )}%`,
                    }}
                    className="absolute -translate-x-1/2 transition-all duration-500"
                  >
                    <LiveFlightBeaconIcon
                      size="sm"
                      active={activeLeg.statusTone === "in_air"}
                    />
                  </div>

                  <span
                    className={`absolute right-0 h-3 w-3 translate-x-1/2 rounded-full border-2 ${
                      activeLeg.statusTone === "arrived"
                        ? "border-emerald-600 bg-emerald-500"
                        : "border-slate-400 bg-card"
                    }`}
                  />
                </div>

                <p className="text-center text-[11px] font-medium text-ink-muted">
                  {activeLeg.statusTone === "in_air"
                    ? `Airborne · ${activeLeg.progressPercent}% completed`
                    : activeLeg.statusTone === "arrived"
                      ? "Arrived at destination"
                      : "Scheduled departure"}
                </p>
              </div>

              {/* Destination */}
              <div className="sm:text-right">
                <div className="flex items-baseline gap-2 sm:justify-end">
                  <span className="font-mono text-2xl font-extrabold text-ink sm:text-3xl">
                    {activeLeg.arrival.airportCode}
                  </span>
                  <span className="text-sm font-bold text-ink-soft">
                    {activeLeg.arrival.airportCity}
                  </span>
                </div>
                <p className="mt-1 font-mono text-base font-bold text-emerald-700 dark:text-emerald-300 sm:text-lg">
                  {activeLeg.arrival.estimatedTime ??
                    activeLeg.arrival.scheduledTime ??
                    "TBA"}
                </p>
                <p className="mt-0.5 truncate text-xs text-ink-muted">
                  {activeLeg.arrival.airport}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-semibold sm:justify-end">
                  <span className="rounded bg-card px-2 py-0.5 text-ink ring-1 ring-line">
                    {activeLeg.arrival.terminal
                      ? `Terminal ${activeLeg.arrival.terminal}`
                      : "Terminal TBA"}
                  </span>
                  <span className="rounded bg-card px-2 py-0.5 text-ink ring-1 ring-line">
                    {activeLeg.arrival.gate
                      ? `Gate ${activeLeg.arrival.gate}`
                      : "Gate TBA"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[#1956b4] ring-1 ring-blue-500/25 dark:bg-blue-500/15 dark:text-blue-300">
                    <LuggageIcon className="h-3 w-3" />
                    <span>
                      Belt {activeLeg.arrival.baggage ?? "TBA"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CLEAN 2-COLUMN OPERATIONAL DETAILS */}
          <div className="grid divide-y divide-line border-t border-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {/* Departure Table */}
            <div className="p-4 sm:p-5">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-muted">
                <PlaneIcon className="h-3.5 w-3.5 text-[#1956b4]" />
                <span>
                  Departure · {activeLeg.departure.airportCity} (
                  {activeLeg.departure.airportCode})
                </span>
              </h3>
              <dl className="mt-3 divide-y divide-line text-xs sm:text-sm">
                <div className="flex justify-between py-2">
                  <dt className="text-ink-muted">Scheduled Time</dt>
                  <dd className="font-mono font-semibold text-ink">
                    {activeLeg.departure.scheduledTime ?? "TBA"}
                  </dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-ink-muted">Estimated / Actual</dt>
                  <dd className="font-mono font-bold text-[#1956b4] dark:text-blue-300">
                    {activeLeg.departure.estimatedTime ??
                      activeLeg.departure.offGroundTime ??
                      activeLeg.departure.scheduledTime ??
                      "On Time"}
                  </dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-ink-muted">Terminal &amp; Gate</dt>
                  <dd className="font-semibold text-ink">
                    T{activeLeg.departure.terminal ?? "—"} · Gate{" "}
                    {activeLeg.departure.gate ?? "TBA"}
                  </dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-ink-muted">Out-Gate / Takeoff</dt>
                  <dd className="font-mono text-ink-soft">
                    {activeLeg.departure.outGateTime ?? "—"} /{" "}
                    {activeLeg.departure.offGroundTime ?? "—"}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Arrival Table */}
            <div className="p-4 sm:p-5">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-muted">
                <LuggageIcon className="h-3.5 w-3.5 text-emerald-600" />
                <span>
                  Arrival · {activeLeg.arrival.airportCity} (
                  {activeLeg.arrival.airportCode})
                </span>
              </h3>
              <dl className="mt-3 divide-y divide-line text-xs sm:text-sm">
                <div className="flex justify-between py-2">
                  <dt className="text-ink-muted">Scheduled Time</dt>
                  <dd className="font-mono font-semibold text-ink">
                    {activeLeg.arrival.scheduledTime ?? "TBA"}
                  </dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-ink-muted">Estimated / Actual</dt>
                  <dd className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    {activeLeg.arrival.estimatedTime ??
                      activeLeg.arrival.inGateTime ??
                      activeLeg.arrival.onGroundTime ??
                      activeLeg.arrival.scheduledTime ??
                      "On Time"}
                  </dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-ink-muted">Terminal, Gate &amp; Belt</dt>
                  <dd className="font-semibold text-ink">
                    T{activeLeg.arrival.terminal ?? "—"} · Gate{" "}
                    {activeLeg.arrival.gate ?? "TBA"} · Belt{" "}
                    {activeLeg.arrival.baggage ?? "TBA"}
                  </dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-ink-muted">Touchdown / In-Gate</dt>
                  <dd className="font-mono text-ink-soft">
                    {activeLeg.arrival.onGroundTime ?? "—"} /{" "}
                    {activeLeg.arrival.inGateTime ?? "—"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* INBOUND AIRCRAFT + HELPLINE STRIP */}
          {(activeLeg.previousFlight || matchedAirlineContact) && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-subcard/60 px-4 py-3 text-xs sm:px-6">
              {matchedAirlineContact ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-ink-soft">
                  <PhoneCallIcon className="h-3.5 w-3.5 text-[#1956b4]" />
                  <span>Airline Helpline:</span>
                  <strong className="font-mono text-ink">
                    {matchedAirlineContact}
                  </strong>
                </span>
              ) : (
                <span />
              )}

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
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-50 px-3 py-1.5 font-semibold text-[#1956b4] transition hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300"
                >
                  <AirlineLogo
                    code={activeLeg.previousFlight.airlineCode}
                    size="xs"
                  />
                  <span>
                    Track Inbound Plane ({activeLeg.previousFlight.airlineCode}{" "}
                    {activeLeg.previousFlight.flightNumber})
                  </span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {/* CLEAN UTILITY FOOTER */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 border-t border-line bg-card px-4 py-3 text-xs sm:px-6">
            <span className="inline-flex items-center gap-1.5 text-ink-muted">
              <ClockIcon className="h-3.5 w-3.5" />
              <span>Updated {flightData.fetchedAtIst} IST</span>
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setAutoRefresh((prev) => !prev)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-semibold transition ${
                  autoRefresh
                    ? "border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                    : "border-line bg-subcard text-ink-soft hover:text-ink"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    autoRefresh ? "ta-led-blink bg-emerald-500" : "bg-slate-400"
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
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-subcard px-2.5 py-1.5 font-semibold text-ink transition hover:border-[#1956b4]"
              >
                <RefreshIcon
                  className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={() => void handleCopySummary()}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-subcard px-2.5 py-1.5 font-semibold text-ink transition hover:border-[#1956b4]"
              >
                <CopyIcon className="h-3.5 w-3.5" />
                <span>{copiedSummary ? "Copied" : "Copy"}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="hidden cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-subcard px-2.5 py-1.5 font-semibold text-ink transition hover:border-[#1956b4] sm:inline-flex"
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
                className="inline-flex items-center gap-1 rounded-lg border border-line bg-subcard px-2.5 py-1.5 font-mono font-semibold text-[#1956b4] transition hover:border-[#1956b4] dark:text-blue-300"
              >
                <CodeIcon className="h-3.5 w-3.5" />
                <span>API</span>
              </Link>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
