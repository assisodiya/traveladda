import { connection, type NextRequest } from "next/server";
import { fetchOwnedLiveTrainStatus } from "@/lib/live-train-service";

export async function GET(request: NextRequest) {
  await connection();
  const trainNumber =
    request.nextUrl.searchParams.get("train") ??
    request.nextUrl.searchParams.get("trainNumber") ??
    "";
  const dateParam = request.nextUrl.searchParams.get("date");

  if (!trainNumber) {
    return Response.json(
      {
        success: false,
        provider: "TravelAdda Owned Rail API v1",
        endpoint: "/api/trains/live",
        usage: {
          byPath: "/api/trains/{trainNumber}/live?date=YYYY-MM-DD",
          byQuery: "/api/trains/live?train={trainNumber}&date=YYYY-MM-DD",
          byPost:
            'POST /api/trains/live with JSON body { "trainNumber": "12986", "date": "YYYY-MM-DD" }',
        },
        error: {
          code: "MISSING_TRAIN_NUMBER",
          message:
            "Provide a valid Indian Railways train number via /api/trains/{trainNumber}/live or ?train={trainNumber}.",
        },
      },
      {
        status: 400,
        headers: { "Cache-Control": "no-store, must-revalidate" },
      }
    );
  }

  const { httpStatus, body } = await fetchOwnedLiveTrainStatus(
    trainNumber,
    dateParam
  );

  return Response.json(body, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-store, must-revalidate",
      "X-Powered-By": "TravelAdda-Rail-API",
    },
  });
}

export async function POST(request: NextRequest) {
  await connection();
  let trainNumber = "";
  let dateParam: string | null = null;

  try {
    const payload = (await request.json()) as {
      train?: unknown;
      trainNumber?: unknown;
      date?: unknown;
    };
    const rawTrain = payload?.trainNumber ?? payload?.train;
    trainNumber =
      typeof rawTrain === "string" || typeof rawTrain === "number"
        ? String(rawTrain)
        : "";
    dateParam = typeof payload?.date === "string" ? payload.date : null;
  } catch {
    trainNumber = "";
  }

  const { httpStatus, body } = await fetchOwnedLiveTrainStatus(
    trainNumber,
    dateParam
  );

  return Response.json(body, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-store, must-revalidate",
      "X-Powered-By": "TravelAdda-Rail-API",
    },
  });
}

