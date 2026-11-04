import {
  formatPnrDisplay,
  getBerthName,
  getClassName,
  getQuotaName,
  type NormalizedPassenger,
  type NormalizedPnrData,
  type OwnedPnrApiResponse,
  type StationInfo,
} from "./pnr-types";

const UPSTREAM_PNR_BASE_URL = "https://railradar.in/app/v1/pnr";

function normalizeStation(raw: unknown, fallbackName = "Unknown Station"): StationInfo {
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    return {
      code: typeof obj.code === "string" && obj.code.trim() ? obj.code.trim().toUpperCase() : "---",
      name: typeof obj.name === "string" && obj.name.trim() ? obj.name.trim() : fallbackName,
    };
  }
  if (typeof raw === "string" && raw.trim()) {
    return { code: raw.trim().toUpperCase(), name: raw.trim() };
  }
  return { code: "---", name: fallbackName };
}

function deriveBadge(
  currentStatus: string,
  flags: { isConfirmed: boolean; isRAC: boolean; isWaitlisted: boolean; isCancelled: boolean }
): NormalizedPassenger["statusBadge"] {
  if (flags.isCancelled || /CAN|MOD/i.test(currentStatus)) return "CAN";
  if (flags.isConfirmed || /^CNF/i.test(currentStatus)) return "CNF";
  if (flags.isRAC || /RAC/i.test(currentStatus)) return "RAC";
  if (flags.isWaitlisted || /WL/i.test(currentStatus)) return "WL";
  return "OTHER";
}

function deriveOverallStatus(
  passengers: NormalizedPassenger[],
  isWaitlistedFlag: boolean
): NormalizedPnrData["overallStatus"] {
  if (passengers.length === 0) {
    return isWaitlistedFlag ? "Waitlisted" : "Confirmed";
  }
  const allCancelled = passengers.every((p) => p.statusBadge === "CAN");
  if (allCancelled) return "Cancelled";

  const active = passengers.filter((p) => p.statusBadge !== "CAN");
  const cnfCount = active.filter((p) => p.statusBadge === "CNF").length;
  const racCount = active.filter((p) => p.statusBadge === "RAC").length;
  const wlCount = active.filter((p) => p.statusBadge === "WL").length;

  if (cnfCount === active.length) return "Confirmed";
  if (cnfCount > 0 && (racCount > 0 || wlCount > 0)) return "Partially Confirmed";
  if (racCount > 0 && wlCount === 0) return "RAC";
  if (wlCount > 0 || isWaitlistedFlag) return "Waitlisted";
  return "Confirmed";
}

function buildMeta(
  startedAt: number,
  upstreamMeta?: Record<string, unknown> | null
): OwnedPnrApiResponse["meta"] {
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
      typeof upstreamMeta?.source === "string" ? upstreamMeta.source : "prs",
    executionTime:
      typeof upstreamMeta?.executionTime === "number"
        ? upstreamMeta.executionTime
        : elapsed,
    poweredBy: "TravelAdda PNR Gateway",
    fetchedAt: nowIso,
    responseTimeMs: elapsed,
  };
}

export async function fetchOwnedPnrStatus(rawInput: string): Promise<{
  httpStatus: number;
  body: OwnedPnrApiResponse;
}> {
  const startedAt = Date.now();
  const cleanPnr = (rawInput || "").replace(/\D/g, "");

  if (!/^\d{10}$/.test(cleanPnr)) {
    return {
      httpStatus: 400,
      body: {
        success: false,
        provider: "TravelAdda Owned Rail API v1",
        endpoint: `/api/pnr/${cleanPnr || "invalid"}`,
        error: {
          code: "INVALID_PNR_FORMAT",
          message: "Please enter a valid 10-digit numeric Indian Railways PNR number.",
        },
        meta: buildMeta(startedAt),
      },
    };
  }

  try {
    const upstreamUrl = `${UPSTREAM_PNR_BASE_URL}/${cleanPnr}`;
    const response = await fetch(upstreamUrl, {
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
          endpoint: `/api/pnr/${cleanPnr}`,
          error: {
            code: "UPSTREAM_UNEXPECTED_FORMAT",
            message:
              "Railway PRS upstream service is temporarily busy. Please retry in a few seconds.",
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
        "PNR record not found, flushed, or currently unavailable on Indian Railways PRS.";

      return {
        httpStatus: response.status >= 400 && response.status < 600 ? response.status : 404,
        body: {
          success: false,
          provider: "TravelAdda Owned Rail API v1",
          endpoint: `/api/pnr/${cleanPnr}`,
          error: {
            code: "PNR_LOOKUP_FAILED",
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
    const rawJourney =
      rawData.journey && typeof rawData.journey === "object"
        ? (rawData.journey as Record<string, unknown>)
        : {};
    const rawCharting =
      (rawData.charting && typeof rawData.charting === "object"
        ? (rawData.charting as Record<string, unknown>)
        : null) ??
      (rawData.chart && typeof rawData.chart === "object"
        ? (rawData.chart as Record<string, unknown>)
        : {});

    const journeyClass = String(
      rawTrain.journeyClass ?? rawJourney.class ?? rawData.journeyClass ?? "SL"
    ).toUpperCase();

    const source = normalizeStation(rawTrain.source ?? rawJourney.source, "Origin");
    const destination = normalizeStation(
      rawTrain.destination ?? rawJourney.destination,
      "Destination"
    );
    const boardingPoint = normalizeStation(
      rawTrain.boardingPoint ?? rawJourney.boardingPoint ?? rawTrain.source,
      source.name
    );
    const reservationUpto = normalizeStation(
      rawTrain.reservationUpto ?? rawJourney.reservationUpto ?? rawTrain.destination,
      destination.name
    );

    const rawPassengers = Array.isArray(rawData.passengers) ? rawData.passengers : [];
    const passengers: NormalizedPassenger[] = rawPassengers.map((item, idx) => {
      const p = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      const bookingObj =
        p.booking && typeof p.booking === "object" ? (p.booking as Record<string, unknown>) : null;
      const currentObj =
        p.current && typeof p.current === "object" ? (p.current as Record<string, unknown>) : null;

      const bookingStatus = String(
        bookingObj?.status ?? p.bookingStatus ?? "N/A"
      );
      const bookingFormatted = String(
        bookingObj?.formatted ?? p.bookingStatus ?? bookingStatus
      );
      const bookingCoach =
        typeof bookingObj?.coachId === "string" && bookingObj.coachId
          ? bookingObj.coachId
          : typeof p.coach === "string" && p.coach
            ? p.coach
            : null;
      const bookingBerthNo =
        bookingObj?.berthNo !== undefined && bookingObj?.berthNo !== null
          ? (bookingObj.berthNo as number | string)
          : p.berthNumber !== undefined && p.berthNumber !== null
            ? (p.berthNumber as number | string)
            : null;
      const topBerthCode =
        typeof p.berthCode === "string" && p.berthCode ? p.berthCode : null;
      const bookingBerthCode =
        typeof bookingObj?.berthCode === "string" && bookingObj.berthCode
          ? bookingObj.berthCode
          : topBerthCode;
      const bookingQuota =
        typeof bookingObj?.quota === "string" && bookingObj.quota ? bookingObj.quota : null;

      const currentStatus = String(
        currentObj?.status ?? p.currentStatus ?? bookingStatus
      );
      const currentFormatted = String(
        currentObj?.formatted ?? p.currentStatus ?? currentStatus
      );
      const currentCoach =
        typeof currentObj?.coachId === "string" && currentObj.coachId
          ? currentObj.coachId
          : bookingCoach;
      const currentBerthNo =
        currentObj?.berthNo !== undefined && currentObj?.berthNo !== null
          ? (currentObj.berthNo as number | string)
          : bookingBerthNo;
      const currentBerthCode =
        typeof currentObj?.berthCode === "string" && currentObj.berthCode
          ? currentObj.berthCode
          : topBerthCode ?? bookingBerthCode;
      const currentQuota =
        typeof currentObj?.quota === "string" && currentObj.quota
          ? currentObj.quota
          : bookingQuota;

      const isConfirmed = Boolean(p.isConfirmed ?? /^CNF/i.test(currentStatus));
      const isRAC = Boolean(p.isRAC ?? /RAC/i.test(currentStatus));
      const isWaitlisted = Boolean(p.isWaitlisted ?? /WL/i.test(currentStatus));
      const isCancelled = Boolean(p.isCancelled ?? /CAN/i.test(currentStatus));

      const statusBadge = deriveBadge(currentStatus, {
        isConfirmed,
        isRAC,
        isWaitlisted,
        isCancelled,
      });

      return {
        serialNumber: Number(p.serialNumber ?? p.passengerNumber ?? idx + 1),
        booking: {
          status: bookingStatus,
          formatted: bookingFormatted,
          coachId: bookingCoach,
          berthNo: bookingBerthNo,
          berthCode: bookingBerthCode,
          berthName: getBerthName(bookingBerthCode),
          quota: bookingQuota,
          quotaName: getQuotaName(bookingQuota),
        },
        current: {
          status: currentStatus,
          formatted: currentFormatted,
          coachId: currentCoach,
          berthNo: currentBerthNo,
          berthCode: currentBerthCode,
          berthName: getBerthName(currentBerthCode),
          quota: currentQuota,
          quotaName: getQuotaName(currentQuota),
        },
        isConfirmed,
        isRAC,
        isWaitlisted,
        isCancelled,
        berthCode: currentBerthCode,
        berthName: getBerthName(currentBerthCode),
        statusBadge,
      };
    });

    const isWaitlisted = Boolean(rawData.isWaitlisted);
    const bookingFareRaw = rawTrain.bookingFare ?? rawData.bookingFare;
    const bookingFare =
      typeof bookingFareRaw === "number" && Number.isFinite(bookingFareRaw)
        ? bookingFareRaw
        : null;

    const pnrNumber = String(rawData.pnrNumber ?? rawData.pnr ?? cleanPnr);

    const normalized: NormalizedPnrData = {
      pnrNumber,
      formattedPnr: formatPnrDisplay(pnrNumber),
      train: {
        number: String(rawTrain.number ?? "-----"),
        name: String(rawTrain.name ?? "Indian Railways Express"),
        journeyDate: String(rawTrain.journeyDate ?? rawJourney.dateOfJourney ?? ""),
        journeyDateRaw: String(rawTrain.journeyDateRaw ?? rawTrain.journeyDate ?? ""),
        journeyClass,
        journeyClassName: getClassName(journeyClass),
        bookingFare,
        source,
        destination,
        boardingPoint,
        reservationUpto,
      },
      charting: {
        status: String(rawCharting?.status ?? "Chart Not Prepared"),
        isPrepared: Boolean(rawCharting?.isPrepared),
      },
      isWaitlisted,
      overallStatus: deriveOverallStatus(passengers, isWaitlisted),
      passengers,
      generatedAt: String(rawData.generatedAt ?? new Date().toISOString()),
    };

    return {
      httpStatus: 200,
      body: {
        success: true,
        provider: "TravelAdda Owned Rail API v1",
        endpoint: `/api/pnr/${cleanPnr}`,
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
        endpoint: `/api/pnr/${cleanPnr}`,
        error: {
          code: isTimeout ? "UPSTREAM_TIMEOUT" : "NETWORK_ERROR",
          message: isTimeout
            ? "Indian Railways PRS lookup timed out. Please try again in a moment."
            : "Unable to reach the live railway PNR server right now. Please check your connection and retry.",
        },
        meta: buildMeta(startedAt),
      },
    };
  }
}
