"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  PlaneIcon,
  SearchIcon,
  ShieldCheckIcon,
  SwapArrowsIcon,
  TranslateIcon,
  WhatsAppIcon,
} from "@/components/Icons";
import {
  buildFlightRoutePath,
  MAJOR_AIRPORT_HUBS,
  type FlightRoutePageData,
} from "@/lib/flight-booking-types";
import { buildFlightStatusPath } from "@/lib/flight-types";
import {
  FLIGHT_CURRENCIES,
  type SupportedFlightCurrency,
} from "@/lib/travelpayouts-config";

interface IxigoStyleFlightExplorerProps {
  initialData: FlightRoutePageData;
}

type SortMode = "cheapest" | "fastest" | "earliest";
type TimeSlotFilter = "all" | "morning" | "afternoon" | "evening";

export function IxigoStyleFlightExplorer({
  initialData,
}: IxigoStyleFlightExplorerProps) {
  const router = useRouter();
  const [routeData, setRouteData] = useState<FlightRoutePageData>(initialData);
  const [originIata, setOriginIata] = useState<string>(initialData.origin.iata);
  const [destIata, setDestIata] = useState<string>(
    initialData.destination.iata
  );
  const [departureDate, setDepartureDate] = useState<string>(
    initialData.departureDate
  );
  const [currency, setCurrency] = useState<SupportedFlightCurrency>(
    initialData.currency
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [nonStopOnly, setNonStopOnly] = useState<boolean>(false);
  const [selectedAirline, setSelectedAirline] = useState<string>("ALL");
  const [timeSlot, setTimeSlot] = useState<TimeSlotFilter>("all");
  const [sortBy, setSortBy] = useState<SortMode>("cheapest");
  const [lang, setLang] = useState<"en" | "hi">("en");

  async function loadRouteData(
    nextOrigin: string,
    nextDest: string,
    nextDate: string,
    nextCurrency: SupportedFlightCurrency,
    pushRoute = false
  ) {
    if (nextOrigin === nextDest) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        origin: nextOrigin,
        destination: nextDest,
        date: nextDate,
        currency: nextCurrency,
      });
      const res = await fetch(`/api/flights/fares?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json?.success && json?.data) {
          setRouteData(json.data);
          if (pushRoute) {
            const targetPath = buildFlightRoutePath(nextOrigin, nextDest);
            router.push(targetPath, { scroll: false });
          }
        }
      }
    } catch {
      // Keep existing state on transient error
    } finally {
      setLoading(false);
    }
  }

  function handleSwapAirports() {
    const nextOrigin = destIata;
    const nextDest = originIata;
    setOriginIata(nextOrigin);
    setDestIata(nextDest);
    void loadRouteData(nextOrigin, nextDest, departureDate, currency, true);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    void loadRouteData(originIata, destIata, departureDate, currency, true);
  }

  function handleDateSelect(nextDate: string) {
    setDepartureDate(nextDate);
    void loadRouteData(originIata, destIata, nextDate, currency, false);
  }

  function handleCurrencyChange(nextCurrency: SupportedFlightCurrency) {
    setCurrency(nextCurrency);
    void loadRouteData(originIata, destIata, departureDate, nextCurrency, false);
  }

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

  const whatsappShareUrl = useMemo(() => {
    const msg =
      lang === "hi"
        ? `✈️ *${routeData.origin.city} (${routeData.origin.iata}) से ${routeData.destination.city} (${routeData.destination.iata}) फ्लाइट्स*\n• सबसे सस्ता किराया: *${routeData.formattedLowestFare}*\n• समय: *${routeData.minDurationFormatted}* (Non-Stop)\n• कुल फ्लाइट्स: *${routeData.totalFlightsCount} Daily*\nलाइव शेड्यूल और बुकिंग: https://traveladda.in${routeData.routePath}`
        : `✈️ *${routeData.origin.city} (${routeData.origin.iata}) to ${routeData.destination.city} (${routeData.destination.iata}) Flights (${departureDate})*\n• Lowest Fare: *${routeData.formattedLowestFare}*\n• Fastest Duration: *${routeData.minDurationFormatted}*\n• Airlines: *${routeData.airlinesOperating.map((a) => a.name).join(", ")}*\nCompare & Book: https://traveladda.in${routeData.routePath}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  }, [routeData, departureDate, lang]);

  return (
    <div className="space-y-4">
      {/* 1. IXIGO-STYLE COMPACT SEARCH & CURRENCY BAR */}
      <div className="rounded-2xl border border-line bg-card p-3.5 shadow-sm sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-extrabold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
              <PlaneIcon className="h-3.5 w-3.5" />
              <span>
                {lang === "hi"
                  ? "फ्लाइट सर्च और लाइव किराया तुलना"
                  : "One-Way Flight Schedule & Fare Finder"}
              </span>
            </span>
            <span className="hidden text-xs font-medium text-ink-muted sm:inline">
              {routeData.aerialDistanceKm} km aerial distance · Fastest{" "}
              {routeData.minDurationFormatted}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Currency Switcher */}
            <div className="inline-flex items-center gap-1 rounded-lg border border-line bg-subcard p-0.5">
              {(
                Object.keys(FLIGHT_CURRENCIES) as SupportedFlightCurrency[]
              ).map((currKey) => {
                const active = currency === currKey;
                return (
                  <button
                    key={currKey}
                    type="button"
                    onClick={() => handleCurrencyChange(currKey)}
                    className={`rounded-md px-2 py-1 text-[11px] font-extrabold uppercase transition ${
                      active
                        ? "bg-[#1956b4] text-white shadow-xs"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {currKey.toUpperCase()}
                  </button>
                );
              })}
            </div>

            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="inline-flex items-center gap-1 rounded-lg border border-line bg-subcard px-2.5 py-1 text-xs font-bold text-ink hover:border-[#1956b4]"
            >
              <TranslateIcon className="h-3.5 w-3.5 text-[#1956b4] dark:text-blue-400" />
              <span>{lang === "en" ? "हिंदी" : "English"}</span>
            </button>

            {/* WhatsApp Share */}
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-[#25D366]/15 px-2.5 py-1 text-xs font-bold text-[#128C7E] hover:bg-[#25D366]/25 dark:text-[#25D366]"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </a>
          </div>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 gap-2.5 md:grid-cols-12 md:items-end"
        >
          {/* Origin */}
          <div className="md:col-span-4">
            <label
              htmlFor="flight-origin-select"
              className="block text-[11px] font-bold tracking-wider text-ink-muted uppercase"
            >
              {lang === "hi" ? "कहाँ से (From Airport)" : "From Airport / City"}
            </label>
            <select
              id="flight-origin-select"
              value={originIata}
              onChange={(e) => {
                const next = e.target.value;
                setOriginIata(next);
                if (next !== destIata) {
                  void loadRouteData(next, destIata, departureDate, currency, true);
                }
              }}
              className="mt-1 w-full rounded-xl border border-line bg-subcard px-3 py-2.5 text-sm font-bold text-ink focus:border-[#1956b4] focus:outline-none"
            >
              {MAJOR_AIRPORT_HUBS.map((hub) => (
                <option
                  key={`from-${hub.iata}`}
                  value={hub.iata}
                  disabled={hub.iata === destIata}
                >
                  {hub.city} ({hub.iata}) — {hub.airportName}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center md:col-span-1">
            <button
              type="button"
              onClick={handleSwapAirports}
              title="Swap Origin and Destination Airports"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-subcard text-[#1956b4] transition hover:border-[#1956b4] hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/15"
            >
              <SwapArrowsIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Destination */}
          <div className="md:col-span-4">
            <label
              htmlFor="flight-dest-select"
              className="block text-[11px] font-bold tracking-wider text-ink-muted uppercase"
            >
              {lang === "hi" ? "कहाँ तक (To Airport)" : "To Airport / City"}
            </label>
            <select
              id="flight-dest-select"
              value={destIata}
              onChange={(e) => {
                const next = e.target.value;
                setDestIata(next);
                if (next !== originIata) {
                  void loadRouteData(originIata, next, departureDate, currency, true);
                }
              }}
              className="mt-1 w-full rounded-xl border border-line bg-subcard px-3 py-2.5 text-sm font-bold text-ink focus:border-[#1956b4] focus:outline-none"
            >
              {MAJOR_AIRPORT_HUBS.map((hub) => (
                <option
                  key={`to-${hub.iata}`}
                  value={hub.iata}
                  disabled={hub.iata === originIata}
                >
                  {hub.city} ({hub.iata}) — {hub.airportName}
                </option>
              ))}
            </select>
          </div>

          {/* Departure Date */}
          <div className="md:col-span-2">
            <label
              htmlFor="flight-date-input"
              className="block text-[11px] font-bold tracking-wider text-ink-muted uppercase"
            >
              {lang === "hi" ? "यात्रा तिथि (Date)" : "Departure"}
            </label>
            <input
              id="flight-date-input"
              type="date"
              value={departureDate}
              onChange={(e) => handleDateSelect(e.target.value)}
              className="mt-1 w-full rounded-xl border border-line bg-subcard px-2.5 py-2.5 text-sm font-bold text-ink focus:border-[#1956b4] focus:outline-none"
            />
          </div>

          {/* Submit */}
          <div className="md:col-span-1">
            <button
              type="submit"
              disabled={loading}
              className="ta-btn-accent flex h-10 w-full items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-extrabold shadow-xs transition disabled:opacity-60"
            >
              <SearchIcon className="h-4 w-4" />
              <span className="md:hidden">Search Flights</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. IXIGO-STYLE 14-DAY CHEAPEST FARE RIBBON */}
      <div className="rounded-2xl border border-line bg-card p-3 sm:p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-ink">
            <CalendarIcon className="h-3.5 w-3.5 text-[#1956b4] dark:text-blue-400" />
            <span>
              {lang === "hi"
                ? `${routeData.origin.city} → ${routeData.destination.city} 14-दिन का सबसे सस्ता किराया कैलेंडर`
                : `14-Day Lowest Fare Calendar (${routeData.origin.iata} → ${routeData.destination.iata})`}
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            Lowest: {routeData.formattedLowestFare}
          </span>
        </div>

        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {routeData.calendarFares.map((cal) => {
            const isSelected = cal.date === departureDate;
            return (
              <button
                key={cal.date}
                type="button"
                onClick={() => handleDateSelect(cal.date)}
                className={`flex min-w-[92px] shrink-0 flex-col items-center rounded-xl border px-2.5 py-2 text-center transition ${
                  isSelected
                    ? "border-[#1956b4] bg-blue-50/90 dark:bg-blue-500/20"
                    : cal.isCheapestOfMonth
                      ? "border-emerald-500/50 bg-emerald-50/50 hover:border-emerald-600 dark:bg-emerald-500/10"
                      : "border-line bg-subcard/60 hover:border-[#1956b4]"
                }`}
              >
                <span className="text-[11px] font-bold text-ink-soft">
                  {cal.dayShort} · {cal.weekdayShort}
                </span>
                <span
                  className={`mt-0.5 font-mono text-xs font-extrabold ${
                    cal.isCheapestOfMonth
                      ? "text-emerald-700 dark:text-emerald-400"
                      : isSelected
                        ? "text-[#1956b4] dark:text-blue-300"
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

      {/* 3. FILTER & SORT BAR (IXIGO STYLE) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-line bg-card px-3.5 py-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setNonStopOnly(!nonStopOnly)}
            className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
              nonStopOnly
                ? "border-[#1956b4] bg-[#1956b4] text-white"
                : "border-line bg-subcard text-ink-soft hover:text-ink"
            }`}
          >
            Non-Stop Only ({routeData.directFlightsCount})
          </button>

          <button
            type="button"
            onClick={() => setSelectedAirline("ALL")}
            className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
              selectedAirline === "ALL"
                ? "border-[#1956b4] bg-blue-50 text-[#1956b4] dark:bg-blue-500/20 dark:text-blue-300"
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
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
                selectedAirline === air.code
                  ? "border-[#1956b4] bg-blue-50 text-[#1956b4] dark:bg-blue-500/20 dark:text-blue-300"
                  : "border-line bg-subcard text-ink-soft hover:text-ink"
              }`}
            >
              <span>{air.name}</span>
              <span className="font-mono text-[11px] opacity-80">
                {air.formattedMinPrice}
              </span>
            </button>
          ))}
        </div>

        {/* Sort + Time of Day */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", "morning", "afternoon", "evening"] as TimeSlotFilter[]).map(
            (slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTimeSlot(slot)}
                className={`rounded-lg px-2 py-1 text-[11px] font-bold capitalize transition ${
                  timeSlot === slot
                    ? "bg-ink text-canvas"
                    : "bg-subcard text-ink-soft hover:text-ink"
                }`}
              >
                {slot === "all" ? "All Times" : slot}
              </button>
            )
          )}

          <select
            aria-label="Sort flights"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortMode)}
            className="rounded-lg border border-line bg-subcard px-2.5 py-1 text-xs font-bold text-ink"
          >
            <option value="cheapest">Sort: Cheapest First</option>
            <option value="fastest">Sort: Fastest First</option>
            <option value="earliest">Sort: Earliest Departure</option>
          </select>
        </div>
      </div>

      {/* 4. IXIGO-STYLE FLIGHT SCHEDULE & FARE CARDS */}
      <div className="space-y-3">
        {loading && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3 text-center text-xs font-bold text-[#1956b4] dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
            Updating live flight schedule &amp; fares for {originIata} →{" "}
            {destIata} ({currency.toUpperCase()})...
          </div>
        )}

        {filteredOffers.map((offer) => {
          const liveTrackerPath = buildFlightStatusPath(
            offer.airlineCode,
            offer.flightNumber,
            offer.airlineName
          );

          return (
            <article
              key={offer.id}
              className="rounded-2xl border border-line bg-card p-4 shadow-2xs transition hover:border-[#1956b4]/60 hover:shadow-sm sm:p-5"
            >
              {/* Top Badges (Cheapest / Fastest / Baggage) */}
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-line/70 pb-2.5 text-[11px]">
                <div className="flex flex-wrap items-center gap-1.5">
                  {offer.isCheapest && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-extrabold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      <CheckCircleIcon className="h-3 w-3" />
                      <span>Cheapest Flight</span>
                    </span>
                  )}
                  {offer.isFastest && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 font-extrabold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                      <ClockIcon className="h-3 w-3" />
                      <span>Fastest Non-Stop</span>
                    </span>
                  )}
                  <span className="rounded bg-subcard px-2 py-0.5 font-medium text-ink-soft">
                    {offer.aircraft}
                  </span>
                  <span className="rounded bg-subcard px-2 py-0.5 font-medium text-ink-soft">
                    {offer.cabinBaggage} · {offer.checkInBaggage}
                  </span>
                </div>

                <Link
                  href={liveTrackerPath}
                  className="inline-flex items-center gap-1 font-bold text-[#1956b4] hover:underline dark:text-blue-400"
                >
                  <span>Track {offer.fullFlightCode} Live Status</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>

              {/* Main 3-Column Ixigo Row */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
                {/* Airline Info */}
                <div className="flex items-center gap-3 md:col-span-3">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-white p-1.5">
                    <Image
                      src={`/api/flights/icon/${offer.airlineCode}`}
                      alt={offer.airlineName}
                      width={36}
                      height={36}
                      className="h-8 w-8 object-contain"
                      unoptimized
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-ink">
                      {offer.airlineName}
                    </h3>
                    <p className="font-mono text-xs font-bold text-ink-muted">
                      {offer.fullFlightCode}
                    </p>
                  </div>
                </div>

                {/* Departure -> Duration -> Arrival */}
                <div className="flex items-center justify-between gap-2 md:col-span-5">
                  <div className="text-left">
                    <div className="font-mono text-lg font-extrabold text-ink sm:text-xl">
                      {offer.departureTime24}
                    </div>
                    <div className="text-xs font-bold text-ink">
                      {offer.originIata}{" "}
                      <span className="font-normal text-ink-soft">
                        ({offer.originCity})
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-ink-muted">
                      Terminal {offer.originTerminal}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col items-center px-2 text-center">
                    <span className="font-mono text-xs font-bold text-ink-soft">
                      {offer.durationFormatted}
                    </span>
                    <div className="my-1 flex w-full max-w-[130px] items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#1956b4]" />
                      <span className="h-0.5 flex-1 bg-line" />
                      <PlaneIcon className="mx-1 h-3.5 w-3.5 text-[#1956b4] dark:text-blue-400" />
                      <span className="h-0.5 flex-1 bg-line" />
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    </div>
                    <span
                      className={`text-[11px] font-extrabold ${
                        offer.transfers === 0
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {offer.stopsLabel}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-lg font-extrabold text-ink sm:text-xl">
                      {offer.arrivalTime24}
                    </div>
                    <div className="text-xs font-bold text-ink">
                      {offer.destinationIata}{" "}
                      <span className="font-normal text-ink-soft">
                        ({offer.destinationCity})
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-ink-muted">
                      Terminal {offer.destinationTerminal}
                    </div>
                  </div>
                </div>

                {/* Price & Booking Actions */}
                <div className="flex flex-col justify-between gap-2.5 border-t border-line pt-3 sm:flex-row sm:items-center md:col-span-4 md:justify-end md:border-t-0 md:border-l md:pt-0 md:pl-4">
                  <div className="text-left md:text-right">
                    <div className="font-mono text-xl font-extrabold text-ink sm:text-2xl">
                      {offer.formattedPrice}
                    </div>
                    <div className="text-[11px] font-medium text-ink-muted">
                      per adult · incl. taxes
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <a
                      href={offer.bookingUrls.primaryAffiliate}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="ta-btn-accent inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-extrabold shadow-xs transition"
                    >
                      <span>
                        {lang === "hi" ? "बुक करें (Book)" : "Book Flight"}
                      </span>
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </a>

                    {/* Secondary OTA Deep-Link Pills */}
                    <div className="flex items-center justify-end gap-1 text-[10px] font-bold">
                      <a
                        href={offer.bookingUrls.ixigo}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="rounded border border-line bg-subcard px-1.5 py-0.5 text-ink-soft hover:border-[#1956b4] hover:text-[#1956b4]"
                      >
                        ixigo
                      </a>
                      <a
                        href={offer.bookingUrls.makemytrip}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="rounded border border-line bg-subcard px-1.5 py-0.5 text-ink-soft hover:border-[#1956b4] hover:text-[#1956b4]"
                      >
                        MMT
                      </a>
                      <a
                        href={offer.bookingUrls.goibibo}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="rounded border border-line bg-subcard px-1.5 py-0.5 text-ink-soft hover:border-[#1956b4] hover:text-[#1956b4]"
                      >
                        Goibibo
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Trust Note */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-card px-4 py-3 text-xs text-ink-soft">
        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
          <ShieldCheckIcon className="h-4 w-4" />
          <span>
            Live Fares Powered by Travelpayouts Aviasales API v3 &amp; DGCA
            Schedule Engine ({currency.toUpperCase()})
          </span>
        </span>
        <Link
          href="/air/flight-compensation"
          className="font-bold text-[#1956b4] hover:underline dark:text-blue-400"
        >
          Flight Delayed? Check ₹10,000–₹20,000 DGCA Compensation →
        </Link>
      </div>
    </div>
  );
}
