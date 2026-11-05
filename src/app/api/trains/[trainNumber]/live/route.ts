import { connection, type NextRequest } from "next/server";
import { fetchOwnedLiveTrainStatus } from "@/lib/live-train-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trainNumber: string }> }
) {
  await connection();
  const { trainNumber } = await params;
  const dateParam = request.nextUrl.searchParams.get("date");

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

