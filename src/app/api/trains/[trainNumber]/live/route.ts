import { connection, type NextRequest } from "next/server";
import { fetchOwnedLiveTrainStatus } from "@/lib/live-train-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trainNumber: string }> }
) {
  await connection();
  const { trainNumber } = await params;
  const dateParam = request.nextUrl.searchParams.get("date");
  const autoParam = request.nextUrl.searchParams.get("auto");
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
