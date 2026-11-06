import { connection, type NextRequest } from "next/server";
import { searchOwnedAirlines } from "@/lib/flight-service";

export async function GET(request: NextRequest) {
  await connection();
  const searchTerm =
    request.nextUrl.searchParams.get("searchTerm") ??
    request.nextUrl.searchParams.get("q") ??
    "";

  const { httpStatus, body } = await searchOwnedAirlines(searchTerm);

  return new Response(JSON.stringify(body, null, 2), {
    status: httpStatus,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      "X-Powered-By": "TravelAdda-Flight-API-v1",
    },
  });
}

