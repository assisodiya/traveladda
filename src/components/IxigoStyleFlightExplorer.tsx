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
  ChevronDownIcon,
  ClockIcon,
  CloseIcon,
  FilterIcon,
  LuggageIcon,
  MoonIcon,
  PlaneIcon,
  RefreshIcon,
  SearchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  SunIcon,
  SwapArrowsIcon,
  TranslateIcon,
  UserCheckIcon,
  WhatsAppIcon,
} from "@/components/Icons";
import {
  buildFlightRoutePath,
  MAJOR_AIRPORT_HUBS,
  POPULAR_FLIGHT_CORRIDORS,
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
type StopsFilter = "all" | "non-stop" | "1-stop";
type TimeWindowFilter = "all" | "before6" | "morning" | "afternoon" | "evening";
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

function matchesTimeWindow(time24: string, windowFilter: TimeWindowFilter): boolean {
  if (windowFilter === "all") return true;
  const hour = Number((time24 || "00:00").split(":")[0]) || 0;
  if (windowFilter === "before6") return hour >= 0 && hour < 6;
  if (windowFilter === "morning") return hour >= 6 && hour < 12;
  if (windowFilter === "afternoon") return hour >= 12 && hour < 18;
  return hour >= 18 && hour < 24;
}

const TIME_WINDOW_OPTIONS: {
  id: TimeWindowFilter;
  shortLabel: string;
  subLabel: string;
  isNight?: boolean;
}[] = [
  { id: "before6", shortLabel: "Before 6 AM", subLabel: "Early", isNight: true },
  { id: "morning", shortLabel: "6 AM – 12 PM", subLabel: "Morning" },
  { id: "afternoon", shortLabel: "12 PM – 6 PM", subLabel: "Afternoon" },
  { id: "evening", shortLabel: "After 6 PM", subLabel: "Evening", isNight: true },
];

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

  // Popover state ("origin" | "dest" | "travellers" | null)
  const [activePopover, setActivePopover] = useState<
    "origin" | "dest" | "travellers" | null
  >(null);
  const [placeSearchTerm, setPlaceSearchTerm] = useState<string>("");
  const [placeSuggestions, setPlaceSuggestions] = useState<
    AutocompletePlaceItem[]
  >(INITIAL_POPULAR_PLACES);
  const [placeLoading, setPlaceLoading] = useState<boolean>(false);

  const originBoxRef = useRef<HTMLDivElement>(null);
  const destBoxRef = useRef<HTMLDivElement>(null);
  const travellerBoxRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const placeAbortRef = useRef<AbortController | null>(null);
  const placeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ixigo / MakeMyTrip Left-Sidebar Filter & Sort State
  const [stopsFilter, setStopsFilter] = useState<StopsFilter>("all");
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [depTimeWindow, setDepTimeWindow] = useState<TimeWindowFilter>("all");
  const [arrTimeWindow, setArrTimeWindow] = useState<TimeWindowFilter>("all");
  const [maxPriceLimit, setMaxPriceLimit] = useState<number | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortMode>("cheapest");
  const [lang, setLang] = useState<"en" | "hi">("en");

  // Travellers, Cabin & Booking Review Modal state
  const [selectedBookingOffer, setSelectedBookingOffer] =
    useState<FlightScheduleOffer | null>(null);
  const [passengersCount, setPassengersCount] = useState<number>(1);
  const [cabinClass, setCabinClass] = useState<CabinClassType>("Economy");

  // Sync state when navigating between route pages via external <Link>
  useEffect(() => {
    setRouteData(initialData);
    setOriginPlace({
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
    setDestPlace({
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
    setDepartureDate(initialData.departureDate);
    setCurrency(initialData.currency);
    setMaxPriceLimit(null);
    setSelectedAirlines([]);
  }, [
    initialData.routeSlug,
    initialData.departureDate,
    initialData.currency,
    initialData,
  ]);

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

  // Close search popovers on outside click
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
      } else if (
        activePopover === "travellers" &&
        travellerBoxRef.current &&
        !travellerBoxRef.current.contains(target)
      ) {
        setActivePopover(null);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [activePopover]);

  function togglePopover(side: "origin" | "dest" | "travellers") {
    const next = activePopover === side ? null : side;
    setActivePopover(next);
    if (next === "origin" || next === "dest") {
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
          setMaxPriceLimit(null);
          setSelectedAirlines([]);
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
    setActivePopover(null);
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

  function toggleAirlineCheckbox(code: string) {
    setSelectedAirlines((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  function resetAllFilters() {
    setStopsFilter("all");
    setSelectedAirlines([]);
    setDepTimeWindow("all");
    setArrTimeWindow("all");
    setMaxPriceLimit(null);
  }

  const formattedSelectedDate = formatDepartureDateDisplay(departureDate);
  const classMult = CABIN_CLASS_MULTIPLIER[cabinClass] || 1;

  // Compute min & max adult prices across route offers (scaled for cabin class)
  const priceBounds = useMemo(() => {
    if (routeData.offers.length === 0) {
      return { min: 1000, max: 25000 };
    }
    const scaled = routeData.offers.map((o) =>
      Math.max(1, Math.round(o.price * classMult))
    );
    const min = Math.min(...scaled);
    const max = Math.max(...scaled);
    return {
      min,
      max: max > min ? max : min + 1000,
    };
  }, [routeData.offers, classMult]);

  const effectiveMaxPrice =
    maxPriceLimit !== null
      ? Math.min(Math.max(maxPriceLimit, priceBounds.min), priceBounds.max)
      : priceBounds.max;

  const stopsSummary = useMemo(() => {
    const nonStopOffers = routeData.offers.filter((o) => o.transfers === 0);
    const oneStopOffers = routeData.offers.filter((o) => o.transfers > 0);
    const minNonStop =
      nonStopOffers.length > 0
        ? Math.min(
            ...nonStopOffers.map((o) =>
              Math.max(1, Math.round(o.price * classMult))
            )
          )
        : null;
    const minOneStop =
      oneStopOffers.length > 0
        ? Math.min(
            ...oneStopOffers.map((o) =>
              Math.max(1, Math.round(o.price * classMult))
            )
          )
        : null;
    return {
      nonStopCount: nonStopOffers.length,
      oneStopCount: oneStopOffers.length,
      minNonStop,
      minOneStop,
    };
  }, [routeData.offers, classMult]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (stopsFilter !== "all") count += 1;
    if (selectedAirlines.length > 0) count += selectedAirlines.length;
    if (depTimeWindow !== "all") count += 1;
    if (arrTimeWindow !== "all") count += 1;
    if (maxPriceLimit !== null && maxPriceLimit < priceBounds.max) count += 1;
    return count;
  }, [
    stopsFilter,
    selectedAirlines,
    depTimeWindow,
    arrTimeWindow,
    maxPriceLimit,
    priceBounds.max,
  ]);

  const filteredOffers = useMemo(() => {
    let list = [...routeData.offers];

    if (stopsFilter === "non-stop") {
      list = list.filter((o) => o.transfers === 0);
    } else if (stopsFilter === "1-stop") {
      list = list.filter((o) => o.transfers > 0);
    }

    if (selectedAirlines.length > 0) {
      const allowed = new Set(selectedAirlines);
      list = list.filter((o) => allowed.has(o.airlineCode));
    }

    if (depTimeWindow !== "all") {
      list = list.filter((o) =>
        matchesTimeWindow(o.departureTime24, depTimeWindow)
      );
    }

    if (arrTimeWindow !== "all") {
      list = list.filter((o) =>
        matchesTimeWindow(o.arrivalTime24, arrTimeWindow)
      );
    }

    if (maxPriceLimit !== null) {
      list = list.filter(
        (o) => Math.max(1, Math.round(o.price * classMult)) <= effectiveMaxPrice
      );
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
  }, [
    routeData.offers,
    stopsFilter,
    selectedAirlines,
    depTimeWindow,
    arrTimeWindow,
    maxPriceLimit,
    effectiveMaxPrice,
    classMult,
    sortBy,
  ]);

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
      <div className="absolute top-full left-0 z-50 mt-1.5 w-full min-w-[290px] overflow-hidden rounded-xl border border-line-strong bg-card shadow-2xl sm:min-w-[350px]">
        <div className="border-b border-line bg-subcard/70 p-2.5">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#1956b4]" />
            <input
              ref={searchInputRef}
              type="text"
              value={placeSearchTerm}
              onChange={(e) => handlePlaceQueryChange(e.target.value)}
              placeholder={
                lang === "hi"
                  ? "शहर या एयरपोर्ट खोजें (जैसे Delhi, Goa, Dubai)..."
                  : "Search city or airport (e.g. Delhi, Goa, Dubai)..."
              }
              className="w-full rounded-lg border border-line bg-card py-2 pr-3 pl-9 text-xs font-bold text-ink focus:border-[#1956b4] focus:outline-none sm:text-sm"
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] font-semibold text-ink-muted">
            <span>
              {placeSearchTerm.trim().length >= 2
                ? placeLoading
                  ? "Searching airports..."
                  : "Matching Airports & Cities"
                : "Popular Domestic & International Hubs"}
            </span>
            <span>9,000+ Airports</span>
          </div>
        </div>

        <div className="max-h-64 divide-y divide-line/60 overflow-y-auto p-1">
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
                  className={`flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-left transition ${
                    isDisabled
                      ? "cursor-not-allowed opacity-40"
                      : "hover:bg-subcard"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-subcard text-[#1956b4] dark:text-blue-300">
                      <PlaneIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-semibold text-ink">
                          {item.city}
                        </span>
                        <span className="rounded bg-subcard px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted">
                          {item.countryName}
                        </span>
                      </div>
                      <div className="truncate text-[11px] text-ink-muted">
                        {item.airportName}
                      </div>
                    </div>
                  </div>

                  <span className="shrink-0 rounded bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
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

  function renderFilterSidebarBody() {
    return (
      <div className="divide-y divide-line">
        {/* 1. Stops Section */}
        <div className="p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="text-xs font-extrabold tracking-wider text-ink uppercase">
              {lang === "hi"
                ? `स्टॉप्स (${routeData.origin.city} से)`
                : `Stops from ${routeData.origin.city}`}
            </h3>
            {stopsFilter !== "all" && (
              <button
                type="button"
                onClick={() => setStopsFilter("all")}
                className="cursor-pointer text-[11px] font-bold text-[#1956b4] hover:underline dark:text-blue-400"
              >
                Reset
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                setStopsFilter(stopsFilter === "non-stop" ? "all" : "non-stop")
              }
              className={`flex cursor-pointer flex-col items-center rounded-xl border px-2.5 py-2 text-center transition ${
                stopsFilter === "non-stop"
                  ? "border-[#1956b4] bg-blue-50/90 text-[#1956b4] ring-1 ring-[#1956b4] dark:bg-blue-500/20 dark:text-blue-300"
                  : "border-line bg-subcard/60 text-ink hover:border-[#1956b4]"
              }`}
            >
              <span className="text-xs font-extrabold">Non-Stop</span>
              <span className="mt-0.5 font-mono text-[11px] font-bold text-ink-soft">
                {stopsSummary.minNonStop !== null
                  ? formatFlightPrice(stopsSummary.minNonStop, currency)
                  : `${stopsSummary.nonStopCount} flights`}
              </span>
            </button>

            <button
              type="button"
              disabled={stopsSummary.oneStopCount === 0}
              onClick={() =>
                setStopsFilter(stopsFilter === "1-stop" ? "all" : "1-stop")
              }
              className={`flex flex-col items-center rounded-xl border px-2.5 py-2 text-center transition ${
                stopsSummary.oneStopCount === 0
                  ? "cursor-not-allowed border-line bg-subcard/30 opacity-45"
                  : stopsFilter === "1-stop"
                    ? "cursor-pointer border-[#1956b4] bg-blue-50/90 text-[#1956b4] ring-1 ring-[#1956b4] dark:bg-blue-500/20 dark:text-blue-300"
                    : "cursor-pointer border-line bg-subcard/60 text-ink hover:border-[#1956b4]"
              }`}
            >
              <span className="text-xs font-extrabold">1 Stop</span>
              <span className="mt-0.5 font-mono text-[11px] font-bold text-ink-soft">
                {stopsSummary.minOneStop !== null
                  ? formatFlightPrice(stopsSummary.minOneStop, currency)
                  : "None"}
              </span>
            </button>
          </div>
        </div>

        {/* 2. One-Way Price Range Slider */}
        <div className="p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-xs font-extrabold tracking-wider text-ink uppercase">
              {lang === "hi" ? "अधिकतम किराया" : "One-Way Price"}
            </h3>
            <span className="font-mono text-xs font-extrabold text-[#1956b4] dark:text-blue-300">
              Up to {formatFlightPrice(effectiveMaxPrice, currency)}
            </span>
          </div>

          <input
            type="range"
            min={priceBounds.min}
            max={priceBounds.max}
            step={Math.max(1, Math.round((priceBounds.max - priceBounds.min) / 40))}
            value={effectiveMaxPrice}
            onChange={(e) => {
              const nextVal = Number(e.target.value);
              setMaxPriceLimit(nextVal >= priceBounds.max ? null : nextVal);
            }}
            aria-label="Maximum flight price"
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#1956b4] dark:bg-slate-700"
          />

          <div className="mt-1.5 flex items-center justify-between font-mono text-[11px] font-semibold text-ink-muted">
            <span>{formatFlightPrice(priceBounds.min, currency)}</span>
            <span>{formatFlightPrice(priceBounds.max, currency)}</span>
          </div>
        </div>

        {/* 3. Departure Time Slots (2x2 MakeMyTrip / ixigo Grid) */}
        <div className="p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="text-xs font-extrabold tracking-wider text-ink uppercase">
              {lang === "hi"
                ? `प्रस्थान समय (${routeData.origin.iata})`
                : `Departure from ${routeData.origin.city}`}
            </h3>
            {depTimeWindow !== "all" && (
              <button
                type="button"
                onClick={() => setDepTimeWindow("all")}
                className="cursor-pointer text-[11px] font-bold text-[#1956b4] hover:underline dark:text-blue-400"
              >
                Reset
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {TIME_WINDOW_OPTIONS.map((slot) => {
              const isSelected = depTimeWindow === slot.id;
              return (
                <button
                  key={`dep-${slot.id}`}
                  type="button"
                  onClick={() =>
                    setDepTimeWindow(isSelected ? "all" : slot.id)
                  }
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border px-2 py-2 text-center transition ${
                    isSelected
                      ? "border-[#1956b4] bg-blue-50/90 text-[#1956b4] ring-1 ring-[#1956b4] dark:bg-blue-500/20 dark:text-blue-300"
                      : "border-line bg-subcard/60 text-ink hover:border-[#1956b4]"
                  }`}
                >
                  {slot.isNight ? (
                    <MoonIcon className="mb-1 h-3.5 w-3.5 text-ink-soft" />
                  ) : (
                    <SunIcon className="mb-1 h-3.5 w-3.5 text-amber-500" />
                  )}
                  <span className="text-[11px] font-extrabold leading-tight">
                    {slot.shortLabel}
                  </span>
                  <span className="text-[10px] font-medium text-ink-muted">
                    {slot.subLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Arrival Time Slots */}
        <div className="p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="text-xs font-extrabold tracking-wider text-ink uppercase">
              {lang === "hi"
                ? `आगमन समय (${routeData.destination.iata})`
                : `Arrival at ${routeData.destination.city}`}
            </h3>
            {arrTimeWindow !== "all" && (
              <button
                type="button"
                onClick={() => setArrTimeWindow("all")}
                className="cursor-pointer text-[11px] font-bold text-[#1956b4] hover:underline dark:text-blue-400"
              >
                Reset
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {TIME_WINDOW_OPTIONS.map((slot) => {
              const isSelected = arrTimeWindow === slot.id;
              return (
                <button
                  key={`arr-${slot.id}`}
                  type="button"
                  onClick={() =>
                    setArrTimeWindow(isSelected ? "all" : slot.id)
                  }
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border px-2 py-2 text-center transition ${
                    isSelected
                      ? "border-[#1956b4] bg-blue-50/90 text-[#1956b4] ring-1 ring-[#1956b4] dark:bg-blue-500/20 dark:text-blue-300"
                      : "border-line bg-subcard/60 text-ink hover:border-[#1956b4]"
                  }`}
                >
                  <span className="text-[11px] font-extrabold leading-tight">
                    {slot.shortLabel}
                  </span>
                  <span className="text-[10px] font-medium text-ink-muted">
                    {slot.subLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Airlines Checkbox List (MMT / ixigo Sidebar Style) */}
        <div className="p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="text-xs font-extrabold tracking-wider text-ink uppercase">
              {lang === "hi" ? "एयरलाइंस (Airlines)" : "Airlines"}
            </h3>
            {selectedAirlines.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedAirlines([])}
                className="cursor-pointer text-[11px] font-bold text-[#1956b4] hover:underline dark:text-blue-400"
              >
                Clear
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {routeData.airlinesOperating.map((air) => {
              const checked = selectedAirlines.includes(air.code);
              const scaledAirMin = Math.max(
                1,
                Math.round(air.minPrice * classMult)
              );
              return (
                <label
                  key={air.code}
                  className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl px-2.5 py-2 transition ${
                    checked
                      ? "bg-blue-50/80 dark:bg-blue-500/15"
                      : "hover:bg-subcard/70"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAirlineCheckbox(air.code)}
                      className="h-4 w-4 shrink-0 cursor-pointer rounded border-line-strong accent-[#1956b4]"
                    />
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-white p-0.5">
                      <Image
                        src={`/api/flights/icon/${air.code}`}
                        alt={air.name}
                        width={20}
                        height={20}
                        className="h-4 w-4 object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="block truncate text-xs font-bold text-ink">
                        {air.name}
                      </span>
                      <span className="text-[10px] text-ink-muted">
                        {air.flightCount}{" "}
                        {air.flightCount === 1 ? "flight" : "flights"}
                      </span>
                    </div>
                  </div>

                  <span className="shrink-0 font-mono text-xs font-extrabold text-ink">
                    {formatFlightPrice(scaledAirMin, currency)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. HOME-PAGE HERO-WIDGET STYLE UNIFIED FLIGHT SEARCH CARD */}
      <div className="w-full max-w-full rounded-2xl border border-line bg-card shadow-xl shadow-slate-900/10 dark:shadow-black/40">
        {/* Top OTA Service Tab Bar (Matches HeroSearchWidget.tsx on Home Page) */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-2xl border-b border-line px-3.5 pt-2.5 pb-2 sm:px-6 sm:pt-3 sm:pb-0">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            <span className="relative inline-flex items-center gap-1.5 rounded-xl bg-blue-50/90 px-3 py-2 text-xs font-bold text-[#1956b4] sm:rounded-none sm:bg-transparent sm:px-4 sm:py-3 sm:text-sm dark:bg-blue-500/15 dark:text-blue-400 sm:dark:bg-transparent">
              <PlaneIcon className="h-4 w-4" />
              <span>
                {lang === "hi" ? "वन-वे फ्लाइट्स" : "One-Way Flights"}
              </span>
              <span className="hidden sm:absolute sm:right-0 sm:bottom-0 sm:left-0 sm:block sm:h-[3px] sm:rounded-t-full sm:bg-[#fc6203]" />
            </span>

            <Link
              href="/air/flight-status"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-ink-muted transition hover:text-ink sm:px-3.5 sm:py-3 sm:text-sm"
            >
              <ClockIcon className="h-4 w-4" />
              <span>Live Flight Status</span>
            </Link>

            <Link
              href="/air/flight-compensation"
              className="hidden items-center gap-1.5 rounded-xl px-3.5 py-3 text-sm font-bold text-ink-muted transition hover:text-ink md:inline-flex"
            >
              <ShieldCheckIcon className="h-4 w-4" />
              <span>DGCA Compensation</span>
            </Link>
          </div>

          {/* Right Utility Strip: Multi-Currency + Language + Share */}
          <div className="flex flex-wrap items-center gap-1.5 sm:pb-2">
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
                    className={`cursor-pointer rounded-lg px-2 py-1 text-[11px] font-extrabold uppercase transition sm:px-2.5 ${
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

            <button
              type="button"
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-line bg-subcard px-2.5 py-1 text-xs font-bold text-ink hover:border-[#1956b4]"
            >
              <TranslateIcon className="h-3.5 w-3.5 text-[#1956b4] dark:text-blue-400" />
              <span>{lang === "en" ? "हिंदी" : "EN"}</span>
            </button>

            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-xl bg-[#25D366]/15 px-2.5 py-1 text-xs font-bold text-[#128C7E] hover:bg-[#25D366]/25 dark:text-[#25D366]"
              title="Share flight schedule on WhatsApp"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </a>
          </div>
        </div>

        {/* Search Body — Exact Divided Connected Strip Like HeroSearchWidget.tsx */}
        <div className="min-w-0 p-3.5 sm:p-6">
          <form onSubmit={handleSearchSubmit} className="min-w-0 space-y-3.5">
            <div className="grid min-w-0 divide-y divide-line rounded-xl border border-line-strong bg-input lg:grid-cols-[1.22fr_1.22fr_0.88fr_0.98fr_auto] lg:divide-x lg:divide-y-0">
              {/* Cell 1: From (Origin Airport) */}
              <div
                ref={originBoxRef}
                className="relative min-w-0 px-3.5 py-2.5 lg:pr-6"
              >
                <span className="block text-[11px] font-semibold tracking-wide text-ink-muted uppercase">
                  {lang === "hi" ? "कहाँ से (From)" : "From"}
                </span>
                <button
                  type="button"
                  onClick={() => togglePopover("origin")}
                  className="mt-1 flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 text-left focus:outline-none"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <PlaneIcon className="h-4 w-4 shrink-0 text-[#1956b4] dark:text-blue-400" />
                    <span className="truncate text-sm font-bold text-ink sm:text-base">
                      {originPlace.city}
                    </span>
                    <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-bold text-ink-soft dark:bg-slate-800">
                      {originPlace.iata}
                    </span>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink-muted" />
                </button>
                <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                  {originPlace.airportName}
                </p>

                {activePopover === "origin" && renderPlacePopover("origin")}

                {/* Swap Airports Circle on Divider */}
                <button
                  type="button"
                  onClick={handleSwapAirports}
                  title="Swap Origin and Destination"
                  className="absolute right-3 -bottom-3.5 z-30 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-card text-[#1956b4] shadow-sm transition hover:scale-105 hover:border-[#1956b4] lg:top-1/2 lg:-right-3.5 lg:bottom-auto lg:-translate-y-1/2 dark:text-blue-300"
                >
                  <SwapArrowsIcon className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Cell 2: To (Destination Airport) */}
              <div
                ref={destBoxRef}
                className="relative min-w-0 px-3.5 py-2.5 lg:pl-6"
              >
                <span className="block text-[11px] font-semibold tracking-wide text-ink-muted uppercase">
                  {lang === "hi" ? "कहाँ तक (To)" : "To"}
                </span>
                <button
                  type="button"
                  onClick={() => togglePopover("dest")}
                  className="mt-1 flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 text-left focus:outline-none"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <PlaneIcon className="h-4 w-4 shrink-0 text-[#fc6203]" />
                    <span className="truncate text-sm font-bold text-ink sm:text-base">
                      {destPlace.city}
                    </span>
                    <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-bold text-ink-soft dark:bg-slate-800">
                      {destPlace.iata}
                    </span>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink-muted" />
                </button>
                <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                  {destPlace.airportName}
                </p>

                {activePopover === "dest" && renderPlacePopover("dest")}
              </div>

              {/* Cell 3: Departure Date */}
              <div className="min-w-0 px-3.5 py-2.5">
                <label
                  htmlFor="portal-departure-date"
                  className="block text-[11px] font-semibold tracking-wide text-ink-muted uppercase"
                >
                  {lang === "hi" ? "प्रस्थान तिथि" : "Departure Date"}
                </label>
                <input
                  id="portal-departure-date"
                  type="date"
                  value={departureDate}
                  onChange={(e) => handleDateSelect(e.target.value)}
                  className="mt-1 block w-full max-w-full min-w-0 cursor-pointer bg-transparent text-sm font-bold text-ink focus:outline-none sm:text-base"
                />
                <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                  {formattedSelectedDate.weekday}
                </p>
              </div>

              {/* Cell 4: Travellers & Cabin Class */}
              <div
                ref={travellerBoxRef}
                className="relative min-w-0 px-3.5 py-2.5"
              >
                <span className="block text-[11px] font-semibold tracking-wide text-ink-muted uppercase">
                  {lang === "hi" ? "यात्री व क्लास" : "Travellers & Class"}
                </span>
                <button
                  type="button"
                  onClick={() => togglePopover("travellers")}
                  className="mt-1 flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 text-left focus:outline-none"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <UserCheckIcon className="h-4 w-4 shrink-0 text-[#1956b4] dark:text-blue-400" />
                    <span className="truncate text-sm font-bold text-ink sm:text-base">
                      {passengersCount}{" "}
                      {passengersCount === 1 ? "Traveller" : "Travellers"}
                    </span>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink-muted" />
                </button>
                <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                  {cabinClass}
                </p>

                {activePopover === "travellers" && (
                  <div className="absolute top-full right-0 left-0 z-50 mt-1.5 min-w-[260px] rounded-xl border border-line-strong bg-card p-4 shadow-2xl sm:left-auto sm:w-72">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-xs font-extrabold text-ink">
                          Adults (12+ yrs)
                        </span>
                        <span className="text-[11px] text-ink-muted">
                          On the day of travel
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPassengersCount((p) => Math.max(1, p - 1))
                          }
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-line bg-subcard text-sm font-extrabold text-ink hover:border-[#1956b4]"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-mono text-sm font-extrabold text-ink">
                          {passengersCount}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setPassengersCount((p) => Math.min(9, p + 1))
                          }
                          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-line bg-subcard text-sm font-extrabold text-ink hover:border-[#1956b4]"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="mt-3.5 border-t border-line pt-3">
                      <span className="block text-[11px] font-bold tracking-wider text-ink-muted uppercase">
                        Cabin Class
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
                            className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
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

                    <button
                      type="button"
                      onClick={() => setActivePopover(null)}
                      className="ta-btn-primary mt-3.5 w-full cursor-pointer rounded-lg py-2 text-xs font-bold uppercase tracking-wide"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Cell 5: Vibrant Orange Search CTA (Matches HeroSearchWidget.tsx) */}
              <div className="flex items-stretch p-1.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="ta-btn-primary inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-7 py-3 text-sm font-bold tracking-wide uppercase disabled:opacity-60 lg:w-auto"
                >
                  {loading ? (
                    <>
                      <RefreshIcon className="h-4 w-4 animate-spin text-white" />
                      <span>Searching</span>
                    </>
                  ) : (
                    <span>{lang === "hi" ? "खोजें" : "Search"}</span>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Route Chips Row (Exact Match to Home Page Popular Flights Chips) */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs sm:gap-2">
              <span className="shrink-0 font-medium text-ink-muted">
                {lang === "hi" ? "लोकप्रिय रूट्स:" : "Popular Routes:"}
              </span>
              {POPULAR_FLIGHT_CORRIDORS.slice(0, 6).map((item) => {
                const isCurrent =
                  originPlace.iata === item.fromIata &&
                  destPlace.iata === item.toIata;
                return (
                  <button
                    key={`chip-${item.fromIata}-${item.toIata}`}
                    type="button"
                    onClick={() =>
                      void loadRouteData(
                        item.fromIata,
                        item.toIata,
                        departureDate,
                        currency,
                        true
                      )
                    }
                    className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium transition ${
                      isCurrent
                        ? "border-[#1956b4] bg-blue-50/90 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                        : "border-line bg-subcard text-ink-soft hover:border-[#1956b4] hover:text-[#1956b4]"
                    }`}
                  >
                    <PlaneIcon className="h-3 w-3 text-[#1956b4] dark:text-blue-400" />
                    <span className="font-mono font-semibold text-ink">
                      {item.fromIata} → {item.toIata}
                    </span>
                  </button>
                );
              })}

              <span className="ml-auto hidden items-center gap-1 text-[11px] font-bold text-emerald-700 md:inline-flex dark:text-emerald-400">
                <ShieldCheckIcon className="h-3.5 w-3.5" />
                <span>Zero Convenience Fee</span>
              </span>
            </div>
          </form>
        </div>
      </div>

      {/* MOBILE FILTER BAR (< md screens only) */}
      <div className="md:hidden">
        <div className="flex items-center justify-between gap-2 rounded-xl border border-line bg-card px-3.5 py-2.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            className="inline-flex cursor-pointer items-center gap-2 text-xs font-extrabold text-ink"
          >
            <FilterIcon className="h-4 w-4 text-[#1956b4]" />
            <span>
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </span>
            <ChevronDownIcon
              className={`h-3.5 w-3.5 text-ink-muted transition ${
                mobileFiltersOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                setStopsFilter(stopsFilter === "non-stop" ? "all" : "non-stop")
              }
              className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${
                stopsFilter === "non-stop"
                  ? "border-[#1956b4] bg-[#1956b4] text-white"
                  : "border-line bg-subcard text-ink-soft"
              }`}
            >
              Non-Stop
            </button>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="cursor-pointer px-1.5 text-[11px] font-bold text-[#fc6203]"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {mobileFiltersOpen && (
          <div className="mt-2 overflow-hidden rounded-2xl border border-line bg-card shadow-lg">
            {renderFilterSidebarBody()}
            <div className="border-t border-line bg-subcard/60 p-3">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="ta-btn-primary w-full cursor-pointer rounded-xl py-2.5 text-xs font-extrabold uppercase tracking-wide"
              >
                Show {filteredOffers.length} Flights
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. IXIGO / MAKEMYTRIP 2-COLUMN LAYOUT ON MD+ SCREENS: LEFT SIDEBAR FILTERS + RIGHT RESULTS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[252px_minmax(0,1fr)] md:items-start lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-5">
        {/* LEFT FILTER SIDEBAR (Visible on md+ screens, sticky like MMT & ixigo) */}
        <aside
          aria-label="Flight Search Filters"
          className="hidden overflow-hidden rounded-2xl border border-line bg-card shadow-2xs md:sticky md:top-20 md:block"
        >
          <div className="flex items-center justify-between border-b border-line bg-subcard/60 px-4 py-3.5">
            <div>
              <div className="flex items-center gap-1.5 text-sm font-extrabold text-ink">
                <FilterIcon className="h-4 w-4 text-[#1956b4] dark:text-blue-400" />
                <span>{lang === "hi" ? "फ़िल्टर (Filters)" : "Filters"}</span>
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-[#1956b4] px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] text-ink-muted">
                Showing {filteredOffers.length} of {routeData.offers.length}{" "}
                flights
              </p>
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="cursor-pointer text-xs font-extrabold text-[#fc6203] hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          {renderFilterSidebarBody()}
        </aside>

        {/* RIGHT MAIN FLIGHT RESULTS COLUMN */}
        <div className="min-w-0 space-y-3.5">
          {/* A. 14-DAY HORIZONTAL DATE-PRICE RIBBON */}
          <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-subcard/50 px-4 py-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-ink">
                <CalendarIcon className="h-3.5 w-3.5 text-[#1956b4] dark:text-blue-400" />
                <span>
                  {lang === "hi"
                    ? `${routeData.origin.city} → ${routeData.destination.city} 14-दिन किराया कैलेंडर`
                    : `14-Day Fare Calendar (${routeData.origin.city} ${routeData.origin.iata} → ${routeData.destination.city} ${routeData.destination.iata})`}
                </span>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                Lowest: {routeData.formattedLowestFare}
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
                    className={`relative flex min-w-[94px] shrink-0 cursor-pointer flex-col items-center px-3 py-2.5 text-center transition ${
                      isSelected
                        ? "bg-blue-50/70 dark:bg-blue-500/15"
                        : "hover:bg-subcard/70"
                    }`}
                  >
                    <span
                      className={`text-[11px] font-bold ${
                        isSelected
                          ? "text-[#1956b4] dark:text-blue-300"
                          : "text-ink-soft"
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

          {/* B. IXIGO / MMT 3-TAB SORT BAR */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setSortBy("cheapest")}
              className={`flex cursor-pointer items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition ${
                sortBy === "cheapest"
                  ? "border-[#1956b4] bg-blue-50/70 ring-1 ring-[#1956b4] dark:bg-blue-500/15"
                  : "border-line bg-card hover:border-[#1956b4]"
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                  <SparklesIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {lang === "hi" ? "सबसे सस्ती" : "Cheapest"}
                  </span>
                </div>
                <div className="mt-0.5 truncate font-mono text-sm font-extrabold text-ink sm:text-base">
                  {cheapestOffer
                    ? formatFlightPrice(
                        Math.max(1, Math.round(cheapestOffer.price * classMult)),
                        currency
                      )
                    : routeData.formattedLowestFare}{" "}
                  <span className="text-[11px] font-medium text-ink-soft">
                    · {cheapestOffer?.durationFormatted}
                  </span>
                </div>
              </div>
              <span className="shrink-0 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                LOWEST
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSortBy("fastest")}
              className={`flex cursor-pointer items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition ${
                sortBy === "fastest"
                  ? "border-[#1956b4] bg-blue-50/70 ring-1 ring-[#1956b4] dark:bg-blue-500/15"
                  : "border-line bg-card hover:border-[#1956b4]"
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1956b4] dark:text-blue-300">
                  <ClockIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {lang === "hi" ? "सबसे तेज़" : "Fastest"}
                  </span>
                </div>
                <div className="mt-0.5 truncate font-mono text-sm font-extrabold text-ink sm:text-base">
                  {fastestOffer?.durationFormatted ||
                    routeData.minDurationFormatted}{" "}
                  <span className="text-[11px] font-medium text-ink-soft">
                    ·{" "}
                    {fastestOffer
                      ? formatFlightPrice(
                          Math.max(
                            1,
                            Math.round(fastestOffer.price * classMult)
                          ),
                          currency
                        )
                      : ""}
                  </span>
                </div>
              </div>
              <span className="shrink-0 rounded bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-extrabold text-[#1956b4] dark:text-blue-300">
                DIRECT
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSortBy("earliest")}
              className={`flex cursor-pointer items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition ${
                sortBy === "earliest"
                  ? "border-[#1956b4] bg-blue-50/70 ring-1 ring-[#1956b4] dark:bg-blue-500/15"
                  : "border-line bg-card hover:border-[#1956b4]"
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-700 dark:text-amber-400">
                  <PlaneIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {lang === "hi" ? "सबसे पहली" : "Earliest"}
                  </span>
                </div>
                <div className="mt-0.5 truncate font-mono text-sm font-extrabold text-ink sm:text-base">
                  {earliestOffer?.departureTime24 || routeData.firstFlightTime}{" "}
                  <span className="text-[11px] font-medium text-ink-soft">
                    ·{" "}
                    {earliestOffer
                      ? formatFlightPrice(
                          Math.max(
                            1,
                            Math.round(earliestOffer.price * classMult)
                          ),
                          currency
                        )
                      : ""}
                  </span>
                </div>
              </div>
              <span className="shrink-0 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-700 dark:text-amber-300">
                FIRST
              </span>
            </button>
          </div>

          {/* C. ACTIVE FILTER PILLS BAR (When user activates sidebar filters) */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-line bg-card px-3.5 py-2 text-xs">
              <span className="font-bold text-ink-muted">Active Filters:</span>
              {stopsFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setStopsFilter("all")}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 font-bold text-[#1956b4] dark:bg-blue-500/20 dark:text-blue-300"
                >
                  <span>
                    {stopsFilter === "non-stop" ? "Non-Stop" : "1 Stop"}
                  </span>
                  <CloseIcon className="h-3 w-3" />
                </button>
              )}
              {depTimeWindow !== "all" && (
                <button
                  type="button"
                  onClick={() => setDepTimeWindow("all")}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 font-bold text-[#1956b4] dark:bg-blue-500/20 dark:text-blue-300"
                >
                  <span>
                    Dep:{" "}
                    {
                      TIME_WINDOW_OPTIONS.find((t) => t.id === depTimeWindow)
                        ?.shortLabel
                    }
                  </span>
                  <CloseIcon className="h-3 w-3" />
                </button>
              )}
              {arrTimeWindow !== "all" && (
                <button
                  type="button"
                  onClick={() => setArrTimeWindow("all")}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 font-bold text-[#1956b4] dark:bg-blue-500/20 dark:text-blue-300"
                >
                  <span>
                    Arr:{" "}
                    {
                      TIME_WINDOW_OPTIONS.find((t) => t.id === arrTimeWindow)
                        ?.shortLabel
                    }
                  </span>
                  <CloseIcon className="h-3 w-3" />
                </button>
              )}
              {selectedAirlines.map((code) => {
                const airName =
                  routeData.airlinesOperating.find((a) => a.code === code)
                    ?.name || code;
                return (
                  <button
                    key={`pill-${code}`}
                    type="button"
                    onClick={() => toggleAirlineCheckbox(code)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 font-bold text-[#1956b4] dark:bg-blue-500/20 dark:text-blue-300"
                  >
                    <span>{airName}</span>
                    <CloseIcon className="h-3 w-3" />
                  </button>
                );
              })}
              {maxPriceLimit !== null && maxPriceLimit < priceBounds.max && (
                <button
                  type="button"
                  onClick={() => setMaxPriceLimit(null)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 font-bold text-[#1956b4] dark:bg-blue-500/20 dark:text-blue-300"
                >
                  <span>
                    Max {formatFlightPrice(effectiveMaxPrice, currency)}
                  </span>
                  <CloseIcon className="h-3 w-3" />
                </button>
              )}

              <button
                type="button"
                onClick={resetAllFilters}
                className="ml-auto cursor-pointer font-extrabold text-[#fc6203] hover:underline"
              >
                Reset All
              </button>
            </div>
          )}

          {/* D. FLIGHT RESULT CARDS */}
          <div className="space-y-3">
            {loading && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-3.5 text-center text-xs font-extrabold text-[#1956b4] dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
                Searching live flights &amp; fares for {originPlace.city} (
                {originPlace.iata}) → {destPlace.city} ({destPlace.iata}) in{" "}
                {currency.toUpperCase()}...
              </div>
            )}

            {!loading && filteredOffers.length === 0 ? (
              <div className="rounded-2xl border border-line bg-card px-6 py-10 text-center shadow-2xs">
                <p className="text-base font-extrabold text-ink">
                  No flights match your selected filters
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  Try relaxing your departure time window, airline selection, or
                  price slider to see all {routeData.offers.length} flights on{" "}
                  {routeData.origin.city} → {routeData.destination.city}.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="ta-btn-primary mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide"
                >
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              filteredOffers.map((offer) => {
                const liveTrackerPath = buildFlightStatusPath(
                  offer.airlineCode,
                  offer.flightNumber,
                  offer.airlineName
                );
                const displayPerAdultPrice = Math.max(
                  1,
                  Math.round(offer.price * classMult)
                );

                return (
                  <article
                    key={offer.id}
                    className="overflow-hidden rounded-2xl border border-line bg-card shadow-2xs transition hover:border-[#1956b4] hover:shadow-md"
                  >
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

                    {/* Main Flight Card Row */}
                    <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 lg:grid-cols-12 lg:items-center">
                      {/* Col 1: Airline Logo & Flight Number */}
                      <div className="flex items-center justify-between gap-3 lg:col-span-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-white p-1.5 shadow-2xs">
                            <Image
                              src={`/api/flights/icon/${offer.airlineCode}`}
                              alt={offer.airlineName}
                              width={32}
                              height={32}
                              className="h-6 w-6 object-contain"
                              unoptimized
                            />
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-extrabold text-ink sm:text-base">
                              {offer.airlineName}
                            </h3>
                            <p className="truncate font-mono text-xs font-bold text-ink-muted">
                              {offer.fullFlightCode} · {offer.aircraft}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Col 2: Departure -> Duration Timeline -> Arrival */}
                      <div className="flex items-center justify-between gap-2 lg:col-span-5">
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
                          <div className="my-1.5 flex w-full max-w-[130px] items-center">
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

                      {/* Col 3: Price & Solid Vibrant Orange Book Button */}
                      <div className="flex items-center justify-between gap-3 border-t border-line pt-3 lg:col-span-4 lg:justify-end lg:border-t-0 lg:border-l lg:pt-0 lg:pl-4">
                        <div className="text-left lg:text-right">
                          <div className="font-mono text-xl font-extrabold text-ink sm:text-2xl">
                            {formatFlightPrice(displayPerAdultPrice, currency)}
                          </div>
                          <div className="text-[11px] font-medium text-ink-muted">
                            per adult · {cabinClass}
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <button
                            type="button"
                            onClick={() => setSelectedBookingOffer(offer)}
                            style={{
                              backgroundColor: "#fc6203",
                              color: "#ffffff",
                            }}
                            className="ta-btn-primary inline-flex min-w-[116px] cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#fc6203] px-5 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:bg-[#e55600] sm:text-sm"
                          >
                            <span className="text-white">
                              {lang === "hi" ? "बुक करें" : "Book"}
                            </span>
                            <ArrowRightIcon className="h-3.5 w-3.5 text-white" />
                          </button>
                          <span className="mt-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                            Details &amp; Fare →
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Strip */}
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
              })
            )}
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
        </div>
      </div>

      {/* 3. FLIGHT DETAILS & FARE REVIEW DRAWER / MODAL */}
      {selectedBookingOffer &&
        (() => {
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

                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                  <div className="rounded-2xl border border-line bg-subcard/60 p-4">
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

                    <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-11 sm:items-center">
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
                                ? {
                                    backgroundColor: "#1956b4",
                                    color: "#ffffff",
                                  }
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
