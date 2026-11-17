"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { buildChartTimePath } from "@/lib/chart-time-types";
import {
  buildTrainLiveStatusPath,
  formatIstTime,
  isReservedChartEligibleTrain,
  type NormalizedLiveTrainData,
  type NormalizedRouteStop,
} from "@/lib/live-train-types";
import {
  ArrowRightIcon,
  ClockIcon,
  CloseIcon,
  MapPinIcon,
  ShieldCheckIcon,
  TrainIcon,
} from "./Icons";
import { WhatsAppIcon } from "./MetroCommuterToolkit";

export interface PinnedTrainItem {
  trainNumber: string;
  trainName: string;
  routeLabel: string;
  myStationCode?: string;
  pinnedAt: number;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PINNED_TRAINS_KEY = "ta_pinned_live_trains_v1";
const MY_STATION_MAP_KEY = "ta_train_my_station_v1";
const RAIL_PWA_DISMISS_KEY = "ta_rail_pwa_dismissed_v1";
const PINNED_SYNC_EVENT = "ta-rail-pinned-sync";

function readPinnedTrains(): PinnedTrainItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PINNED_TRAINS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch {
    return [];
  }
}

function writePinnedTrains(items: PinnedTrainItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PINNED_TRAINS_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(PINNED_SYNC_EVENT));
  } catch {
    // Ignore storage restrictions
  }
}

export function readSavedStationForTrain(trainNumber: string): string {
  if (typeof window === "undefined" || !trainNumber) return "";
  try {
    const raw = window.localStorage.getItem(MY_STATION_MAP_KEY);
    if (!raw) return "";
    const parsed = JSON.parse(raw) as Record<string, string>;
    return typeof parsed?.[trainNumber] === "string" ? parsed[trainNumber] : "";
  } catch {
    return "";
  }
}

export function saveStationForTrain(trainNumber: string, stationCode: string) {
  if (typeof window === "undefined" || !trainNumber) return;
  try {
    const raw = window.localStorage.getItem(MY_STATION_MAP_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    if (stationCode) {
      parsed[trainNumber] = stationCode;
    } else {
      delete parsed[trainNumber];
    }
    window.localStorage.setItem(MY_STATION_MAP_KEY, JSON.stringify(parsed));
  } catch {
    // Ignore
  }
}

export function buildTrainWhatsAppShareUrl(
  data: NormalizedLiveTrainData,
  myStop?: NormalizedRouteStop | null
): string {
  const canonicalUrl = `https://traveladda.in${buildTrainLiveStatusPath(
    data.trainNumber,
    data.trainName
  )}`;

  const lines: string[] = [
    `🚆 *Live Train Status: #${data.trainNumber} ${data.trainName}*`,
    `📍 *Status:* ${data.livePosition.headline}`,
    `⏱️ *Delay:* ${data.livePosition.delayStatus}`,
  ];

  if (data.nextHalt) {
    const pf = data.nextHalt.platform ? ` (PF #${data.nextHalt.platform})` : "";
    lines.push(
      `⏭️ *Next Stop:* ${data.nextHalt.stationName} (${data.nextHalt.stationCode}) · ETA ${formatIstTime(
        data.nextHalt.expectedArrival
      )}${pf}`
    );
  }

  if (myStop) {
    const myEta = formatIstTime(
      myStop.actualArrival ??
        myStop.scheduledArrival ??
        myStop.actualDeparture ??
        myStop.scheduledDeparture
    );
    const pf = myStop.platform ? ` · PF #${myStop.platform}` : "";
    lines.push(
      `🎯 *${myStop.stationName} (${myStop.stationCode}):* Expected ${myEta}${pf}`
    );
  }

  lines.push(
    "",
    `Track live GPS & coach position (Ad-Free):`,
    canonicalUrl
  );

  return `https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function usePinnedTrainJourneys(
  trainData: NormalizedLiveTrainData | undefined
) {
  const [pinnedTrains, setPinnedTrains] = useState<PinnedTrainItem[]>([]);

  const sync = useCallback(() => {
    setPinnedTrains(readPinnedTrains());
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener(PINNED_SYNC_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PINNED_SYNC_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  const isCurrentPinned = Boolean(
    trainData &&
      pinnedTrains.some((t) => t.trainNumber === trainData.trainNumber)
  );

  const togglePinCurrentTrain = useCallback(
    (myStationCode?: string) => {
      if (!trainData) return;
      const current = readPinnedTrains();
      const exists = current.some(
        (t) => t.trainNumber === trainData.trainNumber
      );
      if (exists) {
        writePinnedTrains(
          current.filter((t) => t.trainNumber !== trainData.trainNumber)
        );
      } else {
        const nextItem: PinnedTrainItem = {
          trainNumber: trainData.trainNumber,
          trainName: trainData.trainName,
          routeLabel: `${trainData.train.source.code} → ${trainData.train.destination.code}`,
          myStationCode,
          pinnedAt: Date.now(),
        };
        writePinnedTrains([nextItem, ...current].slice(0, 5));
      }
    },
    [trainData]
  );

  const removePinnedTrain = useCallback((trainNumber: string) => {
    const current = readPinnedTrains();
    writePinnedTrains(current.filter((t) => t.trainNumber !== trainNumber));
  }, []);

  return {
    pinnedTrains,
    isCurrentPinned,
    togglePinCurrentTrain,
    removePinnedTrain,
  };
}

function StarIcon({
  filled,
  className = "h-3.5 w-3.5",
}: {
  filled?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function PinnedTrainsQuickBar({
  pinnedTrains,
  activeTrainNumber,
  onSelectTrain,
  onRemoveTrain,
}: {
  pinnedTrains: PinnedTrainItem[];
  activeTrainNumber?: string;
  onSelectTrain: (trainNumber: string) => void;
  onRemoveTrain: (trainNumber: string) => void;
}) {
  if (pinnedTrains.length === 0) return null;

  return (
    <div className="rounded-2xl border border-line bg-card px-3.5 py-2.5 shadow-2xs sm:px-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300">
          <StarIcon filled className="h-3.5 w-3.5 text-amber-500" />
          <span>Pinned Journeys:</span>
        </span>

        <div className="ta-no-scrollbar flex flex-1 items-center gap-1.5 overflow-x-auto">
          {pinnedTrains.map((item) => {
            const isCurrent = activeTrainNumber === item.trainNumber;
            return (
              <div
                key={item.trainNumber}
                className={`inline-flex shrink-0 items-center rounded-xl border text-xs transition ${
                  isCurrent
                    ? "border-[#1956b4] bg-blue-50/90 dark:bg-blue-500/15"
                    : "border-line bg-subcard/70 hover:border-[#1956b4]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectTrain(item.trainNumber)}
                  className="inline-flex cursor-pointer items-center gap-1.5 px-2.5 py-1.5 font-bold text-ink hover:text-[#1956b4]"
                >
                  <TrainIcon className="h-3 w-3 text-[#1956b4] dark:text-blue-400" />
                  <span className="font-mono text-[#1956b4] dark:text-blue-300">
                    #{item.trainNumber}
                  </span>
                  <span className="max-w-[140px] truncate">{item.trainName}</span>
                  <span className="text-[10px] font-semibold text-ink-muted">
                    ({item.routeLabel})
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveTrain(item.trainNumber)}
                  aria-label={`Unpin train ${item.trainNumber}`}
                  className="inline-flex h-7 w-6 cursor-pointer items-center justify-center rounded-r-xl border-l border-line text-ink-muted hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                >
                  <CloseIcon className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * "Track My Station" Card — Lets a passenger pick their boarding/alighting halt
 * to immediately see remaining distance, stops left, expected arrival, and platform!
 */
export function MyStationLiveCard({
  data,
  selectedStationCode,
  onSelectStation,
}: {
  data: NormalizedLiveTrainData;
  selectedStationCode: string;
  onSelectStation: (code: string) => void;
}) {
  const haltStops = useMemo(() => {
    const halts = data.route.filter((s) => s.isHalt);
    return halts.length >= 2 ? halts : data.route;
  }, [data.route]);

  const myStop = useMemo(
    () =>
      selectedStationCode
        ? haltStops.find((s) => s.stationCode === selectedStationCode) ?? null
        : null,
    [haltStops, selectedStationCode]
  );

  const metrics = useMemo(() => {
    if (!myStop) return null;
    const myIdx = haltStops.findIndex(
      (s) => s.stationCode === myStop.stationCode
    );
    const currentIdx = haltStops.findIndex(
      (s) => s.stopState === "current" || s.stopState === "upcoming"
    );
    const stopsAway =
      myIdx !== -1 && currentIdx !== -1 ? Math.max(0, myIdx - currentIdx) : 0;
    const kmAway = Math.max(
      0,
      Math.round((myStop.distanceKm - data.summary.distanceCoveredKm) * 10) / 10
    );

    const speedRef =
      data.livePosition.estimatedSpeedKmh > 15
        ? data.livePosition.estimatedSpeedKmh
        : data.train.avgSpeedKmph && data.train.avgSpeedKmph > 20
          ? data.train.avgSpeedKmph
          : 55;
    const estMinsAway = kmAway > 0 ? Math.round((kmAway / speedRef) * 60) : 0;
    const hrs = Math.floor(estMinsAway / 60);
    const mins = estMinsAway % 60;
    const timeLeftLabel =
      estMinsAway <= 0
        ? ""
        : hrs > 0
          ? `~${hrs}h ${mins}m`
          : `~${mins} mins`;

    const expectedTime = formatIstTime(
      myStop.actualArrival ??
        myStop.scheduledArrival ??
        myStop.actualDeparture ??
        myStop.scheduledDeparture
    );

    const delayMins =
      myStop.delayArrival !== 0 ? myStop.delayArrival : myStop.delayDeparture;

    return {
      stopsAway,
      kmAway,
      timeLeftLabel,
      expectedTime,
      delayMins,
    };
  }, [myStop, haltStops, data]);

  return (
    <div className="rounded-2xl border border-[#1956b4]/25 bg-card p-3.5 shadow-xs sm:p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#fc6203] dark:bg-blue-500/15">
            <MapPinIcon className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-extrabold text-ink sm:text-sm">
              Track Your Boarding / Destination Station
            </p>
            <p className="text-[11px] text-ink-muted">
              Select your station for live ETA, distance left &amp; platform number
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label="Select your station on this train route"
            value={selectedStationCode}
            onChange={(e) => onSelectStation(e.target.value)}
            className="h-9 min-w-[210px] flex-1 cursor-pointer rounded-xl border border-line-strong bg-input px-3 text-xs font-bold text-ink focus:border-[#1956b4] focus:outline-none sm:flex-initial"
          >
            <option value="">📍 Select Your Station ({haltStops.length} stops)</option>
            {haltStops.map((stop, idx) => (
              <option key={stop.stationCode} value={stop.stationCode}>
                {idx + 1}. {stop.stationName} ({stop.stationCode}) — Day{" "}
                {stop.arrivalDay || stop.departureDay || 1}
              </option>
            ))}
          </select>

          {myStop && (
            <button
              type="button"
              onClick={() => onSelectStation("")}
              aria-label="Clear selected station"
              className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line bg-subcard text-ink-muted hover:text-ink"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {myStop && metrics && (
        <div className="mt-3 flex flex-col justify-between gap-3 rounded-xl border border-blue-500/25 bg-blue-50/55 p-3.5 sm:flex-row sm:items-center dark:bg-blue-950/25">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-[#1956b4] px-2 py-0.5 font-mono text-[11px] font-extrabold text-white">
                {myStop.stationCode}
              </span>
              <span className="text-sm font-black text-ink sm:text-base">
                {myStop.stationName}
              </span>
              {myStop.platform && (
                <span className="rounded-md border border-line bg-card px-2 py-0.5 font-mono text-[11px] font-extrabold text-ink">
                  Platform #{myStop.platform}
                </span>
              )}
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  myStop.stopState === "current"
                    ? "bg-emerald-600 text-white"
                    : myStop.stopState === "departed"
                      ? "bg-subcard text-ink-muted"
                      : metrics.delayMins > 0
                        ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                        : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                }`}
              >
                {myStop.stopState === "current"
                  ? "At Your Station Now"
                  : myStop.stopState === "departed"
                    ? "Already Departed"
                    : metrics.delayMins > 0
                      ? `+${metrics.delayMins}m Late`
                      : "On Time"}
              </span>
            </div>

            <p className="mt-1 text-xs font-semibold text-ink-soft">
              {myStop.stopState === "departed" ? (
                <>
                  Train departed {myStop.stationName} · Day{" "}
                  {myStop.departureDay || myStop.arrivalDay || 1}
                </>
              ) : myStop.stopState === "current" ? (
                <>Train is currently halted at {myStop.stationName}!</>
              ) : (
                <>
                  <strong className="text-[#1956b4] dark:text-blue-300">
                    {metrics.kmAway} km away
                  </strong>
                  {metrics.timeLeftLabel ? ` (${metrics.timeLeftLabel} left)` : ""}
                  {metrics.stopsAway > 0
                    ? ` · ${metrics.stopsAway} stop${metrics.stopsAway > 1 ? "s" : ""} remaining`
                    : " · Next upcoming stop"}
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
            <div className="rounded-xl border border-line bg-card px-3 py-1.5 text-left sm:text-right">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Expected Time
              </span>
              <span className="font-mono text-sm font-black text-ink sm:text-base">
                {metrics.expectedTime}
              </span>
            </div>

            <a
              href={buildTrainWhatsAppShareUrl(data, myStop)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1fa855] px-3.5 py-2.5 text-xs font-extrabold text-white shadow-2xs transition hover:bg-[#198c46]"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" />
              <span>Share My ETA</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Quick inline action bar for Train Header: Pin Journey + WhatsApp Live Share + Chart Time Link
 */
export function TrainHeaderQuickActions({
  data,
  myStop,
  isPinned,
  onTogglePin,
}: {
  data: NormalizedLiveTrainData;
  myStop?: NormalizedRouteStop | null;
  isPinned: boolean;
  onTogglePin: () => void;
}) {
  const chartEligible = isReservedChartEligibleTrain({
    trainNumber: data.trainNumber,
    type: data.train.type,
  });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onTogglePin}
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-extrabold transition ${
          isPinned
            ? "border-amber-500/50 bg-amber-500/15 text-amber-900 dark:text-amber-200"
            : "border-line bg-card text-ink hover:border-amber-500"
        }`}
      >
        <StarIcon filled={isPinned} className="h-3.5 w-3.5 text-amber-500" />
        <span>{isPinned ? "Pinned ★" : "Pin Train"}</span>
      </button>

      {chartEligible && (
        <Link
          href={buildChartTimePath(data.trainNumber, data.trainName)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card px-3 py-1.5 text-xs font-bold text-[#1956b4] transition hover:border-[#1956b4] dark:text-blue-300"
        >
          <ClockIcon className="h-3.5 w-3.5 text-[#fc6203]" />
          <span>Chart Time</span>
        </Link>
      )}

      <a
        href={buildTrainWhatsAppShareUrl(data, myStop)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-xl bg-[#1fa855] px-3 py-1.5 text-xs font-extrabold text-white shadow-2xs transition hover:bg-[#198c46]"
      >
        <WhatsAppIcon className="h-3.5 w-3.5" />
        <span>WhatsApp Status</span>
      </a>
    </div>
  );
}

/**
 * Calm, Trust-First "Add Live Train Tracker to Home Screen" Card
 * (Ad-Free, Zero Spam, Fast on Weak Highway/Rail Signal).
 */
export function TrainAddToHomeScreenCard({
  trainData,
  isPinned,
  onTogglePin,
}: {
  trainData?: NormalizedLiveTrainData;
  isPinned: boolean;
  onTogglePin: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    setMounted(true);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => undefined);
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean(
        (window.navigator as Navigator & { standalone?: boolean }).standalone
      );
    setIsStandalone(standalone);
    setIsIOS(
      /iPad|iPhone|iPod/.test(window.navigator.userAgent) &&
        !("MSStream" in window)
    );

    try {
      if (window.sessionStorage.getItem(RAIL_PWA_DISMISS_KEY) === "1") {
        setDismissed(true);
      }
    } catch {
      // Ignore
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setShowSteps(false);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!mounted || isStandalone || dismissed) return null;

  const handleInstall = async () => {
    if (trainData && !isPinned) {
      onTogglePin();
    }
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setInstalled(true);
          setDeferredPrompt(null);
        }
      } catch {
        setShowSteps(true);
      }
      return;
    }
    setShowSteps((prev) => !prev);
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(RAIL_PWA_DISMISS_KEY, "1");
    } catch {
      // Ignore
    }
  };

  if (installed) {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-50/90 p-4 text-xs font-bold text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
        ✓ TravelAdda Train Tracker added to your Home Screen! Open anytime in 1 tap — 100% Ad-Free &amp; Zero Spam.
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#1956b4]/25 bg-gradient-to-r from-[#0d223f] via-[#12315c] to-[#1956b4] p-4 text-white shadow-sm sm:p-5">
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss card"
        className="absolute top-3 right-3 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/10 text-blue-100 hover:bg-white/20"
      >
        <CloseIcon className="h-3.5 w-3.5" />
      </button>

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="min-w-0 pr-6 lg:pr-0">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-200 ring-1 ring-emerald-300/30">
            <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-300" />
            <span>100% Ad-Free • Zero Spam • Fast on Weak Rail Network</span>
          </div>

          <h3 className="mt-2 text-base font-black tracking-tight text-white sm:text-lg">
            Traveling by Train? Add Live Train Tracker to Your Home Screen
          </h3>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-blue-100/90 sm:text-[13px]">
            Check your pinned train&apos;s live station, platform &amp; delay in{" "}
            <strong className="text-white">1 tap even on slow highway 2G/3G networks</strong>{" "}
            — <strong className="text-amber-200">without heavy ads, popups, login walls, or spam</strong>.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleInstall}
            className="ta-btn-primary inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold whitespace-nowrap text-white sm:px-5 sm:py-3 sm:text-sm"
          >
            <span>📲 Add to Home Screen (Free)</span>
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {showSteps && (
        <div className="mt-3 rounded-xl border border-white/20 bg-white/12 p-3 text-xs font-bold text-white">
          {isIOS ? (
            <p>
              📱 <span className="text-amber-300">iPhone Safari:</span> Tap{" "}
              <strong className="underline">Share (⬆️)</strong> at the bottom → Tap{" "}
              <strong className="underline">&ldquo;Add to Home Screen (➕)&rdquo;</strong>.
            </p>
          ) : (
            <p>
              📲 <span className="text-amber-300">Quick Install:</span> Tap browser menu{" "}
              <strong className="underline">(⋮)</strong> top-right → Tap{" "}
              <strong className="underline">&ldquo;Add to Home screen / Install app&rdquo;</strong>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
