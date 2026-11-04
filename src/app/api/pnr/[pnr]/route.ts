import { connection, type NextRequest } from "next/server";
import { fetchOwnedPnrStatus } from "@/lib/pnr-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ pnr: string }> }
) {
  await connection();
  const { pnr } = await params;
  const { httpStatus, body } = await fetchOwnedPnrStatus(pnr);

  return Response.json(body, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-store, must-revalidate",
      "X-Powered-By": "TravelAdda-Rail-API",
    },
  });
}

