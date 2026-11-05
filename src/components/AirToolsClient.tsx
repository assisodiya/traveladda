"use client";

import { useState } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  LuggageIcon,
  PlaneIcon,
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
      flightType === "international"
        ? 195
        : hasCheckinBag
          ? 135
          : 100;

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
    <div className="space-y-12">
      {/* Tool 1: Baggage Allowance Checker */}
      <section
        id="baggage"
        className="scroll-mt-24 rounded-3xl border border-line bg-card p-6 shadow-lg shadow-black/5 dark:shadow-black/25 sm:p-8"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/15 text-sky-700 dark:text-sky-300">
            <LuggageIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-ink">
              Airline Baggage Allowance Checker
            </h2>
            <p className="text-sm text-ink-soft">
              Select your carrier &amp; sector to inspect standard cabin and
              check-in limits.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <label
            htmlFor="airline-select"
            className="block text-xs font-extrabold uppercase tracking-wider text-ink-soft"
          >
            Choose Carrier &amp; Fare Sector
          </label>
          <select
            id="airline-select"
            value={selectedAirlineId}
            onChange={(e) => setSelectedAirlineId(e.target.value)}
            className="mt-2 w-full rounded-2xl border-2 border-line bg-input px-4 py-3.5 text-sm font-bold text-ink focus:border-teal-500 focus:outline-none"
          >
            {AIRLINES.map((airline) => (
              <option key={airline.id} value={airline.id}>
                {airline.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-sky-500/25 bg-subcard p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
              Cabin Baggage
            </p>
            <p className="mt-1.5 text-sm font-extrabold text-ink">
              {selectedAirline.cabin}
            </p>
          </div>
          <div className="rounded-2xl border border-teal-500/25 bg-subcard p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
              Check-In Allowance
            </p>
            <p className="mt-1.5 text-sm font-extrabold text-ink">
              {selectedAirline.checkin}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/25 bg-subcard p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Bag Drop Closes
            </p>
            <p className="mt-1.5 text-sm font-extrabold text-ink">
              {selectedAirline.checkinClose}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-500/25 bg-subcard p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Boarding Gate Closes
            </p>
            <p className="mt-1.5 text-sm font-extrabold text-ink">
              {selectedAirline.gateClose}
            </p>
          </div>
        </div>
      </section>

      {/* Tool 2: Airport Arrival Buffer Planner */}
      <section
        id="buffer"
        className="scroll-mt-24 rounded-3xl border border-line bg-card p-6 shadow-lg shadow-black/5 dark:shadow-black/25 sm:p-8"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-300">
            <ClockIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-ink">
              Airport Arrival &amp; Buffer Calculator
            </h2>
            <p className="text-sm text-ink-soft">
              Find the stress-free terminal arrival time for your scheduled
              flight departure.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-ink-soft">
              Flight Type
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-subcard p-1.5">
              <button
                type="button"
                onClick={() => setFlightType("domestic")}
                className={`cursor-pointer rounded-xl py-2 text-xs font-extrabold transition ${
                  flightType === "domestic"
                    ? "ta-btn-primary"
                    : "text-ink-soft hover:bg-card hover:text-ink"
                }`}
              >
                Domestic
              </button>
              <button
                type="button"
                onClick={() => setFlightType("international")}
                className={`cursor-pointer rounded-xl py-2 text-xs font-extrabold transition ${
                  flightType === "international"
                    ? "ta-btn-primary"
                    : "text-ink-soft hover:bg-card hover:text-ink"
                }`}
              >
                International
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="dep-time"
              className="block text-xs font-extrabold uppercase tracking-wider text-ink-soft"
            >
              Scheduled Takeoff Time
            </label>
            <input
              id="dep-time"
              type="time"
              value={departureHour}
              onChange={(e) => setDepartureHour(e.target.value)}
              className="mt-2 w-full rounded-2xl border-2 border-line bg-input px-4 py-2.5 font-mono text-sm font-bold text-ink focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-ink-soft">
              Luggage Mode
            </label>
            <button
              type="button"
              onClick={() => setHasCheckinBag((v) => !v)}
              className="mt-2 flex w-full cursor-pointer items-center justify-between rounded-2xl border-2 border-line bg-input px-4 py-2.5 text-sm font-bold text-ink transition hover:border-teal-500"
            >
              <span>
                {hasCheckinBag ? "With Check-In Bag" : "Cabin Bag Only"}
              </span>
              <PlaneIcon className="h-4 w-4 text-teal-600 dark:text-teal-300" />
            </button>
          </div>
        </div>

        <div className="ta-cta-banner mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
              Recommended Terminal Entry Time
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Includes security queue, bag drop &amp; boarding gate buffer
            </p>
          </div>
          <p className="font-mono text-2xl font-black text-emerald-700 dark:text-emerald-300 sm:text-3xl">
            {computeArrivalRecommendation()}
          </p>
        </div>
      </section>

      {/* Tool 3: Boarding & DigiYatra Checklist */}
      <section
        id="checklist"
        className="scroll-mt-24 rounded-3xl border border-line bg-card p-6 shadow-lg shadow-black/5 dark:shadow-black/25 sm:p-8"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            <ShieldCheckIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-ink">
              Pre-Flight &amp; DigiYatra Boarding Checklist
            </h2>
            <p className="text-sm text-ink-soft">
              Avoid last-minute counter surprises with these essential aviation
              checks.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            "Complete online Web Check-In 48h to 2h prior to departure to lock your seat.",
            "Keep power banks, lithium batteries & e-devices strictly inside Cabin Baggage.",
            "Liquids, gels & aerosols in hand luggage must be in containers <= 100 ml each.",
            "Upload your boarding pass in DigiYatra for contactless facial gate entry at major Indian airports.",
          ].map((tip) => (
            <div
              key={tip}
              className="flex items-start gap-3 rounded-2xl border border-line bg-subcard p-4"
            >
              <CheckCircleIcon className="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm font-medium leading-relaxed text-ink">
                {tip}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
