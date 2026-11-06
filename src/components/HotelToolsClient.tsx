"use client";

import { useState } from "react";
import {
  CalculatorIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
} from "./Icons";

export function HotelToolsClient() {
  const [tariffPerNight, setTariffPerNight] = useState("4800");
  const [numNights, setNumNights] = useState("3");
  const [numRooms, setNumRooms] = useState("1");

  const rate = Math.max(0, Number(tariffPerNight) || 0);
  const nights = Math.max(1, Number(numNights) || 1);
  const rooms = Math.max(1, Number(numRooms) || 1);

  const gstPercent = rate > 7500 ? 18 : rate > 1000 ? 12 : 0;
  const subtotal = rate * nights * rooms;
  const gstAmount = Math.round((subtotal * gstPercent) / 100);
  const grandTotal = subtotal + gstAmount;

  return (
    <div className="space-y-6">
      {/* Tool 1: Hotel Tariff & GST Calculator */}
      <section
        id="gst-calculator"
        className="scroll-mt-24 rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
            <CalculatorIcon className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-extrabold text-ink sm:text-lg">
              Indian Hotel Tariff &amp; GST Calculator
            </h2>
            <p className="text-xs text-ink-soft">
              Calculate exact room taxes across official 0%, 12%, and 18% GST
              tariff brackets.
            </p>
          </div>
        </div>

        <div className="mt-4 grid divide-y divide-line rounded-xl border border-line-strong bg-input sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-3.5 py-2.5">
            <label
              htmlFor="hotel-rate"
              className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted"
            >
              Room Tariff / Night (₹)
            </label>
            <input
              id="hotel-rate"
              type="number"
              min={0}
              value={tariffPerNight}
              onChange={(e) => setTariffPerNight(e.target.value)}
              className="mt-1 w-full bg-transparent font-mono text-base font-bold text-ink focus:outline-none"
            />
          </div>

          <div className="px-3.5 py-2.5">
            <label
              htmlFor="hotel-nights"
              className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted"
            >
              Number of Nights
            </label>
            <input
              id="hotel-nights"
              type="number"
              min={1}
              max={60}
              value={numNights}
              onChange={(e) => setNumNights(e.target.value)}
              className="mt-1 w-full bg-transparent font-mono text-base font-bold text-ink focus:outline-none"
            />
          </div>

          <div className="px-3.5 py-2.5">
            <label
              htmlFor="hotel-rooms"
              className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted"
            >
              Number of Rooms
            </label>
            <input
              id="hotel-rooms"
              type="number"
              min={1}
              max={20}
              value={numRooms}
              onChange={(e) => setNumRooms(e.target.value)}
              className="mt-1 w-full bg-transparent font-mono text-base font-bold text-ink focus:outline-none"
            />
          </div>
        </div>

        <div className="ta-cta-banner mt-4 grid gap-4 rounded-xl p-4 sm:grid-cols-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Base Stay Subtotal
            </p>
            <p className="mt-0.5 font-mono text-lg font-extrabold text-ink">
              ₹{subtotal.toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Applicable GST ({gstPercent}%)
            </p>
            <p className="mt-0.5 font-mono text-lg font-extrabold text-[#1956b4] dark:text-blue-300">
              ₹{gstAmount.toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Total Payable Estimate
            </p>
            <p className="mt-0.5 font-mono text-xl font-black text-ink sm:text-2xl">
              ₹{grandTotal.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </section>

      {/* Tool 2: Transit & Check-in Planner */}
      <section
        id="transit-planner"
        className="scroll-mt-24 rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
            <ClockIcon className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-extrabold text-ink sm:text-lg">
              Check-In &amp; Transit Stay Guide
            </h2>
            <p className="text-xs text-ink-soft">
              Align overnight train arrivals and red-eye flights with standard
              hotel check-in windows.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-line bg-subcard p-4">
            <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
              Standard Window
            </span>
            <h3 className="mt-2.5 text-sm font-bold text-ink">
              2:00 PM Check-In / 11:00 AM Check-Out
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              Most business and leisure hotels in India follow a 14:00 check-in
              and 11:00 or 12:00 check-out cycle.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-subcard p-4">
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              Early Morning Trains
            </span>
            <h3 className="mt-2.5 text-sm font-bold text-ink">
              Arriving Between 5 AM – 9 AM?
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              Request complimentary luggage cloakroom storage at reception or
              check IRCTC Retiring Rooms / hourly pods at major junctions.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-subcard p-4">
            <span className="rounded bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
              Location Tip
            </span>
            <h3 className="mt-2.5 text-sm font-bold text-ink">
              Verify Exact Terminal / Station Exit
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              Multi-terminal hubs (DEL T1/T3, CSMT/LTT, JP/GADJ) can sit 8–18 km
              apart; match your hotel pin to your exact boarding point.
            </p>
          </div>
        </div>
      </section>

      {/* Tool 3: Guest ID & Booking Checklist */}
      <section
        id="stay-checklist"
        className="scroll-mt-24 rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <ShieldCheckIcon className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-extrabold text-ink sm:text-lg">
              Hotel Check-In ID Rules in India
            </h2>
            <p className="text-xs text-ink-soft">
              Guest identity and reservation rules required at hotel reception.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            "Every adult guest must carry an original physical or DigiLocker Government ID (Aadhaar, Passport, Driving Licence, or Voter ID).",
            "Note that PAN Cards are generally NOT accepted as address/identity proof at hotel check-in desks.",
            "Check whether breakfast and Wi-Fi are bundled before comparing base room tariffs.",
            "Keep your train PNR or flight PNR handy if you booked a flexible transit rate.",
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-2.5 rounded-xl border border-line bg-subcard p-3.5"
            >
              <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs leading-relaxed text-ink sm:text-sm">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
