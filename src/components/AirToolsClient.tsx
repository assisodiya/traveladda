"use client";

import { useState } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  LuggageIcon,
  ShieldCheckIcon,
} from "./Icons";

const AIRLINES = [
  {
    id: "indigo-dom",
    name: "IndiGo (Domestic Economy)",
    cabin: "7 kg (1 Cabin Bag + 1 Laptop Bag up to 3 kg)",
    checkin: "15 kg (1 Piece Free)",
    checkinClose: "60 mins before departure",
    gateClose: "25 mins before departure",
  },
  {
    id: "airindia-dom",
    name: "Air India (Domestic Economy)",
    cabin: "7 kg Hand Baggage",
    checkin: "15 kg (Comfort) / 25 kg (Flex)",
    checkinClose: "60 mins before departure",
    gateClose: "25 mins before departure",
  },
  {
    id: "akasa-dom",
    name: "Akasa Air (Domestic Economy)",
    cabin: "7 kg Hand Baggage",
    checkin: "15 kg (1 Piece Free)",
    checkinClose: "60 mins before departure",
    gateClose: "25 mins before departure",
  },
  {
    id: "intl-econ",
    name: "International Economy (Middle East / SE Asia)",
    cabin: "7 kg Cabin Bag",
    checkin: "20 kg – 30 kg (Route Dependent)",
    checkinClose: "75 mins before departure",
    gateClose: "30 mins before departure",
  },
];

export function AirToolsClient() {
  const [selectedAirlineId, setSelectedAirlineId] = useState(AIRLINES[0].id);
  const [flightType, setFlightType] = useState<"domestic" | "international">(
    "domestic"
  );
  const [departureHour, setDepartureHour] = useState("09:30");
  const [hasCheckinBag, setHasCheckinBag] = useState(true);

  const selectedAirline =
    AIRLINES.find((a) => a.id === selectedAirlineId) ?? AIRLINES[0];

  const computeArrivalRecommendation = () => {
    const [hStr, mStr] = departureHour.split(":");
    const h = Number(hStr);
    const m = Number(mStr);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return "2.5 hours prior";

    const bufferMinutes =
      flightType === "international" ? 195 : hasCheckinBag ? 135 : 100;

    const depTotal = h * 60 + m;
    const arriveTotal = (depTotal - bufferMinutes + 1440) % 1440;
    const arrH = Math.floor(arriveTotal / 60);
    const arrM = arriveTotal % 60;
    const period = arrH >= 12 ? "PM" : "AM";
    const h12 = arrH % 12 === 0 ? 12 : arrH % 12;
    return `${String(h12).padStart(2, "0")}:${String(arrM).padStart(
      2,
      "0"
    )} ${period}`;
  };

  return (
    <div className="space-y-6">
      {/* Tool 1: Baggage Allowance Checker */}
      <section
        id="baggage"
        className="scroll-mt-24 rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
            <LuggageIcon className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-extrabold text-ink sm:text-lg">
              Airline Baggage Allowance Checker
            </h2>
            <p className="text-xs text-ink-soft">
              Select your airline &amp; sector to check cabin and check-in
              limits.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-line-strong bg-input px-3.5 py-2.5">
          <label
            htmlFor="airline-select"
            className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted"
          >
            Airline &amp; Fare Sector
          </label>
          <select
            id="airline-select"
            value={selectedAirlineId}
            onChange={(e) => setSelectedAirlineId(e.target.value)}
            className="mt-1 w-full bg-transparent text-sm font-bold text-ink focus:outline-none sm:text-base"
          >
            {AIRLINES.map((airline) => (
              <option key={airline.id} value={airline.id}>
                {airline.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-line bg-subcard p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Cabin Baggage
            </p>
            <p className="mt-1 text-sm font-bold text-ink">
              {selectedAirline.cabin}
            </p>
          </div>
          <div className="rounded-xl border border-line bg-subcard p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Check-In Allowance
            </p>
            <p className="mt-1 text-sm font-bold text-ink">
              {selectedAirline.checkin}
            </p>
          </div>
          <div className="rounded-xl border border-line bg-subcard p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Bag Drop Closes
            </p>
            <p className="mt-1 text-sm font-bold text-ink">
              {selectedAirline.checkinClose}
            </p>
          </div>
          <div className="rounded-xl border border-line bg-subcard p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Boarding Gate Closes
            </p>
            <p className="mt-1 text-sm font-bold text-rose-600 dark:text-rose-400">
              {selectedAirline.gateClose}
            </p>
          </div>
        </div>
      </section>

      {/* Tool 2: Airport Arrival Buffer Planner */}
      <section
        id="buffer"
        className="scroll-mt-24 rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
            <ClockIcon className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-extrabold text-ink sm:text-lg">
              Airport Arrival Time Calculator
            </h2>
            <p className="text-xs text-ink-soft">
              Calculate the recommended terminal arrival time for your scheduled
              departure.
            </p>
          </div>
        </div>

        <div className="mt-4 grid divide-y divide-line rounded-xl border border-line-strong bg-input md:grid-cols-3 md:divide-x md:divide-y-0">
          <div className="px-3.5 py-2.5">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Sector Type
            </span>
            <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-lg bg-subcard p-0.5">
              <button
                type="button"
                onClick={() => setFlightType("domestic")}
                className={`cursor-pointer rounded-md py-1.5 text-xs font-bold transition ${
                  flightType === "domestic"
                    ? "bg-[#1956b4] text-white"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                Domestic
              </button>
              <button
                type="button"
                onClick={() => setFlightType("international")}
                className={`cursor-pointer rounded-md py-1.5 text-xs font-bold transition ${
                  flightType === "international"
                    ? "bg-[#1956b4] text-white"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                International
              </button>
            </div>
          </div>

          <div className="px-3.5 py-2.5">
            <label
              htmlFor="dep-time"
              className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted"
            >
              Scheduled Departure
            </label>
            <input
              id="dep-time"
              type="time"
              value={departureHour}
              onChange={(e) => setDepartureHour(e.target.value)}
              className="mt-1.5 w-full bg-transparent font-mono text-base font-bold text-ink focus:outline-none"
            />
          </div>

          <div className="px-3.5 py-2.5">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Baggage Type
            </span>
            <button
              type="button"
              onClick={() => setHasCheckinBag((v) => !v)}
              className="mt-1.5 flex w-full cursor-pointer items-center justify-between rounded-lg border border-line bg-subcard px-3 py-1.5 text-xs font-bold text-ink hover:border-[#1956b4]"
            >
              <span>
                {hasCheckinBag ? "With Check-In Bag" : "Cabin Bag Only"}
              </span>
              <span className="text-[#1956b4] dark:text-blue-400">Switch</span>
            </button>
          </div>
        </div>

        <div className="ta-cta-banner mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl p-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
              Recommended Terminal Entry Time
            </p>
            <p className="mt-0.5 text-xs text-ink-soft">
              Includes security queue, bag drop &amp; boarding gate buffer
            </p>
          </div>
          <p className="font-mono text-2xl font-black text-[#1956b4] dark:text-blue-300">
            {computeArrivalRecommendation()}
          </p>
        </div>
      </section>

      {/* Tool 3: Boarding & DigiYatra Checklist */}
      <section
        id="checklist"
        className="scroll-mt-24 rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <ShieldCheckIcon className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-extrabold text-ink sm:text-lg">
              Pre-Flight &amp; DigiYatra Boarding Checklist
            </h2>
            <p className="text-xs text-ink-soft">
              Essential checks before entering the airport terminal.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            "Complete online Web Check-In 48h to 2h prior to departure to lock your seat.",
            "Keep power banks, lithium batteries & e-devices strictly inside Cabin Baggage.",
            "Liquids, gels & aerosols in hand luggage must be in containers <= 100 ml each.",
            "Upload your boarding pass in DigiYatra for contactless facial gate entry at major Indian airports.",
          ].map((tip) => (
            <div
              key={tip}
              className="flex items-start gap-2.5 rounded-xl border border-line bg-subcard p-3.5"
            >
              <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs leading-relaxed text-ink sm:text-sm">
                {tip}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
