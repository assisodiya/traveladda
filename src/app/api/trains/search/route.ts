import { connection, type NextRequest } from "next/server";
import { searchOwnedTrains } from "@/lib/live-train-service";

export async function GET(request: NextRequest) {
  await connection();
  const q =
    request.nextUrl.searchParams.get("q") ??
    request.nextUrl.searchParams.get("query") ??
    "";

  const result = await searchOwnedTrains(q);

  return new Response(JSON.stringify(result, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      "X-Powered-By": "TravelAdda-Rail-API-v2",
    },
  });
}

