import {
  ALL_WEEK_DAYS,
  computeHaltMinutes,
  decodePolyline,
  formatDurationMinutes,
  formatTrainStatusLabel,
  getTodayIstDateString,
  parseCoachPosition,
  type NormalizedCurrentLocation,
  type NormalizedLiveTrainData,
  type NormalizedNextHalt,
  type NormalizedRouteStop,
  type OwnedLiveTrainApiResponse,
  type RouteStopState,
  type TrainEndpointStation,
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
  overallTrainStatus: string
): RouteStopState {
  const s = rawStopStatus.toLowerCase();
  const overall = overallTrainStatus.toLowerCase();

  if (overall === "completed" || overall === "arrived" || overall === "terminated") {
    return "departed";
  }
  if (s === "departed" || s === "passed" || s === "crossed" || s === "completed") {
    return "departed";
  }
  if (s === "at-station" || s === "current" || s === "halted" || s === "arrived") {
    return "current";
  }
  if (s === "upcoming" || s === "scheduled" || s === "not-started") {
    if (currentSeq !== null && seq === currentSeq) return "current";
    if (currentSeq !== null && seq < currentSeq) return "departed";
    return "upcoming";
  }
  if (currentSeq !== null) {
    if (seq < currentSeq) return "departed";
    if (seq === currentSeq) return "current";
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
    poweredBy: "TravelAdda Live Train Gateway",
    fetchedAt: nowIso,
    responseTimeMs: elapsed,
  };
}

export async function fetchOwnedLiveTrainStatus(
  rawTrainInput: string,
  rawDateInput?: string | null
): Promise<{
  httpStatus: number;
  body: OwnedLiveTrainApiResponse;
}> {
  const startedAt = Date.now();
  const cleanTrain = (rawTrainInput || "").replace(/\D/g, "");
  const resolvedDate =
    rawDateInput && /^\d{4}-\d{2}-\d{2}$/.test(rawDateInput.trim())
      ? rawDateInput.trim()
      : getTodayIstDateString();

  if (!/^\d{3,5}$/.test(cleanTrain)) {
    return {
      httpStatus: 400,
      body: {
        success: false,
        provider: "TravelAdda Owned Rail API v1",
        endpoint: `/api/trains/${cleanTrain || "invalid"}/live?date=${resolvedDate}`,
        error: {
          code: "INVALID_TRAIN_NUMBER",
          message:
            "Please enter a valid 4 or 5-digit Indian Railways train number (for example, 5 numeric digits).",
        },
        meta: buildMeta(startedAt),
      },
    };
  }

  try {
    const upstreamUrl = new URL(
      `${UPSTREAM_TRAINS_BASE_URL}/${encodeURIComponent(cleanTrain)}/live`
    );
    upstreamUrl.searchParams.set("geometry", "true");
    upstreamUrl.searchParams.set("format", "polyline");
    upstreamUrl.searchParams.set("includeCoordinates", "true");
    upstreamUrl.searchParams.set("date", resolvedDate);

    const response = await fetch(upstreamUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "TravelAdda-Portal/1.0 (+https://traveladda.in)",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return {
        httpStatus: 502,
        body: {
          success: false,
          provider: "TravelAdda Owned Rail API v1",
          endpoint: `/api/trains/${cleanTrain}/live?date=${resolvedDate}`,
          error: {
            code: "UPSTREAM_UNEXPECTED_FORMAT",
            message:
              "Live railway tracking service is momentarily busy. Please retry in a few seconds.",
          },
          meta: buildMeta(startedAt),
        },
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
        `Live running status not found for Train #${cleanTrain} on ${resolvedDate}. Verify the train number or running date.`;

      return {
        httpStatus:
          response.status >= 400 && response.status < 600
            ? response.status
            : 404,
        body: {
          success: false,
          provider: "TravelAdda Owned Rail API v1",
          endpoint: `/api/trains/${cleanTrain}/live?date=${resolvedDate}`,
          error: {
            code: "TRAIN_LIVE_LOOKUP_FAILED",
            message: upstreamMessage,
          },
          meta: buildMeta(startedAt, upstreamMeta),
        },
      };
    }

    const rawData = upstreamJson.data as Record<string, unknown>;
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
    const overallStatus = String(rawData.status ?? "scheduled");
    const isLive = Boolean(rawData.isLive);
    const trackingMode = String(rawData.trackingMode ?? "scheduled");
    const delayMinutes = toFiniteNumber(rawData.delayMinutes) ?? 0;

    const source = normalizeEndpointStation(rawTrain.source, "Origin");
    const destination = normalizeEndpointStation(
      rawTrain.destination,
      "Destination"
    );

    const rawRunDays = Array.isArray(rawTrain.runDays)
      ? rawTrain.runDays.map((d) => String(d).toLowerCase().slice(0, 3))
      : [];
    const isDaily = ALL_WEEK_DAYS.every((d) => rawRunDays.includes(d.key));

    const distanceKm = toFiniteNumber(rawTrain.distance) ?? 0;
    const durationMinutes = toFiniteNumber(rawTrain.duration) ?? 0;
    const avgSpeedKmph = toFiniteNumber(rawTrain.avgSpeed);
    const maxSpeedKmph = toFiniteNumber(rawTrain.maxSpeed);

    const rawCurrentLoc =
      rawData.currentLocation && typeof rawData.currentLocation === "object"
        ? (rawData.currentLocation as Record<string, unknown>)
        : null;

    let currentLocation: NormalizedCurrentLocation | null = null;
    if (rawCurrentLoc) {
      const coords =
        rawCurrentLoc.coordinates &&
        typeof rawCurrentLoc.coordinates === "object"
          ? (rawCurrentLoc.coordinates as Record<string, unknown>)
          : null;
      const locStatus = String(rawCurrentLoc.status ?? "at-station");
      currentLocation = {
        stationCode: String(rawCurrentLoc.stationCode ?? source.code).toUpperCase(),
        stationName: String(rawCurrentLoc.stationName ?? source.name),
        sequence: toFiniteNumber(rawCurrentLoc.sequence) ?? 1,
        status: locStatus,
        statusLabel:
          locStatus === "at-station"
            ? "Halted at Station"
            : locStatus === "in-transit" || locStatus === "running"
              ? "Moving Between Stations"
              : formatTrainStatusLabel(locStatus, isLive),
        isHalt: Boolean(rawCurrentLoc.isHalt ?? true),
        lat: toFiniteNumber(coords?.lat ?? rawCurrentLoc.lat),
        lng: toFiniteNumber(coords?.lng ?? rawCurrentLoc.lng),
        distanceFromOriginKm:
          toFiniteNumber(rawCurrentLoc.distanceFromOriginKm) ?? 0,
        distanceFromLastStationKm:
          toFiniteNumber(rawCurrentLoc.distanceFromLastStationKm) ?? 0,
        segmentProgress: toFiniteNumber(rawCurrentLoc.segmentProgress) ?? 0,
        speedKmh: toFiniteNumber(rawCurrentLoc.speedKmh) ?? 0,
        delayMinutes:
          toFiniteNumber(rawCurrentLoc.delayMinutes) ?? delayMinutes,
      };
    }

    const rawRoute = Array.isArray(rawData.route) ? rawData.route : [];
    const currentSeq = currentLocation?.sequence ?? null;

    const route: NormalizedRouteStop[] = rawRoute.map((item, idx) => {
      const r =
        item && typeof item === "object"
          ? (item as Record<string, unknown>)
          : {};
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
        stopState: deriveStopState(rawStatus, seq, currentSeq, overallStatus),
        coachPosition:
          typeof r.coachPosition === "string" && r.coachPosition
            ? r.coachPosition
            : null,
        lat: toFiniteNumber(r.lat),
        lng: toFiniteNumber(r.lng),
        scheduledArrival,
        actualArrival,
        arrivalDay: toFiniteNumber(r.arrivalDay) ?? 1,
        delayArrival: toFiniteNumber(r.delayArrival) ?? 0,
        scheduledDeparture,
        actualDeparture,
        departureDay: toFiniteNumber(r.departureDay) ?? 1,
        delayDeparture: toFiniteNumber(r.delayDeparture) ?? 0,
        haltMinutes:
          computeHaltMinutes(actualArrival, actualDeparture) ??
          computeHaltMinutes(scheduledArrival, scheduledDeparture),
        platform:
          r.platform !== undefined && r.platform !== null && String(r.platform).trim()
            ? String(r.platform).trim()
            : null,
        distanceKm: toFiniteNumber(r.distance) ?? 0,
        speedToNextStationKmph: toFiniteNumber(r.speedToNextStationKmph),
        provenance:
          typeof r.provenance === "string" ? r.provenance : null,
      };
    });

    const coachPositionRaw =
      (typeof rawTrain.coachPosition === "string" && rawTrain.coachPosition) ||
      route.find((s) => s.coachPosition)?.coachPosition ||
      null;
    const coaches = parseCoachPosition(coachPositionRaw);

    const computedHalts = route.filter((s) => s.isHalt).length;
    const totalHalts =
      toFiniteNumber(rawTrain.totalHalts) ?? (computedHalts || route.length);

    const rawNextHalt =
      rawData.nextHalt && typeof rawData.nextHalt === "object"
        ? (rawData.nextHalt as Record<string, unknown>)
        : null;

    let nextHalt: NormalizedNextHalt | null = null;
    if (rawNextHalt) {
      const nextCode = String(rawNextHalt.stationCode ?? "").toUpperCase();
      const nextSeq = toFiniteNumber(rawNextHalt.sequence) ?? 0;
      const matchedStop = route.find(
        (s) =>
          (nextSeq > 0 && s.sequence === nextSeq) ||
          (nextCode && s.stationCode === nextCode)
      );
      nextHalt = {
        stationCode: nextCode || matchedStop?.stationCode || "---",
        stationName: String(
          rawNextHalt.stationName ?? matchedStop?.stationName ?? "Next Station"
        ),
        sequence: nextSeq || matchedStop?.sequence || 0,
        distanceKm:
          toFiniteNumber(rawNextHalt.distance) ?? matchedStop?.distanceKm ?? 0,
        scheduledArrival: matchedStop?.scheduledArrival ?? null,
        expectedArrival:
          matchedStop?.actualArrival ?? matchedStop?.scheduledArrival ?? null,
        platform: matchedStop?.platform ?? null,
        delayMinutes: matchedStop?.delayArrival ?? delayMinutes,
      };
    } else {
      const fallbackUpcomingHalt = route.find(
        (s) => s.isHalt && s.stopState === "upcoming"
      );
      if (fallbackUpcomingHalt) {
        nextHalt = {
          stationCode: fallbackUpcomingHalt.stationCode,
          stationName: fallbackUpcomingHalt.stationName,
          sequence: fallbackUpcomingHalt.sequence,
          distanceKm: fallbackUpcomingHalt.distanceKm,
          scheduledArrival: fallbackUpcomingHalt.scheduledArrival,
          expectedArrival:
            fallbackUpcomingHalt.actualArrival ??
            fallbackUpcomingHalt.scheduledArrival,
          platform: fallbackUpcomingHalt.platform,
          delayMinutes: fallbackUpcomingHalt.delayArrival,
        };
      }
    }

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
        .filter((s): s is NormalizedRouteStop & { lat: number; lng: number } =>
          s.lat !== null && s.lng !== null
        )
        .map((s) => [s.lat, s.lng]);
    }

    const effectiveTotalDist =
      distanceKm > 0
        ? distanceKm
        : route.length > 0
          ? route[route.length - 1].distanceKm
          : 0;
    const coveredDist = currentLocation?.distanceFromOriginKm ?? 0;
    const progressPercent =
      overallStatus.toLowerCase() === "completed" ||
      overallStatus.toLowerCase() === "arrived"
        ? 100
        : effectiveTotalDist > 0
          ? Math.min(100, Math.max(0, (coveredDist / effectiveTotalDist) * 100))
          : 0;

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

    const normalized: NormalizedLiveTrainData = {
      trainNumber,
      trainName,
      startDate,
      status: overallStatus,
      statusLabel: formatTrainStatusLabel(overallStatus, isLive),
      isLive,
      trackingMode,
      delayMinutes,
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

    return {
      httpStatus: 200,
      body: {
        success: true,
        provider: "TravelAdda Owned Rail API v1",
        endpoint: `/api/trains/${cleanTrain}/live?date=${resolvedDate}`,
        data: normalized,
        meta: buildMeta(startedAt, upstreamMeta),
      },
    };
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === "TimeoutError";
    return {
      httpStatus: 502,
      body: {
        success: false,
        provider: "TravelAdda Owned Rail API v1",
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

