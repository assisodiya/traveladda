"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  buildMetroRoutePath,
  buildMetroStationPath,
  type MetroLine,
  type MetroRouteOption,
  type MetroRoutePlanResult,
  type MetroRoutePreference,
  type MetroStation,
  POPULAR_METRO_ROUTES,
} from "@/lib/metro-types";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ClockIcon,
  CloseIcon,
  CompassIcon,
  MapPinIcon,
  RefreshIcon,
  SearchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  SwapArrowsIcon,
  SwapIcon,
  TicketIcon,
  TrainIcon,
} from "./Icons";

interface MetroRouteFinderProps {
  stations: MetroStation[];
  lines: MetroLine[];
  mode?: "search-only" | "details";
  initialFromSlug?: string;
  initialToSlug?: string;
  initialPreference?: MetroRoutePreference;
  initialResult?: MetroRoutePlanResult | null;
}

const LANDMARK_KEYWORDS: Record<string, string> = {
  "rajiv-chowk": "connaught place cp palika bazar central delhi",
  "new-delhi": "ndls new delhi railway station paharganj ajmeri gate",
  "kashmere-gate": "isbt kashmere gate old delhi bus stand",
  "huda-city-centre": "millennium city centre gurugram gurgaon sec 29",
  "mg-road": "mg road gurugram gurgaon malls iffco",
  "igi-airport": "airport t3 terminal 3 international flight",
  "terminal-1-igi-airport": "airport t1 domestic terminal 1d",
  "delhi-aerocity": "aerocity mahipalpur t2",
  "anand-vihar": "anand vihar isbt railway station east delhi",
  "sarai-kale-khan-nizamuddin": "hazrat nizamuddin railway station nzm",
  "supreme-court": "pragati maidan bharat mandapam trade fair",
  "lal-quila": "red fort old delhi",
  "chandni-chowk": "old delhi railway station dli",
  "dilli-haat-ina": "ina market dilli haat",
  "botanical-garden": "noida sec 37",
  "pari-chowk": "greater noida knowledge park",
  "cyber-city-rapid-metro": "dlf cyber hub gurugram",
  "shaheed-sthal-new-bus-adda": "ghaziabad bus stand",
  "raja-nahar-singh": "ballabhgarh faridabad",
};

export function MetroRouteFinder({
  stations,
  lines,
  mode = "details",
  initialFromSlug = "mg-road",
  initialToSlug = "anand-vihar",
  initialPreference = "fastest",
  initialResult = null,
}: MetroRouteFinderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isRoutePending, startRouteTransition] = useTransition();

  const linesMap = useMemo(() => {
    const map = new Map<string, MetroLine>();
    for (const l of lines) map.set(l.id, l);
    return map;
  }, [lines]);

  const stationsBySlug = useMemo(() => {
    const map = new Map<string, MetroStation>();
    for (const s of stations) map.set(s.slug, s);
    return map;
  }, [stations]);

  const [fromSlug, setFromSlug] = useState<string>(initialFromSlug);
  const [toSlug, setToSlug] = useState<string>(initialToSlug);
  const [preference, setPreference] =
    useState<MetroRoutePreference>(initialPreference);

  const [fromQuery, setFromQuery] = useState<string>(
    () => stationsBySlug.get(initialFromSlug)?.name || "MG Road",
  );
  const [toQuery, setToQuery] = useState<string>(
    () => stationsBySlug.get(initialToSlug)?.name || "Anand Vihar",
  );

  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [mobileFormExpanded, setMobileFormExpanded] = useState<boolean>(
    () => mode !== "details",
  );

  const [activeOptionIndex, setActiveOptionIndex] = useState<number>(0);
  const [expandedSegments, setExpandedSegments] = useState<
    Record<number, boolean>
  >({});
  const [manualNavigating, setManualNavigating] = useState<boolean>(false);
  const navigating = isRoutePending || manualNavigating;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isRoutePending) {
      setManualNavigating(false);
    }
  }, [isRoutePending]);

  // Reset button loading state, collapse mobile form on result arrival & sync station inputs
  useEffect(() => {
    setManualNavigating(false);
    setFromOpen(false);
    setToOpen(false);
    if (mode === "details") {
      setMobileFormExpanded(false);
    }
    setFromSlug(initialFromSlug);
    setToSlug(initialToSlug);
    setFromQuery(
      stationsBySlug.get(initialFromSlug)?.name || initialFromSlug,
    );
    setToQuery(stationsBySlug.get(initialToSlug)?.name || initialToSlug);
    setExpandedSegments({});

    if (initialResult) {
      const matchIdx = initialResult.alternatives.findIndex(
        (o) => o.preference === preference,
      );
      setActiveOptionIndex(matchIdx !== -1 ? matchIdx : 0);
    } else {
      setActiveOptionIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pathname,
    initialFromSlug,
    initialToSlug,
    initialResult?.routeSlug,
    stationsBySlug,
  ]);

  const fromBoxRef = useRef<HTMLDivElement>(null);
  const toBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (fromBoxRef.current && !fromBoxRef.current.contains(target)) {
        setFromOpen(false);
      }
      if (toBoxRef.current && !toBoxRef.current.contains(target)) {
        setToOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, []);

  const filterStations = (q: string, excludeSlug?: string) => {
    const clean = q.trim().toLowerCase();
    const currentStationName =
      stationsBySlug.get(fromSlug)?.name.toLowerCase() === clean ||
      stationsBySlug.get(toSlug)?.name.toLowerCase() === clean;

    if (!clean || currentStationName) {
      const topSlugs = [
        "mg-road",
        "anand-vihar",
        "rajiv-chowk",
        "new-delhi",
        "kashmere-gate",
        "huda-city-centre",
        "igi-airport",
        "noida-electronic-city",
        "hauz-khas",
        "botanical-garden",
        "lajpat-nagar",
        "dwarka-sector-21",
        "cyber-city-rapid-metro",
        "pari-chowk",
        "vaishali",
      ];
      const topList = topSlugs
        .map((sl) => stationsBySlug.get(sl))
        .filter(
          (s): s is MetroStation => Boolean(s) && s!.slug !== excludeSlug,
        );
      const rest = stations
        .filter(
          (s) => s.slug !== excludeSlug && !topSlugs.includes(s.slug),
        )
        .slice(0, 20);
      return [...topList, ...rest];
    }

    const scored: { st: MetroStation; score: number }[] = [];
    for (const st of stations) {
      if (st.slug === excludeSlug) continue;
      const nameL = st.name.toLowerCase();
      const kw = LANDMARK_KEYWORDS[st.slug] || "";
      let score = 0;
      if (nameL === clean || st.slug === clean) score = 100;
      else if (nameL.startsWith(clean)) score = 85;
      else if (nameL.split(/[\s()-]+/).some((w) => w.startsWith(clean)))
        score = 72;
      else if (kw.includes(clean)) score = 65;
      else if (nameL.includes(clean)) score = 50;

      if (score > 0) {
        if (st.isInterchange) score += 4;
        scored.push({ st, score });
      }
    }
    scored.sort(
      (a, b) => b.score - a.score || a.st.name.localeCompare(b.st.name),
    );
    return scored.slice(0, 20).map((x) => x.st);
  };

  const deferredFromQuery = useDeferredValue(fromQuery);
  const deferredToQuery = useDeferredValue(toQuery);

  const filteredFrom = useMemo(
    () => filterStations(deferredFromQuery, toSlug),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deferredFromQuery, toSlug, stations],
  );
  const filteredTo = useMemo(
    () => filterStations(deferredToQuery, fromSlug),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deferredToQuery, fromSlug, stations],
  );

  function navigateToRouteDetails(
    nextFromSlug: string,
    nextToSlug: string,
    nextPref: MetroRoutePreference = preference,
  ) {
    if (!nextFromSlug || !nextToSlug) {
      setError("Please select both Origin and Destination metro stations.");
      return;
    }
    if (nextFromSlug === nextToSlug) {
      setError(
        "Origin and Destination stations cannot be the same. Please choose two different stations.",
      );
      return;
    }

    setError(null);
    setFromOpen(false);
    setToOpen(false);
    const targetPath = buildMetroRoutePath(nextFromSlug, nextToSlug);

    // If user submits the exact route already open on screen, update preference & collapse mobile form immediately
    if (pathname === targetPath) {
      setManualNavigating(false);
      if (mode === "details") {
        setMobileFormExpanded(false);
      }
      if (initialResult) {
        const matchIdx = initialResult.alternatives.findIndex(
          (o) => o.preference === nextPref,
        );
        setActiveOptionIndex(matchIdx !== -1 ? matchIdx : 0);
      }
      return;
    }

    setManualNavigating(true);
    startRouteTransition(() => {
      router.push(targetPath);
    });
  }

  function handleSelectFromStation(st: MetroStation) {
    setFromSlug(st.slug);
    setFromQuery(st.name);
    setFromOpen(false);
    setError(null);

    if (!toSlug) {
      setToOpen(true);
    }
  }

  function handleSelectToStation(st: MetroStation) {
    setToSlug(st.slug);
    setToQuery(st.name);
    setToOpen(false);
    setError(null);
  }

  function handleSwapStations() {
    const prevFromSlug = fromSlug;
    const prevToSlug = toSlug;
    const prevFromName =
      stationsBySlug.get(prevFromSlug)?.name || fromQuery;
    const prevToName = stationsBySlug.get(prevToSlug)?.name || toQuery;

    setFromSlug(prevToSlug);
    setToSlug(prevFromSlug);
    setFromQuery(prevToName);
    setToQuery(prevFromName);

    if (
      mode === "details" &&
      prevFromSlug &&
      prevToSlug &&
      prevFromSlug !== prevToSlug
    ) {
      navigateToRouteDetails(prevToSlug, prevFromSlug, preference);
    }
  }

  function handlePreferenceChange(nextPref: MetroRoutePreference) {
    setPreference(nextPref);
    if (initialResult) {
      const matchIdx = initialResult.alternatives.findIndex(
        (o) => o.preference === nextPref,
      );
      if (matchIdx !== -1) {
        setActiveOptionIndex(matchIdx);
      }
    }
  }

  const activeRoute: MetroRouteOption | null = useMemo(() => {
    if (!initialResult) return null;
    return (
      initialResult.alternatives[activeOptionIndex] ||
      initialResult.recommended
    );
  }, [initialResult, activeOptionIndex]);

  const toggleSegmentStops = (segmentIndex: number) => {
    setExpandedSegments((prev) => ({
      ...prev,
      [segmentIndex]: !(prev[segmentIndex] ?? true),
    }));
  };

  const selectedFromStation = stationsBySlug.get(fromSlug);
  const selectedToStation = stationsBySlug.get(toSlug);

  const getStationSubtitle = (st: MetroStation | undefined, fallback: string) => {
    if (!st) return fallback;
    const lineNames = st.routeIds
      .map((rid) => linesMap.get(rid)?.shortName)
      .filter(Boolean)
      .slice(0, 2)
      .join(" • ");
    if (st.isInterchange && lineNames) {
      return `⇄ Interchange • ${lineNames}`;
    }
    return lineNames || fallback;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* MOBILE COMPACT SUMMARY + EDIT BAR (Shown on < md screens after route search / on route result pages) */}
      {mode === "details" && !mobileFormExpanded && (
        <div className="rounded-2xl border border-line bg-card p-3.5 shadow-lg shadow-slate-900/10 md:hidden dark:shadow-black/35">
          <div className="flex items-start justify-between gap-2.5">
            <button
              type="button"
              onClick={() => setMobileFormExpanded(true)}
              className="min-w-0 flex-1 text-left"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider text-[#1956b4] uppercase dark:text-blue-300">
                <TrainIcon className="h-3.5 w-3.5 shrink-0 text-[#fc6203]" />
                <span>Delhi NCR Metro Route</span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm font-extrabold text-ink">
                <span className="truncate">
                  {selectedFromStation?.name || fromQuery}
                </span>
                <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-[#fc6203]" />
                <span className="truncate">
                  {selectedToStation?.name || toQuery}
                </span>
              </div>

              {activeRoute && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-ink-soft">
                  <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 font-extrabold text-emerald-700 dark:text-emerald-300">
                    ₹{activeRoute.fare.tokenFareInr} Token
                  </span>
                  <span>•</span>
                  <span>{activeRoute.totalDurationMin} Mins</span>
                  <span>•</span>
                  <span>{activeRoute.totalStops} Stops</span>
                  <span>•</span>
                  <span>
                    {activeRoute.interchangeCount === 0
                      ? "Direct"
                      : `${activeRoute.interchangeCount} Change`}
                  </span>
                </div>
              )}
            </button>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={handleSwapStations}
                disabled={navigating}
                title="Reverse Metro Route"
                aria-label="Reverse Metro Route"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-line bg-subcard text-[#1956b4] transition hover:border-[#1956b4] active:scale-95 disabled:opacity-60 dark:text-blue-300"
              >
                {navigating ? (
                  <RefreshIcon className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <SwapArrowsIcon className="h-3.5 w-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setMobileFormExpanded(true)}
                className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-xl border border-[#1956b4]/30 bg-blue-50/90 px-3 text-xs font-extrabold text-[#1956b4] shadow-2xs transition hover:bg-[#1956b4] hover:text-white active:scale-95 dark:border-blue-400/30 dark:bg-blue-500/15 dark:text-blue-300"
              >
                <span>Edit</span>
                <ChevronDownIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNIFIED FLIGHT / HOME-PAGE STYLE METRO SEARCH CARD */}
      <div
        className={`w-full max-w-full rounded-2xl border border-line bg-card shadow-xl shadow-slate-900/10 dark:shadow-black/40 ${
          mode === "details" && !mobileFormExpanded ? "hidden md:block" : "block"
        }`}
      >
        {/* Top OTA Service Tab Bar (Matches Flight & Home HeroSearchWidget) */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-2xl border-b border-line px-3.5 pt-2.5 pb-2 sm:px-6 sm:pt-3 sm:pb-0">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            <span className="relative inline-flex items-center gap-1.5 rounded-xl bg-blue-50/90 px-3 py-2 text-xs font-bold text-[#1956b4] sm:rounded-none sm:bg-transparent sm:px-4 sm:py-3 sm:text-sm dark:bg-blue-500/15 dark:text-blue-400 sm:dark:bg-transparent">
              <TrainIcon className="h-4 w-4" />
              <span>Metro Route &amp; Fare</span>
              <span className="hidden sm:absolute sm:right-0 sm:bottom-0 sm:left-0 sm:block sm:h-[3px] sm:rounded-t-full sm:bg-[#fc6203]" />
            </span>

            <Link
              href="/rail/live-status"
              className="hidden items-center gap-1.5 rounded-xl px-3.5 py-3 text-sm font-bold text-ink-muted transition hover:text-ink sm:inline-flex"
            >
              <ClockIcon className="h-4 w-4" />
              <span>Live Train Status</span>
            </Link>

            <Link
              href="/rail/pnr-status"
              className="hidden items-center gap-1.5 rounded-xl px-3.5 py-3 text-sm font-bold text-ink-muted transition hover:text-ink md:inline-flex"
            >
              <TicketIcon className="h-4 w-4" />
              <span>10-Digit PNR</span>
            </Link>
          </div>

          {/* Right Strip: Route Preference Pills + Mobile Close Button */}
          <div className="flex items-center gap-1.5 sm:pb-2">
            <div
              role="group"
              aria-label="Route preference"
              className="inline-flex items-center gap-0.5 rounded-xl border border-line bg-subcard p-0.5"
            >
              {(
                [
                  { id: "fastest", label: "Fastest" },
                  { id: "min-interchange", label: "Min Change" },
                  { id: "min-stops", label: "Min Stops" },
                ] as const
              ).map((tab) => {
                const isSelected = preference === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handlePreferenceChange(tab.id)}
                    style={
                      isSelected
                        ? { backgroundColor: "#1956b4", color: "#ffffff" }
                        : undefined
                    }
                    className={`cursor-pointer rounded-lg px-2 py-1 text-[11px] font-extrabold transition sm:px-2.5 ${
                      isSelected
                        ? "bg-[#1956b4] text-white shadow-2xs"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {mode === "details" && mobileFormExpanded && (
              <button
                type="button"
                onClick={() => {
                  setFromOpen(false);
                  setToOpen(false);
                  setMobileFormExpanded(false);
                }}
                aria-label="Collapse search form"
                className="inline-flex h-7 items-center gap-1 rounded-lg border border-line bg-subcard px-2 text-[11px] font-bold text-ink-soft hover:text-ink md:hidden"
              >
                <CloseIcon className="h-3.5 w-3.5" />
                <span>Close</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Body — Connected Divided Strip Like Flight Search & Home Widget */}
        <div className="min-w-0 p-3.5 sm:p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigateToRouteDetails(fromSlug, toSlug, preference);
            }}
            className="min-w-0 space-y-3.5"
          >
            <div className="grid min-w-0 divide-y divide-line rounded-xl border border-line-strong bg-input lg:grid-cols-[1.28fr_1.28fr_0.82fr_auto] lg:divide-x lg:divide-y-0">
              {/* Cell 1: From (Origin Metro Station) */}
              <div
                ref={fromBoxRef}
                className="relative min-w-0 px-3.5 py-2.5 lg:pr-6"
              >
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="metro-origin-input"
                    className="block text-[11px] font-semibold tracking-wide text-ink-muted uppercase"
                  >
                    From Station
                  </label>
                  {selectedFromStation && (
                    <div className="flex shrink-0 items-center gap-1">
                      {selectedFromStation.routeIds.slice(0, 3).map((rid) => {
                        const ln = linesMap.get(rid);
                        if (!ln) return null;
                        return (
                          <span
                            key={`from-badge-${rid}`}
                            style={{
                              backgroundColor: ln.color,
                              color: ln.textColor,
                            }}
                            className="rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase"
                          >
                            {ln.shortCode}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-1 flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 shrink-0 text-[#1956b4] dark:text-blue-400" />
                  <input
                    id="metro-origin-input"
                    type="text"
                    value={fromQuery}
                    onFocus={() => {
                      setFromOpen(true);
                      setToOpen(false);
                    }}
                    onChange={(e) => {
                      setFromQuery(e.target.value);
                      setFromOpen(true);
                    }}
                    placeholder="Origin Metro Station (e.g. Rajiv Chowk)"
                    className="w-full min-w-0 bg-transparent text-sm font-bold text-ink placeholder:font-normal placeholder:text-ink-muted focus:outline-none sm:text-base"
                    autoComplete="off"
                  />
                  {fromQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setFromQuery("");
                        setFromOpen(true);
                      }}
                      aria-label="Clear origin station"
                      className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:bg-subcard hover:text-ink"
                    >
                      <CloseIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                  {getStationSubtitle(
                    selectedFromStation,
                    "Select boarding metro station",
                  )}
                </p>

                {/* Origin Station Dropdown */}
                {fromOpen && (
                  <div className="absolute top-full right-0 left-0 z-50 mt-1.5 max-h-72 overflow-y-auto rounded-2xl border border-line bg-card p-1.5 shadow-2xl ring-1 ring-black/10">
                    <div className="sticky top-0 z-10 flex items-center justify-between bg-card/95 px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-ink-muted backdrop-blur-xs">
                      <span>
                        {fromQuery.trim()
                          ? "Matching Stations"
                          : "Popular Origin Stations"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setFromOpen(false)}
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold text-[#1956b4]"
                      >
                        Close
                      </button>
                    </div>
                    {filteredFrom.length === 0 ? (
                      <p className="px-3 py-4 text-center text-xs text-ink-muted">
                        No station found matching &ldquo;{fromQuery}&rdquo;
                      </p>
                    ) : (
                      filteredFrom.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => handleSelectFromStation(st)}
                          className={`flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs transition hover:bg-subcard active:bg-blue-50 ${
                            st.slug === fromSlug
                              ? "bg-blue-50/90 font-extrabold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                              : "font-bold text-ink"
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="block truncate text-xs sm:text-sm">
                              {st.name}
                            </span>
                            {st.isInterchange && (
                              <span className="text-[10px] font-semibold text-ink-muted">
                                ⇄ Interchange Station
                              </span>
                            )}
                          </div>
                          <div className="flex shrink-0 flex-wrap items-center gap-1">
                            {st.routeIds.map((rid) => {
                              const ln = linesMap.get(rid);
                              if (!ln) return null;
                              return (
                                <span
                                  key={rid}
                                  style={{
                                    backgroundColor: ln.color,
                                    color: ln.textColor,
                                  }}
                                  className="rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase shadow-2xs"
                                >
                                  {ln.shortCode}
                                </span>
                              );
                            })}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* Floating Swap Circle on Divider (Identical to Flight Search) */}
                <button
                  type="button"
                  onClick={handleSwapStations}
                  title="Swap Origin & Destination Stations"
                  aria-label="Swap Origin and Destination Stations"
                  className="absolute right-3 -bottom-3.5 z-30 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-card text-[#1956b4] shadow-sm transition hover:scale-105 hover:border-[#1956b4] lg:top-1/2 lg:-right-3.5 lg:bottom-auto lg:-translate-y-1/2 dark:text-blue-300"
                >
                  <SwapArrowsIcon className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Cell 2: To (Destination Metro Station) */}
              <div
                ref={toBoxRef}
                className="relative min-w-0 px-3.5 py-2.5 lg:pl-6"
              >
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="metro-dest-input"
                    className="block text-[11px] font-semibold tracking-wide text-ink-muted uppercase"
                  >
                    To Station
                  </label>
                  {selectedToStation && (
                    <div className="flex shrink-0 items-center gap-1">
                      {selectedToStation.routeIds.slice(0, 3).map((rid) => {
                        const ln = linesMap.get(rid);
                        if (!ln) return null;
                        return (
                          <span
                            key={`to-badge-${rid}`}
                            style={{
                              backgroundColor: ln.color,
                              color: ln.textColor,
                            }}
                            className="rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase"
                          >
                            {ln.shortCode}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-1 flex items-center gap-2">
                  <CompassIcon className="h-4 w-4 shrink-0 text-[#fc6203]" />
                  <input
                    id="metro-dest-input"
                    type="text"
                    value={toQuery}
                    onFocus={() => {
                      setToOpen(true);
                      setFromOpen(false);
                    }}
                    onChange={(e) => {
                      setToQuery(e.target.value);
                      setToOpen(true);
                    }}
                    placeholder="Destination Station (e.g. Anand Vihar)"
                    className="w-full min-w-0 bg-transparent text-sm font-bold text-ink placeholder:font-normal placeholder:text-ink-muted focus:outline-none sm:text-base"
                    autoComplete="off"
                  />
                  {toQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setToQuery("");
                        setToOpen(true);
                      }}
                      aria-label="Clear destination station"
                      className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:bg-subcard hover:text-ink"
                    >
                      <CloseIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                  {getStationSubtitle(
                    selectedToStation,
                    "Select destination metro station",
                  )}
                </p>

                {/* Destination Station Dropdown */}
                {toOpen && (
                  <div className="absolute top-full right-0 left-0 z-50 mt-1.5 max-h-72 overflow-y-auto rounded-2xl border border-line bg-card p-1.5 shadow-2xl ring-1 ring-black/10">
                    <div className="sticky top-0 z-10 flex items-center justify-between bg-card/95 px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-ink-muted backdrop-blur-xs">
                      <span>
                        {toQuery.trim()
                          ? "Matching Stations"
                          : "Popular Destination Stations"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setToOpen(false)}
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold text-[#1956b4]"
                      >
                        Close
                      </button>
                    </div>
                    {filteredTo.length === 0 ? (
                      <p className="px-3 py-4 text-center text-xs text-ink-muted">
                        No station found matching &ldquo;{toQuery}&rdquo;
                      </p>
                    ) : (
                      filteredTo.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => handleSelectToStation(st)}
                          className={`flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs transition hover:bg-subcard active:bg-blue-50 ${
                            st.slug === toSlug
                              ? "bg-blue-50/90 font-extrabold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                              : "font-bold text-ink"
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="block truncate text-xs sm:text-sm">
                              {st.name}
                            </span>
                            {st.isInterchange && (
                              <span className="text-[10px] font-semibold text-ink-muted">
                                ⇄ Interchange Station
                              </span>
                            )}
                          </div>
                          <div className="flex shrink-0 flex-wrap items-center gap-1">
                            {st.routeIds.map((rid) => {
                              const ln = linesMap.get(rid);
                              if (!ln) return null;
                              return (
                                <span
                                  key={rid}
                                  style={{
                                    backgroundColor: ln.color,
                                    color: ln.textColor,
                                  }}
                                  className="rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase shadow-2xs"
                                >
                                  {ln.shortCode}
                                </span>
                              );
                            })}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Cell 3: Route Preference Summary Cell (Desktop Strip Balance + 1-Tap Cycle) */}
              <div className="hidden min-w-0 px-3.5 py-2.5 lg:block">
                <span className="block text-[11px] font-semibold tracking-wide text-ink-muted uppercase">
                  Route Priority
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const order: MetroRoutePreference[] = [
                      "fastest",
                      "min-interchange",
                      "min-stops",
                    ];
                    const next =
                      order[(order.indexOf(preference) + 1) % order.length];
                    handlePreferenceChange(next);
                  }}
                  className="mt-1 flex w-full cursor-pointer items-center justify-between gap-1.5 text-left focus:outline-none"
                >
                  <span className="truncate text-sm font-bold text-ink sm:text-base">
                    {preference === "fastest"
                      ? "Fastest Route"
                      : preference === "min-interchange"
                        ? "Min Interchange"
                        : "Minimum Stops"}
                  </span>
                  <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink-muted" />
                </button>
                <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                  Token &amp; Smart Card Fare
                </p>
              </div>

              {/* Cell 4: Vibrant Orange Search CTA */}
              <div className="flex p-2 lg:p-1.5">
                <button
                  type="submit"
                  disabled={navigating}
                  className="ta-btn-primary inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-6 text-sm font-extrabold tracking-wide whitespace-nowrap uppercase transition active:scale-[0.99] disabled:opacity-60 lg:h-full lg:min-w-[164px]"
                >
                  {navigating ? (
                    <>
                      <RefreshIcon className="h-4 w-4 animate-spin" />
                      <span>Loading Route...</span>
                    </>
                  ) : (
                    <>
                      <SearchIcon className="h-4 w-4" />
                      <span>
                        {mode === "search-only"
                          ? "Search Route"
                          : "Update Route"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Popular Route Quick Chips (Flight Search / Home Widget Style) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs sm:flex-wrap sm:gap-2 sm:overflow-visible sm:pb-0">
              <span className="shrink-0 font-medium text-ink-muted">
                Popular Routes:
              </span>
              {POPULAR_METRO_ROUTES.slice(0, 6).map((item) => {
                const isCurrent =
                  mode === "details" &&
                  fromSlug === item.fromSlug &&
                  toSlug === item.toSlug;
                return (
                  <Link
                    key={`${item.fromSlug}-${item.toSlug}`}
                    href={buildMetroRoutePath(item.fromSlug, item.toSlug)}
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 font-medium transition ${
                      isCurrent
                        ? "border-[#1956b4] bg-blue-50/90 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                        : "border-line bg-subcard text-ink-soft hover:border-[#1956b4] hover:text-[#1956b4]"
                    }`}
                  >
                    <TrainIcon className="h-3 w-3 text-[#1956b4] dark:text-blue-400" />
                    <span className="font-semibold text-ink">
                      {item.fromName.replace(/ \(.*\)/, "")} →{" "}
                      {item.toName.replace(/ \(.*\)/, "")}
                    </span>
                  </Link>
                );
              })}

              <span className="ml-auto hidden items-center gap-1 text-[11px] font-bold text-emerald-700 md:inline-flex dark:text-emerald-400">
                <ShieldCheckIcon className="h-3.5 w-3.5" />
                <span>Smart Card 10%–20% Off</span>
              </span>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Active Route Result Dashboard (Rendered on Details Pages) */}
      {mode === "details" && activeRoute && initialResult && (
        <div className="space-y-4 sm:space-y-5">
          {/* Multiple Route Options Comparison Bar (if fastest vs min-interchange differ) */}
          {initialResult.alternatives.length > 1 && (
            <div className="rounded-2xl border border-line bg-card p-3.5 shadow-xs sm:p-4">
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <p className="text-xs font-extrabold uppercase tracking-wider text-ink-muted">
                  Compare Route Options ({initialResult.alternatives.length})
                </p>
                <span className="text-[11px] font-semibold text-ink-muted">
                  Tap to switch route
                </span>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {initialResult.alternatives.map((opt, idx) => {
                  const selected = idx === activeOptionIndex;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setActiveOptionIndex(idx);
                        setPreference(opt.preference);
                      }}
                      className={`flex flex-col justify-between rounded-xl border p-3 text-left transition ${
                        selected
                          ? "border-[#1956b4] bg-blue-50/70 ring-2 ring-[#1956b4]/20 dark:bg-blue-950/30"
                          : "border-line bg-subcard/50 hover:border-[#1956b4]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold text-ink">
                            {opt.label}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              selected
                                ? "bg-[#1956b4] text-white"
                                : "bg-card text-ink-muted"
                            }`}
                          >
                            {opt.badgeText}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1">
                          {opt.segments
                            .filter((s) => s.line)
                            .map((s, sIdx) => (
                              <span
                                key={`${opt.id}-seg-${sIdx}`}
                                style={{
                                  backgroundColor: s.line!.color,
                                  color: s.line!.textColor,
                                }}
                                className="rounded px-2 py-0.5 text-[10px] font-extrabold"
                              >
                                {s.line!.badge}
                              </span>
                            ))}
                        </div>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between border-t border-line pt-2 text-xs font-bold text-ink">
                        <span>{opt.totalDurationMin} mins</span>
                        <span>•</span>
                        <span>
                          {opt.interchangeCount === 0
                            ? "Direct"
                            : `${opt.interchangeCount} Change${opt.interchangeCount > 1 ? "s" : ""}`}
                        </span>
                        <span>•</span>
                        <span>{opt.totalStops} Stops</span>
                        <span>•</span>
                        <span className="text-emerald-700 dark:text-emerald-300">
                          ₹{opt.fare.tokenFareInr}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top 4 Summary Metric Cards — 2x2 Grid on Mobile, 4 Columns on Desktop */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4">
            {/* 1. Travel Time */}
            <div className="rounded-2xl border border-line bg-card p-3.5 shadow-xs sm:p-4">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted sm:text-[11px]">
                  Travel Time
                </span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#1956b4] sm:h-8 sm:w-8 dark:bg-blue-950/50 dark:text-blue-300">
                  <ClockIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </span>
              </div>
              <p className="mt-1 font-mono text-xl font-black text-ink sm:mt-1.5 sm:text-3xl">
                {activeRoute.totalDurationMin} mins
              </p>
              <p className="mt-0.5 text-[11px] leading-tight text-ink-muted sm:text-xs">
                {activeRoute.inTrainDurationMin}m train
                {activeRoute.interchangeDurationMin > 0
                  ? ` + ${activeRoute.interchangeDurationMin}m transfer`
                  : " • Non-stop"}
              </p>
            </div>

            {/* 2. DMRC Token & Smart Card Fare */}
            <div className="rounded-2xl border border-line bg-card p-3.5 shadow-xs sm:p-4">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted sm:text-[11px]">
                  Metro Fare
                </span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 sm:h-8 sm:w-8 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <TicketIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-baseline gap-1.5 sm:mt-1.5 sm:gap-2">
                <p className="font-mono text-xl font-black text-emerald-700 sm:text-3xl dark:text-emerald-300">
                  ₹{activeRoute.fare.tokenFareInr}
                </p>
                <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-700 sm:text-xs dark:text-emerald-300">
                  Card ₹{activeRoute.fare.smartCardPeakInr}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] leading-tight text-ink-muted sm:text-xs">
                Off-Peak: ₹{activeRoute.fare.smartCardOffPeakInr} • Sun: ₹
                {activeRoute.fare.sundayHolidayInr}
              </p>
            </div>

            {/* 3. Total Stations & Distance */}
            <div className="rounded-2xl border border-line bg-card p-3.5 shadow-xs sm:p-4">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted sm:text-[11px]">
                  Stops &amp; Dist
                </span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700 sm:h-8 sm:w-8 dark:bg-amber-950/50 dark:text-amber-300">
                  <MapPinIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </span>
              </div>
              <p className="mt-1 font-mono text-xl font-black text-ink sm:mt-1.5 sm:text-3xl">
                {activeRoute.totalStops} Stops
              </p>
              <p className="mt-0.5 text-[11px] leading-tight text-ink-muted sm:text-xs">
                {activeRoute.totalDistanceKm} km •{" "}
                {activeRoute.fare.distanceSlabLabel}
              </p>
            </div>

            {/* 4. Interchanges & First/Last Train */}
            <div className="rounded-2xl border border-line bg-card p-3.5 shadow-xs sm:p-4">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-muted sm:text-[11px]">
                  Interchange
                </span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-700 sm:h-8 sm:w-8 dark:bg-purple-950/50 dark:text-purple-300">
                  <SparklesIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </span>
              </div>
              <p className="mt-1 text-lg font-black text-ink sm:mt-1.5 sm:text-2xl">
                {activeRoute.interchangeCount === 0
                  ? "Direct (0)"
                  : `${activeRoute.interchangeCount} Change${activeRoute.interchangeCount > 1 ? "s" : ""}`}
              </p>
              <p className="mt-0.5 text-[11px] leading-tight text-ink-muted sm:text-xs">
                {activeRoute.firstTrainFromOrigin} –{" "}
                {activeRoute.lastTrainFromOrigin}
              </p>
            </div>
          </div>

          {/* Clean, Comfortable Metro Route Pointer Timeline Card */}
          <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-xs">
            {/* Calm Light Header — Easy to Scan */}
            <div className="flex flex-col justify-between gap-3 border-b border-line bg-card px-4 py-3.5 sm:flex-row sm:items-center sm:px-6 sm:py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#1956b4]/10 px-2.5 py-0.5 text-[11px] font-extrabold text-[#1956b4] dark:bg-blue-500/20 dark:text-blue-300">
                    <TrainIcon className="h-3 w-3" />
                    <span>{activeRoute.label}</span>
                  </span>
                  <span className="text-xs font-semibold text-ink-muted">
                    Every {activeRoute.peakFrequencyMin} •{" "}
                    {activeRoute.totalStops} stops •{" "}
                    {activeRoute.totalDurationMin} mins
                  </span>
                </div>

                <h3 className="mt-1.5 flex flex-wrap items-center gap-2 text-base font-black tracking-tight text-ink sm:text-lg">
                  <span>{activeRoute.fromStation.name}</span>
                  <ArrowRightIcon className="h-4 w-4 shrink-0 text-[#fc6203]" />
                  <span>{activeRoute.toStation.name}</span>
                </h3>
              </div>

              <Link
                href={buildMetroRoutePath(
                  activeRoute.toStation.slug,
                  activeRoute.fromStation.slug,
                )}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-xl border border-line bg-subcard/70 px-3 py-2 text-xs font-bold text-ink transition hover:border-[#1956b4] hover:text-[#1956b4] sm:self-center"
              >
                <SwapIcon className="h-3.5 w-3.5 text-[#fc6203]" />
                <span>Reverse Route</span>
              </Link>
            </div>

            {/* Compact Single-Line Journey Pointer Strip */}
            <div className="border-b border-line bg-subcard/45 px-4 py-2.5 sm:px-6">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="inline-flex items-center gap-1.5 font-extrabold text-ink">
                  <span className="h-2.5 w-2.5 rounded-full border-2 border-emerald-600 bg-white dark:bg-slate-900" />
                  <span>{activeRoute.fromStation.name}</span>
                </span>

                {activeRoute.segments.map((seg, idx) => (
                  <div
                    key={`flow-${seg.segmentIndex}`}
                    className="inline-flex flex-wrap items-center gap-1.5"
                  >
                    <span className="text-ink-muted">→</span>
                    {seg.line ? (
                      <span
                        style={{
                          backgroundColor: seg.line.color,
                          color: seg.line.textColor,
                        }}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-extrabold shadow-2xs"
                      >
                        <span>{seg.line.badge}</span>
                        <span className="opacity-85">
                          · {seg.stopsCount} stops
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                        🚶 {seg.durationMin}m walk
                      </span>
                    )}

                    {idx < activeRoute.segments.length - 1 && (
                      <>
                        <span className="text-ink-muted">→</span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-card px-2 py-0.5 text-[11px] font-bold text-ink ring-1 ring-line">
                          <span className="text-[#fc6203]">⇄</span>
                          <span>{seg.toStation.name}</span>
                        </span>
                      </>
                    )}
                  </div>
                ))}

                <span className="text-ink-muted">→</span>
                <span className="inline-flex items-center gap-1 font-extrabold text-[#1956b4] dark:text-blue-300">
                  <MapPinIcon className="h-3.5 w-3.5 text-[#fc6203]" />
                  <span>{activeRoute.toStation.name}</span>
                </span>
              </div>
            </div>

            {/* Continuous Vertical Metro Line & Comfortable Station Pointers */}
            <div className="px-3.5 py-5 sm:px-6 sm:py-6">
              <div>
                {activeRoute.segments.map((seg, segIdx) => {
                  const isLastSegment =
                    segIdx === activeRoute.segments.length - 1;
                  const isExpanded =
                    expandedSegments[seg.segmentIndex] ??
                    seg.intermediateStops.length <= 12;
                  const lineColor = seg.line?.color || "#64748B";
                  const lineTextColor = seg.line?.textColor || "#FFFFFF";
                  const intermediateOnly = seg.intermediateStops.slice(1, -1);

                  const nextSeg = activeRoute.segments[segIdx + 1];
                  const matchingInterchange =
                    nextSeg && nextSeg.type === "metro" && seg.type === "metro"
                      ? activeRoute.interchanges.find(
                          (ic) =>
                            !ic.isWalkway &&
                            ic.station.id === seg.toStation.id &&
                            ic.fromLine.id === seg.line?.id,
                        )
                      : null;

                  /* Skywalk / Footbridge Segment Aligned on the Same Left Rail */
                  if (seg.type === "walkway") {
                    return (
                      <div
                        key={`seg-${seg.segmentIndex}`}
                        className="relative flex items-stretch gap-3.5 sm:gap-4"
                      >
                        <div className="relative flex w-9 shrink-0 flex-col items-center sm:w-10">
                          <span className="h-full border-l-2 border-dashed border-amber-500/60" />
                          <span className="absolute top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-amber-400 bg-amber-50 text-xs shadow-2xs dark:bg-amber-950">
                            🚶
                          </span>
                        </div>

                        <div className="my-2 flex-1 rounded-xl border border-amber-400/40 bg-amber-50/50 px-3.5 py-3 dark:bg-amber-950/20">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-extrabold text-ink sm:text-sm">
                              Walk from {seg.fromStation.name} to{" "}
                              {seg.toStation.name}
                            </p>
                            <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 dark:text-amber-200">
                              ~{seg.durationMin} mins (
                              {Math.round(seg.distanceKm * 1000)}m skywalk)
                            </span>
                          </div>
                          {seg.walkwayNote && (
                            <p className="mt-1 text-[11px] text-ink-muted">
                              {seg.walkwayNote}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }

                  const startStep = seg.intermediateStops[0];
                  const endStep =
                    seg.intermediateStops[seg.intermediateStops.length - 1];
                  const platformLabel = seg.platformHint.split("•")[0]?.trim();

                  return (
                    <div key={`seg-${seg.segmentIndex}`}>
                      {/* Metro Line Segment Container */}
                      <div className="relative">
                        {/* Solid Colored Metro Track Spine */}
                        <span
                          style={{ backgroundColor: lineColor }}
                          className="absolute top-4 bottom-4 left-[18px] w-[5px] -translate-x-1/2 rounded-full sm:left-[20px]"
                        />

                        {/* 1. BOARDING STATION POINTER */}
                        <div className="relative flex items-start gap-3.5 pb-3 sm:gap-4">
                          {/* Bullseye Station Node + Downward Direction Pointer on Track */}
                          <div className="relative z-10 flex w-9 shrink-0 flex-col items-center pt-0.5 sm:w-10">
                            <span
                              style={{ borderColor: lineColor }}
                              className="flex h-6 w-6 items-center justify-center rounded-full border-[4px] bg-white shadow-xs ring-3 ring-white dark:bg-slate-900 dark:ring-slate-900"
                            >
                              <span
                                style={{ backgroundColor: lineColor }}
                                className="h-2 w-2 rounded-full"
                              />
                            </span>
                            {/* Subtle Travel Direction Pointer on the Line */}
                            <span
                              style={{
                                backgroundColor: lineColor,
                                color: lineTextColor,
                              }}
                              title={`Towards ${seg.towardsTerminal}`}
                              className="mt-2 flex h-4 w-4 items-center justify-center rounded-full text-[9px] leading-none font-black shadow-2xs ring-2 ring-white dark:ring-slate-900"
                            >
                              ▾
                            </span>
                          </div>

                          {/* Clean Boarding Info + Train Direction Bar */}
                          <div className="min-w-0 flex-1 pt-0.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Link
                                    href={buildMetroStationPath(
                                      seg.fromStation.slug,
                                    )}
                                    className="text-base font-extrabold text-ink hover:text-[#1956b4] hover:underline sm:text-[17px]"
                                  >
                                    {seg.fromStation.name}
                                  </Link>
                                  <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                                    {segIdx === 0 ? "Start" : "Board"}
                                  </span>
                                </div>
                              </div>

                              <span className="shrink-0 font-mono text-xs font-bold text-ink-muted">
                                {startStep?.cumulativeDurationMin ?? 0} min
                              </span>
                            </div>

                            {/* Crisp Direction Pointer Pill ("Yellow Line → Towards ...") */}
                            <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-line/80 bg-subcard/55 px-3 py-2">
                              <span
                                style={{
                                  backgroundColor: lineColor,
                                  color: lineTextColor,
                                }}
                                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-extrabold shadow-2xs"
                              >
                                <TrainIcon className="h-3 w-3" />
                                <span>{seg.line?.badge || "Metro"}</span>
                              </span>

                              <span className="inline-flex items-center gap-1 text-xs font-bold text-ink">
                                <span className="text-[#fc6203]">➔</span>
                                <span>Towards {seg.towardsTerminal}</span>
                              </span>

                              {platformLabel && (
                                <span className="rounded-md bg-card px-2 py-0.5 text-[11px] font-semibold text-ink-soft ring-1 ring-line">
                                  {platformLabel}
                                </span>
                              )}

                              <span className="ml-auto text-[11px] font-semibold text-ink-muted">
                                {seg.stopsCount} stops · {seg.durationMin} mins
                                · {seg.distanceKm} km
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 2. INTERMEDIATE STATIONS — Clean, Borderless Transit List */}
                        {intermediateOnly.length > 0 && (
                          <div className="pb-3">
                            {/* Gentle Expand / Collapse Pill on the Rail */}
                            <div className="relative flex items-center gap-3.5 py-1.5 sm:gap-4">
                              <div className="relative z-10 flex w-9 shrink-0 justify-center sm:w-10">
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleSegmentStops(seg.segmentIndex)
                                  }
                                  aria-label={
                                    isExpanded
                                      ? "Collapse intermediate stops"
                                      : "Expand intermediate stops"
                                  }
                                  style={{ borderColor: lineColor }}
                                  className="flex h-5 w-5 items-center justify-center rounded-full border-2 bg-card text-[9px] font-black text-ink-soft shadow-2xs transition hover:scale-105"
                                >
                                  {isExpanded ? "▴" : "▾"}
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  toggleSegmentStops(seg.segmentIndex)
                                }
                                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1 text-xs font-bold text-ink-soft transition hover:border-[#1956b4] hover:text-[#1956b4]"
                              >
                                <span>
                                  {isExpanded ? "Hide" : "Show"}{" "}
                                  {intermediateOnly.length} intermediate stop
                                  {intermediateOnly.length > 1 ? "s" : ""}
                                </span>
                                <ChevronDownIcon
                                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                />
                              </button>
                            </div>

                            {/* Smooth, Uncluttered Station Pointers */}
                            {isExpanded && (
                              <div className="mt-1 space-y-0.5">
                                {intermediateOnly.map((stop, stIdx) => {
                                  const otherLines = (stop.routeIds || [])
                                    .filter((rid) => rid !== seg.line?.id)
                                    .map((rid) => linesMap.get(rid))
                                    .filter((l): l is MetroLine => Boolean(l));

                                  return (
                                    <div
                                      key={`${seg.segmentIndex}-${stop.stopId}`}
                                      className="group relative flex items-center gap-3.5 sm:gap-4"
                                    >
                                      {/* Crisp Metro Map Station Circle on Colored Spine */}
                                      <div className="relative z-10 flex w-9 shrink-0 justify-center sm:w-10">
                                        <span
                                          style={{ borderColor: lineColor }}
                                          className={`rounded-full bg-white transition group-hover:scale-125 dark:bg-slate-900 ${
                                            stop.isInterchange
                                              ? "h-3.5 w-3.5 border-[3px] ring-2 ring-white dark:ring-slate-900"
                                              : "h-2.5 w-2.5 border-[2.5px] ring-2 ring-white dark:ring-slate-900"
                                          }`}
                                        />
                                      </div>

                                      {/* Clean Single-Line Row (No Heavy Card Borders) */}
                                      <div className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 transition group-hover:bg-subcard/75">
                                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                                          <span className="w-4 shrink-0 font-mono text-[10px] font-semibold text-ink-muted">
                                            {stIdx + 1}
                                          </span>
                                          <Link
                                            href={buildMetroStationPath(
                                              stop.slug,
                                            )}
                                            className="truncate text-[13px] font-semibold text-ink group-hover:text-[#1956b4] group-hover:underline sm:text-sm"
                                          >
                                            {stop.name}
                                          </Link>

                                          {/* Subtle Crossing Line Dots/Pills Only If Interchange */}
                                          {otherLines.length > 0 && (
                                            <span className="inline-flex items-center gap-1">
                                              {otherLines.map((ol) => (
                                                <span
                                                  key={`${stop.stopId}-${ol.id}`}
                                                  title={`${ol.badge} interchange`}
                                                  style={{
                                                    backgroundColor: ol.color,
                                                    color: ol.textColor,
                                                  }}
                                                  className="rounded px-1.5 py-0.2 text-[9px] font-bold opacity-90"
                                                >
                                                  {ol.badge.replace(
                                                    " Line",
                                                    "",
                                                  )}
                                                </span>
                                              ))}
                                            </span>
                                          )}
                                        </div>

                                        <span className="shrink-0 font-mono text-[11px] text-ink-muted">
                                          {stop.cumulativeDurationMin}m
                                          <span className="hidden sm:inline">
                                            {" "}
                                            · {stop.cumulativeDistanceKm} km
                                          </span>
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 3. ALIGHTING / FINAL DESTINATION POINTER */}
                        <div className="relative flex items-start gap-3.5 pt-1 sm:gap-4">
                          <div className="relative z-10 flex w-9 shrink-0 justify-center pt-0.5 sm:w-10">
                            {isLastSegment ? (
                              /* Crisp Destination Pin Node */
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1956b4] text-white shadow-xs ring-4 ring-[#1956b4]/15">
                                <MapPinIcon className="h-3.5 w-3.5" />
                              </span>
                            ) : (
                              /* Interchange Alight Node */
                              <span
                                style={{ borderColor: lineColor }}
                                className="flex h-6 w-6 items-center justify-center rounded-full border-[4px] bg-amber-50 text-[10px] font-black text-amber-700 shadow-xs ring-3 ring-white dark:bg-slate-900 dark:text-amber-300 dark:ring-slate-900"
                              >
                                ⇄
                              </span>
                            )}
                          </div>

                          <div className="flex min-w-0 flex-1 flex-col justify-between gap-1 pt-0.5 sm:flex-row sm:items-center">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <Link
                                  href={buildMetroStationPath(
                                    seg.toStation.slug,
                                  )}
                                  className="text-base font-extrabold text-ink hover:text-[#1956b4] hover:underline sm:text-[17px]"
                                >
                                  {seg.toStation.name}
                                </Link>
                                {isLastSegment ? (
                                  <span className="rounded-full bg-[#1956b4]/12 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#1956b4] dark:bg-blue-500/20 dark:text-blue-300">
                                    Destination
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                                    Get Down Here
                                  </span>
                                )}
                              </div>

                              <p className="mt-0.5 text-xs text-ink-muted">
                                {isLastSegment
                                  ? `Reached destination • Token ₹${activeRoute.fare.tokenFareInr} (Smart Card ₹${activeRoute.fare.smartCardPeakInr})`
                                  : `Alight from ${seg.line?.badge || "train"} to change line`}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-2 font-mono text-xs font-extrabold text-ink sm:flex-col sm:items-end sm:gap-0.5">
                              <span>
                                {endStep?.cumulativeDurationMin ??
                                  seg.durationMin}{" "}
                                mins
                              </span>
                              <span className="text-[11px] font-semibold text-ink-muted">
                                {endStep?.cumulativeDistanceKm ??
                                  seg.distanceKm}{" "}
                                km
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 4. NATURAL WALKING CONNECTOR BETWEEN INTERCHANGE LINES */}
                      {matchingInterchange && (
                        <div className="relative flex items-stretch gap-3.5 sm:gap-4">
                          {/* Dashed Walking Connector Right on the Same Left Track */}
                          <div className="relative flex w-9 shrink-0 flex-col items-center sm:w-10">
                            <span className="h-full border-l-2 border-dashed border-slate-300 dark:border-slate-600" />
                            <span className="my-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-amber-400/70 bg-amber-50 text-[11px] font-black text-amber-700 shadow-2xs dark:bg-amber-950 dark:text-amber-300">
                              ⇄
                            </span>
                          </div>

                          {/* Calm, Easy-to-Read Transfer Instruction */}
                          <div className="my-3 flex flex-1 flex-col justify-between gap-2 rounded-xl border border-amber-400/40 bg-amber-50/55 px-3.5 py-2.5 sm:flex-row sm:items-center dark:bg-amber-950/20">
                            <div className="flex flex-wrap items-center gap-1.5 text-xs">
                              <span className="font-extrabold text-ink">
                                Change train at{" "}
                                {matchingInterchange.station.name}:
                              </span>
                              <span
                                style={{
                                  backgroundColor:
                                    matchingInterchange.fromLine.color,
                                  color: matchingInterchange.fromLine.textColor,
                                }}
                                className="rounded px-2 py-0.5 text-[10px] font-extrabold"
                              >
                                {matchingInterchange.fromLine.badge}
                              </span>
                              <span className="font-bold text-[#fc6203]">
                                ➔
                              </span>
                              <span
                                style={{
                                  backgroundColor:
                                    matchingInterchange.toLine.color,
                                  color: matchingInterchange.toLine.textColor,
                                }}
                                className="rounded px-2 py-0.5 text-[10px] font-extrabold"
                              >
                                {matchingInterchange.toLine.badge}
                              </span>
                            </div>

                            <span className="text-[11px] font-semibold text-amber-900/85 dark:text-amber-200">
                              ~{matchingInterchange.transferDurationMin} min
                              transfer · Follow floor footprints
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
