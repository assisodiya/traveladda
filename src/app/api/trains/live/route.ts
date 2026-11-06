import { connection, type NextRequest } from "next/server";
import { fetchOwnedLiveTrainStatus } from "@/lib/live-train-service";
import { POPULAR_LIVE_TRAINS } from "@/lib/live-train-types";

export async function GET(request: NextRequest) {
  await connection();
  const trainNumber =
    request.nextUrl.searchParams.get("train") ??
    request.nextUrl.searchParams.get("trainNumber") ??
    "";
  const dateParam = request.nextUrl.searchParams.get("date");
  const autoParam = request.nextUrl.searchParams.get("auto");

  if (!trainNumber) {
    const overview = {
      success: true,
      provider: "TravelAdda Owned Rail API v2",
      service: "Indian Railways Live Train Running Status & Coach Radar API",
      status: "operational",
      endpoints: {
        liveByPath: "/api/trains/{trainNumber}/live?date=YYYY-MM-DD",
        liveAutoDate: "/api/trains/{trainNumber}/live",
        liveByQuery: "/api/trains/live?train={trainNumber}&date=YYYY-MM-DD",
        searchTrains: "/api/trains/search?q={trainNameOrNumber}",
        liveByPost:
          'POST /api/trains/live with JSON { "trainNumber": "12002", "date": "YYYY-MM-DD" }',
      },
      quickExamples: POPULAR_LIVE_TRAINS.slice(0, 5).map((t) => ({
        trainNumber: t.trainNumber,
        trainName: t.trainName,
        route: `${t.sourceCode} -> ${t.destinationCode}`,
        liveEndpoint: `/api/trains/${t.trainNumber}/live`,
      })),
    };

    return new Response(JSON.stringify(overview, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store, must-revalidate",
        "X-Powered-By": "TravelAdda-Rail-API-v2",
      },
    });
  }

  const autoDetectRunning =
    autoParam === "1" || autoParam === "true" || !dateParam;

  const { httpStatus, body } = await fetchOwnedLiveTrainStatus(
    trainNumber,
    dateParam,
    { autoDetectRunning }
  );

  return new Response(JSON.stringify(body, null, 2), {
    status: httpStatus,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, must-revalidate",
      "X-Powered-By": "TravelAdda-Rail-API-v2",
    },
  });
}

export async function POST(request: NextRequest) {
  await connection();
  let trainNumber = "";
  let dateParam: string | null = null;
  let autoDetectRunning = true;

  try {
    const payload = (await request.json()) as {
      train?: unknown;
      trainNumber?: unknown;
      date?: unknown;
      auto?: unknown;
    };
    const rawTrain = payload?.trainNumber ?? payload?.train;
    trainNumber =
      typeof rawTrain === "string" || typeof rawTrain === "number"
        ? String(rawTrain)
        : "";
    dateParam = typeof payload?.date === "string" ? payload.date : null;
    autoDetectRunning =
      payload?.auto === true || payload?.auto === 1 || !dateParam;
  } catch {
    trainNumber = "";
  }

  const { httpStatus, body } = await fetchOwnedLiveTrainStatus(
    trainNumber,
    dateParam,
    { autoDetectRunning }
  );

  return new Response(JSON.stringify(body, null, 2), {
    status: httpStatus,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, must-revalidate",
      "X-Powered-By": "TravelAdda-Rail-API-v2",
    },
  });
}
