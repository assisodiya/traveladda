import {
  type ChartingZoneCluster,
  type EnrichedChartStation,
  type EnrichedChartTimeData,
  FALLBACK_12952_CHART_DATA,
  format24hTo12h,
  type OwnedChartTimeApiResponse,
  type UpstreamChartTimeResponse,
} from "./chart-time-types";

const UPSTREAM_CHART_BASE = "https://lastberth.com/api/chart-times-data";

export function enrichChartTimeResponse(
  raw: UpstreamChartTimeResponse
): EnrichedChartTimeData {
  const stationNameMap = new Map<string, string>();
  for (const s of raw.stations || []) {
    if (s.stationCode && s.stationName) {
      stationNameMap.set(s.stationCode.toUpperCase(), s.stationName);
    }
  }

  const enrichedStations: EnrichedChartStation[] = (raw.stations || []).map(
    (s, idx, arr) => {
      const remoteCode = (s.chartRemoteStation || s.stationCode || "").toUpperCase();
      const remoteName =
        stationNameMap.get(remoteCode) || s.stationName || remoteCode;
      const chartOneDayNum = 1 + (Number(s.chartOneDayOffset) || 0);
      const chartTwoDayNum = 1 + (Number(s.chartTwoDayOffset) || 0);

      const getOffsetLabel = (offset: number, stationDay: number) => {
        const chartDay = 1 + offset;
        if (offset < 0) return "Prev Day (Day 0)";
        if (chartDay < stationDay) return `Day ${chartDay} (Prior Day)`;
        return `Day ${chartDay}`;
      };

      return {
        ...s,
        sequence: idx + 1,
        distanceKm: Number.parseFloat(s.distance || "0") || 0,
        arrivalFormatted: s.arrivalTime ? format24hTo12h(s.arrivalTime) : "Origin",
        departureFormatted: s.departureTime
          ? format24hTo12h(s.departureTime)
          : "Destination",
        chartOneFormatted12h: format24hTo12h(s.chartTimeLocal),
        chartOneDayLabel: getOffsetLabel(
          Number(s.chartOneDayOffset) || 0,
          Number(s.day) || 1
        ),
        chartOneChartDayNumber: chartOneDayNum,
        chartTwoFormatted12h: format24hTo12h(s.chartTwoTimeLocal),
        chartTwoDayLabel: getOffsetLabel(
          Number(s.chartTwoDayOffset) || 0,
          Number(s.day) || 1
        ),
        chartTwoChartDayNumber: chartTwoDayNum,
        chartRemoteStation: remoteCode,
        chartRemoteStationName: remoteName,
        isPrimaryChartHub: s.stationCode.toUpperCase() === remoteCode,
        isOrigin: idx === 0,
        isDestination: idx === arr.length - 1,
      };
    }
  );

  // Group stations by chartRemoteStation in route order
  const zoneMap = new Map<string, ChartingZoneCluster>();
  for (const st of enrichedStations) {
    const key = st.chartRemoteStation;
    const existing = zoneMap.get(key);
    if (existing) {
      existing.stationCodes.push(st.stationCode);
      existing.stationNames.push(st.stationName);
      existing.stationCount += 1;
    } else {
      zoneMap.set(key, {
        remoteStationCode: key,
        remoteStationName: st.chartRemoteStationName,
        chartOneTimeLocal: st.chartTimeLocal,
        chartOneFormatted12h: st.chartOneFormatted12h,
        chartTwoTimeLocal: st.chartTwoTimeLocal,
        chartTwoFormatted12h: st.chartTwoFormatted12h,
        stationCodes: [st.stationCode],
        stationNames: [st.stationName],
        stationCount: 1,
      });
    }
  }

  const chartingZones = Array.from(zoneMap.values());
  const firstStation = enrichedStations[0];
  const lastStation = enrichedStations[enrichedStations.length - 1];

  return {
    trainNumber: raw.trainNumber,
    trainName: raw.trainName,
    originStation: raw.originStation,
    originStationName: firstStation?.stationName || raw.originStation,
    destinationStation: raw.destinationStation,
    destinationStationName: lastStation?.stationName || raw.destinationStation,
    slug: raw.slug,
    summary: raw.summary,
    generatedAt: raw.generatedAt || new Date().toISOString(),
    knownChartCount: raw.knownChartCount ?? enrichedStations.length,
    totalStations: enrichedStations.length,
    totalDistanceKm: lastStation?.distanceKm ?? 0,
    originFirstChart12h: firstStation?.chartOneFormatted12h || "—",
    originSecondChart12h: firstStation?.chartTwoFormatted12h || "—",
    uniqueChartHubCount: chartingZones.length,
    chartingZones,
    stations: enrichedStations,
  };
}

export async function fetchOwnedTrainChartTime(
  rawTrainInput: string
): Promise<{ httpStatus: number; body: OwnedChartTimeApiResponse }> {
  const startedAt = Date.now();
  const cleanTrainNumber = (rawTrainInput || "").replace(/\D/g, "").slice(0, 5);

  if (cleanTrainNumber.length < 3) {
    return {
      httpStatus: 400,
      body: {
        success: false,
        error: {
          code: "INVALID_TRAIN_NUMBER",
          message:
            "Please enter a valid 4 or 5-digit Indian Railways train number (for example, 12952).",
        },
        meta: {
          timestamp: new Date().toISOString(),
          source: "traveladda-chart-api",
          provider: "lastberth-prs-chart-engine",
          executionTime: Date.now() - startedAt,
        },
      },
    };
  }

  const upstreamUrl = `${UPSTREAM_CHART_BASE}/${encodeURIComponent(cleanTrainNumber)}`;

  try {
    const response = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) TravelAdda-ChartTimeEngine/2.0",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(9000),
    });

    if (response.ok) {
      const json = (await response.json()) as UpstreamChartTimeResponse;
      if (json && json.trainNumber && Array.isArray(json.stations)) {
        const enriched = enrichChartTimeResponse(json);
        return {
          httpStatus: 200,
          body: {
            success: true,
            data: enriched,
            meta: {
              timestamp: new Date().toISOString(),
              source: "traveladda-chart-api",
              provider: "lastberth-prs-chart-engine",
              executionTime: Date.now() - startedAt,
              fallbackUsed: false,
            },
          },
        };
      }
    }

    if (cleanTrainNumber === "12952") {
      return {
        httpStatus: 200,
        body: {
          success: true,
          data: enrichChartTimeResponse(FALLBACK_12952_CHART_DATA),
          meta: {
            timestamp: new Date().toISOString(),
            source: "traveladda-chart-api",
            provider: "lastberth-prs-chart-engine",
            executionTime: Date.now() - startedAt,
            fallbackUsed: true,
          },
        },
      };
    }

    return {
      httpStatus: response.status === 404 ? 404 : 502,
      body: {
        success: false,
        error: {
          code: "CHART_DATA_NOT_FOUND",
          message: `No published station-by-station chart preparation schedule found for train ${cleanTrainNumber}. Please verify the 5-digit train number.`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          source: "traveladda-chart-api",
          provider: "lastberth-prs-chart-engine",
          executionTime: Date.now() - startedAt,
        },
      },
    };
  } catch {
    if (cleanTrainNumber === "12952") {
      return {
        httpStatus: 200,
        body: {
          success: true,
          data: enrichChartTimeResponse(FALLBACK_12952_CHART_DATA),
          meta: {
            timestamp: new Date().toISOString(),
            source: "traveladda-chart-api",
            provider: "lastberth-prs-chart-engine",
            executionTime: Date.now() - startedAt,
            fallbackUsed: true,
          },
        },
      };
    }

    return {
      httpStatus: 502,
      body: {
        success: false,
        error: {
          code: "UPSTREAM_UNAVAILABLE",
          message: `Unable to reach the railway chart preparation server for train ${cleanTrainNumber} right now. Please try again in a moment.`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          source: "traveladda-chart-api",
          provider: "lastberth-prs-chart-engine",
          executionTime: Date.now() - startedAt,
        },
      },
    };
  }
}

