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
  getTodayIstDateString,
  POPULAR_LIVE_TRAINS,
  type OwnedTrainSearchApiResponse,
  type TrainSearchItem,
} from "@/lib/live-train-types";
import { AirlineLogo } from "./AirlineLogo";
import {
  ArrowRightIcon,
  BedIcon,
  CalculatorIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  CloseIcon,
  CoachTrainIcon,
  HotelIcon,
  LuggageIcon,
  PlaneIcon,
  RadarLiveIcon,
  RupeeBadgeIcon,
  SearchIcon,
  SparklesIcon,
  TicketIcon,
  TrainIcon,
} from "./Icons";

function noopSubscribe() {
  return () => { };
}

export function HeroSearchWidget() {
  const router = useRouter();
  const todayIst = useSyncExternalStore(
    noopSubscribe,
    getTodayIstDateString,
    () => ""
  );

  const [activeTab, setActiveTab] = useState<"rail" | "air" | "hotel">("rail");
  const [railTool, setRailTool] = useState<"live" | "pnr">("live");
  const [airTool, setAirTool] = useState<"flight" | "baggage">("flight");

  const [pnr, setPnr] = useState("");
  const [trainQuery, setTrainQuery] = useState("");
  const [trainDate, setTrainDate] = useState("");
  const [validationMsg, setValidationMsg] = useState("");

  // Train search autocomplete inside Hero Widget
  const [remoteSuggestions, setRemoteSuggestions] = useState<
    TrainSearchItem[] | null
  >(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Flight search autocomplete inside Hero Widget
  const [selectedHeroAirline, setSelectedHeroAirline] =
    useState<AirlineSearchItem>(POPULAR_AIRLINES[0]);
  const [airlineQuery, setAirlineQuery] = useState("");
  const [airlineDropdownOpen, setAirlineDropdownOpen] = useState(false);
  const [remoteAirlines, setRemoteAirlines] = useState<
    AirlineSearchItem[] | null
  >(null);
  const [flightNumber, setFlightNumber] = useState("");
  const [flightDate, setFlightDate] = useState("");
  const [airValidationMsg, setAirValidationMsg] = useState("");
  const airlineBoxRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const trimmed = trainQuery.trim();
    if (trimmed.length < 2) {
      return POPULAR_LIVE_TRAINS.slice(0, 5);
    }
    if (remoteSuggestions && remoteSuggestions.length > 0) {
      return remoteSuggestions;
    }
    const lower = trimmed.toLowerCase();
    return POPULAR_LIVE_TRAINS.filter(
      (t) =>
        t.trainNumber.includes(lower) ||
        t.trainName.toLowerCase().includes(lower) ||
        t.sourceCode.toLowerCase().includes(lower) ||
        t.destinationCode.toLowerCase().includes(lower)
    ).slice(0, 5);
  }, [trainQuery, remoteSuggestions]);

  const airlineSuggestions = useMemo(() => {
    const trimmed = airlineQuery.trim();
    if (!trimmed) {
      return POPULAR_AIRLINES.slice(0, 8);
    }
    if (remoteAirlines !== null) {
      return remoteAirlines.slice(0, 10);
    }
    const lower = trimmed.toLowerCase();
    return POPULAR_AIRLINES.filter(
      (a) =>
        a.code.toLowerCase().includes(lower) ||
        a.name.toLowerCase().includes(lower) ||
        (a.aliasName?.toLowerCase().includes(lower) ?? false)
    ).slice(0, 8);
  }, [airlineQuery, remoteAirlines]);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (
        airlineBoxRef.current &&
        !airlineBoxRef.current.contains(e.target as Node)
      ) {
        setAirlineDropdownOpen(false);
        setAirlineQuery("");
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  useEffect(() => {
    const trimmed = trainQuery.trim();
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
            setRemoteSuggestions(json.data.slice(0, 6));
          }
        }
      } catch {
        // Ignore aborted lookups
      }
    }, 220);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trainQuery, dropdownOpen]);

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
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [airlineQuery, airlineDropdownOpen]);

  const [roomRate, setRoomRate] = useState("4500");
  const [nights, setNights] = useState("2");

  const handlePnrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pnr.replace(/\D/g, "");
    if (clean.length !== 10) {
      setValidationMsg("Please enter a valid 10-digit numeric PNR number.");
      return;
    }
    router.push(`/rail/pnr-status?pnr=${clean}`);
  };

  const navigateToTrain = (digits: string, explicitDate?: string) => {
    const cleanDate =
      explicitDate && /^\d{4}-\d{2}-\d{2}$/.test(explicitDate)
        ? explicitDate
        : "";
    const targetUrl = cleanDate
      ? `/rail/live-status?train=${digits}&date=${cleanDate}`
      : `/rail/live-status?train=${digits}`;
    router.push(targetUrl);
  };

  const handleLiveTrainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = trainQuery.replace(/\D/g, "").slice(0, 5);
    if (digits.length >= 3) {
      navigateToTrain(digits, trainDate);
      return;
    }
    if (suggestions.length > 0 && trainQuery.trim().length >= 2) {
      navigateToTrain(suggestions[0].trainNumber, trainDate);
      return;
    }
    setValidationMsg(
      "Enter a 4 or 5-digit train number or choose a train name."
    );
  };

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

  const handleLiveFlightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFlightInput(flightNumber);
    const code = parsed.extractedAirlineCode ?? selectedHeroAirline.code;
    const num = parsed.extractedFlightNumber;
    if (!num || !/^\d{1,4}[A-Z]?$/.test(num)) {
      setAirValidationMsg("Enter a valid 1 to 4-digit flight number (e.g. 2045 or 562).");
      return;
    }
    navigateToFlight(code, num, flightDate || todayIst);
  };

  const numericRate = Math.max(0, Number(roomRate) || 0);
  const numericNights = Math.max(1, Number(nights) || 1);
  const gstRate = numericRate > 7500 ? 18 : numericRate > 1000 ? 12 : 0;
  const totalRoomBase = numericRate * numericNights;
  const totalWithTax = Math.round(totalRoomBase * (1 + gstRate / 100));

  return (
    <div className="rounded-3xl border border-line bg-card p-4 text-ink shadow-xl shadow-black/8 dark:shadow-black/35 sm:p-6">
      {/* Mode Switcher Tabs: Rail, Air, Hotel */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-line pb-3.5">
        <div className="grid w-full grid-cols-3 gap-1.5 rounded-2xl bg-subcard p-1 sm:w-auto sm:p-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("rail")}
            className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold transition sm:px-4 sm:py-2.5 sm:text-sm ${activeTab === "rail"
                ? "ta-btn-primary shadow-xs"
                : "text-ink-soft hover:bg-card hover:text-ink"
              }`}
          >
            <TrainIcon className="h-4 w-4" />
            <span>Rail</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("air")}
            className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold transition sm:px-4 sm:py-2.5 sm:text-sm ${activeTab === "air"
                ? "ta-btn-primary shadow-xs"
                : "text-ink-soft hover:bg-card hover:text-ink"
              }`}
          >
            <PlaneIcon className="h-4 w-4" />
            <span>Air</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("hotel")}
            className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold transition sm:px-4 sm:py-2.5 sm:text-sm ${activeTab === "hotel"
                ? "ta-btn-primary shadow-xs"
                : "text-ink-soft hover:bg-card hover:text-ink"
              }`}
          >
            <HotelIcon className="h-4 w-4" />
            <span>Hotel</span>
          </button>
        </div>

        <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/12 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 sm:inline-flex">
          <span className="ta-led-blink h-2 w-2 rounded-full bg-emerald-500" />
          <span>{activeTab === "air" ? "Live Air Radar" : "Live Rail Ready"}</span>
        </span>
      </div>

      {/* RAIL TAB: Live Train Status + PNR Status Switcher */}
      {activeTab === "rail" && (
        <div className="mt-3.5 space-y-3.5">
          {/* Sub-tool Selector */}
          <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-line bg-subcard p-1.5">
            <button
              type="button"
              onClick={() => {
                setRailTool("live");
                setValidationMsg("");
              }}
              className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-extrabold transition ${railTool === "live"
                  ? "bg-card text-orange-700 shadow-2xs ring-1 ring-orange-500/35 dark:text-amber-300"
                  : "text-ink-soft hover:text-ink"
                }`}
            >
              <span className="ta-led-blink h-2 w-2 rounded-full bg-emerald-500" />
              <span>Live Train Status</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRailTool("pnr");
                setValidationMsg("");
              }}
              className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-extrabold transition ${railTool === "pnr"
                  ? "bg-card text-orange-700 shadow-2xs ring-1 ring-orange-500/35 dark:text-amber-300"
                  : "text-ink-soft hover:text-ink"
                }`}
            >
              <TicketIcon className="h-4 w-4" />
              <span>10-Digit PNR</span>
            </button>
          </div>

          {railTool === "live" ? (
            <form onSubmit={handleLiveTrainSubmit} className="space-y-3">
              <div className="grid gap-2.5 sm:grid-cols-[1.35fr_0.9fr]">
                <div ref={boxRef} className="relative">
                  <label
                    htmlFor="hero-train-input"
                    className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-soft"
                  >
                    Train No. or Name
                  </label>
                  <div className="relative mt-1">
                    <TrainIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-600 dark:text-amber-400" />
                    <input
                      id="hero-train-input"
                      type="text"
                      autoComplete="off"
                      value={trainQuery}
                      onFocus={() => setDropdownOpen(true)}
                      onChange={(e) => {
                        setTrainQuery(e.target.value);
                        setRemoteSuggestions(null);
                        setDropdownOpen(true);
                        if (validationMsg) setValidationMsg("");
                      }}
                      placeholder="e.g. 12002 or Rajdhani"
                      className="w-full rounded-xl border-2 border-line bg-input py-3 pl-10 pr-8 text-base font-bold text-ink placeholder:text-xs placeholder:font-medium placeholder:text-ink-muted focus:border-orange-500 focus:outline-none sm:text-sm"
                    />
                    {trainQuery && (
                      <button
                        type="button"
                        onClick={() => setTrainQuery("")}
                        aria-label="Clear train query"
                        className="absolute right-2.5 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-subcard text-ink-muted hover:text-ink"
                      >
                        <CloseIcon className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Autocomplete Dropdown */}
                  {dropdownOpen && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-60 overflow-y-auto rounded-2xl border border-line-strong bg-card p-1.5 shadow-2xl">
                      {suggestions.map((t) => (
                        <button
                          key={t.trainNumber}
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            navigateToTrain(t.trainNumber, trainDate);
                          }}
                          className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left transition hover:bg-subcard"
                        >
                          <div className="min-w-0">
                            <span className="mr-1.5 rounded bg-orange-500/16 px-1.5 py-0.5 font-mono text-[11px] font-black text-orange-800 dark:text-amber-300">
                              #{t.trainNumber}
                            </span>
                            <span className="truncate text-xs font-bold text-ink">
                              {t.trainName}
                            </span>
                          </div>
                          <span className="shrink-0 font-mono text-[10px] font-bold text-ink-muted">
                            {t.sourceCode}→{t.destinationCode}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="hero-train-date"
                    className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-soft"
                  >
                    Start Date (Optional)
                  </label>
                  <div className="relative mt-1">
                    <CalendarIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-600 dark:text-amber-300" />
                    <input
                      id="hero-train-date"
                      type="date"
                      value={trainDate || todayIst}
                      onChange={(e) => setTrainDate(e.target.value)}
                      className="w-full rounded-xl border-2 border-line bg-input py-3 pl-10 pr-2.5 font-mono text-base font-bold text-ink focus:border-orange-500 focus:outline-none sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="ta-btn-primary inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-extrabold"
              >
                <RadarLiveIcon className="h-4 w-4" />
                <span>Spot Live Train Status</span>
                <ArrowRightIcon className="h-4 w-4" />
              </button>

              {/* Quick 1-Tap Popular Trains Strip */}
              <div className="ta-no-scrollbar flex items-center gap-1.5 overflow-x-auto pt-0.5 text-[11px]">
                <span className="shrink-0 font-bold text-ink-muted">Try:</span>
                {POPULAR_LIVE_TRAINS.slice(0, 4).map((t) => (
                  <button
                    key={t.trainNumber}
                    type="button"
                    onClick={() => navigateToTrain(t.trainNumber)}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-line bg-subcard px-2.5 py-1 font-mono font-bold text-ink transition hover:border-orange-500"
                  >
                    <span className="ta-led-blink h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>#{t.trainNumber}</span>
                  </button>
                ))}
              </div>
            </form>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="hero-pnr-input"
                  className="text-xs font-extrabold uppercase tracking-wider text-ink-soft"
                >
                  Indian Railways 10-Digit PNR
                </label>
                <span className="font-mono text-xs font-bold text-orange-600 dark:text-amber-400">
                  {pnr.length}/10 digits
                </span>
              </div>

              <form
                onSubmit={handlePnrSubmit}
                className="mt-2 flex flex-col gap-2.5 sm:flex-row"
              >
                <div className="relative flex-1">
                  <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
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
                    className="w-full rounded-2xl border-2 border-line bg-input py-3.5 pl-11 pr-4 font-mono text-base font-bold tracking-wider text-ink placeholder:font-sans placeholder:text-sm placeholder:font-medium placeholder:tracking-normal placeholder:text-ink-muted focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="ta-btn-primary inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-extrabold"
                >
                  <span>Check PNR</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {validationMsg && (
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
              {validationMsg}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-subcard p-3 text-[11px] text-ink-soft sm:text-xs">
            <div className="flex items-center gap-1.5 font-semibold">
              <CoachTrainIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
              <span>Coach &amp; Rake Order</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold">
              <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Blinking GPS Radar</span>
            </div>
          </div>
        </div>
      )}

      {/* AIR TAB: Live Flight Status + Baggage Rules Switcher */}
      {activeTab === "air" && (
        <div className="mt-3.5 space-y-3.5">
          <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-line bg-subcard p-1.5">
            <button
              type="button"
              onClick={() => {
                setAirTool("flight");
                setAirValidationMsg("");
              }}
              className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-extrabold transition ${airTool === "flight"
                  ? "bg-card text-orange-700 shadow-2xs ring-1 ring-orange-500/35 dark:text-amber-300"
                  : "text-ink-soft hover:text-ink"
                }`}
            >
              <span className="ta-led-blink h-2 w-2 rounded-full bg-emerald-500" />
              <span>Live Flight Status</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAirTool("baggage");
                setAirValidationMsg("");
              }}
              className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-extrabold transition ${airTool === "baggage"
                  ? "bg-card text-orange-700 shadow-2xs ring-1 ring-orange-500/35 dark:text-amber-300"
                  : "text-ink-soft hover:text-ink"
                }`}
            >
              <LuggageIcon className="h-4 w-4" />
              <span>Baggage Rules</span>
            </button>
          </div>

          {airTool === "flight" ? (
            <form onSubmit={handleLiveFlightSubmit} className="space-y-3">
              {/* Airline Search Input with Logos */}
              <div ref={airlineBoxRef} className="relative">
                <label
                  htmlFor="hero-airline-input"
                  className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-soft"
                >
                  Airline Search
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                    {!airlineDropdownOpen ? (
                      <AirlineLogo
                        code={selectedHeroAirline.code}
                        name={selectedHeroAirline.name}
                        size="xs"
                      />
                    ) : (
                      <SearchIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                    )}
                  </div>
                  <input
                    id="hero-airline-input"
                    type="text"
                    autoComplete="off"
                    value={
                      airlineDropdownOpen
                        ? airlineQuery
                        : `${selectedHeroAirline.name} (${selectedHeroAirline.code})`
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
                    placeholder="Search airline (e.g. IndiGo, Air India, QP)"
                    className="w-full rounded-xl border-2 border-line bg-input py-2.5 pl-11 pr-8 text-base font-bold text-ink placeholder:text-xs placeholder:font-medium placeholder:text-ink-muted focus:border-orange-500 focus:outline-none sm:text-sm"
                  />
                  <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                </div>

                {airlineDropdownOpen && airlineSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-56 overflow-y-auto rounded-2xl border border-line-strong bg-card p-1.5 shadow-2xl">
                    {airlineSuggestions.map((a, idx) => (
                      <button
                        key={`${a.code}-${idx}`}
                        type="button"
                        onClick={() => {
                          setSelectedHeroAirline(a);
                          setAirlineDropdownOpen(false);
                          setAirlineQuery("");
                        }}
                        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left transition hover:bg-subcard"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <AirlineLogo code={a.code} name={a.name} size="xs" />
                          <span className="truncate text-xs font-extrabold text-ink">
                            {a.name}
                          </span>
                        </div>
                        <span className="shrink-0 rounded bg-orange-500/16 px-1.5 py-0.5 font-mono text-[11px] font-black text-orange-800 dark:text-amber-300">
                          {a.code}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="hero-flight-no"
                    className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-soft"
                  >
                    Flight Number
                  </label>
                  <div className="relative mt-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 rounded bg-orange-500/16 px-1.5 py-0.5 font-mono text-[11px] font-black text-orange-800 dark:text-amber-300">
                      {selectedHeroAirline.code}
                    </span>
                    <input
                      id="hero-flight-no"
                      type="text"
                      autoComplete="off"
                      value={flightNumber}
                      onChange={(e) => {
                        setFlightNumber(e.target.value.toUpperCase());
                        if (airValidationMsg) setAirValidationMsg("");
                      }}
                      placeholder="e.g. 2045 or 562"
                      className="w-full rounded-xl border-2 border-line bg-input py-2.5 pl-12 pr-3 font-mono text-base font-bold text-ink placeholder:font-sans placeholder:text-xs placeholder:font-medium placeholder:text-ink-muted focus:border-orange-500 focus:outline-none sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="hero-flight-date"
                    className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-soft"
                  >
                    Departure Date
                  </label>
                  <div className="relative mt-1">
                    <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-600 dark:text-amber-300" />
                    <input
                      id="hero-flight-date"
                      type="date"
                      value={flightDate || todayIst}
                      onChange={(e) => setFlightDate(e.target.value)}
                      className="w-full rounded-xl border-2 border-line bg-input py-2.5 pl-9 pr-2 font-mono text-base font-bold text-ink focus:border-orange-500 focus:outline-none sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {airValidationMsg && (
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  {airValidationMsg}
                </p>
              )}

              <button
                type="submit"
                className="ta-btn-primary inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-extrabold"
              >
                <RadarLiveIcon className="h-4 w-4" />
                <span>Track Live Flight Status</span>
                <ArrowRightIcon className="h-4 w-4" />
              </button>

              {/* Quick 1-Tap Popular Flights */}
              <div className="ta-no-scrollbar flex items-center gap-1.5 overflow-x-auto pt-0.5 text-[11px]">
                <span className="shrink-0 font-bold text-ink-muted">Try:</span>
                {POPULAR_LIVE_FLIGHTS.slice(0, 4).map((f) => (
                  <button
                    key={`${f.airlineCode}-${f.flightNumber}`}
                    type="button"
                    onClick={() =>
                      navigateToFlight(f.airlineCode, f.flightNumber)
                    }
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-line bg-subcard py-0.5 pl-1 pr-2 font-mono font-bold text-ink transition hover:border-orange-500"
                  >
                    <AirlineLogo
                      code={f.airlineCode}
                      name={f.airlineName}
                      size="xs"
                    />
                    <span>
                      {f.airlineCode} {f.flightNumber}
                    </span>
                  </button>
                ))}
              </div>
            </form>
          ) : (
            <div className="space-y-2.5">
              <div className="rounded-2xl border border-line bg-subcard p-3.5">
                <p className="inline-flex items-center gap-2 text-sm font-bold text-ink">
                  <PlaneIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
                  <span>Domestic Economy Flights</span>
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500/15 px-2.5 py-1 text-orange-800 dark:text-orange-300">
                    <LuggageIcon className="h-3.5 w-3.5" />
                    <span>7 kg Cabin + 15 kg Check-in</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/18 px-2.5 py-1 text-amber-900 dark:text-amber-300">
                    <ClockIcon className="h-3.5 w-3.5" />
                    <span>Report 2 hrs prior</span>
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-subcard p-3.5">
                <p className="inline-flex items-center gap-2 text-sm font-bold text-ink">
                  <PlaneIcon className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                  <span>International Economy Flights</span>
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/18 px-2.5 py-1 text-amber-900 dark:text-amber-300">
                    <LuggageIcon className="h-3.5 w-3.5" />
                    <span>7 kg Cabin + 23–30 kg Check-in</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500/15 px-2.5 py-1 text-orange-800 dark:text-orange-300">
                    <ClockIcon className="h-3.5 w-3.5" />
                    <span>Report 3 hrs prior</span>
                  </span>
                </div>
              </div>

              <Link
                href="/tools/air"
                className="ta-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold"
              >
                <span>Open Interactive Air Toolkit</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* HOTEL TAB */}
      {activeTab === "hotel" && (
        <div className="mt-4 space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-ink-soft">
              Hotel Room &amp; GST Estimator
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/18 px-2.5 py-0.5 text-xs font-bold text-amber-900 dark:text-amber-300">
              <RupeeBadgeIcon className="h-3.5 w-3.5" />
              <span>{gstRate}% GST</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label
                htmlFor="hero-room-rate"
                className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted"
              >
                <RupeeBadgeIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
                <span>Tariff / Night (₹)</span>
              </label>
              <input
                id="hero-room-rate"
                type="number"
                min={0}
                value={roomRate}
                onChange={(e) => setRoomRate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-input px-3 py-2.5 font-mono text-base font-bold text-ink focus:border-orange-500 focus:outline-none sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="hero-nights"
                className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted"
              >
                <BedIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" />
                <span>Nights</span>
              </label>
              <input
                id="hero-nights"
                type="number"
                min={1}
                max={30}
                value={nights}
                onChange={(e) => setNights(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-input px-3 py-2.5 font-mono text-base font-bold text-ink focus:border-orange-500 focus:outline-none sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-line bg-subcard px-3.5 py-3 text-ink">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
              <CalculatorIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
              <span>Total Stay (incl. GST)</span>
            </div>
            <span className="font-mono text-base font-extrabold text-orange-700 dark:text-amber-300 sm:text-lg">
              ₹{totalWithTax.toLocaleString("en-IN")}
            </span>
          </div>

          <Link
            href="/tools/hotel"
            className="ta-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold"
          >
            <span>Open Full Hotel Toolkit</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Subtle Bottom Helper Badge */}
      <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-[11px] font-medium text-ink-muted">
        <span className="inline-flex items-center gap-1">
          <SparklesIcon className="h-3 w-3 text-orange-600 dark:text-amber-400" />
          <span>100% Free TravelAdda Air, Rail &amp; Trip Suite</span>
        </span>
        <Link
          href={activeTab === "air" ? "/air/flight-status" : "/rail/live-status"}
          className="font-bold text-orange-700 hover:underline dark:text-amber-300"
        >
          {activeTab === "air" ? "Flight Radar →" : "Train Radar →"}
        </Link>
      </div>
    </div>
  );
}
