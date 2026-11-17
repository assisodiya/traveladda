"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  buildMetroRoutePath,
  type MetroRouteOption,
} from "@/lib/metro-types";
import {
  ArrowRightIcon,
  CloseIcon,
  ShieldCheckIcon,
  SwapArrowsIcon,
  TrainIcon,
} from "./Icons";

export interface SavedMetroRouteItem {
  fromSlug: string;
  toSlug: string;
  fromName: string;
  toName: string;
  durationMin?: number;
  stopsCount?: number;
  fareInr?: number;
  savedAt: number;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const SAVED_ROUTES_KEY = "ta_metro_saved_routes_v1";
const RECENT_ROUTES_KEY = "ta_metro_recent_routes_v1";
const DISMISS_BANNER_SESSION_KEY = "ta_metro_pwa_dismissed_v1";
const ROUTES_SYNC_EVENT = "ta-metro-routes-sync";

function readStoredRoutes(key: string): SavedMetroRouteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is SavedMetroRouteItem =>
        Boolean(
          item &&
            typeof item.fromSlug === "string" &&
            typeof item.toSlug === "string" &&
            typeof item.fromName === "string" &&
            typeof item.toName === "string"
        )
    );
  } catch {
    return [];
  }
}

function writeStoredRoutes(key: string, items: SavedMetroRouteItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(ROUTES_SYNC_EVENT));
  } catch {
    // Ignore storage quota / private mode errors
  }
}

export function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.82 14.01c-.24.68-1.41 1.3-1.95 1.38-.5.08-1.13.11-1.83-.11-.42-.13-.97-.31-1.66-.61-2.92-1.26-4.82-4.21-4.97-4.41-.14-.19-1.19-1.58-1.19-3.02 0-1.44.75-2.14 1.02-2.43.27-.29.59-.36.78-.36.2 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.82 2.01.89 2.16.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.35 1.46.29.15.46.12.63-.07.17-.19.73-.85.92-1.14.19-.29.39-.24.66-.15.27.1 1.71.81 2 .95.29.15.49.22.56.34.07.12.07.7-.17 1.38z" />
    </svg>
  );
}

function StarBookmarkIcon({
  filled,
  className = "h-4 w-4",
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

function PhoneHomeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <rect x="5" y="2" width="14" height="20" rx="2.5" />
      <path d="M12 18h.01" />
      <path d="M12 7v6" />
      <path d="M9.5 10.5L12 13l2.5-2.5" />
    </svg>
  );
}

export function buildMetroWhatsAppShareUrl(route: MetroRouteOption): string {
  const routeUrl = `https://traveladda.in${buildMetroRoutePath(
    route.fromStation.slug,
    route.toStation.slug
  )}`;

  const changeText =
    route.interchangeCount === 0
      ? "Direct Train (0 Changes)"
      : `${route.interchangeCount} Interchange${route.interchangeCount > 1 ? "s" : ""}`;

  const stepsLines = route.segments.map((seg, idx) => {
    if (seg.type === "walkway") {
      return `• Walk ${seg.fromStation.name} → ${seg.toStation.name} (~${seg.durationMin}m)`;
    }
    const prefix = idx === 0 ? "Board" : "⇄ Switch to";
    return `• ${prefix} *${seg.line?.badge || "Metro"}* at ${seg.fromStation.name} (Towards ${seg.towardsTerminal})`;
  });

  const message = [
    `🚇 *Delhi Metro Route: ${route.fromStation.name} → ${route.toStation.name}*`,
    `⏱️ *${route.totalDurationMin} mins* • ${route.totalStops} Stops • ${changeText}`,
    `🎫 Fare: *₹${route.fare.tokenFareInr}* Token | *₹${route.fare.smartCardPeakInr}* Smart Card`,
    "",
    ...stepsLines,
    `• 📍 Reach *${route.toStation.name}*`,
    "",
    `Check full station list & timings (Ad-Free):`,
    routeUrl,
  ].join("\n");

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function useMetroCommuterRoutes(activeRoute: MetroRouteOption | null) {
  const [savedRoutes, setSavedRoutes] = useState<SavedMetroRouteItem[]>([]);
  const [recentRoutes, setRecentRoutes] = useState<SavedMetroRouteItem[]>([]);

  const syncFromStorage = useCallback(() => {
    setSavedRoutes(readStoredRoutes(SAVED_ROUTES_KEY));
    setRecentRoutes(readStoredRoutes(RECENT_ROUTES_KEY));
  }, []);

  useEffect(() => {
    syncFromStorage();
    window.addEventListener(ROUTES_SYNC_EVENT, syncFromStorage);
    window.addEventListener("storage", syncFromStorage);
    return () => {
      window.removeEventListener(ROUTES_SYNC_EVENT, syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, [syncFromStorage]);

  // Automatically remember last 4 viewed metro routes for quick daily return
  useEffect(() => {
    if (!activeRoute) return;
    const entry: SavedMetroRouteItem = {
      fromSlug: activeRoute.fromStation.slug,
      toSlug: activeRoute.toStation.slug,
      fromName: activeRoute.fromStation.name,
      toName: activeRoute.toStation.name,
      durationMin: activeRoute.totalDurationMin,
      stopsCount: activeRoute.totalStops,
      fareInr: activeRoute.fare.tokenFareInr,
      savedAt: Date.now(),
    };
    const existing = readStoredRoutes(RECENT_ROUTES_KEY).filter(
      (r) => !(r.fromSlug === entry.fromSlug && r.toSlug === entry.toSlug)
    );
    writeStoredRoutes(RECENT_ROUTES_KEY, [entry, ...existing].slice(0, 4));
  }, [activeRoute]);

  const isCurrentRouteSaved = Boolean(
    activeRoute &&
      savedRoutes.some(
        (r) =>
          r.fromSlug === activeRoute.fromStation.slug &&
          r.toSlug === activeRoute.toStation.slug
      )
  );

  const toggleSaveCurrentRoute = useCallback(() => {
    if (!activeRoute) return;
    const current = readStoredRoutes(SAVED_ROUTES_KEY);
    const exists = current.some(
      (r) =>
        r.fromSlug === activeRoute.fromStation.slug &&
        r.toSlug === activeRoute.toStation.slug
    );

    if (exists) {
      writeStoredRoutes(
        SAVED_ROUTES_KEY,
        current.filter(
          (r) =>
            !(
              r.fromSlug === activeRoute.fromStation.slug &&
              r.toSlug === activeRoute.toStation.slug
            )
        )
      );
    } else {
      const nextItem: SavedMetroRouteItem = {
        fromSlug: activeRoute.fromStation.slug,
        toSlug: activeRoute.toStation.slug,
        fromName: activeRoute.fromStation.name,
        toName: activeRoute.toStation.name,
        durationMin: activeRoute.totalDurationMin,
        stopsCount: activeRoute.totalStops,
        fareInr: activeRoute.fare.tokenFareInr,
        savedAt: Date.now(),
      };
      writeStoredRoutes(SAVED_ROUTES_KEY, [nextItem, ...current].slice(0, 6));
    }
  }, [activeRoute]);

  const removeSavedRoute = useCallback((fromSlug: string, toSlug: string) => {
    const current = readStoredRoutes(SAVED_ROUTES_KEY);
    writeStoredRoutes(
      SAVED_ROUTES_KEY,
      current.filter((r) => !(r.fromSlug === fromSlug && r.toSlug === toSlug))
    );
  }, []);

  return {
    savedRoutes,
    recentRoutes,
    isCurrentRouteSaved,
    toggleSaveCurrentRoute,
    removeSavedRoute,
  };
}

/**
 * Compact strip showing user's pinned daily Metro routes (with 1-tap evening return ⇄)
 * or recently checked Metro routes so Home Screen commuters open their route in 1 tap.
 */
export function SavedDailyMetroRoutesStrip({
  savedRoutes,
  recentRoutes,
  currentFromSlug,
  currentToSlug,
  onRemoveSaved,
}: {
  savedRoutes: SavedMetroRouteItem[];
  recentRoutes: SavedMetroRouteItem[];
  currentFromSlug?: string;
  currentToSlug?: string;
  onRemoveSaved: (fromSlug: string, toSlug: string) => void;
}) {
  const hasSaved = savedRoutes.length > 0;
  const displayList = hasSaved ? savedRoutes : recentRoutes.slice(0, 3);

  if (displayList.length === 0) return null;

  return (
    <div className="rounded-2xl border border-line bg-card px-3.5 py-2.5 shadow-2xs sm:px-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300">
          <StarBookmarkIcon filled={hasSaved} className="h-3.5 w-3.5 text-amber-500" />
          <span>{hasSaved ? "Saved Daily Routes:" : "Recent Metro Routes:"}</span>
        </span>

        <div className="flex flex-1 items-center gap-1.5 overflow-x-auto pb-0.5 sm:flex-wrap sm:overflow-visible sm:pb-0">
          {displayList.map((item) => {
            const isActive =
              currentFromSlug === item.fromSlug &&
              currentToSlug === item.toSlug;
            return (
              <div
                key={`${item.fromSlug}-${item.toSlug}`}
                className={`inline-flex shrink-0 items-center rounded-xl border text-xs transition ${
                  isActive
                    ? "border-[#1956b4] bg-blue-50/90 dark:bg-blue-500/15"
                    : "border-line bg-subcard/70 hover:border-[#1956b4]"
                }`}
              >
                <Link
                  href={buildMetroRoutePath(item.fromSlug, item.toSlug)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 font-bold text-ink hover:text-[#1956b4]"
                >
                  <TrainIcon className="h-3 w-3 text-[#1956b4] dark:text-blue-400" />
                  <span>
                    {item.fromName} → {item.toName}
                  </span>
                  {item.fareInr && (
                    <span className="rounded bg-emerald-500/12 px-1.5 py-0.2 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                      ₹{item.fareInr}
                    </span>
                  )}
                </Link>

                {/* 1-Tap Evening Return Route (Destination -> Origin) */}
                <Link
                  href={buildMetroRoutePath(item.toSlug, item.fromSlug)}
                  title={`Return Route: ${item.toName} → ${item.fromName}`}
                  aria-label={`Return Route: ${item.toName} to ${item.fromName}`}
                  className="inline-flex h-7 w-7 items-center justify-center border-l border-line text-[#fc6203] transition hover:bg-card"
                >
                  <SwapArrowsIcon className="h-3 w-3" />
                </Link>

                {hasSaved && (
                  <button
                    type="button"
                    onClick={() => onRemoveSaved(item.fromSlug, item.toSlug)}
                    title="Remove saved route"
                    aria-label="Remove saved route"
                    className="inline-flex h-7 w-6 items-center justify-center rounded-r-xl border-l border-line text-ink-muted transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                  >
                    <CloseIcon className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Inline Save Route + WhatsApp Share buttons for the Metro Route Timeline Card.
 */
export function MetroRouteActionButtons({
  route,
  isSaved,
  onToggleSave,
}: {
  route: MetroRouteOption;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  const whatsAppHref = buildMetroWhatsAppShareUrl(route);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Save / Pin Daily Route Button */}
      <button
        type="button"
        onClick={onToggleSave}
        className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-extrabold transition active:scale-[0.98] ${
          isSaved
            ? "border-amber-500/50 bg-amber-500/15 text-amber-900 dark:text-amber-200"
            : "border-line bg-subcard/70 text-ink hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-300"
        }`}
      >
        <StarBookmarkIcon
          filled={isSaved}
          className={`h-3.5 w-3.5 ${isSaved ? "text-amber-500" : "text-amber-500"}`}
        />
        <span>{isSaved ? "Saved Route" : "Save Route"}</span>
      </button>

      {/* 1-Tap WhatsApp Route Share */}
      <a
        href={whatsAppHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1fa855] px-3.5 py-2 text-xs font-extrabold text-white shadow-2xs transition hover:bg-[#198c46] active:scale-[0.98]"
      >
        <WhatsAppIcon className="h-3.5 w-3.5" />
        <span>WhatsApp Share</span>
      </a>
    </div>
  );
}

/**
 * Attractive, Trust-First "Add Metro App to Home Screen" Card:
 * Highlights 100% Ad-Free, Zero Spam, Safe, Offline Underground Support & Daily Route Pinning.
 */
export function MetroAddToHomeScreenCard({
  activeRoute,
  isCurrentRouteSaved,
  onToggleSaveRoute,
}: {
  activeRoute: MetroRouteOption | null;
  isCurrentRouteSaved: boolean;
  onToggleSaveRoute: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installedJustNow, setInstalledJustNow] = useState(false);
  const [showManualSteps, setShowManualSteps] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    setMounted(true);

    // Register lightweight Metro offline Service Worker quietly
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => undefined);
    }

    const standaloneMatch =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
    setIsStandalone(standaloneMatch);

    const iosDetected =
      /iPad|iPhone|iPod/.test(window.navigator.userAgent) &&
      !("MSStream" in window);
    setIsIOS(iosDetected);

    try {
      if (window.sessionStorage.getItem(DISMISS_BANNER_SESSION_KEY) === "1") {
        setDismissed(true);
      }
    } catch {
      // Ignore private browsing restrictions
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalledJustNow(true);
      setDeferredPrompt(null);
      setShowManualSteps(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    // Also auto-save current route if user is installing from a specific Metro route!
    if (activeRoute && !isCurrentRouteSaved) {
      onToggleSaveRoute();
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setInstalledJustNow(true);
          setDeferredPrompt(null);
        }
      } catch {
        setShowManualSteps(true);
      }
      return;
    }

    setShowManualSteps((prev) => !prev);
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISS_BANNER_SESSION_KEY, "1");
    } catch {
      // Ignore
    }
  };

  if (!mounted || isStandalone || dismissed) return null;

  if (installedJustNow) {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-50/90 p-4 shadow-xs dark:bg-emerald-950/30">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <ShieldCheckIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-emerald-950 dark:text-emerald-200">
                TravelAdda Metro Added to Your Home Screen!
              </p>
              <p className="text-xs text-emerald-800 dark:text-emerald-300/90">
                100% Ad-Free &amp; Zero Spam. Open anytime in 1 tap for your saved daily Metro routes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close message"
            className="rounded-lg p-1.5 text-emerald-800 hover:bg-emerald-500/15 dark:text-emerald-300"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#1956b4]/25 bg-gradient-to-r from-[#0d223f] via-[#12315c] to-[#1956b4] p-4 text-white shadow-md sm:p-5">
      {/* Dismiss button */}
      <button
        type="button"
        onClick={handleDismiss}
        title="Dismiss for now"
        aria-label="Dismiss Add to Home Screen card"
        className="absolute top-3 right-3 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/10 text-blue-100 transition hover:bg-white/20 hover:text-white"
      >
        <CloseIcon className="h-3.5 w-3.5" />
      </button>

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="min-w-0 pr-6 lg:pr-0">
          {/* Trust Pill */}
          <div className="inline-flex flex-wrap items-center gap-1.5 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-200 ring-1 ring-emerald-300/30">
            <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-300" />
            <span>100% Ad-Free • Zero Spam • Completely Safe</span>
          </div>

          <h3 className="mt-2 text-base font-black tracking-tight text-white sm:text-lg">
            Daily Metro Commuter? Add TravelAdda Metro to Your Home Screen
          </h3>

          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-blue-100/90 sm:text-[13px]">
            Open your morning &amp; evening Metro routes in{" "}
            <strong className="text-white">1 tap like a native app</strong> —{" "}
            <strong className="text-amber-200">
              no annoying ads, no popups, no login required, and zero spam notifications
            </strong>
            . Even works offline inside underground Metro tunnels!
          </p>

          {/* 4 Attractive Commuter Trust Badges */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-blue-50">
            <span className="rounded-lg bg-white/10 px-2.5 py-1">
              🚫 Without Ads &amp; Popups
            </span>
            <span className="rounded-lg bg-white/10 px-2.5 py-1">
              🔒 Safe &amp; Private (No Login)
            </span>
            <span className="rounded-lg bg-white/10 px-2.5 py-1">
              ⭐ Save Daily Home ↔ Office Route
            </span>
            <span className="rounded-lg bg-white/10 px-2.5 py-1">
              📶 Underground Offline Access
            </span>
          </div>
        </div>

        {/* Action CTA Stack */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-nowrap lg:flex-col lg:items-stretch">
          <button
            type="button"
            onClick={handleInstallClick}
            className="ta-btn-primary inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold tracking-wide whitespace-nowrap text-white shadow-sm transition active:scale-[0.98] sm:px-5 sm:py-3 sm:text-sm"
          >
            <PhoneHomeIcon className="h-4 w-4" />
            <span>Add to Home Screen (Free)</span>
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </button>

          {activeRoute && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleSaveRoute}
                className={`inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-extrabold whitespace-nowrap transition ${
                  isCurrentRouteSaved
                    ? "border-amber-300/60 bg-amber-400/20 text-amber-200"
                    : "border-white/25 bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <StarBookmarkIcon
                  filled={isCurrentRouteSaved}
                  className="h-3.5 w-3.5 text-amber-300"
                />
                <span>
                  {isCurrentRouteSaved ? "Route Saved ★" : "Save Daily Route"}
                </span>
              </button>

              <a
                href={buildMetroWhatsAppShareUrl(activeRoute)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1fa855] px-3 py-2 text-xs font-extrabold whitespace-nowrap text-white transition hover:bg-[#198c46]"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Clean 2-Step Guide when Browser Requires Manual Add-to-Home-Screen (e.g., iPhone Safari) */}
      {showManualSteps && (
        <div className="mt-3.5 rounded-xl border border-white/20 bg-white/12 p-3 text-xs text-white backdrop-blur-xs">
          {isIOS ? (
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-bold">
                📱 <span className="text-amber-300">iPhone / Safari (2 Easy Steps):</span>{" "}
                1. Tap the <strong className="underline">Share icon (⬆️)</strong> at the bottom bar → 2. Tap{" "}
                <strong className="underline">&ldquo;Add to Home Screen (➕)&rdquo;</strong>.
              </p>
              <button
                type="button"
                onClick={() => setShowManualSteps(false)}
                className="self-start rounded-lg bg-white/15 px-2.5 py-1 text-[11px] font-extrabold hover:bg-white/25 sm:self-center"
              >
                Got it
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-bold">
                📲 <span className="text-amber-300">Add in 2 Seconds:</span>{" "}
                1. Tap your browser menu <strong className="underline">(⋮)</strong> at top-right → 2. Tap{" "}
                <strong className="underline">&ldquo;Add to Home screen&rdquo;</strong> or{" "}
                <strong className="underline">&ldquo;Install app&rdquo;</strong>.
              </p>
              <button
                type="button"
                onClick={() => setShowManualSteps(false)}
                className="self-start rounded-lg bg-white/15 px-2.5 py-1 text-[11px] font-extrabold hover:bg-white/25 sm:self-center"
              >
                Got it
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
