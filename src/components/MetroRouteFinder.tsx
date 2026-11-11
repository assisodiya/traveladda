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
  initialFromSlug = "rajiv-chowk",
  initialToSlug = "huda-city-centre",
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
    () => stationsBySlug.get(initialFromSlug)?.name || "Rajiv Chowk",
  );
  const [toQuery, setToQuery] = useState<string>(
    () => stationsBySlug.get(initialToSlug)?.name || "Huda City Centre",
  );

  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const [planResult, setPlanResult] = useState<MetroRoutePlanResult | null>(
    initialResult,
  );
  const [activeOptionIndex, setActiveOptionIndex] = useState<number>(0);
  const [expandedSegments, setExpandedSegments] = useState<
    Record<number, boolean>
  >({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fromBoxRef = useRef<HTMLDivElement>(null);
  const toBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFromSlug(initialFromSlug);
    setToSlug(initialToSlug);
    setFromQuery(
      stationsBySlug.get(initialFromSlug)?.name || initialFromSlug,
    );
    setToQuery(stationsBySlug.get(initialToSlug)?.name || initialToSlug);
    if (initialResult) {
      setPlanResult(initialResult);
      setActiveOptionIndex(0);
    }
  }, [initialFromSlug, initialToSlug, initialResult, stationsBySlug]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (fromBoxRef.current && !fromBoxRef.current.contains(target)) {
        setFromOpen(false);
      }
      if (toBoxRef.current && !toBoxRef.current.contains(target)) {
        setToOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const filterStations = (q: string, excludeSlug?: string) => {
    const clean = q.trim().toLowerCase();
    if (!clean) {
      const topSlugs = [
        "rajiv-chowk",
        "new-delhi",
        "kashmere-gate",
        "huda-city-centre",
        "igi-airport",
        "noida-electronic-city",
        "hauz-khas",
        "botanical-garden",
        "anand-vihar",
        "lajpat-nagar",
        "dwarka-sector-21",
        "cyber-city-rapid-metro",
        "pari-chowk",
        "vaishali",
      ];
      return topSlugs
        .map((sl) => stationsBySlug.get(sl))
        .filter(
          (s): s is MetroStation => Boolean(s) && s!.slug !== excludeSlug,
        );
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
    scored.sort((a, b) => b.score - a.score || a.st.name.localeCompare(b.st.name));
    return scored.slice(0, 18).map((x) => x.st);
  };

  const filteredFrom = useMemo(
    () => filterStations(fromQuery),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fromQuery, stations],
  );
  const filteredTo = useMemo(
    () => filterStations(toQuery),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toQuery, stations],
  );

  async function executeRouteSearch(
    nextFromSlug: string,
    nextToSlug: string,
    nextPref: MetroRoutePreference,
    navigateUrl = true,
  ) {
    if (!nextFromSlug || !nextToSlug) {
      setError("Please select both Origin and Destination metro stations.");
      return;
    }
    if (nextFromSlug === nextToSlug) {
      setError(
        "Origin and Destination stations cannot be the same. Please select two different stations.",
      );
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/metro/route?from=${encodeURIComponent(nextFromSlug)}&to=${encodeURIComponent(nextToSlug)}&preference=${encodeURIComponent(nextPref)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to find a metro route.");
      } else {
        setPlanResult(data as MetroRoutePlanResult);
        setActiveOptionIndex(0);
        setExpandedSegments({});
        if (navigateUrl) {
          const targetPath = buildMetroRoutePath(nextFromSlug, nextToSlug);
          const urlWithPref =
            nextPref !== "fastest"
              ? `${targetPath}?mode=${nextPref}`
              : targetPath;
          router.push(urlWithPref, { scroll: false });
        }
      }
    } catch {
      setError("Failed to fetch metro route. Please try again.");
    } finally {
      setLoading(false);
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

    if (prevFromSlug && prevToSlug && prevFromSlug !== prevToSlug) {
      void executeRouteSearch(prevToSlug, prevFromSlug, preference, true);
    }
  }

  function handlePreferenceChange(nextPref: MetroRoutePreference) {
    setPreference(nextPref);
    if (planResult) {
      const matchIdx = planResult.alternatives.findIndex(
        (o) => o.preference === nextPref,
      );
      if (matchIdx !== -1) {
        setActiveOptionIndex(matchIdx);
        return;
      }
    }
    void executeRouteSearch(fromSlug, toSlug, nextPref, false);
  }

  const activeRoute: MetroRouteOption | null = useMemo(() => {
    if (!planResult) return null;
    return (
      planResult.alternatives[activeOptionIndex] || planResult.recommended
    );
  }, [planResult, activeOptionIndex]);

  const toggleSegmentStops = (segmentIndex: number) => {
    setExpandedSegments((prev) => ({
      ...prev,
      [segmentIndex]: !(prev[segmentIndex] ?? true),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Main Search Card */}
      <div className="rounded-2xl border border-line bg-card p-4 shadow-md sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#1956b4] text-white">
              <TrainIcon className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-ink sm:text-base">
                Delhi NCR Metro Route, Fare &amp; Timing Planner
              </h2>
              <p className="text-[11px] text-ink-muted sm:text-xs">
                Covers all 12 DMRC, Airport Express, Noida Aqua &amp; Gurgaon
                Rapid Metro lines (262 Stations)
              </p>
            </div>
          </div>

          {/* Route Choice / Preference Toggle */}
          <div
            role="group"
            aria-label="Route preference"
            className="inline-flex rounded-xl border border-line bg-subcard p-1"
          >
            {(
              [
                { id: "fastest", label: "Fastest Route" },
                { id: "min-interchange", label: "Min Interchange" },
                { id: "min-stops", label: "Min Stops" },
              ] as const
            ).map((tab) => {
              const isSelected = preference === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handlePreferenceChange(tab.id)}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition sm:px-3 sm:text-xs ${
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

        {/* Origin / Swap / Destination Inputs */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void executeRouteSearch(fromSlug, toSlug, preference, true);
          }}
          className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto] lg:items-end"
        >
          {/* Origin Station Input */}
          <div ref={fromBoxRef} className="relative">
            <label
              htmlFor="metro-origin-input"
              className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-ink-muted"
            >
              From (Origin Station)
            </label>
            <div className="relative">
              <MapPinIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#1956b4]" />
              <input
                id="metro-origin-input"
                type="text"
                value={fromQuery}
                onFocus={() => setFromOpen(true)}
                onChange={(e) => {
                  setFromQuery(e.target.value);
                  setFromOpen(true);
                }}
                placeholder="Search origin station (e.g. Rajiv Chowk, New Delhi)"
                className="ta-input w-full rounded-xl py-3 pr-8 pl-10 text-sm font-bold text-ink"
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
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-xs font-bold text-ink-muted hover:bg-subcard hover:text-ink"
                >
                  ✕
                </button>
              )}
            </div>

            {fromOpen && (
              <div className="absolute top-full right-0 left-0 z-40 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-line bg-card p-1.5 shadow-2xl">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  {fromQuery.trim()
                    ? `Matching Stations (${filteredFrom.length})`
                    : "Popular Delhi NCR Metro Stations"}
                </div>
                {filteredFrom.length === 0 ? (
                  <p className="px-3 py-3 text-xs text-ink-muted">
                    No station found matching &ldquo;{fromQuery}&rdquo;
                  </p>
                ) : (
                  filteredFrom.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setFromSlug(st.slug);
                        setFromQuery(st.name);
                        setFromOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs transition hover:bg-subcard ${
                        st.slug === fromSlug
                          ? "bg-blue-50/80 font-extrabold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                          : "font-semibold text-ink"
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="block truncate">{st.name}</span>
                        {st.isInterchange && (
                          <span className="text-[10px] font-semibold text-ink-muted">
                            Interchange Hub
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

          {/* Swap Button */}
          <div className="flex justify-center lg:pb-0.5">
            <button
              type="button"
              onClick={handleSwapStations}
              title="Swap Origin & Destination Stations"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-subcard text-[#1956b4] transition hover:border-[#1956b4] hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40"
            >
              <SwapIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Destination Station Input */}
          <div ref={toBoxRef} className="relative">
            <label
              htmlFor="metro-dest-input"
              className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-ink-muted"
            >
              To (Destination Station)
            </label>
            <div className="relative">
              <CompassIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#fc6203]" />
              <input
                id="metro-dest-input"
                type="text"
                value={toQuery}
                onFocus={() => setToOpen(true)}
                onChange={(e) => {
                  setToQuery(e.target.value);
                  setToOpen(true);
                }}
                placeholder="Search destination (e.g. Huda City Centre, IGI Airport)"
                className="ta-input w-full rounded-xl py-3 pr-8 pl-10 text-sm font-bold text-ink"
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
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-xs font-bold text-ink-muted hover:bg-subcard hover:text-ink"
                >
                  ✕
                </button>
              )}
            </div>

            {toOpen && (
              <div className="absolute top-full right-0 left-0 z-40 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-line bg-card p-1.5 shadow-2xl">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  {toQuery.trim()
                    ? `Matching Stations (${filteredTo.length})`
                    : "Popular Destination Stations"}
                </div>
                {filteredTo.length === 0 ? (
                  <p className="px-3 py-3 text-xs text-ink-muted">
                    No station found matching &ldquo;{toQuery}&rdquo;
                  </p>
                ) : (
                  filteredTo.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setToSlug(st.slug);
                        setToQuery(st.name);
                        setToOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs transition hover:bg-subcard ${
                        st.slug === toSlug
                          ? "bg-blue-50/80 font-extrabold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                          : "font-semibold text-ink"
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="block truncate">{st.name}</span>
                        {st.isInterchange && (
                          <span className="text-[10px] font-semibold text-ink-muted">
                            Interchange Hub
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
            disabled={loading}
            className="ta-btn-orange inline-flex h-[46px] items-center justify-center gap-2 rounded-xl px-6 text-sm font-extrabold text-white shadow-sm transition disabled:opacity-60"
          >
            {loading ? (
              <>
                <RefreshIcon className="h-4 w-4 animate-spin" />
                <span>Finding Route...</span>
              </>
            ) : (
              <>
                <SearchIcon className="h-4 w-4" />
                <span>Show Metro Route</span>
              </>
            )}
          </button>
        </form>

        {/* Popular Route Quick Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
          <span className="mr-1 text-[11px] font-bold text-ink-muted">
            Popular Routes:
          </span>
          {POPULAR_METRO_ROUTES.slice(0, 6).map((item) => {
            const isCurrent =
              fromSlug === item.fromSlug && toSlug === item.toSlug;
            return (
              <Link
                key={`${item.fromSlug}-${item.toSlug}`}
                href={buildMetroRoutePath(item.fromSlug, item.toSlug)}
                onClick={(e) => {
                  e.preventDefault();
                  setFromSlug(item.fromSlug);
                  setToSlug(item.toSlug);
                  setFromQuery(
                    stationsBySlug.get(item.fromSlug)?.name || item.fromName,
                  );
                  setToQuery(
                    stationsBySlug.get(item.toSlug)?.name || item.toName,
                  );
                  void executeRouteSearch(
                    item.fromSlug,
                    item.toSlug,
                    preference,
                    true,
                  );
                }}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${
                  isCurrent
                    ? "border-[#1956b4] bg-[#1956b4] text-white"
                    : "border-line bg-subcard text-ink-soft hover:border-[#1956b4] hover:text-[#1956b4]"
                }`}
              >
                <span>{item.fromName}</span>
                <span>→</span>
                <span>{item.toName}</span>
              </Link>
            );
          })}
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}
      </div>

      {/* Active Route Result Dashboard */}
      {activeRoute && planResult && (
        <div className="space-y-5">
          {/* Multiple Route Options Comparison Bar (if fastest vs min-interchange differ) */}
          {planResult.alternatives.length > 1 && (
            <div className="rounded-2xl border border-line bg-card p-4 shadow-xs">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-xs font-extrabold uppercase tracking-wider text-ink-muted">
                  Choose Your Preferred Metro Route ({planResult.alternatives.length}{" "}
                  Options Available)
                </p>
                <span className="text-[11px] font-semibold text-ink-muted">
                  Click any route option to switch view
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {planResult.alternatives.map((opt, idx) => {
                  const selected = idx === activeOptionIndex;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setActiveOptionIndex(idx);
                        setPreference(opt.preference);
                      }}
                      className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition ${
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
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
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
                      <div className="mt-3 flex items-center justify-between border-t border-line pt-2 text-xs font-bold text-ink">
                        <span>{opt.totalDurationMin} mins</span>
                        <span>•</span>
                        <span>
                          {opt.interchangeCount === 0
                            ? "Direct (0 Change)"
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

          {/* Top 4 Summary Metric Cards */}
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Travel Time */}
            <div className="rounded-2xl border border-line bg-card p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  Estimated Travel Time
                </span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#1956b4] dark:bg-blue-950/50 dark:text-blue-300">
                  <ClockIcon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-1.5 font-mono text-2xl font-black text-ink sm:text-3xl">
                {activeRoute.totalDurationMin} mins
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {activeRoute.inTrainDurationMin}m in train
                {activeRoute.interchangeDurationMin > 0
                  ? ` + ${activeRoute.interchangeDurationMin}m interchange`
                  : " • Non-stop corridor"}
              </p>
            </div>

            {/* 2. DMRC Token & Smart Card Fare */}
            <div className="rounded-2xl border border-line bg-card p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  Token / QR &amp; Card Fare
                </span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <TicketIcon className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-1.5 flex items-baseline gap-2.5">
                <p className="font-mono text-2xl font-black text-emerald-700 sm:text-3xl dark:text-emerald-300">
                  ₹{activeRoute.fare.tokenFareInr}
                </p>
                <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                  Card: ₹{activeRoute.fare.smartCardPeakInr}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-muted">
                Off-Peak Card: ₹{activeRoute.fare.smartCardOffPeakInr} • Sun/Holiday: ₹
                {activeRoute.fare.sundayHolidayInr}
              </p>
            </div>

            {/* 3. Total Stations & Distance */}
            <div className="rounded-2xl border border-line bg-card p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  Stations &amp; Distance
                </span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                  <MapPinIcon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-1.5 font-mono text-2xl font-black text-ink sm:text-3xl">
                {activeRoute.totalStops} Stops
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {activeRoute.totalDistanceKm} km track distance •{" "}
                {activeRoute.fare.distanceSlabLabel}
              </p>
            </div>

            {/* 4. Interchanges & First/Last Train */}
            <div className="rounded-2xl border border-line bg-card p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  Line Interchanges
                </span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                  <SparklesIcon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-1.5 text-xl font-black text-ink sm:text-2xl">
                {activeRoute.interchangeCount === 0
                  ? "Direct Train"
                  : `${activeRoute.interchangeCount} Interchange${activeRoute.interchangeCount > 1 ? "s" : ""}`}
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                First: {activeRoute.firstTrainFromOrigin} • Last:{" "}
                {activeRoute.lastTrainFromOrigin}
              </p>
            </div>
          </div>

          {/* Visual Corridor Progress Strip + Step-by-Step Journey Card */}
          <div className="rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#1956b4] px-2.5 py-0.5 text-[11px] font-bold text-white">
                    {activeRoute.label}
                  </span>
                  <h3 className="text-base font-extrabold text-ink sm:text-lg">
                    {activeRoute.fromStation.name} →{" "}
                    {activeRoute.toStation.name} Metro Route
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
                onClick={(e) => {
                  e.preventDefault();
                  handleSwapStations();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-subcard px-3 py-1.5 text-xs font-bold text-[#1956b4] transition hover:border-[#1956b4] dark:text-blue-300"
              >
                <SwapIcon className="h-3.5 w-3.5" />
                <span>
                  Reverse Route ({activeRoute.toStation.name} →{" "}
                  {activeRoute.fromStation.name})
                </span>
              </Link>
            </div>

            {/* Proportional Color Line Progress Bar */}
            <div className="my-4 rounded-xl border border-line bg-subcard/60 p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-ink">
                <span>Journey Line Sequence</span>
                <span className="text-ink-muted">
                  Peak Train Frequency: Every {activeRoute.peakFrequencyMin}
                </span>
              </div>
              <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                {activeRoute.segments.map((seg) => {
                  const weight = Math.max(10, seg.durationMin);
                  return (
                    <div
                      key={`bar-${seg.segmentIndex}`}
                      style={{
                        flexGrow: weight,
                        backgroundColor: seg.line?.color || "#64748B",
                      }}
                      title={
                        seg.line
                          ? `${seg.line.badge}: ${seg.fromStation.name} → ${seg.toStation.name} (${seg.stopsCount} stops, ${seg.durationMin} mins)`
                          : `Walkway Transfer (${seg.durationMin} mins)`
                      }
                      className="h-full border-r border-white/40 last:border-r-0"
                    />
                  );
                })}
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {activeRoute.segments.map((seg, idx) => (
                  <div
                    key={`chip-${seg.segmentIndex}`}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    {idx > 0 && (
                      <ArrowRightIcon className="h-3.5 w-3.5 text-ink-muted" />
                    )}
                    {seg.line ? (
                      <span
                        style={{
                          backgroundColor: seg.line.color,
                          color: seg.line.textColor,
                        }}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[11px] font-extrabold shadow-2xs"
                      >
                        <span>{seg.line.badge}</span>
                        <span className="opacity-85">
                          ({seg.stopsCount} stops)
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                        🚶 Footbridge Walkway ({seg.durationMin}m)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step Segments & Interchanges */}
            <div className="mt-5 space-y-4">
              {activeRoute.segments.map((seg, segIdx) => {
                const isExpanded =
                  expandedSegments[seg.segmentIndex] ??
                  seg.intermediateStops.length <= 14;
                const lineColor = seg.line?.color || "#64748B";
                const lineTextColor = seg.line?.textColor || "#FFFFFF";
                const intermediateOnly = seg.intermediateStops.slice(1, -1);

                // Find if there is a non-walkway interchange right after this segment
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
                      className="rounded-xl border-2 border-dashed border-amber-500/50 bg-amber-50/70 p-4 dark:bg-amber-950/20"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-black text-white">
                            ⇄
                          </span>
                          <div>
                            <p className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                              Interchange Walkway Transfer • {seg.durationMin}{" "}
                              mins ({Math.round(seg.distanceKm * 1000)}m)
                            </p>
                            <p className="text-sm font-bold text-ink">
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
                              <p className="mt-0.5 text-xs text-ink-muted">
                                {seg.walkwayNote}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={`seg-${seg.segmentIndex}`} className="space-y-4">
                    <div className="overflow-hidden rounded-2xl border border-line bg-subcard/30">
                      {/* Segment Header */}
                      <div
                        style={{ borderLeft: `6px solid ${lineColor}` }}
                        className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-subcard/80 px-4 py-3"
                      >
                        <div className="flex flex-wrap items-center gap-2.5">
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

                        <div className="flex items-center gap-3 text-xs font-bold text-ink-soft">
                          <span>{seg.stopsCount} Stops</span>
                          <span>•</span>
                          <span>{seg.durationMin} mins</span>
                          <span>•</span>
                          <span>{seg.distanceKm} km</span>
                        </div>
                      </div>

                      {/* Segment Timeline Body */}
                      <div className="p-4">
                        <div className="relative pl-6">
                          {/* Vertical Colored Line */}
                          <span
                            style={{ backgroundColor: lineColor }}
                            className="absolute top-2 bottom-2 left-2 w-1 rounded-full"
                          />

                          {/* Boarding Station */}
                          <div className="relative flex flex-wrap items-center justify-between gap-2 pb-3">
                            <span
                              style={{
                                borderColor: lineColor,
                              }}
                              className="absolute top-1 -left-[22px] h-4 w-4 rounded-full border-4 bg-white dark:bg-slate-900"
                            />
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
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
                              <p className="mt-0.5 text-xs text-ink-muted">
                                {seg.platformHint} • First Train:{" "}
                                {seg.fromStation.firstTrain} | Last:{" "}
                                {seg.fromStation.lastTrain}
                              </p>
                            </div>
                            <div className="text-right font-mono text-xs font-bold text-ink-soft">
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
                            <div className="my-2">
                              <button
                                type="button"
                                onClick={() =>
                                  toggleSegmentStops(seg.segmentIndex)
                                }
                                className="mb-2 inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1 text-xs font-bold text-[#1956b4] transition hover:border-[#1956b4] dark:text-blue-300"
                              >
                                <span>
                                  {isExpanded ? "Hide" : "Show"}{" "}
                                  {intermediateOnly.length} intermediate station
                                  {intermediateOnly.length > 1 ? "s" : ""}
                                </span>
                                <span>{isExpanded ? "▲" : "▼"}</span>
                              </button>

                              {isExpanded && (
                                <div className="space-y-2 border-l border-dashed border-line/70 py-1 pl-3">
                                  {intermediateOnly.map((stop, stIdx) => (
                                    <div
                                      key={`${seg.segmentIndex}-${stop.stopId}`}
                                      className="relative flex items-center justify-between gap-2 text-xs"
                                    >
                                      <span
                                        style={{ backgroundColor: lineColor }}
                                        className="absolute top-1.5 -left-[31px] h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900"
                                      />
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="font-mono text-[10px] font-bold text-ink-muted">
                                          {stIdx + 1}.
                                        </span>
                                        <Link
                                          href={`/metro/${stop.slug}`}
                                          className="font-semibold text-ink hover:text-[#1956b4] hover:underline"
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
                          <div className="relative flex flex-wrap items-center justify-between gap-2 pt-3">
                            <span
                              style={{
                                backgroundColor: lineColor,
                              }}
                              className="absolute top-4 -left-[22px] h-4 w-4 rounded-full border-2 border-white shadow-xs dark:border-slate-900"
                            />
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase ${
                                    segIdx === activeRoute.segments.length - 1
                                      ? "bg-[#1956b4]/15 text-[#1956b4] dark:text-blue-300"
                                      : "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                                  }`}
                                >
                                  {segIdx === activeRoute.segments.length - 1
                                    ? "Arrive Destination"
                                    : "Alight for Interchange"}
                                </span>
                                <Link
                                  href={`/metro/${seg.toStation.slug}`}
                                  className="text-sm font-extrabold text-ink hover:text-[#1956b4] hover:underline sm:text-base"
                                >
                                  {seg.toStation.name}
                                </Link>
                              </div>
                            </div>
                            <div className="text-right font-mono text-xs font-bold text-ink">
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
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
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
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            <CheckCircleIcon className="h-4 w-4" />
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
