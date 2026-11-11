"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
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
  TicketIcon,
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

  const liveTrainHref = pnrData?.train.number
    ? `/rail/live-status/${encodeURIComponent(pnrData.train.number)}${
        /^\d{4}-\d{2}-\d{2}$/.test(pnrData.train.journeyDate)
          ? `?date=${encodeURIComponent(pnrData.train.journeyDate)}`
          : ""
      }`
    : "/rail/live-status";

  const overallBadgeStyles: Record<string, string> = {
    Confirmed:
      "border-emerald-500/35 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    RAC: "border-blue-500/35 bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300",
    Waitlisted:
      "border-rose-500/35 bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    "Partially Confirmed":
      "border-amber-500/35 bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    Cancelled: "border-line-strong bg-subcard text-ink-soft",
  };

  const passengerPillStyles: Record<string, string> = {
    CNF: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300",
    RAC: "bg-blue-50 text-[#1956b4] ring-1 ring-blue-500/30 dark:bg-blue-500/15 dark:text-blue-300",
    WL: "bg-rose-50 text-rose-700 ring-1 ring-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300",
    CAN: "bg-subcard text-ink-soft ring-1 ring-line",
    OTHER:
      "bg-amber-50 text-amber-800 ring-1 ring-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300",
  };

  return (
    <div className="w-full space-y-5">
      {/* Clean Segmented ConfirmTkt / ixigo PNR Search Box */}
      <div className="rounded-2xl border border-line bg-card p-4 shadow-md sm:p-5">
        <form onSubmit={handleSubmit}>
          <div className="grid divide-y divide-line rounded-xl border border-line-strong bg-input sm:grid-cols-[1fr_auto] sm:divide-x sm:divide-y-0">
            <div className="px-3.5 py-2.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="pnr-number-input"
                  className="text-[11px] font-bold uppercase tracking-wider text-ink-muted"
                >
                  10-Digit IRCTC PNR Number
                </label>
                <span
                  className={`font-mono text-[11px] font-bold ${
                    digitCount === 10
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-ink-muted"
                  }`}
                >
                  {digitCount}/10 digits
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2.5">
                <TicketIcon className="h-4 w-4 shrink-0 text-[#1956b4] dark:text-blue-400" />
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
                  className="w-full bg-transparent font-mono text-base font-bold tracking-wider text-ink placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-ink-muted focus:outline-none sm:text-lg"
                />
              </div>
            </div>

            <div className="flex items-center p-2">
              <button
                type="submit"
                disabled={loading}
                className="ta-btn-primary inline-flex h-12 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-6 text-sm font-bold sm:w-auto disabled:cursor-not-allowed disabled:opacity-65"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <SearchIcon className="h-4 w-4" />
                    <span>Check PNR Status</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Recent Searches */}
        {recentList.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-ink-muted">Recent:</span>
              {recentList.slice(0, 4).map((item) => (
                <button
                  key={item.pnr}
                  type="button"
                  onClick={() => void checkPnrStatus(item.pnr, true)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-line bg-subcard px-2.5 py-1 font-mono font-bold text-ink transition hover:border-[#1956b4]"
                >
                  <span>{item.pnr}</span>
                  <span className="font-sans text-[11px] font-normal text-ink-muted">
                    ({item.route})
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={clearRecent}
              className="cursor-pointer font-medium text-ink-muted hover:text-ink hover:underline"
            >
              Clear
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div
            role="alert"
            className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-50 p-3.5 text-sm dark:bg-rose-500/10"
          >
            <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-bold text-ink">Unable to retrieve PNR status</p>
              <p className="mt-0.5 text-xs text-ink-soft">{errorMsg}</p>
            </div>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && !pnrData && (
        <div className="animate-pulse overflow-hidden rounded-2xl border border-line bg-card p-6 shadow-sm">
          <div className="h-5 w-48 rounded bg-subcard" />
          <div className="mt-4 h-20 rounded-xl bg-subcard" />
          <div className="mt-4 h-28 rounded-xl bg-subcard" />
        </div>
      )}

      {/* Clean ConfirmTkt / ixigo PNR Ticket Card */}
      {pnrData && (
        <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-md">
          {/* Header Strip */}
          <div className="ta-ticket-header px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-[#1956b4] px-2.5 py-1 font-mono text-xs font-bold text-white">
                  PNR {pnrData.formattedPnr}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-bold ${
                    overallBadgeStyles[pnrData.overallStatus] ??
                    overallBadgeStyles.Confirmed
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  <span>{pnrData.overallStatus}</span>
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    pnrData.charting.isPrepared
                      ? "border-emerald-500/35 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                      : "border-line bg-card text-ink-soft"
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
                  <span className="text-[11px] font-semibold text-ink-muted">
                    Ticket Fare:{" "}
                  </span>
                  <strong className="font-mono text-sm font-extrabold text-ink">
                    ₹{pnrData.train.bookingFare.toLocaleString("en-IN")}
                  </strong>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col justify-between gap-3 border-t border-line pt-4 md:flex-row md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-card px-2 py-0.5 font-mono text-xs font-bold text-[#1956b4] ring-1 ring-line dark:text-blue-300">
                    #{pnrData.train.number}
                  </span>
                  <h3 className="text-lg font-extrabold text-ink sm:text-xl">
                    {pnrData.train.name}
                  </h3>
                </div>
                <p className="mt-1 text-xs text-ink-soft">
                  Journey Date:{" "}
                  <strong className="text-ink">
                    {pnrData.train.journeyDateRaw || pnrData.train.journeyDate}
                  </strong>{" "}
                  · Class:{" "}
                  <strong className="text-ink">
                    {pnrData.train.journeyClassName}
                  </strong>
                </p>
              </div>

              <Link
                href={liveTrainHref}
                className="ta-btn-primary inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold"
              >
                <TrainIcon className="h-3.5 w-3.5" />
                <span>Spot Train #{pnrData.train.number} Live</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Clean Boarding → Destination Strip */}
          <div className="border-b border-line bg-card px-4 py-4 sm:px-6">
            <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  Boarding Station
                </p>
                <div className="mt-0.5 flex items-baseline gap-2">
                  <span className="font-mono text-xl font-black text-ink sm:text-2xl">
                    {pnrData.train.boardingPoint.code}
                  </span>
                  <span className="text-sm font-bold text-ink-soft">
                    {pnrData.train.boardingPoint.name}
                  </span>
                </div>
                {pnrData.train.source.code !==
                  pnrData.train.boardingPoint.code && (
                  <p className="mt-0.5 text-xs text-ink-muted">
                    Origin: {pnrData.train.source.name} (
                    {pnrData.train.source.code})
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 text-ink-muted">
                <span className="h-2 w-2 rounded-full bg-[#1956b4]" />
                <span className="h-0.5 w-14 bg-line-strong sm:w-20" />
                <TrainIcon className="h-4 w-4 text-[#1956b4] dark:text-blue-400" />
                <span className="h-0.5 w-14 bg-line-strong sm:w-20" />
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>

              <div className="md:text-right">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  Destination Station
                </p>
                <div className="mt-0.5 flex items-baseline gap-2 md:justify-end">
                  <span className="font-mono text-xl font-black text-ink sm:text-2xl">
                    {pnrData.train.destination.code}
                  </span>
                  <span className="text-sm font-bold text-ink-soft">
                    {pnrData.train.destination.name}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-muted">
                  Reserved Upto: {pnrData.train.reservationUpto.name} (
                  {pnrData.train.reservationUpto.code})
                </p>
              </div>
            </div>
          </div>

          {/* Passenger Table */}
          <div className="bg-card px-4 py-5 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-extrabold text-ink">
                Passenger Status ({pnrData.passengers.length})
              </h4>
              <span className="text-xs text-ink-muted">
                Checked{" "}
                {new Date(pnrData.generatedAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="mt-3 overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[540px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-subcard text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                    <th className="px-4 py-3">Passenger</th>
                    <th className="px-4 py-3">Booking Status</th>
                    <th className="px-4 py-3">Current Status</th>
                    <th className="px-4 py-3">Coach &amp; Berth</th>
                    <th className="px-4 py-3">Quota</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-card">
                  {pnrData.passengers.map((pax) => (
                    <tr
                      key={pax.serialNumber}
                      className="transition hover:bg-subcard/50"
                    >
                      <td className="px-4 py-3.5 font-bold text-ink">
                        Passenger {pax.serialNumber}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-ink-soft">
                        {pax.booking.formatted}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-sm font-bold text-ink">
                        {pax.current.formatted}
                      </td>
                      <td className="px-4 py-3.5">
                        {pax.current.coachId || pax.current.berthNo ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {pax.current.coachId && (
                              <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                                {pax.current.coachId}
                              </span>
                            )}
                            {pax.current.berthNo !== null && (
                              <span className="rounded bg-subcard px-2 py-0.5 font-mono text-xs font-bold text-ink">
                                Berth #{pax.current.berthNo}
                              </span>
                            )}
                            {pax.berthName && (
                              <span className="text-xs text-ink-soft">
                                ({pax.berthName})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-ink-muted">
                            Assigned at chart
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-ink-soft">
                        {pax.current.quotaName || pax.current.quota || "GN"}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold ${
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

            {/* Action Bar */}
            <div className="no-print mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void checkPnrStatus(pnrData.pnrNumber, false)}
                  disabled={loading}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-subcard px-3 py-1.5 text-xs font-semibold text-ink hover:border-[#1956b4]"
                >
                  <RefreshIcon className="h-3.5 w-3.5 text-[#1956b4] dark:text-blue-400" />
                  <span>Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={() => void handleCopySummary()}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-subcard px-3 py-1.5 text-xs font-semibold text-ink hover:border-[#1956b4]"
                >
                  <CopyIcon className="h-3.5 w-3.5 text-[#1956b4] dark:text-blue-400" />
                  <span>{copied ? "Copied!" : "Copy Summary"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-subcard px-3 py-1.5 text-xs font-semibold text-ink hover:border-[#1956b4]"
                >
                  <PrinterIcon className="h-3.5 w-3.5 text-[#1956b4] dark:text-blue-400" />
                  <span>Print</span>
                </button>
              </div>

              <span className="text-xs text-ink-muted">
                Live Indian Railways PRS Status
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
