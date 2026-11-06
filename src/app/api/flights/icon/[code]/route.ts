import { connection, type NextRequest } from "next/server";
import { ensureDailyAirlineIcon } from "@/lib/flight-service";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  await connection();
  const { code } = await context.params;

  const iconResult = await ensureDailyAirlineIcon(code);

  const headers: Record<string, string> = {
    "Content-Type": iconResult.contentType,
    "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
    "X-Icon-Source": iconResult.source,
    "X-Powered-By": "TravelAdda-Flight-Icon-Cache",
  };

  if (iconResult.publicPath) {
    headers["X-Public-Path"] = iconResult.publicPath;
  }

  return new Response(new Uint8Array(iconResult.buffer), {
    status: 200,
    headers,
  });
}

