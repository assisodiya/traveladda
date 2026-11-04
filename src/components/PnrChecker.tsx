"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  NormalizedPnrData,
  OwnedPnrApiResponse,
} from "@/lib/pnr-types";

interface RecentPnrItem {
  pnr: string;
  trainNumber: string;
  trainName: string;
  route: string;
  status: string;
}

const RECENT_STORAGE_KEY = "traveladda_recent_pnrs_v1";
const SAMPLE_PNR = "2528012827";
const EMPTY_RECENT: RecentPnrItem[] = [];

let cachedRawRecent: string | null = null;
let cachedParsedRecent: RecentPnrItem[] = EMPTY_RECENT;
const recentListeners = new Set<() => void>();

function subscribeRecent(listener: () => void) {
  recentListeners.add(listener);
  return () => {
    recentListeners.delete(listener);
  };
}

function getRecentSnapshot(): RecentPnrItem[] {
  if (typeof window === "undefined") return EMPTY_RECENT;
  try {
    const raw = window.localStorage.getItem(RECENT_STORAGE_KEY);
    if (raw === cachedRawRecent) return cachedParsedRecent;
    cachedRawRecent = raw;
    if (!raw) {
      cachedParsedRecent = EMPTY_RECENT;
      return cachedParsedRecent;
    }
    const parsed = JSON.parse(raw) as unknown;
    cachedParsedRecent = Array.isArray(parsed)
      ? (parsed.slice(0, 5) as RecentPnrItem[])
      : EMPTY_RECENT;
    return cachedParsedRecent;
  } catch {
    return EMPTY_RECENT;
  }
}

function getRecentServerSnapshot(): RecentPnrItem[] {
  return EMPTY_RECENT;
}

function writeRecentStorage(next: RecentPnrItem[]) {
  try {
    if (next.length === 0) {
      window.localStorage.removeItem(RECENT_STORAGE_KEY);
      cachedRawRecent = null;
      cachedParsedRecent = EMPTY_RECENT;
    } else {
      const serialized = JSON.stringify(next);
      window.localStorage.setItem(RECENT_STORAGE_KEY, serialized);
      cachedRawRecent = serialized;
      cachedParsedRecent = next;
    }
    for (const listener of recentListeners) listener();
  } catch {
    // Ignore localStorage quota/privacy errors
  }
}

export function PnrChecker({ compact = false }: { compact?: boolean }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQueryPnr = (searchParams.get("pnr") ?? "")
    .replace(/\D/g, "")
    .slice(0, 10);

  const [pnrInput, setPnrInput] = useState(initialQueryPnr);
  const [loading, setLoading] = useState(initialQueryPnr.length === 10);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<OwnedPnrApiResponse | null>(
    null
  );
  const [copied, setCopied] = useState(false);
  const [showRawApi, setShowRawApi] = useState(false);

  const recentList = useSyncExternalStore(
    subscribeRecent,
    getRecentSnapshot,
    getRecentServerSnapshot
  );

  const lastAutoCheckedRef = useRef<string | null>(null);

  const saveRecent = useCallback((data: NormalizedPnrData) => {
    const entry: RecentPnrItem = {
      pnr: data.pnrNumber,
      trainNumber: data.train.number,
      trainName: data.train.name,
      route: `${data.train.source.code} → ${data.train.destination.code}`,
      status: data.overallStatus,
    };
    const current = getRecentSnapshot();
    const next = [
      entry,
      ...current.filter((item) => item.pnr !== entry.pnr),
    ].slice(0, 5);
    writeRecentStorage(next);
  }, []);

  const performLookup = useCallback(
    async (digits: string) => {
      try {
        // Calls TravelAdda's OWNED API endpoint (which calls upstream server-to-server)
        const res = await fetch(`/api/pnr/${digits}`, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        const payload = (await res.json()) as OwnedPnrApiResponse;
        setApiResponse(payload);

        if (!res.ok || !payload.success || !payload.data) {
          setErrorMsg(
            payload.error?.message ||
              "Unable to fetch status for this PNR right now. Please verify the 10-digit number."
          );
        } else {
          setErrorMsg(null);
          saveRecent(payload.data);
        }
      } catch {
        setErrorMsg(
          "Network error while contacting TravelAdda PNR API (/api/pnr). Please retry."
        );
      } finally {
        setLoading(false);
      }
    },
    [saveRecent]
  );

  const checkPnrStatus = useCallback(
    async (targetPnr: string, syncUrl = true) => {
      const digits = targetPnr.replace(/\D/g, "");
      if (digits.length !== 10) {
        setErrorMsg("Please enter a valid 10-digit numeric PNR number.");
        return;
      }

      setPnrInput(digits);
      setLoading(true);
      setErrorMsg(null);
      setCopied(false);
      lastAutoCheckedRef.current = digits;

      if (syncUrl && !compact) {
        router.replace(`/rail/pnr-status?pnr=${digits}`, { scroll: false });
      }

      await performLookup(digits);
    },
    [compact, performLookup, router]
  );

  useEffect(() => {
    const queryPnr = (searchParams.get("pnr") ?? "").replace(/\D/g, "");
    if (queryPnr.length === 10 && lastAutoCheckedRef.current !== queryPnr) {
      lastAutoCheckedRef.current = queryPnr;
      void performLookup(queryPnr);
    }
  }, [searchParams, performLookup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void checkPnrStatus(pnrInput, true);
  };

  const handleCopySummary = async () => {
    const d = apiResponse?.data;
    if (!d) return;
    const paxLines = d.passengers
      .map(
        (p) =>
          `Passenger ${p.serialNumber}: ${p.current.formatted}${
            p.berthName ? ` (${p.berthName})` : ""
          }`
      )
      .join("\n");

    const text = [
      `🚂 TravelAdda Live PNR Status`,
      `PNR: ${d.formattedPnr} (${d.overallStatus})`,
      `Train: ${d.train.number} - ${d.train.name}`,
      `Route: ${d.train.source.name} (${d.train.source.code}) → ${d.train.destination.name} (${d.train.destination.code})`,
      `Date: ${d.train.journeyDateRaw || d.train.journeyDate} | Class: ${d.train.journeyClassName}`,
      `Chart: ${d.charting.status}`,
      paxLines,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback ignored
    }
  };

  const clearRecent = () => {
    writeRecentStorage([]);
  };

  const digitCount = pnrInput.replace(/\D/g, "").length;
  const pnrData = apiResponse?.success ? apiResponse.data : undefined;

  const overallBadgeStyles: Record<string, string> = {
    Confirmed: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    RAC: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    Waitlisted: "bg-rose-500/15 text-rose-300 border-rose-400/30",
    "Partially Confirmed": "bg-sky-500/15 text-sky-300 border-sky-400/30",
    Cancelled: "bg-slate-500/20 text-slate-300 border-slate-400/30",
  };

  const passengerPillStyles: Record<string, string> = {
    CNF: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/25",
    RAC: "bg-amber-50 text-amber-800 ring-1 ring-amber-600/25",
    WL: "bg-rose-50 text-rose-800 ring-1 ring-rose-600/25",
    CAN: "bg-slate-100 text-slate-600 ring-1 ring-slate-400/30",
    OTHER: "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-600/25",
  };

  return (
    <div className="w-full">
      {/* Search Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex size-8 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
              <svg
                viewBox="0 0 24 24"
                className="size-4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 18l-2 3m10-3l2 3M5 11h14M7 4h10a3 3 0 013 3v8a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3z"
                />
                <circle cx="8.5" cy="14.5" r="1" fill="currentColor" />
                <circle cx="15.5" cy="14.5" r="1" fill="currentColor" />
              </svg>
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                Indian Railways Live PNR Status
              </h2>
              <p className="text-xs text-slate-500">
                Real-time CRIS status via TravelAdda Owned API (
                <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-slate-700">
                  /api/pnr
                </code>
                )
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-600/20">
            <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
            API-to-API Live Sync
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-1 flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <label htmlFor="pnr-number-input" className="sr-only">
              Enter 10-digit PNR Number
            </label>
            <input
              id="pnr-number-input"
              type="text"
              inputMode="numeric"
              maxLength={12}
              value={pnrInput}
              onChange={(e) => {
                const digitsOnly = e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 10);
                setPnrInput(digitsOnly);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Enter 10-digit PNR number (e.g. 2528012827)"
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50/70 px-5 py-4 pr-20 font-mono text-lg font-bold tracking-wider text-slate-900 placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 transition focus:border-orange-500 focus:bg-white focus:outline-none"
            />
            <span
              className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 font-mono text-xs font-semibold ${
                digitCount === 10
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-200/70 text-slate-600"
              }`}
            >
              {digitCount}/10
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 px-7 py-4 text-base font-bold text-white shadow-lg shadow-orange-600/25 transition hover:from-orange-700 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-65"
          >
            {loading ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                <span>Checking Live...</span>
              </>
            ) : (
              <>
                <span>Check PNR Status</span>
                <span aria-hidden="true">→</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Sample & Recent PNRs */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-500">Quick Try:</span>
            <button
              type="button"
              onClick={() => void checkPnrStatus(SAMPLE_PNR, true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 font-mono font-semibold text-orange-800 transition hover:bg-orange-100"
            >
              <span>2528012827</span>
              <span className="font-sans text-[11px] font-medium text-orange-600">
                (12986 Double Decker)
              </span>
            </button>

            {recentList
              .filter((r) => r.pnr !== SAMPLE_PNR)
              .slice(0, 3)
              .map((item) => (
                <button
                  key={item.pnr}
                  type="button"
                  onClick={() => void checkPnrStatus(item.pnr, true)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-mono font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                >
                  <span>{item.pnr}</span>
                  <span className="font-sans text-[11px] text-slate-500">
                    ({item.route})
                  </span>
                </button>
              ))}
          </div>

          {recentList.length > 0 && (
            <button
              type="button"
              onClick={clearRecent}
              className="cursor-pointer text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
            >
              Clear recent
            </button>
          )}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-sm text-rose-900"
          >
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-rose-200 text-xs font-bold text-rose-800">
              !
            </span>
            <div>
              <p className="font-semibold">Unable to retrieve PNR status</p>
              <p className="mt-0.5 text-rose-700">{errorMsg}</p>
            </div>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && !pnrData && (
        <div className="mt-6 animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          <div className="h-32 bg-slate-900 p-6">
            <div className="h-5 w-48 rounded bg-slate-700" />
            <div className="mt-4 h-7 w-80 rounded bg-slate-800" />
          </div>
          <div className="space-y-4 p-6">
            <div className="h-16 rounded-2xl bg-slate-100" />
            <div className="h-24 rounded-2xl bg-slate-100" />
          </div>
        </div>
      )}

      {/* Boarding Pass Result Card */}
      {pnrData && (
        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/10">
          {/* Top Dark Ticket Header */}
          <div className="bg-travel-grid relative bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 px-6 py-6 text-white sm:px-8 sm:py-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-lg bg-white/10 px-2.5 py-1 font-mono text-xs font-bold tracking-wider text-orange-300 ring-1 ring-white/15">
                  PNR {pnrData.formattedPnr}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                    overallBadgeStyles[pnrData.overallStatus] ??
                    overallBadgeStyles.Confirmed
                  }`}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  {pnrData.overallStatus}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    pnrData.charting.isPrepared
                      ? "bg-teal-500/20 text-teal-200 ring-1 ring-teal-400/30"
                      : "bg-white/10 text-slate-300 ring-1 ring-white/15"
                  }`}
                >
                  {pnrData.charting.isPrepared ? "✓ " : "⏳ "}
                  {pnrData.charting.status}
                </span>
              </div>

              {pnrData.train.bookingFare !== null && (
                <div className="text-right">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400">
                    Ticket Fare
                  </span>
                  <p className="font-mono text-lg font-extrabold text-amber-300">
                    ₹{pnrData.train.bookingFare.toLocaleString("en-IN")}
                  </p>
                </div>
              )}
            </div>

            {/* Train Title & Class */}
            <div className="mt-5 flex flex-col justify-between gap-4 border-t border-white/10 pt-5 md:flex-row md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 font-mono text-sm font-black text-slate-950">
                    #{pnrData.train.number}
                  </span>
                  <h3 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                    {pnrData.train.name}
                  </h3>
                </div>
                <p className="mt-1.5 text-xs text-slate-300">
                  Departure:{" "}
                  <span className="font-semibold text-white">
                    {pnrData.train.journeyDateRaw || pnrData.train.journeyDate}
                  </span>
                </p>
              </div>

              <div className="inline-flex self-start rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 backdrop-blur-sm md:self-auto">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-teal-300">
                    Journey Class
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-white">
                    {pnrData.train.journeyClassName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Perforated Station Route Timeline */}
          <div className="relative border-b border-dashed border-slate-200 bg-slate-50/75 px-6 py-6 sm:px-8">
            <span
              aria-hidden="true"
              className="absolute -bottom-3.5 -left-3.5 size-7 rounded-full border border-slate-200 bg-[#faf8f5]"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-3.5 -right-3.5 size-7 rounded-full border border-slate-200 bg-[#faf8f5]"
            />

            <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Boarding Station
                </p>
                <div className="mt-1 flex items-baseline gap-2.5">
                  <span className="font-mono text-2xl font-black text-slate-900">
                    {pnrData.train.boardingPoint.code}
                  </span>
                  <span className="text-base font-semibold text-slate-700">
                    {pnrData.train.boardingPoint.name}
                  </span>
                </div>
                {pnrData.train.source.code !==
                  pnrData.train.boardingPoint.code && (
                  <p className="mt-1 text-xs text-slate-500">
                    Train Origin: {pnrData.train.source.name} (
                    {pnrData.train.source.code})
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-3">
                <span className="size-2.5 rounded-full bg-orange-500 ring-4 ring-orange-500/20" />
                <div className="flex items-center gap-1.5">
                  <span className="h-0.5 w-10 bg-slate-300 sm:w-16" />
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-2xs">
                    🚂 Direct Rail
                  </span>
                  <span className="h-0.5 w-10 bg-slate-300 sm:w-16" />
                </div>
                <span className="size-2.5 rounded-full bg-teal-600 ring-4 ring-teal-600/20" />
              </div>

              <div className="md:text-right">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Destination Station
                </p>
                <div className="mt-1 flex items-baseline gap-2.5 md:justify-end">
                  <span className="font-mono text-2xl font-black text-slate-900">
                    {pnrData.train.destination.code}
                  </span>
                  <span className="text-base font-semibold text-slate-700">
                    {pnrData.train.destination.name}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Reserved Upto: {pnrData.train.reservationUpto.name} (
                  {pnrData.train.reservationUpto.code})
                </p>
              </div>
            </div>
          </div>

          {/* Passenger Status Breakdown */}
          <div className="px-6 py-6 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                Passenger Reservation Details ({pnrData.passengers.length})
              </h4>
              <span className="text-xs text-slate-500">
                Synced at{" "}
                {new Date(pnrData.generatedAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[580px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3.5">Passenger</th>
                    <th className="px-4 py-3.5">Booking Status</th>
                    <th className="px-4 py-3.5">Current Live Status</th>
                    <th className="px-4 py-3.5">Coach &amp; Seat / Berth</th>
                    <th className="px-4 py-3.5">Quota</th>
                    <th className="px-4 py-3.5 text-right">Ticket State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {pnrData.passengers.map((pax) => (
                    <tr
                      key={pax.serialNumber}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-4 font-bold text-slate-900">
                        <span className="inline-flex items-center gap-2">
                          <span className="grid size-7 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
                            {pax.serialNumber}
                          </span>
                          <span>Passenger {pax.serialNumber}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs font-semibold text-slate-600">
                        {pax.booking.formatted}
                      </td>
                      <td className="px-4 py-4 font-mono text-sm font-extrabold text-slate-900">
                        {pax.current.formatted}
                      </td>
                      <td className="px-4 py-4">
                        {pax.current.coachId || pax.current.berthNo ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {pax.current.coachId && (
                              <span className="rounded-lg bg-indigo-50 px-2.5 py-1 font-mono text-xs font-bold text-indigo-900 ring-1 ring-indigo-600/20">
                                Coach {pax.current.coachId}
                              </span>
                            )}
                            {pax.current.berthNo !== null && (
                              <span className="rounded-lg bg-amber-50 px-2.5 py-1 font-mono text-xs font-bold text-amber-900 ring-1 ring-amber-600/20">
                                Seat #{pax.current.berthNo}
                              </span>
                            )}
                            {pax.berthName && (
                              <span className="text-xs font-medium text-slate-600">
                                · {pax.berthName}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Assigned at charting
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-slate-600">
                        {pax.current.quotaName ||
                          pax.current.quota ||
                          "General"}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ${
                            passengerPillStyles[pax.statusBadge] ??
                            passengerPillStyles.OTHER
                          }`}
                        >
                          {pax.statusBadge === "CNF"
                            ? "✓ CONFIRMED"
                            : pax.statusBadge === "RAC"
                              ? "◐ RAC"
                              : pax.statusBadge === "WL"
                                ? "⏳ WAITLIST"
                                : pax.statusBadge === "CAN"
                                  ? "✕ CANCELLED"
                                  : pax.current.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Ticket Action Bar */}
            <div className="no-print mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => void checkPnrStatus(pnrData.pnrNumber, false)}
                  disabled={loading}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <span>↻ Refresh Live</span>
                </button>

                <button
                  type="button"
                  onClick={() => void handleCopySummary()}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <span>
                    {copied ? "✓ Copied Summary!" : "📋 Copy Ticket Summary"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <span>🖨️ Print / Save PDF</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowRawApi((v) => !v)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 font-mono text-xs font-semibold text-teal-300 transition hover:bg-slate-800"
                >
                  <span>{showRawApi ? "Hide" : "Inspect"} Owned API JSON</span>
                  <span className="text-slate-400">
                    ({apiResponse?.meta.responseTimeMs ?? 0}ms)
                  </span>
                </button>
              </div>
            </div>

            {/* Owned API Inspector Drawer */}
            {showRawApi && apiResponse && (
              <div className="no-print mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/90 px-4 py-2.5 text-xs">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-bold text-emerald-400">
                      GET 200
                    </span>
                    <span className="text-slate-300">
                      {apiResponse.endpoint}
                    </span>
                  </div>
                  <a
                    href={apiResponse.endpoint}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-orange-400 hover:text-orange-300"
                  >
                    Open Direct API Endpoint ↗
                  </a>
                </div>
                <pre className="max-h-80 overflow-auto p-4 font-mono text-xs leading-relaxed text-emerald-300">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
