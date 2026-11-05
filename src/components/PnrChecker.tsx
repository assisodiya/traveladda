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
          "Network error while checking live PNR status. Please retry."
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
      "bg-emerald-500/15 text-emerald-800 border-emerald-500/30 dark:text-emerald-300",
    RAC: "bg-amber-500/15 text-amber-800 border-amber-500/30 dark:text-amber-300",
    Waitlisted:
      "bg-rose-500/15 text-rose-800 border-rose-500/30 dark:text-rose-300",
    "Partially Confirmed":
      "bg-sky-500/15 text-sky-800 border-sky-500/30 dark:text-sky-300",
    Cancelled:
      "bg-slate-500/15 text-ink-soft border-line-strong",
  };

  const passengerPillStyles: Record<string, string> = {
    CNF: "bg-emerald-500/15 text-emerald-800 ring-1 ring-emerald-500/30 dark:text-emerald-300",
    RAC: "bg-amber-500/15 text-amber-800 ring-1 ring-amber-500/30 dark:text-amber-300",
    WL: "bg-rose-500/15 text-rose-800 ring-1 ring-rose-500/30 dark:text-rose-300",
    CAN: "bg-subcard text-ink-soft ring-1 ring-line",
    OTHER: "bg-sky-500/15 text-sky-800 ring-1 ring-sky-500/30 dark:text-sky-300",
  };

  return (
    <div className="w-full">
      {/* Search Card */}
      <div className="rounded-3xl border border-line bg-card p-5 shadow-xl shadow-black/8 dark:shadow-black/35 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-300">
              <TrainIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-ink sm:text-lg">
                Indian Railways Live PNR Status
              </h2>
              <p className="text-xs text-ink-muted">
                Instant seat confirmation, coach &amp; berth numbers, and live
                reservation chart updates
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/12 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span>Live Railway Sync</span>
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
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
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
              className="w-full rounded-2xl border-2 border-line bg-input py-4 pl-12 pr-20 font-mono text-lg font-bold tracking-wider text-ink placeholder:font-sans placeholder:text-sm placeholder:font-medium placeholder:tracking-normal placeholder:text-ink-muted transition focus:border-teal-500 focus:outline-none"
            />
            <span
              className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1 font-mono text-xs font-bold ${
                digitCount === 10
                  ? "bg-emerald-500/18 text-emerald-700 dark:text-emerald-300"
                  : "bg-subcard text-ink-muted"
              }`}
            >
              {digitCount}/10
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="ta-btn-primary inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-extrabold disabled:cursor-not-allowed disabled:opacity-65"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/35 border-t-current" />
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
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3.5 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-ink-muted">
                Recent Searches:
              </span>
              {recentList.slice(0, 4).map((item) => (
                <button
                  key={item.pnr}
                  type="button"
                  onClick={() => void checkPnrStatus(item.pnr, true)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-subcard px-3 py-1 font-mono font-bold text-ink transition hover:border-teal-500"
                >
                  <span>{item.pnr}</span>
                  <span className="font-sans text-[11px] font-medium text-ink-muted">
                    ({item.route})
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={clearRecent}
              className="cursor-pointer font-semibold text-ink-muted underline-offset-2 hover:text-ink hover:underline"
            >
              Clear history
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/12 p-4 text-sm"
          >
            <AlertCircleIcon className="mt-0.5 h-5 w-5 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-bold text-ink">
                Unable to retrieve PNR status
              </p>
              <p className="mt-0.5 text-ink-soft">{errorMsg}</p>
            </div>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && !pnrData && (
        <div className="mt-6 animate-pulse overflow-hidden rounded-3xl border border-line bg-card shadow-lg">
          <div className="h-32 bg-subcard p-6">
            <div className="h-5 w-48 rounded bg-line" />
            <div className="mt-4 h-7 w-80 rounded bg-line" />
          </div>
          <div className="space-y-4 p-6">
            <div className="h-16 rounded-2xl bg-subcard" />
            <div className="h-24 rounded-2xl bg-subcard" />
          </div>
        </div>
      )}

      {/* Boarding Pass Result Card */}
      {pnrData && (
        <div className="mt-6 overflow-hidden rounded-3xl border border-line bg-card shadow-2xl shadow-black/10 dark:shadow-black/45">
          {/* Smooth Ticket Header (Zero White Leak in Dark Mode!) */}
          <div className="ta-ticket-header px-6 py-6 sm:px-8 sm:py-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-lg border border-teal-500/30 bg-teal-500/15 px-3 py-1 font-mono text-xs font-extrabold tracking-wider text-teal-800 dark:text-teal-200">
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
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                    pnrData.charting.isPrepared
                      ? "border-teal-500/30 bg-teal-500/15 text-teal-800 dark:text-teal-200"
                      : "border-line-strong bg-card/70 text-ink-soft"
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
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                    Ticket Fare
                  </span>
                  <p className="font-mono text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
                    ₹{pnrData.train.bookingFare.toLocaleString("en-IN")}
                  </p>
                </div>
              )}
            </div>

            {/* Train Title & Class */}
            <div className="mt-5 flex flex-col justify-between gap-4 border-t border-line pt-5 md:flex-row md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    style={{
                      backgroundColor: "#14b8a6",
                      color: "#07131f",
                    }}
                    className="rounded-xl px-3 py-1 font-mono text-sm font-black shadow-xs"
                  >
                    #{pnrData.train.number}
                  </span>
                  <h3 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
                    {pnrData.train.name}
                  </h3>
                </div>
                <p className="mt-1.5 text-xs text-ink-soft">
                  Departure:{" "}
                  <span className="font-bold text-ink">
                    {pnrData.train.journeyDateRaw || pnrData.train.journeyDate}
                  </span>
                </p>
              </div>

              <div className="inline-flex self-start rounded-2xl border border-line bg-card/85 px-4 py-2.5 shadow-2xs md:self-auto">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-teal-700 dark:text-teal-300">
                    Journey Class
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-ink">
                    {pnrData.train.journeyClassName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Perforated Station Route Timeline */}
          <div className="relative border-b border-dashed border-line bg-subcard px-6 py-6 sm:px-8">
            <span
              aria-hidden="true"
              className="absolute -bottom-3.5 -left-3.5 h-7 w-7 rounded-full border border-line bg-canvas"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-3.5 -right-3.5 h-7 w-7 rounded-full border border-line bg-canvas"
            />

            <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-ink-muted">
                  Boarding Station
                </p>
                <div className="mt-1 flex items-baseline gap-2.5">
                  <span className="font-mono text-2xl font-black text-ink">
                    {pnrData.train.boardingPoint.code}
                  </span>
                  <span className="text-base font-bold text-ink-soft">
                    {pnrData.train.boardingPoint.name}
                  </span>
                </div>
                {pnrData.train.source.code !==
                  pnrData.train.boardingPoint.code && (
                  <p className="mt-1 text-xs text-ink-muted">
                    Train Origin: {pnrData.train.source.name} (
                    {pnrData.train.source.code})
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-500 ring-4 ring-teal-500/20" />
                <div className="flex items-center gap-1.5">
                  <span className="h-0.5 w-10 bg-line-strong sm:w-16" />
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1 text-xs font-bold text-ink-soft shadow-2xs">
                    <TrainIcon className="h-3.5 w-3.5 text-teal-600 dark:text-teal-300" />
                    <span>Direct Rail</span>
                  </span>
                  <span className="h-0.5 w-10 bg-line-strong sm:w-16" />
                </div>
                <span className="h-2.5 w-2.5 rounded-full bg-sky-500 ring-4 ring-sky-500/20" />
              </div>

              <div className="md:text-right">
                <p className="text-[11px] font-bold uppercase tracking-widest text-ink-muted">
                  Destination Station
                </p>
                <div className="mt-1 flex items-baseline gap-2.5 md:justify-end">
                  <span className="font-mono text-2xl font-black text-ink">
                    {pnrData.train.destination.code}
                  </span>
                  <span className="text-base font-bold text-ink-soft">
                    {pnrData.train.destination.name}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  Reserved Upto: {pnrData.train.reservationUpto.name} (
                  {pnrData.train.reservationUpto.code})
                </p>
              </div>
            </div>
          </div>

          {/* Passenger Status Breakdown */}
          <div className="bg-card px-6 py-6 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-ink">
                Passenger Reservation Details ({pnrData.passengers.length})
              </h4>
              <span className="text-xs font-medium text-ink-muted">
                Updated at{" "}
                {new Date(pnrData.generatedAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[580px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-subcard text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                    <th className="px-4 py-3.5">Passenger</th>
                    <th className="px-4 py-3.5">Booking Status</th>
                    <th className="px-4 py-3.5">Current Live Status</th>
                    <th className="px-4 py-3.5">Coach &amp; Seat / Berth</th>
                    <th className="px-4 py-3.5">Quota</th>
                    <th className="px-4 py-3.5 text-right">Ticket State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-card">
                  {pnrData.passengers.map((pax) => (
                    <tr
                      key={pax.serialNumber}
                      className="transition hover:bg-subcard/60"
                    >
                      <td className="px-4 py-4 font-bold text-ink">
                        <span className="inline-flex items-center gap-2.5">
                          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-xs font-extrabold text-teal-800 dark:text-teal-300">
                            {pax.serialNumber}
                          </span>
                          <span>Passenger {pax.serialNumber}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs font-semibold text-ink-soft">
                        {pax.booking.formatted}
                      </td>
                      <td className="px-4 py-4 font-mono text-sm font-extrabold text-ink">
                        {pax.current.formatted}
                      </td>
                      <td className="px-4 py-4">
                        {pax.current.coachId || pax.current.berthNo ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {pax.current.coachId && (
                              <span className="rounded-lg bg-sky-500/15 px-2.5 py-1 font-mono text-xs font-bold text-sky-800 ring-1 ring-sky-500/25 dark:text-sky-300">
                                Coach {pax.current.coachId}
                              </span>
                            )}
                            {pax.current.berthNo !== null && (
                              <span className="rounded-lg bg-teal-500/15 px-2.5 py-1 font-mono text-xs font-bold text-teal-800 ring-1 ring-teal-500/25 dark:text-teal-300">
                                Seat #{pax.current.berthNo}
                              </span>
                            )}
                            {pax.berthName && (
                              <span className="text-xs font-semibold text-ink-soft">
                                · {pax.berthName}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-ink-muted">
                            Assigned at charting
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs font-semibold text-ink-soft">
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

            {/* Clean Ticket Action Bar (No Raw JSON Developer Button!) */}
            <div className="no-print mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => void checkPnrStatus(pnrData.pnrNumber, false)}
                  disabled={loading}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-subcard px-3.5 py-2 text-xs font-bold text-ink transition hover:border-teal-500"
                >
                  <RefreshIcon className="h-3.5 w-3.5 text-teal-600 dark:text-teal-300" />
                  <span>Refresh Status</span>
                </button>

                <button
                  type="button"
                  onClick={() => void handleCopySummary()}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-subcard px-3.5 py-2 text-xs font-bold text-ink transition hover:border-teal-500"
                >
                  <CopyIcon className="h-3.5 w-3.5 text-teal-600 dark:text-teal-300" />
                  <span>
                    {copied ? "Copied Summary!" : "Copy Ticket Summary"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-subcard px-3.5 py-2 text-xs font-bold text-ink transition hover:border-teal-500"
                >
                  <PrinterIcon className="h-3.5 w-3.5 text-teal-600 dark:text-teal-300" />
                  <span>Print / Save PDF</span>
                </button>
              </div>

              <span className="text-xs font-medium text-ink-muted">
                Verified Live Indian Railways PRS Status
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
