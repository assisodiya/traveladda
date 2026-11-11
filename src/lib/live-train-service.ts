import { cacheLife } from "next/cache";
import {
  ALL_CATALOG_TRAINS,
  ALL_WEEK_DAYS,
  computeHaltMinutes,
  decodePolyline,
  deriveTrackingState,
  extractTrainNumberFromParam,
  findCatalogTrain,
  formatDelayText,
  formatDurationMinutes,
  formatIstTime,
  formatTrainStatusLabel,
  getTodayIstDateString,
  parseCoachPosition,
  POPULAR_LIVE_TRAINS,
  shiftDateString,
  type NormalizedCurrentLocation,
  type NormalizedLivePosition,
  type NormalizedLiveSummary,
  type NormalizedLiveTrainData,
  type NormalizedNextHalt,
  type NormalizedRouteStop,
  type OwnedLiveTrainApiResponse,
  type OwnedTrainSearchApiResponse,
  type RouteStopState,
  type TrainEndpointStation,
  type TrainSearchItem,
  type TrainTrackingState,
} from "./live-train-types";

const UPSTREAM_TRAINS_BASE_URL = "https://railradar.in/app/v1/trains";

function toFiniteNumber(val: unknown): number | null {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (typeof val === "string" && val.trim() !== "") {
    const parsed = Number(val);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function round1(val: number): number {
  return Math.round(val * 10) / 10;
}

function normalizeEndpointStation(
  raw: unknown,
  fallbackName: string
): TrainEndpointStation {
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    return {
      code:
        typeof obj.code === "string" && obj.code.trim()
          ? obj.code.trim().toUpperCase()
          : "---",
      name:
        typeof obj.name === "string" && obj.name.trim()
          ? obj.name.trim()
          : fallbackName,
      lat: toFiniteNumber(obj.lat),
      lng: toFiniteNumber(obj.lng),
    };
  }
  return { code: "---", name: fallbackName, lat: null, lng: null };
}

function deriveStopState(
  rawStopStatus: string,
  seq: number,
  currentSeq: number | null,
  trackingState: TrainTrackingState
): RouteStopState {
  const s = rawStopStatus.toLowerCase().trim();

  if (trackingState === "completed") {
    return "departed";
  }
  if (trackingState === "not-started" || trackingState === "cancelled") {
    return "upcoming";
  }

  if (trackingState === "halted" && currentSeq !== null) {
    if (seq < currentSeq) return "departed";
    if (seq === currentSeq) return "current";
    return "upcoming";
  }

  // trackingState === "running" (moving between currentSeq and currentSeq + 1)
  if (currentSeq !== null) {
    if (seq <= currentSeq) return "departed";
    return "upcoming";
  }

  if (
    s === "departed" ||
    s === "passed" ||
    s === "crossed" ||
    s === "completed"
  ) {
    return "departed";
  }
  if (
    s === "at-station" ||
    s === "current" ||
    s === "halted" ||
    s === "arrived"
  ) {
    return "current";
  }
  return "upcoming";
}

function buildMeta(
  startedAt: number,
  upstreamMeta?: Record<string, unknown> | null
): OwnedLiveTrainApiResponse["meta"] {
  const nowIso = new Date().toISOString();
  const elapsed = Date.now() - startedAt;
  return {
    timestamp:
      typeof upstreamMeta?.timestamp === "string"
        ? upstreamMeta.timestamp
        : nowIso,
    traceId:
      typeof upstreamMeta?.traceId === "string"
        ? upstreamMeta.traceId
        : crypto.randomUUID(),
    source:
      typeof upstreamMeta?.source === "string"
        ? upstreamMeta.source
        : "hybrid",
    executionTime:
      typeof upstreamMeta?.executionTime === "number"
        ? upstreamMeta.executionTime
        : elapsed,
    poweredBy: "TravelAdda Live Train Gateway v2",
    fetchedAt: nowIso,
    responseTimeMs: elapsed,
  };
}

interface RawUpstreamFetchResult {
  ok: boolean;
  httpStatus: number;
  upstreamJson: Record<string, unknown> | null;
  upstreamMeta: Record<string, unknown> | null;
  errorCode?: string;
  errorMessage?: string;
}

async function fetchUpstreamTrainForDate(
  cleanTrain: string,
  targetDate: string,
  options?: { allowCache?: boolean }
): Promise<RawUpstreamFetchResult> {
  const upstreamUrl = new URL(
    `${UPSTREAM_TRAINS_BASE_URL}/${encodeURIComponent(cleanTrain)}/live`
  );
  upstreamUrl.searchParams.set("geometry", "true");
  upstreamUrl.searchParams.set("format", "polyline");
  upstreamUrl.searchParams.set("includeCoordinates", "true");
  upstreamUrl.searchParams.set("date", targetDate);

  const response = await fetch(upstreamUrl.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "User-Agent": "TravelAdda-Portal/2.0 (+https://traveladda.in)",
    },
    ...(options?.allowCache ? {} : { cache: "no-store" as const }),
    signal: AbortSignal.timeout(options?.allowCache ? 4500 : 10000),
  });

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return {
      ok: false,
      httpStatus: 502,
      upstreamJson: null,
      upstreamMeta: null,
      errorCode: "UPSTREAM_UNEXPECTED_FORMAT",
      errorMessage:
        "Live railway tracking service is momentarily busy. Please retry in a few seconds.",
    };
  }

  const upstreamJson = (await response.json()) as Record<string, unknown>;
  const upstreamMeta =
    upstreamJson.meta && typeof upstreamJson.meta === "object"
      ? (upstreamJson.meta as Record<string, unknown>)
      : null;

  if (!response.ok || upstreamJson.success === false || !upstreamJson.data) {
    const errObj =
      upstreamJson.error && typeof upstreamJson.error === "object"
        ? (upstreamJson.error as Record<string, unknown>)
        : null;
    const upstreamMessage =
      (errObj && typeof errObj.message === "string" && errObj.message) ||
      (typeof upstreamJson.error === "string" && upstreamJson.error) ||
      (typeof upstreamJson.message === "string" && upstreamJson.message) ||
      `Live running status not found for Train #${cleanTrain} on ${targetDate}. Verify the train number or running date.`;

    return {
      ok: false,
      httpStatus:
        response.status >= 400 && response.status < 600
          ? response.status
          : 404,
      upstreamJson,
      upstreamMeta,
      errorCode: "TRAIN_LIVE_LOOKUP_FAILED",
      errorMessage: upstreamMessage,
    };
  }

  return {
    ok: true,
    httpStatus: 200,
    upstreamJson,
    upstreamMeta,
  };
}

function normalizeUpstreamTrainPayload(
  rawData: Record<string, unknown>,
  cleanTrain: string,
  resolvedDate: string,
  autoDetectedStartDate: boolean
): NormalizedLiveTrainData {
  const rawTrain =
    rawData.train && typeof rawData.train === "object"
      ? (rawData.train as Record<string, unknown>)
      : {};

  const trainNumber = String(
    rawData.trainNumber ?? rawTrain.number ?? cleanTrain
  );
  const trainName = String(
    rawData.trainName ?? rawTrain.name ?? `Indian Railways Express #${trainNumber}`
  );
  const startDate = String(rawData.startDate ?? resolvedDate);
  const lastUpdatedAt =
    typeof rawData.lastUpdatedAt === "string" && rawData.lastUpdatedAt
      ? rawData.lastUpdatedAt
      : new Date().toISOString();
  const overallStatus = String(rawData.status ?? "scheduled");
  const trackingMode = String(rawData.trackingMode ?? "scheduled");
  const delayMinutes = Math.round(toFiniteNumber(rawData.delayMinutes) ?? 0);

  const rawCurrentLoc =
    rawData.currentLocation && typeof rawData.currentLocation === "object"
      ? (rawData.currentLocation as Record<string, unknown>)
      : null;
  const rawLocStatus = rawCurrentLoc
    ? String(rawCurrentLoc.status ?? "")
    : null;

  const trackingState = deriveTrackingState(overallStatus, rawLocStatus);
  const isActivelyTracked =
    trackingState === "running" ||
    trackingState === "halted" ||
    trackingMode.toLowerCase() === "real-time";

  const source = normalizeEndpointStation(rawTrain.source, "Origin");
  const destination = normalizeEndpointStation(
    rawTrain.destination,
    "Destination"
  );

  const rawRunDays = Array.isArray(rawTrain.runDays)
    ? rawTrain.runDays.map((d) => String(d).toLowerCase().slice(0, 3))
    : [];
  const isDaily =
    rawRunDays.length >= 7 &&
    ALL_WEEK_DAYS.every((d) => rawRunDays.includes(d.key));

  const distanceKm = toFiniteNumber(rawTrain.distance) ?? 0;
  const durationMinutes = toFiniteNumber(rawTrain.duration) ?? 0;
  const avgSpeedKmph = toFiniteNumber(rawTrain.avgSpeed);
  const maxSpeedKmph = toFiniteNumber(rawTrain.maxSpeed);

  const rawCurrentSeq = rawCurrentLoc
    ? toFiniteNumber(rawCurrentLoc.sequence)
    : null;

  const rawRoute = Array.isArray(rawData.route) ? rawData.route : [];
  const route: NormalizedRouteStop[] = rawRoute.map((item, idx) => {
    const r =
      item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const seq = toFiniteNumber(r.sequence) ?? idx + 1;
    const rawStatus = String(r.status ?? "upcoming");
    const scheduledArrival =
      typeof r.scheduledArrival === "string" ? r.scheduledArrival : null;
    const actualArrival =
      typeof r.actualArrival === "string" ? r.actualArrival : null;
    const scheduledDeparture =
      typeof r.scheduledDeparture === "string" ? r.scheduledDeparture : null;
    const actualDeparture =
      typeof r.actualDeparture === "string" ? r.actualDeparture : null;

    return {
      sequence: seq,
      stationCode: String(r.stationCode ?? "---").toUpperCase(),
      stationName: String(r.stationName ?? `Station ${seq}`),
      isHalt: Boolean(r.isHalt),
      rawStatus,
      stopState: deriveStopState(rawStatus, seq, rawCurrentSeq, trackingState),
      coachPosition:
        typeof r.coachPosition === "string" && r.coachPosition
          ? r.coachPosition
          : null,
      lat: toFiniteNumber(r.lat),
      lng: toFiniteNumber(r.lng),
      scheduledArrival,
      actualArrival,
      arrivalDay: toFiniteNumber(r.arrivalDay) ?? 1,
      delayArrival: Math.round(toFiniteNumber(r.delayArrival) ?? 0),
      scheduledDeparture,
      actualDeparture,
      departureDay: toFiniteNumber(r.departureDay) ?? 1,
      delayDeparture: Math.round(toFiniteNumber(r.delayDeparture) ?? 0),
      haltMinutes:
        computeHaltMinutes(actualArrival, actualDeparture) ??
        computeHaltMinutes(scheduledArrival, scheduledDeparture),
      platform:
        r.platform !== undefined &&
        r.platform !== null &&
        String(r.platform).trim()
          ? String(r.platform).trim()
          : null,
      distanceKm: round1(toFiniteNumber(r.distance) ?? 0),
      speedToNextStationKmph: toFiniteNumber(r.speedToNextStationKmph),
      provenance: typeof r.provenance === "string" ? r.provenance : null,
    };
  });

  const effectiveTotalDist = round1(
    distanceKm > 0
      ? distanceKm
      : route.length > 0
        ? route[route.length - 1].distanceKm
        : 0
  );

  // Derive accurate speed & currentLocation
  let estimatedSpeedKmh = 0;
  let speedSource: NormalizedLivePosition["speedSource"] = "stationary";

  if (trackingState === "running") {
    const gpsSpeed = rawCurrentLoc
      ? toFiniteNumber(rawCurrentLoc.speedKmh)
      : null;
    if (gpsSpeed !== null && gpsSpeed > 0) {
      estimatedSpeedKmh = Math.round(gpsSpeed);
      speedSource = "gps";
    } else {
      const matchedSeqStop =
        (rawCurrentSeq !== null
          ? route.find((s) => s.sequence === rawCurrentSeq)
          : null) ??
        [...route]
          .reverse()
          .find(
            (s) =>
              s.stopState === "departed" &&
              s.speedToNextStationKmph !== null &&
              s.speedToNextStationKmph > 0
          );
      if (
        matchedSeqStop?.speedToNextStationKmph &&
        matchedSeqStop.speedToNextStationKmph > 0
      ) {
        estimatedSpeedKmh = Math.round(matchedSeqStop.speedToNextStationKmph);
        speedSource = "section";
      } else if (avgSpeedKmph && avgSpeedKmph > 0) {
        estimatedSpeedKmh = Math.round(avgSpeedKmph);
        speedSource = "average";
      }
    }
  }

  let currentLocation: NormalizedCurrentLocation | null = null;
  if (rawCurrentLoc) {
    const coords =
      rawCurrentLoc.coordinates &&
      typeof rawCurrentLoc.coordinates === "object"
        ? (rawCurrentLoc.coordinates as Record<string, unknown>)
        : null;
    const locStatus = String(rawCurrentLoc.status ?? "at-station");
    const distFromLast = round1(
      toFiniteNumber(rawCurrentLoc.distanceFromLastStationKm) ?? 0
    );
    const stName = String(rawCurrentLoc.stationName ?? source.name);
    const stCode = String(
      rawCurrentLoc.stationCode ?? source.code
    ).toUpperCase();

    const locLabel =
      trackingState === "completed"
        ? `Arrived at ${stName}`
        : trackingState === "halted"
          ? `Halted at ${stName}`
          : distFromLast > 0.2
            ? `Crossed ${stName} (${distFromLast} km ago)`
            : `Just Passed ${stName}`;

    currentLocation = {
      stationCode: stCode,
      stationName: stName,
      sequence: rawCurrentSeq ?? 1,
      status: locStatus,
      statusLabel: locLabel,
      isHalt: Boolean(rawCurrentLoc.isHalt ?? true),
      lat: toFiniteNumber(coords?.lat ?? rawCurrentLoc.lat),
      lng: toFiniteNumber(coords?.lng ?? rawCurrentLoc.lng),
      distanceFromOriginKm: round1(
        toFiniteNumber(rawCurrentLoc.distanceFromOriginKm) ?? 0
      ),
      distanceFromLastStationKm: distFromLast,
      segmentProgress: toFiniteNumber(rawCurrentLoc.segmentProgress) ?? 0,
      speedKmh: estimatedSpeedKmh,
      delayMinutes: Math.round(
        toFiniteNumber(rawCurrentLoc.delayMinutes) ?? delayMinutes
      ),
    };
  }

  const coveredDist =
    trackingState === "completed"
      ? effectiveTotalDist
      : round1(currentLocation?.distanceFromOriginKm ?? 0);
  const distanceRemainingKm = round1(
    Math.max(0, effectiveTotalDist - coveredDist)
  );

  const progressPercent =
    trackingState === "completed"
      ? 100
      : trackingState === "not-started"
        ? 0
        : effectiveTotalDist > 0
          ? round1(Math.min(100, Math.max(0, (coveredDist / effectiveTotalDist) * 100)))
          : 0;

  const coachPositionRaw =
    (typeof rawTrain.coachPosition === "string" && rawTrain.coachPosition) ||
    route.find((s) => s.coachPosition)?.coachPosition ||
    null;
  const coaches = parseCoachPosition(coachPositionRaw);

  const haltStops = route.filter((s) => s.isHalt);
  const computedHalts = haltStops.length;
  const totalHalts =
    toFiniteNumber(rawTrain.totalHalts) ?? (computedHalts || route.length);

  // Next Official Halt
  const rawNextHalt =
    rawData.nextHalt && typeof rawData.nextHalt === "object"
      ? (rawData.nextHalt as Record<string, unknown>)
      : null;

  let nextHalt: NormalizedNextHalt | null = null;
  if (trackingState !== "completed" && trackingState !== "cancelled") {
    if (rawNextHalt) {
      const nextCode = String(rawNextHalt.stationCode ?? "").toUpperCase();
      const nextSeq = toFiniteNumber(rawNextHalt.sequence) ?? 0;
      const matchedStop = route.find(
        (s) =>
          (nextSeq > 0 && s.sequence === nextSeq) ||
          (nextCode && s.stationCode === nextCode)
      );
      const haltDist = round1(
        toFiniteNumber(rawNextHalt.distance) ?? matchedStop?.distanceKm ?? 0
      );
      nextHalt = {
        stationCode: nextCode || matchedStop?.stationCode || "---",
        stationName: String(
          rawNextHalt.stationName ?? matchedStop?.stationName ?? "Next Station"
        ),
        sequence: nextSeq || matchedStop?.sequence || 0,
        distanceKm: haltDist,
        distanceFromCurrentKm: round1(Math.max(0, haltDist - coveredDist)),
        scheduledArrival: matchedStop?.scheduledArrival ?? null,
        expectedArrival:
          matchedStop?.actualArrival ?? matchedStop?.scheduledArrival ?? null,
        platform: matchedStop?.platform ?? null,
        delayMinutes: matchedStop?.delayArrival ?? delayMinutes,
      };
    } else {
      const fallbackUpcomingHalt = haltStops.find(
        (s) => s.stopState === "upcoming"
      );
      if (fallbackUpcomingHalt) {
        nextHalt = {
          stationCode: fallbackUpcomingHalt.stationCode,
          stationName: fallbackUpcomingHalt.stationName,
          sequence: fallbackUpcomingHalt.sequence,
          distanceKm: fallbackUpcomingHalt.distanceKm,
          distanceFromCurrentKm: round1(
            Math.max(0, fallbackUpcomingHalt.distanceKm - coveredDist)
          ),
          scheduledArrival: fallbackUpcomingHalt.scheduledArrival,
          expectedArrival:
            fallbackUpcomingHalt.actualArrival ??
            fallbackUpcomingHalt.scheduledArrival,
          platform: fallbackUpcomingHalt.platform,
          delayMinutes: fallbackUpcomingHalt.delayArrival,
        };
      }
    }
  }

  // Previous Official Halt & Adjacent Route Stations
  const departedHalts = haltStops.filter((s) => s.stopState === "departed");
  const lastDepartedHalt =
    departedHalts.length > 0 ? departedHalts[departedHalts.length - 1] : null;
  const currentHaltStop =
    haltStops.find((s) => s.stopState === "current") ?? null;

  const previousHalt: NormalizedLivePosition["previousHalt"] = lastDepartedHalt
    ? {
        code: lastDepartedHalt.stationCode,
        name: lastDepartedHalt.stationName,
        sequence: lastDepartedHalt.sequence,
        distanceKm: lastDepartedHalt.distanceKm,
        departedAt:
          lastDepartedHalt.actualDeparture ??
          lastDepartedHalt.scheduledDeparture,
        platform: lastDepartedHalt.platform,
      }
    : null;

  const departedAll = route.filter((s) => s.stopState === "departed");
  const lastPassedStop =
    departedAll.length > 0 ? departedAll[departedAll.length - 1] : null;
  const nextUpcomingStop =
    route.find((s) => s.stopState === "upcoming") ?? null;

  const prevHaltDist = previousHalt?.distanceKm ?? 0;
  const nextHaltDist = nextHalt?.distanceKm ?? effectiveTotalDist;
  const haltSpan = Math.max(0.1, nextHaltDist - prevHaltDist);
  const haltSegmentProgress =
    trackingState === "running" && nextHalt
      ? Math.min(0.96, Math.max(0.06, (coveredDist - prevHaltDist) / haltSpan))
      : trackingState === "completed"
        ? 1
        : 0;

  const delayStatus = formatDelayText(delayMinutes);

  // Build crisp narrative headline & subheadline
  let headline = formatTrainStatusLabel(
    overallStatus,
    isActivelyTracked,
    rawLocStatus
  );
  let subheadline = `${source.name} (${source.code}) to ${destination.name} (${destination.code})`;

  const originStop = route[0];
  const destStop = route.length > 0 ? route[route.length - 1] : undefined;

  if (trackingState === "running" && currentLocation) {
    headline =
      currentLocation.distanceFromLastStationKm > 0.2
        ? `Crossed ${currentLocation.stationName} (${currentLocation.stationCode}) · ${currentLocation.distanceFromLastStationKm} km ago`
        : `Moving past ${currentLocation.stationName} (${currentLocation.stationCode})`;
    subheadline = nextHalt
      ? `Next halt: ${nextHalt.stationName} (${nextHalt.stationCode}) in ${nextHalt.distanceFromCurrentKm} km · ETA ${formatIstTime(
          nextHalt.expectedArrival
        )}${nextHalt.platform ? ` · PF #${nextHalt.platform}` : ""}`
      : `Approaching final destination ${destination.name} (${destination.code})`;
  } else if (trackingState === "halted") {
    const haltStation = currentHaltStop ?? lastPassedStop;
    const pfLabel = haltStation?.platform ? ` · Platform #${haltStation.platform}` : "";
    headline = haltStation
      ? `Halted at ${haltStation.stationName} (${haltStation.stationCode})${pfLabel}`
      : `Halted at ${currentLocation?.stationName ?? source.name}`;
    subheadline = nextHalt
      ? `Next stop: ${nextHalt.stationName} (${nextHalt.stationCode}) at ${formatIstTime(
          nextHalt.expectedArrival
        )}`
      : `Ready at station · ${delayStatus}`;
  } else if (trackingState === "not-started") {
    const depStr = originStop?.scheduledDeparture
      ? formatIstTime(originStop.actualDeparture ?? originStop.scheduledDeparture)
      : null;
    headline = `Scheduled from ${source.name} (${source.code})${
      depStr ? ` at ${depStr}` : ""
    }`;
    subheadline = `${
      originStop?.platform ? `Platform #${originStop.platform} · ` : ""
    }Full coach rake, platform predictions & ${totalHalts} commercial halts loaded`;
  } else if (trackingState === "completed") {
    const arrStr = destStop?.actualArrival ?? destStop?.scheduledArrival;
    headline = `Reached ${destination.name} (${destination.code})${
      arrStr ? ` at ${formatIstTime(arrStr)}` : ""
    }`;
    subheadline = `Journey completed (${effectiveTotalDist} km) · ${delayStatus}`;
  } else if (trackingState === "cancelled") {
    headline = `Train #${trainNumber} is Cancelled for ${startDate}`;
    subheadline = `Please check alternate trains on ${source.code} → ${destination.code}`;
  }

  const livePosition: NormalizedLivePosition = {
    trackingState,
    isMoving: trackingState === "running",
    isHaltedAtStation: trackingState === "halted",
    headline,
    subheadline,
    delayStatus,
    lastStation: lastPassedStop
      ? {
          code: lastPassedStop.stationCode,
          name: lastPassedStop.stationName,
          sequence: lastPassedStop.sequence,
          distanceKm: lastPassedStop.distanceKm,
          isHalt: lastPassedStop.isHalt,
        }
      : null,
    nextStation: nextUpcomingStop
      ? {
          code: nextUpcomingStop.stationCode,
          name: nextUpcomingStop.stationName,
          sequence: nextUpcomingStop.sequence,
          distanceKm: nextUpcomingStop.distanceKm,
          isHalt: nextUpcomingStop.isHalt,
        }
      : null,
    previousHalt,
    distanceCoveredKm: coveredDist,
    distanceRemainingKm,
    distanceToNextHaltKm: nextHalt ? nextHalt.distanceFromCurrentKm : null,
    haltSegmentProgress,
    betweenHaltAfterSeq:
      trackingState === "running"
        ? (previousHalt?.sequence ?? originStop?.sequence ?? null)
        : null,
    betweenAllAfterSeq:
      trackingState === "running"
        ? (lastPassedStop?.sequence ?? originStop?.sequence ?? null)
        : null,
    estimatedSpeedKmh,
    speedSource,
  };

  const haltsCompleted =
    trackingState === "completed"
      ? totalHalts
      : departedHalts.length + (currentHaltStop ? 1 : 0);

  const summary: NormalizedLiveSummary = {
    trainLabel: `#${trainNumber} ${trainName}`,
    routeLabel: `${source.name} (${source.code}) → ${destination.name} (${destination.code})`,
    currentStatusText: headline,
    delayText: delayStatus,
    progressPercent,
    distanceCoveredKm: coveredDist,
    distanceTotalKm: effectiveTotalDist,
    distanceRemainingKm,
    haltsCompleted,
    haltsTotal: totalHalts,
    haltsRemaining: Math.max(0, totalHalts - haltsCompleted),
    lastUpdatedIst: formatIstTime(lastUpdatedAt),
  };

  const rawGeometry =
    rawData.geometry && typeof rawData.geometry === "object"
      ? (rawData.geometry as Record<string, unknown>)
      : null;
  const encodedPolyline =
    typeof rawGeometry?.encodedPolyline === "string" &&
    rawGeometry.encodedPolyline
      ? rawGeometry.encodedPolyline
      : null;

  let polyCoords = decodePolyline(encodedPolyline);
  if (polyCoords.length < 2) {
    polyCoords = route
      .filter(
        (s): s is NormalizedRouteStop & { lat: number; lng: number } =>
          s.lat !== null && s.lng !== null
      )
      .map((s) => [s.lat, s.lng]);
  }

  const rawExceptions = Array.isArray(rawData.exceptions)
    ? rawData.exceptions
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object") {
            const o = item as Record<string, unknown>;
            return String(o.message ?? o.description ?? o.type ?? "");
          }
          return "";
        })
        .filter(Boolean)
    : [];

  return {
    trainNumber,
    trainName,
    startDate,
    autoDetectedStartDate,
    lastUpdatedAt,
    status: overallStatus,
    statusLabel: formatTrainStatusLabel(
      overallStatus,
      isActivelyTracked,
      rawLocStatus
    ),
    trackingState,
    isLive: isActivelyTracked,
    trackingMode,
    delayMinutes,
    summary,
    livePosition,
    train: {
      number: String(rawTrain.number ?? trainNumber),
      name: String(rawTrain.name ?? trainName),
      type: String(rawTrain.type ?? "Express"),
      category: String(rawTrain.category ?? "Mail / Express"),
      source,
      destination,
      runDays: rawRunDays,
      isDaily,
      distanceKm: effectiveTotalDist,
      durationMinutes,
      durationFormatted: formatDurationMinutes(durationMinutes),
      avgSpeedKmph,
      maxSpeedKmph,
      totalHalts,
      totalRouteStations: route.length,
      returnTrain:
        typeof rawTrain.returnTrain === "string" && rawTrain.returnTrain.trim()
          ? rawTrain.returnTrain.trim()
          : null,
      coachPositionRaw,
      coaches,
    },
    nextHalt,
    currentLocation,
    geometry: {
      encodedPolyline,
      coordinates: polyCoords,
    },
    progressPercent,
    route,
    exceptions: rawExceptions,
  };
}

export async function fetchOwnedLiveTrainStatus(
  rawTrainInput: string,
  rawDateInput?: string | null,
  options?: { autoDetectRunning?: boolean }
): Promise<{
  httpStatus: number;
  body: OwnedLiveTrainApiResponse;
}> {
  const startedAt = Date.now();
  const cleanTrain = (rawTrainInput || "").replace(/\D/g, "");
  const todayIst = getTodayIstDateString();
  const hasExplicitDate = Boolean(
    rawDateInput && /^\d{4}-\d{2}-\d{2}$/.test(rawDateInput.trim())
  );
  const resolvedDate = hasExplicitDate ? rawDateInput!.trim() : todayIst;
  const shouldAutoDetect = options?.autoDetectRunning ?? !hasExplicitDate;

  if (!/^\d{3,5}$/.test(cleanTrain)) {
    return {
      httpStatus: 400,
      body: {
        success: false,
        provider: "TravelAdda Owned Rail API v2",
        endpoint: `/api/trains/${cleanTrain || "invalid"}/live?date=${resolvedDate}`,
        error: {
          code: "INVALID_TRAIN_NUMBER",
          message:
            "Please enter a valid 4 or 5-digit Indian Railways train number (for example, 12002 or 12951).",
        },
        meta: buildMeta(startedAt),
      },
    };
  }

  try {
    const primaryRes = await fetchUpstreamTrainForDate(cleanTrain, resolvedDate);

    // If user did not lock a specific date and today's departure hasn't started (or didn't run today),
    // automatically check yesterday's overnight run to see if the train is currently mid-journey!
    if (shouldAutoDetect) {
      const primaryRawData =
        primaryRes.ok && primaryRes.upstreamJson?.data
          ? (primaryRes.upstreamJson.data as Record<string, unknown>)
          : null;
      const primaryStatus = primaryRawData
        ? deriveTrackingState(String(primaryRawData.status ?? ""))
        : null;

      if (!primaryRes.ok || primaryStatus === "not-started") {
        const yesterdayIst = shiftDateString(todayIst, -1);
        if (yesterdayIst !== resolvedDate) {
          try {
            const yestRes = await fetchUpstreamTrainForDate(
              cleanTrain,
              yesterdayIst
            );
            if (yestRes.ok && yestRes.upstreamJson?.data) {
              const yestData = yestRes.upstreamJson.data as Record<
                string,
                unknown
              >;
              const yestState = deriveTrackingState(
                String(yestData.status ?? "")
              );
              if (
                yestState === "running" ||
                yestState === "halted" ||
                !primaryRes.ok
              ) {
                const normalizedYest = normalizeUpstreamTrainPayload(
                  yestData,
                  cleanTrain,
                  yesterdayIst,
                  true
                );
                return {
                  httpStatus: 200,
                  body: {
                    success: true,
                    provider: "TravelAdda Owned Rail API v2",
                    endpoint: `/api/trains/${cleanTrain}/live?date=${yesterdayIst}`,
                    data: normalizedYest,
                    meta: buildMeta(startedAt, yestRes.upstreamMeta),
                  },
                };
              }
            }
          } catch {
            // Fall through to primary result if yesterday check fails
          }
        }
      }
    }

    if (!primaryRes.ok || !primaryRes.upstreamJson?.data) {
      return {
        httpStatus: primaryRes.httpStatus,
        body: {
          success: false,
          provider: "TravelAdda Owned Rail API v2",
          endpoint: `/api/trains/${cleanTrain}/live?date=${resolvedDate}`,
          error: {
            code: primaryRes.errorCode || "TRAIN_LIVE_LOOKUP_FAILED",
            message:
              primaryRes.errorMessage ||
              `Live running status not found for Train #${cleanTrain} on ${resolvedDate}.`,
          },
          meta: buildMeta(startedAt, primaryRes.upstreamMeta),
        },
      };
    }

    const rawData = primaryRes.upstreamJson.data as Record<string, unknown>;
    const normalized = normalizeUpstreamTrainPayload(
      rawData,
      cleanTrain,
      resolvedDate,
      false
    );

    return {
      httpStatus: 200,
      body: {
        success: true,
        provider: "TravelAdda Owned Rail API v2",
        endpoint: `/api/trains/${cleanTrain}/live?date=${resolvedDate}`,
        data: normalized,
        meta: buildMeta(startedAt, primaryRes.upstreamMeta),
      },
    };
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === "TimeoutError";
    return {
      httpStatus: 502,
      body: {
        success: false,
        provider: "TravelAdda Owned Rail API v2",
        endpoint: `/api/trains/${cleanTrain}/live?date=${resolvedDate}`,
        error: {
          code: isTimeout ? "UPSTREAM_TIMEOUT" : "NETWORK_ERROR",
          message: isTimeout
            ? "Indian Railways live train tracking timed out. Please retry in a moment."
            : "Unable to reach the live railway tracking gateway right now. Please check your connection and retry.",
        },
        meta: buildMeta(startedAt),
      },
    };
  }
}

export async function searchOwnedTrains(
  rawQuery: string
): Promise<OwnedTrainSearchApiResponse> {
  const startedAt = Date.now();
  const cleanQuery = (rawQuery || "").trim();

  if (cleanQuery.length < 2) {
    return {
      success: true,
      provider: "TravelAdda Owned Rail API v2",
      query: cleanQuery,
      count: POPULAR_LIVE_TRAINS.length,
      data: POPULAR_LIVE_TRAINS,
      meta: {
        fetchedAt: new Date().toISOString(),
        responseTimeMs: Date.now() - startedAt,
      },
    };
  }

  try {
    const searchUrl = new URL(`${UPSTREAM_TRAINS_BASE_URL}/search`);
    searchUrl.searchParams.set("q", cleanQuery);

    const res = await fetch(searchUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "TravelAdda-Portal/2.0 (+https://traveladda.in)",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const json = (await res.json()) as Record<string, unknown>;
      const rawItems = Array.isArray(json.data) ? json.data : [];
      const items: TrainSearchItem[] = rawItems.slice(0, 10).map((raw) => {
        const o =
          raw && typeof raw === "object"
            ? (raw as Record<string, unknown>)
            : {};
        const runDays = Array.isArray(o.runDays)
          ? o.runDays.map((d) => String(d).toLowerCase().slice(0, 3))
          : [];
        const name = String(o.name ?? "Indian Railways Express");
        const inferredType =
          typeof o.type === "string" && o.type.trim()
            ? o.type.trim()
            : /vande bharat/i.test(name)
              ? "Vande Bharat"
              : /rajdhani/i.test(name)
                ? "Rajdhani"
                : /shatabdi/i.test(name)
                  ? "Shatabdi"
                  : /duronto/i.test(name)
                    ? "Duronto"
                    : /garib rath/i.test(name)
                      ? "Garib Rath"
                      : /double decker/i.test(name)
                        ? "Double Decker"
                        : "Express";

        return {
          trainNumber: String(o.number ?? o.trainNumber ?? ""),
          trainName: name,
          sourceCode: String(o.source ?? "---").toUpperCase(),
          sourceName: String(o.sourceName ?? o.source ?? "Origin"),
          destinationCode: String(o.dest ?? o.destinationCode ?? "---").toUpperCase(),
          destinationName: String(
            o.destName ?? o.destination ?? "Destination"
          ),
          type: inferredType,
          runDays,
          isDaily:
            runDays.length >= 7 &&
            ALL_WEEK_DAYS.every((d) => runDays.includes(d.key)),
        };
      });

      return {
        success: true,
        provider: "TravelAdda Owned Rail API v2",
        query: cleanQuery,
        count: items.length,
        data: items.filter((item) => item.trainNumber.length >= 3),
        meta: {
          fetchedAt: new Date().toISOString(),
          responseTimeMs: Date.now() - startedAt,
        },
      };
    }
  } catch {
    // Fall back to local popular train filter
  }

  const lower = cleanQuery.toLowerCase();
  const fallback = ALL_CATALOG_TRAINS.filter(
    (t) =>
      t.trainNumber.includes(lower) ||
      t.trainName.toLowerCase().includes(lower) ||
      t.sourceCode.toLowerCase().includes(lower) ||
      t.destinationCode.toLowerCase().includes(lower)
  ).slice(0, 20);

  return {
    success: true,
    provider: "TravelAdda Owned Rail API v2",
    query: cleanQuery,
    count: fallback.length,
    data: fallback,
    meta: {
      fetchedAt: new Date().toISOString(),
      responseTimeMs: Date.now() - startedAt,
    },
  };
}

function buildFallbackSeoTrainData(
  cleanTrain: string,
  todayIst: string
): NormalizedLiveTrainData {
  const catalog = findCatalogTrain(cleanTrain);
  const trainName = catalog?.trainName ?? `Indian Railways Express #${cleanTrain}`;
  const source: TrainEndpointStation = {
    code: catalog?.sourceCode ?? "NDLS",
    name: catalog?.sourceName ?? "Origin Station",
    lat: null,
    lng: null,
  };
  const destination: TrainEndpointStation = {
    code: catalog?.destinationCode ?? "MMCT",
    name: catalog?.destinationName ?? "Destination Station",
    lat: null,
    lng: null,
  };
  const runDays = catalog?.runDays ?? [
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
    "sat",
    "sun",
  ];
  const isDaily = catalog?.isDaily ?? true;
  const type = catalog?.type ?? "Express";
  const nowIso = new Date().toISOString();

  return {
    trainNumber: cleanTrain,
    trainName,
    startDate: todayIst,
    autoDetectedStartDate: false,
    lastUpdatedAt: nowIso,
    status: "scheduled",
    statusLabel: "Scheduled",
    trackingState: "not-started",
    isLive: false,
    trackingMode: "scheduled",
    delayMinutes: 0,
    summary: {
      trainLabel: `#${cleanTrain} ${trainName}`,
      routeLabel: `${source.name} (${source.code}) → ${destination.name} (${destination.code})`,
      currentStatusText: `Scheduled from ${source.name} (${source.code})`,
      delayText: "Right On Time",
      progressPercent: 0,
      distanceCoveredKm: 0,
      distanceTotalKm: 0,
      distanceRemainingKm: 0,
      haltsCompleted: 0,
      haltsTotal: 2,
      haltsRemaining: 2,
      lastUpdatedIst: formatIstTime(nowIso),
    },
    livePosition: {
      trackingState: "not-started",
      isMoving: false,
      isHaltedAtStation: false,
      headline: `Scheduled from ${source.name} (${source.code})`,
      subheadline: `${source.name} (${source.code}) to ${destination.name} (${destination.code})`,
      delayStatus: "Right On Time",
      lastStation: null,
      nextStation: null,
      previousHalt: null,
      distanceCoveredKm: 0,
      distanceRemainingKm: 0,
      distanceToNextHaltKm: null,
      haltSegmentProgress: 0,
      betweenHaltAfterSeq: null,
      betweenAllAfterSeq: null,
      estimatedSpeedKmh: 0,
      speedSource: "stationary",
    },
    train: {
      number: cleanTrain,
      name: trainName,
      type,
      category: type,
      source,
      destination,
      runDays,
      isDaily,
      distanceKm: 0,
      durationMinutes: 0,
      durationFormatted: "--",
      avgSpeedKmph: null,
      maxSpeedKmph: null,
      totalHalts: 2,
      totalRouteStations: 2,
      returnTrain: null,
      coachPositionRaw: null,
      coaches: [],
    },
    nextHalt: null,
    currentLocation: null,
    geometry: {
      encodedPolyline: null,
      coordinates: [],
    },
    progressPercent: 0,
    route: [
      {
        sequence: 1,
        stationCode: source.code,
        stationName: source.name,
        isHalt: true,
        rawStatus: "upcoming",
        stopState: "upcoming",
        coachPosition: null,
        lat: null,
        lng: null,
        scheduledArrival: null,
        actualArrival: null,
        arrivalDay: 1,
        delayArrival: 0,
        scheduledDeparture: null,
        actualDeparture: null,
        departureDay: 1,
        delayDeparture: 0,
        haltMinutes: null,
        platform: null,
        distanceKm: 0,
        speedToNextStationKmph: null,
        provenance: null,
      },
      {
        sequence: 2,
        stationCode: destination.code,
        stationName: destination.name,
        isHalt: true,
        rawStatus: "upcoming",
        stopState: "upcoming",
        coachPosition: null,
        lat: null,
        lng: null,
        scheduledArrival: null,
        actualArrival: null,
        arrivalDay: 1,
        delayArrival: 0,
        scheduledDeparture: null,
        actualDeparture: null,
        departureDay: 1,
        delayDeparture: 0,
        haltMinutes: null,
        platform: null,
        distanceKm: 0,
        speedToNextStationKmph: null,
        provenance: null,
      },
    ],
    exceptions: [],
  };
}

export async function fetchSeoTrainPageData(
  rawTrainInput: string
): Promise<NormalizedLiveTrainData | null> {
  "use cache";
  cacheLife("hours");

  let cleanTrain = extractTrainNumberFromParam(rawTrainInput || "");
  if (!/^\d{3,5}$/.test(cleanTrain)) {
    const nameQuery = decodeURIComponent(rawTrainInput || "")
      .replace(/[-_]+/g, " ")
      .trim();
    if (nameQuery.length >= 3) {
      const searchRes = await searchOwnedTrains(nameQuery);
      if (searchRes.data.length > 0) {
        cleanTrain = searchRes.data[0].trainNumber;
      }
    }
  }

  if (!/^\d{3,5}$/.test(cleanTrain)) {
    return null;
  }

  const todayIst = getTodayIstDateString();
  const candidateDates = [
    todayIst,
    shiftDateString(todayIst, -1),
    shiftDateString(todayIst, 1),
    shiftDateString(todayIst, 2),
  ];

  let firstValidResult: NormalizedLiveTrainData | null = null;

  for (let i = 0; i < candidateDates.length; i++) {
    const dateStr = candidateDates[i];
    try {
      const res = await fetchUpstreamTrainForDate(cleanTrain, dateStr, {
        allowCache: true,
      });
      if (res.ok && res.upstreamJson?.data) {
        const rawData = res.upstreamJson.data as Record<string, unknown>;
        const normalized = normalizeUpstreamTrainPayload(
          rawData,
          cleanTrain,
          dateStr,
          i > 0
        );
        if (
          normalized.trackingState === "running" ||
          normalized.trackingState === "halted"
        ) {
          return normalized;
        }
        if (!firstValidResult) {
          firstValidResult = normalized;
        }
        // If today's schedule has not started yet, check yesterday (index 1) in case an overnight run is currently live;
        // otherwise return the first valid schedule immediately.
        if (i >= 1 && firstValidResult) {
          return firstValidResult;
        }
      }
    } catch {
      // Upstream timed out or unreachable — fall back immediately so SSR/build never stalls
      break;
    }
  }

  if (firstValidResult) {
    return firstValidResult;
  }

  return buildFallbackSeoTrainData(cleanTrain, todayIst);
}
