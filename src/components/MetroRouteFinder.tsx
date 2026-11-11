"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const [navigating, setNavigating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const filteredFrom = useMemo(
    () => filterStations(fromQuery, toSlug),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fromQuery, toSlug, stations],
  );
  const filteredTo = useMemo(
    () => filterStations(toQuery, fromSlug),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toQuery, fromSlug, stations],
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
    setNavigating(true);
    const targetPath = buildMetroRoutePath(nextFromSlug, nextToSlug);
    const urlWithPref =
      nextPref !== "fastest" ? `${targetPath}?mode=${nextPref}` : targetPath;
    router.push(urlWithPref);
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
                  className="ta-input h-12 w-full rounded-xl pr-16 pl-10 text-sm font-extrabold text-ink sm:pr-9"
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
                    className="absolute top-1/2 right-11 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-bold text-ink-muted hover:bg-subcard hover:text-ink lg:right-2.5"
                  >
                    ✕
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
                  className="ta-input h-12 w-full rounded-xl pr-16 pl-10 text-sm font-extrabold text-ink sm:pr-9"
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
                    className="absolute top-1/2 right-11 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-bold text-ink-muted hover:bg-subcard hover:text-ink lg:right-2.5"
                  >
                    ✕
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
              className="ta-btn-orange inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-extrabold text-white shadow-sm transition active:scale-[0.99] disabled:opacity-60 lg:w-auto"
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
          <div className="rounded-2xl border border-line bg-card p-3.5 shadow-sm sm:p-6">
            <div className="flex flex-col justify-between gap-3 border-b border-line pb-3.5 sm:flex-row sm:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#1956b4] px-2.5 py-0.5 text-[11px] font-bold text-white">
                    {activeRoute.label}
                  </span>
                  <h3 className="text-base font-extrabold text-ink sm:text-lg">
                    {activeRoute.fromStation.name} →{" "}
                    {activeRoute.toStation.name}
                  </h3>
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  {activeRoute.fare.fareNote}
                </p>
              </div>

              <Link
                href={buildMetroRoutePath(
                  activeRoute.toStation.slug,
                  activeRoute.fromStation.slug,
                )}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-subcard px-3 py-2 text-xs font-bold text-[#1956b4] transition hover:border-[#1956b4] dark:text-blue-300"
              >
                <SwapIcon className="h-3.5 w-3.5" />
                <span>
                  Reverse Route ({activeRoute.toStation.name} →{" "}
                  {activeRoute.fromStation.name})
                </span>
              </Link>
            </div>

            {/* Proportional Color Line Progress Bar */}
            <div className="my-3.5 rounded-xl border border-line bg-subcard/60 p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-1 text-xs font-bold text-ink">
                <span>Metro Corridor Breakdown</span>
                <span className="text-[11px] text-ink-muted">
                  Frequency: Every {activeRoute.peakFrequencyMin}
                </span>
              </div>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                {activeRoute.segments.map((seg) => {
                  const weight = Math.max(10, seg.durationMin);
                  return (
                    <div
                      key={`bar-${seg.segmentIndex}`}
                      style={{
                        flexGrow: weight,
                        backgroundColor: seg.line?.color || "#64748B",
                      }}
                      className="h-full border-r border-white/40 last:border-r-0"
                    />
                  );
                })}
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                {activeRoute.segments.map((seg, idx) => (
                  <div
                    key={`chip-${seg.segmentIndex}`}
                    className="flex items-center gap-1 text-xs"
                  >
                    {idx > 0 && (
                      <ArrowRightIcon className="h-3 w-3 text-ink-muted" />
                    )}
                    {seg.line ? (
                      <span
                        style={{
                          backgroundColor: seg.line.color,
                          color: seg.line.textColor,
                        }}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold shadow-2xs sm:text-[11px]"
                      >
                        <span>{seg.line.badge}</span>
                        <span className="opacity-85">
                          ({seg.stopsCount} stops)
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-800 sm:text-[11px] dark:text-amber-300">
                        🚶 Walkway ({seg.durationMin}m)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step Segments & Interchanges */}
            <div className="mt-4 space-y-3.5 sm:space-y-4">
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
                      className="rounded-xl border-2 border-dashed border-amber-500/50 bg-amber-50/70 p-3.5 dark:bg-amber-950/20"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-black text-white">
                          ⇄
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                            Walkway Transfer • {seg.durationMin} mins (
                            {Math.round(seg.distanceKm * 1000)}m)
                          </p>
                          <p className="text-xs font-bold text-ink sm:text-sm">
                            Walk from{" "}
                            <span className="underline">
                              {seg.fromStation.name}
                            </span>{" "}
                            to{" "}
                            <span className="underline">
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

                return (
                  <div key={`seg-${seg.segmentIndex}`} className="space-y-3.5">
                    <div className="overflow-hidden rounded-2xl border border-line bg-subcard/30">
                      {/* Segment Header */}
                      <div
                        style={{ borderLeft: `6px solid ${lineColor}` }}
                        className="flex flex-col justify-between gap-2 border-b border-line bg-subcard/80 px-3.5 py-2.5 sm:flex-row sm:items-center sm:px-4 sm:py-3"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            style={{
                              backgroundColor: lineColor,
                              color: lineTextColor,
                            }}
                            className="rounded-lg px-2.5 py-1 text-xs font-extrabold shadow-xs"
                          >
                            {seg.line?.badge || "Metro Line"}
                          </span>
                          <div>
                            <p className="text-xs font-extrabold text-ink sm:text-sm">
                              Towards {seg.towardsTerminal}
                            </p>
                            <p className="text-[11px] font-semibold text-ink-muted">
                              {seg.platformHint}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold text-ink-soft">
                          <span className="rounded-md bg-card px-2 py-0.5">
                            {seg.stopsCount} Stops
                          </span>
                          <span className="rounded-md bg-card px-2 py-0.5">
                            {seg.durationMin} mins
                          </span>
                          <span className="rounded-md bg-card px-2 py-0.5">
                            {seg.distanceKm} km
                          </span>
                        </div>
                      </div>

                      {/* Segment Timeline Body */}
                      <div className="p-3.5 sm:p-4">
                        <div className="relative pl-5 sm:pl-6">
                          {/* Vertical Colored Line */}
                          <span
                            style={{ backgroundColor: lineColor }}
                            className="absolute top-2 bottom-2 left-1.5 w-1 rounded-full sm:left-2"
                          />

                          {/* Boarding Station */}
                          <div className="relative flex flex-col justify-between gap-1 pb-3 sm:flex-row sm:items-center">
                            <span
                              style={{
                                borderColor: lineColor,
                              }}
                              className="absolute top-1 -left-[19px] h-3.5 w-3.5 rounded-full border-4 bg-white sm:-left-[22px] sm:h-4 sm:w-4 dark:bg-slate-900"
                            />
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-300">
                                  {segIdx === 0 ? "Board Origin" : "Board Here"}
                                </span>
                                <Link
                                  href={buildMetroStationPath(
                                    seg.fromStation.slug,
                                  )}
                                  className="text-sm font-extrabold text-ink hover:text-[#1956b4] hover:underline sm:text-base"
                                >
                                  {seg.fromStation.name}
                                </Link>
                              </div>
                              <p className="mt-0.5 text-[11px] text-ink-muted sm:text-xs">
                                {seg.platformHint} • First:{" "}
                                {seg.fromStation.firstTrain}
                              </p>
                            </div>
                            <div className="font-mono text-xs font-bold text-ink-soft sm:text-right">
                              {
                                seg.intermediateStops[0]
                                  ?.cumulativeDurationMin
                              }{" "}
                              min •{" "}
                              {
                                seg.intermediateStops[0]
                                  ?.cumulativeDistanceKm
                              }{" "}
                              km
                            </div>
                          </div>

                          {/* Intermediate Stops Toggle + List */}
                          {intermediateOnly.length > 0 && (
                            <div className="my-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  toggleSegmentStops(seg.segmentIndex)
                                }
                                className="mb-2 inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 py-1 text-[11px] font-bold text-[#1956b4] transition hover:border-[#1956b4] sm:text-xs dark:text-blue-300"
                              >
                                <span>
                                  {isExpanded ? "Hide" : "Show"}{" "}
                                  {intermediateOnly.length} intermediate stop
                                  {intermediateOnly.length > 1 ? "s" : ""}
                                </span>
                                <span>{isExpanded ? "▲" : "▼"}</span>
                              </button>

                              {isExpanded && (
                                <div className="space-y-2 border-l border-dashed border-line/70 py-1 pl-2.5 sm:pl-3">
                                  {intermediateOnly.map((stop, stIdx) => (
                                    <div
                                      key={`${seg.segmentIndex}-${stop.stopId}`}
                                      className="relative flex items-center justify-between gap-2 text-xs"
                                    >
                                      <span
                                        style={{ backgroundColor: lineColor }}
                                        className="absolute top-1.5 -left-[25px] h-2.5 w-2.5 rounded-full ring-2 ring-white sm:-left-[31px] dark:ring-slate-900"
                                      />
                                      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                                        <span className="font-mono text-[10px] font-bold text-ink-muted">
                                          {stIdx + 1}.
                                        </span>
                                        <Link
                                          href={buildMetroStationPath(
                                            stop.slug,
                                          )}
                                          className="truncate font-semibold text-ink hover:text-[#1956b4] hover:underline"
                                        >
                                          {stop.name}
                                        </Link>
                                        {stop.isInterchange && (
                                          <span className="rounded bg-subcard px-1.5 py-0.5 text-[9px] font-bold text-ink-muted">
                                            Interchange
                                          </span>
                                        )}
                                      </div>
                                      <span className="shrink-0 font-mono text-[11px] text-ink-muted">
                                        {stop.cumulativeDurationMin}m (
                                        {stop.cumulativeDistanceKm} km)
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Alighting Station */}
                          <div className="relative flex flex-col justify-between gap-1 pt-2.5 sm:flex-row sm:items-center">
                            <span
                              style={{
                                backgroundColor: lineColor,
                              }}
                              className="absolute top-3.5 -left-[19px] h-3.5 w-3.5 rounded-full border-2 border-white shadow-xs sm:-left-[22px] sm:h-4 sm:w-4 dark:border-slate-900"
                            />
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span
                                  className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase ${
                                    segIdx === activeRoute.segments.length - 1
                                      ? "bg-[#1956b4]/15 text-[#1956b4] dark:text-blue-300"
                                      : "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                                  }`}
                                >
                                  {segIdx === activeRoute.segments.length - 1
                                    ? "Destination"
                                    : "Interchange Stop"}
                                </span>
                                <Link
                                  href={buildMetroStationPath(
                                    seg.toStation.slug,
                                  )}
                                  className="text-sm font-extrabold text-ink hover:text-[#1956b4] hover:underline sm:text-base"
                                >
                                  {seg.toStation.name}
                                </Link>
                              </div>
                            </div>
                            <div className="font-mono text-xs font-bold text-ink sm:text-right">
                              {
                                seg.intermediateStops[
                                  seg.intermediateStops.length - 1
                                ]?.cumulativeDurationMin
                              }{" "}
                              min •{" "}
                              {
                                seg.intermediateStops[
                                  seg.intermediateStops.length - 1
                                ]?.cumulativeDistanceKm
                              }{" "}
                              km
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* In-Station Interchange Banner */}
                    {matchingInterchange && (
                      <div className="rounded-xl border-2 border-dashed border-amber-500/50 bg-amber-50/70 p-3.5 dark:bg-amber-950/20">
                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                          <div className="flex items-start gap-2.5 sm:items-center">
                            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-black text-white">
                              ⇄
                            </span>
                            <div>
                              <p className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                                Change Train at{" "}
                                {matchingInterchange.station.name} • ~
                                {matchingInterchange.transferDurationMin} mins
                                transfer
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-bold text-ink">
                                <span>Switch from</span>
                                <span
                                  style={{
                                    backgroundColor:
                                      matchingInterchange.fromLine.color,
                                    color:
                                      matchingInterchange.fromLine.textColor,
                                  }}
                                  className="rounded px-2 py-0.5 text-[10px] font-extrabold"
                                >
                                  {matchingInterchange.fromLine.badge}
                                </span>
                                <span>to</span>
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
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 sm:text-xs dark:text-emerald-300">
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
      )}
    </div>
  );
}
