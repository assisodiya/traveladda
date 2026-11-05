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
    <div className="rounded-3xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl shadow-slate-900/8 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:shadow-black/40 sm:p-7">
      {/* Mode Switcher Tabs: Rail, Air, Hotel */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="grid w-full grid-cols-3 gap-1.5 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800 sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab("rail")}
            className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition sm:text-sm ${
              activeTab === "rail"
                ? "bg-indigo-600 text-white shadow-sm dark:bg-indigo-500"
                : "text-slate-700 hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
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
                ? "bg-indigo-600 text-white shadow-sm dark:bg-indigo-500"
                : "text-slate-700 hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
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
                ? "bg-indigo-600 text-white shadow-sm dark:bg-indigo-500"
                : "text-slate-700 hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
            }`}
          >
            <HotelIcon className="h-4 w-4" />
            <span>Hotel</span>
          </button>
        </div>

        <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/30 sm:inline-flex">
          <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
          <span>Instant Tools</span>
        </span>
      </div>

      {/* RAIL TAB */}
      {activeTab === "rail" && (
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="hero-pnr-input"
              className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Indian Railways PNR Status
            </label>
            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-sky-400">
              {pnr.length}/10 digits
            </span>
          </div>

          <form
            onSubmit={handleRailSubmit}
            className="mt-2.5 flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
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
                className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 font-mono text-base font-bold tracking-wider text-slate-900 placeholder:font-sans placeholder:text-sm placeholder:font-medium placeholder:tracking-normal placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:bg-slate-950"
              />
            </div>
            <button
              type="submit"
              className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
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

          <div className="mt-4 grid grid-cols-2 gap-2.5 rounded-2xl bg-slate-50 p-3.5 text-xs text-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Coach &amp; Seat Decoder</span>
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <ClockIcon className="h-4 w-4 text-indigo-600 dark:text-sky-400" />
              <span>Live Charting Updates</span>
            </div>
          </div>
        </div>
      )}

      {/* AIR TAB */}
      {activeTab === "air" && (
        <div className="mt-5 space-y-3.5">
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Standard Flight Baggage &amp; Check-in Quick View
          </p>
          <div className="space-y-2.5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-800/70">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Domestic Economy Flights
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-100 px-2.5 py-1 text-sky-900 dark:bg-sky-500/20 dark:text-sky-200">
                  <LuggageIcon className="h-3.5 w-3.5" />
                  <span>7 kg Cabin + 15 kg Check-in</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-100 px-2.5 py-1 text-indigo-900 dark:bg-indigo-500/20 dark:text-indigo-200">
                  <ClockIcon className="h-3.5 w-3.5" />
                  <span>Report 2 hrs prior</span>
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-800/70">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                International Economy Flights
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-teal-100 px-2.5 py-1 text-teal-900 dark:bg-teal-500/20 dark:text-teal-200">
                  <LuggageIcon className="h-3.5 w-3.5" />
                  <span>7 kg Cabin + 23–30 kg Check-in</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-100 px-2.5 py-1 text-indigo-900 dark:bg-indigo-500/20 dark:text-indigo-200">
                  <ClockIcon className="h-3.5 w-3.5" />
                  <span>Report 3 hrs prior</span>
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/tools/air"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
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
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Quick Hotel Room &amp; GST Estimator
            </span>
            <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-900 dark:bg-teal-500/20 dark:text-teal-200">
              {gstRate}% GST Slab
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="hero-room-rate"
                className="block text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Tariff / Night (₹)
              </label>
              <input
                id="hero-room-rate"
                type="number"
                min={0}
                value={roomRate}
                onChange={(e) => setRoomRate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-sm font-bold text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-sky-400"
              />
            </div>
            <div>
              <label
                htmlFor="hero-nights"
                className="block text-xs font-semibold text-slate-600 dark:text-slate-400"
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
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-sm font-bold text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-sky-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <CalculatorIcon className="h-4 w-4 text-indigo-600 dark:text-sky-400" />
              <span>Estimated Stay Total (incl. GST)</span>
            </div>
            <span className="font-mono text-lg font-extrabold text-indigo-700 dark:text-emerald-300">
              ₹{totalWithTax.toLocaleString("en-IN")}
            </span>
          </div>

          <Link
            href="/tools/hotel"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            <span>Open Full Hotel Toolkit</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
