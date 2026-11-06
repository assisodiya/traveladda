import { connection, type NextRequest } from "next/server";
import { fetchOwnedFlightStatus } from "@/lib/flight-service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ airline: string; flightNumber: string }> }
) {
  await connection();
  const { airline, flightNumber } = await context.params;
  const departureDate =
    request.nextUrl.searchParams.get("departureDate") ??
    request.nextUrl.searchParams.get("date");

  const { httpStatus, body } = await fetchOwnedFlightStatus(
    airline,
    flightNumber,
    departureDate
  );

  return new Response(JSON.stringify(body, null, 2), {
    status: httpStatus,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, must-revalidate",
      "X-Powered-By": "TravelAdda-Flight-API-v1",
    },
  });
}

