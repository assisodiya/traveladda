import { connection, type NextRequest } from "next/server";
import { fetchOwnedTrainChartTime } from "@/lib/chart-time-service";

export async function GET(request: NextRequest) {
  await connection();
  const trainNumber =
    request.nextUrl.searchParams.get("train") ||
    request.nextUrl.searchParams.get("trainNumber") ||
    "";
  const { httpStatus, body } = await fetchOwnedTrainChartTime(trainNumber);

  return new Response(JSON.stringify(body, null, 2), {
    status: httpStatus,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, must-revalidate",
      "X-Powered-By": "TravelAdda-ChartTime-API-v2",
    },
  });
}

