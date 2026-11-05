"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { getTodayIstDateString } from "@/lib/live-train-types";
import {
  ArrowRightIcon,
  BedIcon,
  CalculatorIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
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
  return () => {};
}

export function HeroSearchWidget() {
  const router = useRouter();
  const todayIst = useSyncExternalStore(
    noopSubscribe,
    getTodayIstDateString,
    () => ""
  );

  const [activeTab, setActiveTab] = useState<"rail" | "air" | "hotel">("rail");
  const [railTool, setRailTool] = useState<"pnr" | "live">("pnr");

  const [pnr, setPnr] = useState("");
  const [trainNo, setTrainNo] = useState("");
  const [trainDate, setTrainDate] = useState("");
  const [validationMsg, setValidationMsg] = useState("");

  const effectiveTrainDate = trainDate || todayIst;

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

  const handleLiveTrainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = trainNo.replace(/\D/g, "").slice(0, 5);
    if (clean.length < 3) {
      setValidationMsg(
        "Please enter a valid 4 or 5-digit Indian Railways train number."
      );
      return;
    }
    const resolvedDate = effectiveTrainDate || getTodayIstDateString();
    router.push(`/rail/live-status?train=${clean}&date=${resolvedDate}`);
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

        <span className="hidden items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/12 px-3 py-1 text-xs font-bold text-orange-700 dark:text-amber-300 sm:inline-flex">
          <SparklesIcon className="h-3.5 w-3.5" />
          <span>Instant Tools</span>
        </span>
      </div>

      {/* RAIL TAB: PNR Status + Live Train Status Switcher */}
      {activeTab === "rail" && (
        <div className="mt-4 space-y-4">
          {/* Sub-tool Selector */}
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-line bg-subcard p-1.5">
            <button
              type="button"
              onClick={() => {
                setRailTool("pnr");
                setValidationMsg("");
              }}
              className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold transition ${
                railTool === "pnr"
                  ? "bg-card text-orange-700 shadow-2xs ring-1 ring-orange-500/35 dark:text-amber-300"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              <TicketIcon className="h-4 w-4" />
              <span>PNR Status</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRailTool("live");
                setValidationMsg("");
              }}
              className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold transition ${
                railTool === "live"
                  ? "bg-card text-orange-700 shadow-2xs ring-1 ring-orange-500/35 dark:text-amber-300"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              <RadarLiveIcon className="h-4 w-4" />
              <span>Live Train Status</span>
            </button>
          </div>

          {railTool === "pnr" ? (
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
                className="mt-2 flex flex-col gap-3 sm:flex-row"
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
          ) : (
            <form onSubmit={handleLiveTrainSubmit} className="space-y-3">
              <div className="grid gap-2.5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="hero-train-input"
                    className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-soft"
                  >
                    Train Number
                  </label>
                  <div className="relative mt-1">
                    <TrainIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-600 dark:text-amber-400" />
                    <input
                      id="hero-train-input"
                      type="text"
                      inputMode="numeric"
                      maxLength={5}
                      value={trainNo}
                      onChange={(e) => {
                        setTrainNo(
                          e.target.value.replace(/\D/g, "").slice(0, 5)
                        );
                        if (validationMsg) setValidationMsg("");
                      }}
                      placeholder="5-digit Train No."
                      className="w-full rounded-xl border-2 border-line bg-input py-3 pl-10 pr-3 font-mono text-sm font-bold text-ink placeholder:font-sans placeholder:font-medium placeholder:text-ink-muted focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="hero-train-date"
                    className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-soft"
                  >
                    Start Date
                  </label>
                  <div className="relative mt-1">
                    <CalendarIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-600 dark:text-amber-300" />
                    <input
                      id="hero-train-date"
                      type="date"
                      value={effectiveTrainDate}
                      onChange={(e) => setTrainDate(e.target.value)}
                      className="w-full rounded-xl border-2 border-line bg-input py-3 pl-10 pr-3 font-mono text-xs font-bold text-ink focus:border-orange-500 focus:outline-none sm:text-sm"
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
            </form>
          )}

          {validationMsg && (
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
              {validationMsg}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2.5 rounded-2xl bg-subcard p-3.5 text-xs text-ink-soft">
            <div className="flex items-center gap-2 font-semibold">
              <CoachTrainIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
              <span>Coach &amp; Rake Order</span>
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircleIcon className="h-4 w-4 text-amber-600 dark:text-yellow-300" />
              <span>Live Platform &amp; Chart</span>
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
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/18 px-2.5 py-0.5 text-xs font-bold text-amber-900 dark:text-amber-300">
              <RupeeBadgeIcon className="h-3.5 w-3.5" />
              <span>{gstRate}% GST Slab</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
                className="mt-1 w-full rounded-xl border border-line bg-input px-3.5 py-2.5 font-mono text-sm font-bold text-ink focus:border-orange-500 focus:outline-none"
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
                className="mt-1 w-full rounded-xl border border-line bg-input px-3.5 py-2.5 font-mono text-sm font-bold text-ink focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-line bg-subcard px-4 py-3 text-ink">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
              <CalculatorIcon className="h-4 w-4 text-orange-600 dark:text-amber-400" />
              <span>Estimated Stay Total (incl. GST)</span>
            </div>
            <span className="font-mono text-lg font-extrabold text-orange-700 dark:text-amber-300">
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
