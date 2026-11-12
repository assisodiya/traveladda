import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const badge =
    searchParams.get("badge") ||
    "TravelAdda • Verified Indian Travel Intelligence";
  const title =
    searchParams.get("title") ||
    "Live Flight, Train, Metro, Toll & Refund Tools";
  const subtitle =
    searchParams.get("subtitle") ||
    "Instant server-verified calculators & live transit tracking across India";
  const stat1Label = searchParams.get("s1l") || "Primary Metric";
  const stat1Value = searchParams.get("s1v") || "100% Verified";
  const stat2Label = searchParams.get("s2l") || "Rule Standard";
  const stat2Value = searchParams.get("s2v") || "2026 Gazette / PRS";
  const stat3Label = searchParams.get("s3l") || "Platform";
  const stat3Value = searchParams.get("s3v") || "traveladda.in";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "54px 64px",
          background:
            "linear-gradient(135deg, #071936 0%, #0d2b5c 55%, #163d7a 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top Brand + Badge Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "12px",
                backgroundColor: "#fc6203",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: 900,
                color: "#ffffff",
              }}
            >
              TA
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                TravelAdda.in
              </span>
              <span
                style={{
                  fontSize: "13px",
                  color: "#93c5fd",
                  fontWeight: 600,
                }}
              >
                Flights • Trains • Metro • Highway Tolls • Stays
              </span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "rgba(252, 98, 3, 0.22)",
              border: "2px solid rgba(252, 98, 3, 0.65)",
              borderRadius: "999px",
              padding: "10px 22px",
              fontSize: "16px",
              fontWeight: 800,
              color: "#fed7aa",
              display: "flex",
              alignItems: "center",
            }}
          >
            {badge.slice(0, 65)}
          </div>
        </div>

        {/* Center Main Headline & Subtitle */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            marginTop: "12px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              fontSize: title.length > 62 ? "44px" : "52px",
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
              color: "#ffffff",
              display: "flex",
            }}
          >
            {title.slice(0, 95)}
          </div>

          <div
            style={{
              fontSize: "22px",
              lineHeight: 1.4,
              color: "#cbd5e1",
              fontWeight: 500,
              display: "flex",
            }}
          >
            {subtitle.slice(0, 140)}
          </div>
        </div>

        {/* Bottom 3-Metric Highlight Cards */}
        <div
          style={{
            display: "flex",
            gap: "22px",
            width: "100%",
          }}
        >
          <div
            style={{
              flex: 1,
              backgroundColor: "rgba(16, 185, 129, 0.16)",
              border: "2px solid rgba(52, 211, 153, 0.45)",
              borderRadius: "20px",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#a7f3d0",
              }}
            >
              {stat1Label.slice(0, 32)}
            </span>
            <span
              style={{
                fontSize: "32px",
                fontWeight: 900,
                color: "#6ee7b7",
              }}
            >
              {stat1Value.slice(0, 26)}
            </span>
          </div>

          <div
            style={{
              flex: 1,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              border: "2px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "20px",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#bfdbfe",
              }}
            >
              {stat2Label.slice(0, 32)}
            </span>
            <span
              style={{
                fontSize: "32px",
                fontWeight: 900,
                color: "#ffffff",
              }}
            >
              {stat2Value.slice(0, 26)}
            </span>
          </div>

          <div
            style={{
              flex: 1,
              backgroundColor: "rgba(245, 158, 11, 0.16)",
              border: "2px solid rgba(251, 191, 36, 0.45)",
              borderRadius: "20px",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#fde68a",
              }}
            >
              {stat3Label.slice(0, 32)}
            </span>
            <span
              style={{
                fontSize: "28px",
                fontWeight: 900,
                color: "#fcd34d",
              }}
            >
              {stat3Value.slice(0, 26)}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

