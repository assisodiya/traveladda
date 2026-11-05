"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRightIcon,
  CalculatorIcon,
  CheckCircleIcon,
  ClockIcon,
  HotelIcon,
  LuggageIcon,
  PlaneIcon,
  SearchIcon,
  TrainIcon,
} from "./Icons";

export function HeroSearchWidget() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"rail" | "air" | "hotel">("rail");
  const [pnr, setPnr] = useState("");
  const [validationMsg, setValidationMsg] = useState("");

  const [roomRate, setRoomRate] = useState("4500");
  const [nights, setNights] = useState("2");

  const handleRailSubmit = (e: React.FormEvent) => {
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
  const totalRoomBase = numericRate * numericNights;
  const totalWithTax = Math.round(totalRoomBase * (1 + gstRate / 100));

  return (
    <div className="rounded-3xl border border-line bg-card p-5 text-ink shadow-xl shadow-black/8 dark:shadow-black/35 sm:p-7">
      {/* Mode Switcher Tabs: Rail, Air, Hotel */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div className="grid w-full grid-cols-3 gap-1.5 rounded-2xl bg-subcard p-1.5 sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab("rail")}
            className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition sm:text-sm ${
              activeTab === "rail"
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
            className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition sm:text-sm ${
              activeTab === "air"
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
            className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition sm:text-sm ${
              activeTab === "hotel"
                ? "ta-btn-primary shadow-xs"
                : "text-ink-soft hover:bg-card hover:text-ink"
            }`}
          >
            <HotelIcon className="h-4 w-4" />
            <span>Hotel</span>
          </button>
        </div>

        <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/12 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 sm:inline-flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Instant Tools</span>
        </span>
      </div>

      {/* RAIL TAB */}
      {activeTab === "rail" && (
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="hero-pnr-input"
              className="text-xs font-extrabold uppercase tracking-wider text-ink-soft"
            >
              Indian Railways PNR Status
            </label>
            <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-300">
              {pnr.length}/10 digits
            </span>
          </div>

          <form
            onSubmit={handleRailSubmit}
            className="mt-2.5 flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
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
                className="w-full rounded-2xl border-2 border-line bg-input py-3.5 pl-11 pr-4 font-mono text-base font-bold tracking-wider text-ink placeholder:font-sans placeholder:text-sm placeholder:font-medium placeholder:tracking-normal placeholder:text-ink-muted focus:border-teal-500 focus:outline-none"
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

          {validationMsg && (
            <p className="mt-2 text-xs font-bold text-rose-600 dark:text-rose-400">
              {validationMsg}
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2.5 rounded-2xl bg-subcard p-3.5 text-xs text-ink-soft">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Coach &amp; Seat Decoder</span>
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <ClockIcon className="h-4 w-4 text-teal-600 dark:text-teal-300" />
              <span>Live Charting Updates</span>
            </div>
          </div>
        </div>
      )}

      {/* AIR TAB */}
      {activeTab === "air" && (
        <div className="mt-5 space-y-3.5">
          <p className="text-xs font-extrabold uppercase tracking-wider text-ink-soft">
            Standard Flight Baggage &amp; Check-in Quick View
          </p>
          <div className="space-y-2.5">
            <div className="rounded-2xl border border-line bg-subcard p-3.5">
              <p className="text-sm font-bold text-ink">
                Domestic Economy Flights
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/15 px-2.5 py-1 text-sky-800 dark:text-sky-300">
                  <LuggageIcon className="h-3.5 w-3.5" />
                  <span>7 kg Cabin + 15 kg Check-in</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500/15 px-2.5 py-1 text-teal-800 dark:text-teal-300">
                  <ClockIcon className="h-3.5 w-3.5" />
                  <span>Report 2 hrs prior</span>
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-subcard p-3.5">
              <p className="text-sm font-bold text-ink">
                International Economy Flights
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500/15 px-2.5 py-1 text-teal-800 dark:text-teal-300">
                  <LuggageIcon className="h-3.5 w-3.5" />
                  <span>7 kg Cabin + 23–30 kg Check-in</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/15 px-2.5 py-1 text-sky-800 dark:text-sky-300">
                  <ClockIcon className="h-3.5 w-3.5" />
                  <span>Report 3 hrs prior</span>
                </span>
              </div>
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

      {/* HOTEL TAB */}
      {activeTab === "hotel" && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-ink-soft">
              Quick Hotel Room &amp; GST Estimator
            </span>
            <span className="rounded-full bg-teal-500/15 px-2.5 py-0.5 text-xs font-bold text-teal-800 dark:text-teal-300">
              {gstRate}% GST Slab
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="hero-room-rate"
                className="block text-xs font-semibold text-ink-muted"
              >
                Tariff / Night (₹)
              </label>
              <input
                id="hero-room-rate"
                type="number"
                min={0}
                value={roomRate}
                onChange={(e) => setRoomRate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-input px-3.5 py-2.5 font-mono text-sm font-bold text-ink focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="hero-nights"
                className="block text-xs font-semibold text-ink-muted"
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
                className="mt-1 w-full rounded-xl border border-line bg-input px-3.5 py-2.5 font-mono text-sm font-bold text-ink focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-line bg-subcard px-4 py-3 text-ink">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
              <CalculatorIcon className="h-4 w-4 text-teal-600 dark:text-teal-300" />
              <span>Estimated Stay Total (incl. GST)</span>
            </div>
            <span className="font-mono text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
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
    </div>
  );
}
