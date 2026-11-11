"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  type AirlineSearchItem,
  type OwnedAirlineSearchApiResponse,
  POPULAR_AIRLINES,
  POPULAR_LIVE_FLIGHTS,
  parseFlightInput,
} from "@/lib/flight-types";
import {
  buildTrainLiveStatusPath,
  getTodayIstDateString,
  POPULAR_LIVE_TRAINS,
  type OwnedTrainSearchApiResponse,
  type TrainSearchItem,
} from "@/lib/live-train-types";
import { AirlineLogo } from "./AirlineLogo";
import {
  ChevronDownIcon,
  CloseIcon,
  HotelIcon,
  LuggageIcon,
  PlaneIcon,
  SearchIcon,
  TicketIcon,
  TrainIcon,
} from "./Icons";

function noopSubscribe() {
  return () => {};
}

type SearchMode = "flight" | "train" | "pnr" | "hotel";

export function HeroSearchWidget() {
  const router = useRouter();
  const todayIst = useSyncExternalStore(
    noopSubscribe,
    getTodayIstDateString,
    () => ""
  );

  const [mode, setMode] = useState<SearchMode>("flight");

  // Flight state
  const [selectedAirline, setSelectedAirline] = useState<AirlineSearchItem>(
    POPULAR_AIRLINES[0]
  );
  const [airlineQuery, setAirlineQuery] = useState("");
  const [airlineDropdownOpen, setAirlineDropdownOpen] = useState(false);
  const [remoteAirlines, setRemoteAirlines] = useState<
    AirlineSearchItem[] | null
  >(null);
  const [flightNumber, setFlightNumber] = useState("");
  const [flightDate, setFlightDate] = useState("");
  const airlineBoxRef = useRef<HTMLDivElement>(null);

  // Train & PNR state
  const [trainQuery, setTrainQuery] = useState("");
  const [trainDate, setTrainDate] = useState("");
  const [remoteTrains, setRemoteTrains] = useState<TrainSearchItem[] | null>(
    null
  );
  const [trainDropdownOpen, setTrainDropdownOpen] = useState(false);
  const trainBoxRef = useRef<HTMLDivElement>(null);
  const [pnr, setPnr] = useState("");

  // Hotel quick GST state
  const [roomRate, setRoomRate] = useState("4500");
  const [nights, setNights] = useState("2");

  const [validationMsg, setValidationMsg] = useState("");

  const airlineSuggestions = useMemo(() => {
    const trimmed = airlineQuery.trim();
    if (!trimmed) return POPULAR_AIRLINES.slice(0, 8);
    if (remoteAirlines !== null) return remoteAirlines.slice(0, 10);
    const lower = trimmed.toLowerCase();
    return POPULAR_AIRLINES.filter(
      (a) =>
        a.code.toLowerCase().includes(lower) ||
        a.name.toLowerCase().includes(lower) ||
        (a.aliasName?.toLowerCase().includes(lower) ?? false)
    ).slice(0, 8);
  }, [airlineQuery, remoteAirlines]);

  const trainSuggestions = useMemo(() => {
    const trimmed = trainQuery.trim();
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
  }, [trainQuery, remoteTrains]);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (
        airlineBoxRef.current &&
        !airlineBoxRef.current.contains(e.target as Node)
      ) {
        setAirlineDropdownOpen(false);
        setAirlineQuery("");
      }
      if (
        trainBoxRef.current &&
        !trainBoxRef.current.contains(e.target as Node)
      ) {
        setTrainDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  useEffect(() => {
    const trimmed = airlineQuery.trim();
    if (!airlineDropdownOpen || trimmed.length < 1) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/flights/airlines?searchTerm=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const json = (await res.json()) as OwnedAirlineSearchApiResponse;
          if (Array.isArray(json.data)) {
            setRemoteAirlines(json.data.slice(0, 10));
          }
        }
      } catch {
        // Ignore aborted lookups
      }
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [airlineQuery, airlineDropdownOpen]);

  useEffect(() => {
    const trimmed = trainQuery.trim();
    if (!trainDropdownOpen || trimmed.length < 2) return;
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
        // Ignore aborted lookups
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trainQuery, trainDropdownOpen]);

  const navigateToFlight = (
    airlineCode: string,
    flightNum: string,
    explicitDate?: string
  ) => {
    const cleanDate =
      explicitDate && /^\d{4}-\d{2}-\d{2}$/.test(explicitDate)
        ? explicitDate
        : todayIst;
    const params = new URLSearchParams();
    params.set("airline", airlineCode);
    params.set("flight", flightNum);
    if (cleanDate) params.set("date", cleanDate);
    router.push(`/air/flight-status?${params.toString()}`);
  };

  const handleFlightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFlightInput(flightNumber);
    const code = parsed.extractedAirlineCode ?? selectedAirline.code;
    const num = parsed.extractedFlightNumber;
    if (!num || !/^\d{1,4}[A-Z]?$/.test(num)) {
      setValidationMsg("Please enter a valid flight number (e.g. 2045 or 562).");
      return;
    }
    navigateToFlight(code, num, flightDate || todayIst);
  };

  const navigateToTrain = (
    digits: string,
    explicitDate?: string,
    trainName?: string
  ) => {
    const cleanDate =
      explicitDate && /^\d{4}-\d{2}-\d{2}$/.test(explicitDate)
        ? explicitDate
        : "";
    const matchedName =
      trainName ||
      trainSuggestions.find((t) => t.trainNumber === digits)?.trainName;
    const targetUrl = buildTrainLiveStatusPath(digits, matchedName, cleanDate);
    router.push(targetUrl);
  };

  const handleTrainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = trainQuery.replace(/\D/g, "").slice(0, 5);
    if (digits.length >= 3) {
      navigateToTrain(digits, trainDate);
      return;
    }
    if (trainSuggestions.length > 0 && trainQuery.trim().length >= 2) {
      navigateToTrain(
        trainSuggestions[0].trainNumber,
        trainDate,
        trainSuggestions[0].trainName
      );
      return;
    }
    setValidationMsg("Please enter a valid 4 or 5-digit train number or name.");
  };

  const handlePnrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pnr.replace(/\D/g, "");
    if (clean.length !== 10) {
      setValidationMsg("Please enter a valid 10-digit numeric PNR number.");
      return;
    }
    router.push(`/rail/pnr-status?pnr=${clean}`);
  };

  const numericRate = Math.max(0, Number(roomRate) || 0);
  const numericNights = Math.max(1, Number(nights) || 1);
  const gstRate = numericRate > 7500 ? 18 : numericRate > 1000 ? 12 : 0;
  const totalWithTax = Math.round(
    numericRate * numericNights * (1 + gstRate / 100)
  );

  const TABS: { id: SearchMode; label: string; icon: React.ReactNode }[] = [
    {
      id: "flight",
      label: "Flight Status",
      icon: <PlaneIcon className="h-4 w-4" />,
    },
    {
      id: "train",
      label: "Train Status",
      icon: <TrainIcon className="h-4 w-4" />,
    },
    {
      id: "pnr",
      label: "PNR Status",
      icon: <TicketIcon className="h-4 w-4" />,
    },
    {
      id: "hotel",
      label: "Hotel & Baggage",
      icon: <HotelIcon className="h-4 w-4" />,
    },
  ];

  return (
    <div className="rounded-2xl border border-line bg-card shadow-xl shadow-slate-900/10 dark:shadow-black/40">
      {/* Top OTA Service Tab Bar (ixigo / Goibibo style) */}
      <div className="ta-no-scrollbar flex items-center gap-1 overflow-x-auto border-b border-line px-3 pt-2.5 sm:gap-2 sm:px-6 sm:pt-3">
        {TABS.map((tab) => {
          const active = mode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setMode(tab.id);
                setValidationMsg("");
              }}
              className={`relative inline-flex shrink-0 cursor-pointer items-center gap-2 px-3.5 py-2.5 text-xs font-bold transition sm:px-4 sm:py-3 sm:text-sm ${
                active
                  ? "text-[#1956b4] dark:text-blue-400"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {active && (
                <span className="absolute right-0 bottom-0 left-0 h-[3px] rounded-t-full bg-[#fc6203]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Search Body */}
      <div className="p-4 sm:p-6">
        {/* 1. FLIGHT STATUS SEARCH */}
        {mode === "flight" && (
          <form onSubmit={handleFlightSubmit} className="space-y-3.5">
            <div className="grid divide-y divide-line rounded-xl border border-line-strong bg-input lg:grid-cols-[1.3fr_0.95fr_0.85fr_auto] lg:divide-x lg:divide-y-0">
              {/* Cell 1: Airline Search */}
              <div ref={airlineBoxRef} className="relative px-3.5 py-2.5">
                <label
                  htmlFor="hero-airline-input"
                  className="block text-[11px] font-semibold uppercase tracking-wide text-ink-muted"
                >
                  Airline
                </label>
                <div className="mt-1 flex items-center gap-2.5">
                  {!airlineDropdownOpen ? (
                    <AirlineLogo
                      code={selectedAirline.code}
                      name={selectedAirline.name}
                      size="xs"
                    />
                  ) : (
                    <SearchIcon className="h-4 w-4 shrink-0 text-[#1956b4]" />
                  )}
                  <input
                    id="hero-airline-input"
                    type="text"
                    autoComplete="off"
                    value={
                      airlineDropdownOpen
                        ? airlineQuery
                        : `${selectedAirline.name} (${selectedAirline.code})`
                    }
                    onFocus={() => {
                      setAirlineDropdownOpen(true);
                      setAirlineQuery("");
                      setRemoteAirlines(null);
                    }}
                    onChange={(e) => {
                      setAirlineQuery(e.target.value);
                      setRemoteAirlines(null);
                      setAirlineDropdownOpen(true);
                    }}
                    placeholder="Search airline (IndiGo, Air India, QP...)"
                    className="w-full bg-transparent text-sm font-bold text-ink placeholder:font-normal placeholder:text-ink-muted focus:outline-none sm:text-base"
                  />
                  <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink-muted" />
                </div>

                {airlineDropdownOpen && airlineSuggestions.length > 0 && (
                  <div className="absolute top-full right-0 left-0 z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-line-strong bg-card p-1.5 shadow-xl">
                    {airlineSuggestions.map((a, idx) => (
                      <button
                        key={`${a.code}-${idx}`}
                        type="button"
                        onClick={() => {
                          setSelectedAirline(a);
                          setAirlineDropdownOpen(false);
                          setAirlineQuery("");
                        }}
                        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition hover:bg-subcard"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <AirlineLogo code={a.code} name={a.name} size="xs" />
                          <span className="truncate text-sm font-semibold text-ink">
                            {a.name}
                          </span>
                        </div>
                        <span className="shrink-0 rounded bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                          {a.code}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cell 2: Flight Number */}
              <div className="px-3.5 py-2.5">
                <label
                  htmlFor="hero-flight-no"
                  className="block text-[11px] font-semibold uppercase tracking-wide text-ink-muted"
                >
                  Flight Number
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-bold text-ink-soft dark:bg-slate-800">
                    {selectedAirline.code}
                  </span>
                  <input
                    id="hero-flight-no"
                    type="text"
                    autoComplete="off"
                    value={flightNumber}
                    onChange={(e) => {
                      setFlightNumber(e.target.value.toUpperCase());
                      if (validationMsg) setValidationMsg("");
                    }}
                    placeholder="e.g. 2045 or 562"
                    className="w-full bg-transparent text-sm font-bold text-ink placeholder:font-normal placeholder:text-ink-muted focus:outline-none sm:text-base"
                  />
                  {flightNumber && (
                    <button
                      type="button"
                      onClick={() => setFlightNumber("")}
                      aria-label="Clear flight number"
                      className="text-ink-muted hover:text-ink"
                    >
                      <CloseIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Cell 3: Departure Date */}
              <div className="px-3.5 py-2.5">
                <label
                  htmlFor="hero-flight-date"
                  className="block text-[11px] font-semibold uppercase tracking-wide text-ink-muted"
                >
                  Departure Date
                </label>
                <input
                  id="hero-flight-date"
                  type="date"
                  value={flightDate || todayIst}
                  onChange={(e) => setFlightDate(e.target.value)}
                  className="mt-1 w-full bg-transparent text-sm font-bold text-ink focus:outline-none sm:text-base"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-stretch p-1.5">
                <button
                  type="submit"
                  className="ta-btn-primary inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-7 py-3 text-sm font-bold uppercase tracking-wide lg:w-auto"
                >
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Clean Quick Flight Chips */}
            <div className="ta-no-scrollbar flex items-center gap-2 overflow-x-auto text-xs">
              <span className="shrink-0 font-medium text-ink-muted">
                Popular Flights:
              </span>
              {POPULAR_LIVE_FLIGHTS.slice(0, 5).map((f) => (
                <button
                  key={`${f.airlineCode}-${f.flightNumber}`}
                  type="button"
                  onClick={() => navigateToFlight(f.airlineCode, f.flightNumber)}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-subcard px-2.5 py-1 font-medium text-ink-soft transition hover:border-[#1956b4] hover:text-[#1956b4]"
                >
                  <AirlineLogo code={f.airlineCode} size="xs" />
                  <span className="font-semibold text-ink">
                    {f.airlineCode} {f.flightNumber}
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    {f.routeCodes}
                  </span>
                </button>
              ))}
            </div>
          </form>
        )}

        {/* 2. LIVE TRAIN STATUS SEARCH */}
        {mode === "train" && (
          <form onSubmit={handleTrainSubmit} className="space-y-3.5">
            <div className="grid divide-y divide-line rounded-xl border border-line-strong bg-input lg:grid-cols-[1.5fr_0.9fr_auto] lg:divide-x lg:divide-y-0">
              <div ref={trainBoxRef} className="relative px-3.5 py-2.5">
                <label
                  htmlFor="hero-train-input"
                  className="block text-[11px] font-semibold uppercase tracking-wide text-ink-muted"
                >
                  Train Number or Name
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <TrainIcon className="h-4 w-4 shrink-0 text-[#1956b4]" />
                  <input
                    id="hero-train-input"
                    type="text"
                    autoComplete="off"
                    value={trainQuery}
                    onFocus={() => setTrainDropdownOpen(true)}
                    onChange={(e) => {
                      setTrainQuery(e.target.value);
                      setRemoteTrains(null);
                      setTrainDropdownOpen(true);
                      if (validationMsg) setValidationMsg("");
                    }}
                    placeholder="Enter train no. or name (e.g. 12002, Shatabdi)"
                    className="w-full bg-transparent text-sm font-bold text-ink placeholder:font-normal placeholder:text-ink-muted focus:outline-none sm:text-base"
                  />
                  {trainQuery && (
                    <button
                      type="button"
                      onClick={() => setTrainQuery("")}
                      aria-label="Clear train query"
                      className="text-ink-muted hover:text-ink"
                    >
                      <CloseIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {trainDropdownOpen && trainSuggestions.length > 0 && (
                  <div className="absolute top-full right-0 left-0 z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-line-strong bg-card p-1.5 shadow-xl">
                    {trainSuggestions.map((t) => (
                      <button
                        key={t.trainNumber}
                        type="button"
                        onClick={() => {
                          setTrainDropdownOpen(false);
                          navigateToTrain(t.trainNumber, trainDate, t.trainName);
                        }}
                        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition hover:bg-subcard"
                      >
                        <div className="min-w-0">
                          <span className="mr-2 rounded bg-blue-50 px-1.5 py-0.5 font-mono text-xs font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                            {t.trainNumber}
                          </span>
                          <span className="truncate text-sm font-semibold text-ink">
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

              <div className="px-3.5 py-2.5">
                <label
                  htmlFor="hero-train-date"
                  className="block text-[11px] font-semibold uppercase tracking-wide text-ink-muted"
                >
                  Start Date (Optional)
                </label>
                <input
                  id="hero-train-date"
                  type="date"
                  value={trainDate || todayIst}
                  onChange={(e) => setTrainDate(e.target.value)}
                  className="mt-1 w-full bg-transparent text-sm font-bold text-ink focus:outline-none sm:text-base"
                />
              </div>

              <div className="flex items-stretch p-1.5">
                <button
                  type="submit"
                  className="ta-btn-primary inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-7 py-3 text-sm font-bold uppercase tracking-wide lg:w-auto"
                >
                  <span>Spot Train</span>
                </button>
              </div>
            </div>

            <div className="ta-no-scrollbar flex items-center gap-2 overflow-x-auto text-xs">
              <span className="shrink-0 font-medium text-ink-muted">
                Popular Trains:
              </span>
              {POPULAR_LIVE_TRAINS.slice(0, 5).map((t) => (
                <button
                  key={t.trainNumber}
                  type="button"
                  onClick={() => navigateToTrain(t.trainNumber, undefined, t.trainName)}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-subcard px-3 py-1 font-medium text-ink-soft transition hover:border-[#1956b4] hover:text-[#1956b4]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="font-mono font-bold text-ink">
                    {t.trainNumber}
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    {t.sourceCode}→{t.destinationCode}
                  </span>
                </button>
              ))}
            </div>
          </form>
        )}

        {/* 3. PNR STATUS SEARCH */}
        {mode === "pnr" && (
          <form onSubmit={handlePnrSubmit} className="space-y-3">
            <div className="grid divide-y divide-line rounded-xl border border-line-strong bg-input sm:grid-cols-[1fr_auto] sm:divide-x sm:divide-y-0">
              <div className="px-3.5 py-2.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="hero-pnr-input"
                    className="block text-[11px] font-semibold uppercase tracking-wide text-ink-muted"
                  >
                    10-Digit IRCTC PNR Number
                  </label>
                  <span className="font-mono text-[11px] font-semibold text-ink-muted">
                    {pnr.length}/10 digits
                  </span>
                </div>
                <input
                  id="hero-pnr-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={pnr}
                  onChange={(e) => {
                    setPnr(e.target.value.replace(/\D/g, "").slice(0, 10));
                    if (validationMsg) setValidationMsg("");
                  }}
                  placeholder="Enter 10-digit PNR number"
                  className="mt-1 w-full bg-transparent font-mono text-base font-bold tracking-wider text-ink placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-ink-muted focus:outline-none sm:text-lg"
                />
              </div>

              <div className="flex items-stretch p-1.5">
                <button
                  type="submit"
                  className="ta-btn-primary inline-flex w-full cursor-pointer items-center justify-center rounded-lg px-8 py-3 text-sm font-bold uppercase tracking-wide sm:w-auto"
                >
                  Check Status
                </button>
              </div>
            </div>
            <p className="text-xs text-ink-muted">
              Instant seat confirmation (CNF / RAC / WL), coach &amp; berth
              numbers, and live chart status.
            </p>
          </form>
        )}

        {/* 4. HOTEL GST & BAGGAGE QUICK UTILITY */}
        {mode === "hotel" && (
          <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
            <div className="grid grid-cols-3 divide-x divide-line rounded-xl border border-line-strong bg-input">
              <div className="px-3.5 py-2.5">
                <label
                  htmlFor="hero-room-rate"
                  className="block text-[11px] font-semibold uppercase tracking-wide text-ink-muted"
                >
                  Tariff / Night (₹)
                </label>
                <input
                  id="hero-room-rate"
                  type="number"
                  min={0}
                  value={roomRate}
                  onChange={(e) => setRoomRate(e.target.value)}
                  className="mt-1 w-full bg-transparent font-mono text-base font-bold text-ink focus:outline-none"
                />
              </div>
              <div className="px-3.5 py-2.5">
                <label
                  htmlFor="hero-nights"
                  className="block text-[11px] font-semibold uppercase tracking-wide text-ink-muted"
                >
                  Nights
                </label>
                <input
                  id="hero-nights"
                  type="number"
                  min={1}
                  max={30}
                  value={nights}
                  onChange={(e) => setNights(e.target.value)}
                  className="mt-1 w-full bg-transparent font-mono text-base font-bold text-ink focus:outline-none"
                />
              </div>
              <div className="flex flex-col justify-center bg-subcard px-3.5 py-2.5">
                <span className="text-[11px] font-semibold text-ink-muted">
                  Total ({gstRate}% GST)
                </span>
                <span className="mt-0.5 font-mono text-base font-extrabold text-[#1956b4] dark:text-blue-300">
                  ₹{totalWithTax.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/tools/hotel"
                className="ta-btn-primary inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-xs font-bold sm:text-sm"
              >
                <HotelIcon className="h-4 w-4" />
                <span>Hotel GST Tool</span>
              </Link>
              <Link
                href="/tools/air"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-line-strong bg-subcard px-4 py-3 text-xs font-bold text-ink transition hover:border-[#1956b4] sm:text-sm"
              >
                <LuggageIcon className="h-4 w-4 text-[#1956b4]" />
                <span>Baggage Rules</span>
              </Link>
            </div>
          </div>
        )}

        {validationMsg && (
          <p className="mt-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {validationMsg}
          </p>
        )}
      </div>
    </div>
  );
}
