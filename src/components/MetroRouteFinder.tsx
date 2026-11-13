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
  CheckCircleIcon,
  ClockIcon,
  CloseIcon,
  CompassIcon,
  MapPinIcon,
  RefreshIcon,
  SearchIcon,
  SparklesIcon,
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

  // Reset button loading state & sync station inputs whenever route results / URL update
  useEffect(() => {
    setManualNavigating(false);
    setFromOpen(false);
    setToOpen(false);
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

    // If user submits the exact route already open on screen, update preference immediately without getting stuck
    if (pathname === targetPath) {
      setManualNavigating(false);
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

    if (mode === "details" && toSlug && st.slug !== toSlug) {
      navigateToRouteDetails(st.slug, toSlug, preference);
    } else if (mode === "search-only" && !toSlug) {
      setToOpen(true);
    }
  }

  function handleSelectToStation(st: MetroStation) {
    setToSlug(st.slug);
    setToQuery(st.name);
    setToOpen(false);
    setError(null);

    if (mode === "details" && fromSlug && fromSlug !== st.slug) {
      navigateToRouteDetails(fromSlug, st.slug, preference);
    }
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

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Main Mobile-First Search Card */}
      <div className="rounded-2xl border border-line bg-card p-3.5 shadow-lg sm:p-6">
        {/* Card Header + Route Choice Pills */}
        <div className="mb-3.5 flex flex-col gap-2.5 border-b border-line pb-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1956b4] text-white shadow-xs">
              <TrainIcon className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-extrabold text-ink sm:text-base">
                {mode === "search-only"
                  ? "Search Delhi NCR Metro Route & Fare"
                  : "Modify Metro Stations or Route Preference"}
              </h2>
              <p className="truncate text-[11px] text-ink-muted sm:text-xs">
                12 Lines • 262 Stations • DMRC, Airport Express, Noida Aqua
                &amp; Rapid Metro
              </p>
            </div>
          </div>

          {/* Route Choice / Preference Toggle (Scrollable on tiny screens) */}
          <div
            role="group"
            aria-label="Route preference"
            className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-subcard p-1 sm:inline-flex"
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
                  className={`rounded-lg px-2 py-1.5 text-center text-[11px] font-extrabold transition sm:px-3 sm:text-xs ${
                    isSelected
                      ? "bg-[#1956b4] text-white shadow-xs"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Origin / Swap / Destination Form — Mobile App Style Stacked Card + Desktop Row */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigateToRouteDetails(fromSlug, toSlug, preference);
          }}
        >
          <div className="relative grid gap-2.5 lg:grid-cols-[1fr_auto_1fr_auto] lg:items-end lg:gap-3">
            {/* Origin Station Input */}
            <div ref={fromBoxRef} className="relative">
              <label
                htmlFor="metro-origin-input"
                className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-ink-muted sm:text-[11px]"
              >
                From (Origin Metro Station)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                  <MapPinIcon className="h-3.5 w-3.5" />
                </span>
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
                  placeholder="Enter Origin Station (e.g. MG Road)"
                  className="ta-search-box h-12 w-full rounded-xl border border-line-strong bg-input pr-16 pl-10 text-sm font-extrabold text-ink outline-none focus:border-[#1956b4] sm:pr-9"
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
                    className="absolute top-1/2 right-11 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-muted hover:bg-subcard hover:text-ink lg:right-2.5"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Origin Station Dropdown */}
              {fromOpen && (
                <div className="absolute top-full right-0 left-0 z-50 mt-1.5 max-h-72 overflow-y-auto rounded-2xl border border-line bg-card p-1.5 shadow-2xl ring-1 ring-black/10">
                  <div className="sticky top-0 z-10 flex items-center justify-between bg-card/95 px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-ink-muted backdrop-blur-xs">
                    <span>
                      {fromQuery.trim()
                        ? `Matching Stations`
                        : "Popular Origin Stations"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFromOpen(false)}
                      className="rounded px-1.5 py-0.5 text-[10px] font-bold text-[#1956b4] lg:hidden"
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
                        className={`flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs transition hover:bg-subcard active:bg-blue-50 ${
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
            </div>

            {/* Swap Button — Floating on right edge on Mobile, Centered on Desktop */}
            <div className="absolute top-[52px] right-2 z-20 lg:static lg:flex lg:justify-center lg:pb-0.5">
              <button
                type="button"
                onClick={handleSwapStations}
                title="Swap Origin & Destination Stations"
                aria-label="Swap Origin and Destination Stations"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-line bg-card text-[#1956b4] shadow-md transition hover:border-[#1956b4] hover:bg-blue-50 active:scale-95 lg:h-11 lg:w-11 lg:rounded-xl lg:border lg:bg-subcard lg:shadow-none dark:text-blue-300 dark:hover:bg-blue-950/40"
              >
                <SwapIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Destination Station Input */}
            <div ref={toBoxRef} className="relative">
              <label
                htmlFor="metro-dest-input"
                className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-ink-muted sm:text-[11px]"
              >
                To (Destination Metro Station)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-orange-500/15 text-[#fc6203]">
                  <CompassIcon className="h-3.5 w-3.5" />
                </span>
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
                  placeholder="Enter Destination (e.g. Anand Vihar)"
                  className="ta-search-box h-12 w-full rounded-xl border border-line-strong bg-input pr-16 pl-10 text-sm font-extrabold text-ink outline-none focus:border-[#1956b4] sm:pr-9"
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
                    className="absolute top-1/2 right-11 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-muted hover:bg-subcard hover:text-ink lg:right-2.5"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Destination Station Dropdown */}
              {toOpen && (
                <div className="absolute top-full right-0 left-0 z-50 mt-1.5 max-h-72 overflow-y-auto rounded-2xl border border-line bg-card p-1.5 shadow-2xl ring-1 ring-black/10">
                  <div className="sticky top-0 z-10 flex items-center justify-between bg-card/95 px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-ink-muted backdrop-blur-xs">
                    <span>
                      {toQuery.trim()
                        ? `Matching Stations`
                        : "Popular Destination Stations"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setToOpen(false)}
                      className="rounded px-1.5 py-0.5 text-[10px] font-bold text-[#1956b4] lg:hidden"
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
                        className={`flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs transition hover:bg-subcard active:bg-blue-50 ${
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

            {/* Search Submit Button */}
            <button
              type="submit"
              disabled={navigating}
              className="ta-btn-primary inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#fc6203] px-6 text-sm font-extrabold text-white shadow-md transition hover:bg-[#e55600] active:scale-[0.99] disabled:opacity-60 lg:w-auto"
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
                      ? "Find Metro Route & Fare"
                      : "Check Route"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Popular Route Quick Chips (Horizontal swipe on mobile, wrap on desktop) */}
        <div className="mt-3.5 border-t border-line pt-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
            <span className="shrink-0 text-[11px] font-extrabold text-ink-muted">
              Quick Routes:
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
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${
                    isCurrent
                      ? "border-[#1956b4] bg-[#1956b4] text-white"
                      : "border-line bg-subcard text-ink-soft hover:border-[#1956b4] hover:text-[#1956b4]"
                  }`}
                >
                  <span>{item.fromName.replace(/ \(.*\)/, "")}</span>
                  <span>→</span>
                  <span>{item.toName.replace(/ \(.*\)/, "")}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}
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

          {/* Visual Corridor Progress Strip + Step-by-Step Journey Card */}
          <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
            {/* Top Journey Banner Header */}
            <div className="border-b border-line bg-gradient-to-r from-[#0b192c] via-[#132a4a] to-[#1956b4] p-4 text-white sm:p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#fc6203] px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-2xs">
                      <TrainIcon className="h-3 w-3" />
                      <span>{activeRoute.label}</span>
                    </span>
                    <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold text-blue-100">
                      {activeRoute.totalStops} Stops •{" "}
                      {activeRoute.totalDurationMin} mins • ₹
                      {activeRoute.fare.tokenFareInr}
                    </span>
                  </div>
                  <h3 className="mt-2 flex flex-wrap items-center gap-2 text-lg font-black tracking-tight text-white sm:text-xl">
                    <span>{activeRoute.fromStation.name}</span>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-xs text-amber-300">
                      →
                    </span>
                    <span>{activeRoute.toStation.name}</span>
                  </h3>
                  <p className="mt-1 text-[11px] text-blue-100/85 sm:text-xs">
                    {activeRoute.fare.fareNote}
                  </p>
                </div>

                <Link
                  href={buildMetroRoutePath(
                    activeRoute.toStation.slug,
                    activeRoute.fromStation.slug,
                  )}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3.5 py-2.5 text-xs font-extrabold text-white backdrop-blur-xs transition hover:bg-white/20"
                >
                  <SwapIcon className="h-3.5 w-3.5 text-amber-300" />
                  <span>
                    Reverse ({activeRoute.toStation.name} →{" "}
                    {activeRoute.fromStation.name})
                  </span>
                </Link>
              </div>
            </div>

            <div className="p-3.5 sm:p-6">
              {/* Visual Metro Corridor Node Strip */}
              <div className="mb-5 rounded-2xl border border-line bg-subcard/70 p-3.5 sm:p-4">
                <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-ink">
                    <SparklesIcon className="h-3.5 w-3.5 text-[#1956b4]" />
                    <span>Metro Corridor Breakdown</span>
                  </div>
                  <span className="rounded-full border border-line bg-card px-2.5 py-0.5 text-[11px] font-bold text-ink-soft">
                    Train Frequency: Every {activeRoute.peakFrequencyMin}
                  </span>
                </div>

                {/* Proportional Segmented Track Bar with Endpoint Nodes */}
                <div className="relative my-3 flex h-3.5 w-full overflow-hidden rounded-full bg-slate-200 p-0.5 shadow-inner dark:bg-slate-800">
                  {activeRoute.segments.map((seg) => {
                    const weight = Math.max(10, seg.durationMin);
                    return (
                      <div
                        key={`bar-${seg.segmentIndex}`}
                        style={{
                          flexGrow: weight,
                          backgroundColor: seg.line?.color || "#64748B",
                        }}
                        className="h-full border-r-2 border-white first:rounded-l-full last:rounded-r-full last:border-r-0 dark:border-slate-900"
                      />
                    );
                  })}
                </div>

                {/* Visual Flow Pills: Origin -> Line -> Interchange -> Destination */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>{activeRoute.fromStation.name}</span>
                  </span>

                  {activeRoute.segments.map((seg, idx) => (
                    <div
                      key={`chip-${seg.segmentIndex}`}
                      className="flex flex-wrap items-center gap-1.5 sm:gap-2"
                    >
                      <ArrowRightIcon className="h-3.5 w-3.5 text-ink-muted" />
                      {seg.line ? (
                        <span
                          style={{
                            backgroundColor: seg.line.color,
                            color: seg.line.textColor,
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-extrabold shadow-2xs"
                        >
                          <TrainIcon className="h-3 w-3" />
                          <span>{seg.line.badge}</span>
                          <span className="rounded bg-black/15 px-1.5 py-0.2 text-[10px] font-bold">
                            {seg.stopsCount} stops • {seg.durationMin}m
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                          🚶 Walkway ({seg.durationMin}m)
                        </span>
                      )}

                      {idx < activeRoute.segments.length - 1 && (
                        <>
                          <ArrowRightIcon className="h-3.5 w-3.5 text-ink-muted" />
                          <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[11px] font-extrabold text-amber-900 dark:text-amber-300">
                            <span>⇄ {seg.toStation.name}</span>
                          </span>
                        </>
                      )}
                    </div>
                  ))}

                  <ArrowRightIcon className="h-3.5 w-3.5 text-ink-muted" />
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#1956b4]/30 bg-[#1956b4]/10 px-2.5 py-1 text-[11px] font-extrabold text-[#1956b4] dark:text-blue-300">
                    <span className="h-2 w-2 rounded-full bg-[#1956b4]" />
                    <span>{activeRoute.toStation.name}</span>
                  </span>
                </div>
              </div>

              {/* Step-by-Step Segments & Interchanges */}
              <div className="space-y-4 sm:space-y-5">
                {activeRoute.segments.map((seg, segIdx) => {
                  const isExpanded =
                    expandedSegments[seg.segmentIndex] ??
                    seg.intermediateStops.length <= 14;
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

                  if (seg.type === "walkway") {
                    return (
                      <div
                        key={`seg-${seg.segmentIndex}`}
                        className="rounded-2xl border-2 border-dashed border-amber-500/50 bg-amber-50/80 p-4 dark:bg-amber-950/25"
                      >
                        <div className="flex items-start gap-3">
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-sm font-black text-white shadow-xs">
                            🚶
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                                Footbridge / Skywalk Transfer
                              </p>
                              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-900 dark:text-amber-200">
                                {seg.durationMin} mins •{" "}
                                {Math.round(seg.distanceKm * 1000)}m walk
                              </span>
                            </div>
                            <p className="mt-1 text-xs font-bold text-ink sm:text-sm">
                              Walk from{" "}
                              <span className="font-extrabold underline">
                                {seg.fromStation.name}
                              </span>{" "}
                              to{" "}
                              <span className="font-extrabold underline">
                                {seg.toStation.name}
                              </span>
                            </p>
                            {seg.walkwayNote && (
                              <p className="mt-0.5 text-[11px] text-ink-muted">
                                {seg.walkwayNote}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const startStep = seg.intermediateStops[0];
                  const endStep =
                    seg.intermediateStops[seg.intermediateStops.length - 1];

                  return (
                    <div
                      key={`seg-${seg.segmentIndex}`}
                      className="space-y-4"
                    >
                      <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-xs">
                        {/* Segment Header Banner */}
                        <div
                          style={{
                            borderLeft: `6px solid ${lineColor}`,
                          }}
                          className="flex flex-col justify-between gap-3 border-b border-line bg-subcard/90 px-3.5 py-3 sm:flex-row sm:items-center sm:px-5 sm:py-3.5"
                        >
                          <div className="flex items-start gap-2.5 sm:items-center">
                            <span
                              style={{
                                backgroundColor: lineColor,
                                color: lineTextColor,
                              }}
                              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black shadow-xs"
                            >
                              <TrainIcon className="h-3.5 w-3.5" />
                              <span>{seg.line?.badge || "Metro Line"}</span>
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-extrabold text-ink sm:text-sm">
                                Towards {seg.towardsTerminal}
                              </p>
                              <p className="mt-0.5 text-[11px] font-semibold text-ink-muted">
                                {seg.platformHint}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 text-xs font-extrabold text-ink">
                            <span className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-2.5 py-1 shadow-2xs">
                              <span className="text-[#1956b4] dark:text-blue-300">
                                {seg.stopsCount}
                              </span>
                              <span className="text-ink-muted">Stops</span>
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-2.5 py-1 shadow-2xs">
                              <span className="text-emerald-700 dark:text-emerald-300">
                                {seg.durationMin}
                              </span>
                              <span className="text-ink-muted">mins</span>
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-2.5 py-1 shadow-2xs">
                              <span>{seg.distanceKm}</span>
                              <span className="text-ink-muted">km</span>
                            </span>
                          </div>
                        </div>

                        {/* Single Unified Metro Track Spine & Station Nodes */}
                        <div className="p-3 sm:p-5">
                          <div className="relative">
                            {/* ONE Continuous Colored Metro Track Spine */}
                            <span
                              style={{ backgroundColor: lineColor }}
                              className="
                                absolute top-5 bottom-5 left-[15px] w-1.5 -translate-x-1/2 rounded-full opacity-90 sm:left-[19px]
                              "
                            />

                            <div className="space-y-2.5">
                              {/* 1. BOARDING STATION CARD */}
                              <div className="relative flex items-stretch gap-3 sm:gap-4">
                                {/* Track Node */}
                                <div className="relative z-10 flex w-8 shrink-0 flex-col items-center justify-center sm:w-10">
                                  <span
                                    style={{
                                      borderColor: lineColor,
                                    }}
                                    className="flex h-5 w-5 items-center justify-center rounded-full border-4 bg-white shadow-sm sm:h-6 sm:w-6 dark:bg-slate-900"
                                  >
                                    <span
                                      style={{ backgroundColor: lineColor }}
                                      className="h-2 w-2 rounded-full"
                                    />
                                  </span>
                                </div>

                                {/* Boarding Card Body */}
                                <div className="flex flex-1 flex-col justify-between gap-2 rounded-xl border border-emerald-500/35 bg-emerald-500/[0.06] p-3 sm:flex-row sm:items-center sm:p-3.5 dark:bg-emerald-500/10">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                                        {segIdx === 0
                                          ? "Board Origin"
                                          : "Board Train"}
                                      </span>
                                      <span className="rounded-md border border-emerald-500/30 bg-card px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                                        {seg.platformHint.split("•")[0]}
                                      </span>
                                      <span className="text-[11px] font-semibold text-ink-muted">
                                        First: {seg.fromStation.firstTrain}
                                      </span>
                                    </div>

                                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                      <Link
                                        href={buildMetroStationPath(
                                          seg.fromStation.slug,
                                        )}
                                        className="text-base font-black text-ink hover:text-[#1956b4] hover:underline sm:text-lg"
                                      >
                                        {seg.fromStation.name}
                                      </Link>
                                      {/* Other Connecting Lines at Boarding Station */}
                                      {seg.fromStation.routeIds
                                        .filter((rid) => rid !== seg.line?.id)
                                        .map((rid) => {
                                          const l = linesMap.get(rid);
                                          if (!l) return null;
                                          return (
                                            <span
                                              key={`from-line-${rid}`}
                                              style={{
                                                backgroundColor: l.color,
                                                color: l.textColor,
                                              }}
                                              className="rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase"
                                            >
                                              {l.badge}
                                            </span>
                                          );
                                        })}
                                    </div>
                                  </div>

                                  <div className="flex shrink-0 items-center gap-1.5 sm:flex-col sm:items-end sm:gap-1">
                                    <span className="rounded-lg border border-line bg-card px-2.5 py-1 font-mono text-xs font-extrabold text-ink shadow-2xs">
                                      {startStep?.cumulativeDurationMin ?? 0}{" "}
                                      min
                                    </span>
                                    <span className="font-mono text-[11px] font-bold text-ink-muted">
                                      {startStep?.cumulativeDistanceKm ?? 0} km
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* 2. INTERMEDIATE STOPS TOGGLE & CARDS */}
                              {intermediateOnly.length > 0 && (
                                <>
                                  {/* Toggle Pill Aligned on Track */}
                                  <div className="relative flex items-center gap-3 sm:gap-4">
                                    <div className="relative z-10 flex w-8 shrink-0 justify-center sm:w-10">
                                      <span
                                        style={{
                                          backgroundColor: lineColor,
                                          color: lineTextColor,
                                        }}
                                        className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black shadow-2xs ring-2 ring-white dark:ring-slate-900"
                                      >
                                        {intermediateOnly.length}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleSegmentStops(seg.segmentIndex)
                                      }
                                      className="inline-flex items-center gap-2 rounded-full border border-line bg-subcard px-3.5 py-1.5 text-xs font-extrabold text-[#1956b4] shadow-2xs transition hover:border-[#1956b4] hover:bg-card dark:text-blue-300"
                                    >
                                      <span>
                                        {isExpanded ? "Hide" : "View"}{" "}
                                        {intermediateOnly.length} intermediate
                                        station
                                        {intermediateOnly.length > 1
                                          ? "s"
                                          : ""}
                                      </span>
                                      <span className="text-[10px]">
                                        {isExpanded ? "▲" : "▼"}
                                      </span>
                                    </button>
                                  </div>

                                  {/* Expanded Intermediate Station Rows (Single Rail, Structured Cards) */}
                                  {isExpanded && (
                                    <div className="space-y-2">
                                      {intermediateOnly.map((stop, stIdx) => {
                                        const otherLines = (
                                          stop.routeIds || []
                                        )
                                          .filter(
                                            (rid) => rid !== seg.line?.id,
                                          )
                                          .map((rid) => linesMap.get(rid))
                                          .filter(
                                            (l): l is MetroLine => Boolean(l),
                                          );

                                        return (
                                          <div
                                            key={`${seg.segmentIndex}-${stop.stopId}`}
                                            className="group relative flex items-center gap-3 sm:gap-4"
                                          >
                                            {/* Centered Station Dot on the Single Track Spine */}
                                            <div className="relative z-10 flex w-8 shrink-0 justify-center sm:w-10">
                                              {stop.isInterchange ? (
                                                <span
                                                  style={{
                                                    borderColor: lineColor,
                                                  }}
                                                  className="flex h-4 w-4 items-center justify-center rounded-full border-[3px] bg-amber-400 shadow-2xs ring-2 ring-white sm:h-4.5 sm:w-4.5 dark:ring-slate-900"
                                                  title="Interchange Station"
                                                />
                                              ) : (
                                                <span
                                                  style={{
                                                    borderColor: lineColor,
                                                  }}
                                                  className="h-3 w-3 rounded-full border-[3px] bg-white shadow-2xs transition group-hover:scale-125 sm:h-3.5 sm:w-3.5 dark:bg-slate-900"
                                                />
                                              )}
                                            </div>

                                            {/* Structured Intermediate Station Row Card */}
                                            <div
                                              className={`flex flex-1 items-center justify-between gap-2 rounded-xl border px-3 py-2 transition sm:px-3.5 sm:py-2.5 ${
                                                stop.isInterchange
                                                  ? "border-amber-500/35 bg-amber-500/[0.04] dark:bg-amber-500/[0.08]"
                                                  : "border-line/80 bg-subcard/45 hover:border-[#1956b4]/40 hover:bg-card"
                                              }`}
                                            >
                                              <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
                                                <span className="inline-flex h-5 min-w-[22px] shrink-0 items-center justify-center rounded-md bg-card px-1.5 font-mono text-[10px] font-extrabold text-ink-muted shadow-2xs">
                                                  {stIdx + 1}
                                                </span>
                                                <Link
                                                  href={buildMetroStationPath(
                                                    stop.slug,
                                                  )}
                                                  className="truncate text-xs font-bold text-ink hover:text-[#1956b4] hover:underline sm:text-sm"
                                                >
                                                  {stop.name}
                                                </Link>
                                                {stop.isInterchange && (
                                                  <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-amber-800 dark:text-amber-300">
                                                    ⇄ Interchange
                                                  </span>
                                                )}
                                                {otherLines.map((ol) => (
                                                  <span
                                                    key={`${stop.stopId}-${ol.id}`}
                                                    style={{
                                                      backgroundColor: ol.color,
                                                      color: ol.textColor,
                                                    }}
                                                    className="rounded px-1.5 py-0.5 text-[9px] font-extrabold"
                                                  >
                                                    {ol.badge}
                                                  </span>
                                                ))}
                                              </div>

                                              {/* Right-Aligned Time & Distance Pills */}
                                              <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
                                                <span className="rounded-md border border-line/70 bg-card px-1.5 py-0.5 font-mono text-[10px] font-extrabold text-ink shadow-2xs sm:px-2 sm:text-[11px]">
                                                  {stop.cumulativeDurationMin}m
                                                </span>
                                                <span className="rounded-md bg-subcard px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-muted">
                                                  {stop.cumulativeDistanceKm} km
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </>
                              )}

                              {/* 3. ALIGHTING / DESTINATION STATION CARD */}
                              <div className="relative flex items-stretch gap-3 sm:gap-4">
                                {/* Track Node */}
                                <div className="relative z-10 flex w-8 shrink-0 flex-col items-center justify-center sm:w-10">
                                  <span
                                    style={{
                                      backgroundColor: lineColor,
                                      color: lineTextColor,
                                    }}
                                    className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-[10px] font-black shadow-sm ring-2 ring-slate-900/10 sm:h-6 sm:w-6 dark:border-slate-900"
                                  >
                                    <CheckCircleIcon className="h-3.5 w-3.5" />
                                  </span>
                                </div>

                                {/* Alighting Card Body */}
                                <div
                                  className={`flex flex-1 flex-col justify-between gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:p-3.5 ${
                                    segIdx === activeRoute.segments.length - 1
                                      ? "border-[#1956b4]/40 bg-blue-500/[0.06] dark:bg-blue-500/10"
                                      : "border-amber-500/45 bg-amber-500/[0.07] dark:bg-amber-500/10"
                                  }`}
                                >
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span
                                        className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white ${
                                          segIdx ===
                                          activeRoute.segments.length - 1
                                            ? "bg-[#1956b4]"
                                            : "bg-amber-600"
                                        }`}
                                      >
                                        {segIdx ===
                                        activeRoute.segments.length - 1
                                          ? "Destination"
                                          : "Interchange Stop"}
                                      </span>
                                      <span className="text-[11px] font-semibold text-ink-muted">
                                        {segIdx ===
                                        activeRoute.segments.length - 1
                                          ? "Arrive at destination station"
                                          : "Alight here to switch metro line"}
                                      </span>
                                    </div>

                                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                      <Link
                                        href={buildMetroStationPath(
                                          seg.toStation.slug,
                                        )}
                                        className="text-base font-black text-ink hover:text-[#1956b4] hover:underline sm:text-lg"
                                      >
                                        {seg.toStation.name}
                                      </Link>
                                      {seg.toStation.routeIds
                                        .filter((rid) => rid !== seg.line?.id)
                                        .map((rid) => {
                                          const l = linesMap.get(rid);
                                          if (!l) return null;
                                          return (
                                            <span
                                              key={`to-line-${rid}`}
                                              style={{
                                                backgroundColor: l.color,
                                                color: l.textColor,
                                              }}
                                              className="rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase"
                                            >
                                              {l.badge}
                                            </span>
                                          );
                                        })}
                                    </div>
                                  </div>

                                  <div className="flex shrink-0 items-center gap-1.5 sm:flex-col sm:items-end sm:gap-1">
                                    <span className="rounded-lg border border-line bg-card px-2.5 py-1 font-mono text-xs font-extrabold text-ink shadow-2xs">
                                      {endStep?.cumulativeDurationMin ??
                                        seg.durationMin}{" "}
                                      min
                                    </span>
                                    <span className="font-mono text-[11px] font-bold text-ink-muted">
                                      {endStep?.cumulativeDistanceKm ??
                                        seg.distanceKm}{" "}
                                      km
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* High-Visibility In-Station Interchange Banner */}
                      {matchingInterchange && (
                        <div className="rounded-2xl border-2 border-dashed border-amber-500/60 bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-amber-50/90 p-3.5 shadow-2xs sm:p-4 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-amber-950/30">
                          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div className="flex items-start gap-3 sm:items-center">
                              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-base font-black text-white shadow-xs">
                                ⇄
                              </span>
                              <div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                                    Line Transfer (~
                                    {matchingInterchange.transferDurationMin}{" "}
                                    mins)
                                  </span>
                                  <span className="text-xs font-extrabold text-ink sm:text-sm">
                                    Change train at{" "}
                                    {matchingInterchange.station.name}
                                  </span>
                                </div>
                                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs font-bold text-ink">
                                  <span className="text-ink-muted">From</span>
                                  <span
                                    style={{
                                      backgroundColor:
                                        matchingInterchange.fromLine.color,
                                      color:
                                        matchingInterchange.fromLine.textColor,
                                    }}
                                    className="rounded-md px-2 py-0.5 text-[10px] font-extrabold shadow-2xs"
                                  >
                                    {matchingInterchange.fromLine.badge}
                                  </span>
                                  <ArrowRightIcon className="h-3.5 w-3.5 text-ink-muted" />
                                  <span className="text-ink-muted">Board</span>
                                  <span
                                    style={{
                                      backgroundColor:
                                        matchingInterchange.toLine.color,
                                      color:
                                        matchingInterchange.toLine.textColor,
                                    }}
                                    className="rounded-md px-2 py-0.5 text-[10px] font-extrabold shadow-2xs"
                                  >
                                    {matchingInterchange.toLine.badge}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="inline-flex items-center gap-1.5 self-start rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-extrabold text-emerald-800 sm:self-center dark:text-emerald-300">
                              <CheckCircleIcon className="h-3.5 w-3.5" />
                              <span>Follow colored floor footprints</span>
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
