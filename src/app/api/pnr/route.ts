import { connection, type NextRequest } from "next/server";
import { fetchOwnedPnrStatus } from "@/lib/pnr-service";

export async function GET(request: NextRequest) {
  await connection();
  const pnr = request.nextUrl.searchParams.get("pnr") ?? "";

  if (!pnr) {
    return Response.json(
      {
        success: false,
        provider: "TravelAdda Owned Rail API v1",
        endpoint: "/api/pnr",
        usage: {
          byPath: "/api/pnr/2528012827",
          byQuery: "/api/pnr?pnr=2528012827",
          byPost: "POST /api/pnr with JSON body { \"pnr\": \"2528012827\" }",
        },
        error: {
          code: "MISSING_PNR",
          message:
            "Provide a 10-digit PNR number via /api/pnr/{pnr} or /api/pnr?pnr=2528012827",
        },
      },
      { status: 400, headers: { "Cache-Control": "no-store, must-revalidate" } }
    );
  }

  const { httpStatus, body } = await fetchOwnedPnrStatus(pnr);
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
  let pnr = "";
  try {
    const payload = (await request.json()) as { pnr?: unknown };
    pnr = typeof payload?.pnr === "string" || typeof payload?.pnr === "number"
      ? String(payload.pnr)
      : "";
  } catch {
    pnr = "";
  }

  const { httpStatus, body } = await fetchOwnedPnrStatus(pnr);
  return Response.json(body, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-store, must-revalidate",
      "X-Powered-By": "TravelAdda-Rail-API",
    },
  });
}

