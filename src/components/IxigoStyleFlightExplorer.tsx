"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AutocompletePlaceItem } from "@/app/api/flights/places/route";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  LuggageIcon,
  PlaneIcon,
  SearchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  SwapArrowsIcon,
  TranslateIcon,
  WhatsAppIcon,
} from "@/components/Icons";
import {
  buildFlightRoutePath,
  MAJOR_AIRPORT_HUBS,
  type FlightRoutePageData,
  type FlightScheduleOffer,
} from "@/lib/flight-booking-types";
import { buildFlightStatusPath } from "@/lib/flight-types";
import {
  FLIGHT_CURRENCIES,
  formatFlightPrice,
  type SupportedFlightCurrency,
} from "@/lib/travelpayouts-config";

interface IxigoStyleFlightExplorerProps {
  initialData: FlightRoutePageData;
}

type SortMode = "cheapest" | "fastest" | "earliest";
type TimeSlotFilter = "all" | "morning" | "afternoon" | "evening";
type CabinClassType = "Economy" | "Premium Economy" | "Business";

const CABIN_CLASS_MULTIPLIER: Record<CabinClassType, number> = {
  Economy: 1,
  "Premium Economy": 1.35,
  Business: 2.15,
};

function buildAffiliateUrlWithPax(
  baseUrl: string,
  passengersCount: number
): string {
  const pax = Math.min(9, Math.max(1, passengersCount));
  return baseUrl.replace(
    /(\/search\/[A-Z]{3}\d{4}[A-Z]{3})\d+/i,
    `$1${pax}`
  );
}

const INITIAL_POPULAR_PLACES: AutocompletePlaceItem[] = MAJOR_AIRPORT_HUBS.slice(
  0,
  20
).map((h) => ({
  iata: h.iata,
  city: h.city,
  airportName: h.airportName,
  countryName: h.isInternationalHub ? h.stateOrCountry : "India",
  countryCode: h.isInternationalHub ? "INTL" : "IN",
  terminals: h.domesticTerminal,
  lat: h.lat,
  lng: h.lng,
  isInternational: h.isInternationalHub,
}));

function formatDepartureDateDisplay(departureDate: string): {
  dayMonth: string;
  weekday: string;
} {
  const dt = new Date(`${departureDate}T06:00:00Z`);
  if (Number.isNaN(dt.getTime())) {
    return { dayMonth: departureDate, weekday: "Departure Date" };
  }
  const dayMonth = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(dt);
  const weekday = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    timeZone: "UTC",
  }).format(dt);
  return { dayMonth, weekday };
}

export function IxigoStyleFlightExplorer({
  initialData,
}: IxigoStyleFlightExplorerProps) {
  const router = useRouter();
  const [routeData, setRouteData] = useState<FlightRoutePageData>(initialData);

  const [originPlace, setOriginPlace] = useState<AutocompletePlaceItem>({
    iata: initialData.origin.iata,
    city: initialData.origin.city,
    airportName: initialData.origin.airportName,
    countryName: initialData.origin.stateOrCountry,
    countryCode: initialData.origin.isInternationalHub ? "INTL" : "IN",
    terminals: initialData.origin.domesticTerminal,
    lat: initialData.origin.lat,
    lng: initialData.origin.lng,
    isInternational: initialData.origin.isInternationalHub,
  });

  const [destPlace, setDestPlace] = useState<AutocompletePlaceItem>({
    iata: initialData.destination.iata,
    city: initialData.destination.city,
    airportName: initialData.destination.airportName,
    countryName: initialData.destination.stateOrCountry,
    countryCode: initialData.destination.isInternationalHub ? "INTL" : "IN",
    terminals: initialData.destination.domesticTerminal,
    lat: initialData.destination.lat,
    lng: initialData.destination.lng,
    isInternational: initialData.destination.isInternationalHub,
  });

  const [departureDate, setDepartureDate] = useState<string>(
    initialData.departureDate
  );
  const [currency, setCurrency] = useState<SupportedFlightCurrency>(
    initialData.currency
  );
  const [loading, setLoading] = useState<boolean>(false);

  // Autocomplete popover state
  const [activePopover, setActivePopover] = useState<"origin" | "dest" | null>(
    null
  );
  const [placeSearchTerm, setPlaceSearchTerm] = useState<string>("");
  const [placeSuggestions, setPlaceSuggestions] = useState<
    AutocompletePlaceItem[]
  >(INITIAL_POPULAR_PLACES);
  const [placeLoading, setPlaceLoading] = useState<boolean>(false);

  const originBoxRef = useRef<HTMLDivElement>(null);
  const destBoxRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const placeAbortRef = useRef<AbortController | null>(null);
  const placeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filters & sorting
  const [nonStopOnly, setNonStopOnly] = useState<boolean>(false);
  const [selectedAirline, setSelectedAirline] = useState<string>("ALL");
  const [timeSlot, setTimeSlot] = useState<TimeSlotFilter>("all");
  const [sortBy, setSortBy] = useState<SortMode>("cheapest");
  const [lang, setLang] = useState<"en" | "hi">("en");

  // Booking Review & Fare Breakdown Modal state
  const [selectedBookingOffer, setSelectedBookingOffer] =
    useState<FlightScheduleOffer | null>(null);
  const [passengersCount, setPassengersCount] = useState<number>(1);
  const [cabinClass, setCabinClass] = useState<CabinClassType>("Economy");

  // Close Booking Review modal on Escape key
  useEffect(() => {
    if (!selectedBookingOffer) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSelectedBookingOffer(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBookingOffer]);

  // Close airport popover on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        activePopover === "origin" &&
        originBoxRef.current &&
        !originBoxRef.current.contains(target)
      ) {
        setActivePopover(null);
      } else if (
        activePopover === "dest" &&
        destBoxRef.current &&
        !destBoxRef.current.contains(target)
      ) {
        setActivePopover(null);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [activePopover]);

  function togglePopover(side: "origin" | "dest") {
    const next = activePopover === side ? null : side;
    setActivePopover(next);
    if (next) {
      setPlaceSearchTerm("");
      setPlaceSuggestions(INITIAL_POPULAR_PLACES);
      setPlaceLoading(false);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 30);
    }
  }

  function handlePlaceQueryChange(rawVal: string) {
    setPlaceSearchTerm(rawVal);
    if (placeTimerRef.current) clearTimeout(placeTimerRef.current);
    if (placeAbortRef.current) placeAbortRef.current.abort();

    const q = rawVal.trim();
    if (q.length < 2) {
      setPlaceSuggestions(INITIAL_POPULAR_PLACES);
      setPlaceLoading(false);
      return;
    }

    const controller = new AbortController();
    placeAbortRef.current = controller;
    setPlaceLoading(true);
    placeTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/flights/places?q=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json?.data)) {
            setPlaceSuggestions(json.data);
          }
        }
      } catch {
        // Ignore abort
      } finally {
        setPlaceLoading(false);
      }
    }, 180);
  }

  async function loadRouteData(
    nextOriginIata: string,
    nextDestIata: string,
    nextDate: string,
    nextCurrency: SupportedFlightCurrency,
    pushRoute = false
  ) {
    if (!nextOriginIata || !nextDestIata || nextOriginIata === nextDestIata) {
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        origin: nextOriginIata,
        destination: nextDestIata,
        date: nextDate,
        currency: nextCurrency,
      });
      const res = await fetch(`/api/flights/fares?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json?.success && json?.data) {
          const d: FlightRoutePageData = json.data;
          setRouteData(d);
          setOriginPlace({
            iata: d.origin.iata,
            city: d.origin.city,
            airportName: d.origin.airportName,
            countryName: d.origin.stateOrCountry,
            countryCode: d.origin.isInternationalHub ? "INTL" : "IN",
            terminals: d.origin.domesticTerminal,
            lat: d.origin.lat,
            lng: d.origin.lng,
            isInternational: d.origin.isInternationalHub,
          });
          setDestPlace({
            iata: d.destination.iata,
            city: d.destination.city,
            airportName: d.destination.airportName,
            countryName: d.destination.stateOrCountry,
            countryCode: d.destination.isInternationalHub ? "INTL" : "IN",
            terminals: d.destination.domesticTerminal,
            lat: d.destination.lat,
            lng: d.destination.lng,
            isInternational: d.destination.isInternationalHub,
          });
          if (pushRoute) {
            const targetPath = buildFlightRoutePath(
              d.origin.citySlug,
              d.destination.citySlug
            );
            router.push(targetPath, { scroll: false });
          }
        }
      }
    } catch {
      // Keep current state on network hiccup
    } finally {
      setLoading(false);
    }
  }

  function handleSelectPlace(
    side: "origin" | "dest",
    place: AutocompletePlaceItem
  ) {
    setActivePopover(null);
    if (side === "origin") {
      if (place.iata === destPlace.iata) return;
      setOriginPlace(place);
      void loadRouteData(
        place.iata,
        destPlace.iata,
        departureDate,
        currency,
        true
      );
    } else {
      if (place.iata === originPlace.iata) return;
      setDestPlace(place);
      void loadRouteData(
        originPlace.iata,
        place.iata,
        departureDate,
        currency,
        true
      );
    }
  }

  function handleSwapAirports() {
    const nextOrigin = destPlace;
    const nextDest = originPlace;
    setOriginPlace(nextOrigin);
    setDestPlace(nextDest);
    void loadRouteData(
      nextOrigin.iata,
      nextDest.iata,
      departureDate,
      currency,
      true
    );
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    void loadRouteData(
      originPlace.iata,
      destPlace.iata,
      departureDate,
      currency,
      true
    );
  }

  function handleDateSelect(nextDate: string) {
    if (!nextDate) return;
    setDepartureDate(nextDate);
    void loadRouteData(
      originPlace.iata,
      destPlace.iata,
      nextDate,
      currency,
      false
    );
  }

  function handleCurrencyChange(nextCurrency: SupportedFlightCurrency) {
    setCurrency(nextCurrency);
    void loadRouteData(
      originPlace.iata,
      destPlace.iata,
      departureDate,
      nextCurrency,
      false
    );
  }

  const formattedSelectedDate = formatDepartureDateDisplay(departureDate);

  const filteredOffers = useMemo(() => {
    let list = [...routeData.offers];
    if (nonStopOnly) {
      list = list.filter((o) => o.transfers === 0);
    }
    if (selectedAirline !== "ALL") {
      list = list.filter((o) => o.airlineCode === selectedAirline);
    }
    if (timeSlot !== "all") {
      list = list.filter((o) => {
        const hour = Number(o.departureTime24.split(":")[0]) || 0;
        if (timeSlot === "morning") return hour >= 4 && hour < 12;
        if (timeSlot === "afternoon") return hour >= 12 && hour < 18;
        return hour >= 18 || hour < 4;
      });
    }
    if (sortBy === "cheapest") {
      list.sort(
        (a, b) => a.price - b.price || a.durationMinutes - b.durationMinutes
      );
    } else if (sortBy === "fastest") {
      list.sort(
        (a, b) => a.durationMinutes - b.durationMinutes || a.price - b.price
      );
    } else {
      list.sort((a, b) => a.departureTime24.localeCompare(b.departureTime24));
    }
    return list;
  }, [routeData.offers, nonStopOnly, selectedAirline, timeSlot, sortBy]);

  const cheapestOffer = useMemo(
    () =>
      [...routeData.offers].sort((a, b) => a.price - b.price)[0] ||
      routeData.offers[0],
    [routeData.offers]
  );

  const fastestOffer = useMemo(
    () =>
      [...routeData.offers].sort(
        (a, b) => a.durationMinutes - b.durationMinutes || a.price - b.price
      )[0] || routeData.offers[0],
    [routeData.offers]
  );

  const earliestOffer = useMemo(
    () =>
      [...routeData.offers].sort((a, b) =>
        a.departureTime24.localeCompare(b.departureTime24)
      )[0] || routeData.offers[0],
    [routeData.offers]
  );

  const whatsappShareUrl = useMemo(() => {
    const msg =
      lang === "hi"
        ? `✈️ *${routeData.origin.city} (${routeData.origin.iata}) से ${routeData.destination.city} (${routeData.destination.iata}) फ्लाइट्स*\n• सबसे सस्ता किराया: *${routeData.formattedLowestFare}*\n• समय: *${routeData.minDurationFormatted}* (Non-Stop)\n• कुल फ्लाइट्स: *${routeData.totalFlightsCount} Daily*\nलाइव शेड्यूल और बुकिंग: https://traveladda.in${routeData.routePath}`
        : `✈️ *${routeData.origin.city} (${routeData.origin.iata}) to ${routeData.destination.city} (${routeData.destination.iata}) Flights (${departureDate})*\n• Lowest Fare: *${routeData.formattedLowestFare}*\n• Fastest Duration: *${routeData.minDurationFormatted}*\n• Airlines: *${routeData.airlinesOperating.map((a) => a.name).join(", ")}*\nCompare & Book: https://traveladda.in${routeData.routePath}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  }, [routeData, departureDate, lang]);

  function renderPlacePopover(side: "origin" | "dest") {
    const disabledIata = side === "origin" ? destPlace.iata : originPlace.iata;
    return (
      <div className="absolute top-full left-0 z-40 mt-2 w-full min-w-[290px] overflow-hidden rounded-2xl border border-line bg-card shadow-xl sm:min-w-[360px]">
        <div className="border-b border-line bg-subcard/70 p-2.5">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              ref={searchInputRef}
              type="text"
              value={placeSearchTerm}
              onChange={(e) => handlePlaceQueryChange(e.target.value)}
              placeholder={
                lang === "hi"
                  ? "शहर या एयरपोर्ट खोजें (जैसे Delhi, Goa, Darbhanga, Dubai)..."
                  : "Search any city or airport (e.g. Delhi, Darbhanga, Leh, Dubai)..."
              }
              className="w-full rounded-xl border border-line bg-card py-2 pr-3 pl-9 text-xs font-bold text-ink focus:border-[#1956b4] focus:outline-none sm:text-sm"
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] font-semibold text-ink-muted">
            <span>
              {placeSearchTerm.trim().length >= 2
                ? placeLoading
                  ? "Searching worldwide airports..."
                  : "Live Airport & City Matches"
                : "Popular Domestic & International Hubs"}
            </span>
            <span>9,000+ Global Airports</span>
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-line/60 p-1">
          {placeSuggestions.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-ink-muted">
              No matching city or airport found for &ldquo;{placeSearchTerm}
              &rdquo;
            </div>
          ) : (
            placeSuggestions.map((item) => {
              const isDisabled = item.iata === disabledIata;
              return (
                <button
                  key={`${side}-${item.iata}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectPlace(side, item)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    isDisabled
                      ? "cursor-not-allowed opacity-40"
                      : "hover:bg-blue-50/80 dark:hover:bg-blue-500/15"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-subcard text-[#1956b4] dark:text-blue-300">
                      <PlaneIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-extrabold text-ink sm:text-sm">
                          {item.city}
                        </span>
                        <span className="rounded bg-subcard px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted">
                          {item.countryName}
                        </span>
                      </div>
                      <div className="truncate text-[11px] text-ink-soft">
                        {item.airportName}
                      </div>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 font-mono text-xs font-extrabold text-[#1956b4] dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300">
                    {item.iata}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* 1. IXIGO-STYLE CONNECTED FLIGHT SEARCH BAR */}
      <div className="rounded-2xl border border-line bg-card p-3.5 shadow-md sm:p-5">
        {/* Top Row: One-Way Pill + Special Fare Tags + Multi-Currency + Language */}
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              style={{ backgroundColor: "#1956b4", color: "#ffffff" }}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#1956b4] px-3.5 py-1 text-xs font-extrabold text-white shadow-2xs"
            >
              <PlaneIcon className="h-3.5 w-3.5 text-white" />
              <span>{lang === "hi" ? "वन-वे (One Way)" : "One Way"}</span>
            </span>

            <button
              type="button"
              onClick={() => setNonStopOnly(!nonStopOnly)}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold transition ${
                nonStopOnly
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                  : "border-line bg-subcard text-ink-soft hover:border-[#1956b4] hover:text-ink"
              }`}
            >
              <CheckCircleIcon className="h-3.5 w-3.5" />
              <span>Non-Stop Only</span>
            </button>

            <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700 md:inline-flex dark:bg-emerald-500/15 dark:text-emerald-300">
              <ShieldCheckIcon className="h-3.5 w-3.5" />
              <span>Zero Convenience Fee</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Multi-Currency Switcher */}
            <div className="inline-flex items-center gap-0.5 rounded-xl border border-line bg-subcard p-0.5">
              {(
                Object.keys(FLIGHT_CURRENCIES) as SupportedFlightCurrency[]
              ).map((currKey) => {
                const active = currency === currKey;
                return (
                  <button
                    key={currKey}
                    type="button"
                    onClick={() => handleCurrencyChange(currKey)}
                    style={
                      active
                        ? { backgroundColor: "#1956b4", color: "#ffffff" }
                        : undefined
                    }
                    className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-extrabold uppercase transition ${
                      active
                        ? "bg-[#1956b4] text-white shadow-2xs"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {FLIGHT_CURRENCIES[currKey].symbol.trim()}{" "}
                    {currKey.toUpperCase()}
                  </button>
                );
              })}
            </div>

            {/* Bilingual Toggle */}
            <button
              type="button"
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-line bg-subcard px-2.5 py-1.5 text-xs font-bold text-ink hover:border-[#1956b4]"
            >
              <TranslateIcon className="h-3.5 w-3.5 text-[#1956b4] dark:text-blue-400" />
              <span>{lang === "en" ? "हिंदी" : "English"}</span>
            </button>

            {/* WhatsApp Share */}
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-xl bg-[#25D366]/15 px-2.5 py-1.5 text-xs font-bold text-[#128C7E] hover:bg-[#25D366]/25 dark:text-[#25D366]"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </a>
          </div>
        </div>

        {/* ixigo 5-Segment Horizontal Search Row: From | To | Departure | Travellers & Class | SEARCH */}
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 gap-2.5 lg:grid-cols-12 lg:items-stretch"
        >
          {/* FROM & TO Connected Container with Floating Swap Button */}
          <div className="relative grid grid-cols-1 gap-2 sm:grid-cols-2 lg:col-span-6">
            {/* FROM AIRPORT SEGMENT */}
            <div ref={originBoxRef} className="relative">
              <button
                type="button"
                onClick={() => togglePopover("origin")}
                className={`flex h-full w-full cursor-pointer flex-col justify-between rounded-xl border bg-subcard/70 px-3.5 py-2.5 text-left transition sm:pr-5 ${
                  activePopover === "origin"
                    ? "border-[#1956b4] bg-blue-50/50 ring-2 ring-[#1956b4]/15 dark:bg-blue-500/10"
                    : "border-line hover:border-[#1956b4]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold tracking-wider text-ink-muted uppercase">
                    {lang === "hi" ? "कहाँ से (From)" : "From"}
                  </span>
                  <span className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[11px] font-extrabold text-[#1956b4] dark:bg-blue-500/20 dark:text-blue-300">
                    {originPlace.iata}
                  </span>
                </div>
                <div className="mt-0.5 truncate text-base font-extrabold text-ink sm:text-lg">
                  {originPlace.city}
                </div>
                <div className="truncate text-[11px] text-ink-soft">
                  {originPlace.airportName}
                </div>
              </button>

              {activePopover === "origin" && renderPlacePopover("origin")}
            </div>

            {/* FLOATING IXIGO SWAP CIRCLE */}
            <button
              type="button"
              onClick={handleSwapAirports}
              title="Swap Origin and Destination"
              className="z-20 mx-auto -my-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-line bg-card text-[#1956b4] shadow-md transition hover:scale-105 hover:border-[#1956b4] hover:bg-blue-50 sm:absolute sm:top-1/2 sm:left-1/2 sm:my-0 sm:-translate-x-1/2 sm:-translate-y-1/2 dark:text-blue-300"
            >
              <SwapArrowsIcon className="h-4 w-4" />
            </button>

            {/* TO AIRPORT SEGMENT */}
            <div ref={destBoxRef} className="relative">
              <button
                type="button"
                onClick={() => togglePopover("dest")}
                className={`flex h-full w-full cursor-pointer flex-col justify-between rounded-xl border bg-subcard/70 px-3.5 py-2.5 text-left transition sm:pl-5 ${
                  activePopover === "dest"
                    ? "border-[#1956b4] bg-blue-50/50 ring-2 ring-[#1956b4]/15 dark:bg-blue-500/10"
                    : "border-line hover:border-[#1956b4]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold tracking-wider text-ink-muted uppercase">
                    {lang === "hi" ? "कहाँ तक (To)" : "To"}
                  </span>
                  <span className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[11px] font-extrabold text-[#1956b4] dark:bg-blue-500/20 dark:text-blue-300">
                    {destPlace.iata}
                  </span>
                </div>
                <div className="mt-0.5 truncate text-base font-extrabold text-ink sm:text-lg">
                  {destPlace.city}
                </div>
                <div className="truncate text-[11px] text-ink-soft">
                  {destPlace.airportName}
                </div>
              </button>

              {activePopover === "dest" && renderPlacePopover("dest")}
            </div>
          </div>

          {/* DEPARTURE DATE SEGMENT */}
          <div className="flex flex-col justify-between rounded-xl border border-line bg-subcard/70 px-3.5 py-2.5 transition hover:border-[#1956b4] lg:col-span-2">
            <div className="flex items-center justify-between gap-1">
              <label
                htmlFor="portal-departure-date"
                className="text-[10px] font-extrabold tracking-wider text-ink-muted uppercase"
              >
                {lang === "hi" ? "प्रस्थान (Departure)" : "Departure"}
              </label>
              <CalendarIcon className="h-3.5 w-3.5 text-[#1956b4] dark:text-blue-400" />
            </div>

            <input
              id="portal-departure-date"
              type="date"
              value={departureDate}
              onChange={(e) => handleDateSelect(e.target.value)}
              className="mt-0.5 w-full cursor-pointer bg-transparent font-mono text-sm font-extrabold text-ink focus:outline-none sm:text-base"
            />

            <div className="truncate text-[11px] font-medium text-ink-soft">
              {formattedSelectedDate.weekday}
            </div>
          </div>

          {/* TRAVELLERS & CABIN CLASS SEGMENT (ixigo 4th Box) */}
          <div className="flex flex-col justify-between rounded-xl border border-line bg-subcard/70 px-3.5 py-2.5 transition hover:border-[#1956b4] lg:col-span-2">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-extrabold tracking-wider text-ink-muted uppercase">
                {lang === "hi" ? "यात्री और क्लास" : "Travellers & Class"}
              </span>
              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setPassengersCount((prev) => Math.max(1, prev - 1))
                  }
                  className="flex h-4 w-4 cursor-pointer items-center justify-center rounded bg-card text-xs font-extrabold text-ink hover:text-[#1956b4]"
                  title="Decrease travellers"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPassengersCount((prev) => Math.min(9, prev + 1))
                  }
                  className="flex h-4 w-4 cursor-pointer items-center justify-center rounded bg-card text-xs font-extrabold text-ink hover:text-[#1956b4]"
                  title="Increase travellers"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-0.5 truncate text-sm font-extrabold text-ink sm:text-base">
              {passengersCount}{" "}
              {passengersCount === 1 ? "Traveller" : "Travellers"}
            </div>

            <div className="flex items-center gap-1">
              {(["Economy", "Premium Economy", "Business"] as CabinClassType[]).map(
                (cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setCabinClass(cls)}
                    className={`cursor-pointer rounded px-1.5 py-0.5 text-[10px] font-bold transition ${
                      cabinClass === cls
                        ? "bg-blue-100 text-[#1956b4] dark:bg-blue-500/25 dark:text-blue-300"
                        : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    {cls === "Premium Economy" ? "Prem" : cls}
                  </button>
                )
              )}
            </div>
          </div>

          {/* IXIGO VIBRANT ORANGE SEARCH BUTTON */}
          <div className="flex lg:col-span-2">
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: "#fc6203", color: "#ffffff" }}
              className="ta-btn-primary flex min-h-[56px] w-full cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl bg-[#fc6203] px-4 py-3 text-base font-extrabold text-white shadow-md transition hover:bg-[#e55600] disabled:opacity-60"
            >
              <div className="flex items-center gap-1.5 text-white">
                <SearchIcon className="h-4 w-4 text-white" />
                <span>{lang === "hi" ? "खोजें" : "Search"}</span>
              </div>
              <span className="text-[11px] font-bold text-white/95">
                {originPlace.iata} → {destPlace.iata}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. IXIGO 14-DAY HORIZONTAL DATE-PRICE RIBBON */}
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-subcard/50 px-4 py-2">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-ink">
            <CalendarIcon className="h-3.5 w-3.5 text-[#1956b4] dark:text-blue-400" />
            <span>
              {lang === "hi"
                ? `${routeData.origin.city} → ${routeData.destination.city} 14-दिन का सस्ता किराया कैलेंडर`
                : `14-Day Fare Calendar (${routeData.origin.city} ${routeData.origin.iata} → ${routeData.destination.city} ${routeData.destination.iata})`}
            </span>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            Cheapest Date: {routeData.formattedLowestFare}
          </span>
        </div>

        <div className="ta-no-scrollbar flex divide-x divide-line overflow-x-auto">
          {routeData.calendarFares.map((cal) => {
            const isSelected = cal.date === departureDate;
            return (
              <button
                key={cal.date}
                type="button"
                onClick={() => handleDateSelect(cal.date)}
                style={
                  isSelected
                    ? {
                        borderBottom: "3px solid #fc6203",
                        backgroundColor: "rgba(25, 86, 180, 0.06)",
                      }
                    : undefined
                }
                className={`relative flex min-w-[98px] shrink-0 cursor-pointer flex-col items-center px-3 py-2.5 text-center transition ${
                  isSelected
                    ? "bg-blue-50/70 dark:bg-blue-500/15"
                    : "hover:bg-subcard/70"
                }`}
              >
                <span
                  className={`text-[11px] font-bold ${
                    isSelected ? "text-[#1956b4] dark:text-blue-300" : "text-ink-soft"
                  }`}
                >
                  {cal.dayShort}, {cal.weekdayShort}
                </span>
                <span
                  className={`mt-0.5 font-mono text-xs font-extrabold ${
                    cal.isCheapestOfMonth
                      ? "text-emerald-700 dark:text-emerald-400"
                      : isSelected
                        ? "text-[#fc6203]"
                        : "text-ink"
                  }`}
                >
                  {cal.formattedPrice}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. IXIGO 3-TAB SORT BAR + QUICK FILTERS */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setSortBy("cheapest")}
          className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
            sortBy === "cheapest"
              ? "border-[#1956b4] bg-blue-50/70 ring-1 ring-[#1956b4] dark:bg-blue-500/15"
              : "border-line bg-card hover:border-[#1956b4]"
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
              <SparklesIcon className="h-3.5 w-3.5" />
              <span>{lang === "hi" ? "सबसे सस्ती (Cheapest)" : "Cheapest"}</span>
            </div>
            <div className="mt-0.5 font-mono text-base font-extrabold text-ink sm:text-lg">
              {cheapestOffer?.formattedPrice || routeData.formattedLowestFare}{" "}
              <span className="text-xs font-medium text-ink-soft">
                · {cheapestOffer?.durationFormatted}
              </span>
            </div>
          </div>
          <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
            LOWEST
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSortBy("fastest")}
          className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
            sortBy === "fastest"
              ? "border-[#1956b4] bg-blue-50/70 ring-1 ring-[#1956b4] dark:bg-blue-500/15"
              : "border-line bg-card hover:border-[#1956b4]"
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1956b4] dark:text-blue-300">
              <ClockIcon className="h-3.5 w-3.5" />
              <span>{lang === "hi" ? "सबसे तेज़ (Fastest)" : "Fastest"}</span>
            </div>
            <div className="mt-0.5 font-mono text-base font-extrabold text-ink sm:text-lg">
              {fastestOffer?.durationFormatted || routeData.minDurationFormatted}{" "}
              <span className="text-xs font-medium text-ink-soft">
                · {fastestOffer?.formattedPrice}
              </span>
            </div>
          </div>
          <span className="rounded bg-blue-500/15 px-2 py-0.5 text-[10px] font-extrabold text-[#1956b4] dark:text-blue-300">
            NON-STOP
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSortBy("earliest")}
          className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
            sortBy === "earliest"
              ? "border-[#1956b4] bg-blue-50/70 ring-1 ring-[#1956b4] dark:bg-blue-500/15"
              : "border-line bg-card hover:border-[#1956b4]"
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-700 dark:text-amber-400">
              <PlaneIcon className="h-3.5 w-3.5" />
              <span>
                {lang === "hi" ? "सबसे पहली (Earliest)" : "Earliest Departure"}
              </span>
            </div>
            <div className="mt-0.5 font-mono text-base font-extrabold text-ink sm:text-lg">
              {earliestOffer?.departureTime24 || routeData.firstFlightTime}{" "}
              <span className="text-xs font-medium text-ink-soft">
                · {earliestOffer?.formattedPrice}
              </span>
            </div>
          </div>
          <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 dark:text-amber-300">
            MORNING
          </span>
        </button>
      </div>

      {/* 4. AIRLINE & TIME-SLOT FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-line bg-card px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedAirline("ALL")}
            style={
              selectedAirline === "ALL"
                ? { backgroundColor: "#1956b4", color: "#ffffff" }
                : undefined
            }
            className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
              selectedAirline === "ALL"
                ? "border-[#1956b4] bg-[#1956b4] text-white"
                : "border-line bg-subcard text-ink-soft hover:text-ink"
            }`}
          >
            All Airlines ({routeData.totalFlightsCount})
          </button>

          {routeData.airlinesOperating.map((air) => (
            <button
              key={air.code}
              type="button"
              onClick={() =>
                setSelectedAirline(
                  selectedAirline === air.code ? "ALL" : air.code
                )
              }
              style={
                selectedAirline === air.code
                  ? { backgroundColor: "#1956b4", color: "#ffffff" }
                  : undefined
              }
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                selectedAirline === air.code
                  ? "border-[#1956b4] bg-[#1956b4] text-white"
                  : "border-line bg-subcard text-ink-soft hover:text-ink"
              }`}
            >
              <span>{air.name}</span>
              <span className="font-mono text-[11px] opacity-85">
                {air.formattedMinPrice}
              </span>
            </button>
          ))}
        </div>

        {/* Departure Time Slots */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", "morning", "afternoon", "evening"] as TimeSlotFilter[]).map(
            (slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTimeSlot(slot)}
                style={
                  timeSlot === slot
                    ? { backgroundColor: "#0a223d", color: "#ffffff" }
                    : undefined
                }
                className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-bold capitalize transition ${
                  timeSlot === slot
                    ? "bg-[#0a223d] text-white"
                    : "bg-subcard text-ink-soft hover:text-ink"
                }`}
              >
                {slot === "all" ? "Any Time" : slot}
              </button>
            )
          )}
        </div>
      </div>

      {/* 5. IXIGO-STYLE FLIGHT RESULT CARDS */}
      <div className="space-y-3">
        {loading && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-3.5 text-center text-xs font-extrabold text-[#1956b4] dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
            Searching live flights &amp; fares for {originPlace.city} (
            {originPlace.iata}) → {destPlace.city} ({destPlace.iata}) in{" "}
            {currency.toUpperCase()}...
          </div>
        )}

        {filteredOffers.map((offer) => {
          const liveTrackerPath = buildFlightStatusPath(
            offer.airlineCode,
            offer.flightNumber,
            offer.airlineName
          );
          const classMult = CABIN_CLASS_MULTIPLIER[cabinClass] || 1;
          const displayPerAdultPrice = Math.max(
            1,
            Math.round(offer.price * classMult)
          );

          return (
            <article
              key={offer.id}
              className="overflow-hidden rounded-2xl border border-line bg-card shadow-2xs transition hover:border-[#1956b4] hover:shadow-md"
            >
              {/* Top ixigo Tag Strip (if Cheapest or Fastest) */}
              {(offer.isCheapest || offer.isFastest) && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 bg-emerald-50/70 px-4 py-1.5 text-[11px] font-extrabold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <div className="flex items-center gap-2">
                    {offer.isCheapest && (
                      <span className="inline-flex items-center gap-1">
                        <SparklesIcon className="h-3 w-3" />
                        <span>CHEAPEST FLIGHT ON THIS ROUTE</span>
                      </span>
                    )}
                    {offer.isFastest && !offer.isCheapest && (
                      <span className="inline-flex items-center gap-1 text-[#1956b4] dark:text-blue-300">
                        <ClockIcon className="h-3 w-3" />
                        <span>FASTEST NON-STOP FLIGHT</span>
                      </span>
                    )}
                  </div>
                  <span>₹0 Portal Convenience Fee</span>
                </div>
              )}

              {/* Main ixigo Flight Row */}
              <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 md:grid-cols-12 md:items-center">
                {/* Col 1: Airline Logo & Flight Number */}
                <div className="flex items-center justify-between gap-3 md:col-span-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-white p-1.5 shadow-2xs">
                      <Image
                        src={`/api/flights/icon/${offer.airlineCode}`}
                        alt={offer.airlineName}
                        width={36}
                        height={36}
                        className="h-7 w-7 object-contain"
                        unoptimized
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-ink sm:text-base">
                        {offer.airlineName}
                      </h3>
                      <p className="font-mono text-xs font-bold text-ink-muted">
                        {offer.fullFlightCode} · {offer.aircraft}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Col 2: Departure -> Duration Timeline -> Arrival */}
                <div className="flex items-center justify-between gap-2 md:col-span-5">
                  <div className="text-left">
                    <div className="font-mono text-xl font-extrabold text-ink sm:text-2xl">
                      {offer.departureTime24}
                    </div>
                    <div className="text-xs font-extrabold text-ink">
                      {offer.originIata}{" "}
                      <span className="font-medium text-ink-soft">
                        {offer.originCity}
                      </span>
                    </div>
                    <div className="mt-0.5 inline-block rounded bg-subcard px-1.5 py-0.5 text-[10px] font-bold text-ink-muted">
                      Terminal {offer.originTerminal}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col items-center px-2 text-center">
                    <span className="font-mono text-xs font-extrabold text-ink-soft">
                      {offer.durationFormatted}
                    </span>
                    <div className="my-1.5 flex w-full max-w-[140px] items-center">
                      <span className="h-2 w-2 rounded-full border-2 border-[#1956b4] bg-card" />
                      <span className="h-0.5 flex-1 bg-line" />
                      <PlaneIcon className="mx-1.5 h-4 w-4 text-[#1956b4] dark:text-blue-400" />
                      <span className="h-0.5 flex-1 bg-line" />
                      <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        offer.transfers === 0
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                      }`}
                    >
                      {offer.stopsLabel}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-xl font-extrabold text-ink sm:text-2xl">
                      {offer.arrivalTime24}
                    </div>
                    <div className="text-xs font-extrabold text-ink">
                      {offer.destinationIata}{" "}
                      <span className="font-medium text-ink-soft">
                        {offer.destinationCity}
                      </span>
                    </div>
                    <div className="mt-0.5 inline-block rounded bg-subcard px-1.5 py-0.5 text-[10px] font-bold text-ink-muted">
                      Terminal {offer.destinationTerminal}
                    </div>
                  </div>
                </div>

                {/* Col 3: Price & Solid Vibrant Orange ixigo Book Button */}
                <div className="flex flex-col justify-between gap-3 border-t border-line pt-3 sm:flex-row sm:items-center md:col-span-4 md:justify-end md:border-t-0 md:border-l md:pt-0 md:pl-4">
                  <div className="text-left md:text-right">
                    <div className="font-mono text-2xl font-extrabold text-ink">
                      {formatFlightPrice(displayPerAdultPrice, currency)}
                    </div>
                    <div className="text-[11px] font-medium text-ink-muted">
                      per adult · {cabinClass}
                    </div>
                  </div>

                  <div className="flex flex-col items-stretch sm:items-end">
                    <button
                      type="button"
                      onClick={() => setSelectedBookingOffer(offer)}
                      style={{ backgroundColor: "#fc6203", color: "#ffffff" }}
                      className="ta-btn-primary inline-flex min-w-[125px] cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#fc6203] px-5 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:bg-[#e55600] sm:text-sm"
                    >
                      <span className="text-white">
                        {lang === "hi" ? "बुक करें (Book)" : "Book"}
                      </span>
                      <ArrowRightIcon className="h-3.5 w-3.5 text-white" />
                    </button>
                    <span className="mt-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                      Flight Details &amp; Fare →
                    </span>
                  </div>
                </div>
              </div>

              {/* ixigo Card Footer Strip: Baggage + Flight Details Drawer Trigger + Live Radar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/70 bg-subcard/40 px-4 py-2 text-[11px] text-ink-soft sm:px-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1 font-semibold">
                    <LuggageIcon className="h-3.5 w-3.5 text-[#1956b4] dark:text-blue-400" />
                    <span>
                      {offer.cabinBaggage} · {offer.checkInBaggage}
                    </span>
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <button
                    type="button"
                    onClick={() => setSelectedBookingOffer(offer)}
                    className="cursor-pointer font-bold text-[#1956b4] hover:underline dark:text-blue-400"
                  >
                    Flight Details &amp; Fare Breakup ▾
                  </button>
                </div>

                <Link
                  href={liveTrackerPath}
                  className="inline-flex items-center gap-1 font-bold text-ink-soft hover:text-[#1956b4] hover:underline dark:hover:text-blue-400"
                >
                  <span>Track {offer.fullFlightCode} Live Status</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {/* Bottom Trust & DGCA Compensation Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-card px-4 py-3 text-xs text-ink-soft">
        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
          <ShieldCheckIcon className="h-4 w-4" />
          <span>
            Verified Airport Terminals (T1/T2/T3) &amp; Live Airfares in{" "}
            {currency.toUpperCase()}
          </span>
        </span>
        <Link
          href="/air/flight-compensation"
          className="font-bold text-[#1956b4] hover:underline dark:text-blue-400"
        >
          Flight Delayed or Cancelled? Check ₹10,000–₹20,000 DGCA Claim →
        </Link>
      </div>

      {/* 6. IXIGO-STYLE FLIGHT DETAILS & FARE REVIEW DRAWER / MODAL */}
      {selectedBookingOffer && (() => {
        const classMult = CABIN_CLASS_MULTIPLIER[cabinClass] || 1;
        const perAdultTotal = Math.max(
          1,
          Math.round(selectedBookingOffer.price * classMult)
        );
        const totalPayable = perAdultTotal * passengersCount;
        const baseFareAmount = Math.max(1, Math.round(totalPayable * 0.82));
        const taxesAndFeesAmount = Math.max(
          0,
          totalPayable - baseFareAmount
        );
        const checkoutAffiliateUrl = buildAffiliateUrlWithPax(
          selectedBookingOffer.bookingUrls.primaryAffiliate,
          passengersCount
        );
        const modalLiveTrackerPath = buildFlightStatusPath(
          selectedBookingOffer.airlineCode,
          selectedBookingOffer.flightNumber,
          selectedBookingOffer.airlineName
        );

        return (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-0 backdrop-blur-xs sm:items-center sm:p-4"
            onClick={() => setSelectedBookingOffer(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="booking-review-modal-title"
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-line bg-card shadow-2xl sm:rounded-3xl"
            >
              {/* ixigo Signature Deep Navy Top Header */}
              <div
                style={{ backgroundColor: "#0a223d", color: "#ffffff" }}
                className="flex items-center justify-between border-b border-white/15 bg-[#0a223d] px-5 py-4 text-white"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      style={{ backgroundColor: "#fc6203", color: "#ffffff" }}
                      className="inline-flex items-center gap-1 rounded-full bg-[#fc6203] px-2.5 py-0.5 text-[10px] font-extrabold text-white uppercase"
                    >
                      <CheckCircleIcon className="h-3 w-3 text-white" />
                      <span>FLIGHT DETAILS &amp; FARE SUMMARY</span>
                    </span>
                    <span className="text-xs font-bold text-blue-200">
                      {formattedSelectedDate.dayMonth}
                    </span>
                  </div>
                  <h3
                    id="booking-review-modal-title"
                    className="mt-1 text-base font-extrabold text-white sm:text-lg"
                  >
                    {selectedBookingOffer.originCity} (
                    {selectedBookingOffer.originIata}) →{" "}
                    {selectedBookingOffer.destinationCity} (
                    {selectedBookingOffer.destinationIata})
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedBookingOffer(null)}
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-extrabold text-white transition hover:bg-white/20"
                  aria-label="Close flight review"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                {/* A. Complete Flight Segment Card */}
                <div className="rounded-2xl border border-line bg-subcard/60 p-4">
                  {/* Airline & Aircraft Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-white p-1.5 shadow-2xs">
                        <Image
                          src={`/api/flights/icon/${selectedBookingOffer.airlineCode}`}
                          alt={selectedBookingOffer.airlineName}
                          width={34}
                          height={34}
                          className="h-7 w-7 object-contain"
                          unoptimized
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-ink sm:text-base">
                            {selectedBookingOffer.airlineName}
                          </span>
                          <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-xs font-extrabold text-[#1956b4] dark:bg-blue-500/20 dark:text-blue-300">
                            {selectedBookingOffer.fullFlightCode}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-ink-soft">
                          {selectedBookingOffer.aircraft} · {cabinClass} Class
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${
                          selectedBookingOffer.transfers === 0
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                        }`}
                      >
                        {selectedBookingOffer.stopsLabel}
                      </span>
                    </div>
                  </div>

                  {/* Departure -> Duration -> Arrival Timeline */}
                  <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-11 sm:items-center">
                    {/* Origin Details */}
                    <div className="sm:col-span-4">
                      <div className="font-mono text-2xl font-extrabold text-ink">
                        {selectedBookingOffer.departureTime24}
                      </div>
                      <div className="mt-0.5 text-sm font-extrabold text-ink">
                        {selectedBookingOffer.originCity} (
                        {selectedBookingOffer.originIata})
                      </div>
                      <div className="truncate text-xs text-ink-soft">
                        {routeData.origin.airportName}
                      </div>
                      <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-extrabold text-[#1956b4] dark:bg-blue-500/20 dark:text-blue-300">
                        Terminal {selectedBookingOffer.originTerminal}
                      </div>
                    </div>

                    {/* Duration Visual */}
                    <div className="flex flex-col items-center justify-center py-1 text-center sm:col-span-3">
                      <span className="font-mono text-xs font-extrabold text-ink-soft">
                        {selectedBookingOffer.durationFormatted}
                      </span>
                      <div className="my-1.5 flex w-full items-center">
                        <span className="h-2.5 w-2.5 rounded-full border-2 border-[#1956b4] bg-card" />
                        <span className="h-0.5 flex-1 bg-line" />
                        <PlaneIcon className="mx-1.5 h-4 w-4 text-[#1956b4] dark:text-blue-400" />
                        <span className="h-0.5 flex-1 bg-line" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                      </div>
                      <span className="text-[11px] font-semibold text-ink-muted">
                        {routeData.aerialDistanceKm} km Aerial
                      </span>
                    </div>

                    {/* Destination Details */}
                    <div className="sm:col-span-4 sm:text-right">
                      <div className="font-mono text-2xl font-extrabold text-ink">
                        {selectedBookingOffer.arrivalTime24}
                      </div>
                      <div className="mt-0.5 text-sm font-extrabold text-ink">
                        {selectedBookingOffer.destinationCity} (
                        {selectedBookingOffer.destinationIata})
                      </div>
                      <div className="truncate text-xs text-ink-soft">
                        {routeData.destination.airportName}
                      </div>
                      <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-extrabold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                        Terminal {selectedBookingOffer.destinationTerminal}
                      </div>
                    </div>
                  </div>
                </div>

                {/* B. Baggage Allowance & DGCA Rules Grid */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <div className="rounded-xl border border-line bg-subcard/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-ink">
                      <LuggageIcon className="h-3.5 w-3.5 text-[#1956b4] dark:text-blue-400" />
                      <span>Cabin Baggage</span>
                    </div>
                    <p className="mt-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      {selectedBookingOffer.cabinBaggage} Included
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      1 Hand bag + 1 Laptop bag per adult
                    </p>
                  </div>

                  <div className="rounded-xl border border-line bg-subcard/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-ink">
                      <LuggageIcon className="h-3.5 w-3.5 text-[#1956b4] dark:text-blue-400" />
                      <span>Check-In Baggage</span>
                    </div>
                    <p className="mt-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      {selectedBookingOffer.checkInBaggage} Included
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      Standard airline check-in allowance
                    </p>
                  </div>

                  <div className="rounded-xl border border-line bg-subcard/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-ink">
                      <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-600" />
                      <span>DGCA Protection</span>
                    </div>
                    <p className="mt-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      24-Hr Free Lock-In
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      For flights &gt;7 days before departure
                    </p>
                  </div>
                </div>

                {/* C. Travellers & Cabin Class Customizer */}
                <div className="grid grid-cols-1 gap-3 rounded-2xl border border-line bg-card p-3.5 sm:grid-cols-2">
                  <div>
                    <span className="block text-[11px] font-extrabold tracking-wider text-ink-muted uppercase">
                      Number of Travellers (Adults 12+ Yrs)
                    </span>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setPassengersCount((p) => Math.max(1, p - 1))
                        }
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-line bg-subcard text-sm font-extrabold text-ink hover:border-[#1956b4]"
                      >
                        −
                      </button>
                      <span className="min-w-[90px] text-center font-mono text-sm font-extrabold text-ink">
                        {passengersCount}{" "}
                        {passengersCount === 1 ? "Traveller" : "Travellers"}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setPassengersCount((p) => Math.min(9, p + 1))
                        }
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-line bg-subcard text-sm font-extrabold text-ink hover:border-[#1956b4]"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-extrabold tracking-wider text-ink-muted uppercase">
                      Select Cabin Class
                    </span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(
                        [
                          "Economy",
                          "Premium Economy",
                          "Business",
                        ] as CabinClassType[]
                      ).map((cls) => (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => setCabinClass(cls)}
                          style={
                            cabinClass === cls
                              ? { backgroundColor: "#1956b4", color: "#ffffff" }
                              : undefined
                          }
                          className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-extrabold transition ${
                            cabinClass === cls
                              ? "border-[#1956b4] bg-[#1956b4] text-white"
                              : "border-line bg-subcard text-ink-soft hover:text-ink"
                          }`}
                        >
                          {cls}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* D. Transparent Base Fare + Taxes Breakdown */}
                <div className="rounded-2xl border border-blue-200/80 bg-blue-50/40 p-4 dark:border-blue-500/25 dark:bg-blue-500/10">
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-xs font-extrabold tracking-wider text-ink uppercase">
                      Fare Breakup ({currency.toUpperCase()})
                    </span>
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                      ZERO CONVENIENCE FEE
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-ink-soft">
                      <span>
                        Base Airfare ({passengersCount}{" "}
                        {passengersCount === 1 ? "Adult" : "Adults"} ×{" "}
                        {cabinClass})
                      </span>
                      <span className="font-mono font-bold text-ink">
                        {formatFlightPrice(baseFareAmount, currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-ink-soft">
                      <span>
                        Airport UDF, PSF, Cute Fee &amp; Aviation GST
                      </span>
                      <span className="font-mono font-bold text-ink">
                        {formatFlightPrice(taxesAndFeesAmount, currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-ink-soft">
                      <span>Portal Booking / Convenience Fee</span>
                      <span className="font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
                        FREE (0)
                      </span>
                    </div>

                    <div className="my-2 flex items-center justify-between border-t border-line pt-2.5">
                      <div>
                        <span className="text-sm font-extrabold text-ink">
                          Total Payable Fare
                        </span>
                        <p className="text-[11px] text-ink-muted">
                          Inclusive of all airport taxes for {passengersCount}{" "}
                          {passengersCount === 1 ? "traveller" : "travellers"}
                        </p>
                      </div>
                      <span className="font-mono text-2xl font-extrabold text-[#1956b4] dark:text-blue-300">
                        {formatFlightPrice(totalPayable, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ixigo Sticky Bottom Checkout Action Bar */}
              <div className="border-t border-line bg-card px-5 py-3.5 shadow-lg">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center justify-between sm:block">
                    <div>
                      <div className="font-mono text-xl font-extrabold text-ink sm:text-2xl">
                        {formatFlightPrice(totalPayable, currency)}
                      </div>
                      <div className="text-[11px] font-medium text-ink-muted">
                        {passengersCount}{" "}
                        {passengersCount === 1 ? "Traveller" : "Travellers"} ·{" "}
                        {cabinClass} · Incl. taxes
                      </div>
                    </div>

                    <Link
                      href={modalLiveTrackerPath}
                      className="inline-flex items-center gap-1 rounded-lg border border-line bg-subcard px-2.5 py-1.5 text-[11px] font-bold text-[#1956b4] hover:border-[#1956b4] sm:mt-1"
                    >
                      <span>Track {selectedBookingOffer.fullFlightCode}</span>
                      <ArrowRightIcon className="h-3 w-3" />
                    </Link>
                  </div>

                  <a
                    href={checkoutAffiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    style={{
                      backgroundColor: "#fc6203",
                      color: "#ffffff",
                      borderColor: "#e55600",
                    }}
                    className="ta-btn-primary inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#e55600] bg-[#fc6203] px-7 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-[#e55600] sm:text-base"
                  >
                    <span style={{ color: "#ffffff" }}>
                      {lang === "hi"
                        ? `चेकआउट पर जाएं (${formatFlightPrice(totalPayable, currency)})`
                        : `Proceed to Partner Checkout (${formatFlightPrice(totalPayable, currency)})`}
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-white" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
