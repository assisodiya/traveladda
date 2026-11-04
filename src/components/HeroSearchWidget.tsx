"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const FLIGHT_QUICK_GUIDES = [
  {
    carrier: "Domestic Economy (IndiGo / Air India / Akasa)",
    cabin: "7 kg Hand Baggage",
    checkin: "15 kg Check-in (1 Piece)",
    gateRule: "Check-in closes 60 mins prior",
  },
  {
    carrier: "International Short-Haul (DXB / SIN / BKK)",
    cabin: "7 kg Cabin + Laptop Bag",
    checkin: "20–30 kg Check-in",
    gateRule: "Arrive 3 hours prior to departure",
  },
];

export function HeroSearchWidget() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"rail" | "air">("rail");
  const [pnr, setPnr] = useState("");
  const [validationMsg, setValidationMsg] = useState("");

  const handleRailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pnr.replace(/\D/g, "");
    if (clean.length !== 10) {
      setValidationMsg("Enter a 10-digit PNR number (or click sample 2528012827 below).");
      return;
    }
    router.push(`/rail/pnr-status?pnr=${clean}`);
  };

  return (
    <div className="rounded-3xl border border-white/15 bg-white/95 p-5 text-slate-900 shadow-2xl shadow-black/35 backdrop-blur-xl sm:p-7">
      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="inline-flex rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("rail")}
            className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition sm:text-sm ${
              activeTab === "rail"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🚂 Indian Rail PNR</span>
            <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
              LIVE
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("air")}
            className={`cursor-pointer inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition sm:text-sm ${
              activeTab === "air"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>✈️ Flight Allowance</span>
          </button>
        </div>

        <Link
          href="/rail/pnr-status"
          className="text-xs font-bold text-orange-600 hover:text-orange-700"
        >
          Open Full Rail Hub →
        </Link>
      </div>

      {activeTab === "rail" ? (
        <div className="mt-5">
          <label
            htmlFor="hero-pnr-input"
            className="block text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            Instant 10-Digit PNR Verification
          </label>
          <form
            onSubmit={handleRailSubmit}
            className="mt-2 flex flex-col gap-3 sm:flex-row"
          >
            <input
              id="hero-pnr-input"
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={pnr}
              onChange={(e) => {
                setPnr(e.target.value.replace(/\D/g, "").slice(0, 10));
                if (validationMsg) setValidationMsg("");
              }}
              placeholder="e.g. 2528012827"
              className="flex-1 rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3.5 font-mono text-base font-bold tracking-wider text-slate-900 placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              className="cursor-pointer inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-md shadow-orange-600/25 transition hover:from-orange-700 hover:to-amber-600"
            >
              <span>Track Live PNR</span>
              <span aria-hidden="true">→</span>
            </button>
          </form>

          {validationMsg && (
            <p className="mt-2 text-xs font-semibold text-rose-600">
              {validationMsg}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-500">Sample Live PNR:</span>
              <Link
                href="/rail/pnr-status?pnr=2528012827"
                className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 font-mono font-bold text-orange-800 transition hover:bg-orange-200"
              >
                2528012827 ↗
              </Link>
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              Coach, Berth &amp; Charting Decoder Included
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          <p className="text-xs font-semibold text-slate-500">
            Quick Indian Aviation Cabin &amp; Check-in Reference:
          </p>
          {FLIGHT_QUICK_GUIDES.map((item) => (
            <div
              key={item.carrier}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5"
            >
              <p className="text-xs font-bold text-slate-900">{item.carrier}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold">
                <span className="rounded-lg bg-sky-100 px-2.5 py-1 text-sky-800">
                  🎒 {item.cabin}
                </span>
                <span className="rounded-lg bg-indigo-100 px-2.5 py-1 text-indigo-800">
                  🧳 {item.checkin}
                </span>
                <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-amber-900">
                  ⏱ {item.gateRule}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

