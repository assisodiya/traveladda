import fs from "node:fs";
import path from "node:path";
import { cacheLife } from "next/cache";
import {
  buildMetroRouteSlug,
  type MetroFareBreakdown,
  type MetroJourneyInterchange,
  type MetroJourneySegment,
  type MetroLine,
  type MetroNetworkGraph,
  type MetroRouteOption,
  type MetroRoutePlanResult,
  type MetroRoutePreference,
  type MetroStation,
  type MetroStopStep,
} from "./metro-types";

declare global {
  var __traveladdaMetroGraph: MetroNetworkGraph | undefined;
}

const STATION_ALIASES: Record<string, string[]> = {
  "rajiv-chowk": ["connaught place", "cp", "palika bazar", "central park"],
  "new-delhi": ["ndls", "new delhi railway station", "ajmeri gate", "paharganj"],
  "kashmere-gate": ["isbt kashmere gate", "old delhi", "maharana pratap isbt"],
  "huda-city-centre": [
    "millennium city centre",
    "gurugram",
    "gurgaon",
    "sector 29 gurgaon",
  ],
  "igi-airport": ["airport t3", "terminal 3", "indira gandhi international airport", "del airport"],
  "terminal-1-igi-airport": ["airport t1", "terminal 1", "domestic airport", "t1d"],
  "delhi-aerocity": ["aerocity", "mahipalpur", "t2 airport"],
  "anand-vihar": ["anand vihar isbt", "anvt", "anand vihar railway station"],
  "sarai-kale-khan-nizamuddin": ["hazrat nizamuddin", "nzm", "sarai kale khan isbt"],
  "supreme-court": ["pragati maidan", "bharat mandapam"],
  "lal-quila": ["red fort", "chandni chowk fort"],
  "chandni-chowk": ["old delhi railway station", "dli", "paranthe wali gali"],
  "dilli-haat-ina": ["ina market", "dilli haat"],
  "lok-kalyan-marg": ["race course", "pm house"],
  "arjan-garh": ["ayangarh"],
  "botanical-garden": ["noida sector 37", "kalkaji magenta"],
  "noida-city-centre": ["wave city centre", "noida sector 32"],
  "pari-chowk": ["greater noida", "expo mart"],
  "shaheed-sthal-new-bus-adda": ["ghaziabad new bus adda", "ghaziabad"],
  "raja-nahar-singh": ["ballabhgarh", "faridabad"],
  "cyber-city-rapid-metro": ["dlf cyber hub", "cyberhub gurgaon"],
};

export function getMetroNetworkGraph(): MetroNetworkGraph {
  if (globalThis.__traveladdaMetroGraph) {
    return globalThis.__traveladdaMetroGraph;
  }

  const graphPath = path.join(
    process.cwd(),
    "public",
    "metro",
    "network-graph.json",
  );
  const raw = fs.readFileSync(graphPath, "utf8");
  const parsed = JSON.parse(raw) as MetroNetworkGraph;
  globalThis.__traveladdaMetroGraph = parsed;
  return parsed;
}

export function getAllMetroLines(): MetroLine[] {
  return getMetroNetworkGraph().routes;
}

export function getMetroLineById(routeId: string): MetroLine | undefined {
  return getMetroNetworkGraph().routes.find((r) => r.id === routeId);
}

export function getMetroLineBySlug(slug: string): MetroLine | undefined {
  const clean = slug.trim().toLowerCase().replace(/^line-/, "");
  return getMetroNetworkGraph().routes.find(
    (r) =>
      r.slug === clean ||
      r.id.toLowerCase() === clean ||
      `${r.slug}-metro` === clean,
  );
}

export function getAllMetroStations(): MetroStation[] {
  return getMetroNetworkGraph().stops;
}

export function getMetroStationBySlugOrId(
  query: string,
): MetroStation | undefined {
  const clean = decodeURIComponent(query || "")
    .trim()
    .toLowerCase()
    .replace(/-metro-station$/, "")
    .replace(/-station$/, "");
  if (!clean) return undefined;

  const stops = getMetroNetworkGraph().stops;
  const exact = stops.find(
    (s) =>
      s.slug === clean ||
      s.id.toLowerCase() === clean ||
      s.name.toLowerCase() === clean,
  );
  if (exact) return exact;

  // Check alias matches
  for (const [slug, aliases] of Object.entries(STATION_ALIASES)) {
    if (aliases.some((a) => a === clean || a.replace(/\s+/g, "-") === clean)) {
      const found = stops.find((s) => s.slug === slug);
      if (found) return found;
    }
  }

  // Fuzzy prefix/substring match
  return (
    stops.find((s) => s.slug.startsWith(clean) || clean.startsWith(s.slug)) ||
    stops.find((s) => s.slug.includes(clean))
  );
}

export function searchMetroStations(
  query: string,
  limit = 15,
): MetroStation[] {
  const stops = getMetroNetworkGraph().stops;
  const q = (query || "").trim().toLowerCase();
  if (!q) {
    // Return top major interchanges first
    const prioritySlugs = [
      "rajiv-chowk",
      "new-delhi",
      "kashmere-gate",
      "huda-city-centre",
      "igi-airport",
      "noida-electronic-city",
      "hauz-khas",
      "botanical-garden",
      "anand-vihar",
      "central-secretariat",
      "lajpat-nagar",
      "dwarka-sector-21",
      "cyber-city-rapid-metro",
      "pari-chowk",
      "vaishali",
    ];
    const prioritized: MetroStation[] = [];
    for (const sl of prioritySlugs) {
      const st = stops.find((s) => s.slug === sl);
      if (st) prioritized.push(st);
    }
    return prioritized.slice(0, limit);
  }

  const scored: { station: MetroStation; score: number }[] = [];
  for (const st of stops) {
    const nameLower = st.name.toLowerCase();
    const slugLower = st.slug;
    const aliases = STATION_ALIASES[st.slug] || [];
    let score = 0;

    if (nameLower === q || slugLower === q) {
      score = 100;
    } else if (nameLower.startsWith(q) || slugLower.startsWith(q)) {
      score = 85;
    } else if (
      nameLower.split(/[\s()-]+/).some((word) => word.startsWith(q))
    ) {
      score = 72;
    } else if (aliases.some((a) => a.includes(q))) {
      score = 68;
    } else if (nameLower.includes(q) || slugLower.includes(q)) {
      score = 55;
    }

    if (score > 0) {
      if (st.isInterchange) score += 5;
      scored.push({ station: st, score });
    }
  }

  scored.sort(
    (a, b) =>
      b.score - a.score || a.station.name.localeCompare(b.station.name),
  );
  return scored.slice(0, limit).map((x) => x.station);
}

export function calculateDmrcFare(
  distanceKm: number,
  usedRouteIds: string[],
): MetroFareBreakdown {
  const uniqueRoutes = new Set(usedRouteIds.filter((r) => r !== "WALK"));
  const includesAirportExpress = uniqueRoutes.has("DelhiAirport");
  const includesNoidaAqua = uniqueRoutes.has("NoidaAqua");
  const includesRapidMetro = uniqueRoutes.has("Gurgaon1");

  let tokenFareInr = 10;
  let sundayHolidayInr = 10;
  let distanceSlabLabel = "0 – 2 km";

  if (distanceKm <= 2) {
    tokenFareInr = 10;
    sundayHolidayInr = 10;
    distanceSlabLabel = "0 – 2 km";
  } else if (distanceKm <= 5) {
    tokenFareInr = 20;
    sundayHolidayInr = 10;
    distanceSlabLabel = "2 – 5 km";
  } else if (distanceKm <= 12) {
    tokenFareInr = 30;
    sundayHolidayInr = 20;
    distanceSlabLabel = "5 – 12 km";
  } else if (distanceKm <= 21) {
    tokenFareInr = 40;
    sundayHolidayInr = 30;
    distanceSlabLabel = "12 – 21 km";
  } else if (distanceKm <= 32) {
    tokenFareInr = 50;
    sundayHolidayInr = 40;
    distanceSlabLabel = "21 – 32 km";
  } else {
    tokenFareInr = 60;
    sundayHolidayInr = 50;
    distanceSlabLabel = "Above 32 km";
  }

  // Airport Express Line has dedicated high-speed corridor fare (₹20 to ₹60)
  if (includesAirportExpress && uniqueRoutes.size === 1) {
    tokenFareInr = Math.min(60, Math.max(20, Math.round(distanceKm * 2.8 / 10) * 10));
    sundayHolidayInr = tokenFareInr;
    distanceSlabLabel = `Airport Express (${distanceKm.toFixed(1)} km)`;
  } else if (includesAirportExpress && uniqueRoutes.size > 1) {
    tokenFareInr += 30;
    sundayHolidayInr += 30;
    distanceSlabLabel = `${distanceSlabLabel} + Airport Express`;
  }

  // Noida Aqua Line uses NMRC separate ticketing after Noida Sec-52 / Sector 51 walkway
  if (includesNoidaAqua && uniqueRoutes.size > 1) {
    tokenFareInr += 20;
    sundayHolidayInr += 20;
    distanceSlabLabel = `${distanceSlabLabel} (DMRC + NMRC Aqua)`;
  }

  // Gurgaon Rapid Metro flat/integrated fare addition
  if (includesRapidMetro && uniqueRoutes.size === 1) {
    tokenFareInr = 20;
    sundayHolidayInr = 20;
    distanceSlabLabel = "Rapid Metro Gurgaon Slab";
  }

  const smartCardPeakInr = Math.max(9, Math.round(tokenFareInr * 0.9));
  const smartCardOffPeakInr = Math.max(8, Math.round(tokenFareInr * 0.8));

  let fareNote =
    "Smart Card / NCMC users get 10% Peak discount & 20% Off-Peak discount (before 8 AM, 12 PM–5 PM, and after 9 PM).";
  if (includesNoidaAqua && uniqueRoutes.size > 1) {
    fareNote =
      "Includes DMRC Metro + NMRC Noida Aqua Line combined estimate (separate QR/card tap at Noida Sector 51 walkway).";
  } else if (includesAirportExpress) {
    fareNote =
      "Airport Express (Orange Line) uses high-speed corridor tariff (up to ₹60 from New Delhi to IGI Airport / Dwarka Sec-21).";
  }

  return {
    tokenFareInr,
    smartCardPeakInr,
    smartCardOffPeakInr,
    sundayHolidayInr,
    distanceSlabLabel,
    includesAirportExpress,
    includesNoidaAqua,
    includesRapidMetro,
    fareNote,
  };
}

function areSamePhysicalLine(r1: string, r2: string): boolean {
  if (r1 === r2) return true;
  return false;
}

function computeDijkstraOption(
  graph: MetroNetworkGraph,
  fromStation: MetroStation,
  toStation: MetroStation,
  preference: MetroRoutePreference,
): MetroRouteOption | null {
  const stopsById = new Map<string, MetroStation>();
  for (const s of graph.stops) stopsById.set(s.id, s);

  const linesById = new Map<string, MetroLine>();
  for (const r of graph.routes) linesById.set(r.id, r);

  // Build adjacency list per stopId
  const adj = new Map<
    string,
    {
      to: string;
      routeId: string;
      durationSec: number;
      distanceMeters: number;
      headsign: string;
      isWalkway: boolean;
      walkwayNote?: string;
    }[]
  >();

  for (const e of graph.edges) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from)!.push({
      to: e.to,
      routeId: e.routeId,
      durationSec: e.durationSec,
      distanceMeters: e.distanceMeters,
      headsign: e.headsign,
      isWalkway: false,
    });
  }

  for (const w of graph.walkways) {
    if (!adj.has(w.from)) adj.set(w.from, []);
    adj.get(w.from)!.push({
      to: w.to,
      routeId: "WALK",
      durationSec: w.durationSec,
      distanceMeters: w.distanceMeters,
      headsign: stopsById.get(w.to)?.name || "Walkway Transfer",
      isWalkway: true,
      walkwayNote: w.note,
    });
    if (!adj.has(w.to)) adj.set(w.to, []);
    adj.get(w.to)!.push({
      to: w.from,
      routeId: "WALK",
      durationSec: w.durationSec,
      distanceMeters: w.distanceMeters,
      headsign: stopsById.get(w.from)?.name || "Walkway Transfer",
      isWalkway: true,
      walkwayNote: w.note,
    });
  }

  interface StateNode {
    key: string;
    stopId: string;
    routeId: string;
    cost: number;
    durationSec: number;
    distanceMeters: number;
    interchanges: number;
    stopsCount: number;
    prevKey: string | null;
    edgeUsed: {
      from: string;
      to: string;
      routeId: string;
      durationSec: number;
      distanceMeters: number;
      headsign: string;
      isWalkway: boolean;
      walkwayNote?: string;
      transferSecAdded: number;
    } | null;
  }

  const best = new Map<string, StateNode>();
  const queue: StateNode[] = [];

  const startKey = `${fromStation.id}|START`;
  const startNode: StateNode = {
    key: startKey,
    stopId: fromStation.id,
    routeId: "START",
    cost: 0,
    durationSec: 0,
    distanceMeters: 0,
    interchanges: 0,
    stopsCount: 0,
    prevKey: null,
    edgeUsed: null,
  };
  best.set(startKey, startNode);
  queue.push(startNode);

  let goalNode: StateNode | null = null;

  while (queue.length > 0) {
    queue.sort((a, b) => a.cost - b.cost);
    const curr = queue.shift()!;
    if (curr.cost > (best.get(curr.key)?.cost ?? Infinity)) continue;

    if (curr.stopId === toStation.id && curr.routeId !== "START") {
      goalNode = curr;
      break;
    }

    const neighbors = adj.get(curr.stopId) || [];
    for (const edge of neighbors) {
      let isInterchange = false;
      let transferSec = 0;

      if (curr.routeId !== "START") {
        if (edge.isWalkway) {
          isInterchange = true;
          transferSec = 0; // edge.durationSec already represents the walkway time
        } else if (curr.routeId === "WALK") {
          // Just finished walkway, boarding new line
          isInterchange = false;
          transferSec = 60;
        } else if (!areSamePhysicalLine(curr.routeId, edge.routeId)) {
          // Check if switching between Delhi3 and Delhi4 on the shared Dwarka–Yamuna Bank trunk
          const isBlueBranchSwitch =
            (curr.routeId === "Delhi3" && edge.routeId === "Delhi4") ||
            (curr.routeId === "Delhi4" && edge.routeId === "Delhi3");
          if (isBlueBranchSwitch && curr.stopId !== "89") {
            // Only allow switching between Blue Line Main & Vaishali Branch at Yamuna Bank (89)
            continue;
          }
          isInterchange = true;
          transferSec = isBlueBranchSwitch ? 180 : 300;
        }
      }

      const nextDurationSec = curr.durationSec + edge.durationSec + transferSec;
      const nextDistanceM = curr.distanceMeters + edge.distanceMeters;
      const nextInterchanges = curr.interchanges + (isInterchange ? 1 : 0);
      const nextStops = curr.stopsCount + (edge.isWalkway ? 0 : 1);

      let stepCost = edge.durationSec + transferSec;
      if (preference === "min-interchange") {
        stepCost =
          edge.durationSec +
          transferSec +
          (isInterchange ? 2400 : 0) +
          (edge.isWalkway ? 600 : 0);
      } else if (preference === "min-stops") {
        stepCost =
          (edge.isWalkway ? 300 : 600) +
          (isInterchange ? 750 : 0) +
          edge.distanceMeters * 0.02;
      }

      const nextCost = curr.cost + stepCost;
      const nextKey = `${edge.to}|${edge.routeId}`;
      const existing = best.get(nextKey);

      if (!existing || nextCost < existing.cost) {
        const nextNode: StateNode = {
          key: nextKey,
          stopId: edge.to,
          routeId: edge.routeId,
          cost: nextCost,
          durationSec: nextDurationSec,
          distanceMeters: nextDistanceM,
          interchanges: nextInterchanges,
          stopsCount: nextStops,
          prevKey: curr.key,
          edgeUsed: {
            from: curr.stopId,
            ...edge,
            transferSecAdded: transferSec,
          },
        };
        best.set(nextKey, nextNode);
        queue.push(nextNode);
      }
    }
  }

  if (!goalNode) return null;

  // Reconstruct edge chain
  const stepEdges: NonNullable<StateNode["edgeUsed"]>[] = [];
  let cursor: StateNode | undefined = goalNode;
  while (cursor && cursor.edgeUsed) {
    stepEdges.unshift(cursor.edgeUsed);
    cursor = cursor.prevKey ? best.get(cursor.prevKey) : undefined;
  }

  if (stepEdges.length === 0) return null;

  // Group consecutive edges by routeId into segments
  const segments: MetroJourneySegment[] = [];
  const interchanges: MetroJourneyInterchange[] = [];
  const allStops: MetroStopStep[] = [
    {
      stopId: fromStation.id,
      name: fromStation.name,
      slug: fromStation.slug,
      lat: fromStation.lat,
      lon: fromStation.lon,
      cumulativeDurationMin: 0,
      cumulativeDistanceKm: 0,
      isInterchange: fromStation.isInterchange,
      routeIds: fromStation.routeIds,
    },
  ];

  let runningSec = 0;
  let runningDistM = 0;

  let i = 0;
  while (i < stepEdges.length) {
    const firstEdge = stepEdges[i];
    const routeId = firstEdge.routeId;
    const isWalkway = firstEdge.isWalkway;
    const segFrom = stopsById.get(firstEdge.from)!;

    if (firstEdge.transferSecAdded > 0 && segments.length > 0) {
      runningSec += firstEdge.transferSecAdded;
      const prevSeg = segments[segments.length - 1];
      const toLine = linesById.get(routeId);
      if (prevSeg.line && toLine) {
        interchanges.push({
          station: segFrom,
          arriveStation: segFrom,
          departStation: segFrom,
          fromLine: prevSeg.line,
          toLine,
          transferDurationMin: Math.round(firstEdge.transferSecAdded / 60),
          isWalkway: false,
          note:
            segFrom.id === "89" &&
            ((prevSeg.line.id === "Delhi3" && toLine.id === "Delhi4") ||
              (prevSeg.line.id === "Delhi4" && toLine.id === "Delhi3"))
              ? "Cross-platform Blue Line branch interchange at Yamuna Bank"
              : `Change from ${prevSeg.line.badge} to ${toLine.badge} at ${segFrom.name}`,
        });
      }
    }

    let j = i;
    let segSec = 0;
    let segDistM = 0;
    const segStops: MetroStopStep[] = [
      {
        stopId: segFrom.id,
        name: segFrom.name,
        slug: segFrom.slug,
        lat: segFrom.lat,
        lon: segFrom.lon,
        cumulativeDurationMin: Math.round(runningSec / 60),
        cumulativeDistanceKm: +(runningDistM / 1000).toFixed(1),
        isInterchange: segFrom.isInterchange,
        routeIds: segFrom.routeIds,
      },
    ];

    while (j < stepEdges.length && stepEdges[j].routeId === routeId) {
      const e = stepEdges[j];
      segSec += e.durationSec;
      segDistM += e.distanceMeters;
      runningSec += e.durationSec;
      runningDistM += e.distanceMeters;

      const st = stopsById.get(e.to)!;
      const stepObj: MetroStopStep = {
        stopId: st.id,
        name: st.name,
        slug: st.slug,
        lat: st.lat,
        lon: st.lon,
        cumulativeDurationMin: Math.round(runningSec / 60),
        cumulativeDistanceKm: +(runningDistM / 1000).toFixed(1),
        isInterchange: st.isInterchange,
        routeIds: st.routeIds,
      };
      segStops.push(stepObj);
      allStops.push(stepObj);
      j++;
    }

    const lastEdge = stepEdges[j - 1];
    const segTo = stopsById.get(lastEdge.to)!;
    const lineObj = isWalkway ? null : linesById.get(routeId) || null;

    // Determine terminal direction & platform hint
    let towardsTerminal = lastEdge.headsign || segTo.name;
    let platformHint = "Check Station Display";
    if (lineObj) {
      const fromIdx = lineObj.stopIds.indexOf(segFrom.id);
      const toIdx = lineObj.stopIds.indexOf(segTo.id);
      if (fromIdx !== -1 && toIdx !== -1) {
        if (toIdx > fromIdx) {
          towardsTerminal = lineObj.toStationName || towardsTerminal;
          platformHint = "Platform 1 (Towards " + towardsTerminal + ")";
        } else {
          towardsTerminal = lineObj.fromStationName || towardsTerminal;
          platformHint = "Platform 2 (Towards " + towardsTerminal + ")";
        }
      }
    }

    if (isWalkway) {
      // Record walkway interchange between previous metro segment and next metro segment
      const prevMetroSeg = [...segments]
        .reverse()
        .find((s) => s.type === "metro" && s.line);
      const nextEdge = stepEdges[j];
      const nextLine = nextEdge ? linesById.get(nextEdge.routeId) : null;
      if (prevMetroSeg?.line && nextLine) {
        interchanges.push({
          station: segFrom,
          arriveStation: segFrom,
          departStation: segTo,
          fromLine: prevMetroSeg.line,
          toLine: nextLine,
          transferDurationMin: Math.round(segSec / 60),
          isWalkway: true,
          note:
            firstEdge.walkwayNote ||
            `Footbridge walkway from ${segFrom.name} to ${segTo.name}`,
        });
      }
    }

    segments.push({
      segmentIndex: segments.length + 1,
      type: isWalkway ? "walkway" : "metro",
      line: lineObj,
      fromStation: segFrom,
      toStation: segTo,
      towardsTerminal,
      platformHint,
      stopsCount: isWalkway ? 0 : segStops.length - 1,
      durationMin: Math.max(1, Math.round(segSec / 60)),
      distanceKm: +(segDistM / 1000).toFixed(1),
      intermediateStops: segStops,
      walkwayNote: firstEdge.walkwayNote,
    });

    i = j;
  }

  const totalDistanceKm = +(runningDistM / 1000).toFixed(1);
  const interchangeDurationMin = interchanges.reduce(
    (acc, ic) => acc + ic.transferDurationMin,
    0,
  );
  const totalDurationMin = Math.max(2, Math.round(runningSec / 60));
  const inTrainDurationMin = Math.max(
    1,
    totalDurationMin - interchangeDurationMin,
  );
  const usedRouteIds = segments
    .filter((s) => s.line)
    .map((s) => s.line!.id);

  const fare = calculateDmrcFare(totalDistanceKm, usedRouteIds);

  const labelMap: Record<MetroRoutePreference, { label: string; badge: string }> = {
    fastest: {
      label: "Fastest Route",
      badge: "Recommended • Shortest Time",
    },
    "min-interchange": {
      label: "Minimum Interchange",
      badge: "Least Line Changes",
    },
    "min-stops": {
      label: "Minimum Stations",
      badge: "Fewer Halts",
    },
  };

  return {
    id: `${preference}-${usedRouteIds.join("-")}-${interchanges.length}`,
    preference,
    label: labelMap[preference].label,
    badgeText: labelMap[preference].badge,
    fromStation,
    toStation,
    totalDurationMin,
    inTrainDurationMin,
    interchangeDurationMin,
    totalDistanceKm,
    totalStops: stepEdges.filter((e) => !e.isWalkway).length,
    interchangeCount: interchanges.length,
    fare,
    segments,
    interchanges,
    allStops,
    firstTrainFromOrigin: fromStation.firstTrain,
    lastTrainFromOrigin: fromStation.lastTrain,
    peakFrequencyMin: usedRouteIds.includes("DelhiAirport")
      ? "10 mins"
      : "3 – 5 mins",
  };
}

export function planMetroRoute(
  fromQuery: string,
  toQuery: string,
  preference: MetroRoutePreference = "fastest",
): MetroRoutePlanResult | null {
  const fromStation = getMetroStationBySlugOrId(fromQuery);
  const toStation = getMetroStationBySlugOrId(toQuery);

  if (!fromStation || !toStation || fromStation.id === toStation.id) {
    return null;
  }

  const graph = getMetroNetworkGraph();
  const fastestOpt = computeDijkstraOption(
    graph,
    fromStation,
    toStation,
    "fastest",
  );
  const minInterchangeOpt = computeDijkstraOption(
    graph,
    fromStation,
    toStation,
    "min-interchange",
  );
  const minStopsOpt = computeDijkstraOption(
    graph,
    fromStation,
    toStation,
    "min-stops",
  );

  const allRaw = [fastestOpt, minInterchangeOpt, minStopsOpt].filter(
    (x): x is MetroRouteOption => x !== null,
  );
  if (allRaw.length === 0) return null;

  // Deduplicate options that use the exact same line sequence & interchange stations
  const uniqueOptions: MetroRouteOption[] = [];
  const seenSignatures = new Set<string>();

  for (const opt of allRaw) {
    const sig =
      opt.segments.map((s) => `${s.line?.id || "W"}:${s.fromStation.id}-${s.toStation.id}`).join("|");
    if (!seenSignatures.has(sig)) {
      seenSignatures.add(sig);
      uniqueOptions.push(opt);
    }
  }

  const recommended =
    allRaw.find((o) => o.preference === preference) || uniqueOptions[0];

  return {
    fromStation,
    toStation,
    routeSlug: buildMetroRouteSlug(fromStation.slug, toStation.slug),
    reverseRouteSlug: buildMetroRouteSlug(toStation.slug, fromStation.slug),
    selectedPreference: preference,
    recommended,
    alternatives: uniqueOptions,
  };
}

export async function fetchCachedMetroRoutePlan(
  fromQuery: string,
  toQuery: string,
  preference: MetroRoutePreference = "fastest",
): Promise<MetroRoutePlanResult | null> {
  "use cache";
  cacheLife("days");
  return planMetroRoute(fromQuery, toQuery, preference);
}

export async function fetchCachedMetroNetworkSummary() {
  "use cache";
  cacheLife("days");
  const graph = getMetroNetworkGraph();
  return {
    agency: graph.agency,
    routes: graph.routes,
    stops: graph.stops,
    walkways: graph.walkways,
  };
}
