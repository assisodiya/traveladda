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
import {
  AlertCircleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  CodeIcon,
  CopyIcon,
  PrinterIcon,
  RefreshIcon,
  SearchIcon,
  TrainIcon,
} from "./Icons";

interface RecentPnrItem {
  pnr: string;
  trainNumber: string;
  trainName: string;
  route: string;
  status: string;
}

const RECENT_STORAGE_KEY = "traveladda_recent_pnrs_v1";
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
    // Ignore storage write errors
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
      `TravelAdda Live PNR Status`,
      `PNR: ${d.formattedPnr} (${d.overallStatus})`,
      `Train: ${d.train.number} - ${d.train.name}`,
      `Route: ${d.train.source.name} (${d.train.source.code}) -> ${d.train.destination.name} (${d.train.destination.code})`,
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
    Confirmed:
      "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-400/40",
    RAC: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-400/40",
    Waitlisted:
      "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-400/40",
    "Partially Confirmed":
      "bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-500/20 dark:text-sky-200 dark:border-sky-400/40",
    Cancelled:
      "bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-500/25 dark:text-slate-200 dark:border-slate-400/40",
  };

  const passengerPillStyles: Record<string, string> = {
    CNF: "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-600/25 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-400/30",
    RAC: "bg-amber-100 text-amber-900 ring-1 ring-amber-600/25 dark:bg-amber-500/20 dark:text-amber-300 dark:ring-amber-400/30",
    WL: "bg-rose-100 text-rose-900 ring-1 ring-rose-600/25 dark:bg-rose-500/20 dark:text-rose-300 dark:ring-rose-400/30",
    CAN: "bg-slate-200 text-slate-800 ring-1 ring-slate-400/30 dark:bg-slate-700 dark:text-slate-300",
    OTHER:
      "bg-indigo-100 text-indigo-900 ring-1 ring-indigo-600/25 dark:bg-indigo-500/20 dark:text-indigo-300",
  };

  return (
    <div className="w-full">
      {/* Search Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/8 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-sky-300">
              <TrainIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white sm:text-lg">
                Indian Railways Live PNR Status
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Real-time CRIS status via TravelAdda Owned API (
                <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-800 dark:bg-slate-800 dark:text-sky-300">
                  /api/pnr
                </code>
                )
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/30">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600 dark:bg-emerald-400" />
            <span>API-to-API Live Sync</span>
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
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              id="pnr-number-input"
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={pnrInput}
              onChange={(e) => {
                const digitsOnly = e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 10);
                setPnrInput(digitsOnly);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Enter 10-digit PNR number"
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 py-4 pl-12 pr-20 font-mono text-lg font-bold tracking-wider text-slate-900 placeholder:font-sans placeholder:text-sm placeholder:font-medium placeholder:tracking-normal placeholder:text-slate-400 transition focus:border-indigo-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:bg-slate-950"
            />
            <span
              className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1 font-mono text-xs font-bold ${
                digitCount === 10
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                  : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {digitCount}/10
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-7 py-4 text-base font-extrabold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-65 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                <span>Checking Live...</span>
              </>
            ) : (
              <>
                <span>Check PNR Status</span>
                <ArrowRightIcon className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* User's Own Recent Searches */}
        {recentList.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5 text-xs dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                Recent Searches:
              </span>
              {recentList.slice(0, 4).map((item) => (
                <button
                  key={item.pnr}
                  type="button"
                  onClick={() => void checkPnrStatus(item.pnr, true)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-mono font-bold text-slate-800 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-sky-400"
                >
                  <span>{item.pnr}</span>
                  <span className="font-sans text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    ({item.route})
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={clearRecent}
              className="cursor-pointer font-semibold text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline dark:text-slate-400 dark:hover:text-white"
            >
              Clear history
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200"
          >
            <AlertCircleIcon className="mt-0.5 h-5 w-5 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-bold text-rose-950 dark:text-white">
                Unable to retrieve PNR status
              </p>
              <p className="mt-0.5 text-rose-800 dark:text-rose-200">
                {errorMsg}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && !pnrData && (
        <div className="mt-6 animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="h-32 bg-indigo-50 p-6 dark:bg-slate-800">
            <div className="h-5 w-48 rounded bg-indigo-200/70 dark:bg-slate-700" />
            <div className="mt-4 h-7 w-80 rounded bg-indigo-200/50 dark:bg-slate-700" />
          </div>
          <div className="space-y-4 p-6">
            <div className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      )}

      {/* Boarding Pass Result Card (Fully Light & Dark Mode Compatible!) */}
      {pnrData && (
        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/50">
          {/* Top Ticket Header (Crisp Light Indigo in Light Mode / Deep Sapphire in Dark Mode) */}
          <div className="border-b border-indigo-100 bg-indigo-50/80 bg-gradient-to-br from-indigo-50 via-white to-sky-50 px-6 py-6 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 dark:text-white sm:px-8 sm:py-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-lg bg-indigo-600 px-3 py-1 font-mono text-xs font-extrabold tracking-wider text-white dark:bg-sky-500/20 dark:text-sky-300 dark:ring-1 dark:ring-sky-400/30">
                  PNR {pnrData.formattedPnr}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                    overallBadgeStyles[pnrData.overallStatus] ??
                    overallBadgeStyles.Confirmed
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  <span>{pnrData.overallStatus}</span>
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    pnrData.charting.isPrepared
                      ? "bg-teal-100 text-teal-900 ring-1 ring-teal-600/25 dark:bg-teal-500/25 dark:text-teal-200 dark:ring-teal-400/35"
                      : "bg-slate-200/80 text-slate-800 ring-1 ring-slate-300 dark:bg-white/10 dark:text-slate-200 dark:ring-white/20"
                  }`}
                >
                  {pnrData.charting.isPrepared ? (
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                  ) : (
                    <ClockIcon className="h-3.5 w-3.5" />
                  )}
                  <span>{pnrData.charting.status}</span>
                </span>
              </div>

              {pnrData.train.bookingFare !== null && (
                <div className="text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Ticket Fare
                  </span>
                  <p className="font-mono text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
                    ₹{pnrData.train.bookingFare.toLocaleString("en-IN")}
                  </p>
                </div>
              )}
            </div>

            {/* Train Title & Class */}
            <div className="mt-5 flex flex-col justify-between gap-4 border-t border-indigo-200/70 pt-5 dark:border-white/15 md:flex-row md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rounded-xl bg-slate-900 px-3 py-1 font-mono text-sm font-black text-white dark:bg-sky-400 dark:text-slate-950">
                    #{pnrData.train.number}
                  </span>
                  <h3 className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-2xl">
                    {pnrData.train.name}
                  </h3>
                </div>
                <p className="mt-1.5 text-xs text-slate-700 dark:text-slate-300">
                  Departure:{" "}
                  <span className="font-bold text-slate-950 dark:text-white">
                    {pnrData.train.journeyDateRaw || pnrData.train.journeyDate}
                  </span>
                </p>
              </div>

              <div className="inline-flex self-start rounded-2xl border border-indigo-200 bg-white px-4 py-2.5 shadow-2xs dark:border-white/20 dark:bg-white/10 md:self-auto">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-700 dark:text-sky-300">
                    Journey Class
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                    {pnrData.train.journeyClassName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Perforated Station Route Timeline */}
          <div className="relative border-b border-dashed border-slate-200 bg-slate-50 px-6 py-6 dark:border-slate-700 dark:bg-slate-800/50 sm:px-8">
            <span
              aria-hidden="true"
              className="absolute -bottom-3.5 -left-3.5 h-7 w-7 rounded-full border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-3.5 -right-3.5 h-7 w-7 rounded-full border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
            />

            <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Boarding Station
                </p>
                <div className="mt-1 flex items-baseline gap-2.5">
                  <span className="font-mono text-2xl font-black text-slate-900 dark:text-white">
                    {pnrData.train.boardingPoint.code}
                  </span>
                  <span className="text-base font-bold text-slate-700 dark:text-slate-200">
                    {pnrData.train.boardingPoint.name}
                  </span>
                </div>
                {pnrData.train.source.code !==
                  pnrData.train.boardingPoint.code && (
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    Train Origin: {pnrData.train.source.name} (
                    {pnrData.train.source.code})
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-600/20 dark:bg-sky-400 dark:ring-sky-400/20" />
                <div className="flex items-center gap-1.5">
                  <span className="h-0.5 w-10 bg-slate-300 dark:bg-slate-600 sm:w-16" />
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    <TrainIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-sky-400" />
                    <span>Direct Rail</span>
                  </span>
                  <span className="h-0.5 w-10 bg-slate-300 dark:bg-slate-600 sm:w-16" />
                </div>
                <span className="h-2.5 w-2.5 rounded-full bg-teal-600 ring-4 ring-teal-600/20 dark:bg-teal-400 dark:ring-teal-400/20" />
              </div>

              <div className="md:text-right">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Destination Station
                </p>
                <div className="mt-1 flex items-baseline gap-2.5 md:justify-end">
                  <span className="font-mono text-2xl font-black text-slate-900 dark:text-white">
                    {pnrData.train.destination.code}
                  </span>
                  <span className="text-base font-bold text-slate-700 dark:text-slate-200">
                    {pnrData.train.destination.name}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Reserved Upto: {pnrData.train.reservationUpto.name} (
                  {pnrData.train.reservationUpto.code})
                </p>
              </div>
            </div>
          </div>

          {/* Passenger Status Breakdown */}
          <div className="px-6 py-6 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                Passenger Reservation Details ({pnrData.passengers.length})
              </h4>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Synced at{" "}
                {new Date(pnrData.generatedAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="w-full min-w-[580px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                    <th className="px-4 py-3.5">Passenger</th>
                    <th className="px-4 py-3.5">Booking Status</th>
                    <th className="px-4 py-3.5">Current Live Status</th>
                    <th className="px-4 py-3.5">Coach &amp; Seat / Berth</th>
                    <th className="px-4 py-3.5">Quota</th>
                    <th className="px-4 py-3.5 text-right">Ticket State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
                  {pnrData.passengers.map((pax) => (
                    <tr
                      key={pax.serialNumber}
                      className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">
                        <span className="inline-flex items-center gap-2.5">
                          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white dark:bg-indigo-500">
                            {pax.serialNumber}
                          </span>
                          <span>Passenger {pax.serialNumber}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {pax.booking.formatted}
                      </td>
                      <td className="px-4 py-4 font-mono text-sm font-extrabold text-slate-900 dark:text-white">
                        {pax.current.formatted}
                      </td>
                      <td className="px-4 py-4">
                        {pax.current.coachId || pax.current.berthNo ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {pax.current.coachId && (
                              <span className="rounded-lg bg-indigo-50 px-2.5 py-1 font-mono text-xs font-bold text-indigo-900 ring-1 ring-indigo-600/20 dark:bg-indigo-500/20 dark:text-indigo-200 dark:ring-indigo-400/30">
                                Coach {pax.current.coachId}
                              </span>
                            )}
                            {pax.current.berthNo !== null && (
                              <span className="rounded-lg bg-teal-50 px-2.5 py-1 font-mono text-xs font-bold text-teal-900 ring-1 ring-teal-600/20 dark:bg-teal-500/20 dark:text-teal-200 dark:ring-teal-400/30">
                                Seat #{pax.current.berthNo}
                              </span>
                            )}
                            {pax.berthName && (
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                · {pax.berthName}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Assigned at charting
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {pax.current.quotaName ||
                          pax.current.quota ||
                          "General"}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${
                            passengerPillStyles[pax.statusBadge] ??
                            passengerPillStyles.OTHER
                          }`}
                        >
                          {pax.statusBadge === "CNF"
                            ? "CONFIRMED"
                            : pax.statusBadge === "RAC"
                              ? "RAC"
                              : pax.statusBadge === "WL"
                                ? "WAITLIST"
                                : pax.statusBadge === "CAN"
                                  ? "CANCELLED"
                                  : pax.current.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Ticket Action Bar */}
            <div className="no-print mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => void checkPnrStatus(pnrData.pnrNumber, false)}
                  disabled={loading}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <RefreshIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-sky-400" />
                  <span>Refresh Live</span>
                </button>

                <button
                  type="button"
                  onClick={() => void handleCopySummary()}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <CopyIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-sky-400" />
                  <span>
                    {copied ? "Copied Summary!" : "Copy Ticket Summary"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <PrinterIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-sky-400" />
                  <span>Print / Save PDF</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowRawApi((v) => !v)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 font-mono text-xs font-semibold text-sky-300 transition hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <CodeIcon className="h-3.5 w-3.5" />
                <span>{showRawApi ? "Hide" : "Inspect"} Owned API JSON</span>
                <span className="text-slate-400">
                  ({apiResponse?.meta.responseTimeMs ?? 0}ms)
                </span>
              </button>
            </div>

            {/* Owned API Inspector Drawer */}
            {showRawApi && apiResponse && (
              <div className="no-print mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900 px-4 py-2.5 text-xs">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-bold text-emerald-300">
                      GET 200
                    </span>
                    <span className="text-slate-200">
                      {apiResponse.endpoint}
                    </span>
                  </div>
                  <a
                    href={apiResponse.endpoint}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-sky-400 hover:text-sky-300"
                  >
                    <span>Open Direct API Endpoint</span>
                    <ArrowRightIcon className="h-3.5 w-3.5" />
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
