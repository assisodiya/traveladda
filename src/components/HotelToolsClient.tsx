"use client";

import { useState } from "react";
import {
  BedIcon,
  CalculatorIcon,
  CheckCircleIcon,
  ClockIcon,
  HotelIcon,
  MapPinIcon,
  RupeeBadgeIcon,
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
    <div className="space-y-12">
      {/* Tool 1: Hotel Tariff & GST Calculator */}
      <section
        id="gst-calculator"
        className="scroll-mt-24 rounded-3xl border border-line bg-card p-6 shadow-lg shadow-black/5 dark:shadow-black/25 sm:p-8"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/15 text-orange-700 dark:text-amber-300">
            <CalculatorIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-ink">
              Indian Hotel Tariff &amp; GST Calculator
            </h2>
            <p className="text-sm text-ink-soft">
              Calculate exact room taxes across official 0%, 12%, and 18% GST
              tariff brackets.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="hotel-rate"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-ink-soft"
            >
              <RupeeBadgeIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
              <span>Room Tariff / Night (₹)</span>
            </label>
            <input
              id="hotel-rate"
              type="number"
              min={0}
              value={tariffPerNight}
              onChange={(e) => setTariffPerNight(e.target.value)}
              className="mt-2 w-full rounded-2xl border-2 border-line bg-input px-4 py-3 font-mono text-base font-bold text-ink focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="hotel-nights"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-ink-soft"
            >
              <BedIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-300" />
              <span>Number of Nights</span>
            </label>
            <input
              id="hotel-nights"
              type="number"
              min={1}
              max={60}
              value={numNights}
              onChange={(e) => setNumNights(e.target.value)}
              className="mt-2 w-full rounded-2xl border-2 border-line bg-input px-4 py-3 font-mono text-base font-bold text-ink focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="hotel-rooms"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-ink-soft"
            >
              <HotelIcon className="h-3.5 w-3.5 text-orange-600 dark:text-amber-400" />
              <span>Number of Rooms</span>
            </label>
            <input
              id="hotel-rooms"
              type="number"
              min={1}
              max={20}
              value={numRooms}
              onChange={(e) => setNumRooms(e.target.value)}
              className="mt-2 w-full rounded-2xl border-2 border-line bg-input px-4 py-3 font-mono text-base font-bold text-ink focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="ta-cta-banner mt-6 grid gap-4 rounded-2xl p-6 sm:grid-cols-3">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-muted">
              <BedIcon className="h-3.5 w-3.5" />
              <span>Base Stay Subtotal</span>
            </p>
            <p className="mt-1 font-mono text-xl font-extrabold text-ink">
              ₹{subtotal.toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              <CalculatorIcon className="h-3.5 w-3.5" />
              <span>Applicable GST ({gstPercent}%)</span>
            </p>
            <p className="mt-1 font-mono text-xl font-extrabold text-amber-800 dark:text-amber-300">
              ₹{gstAmount.toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-300">
              <RupeeBadgeIcon className="h-3.5 w-3.5" />
              <span>Total Payable Estimate</span>
            </p>
            <p className="mt-1 font-mono text-2xl font-black text-orange-700 dark:text-amber-300">
              ₹{grandTotal.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </section>

      {/* Tool 2: Transit & Check-in Planner */}
      <section
        id="transit-planner"
        className="scroll-mt-24 rounded-3xl border border-line bg-card p-6 shadow-lg shadow-black/5 dark:shadow-black/25 sm:p-8"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/18 text-amber-800 dark:text-amber-300">
            <ClockIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-ink">
              Check-In &amp; Railway / Airport Transit Stay Guide
            </h2>
            <p className="text-sm text-ink-soft">
              Align overnight train arrivals and red-eye flights with standard
              hotel check-in windows.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-line bg-subcard p-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 px-3 py-1 text-xs font-bold text-orange-800 dark:text-orange-300">
              <HotelIcon className="h-3.5 w-3.5" />
              <span>Standard Window</span>
            </span>
            <h3 className="mt-3 text-base font-extrabold text-ink">
              2:00 PM Check-In / 11:00 AM Check-Out
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
              Most business and leisure hotels in India follow a 14:00 check-in
              and 11:00 or 12:00 check-out cycle.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-subcard p-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/18 px-3 py-1 text-xs font-bold text-amber-900 dark:text-amber-300">
              <ClockIcon className="h-3.5 w-3.5" />
              <span>Early Morning Trains</span>
            </span>
            <h3 className="mt-3 text-base font-extrabold text-ink">
              Arriving Between 5 AM – 9 AM?
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
              Request complimentary luggage cloakroom storage at reception or
              check IRCTC Retiring Rooms / hourly pods at major junctions.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-subcard p-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-bold text-amber-900 dark:text-yellow-300">
              <MapPinIcon className="h-3.5 w-3.5" />
              <span>Location Tip</span>
            </span>
            <h3 className="mt-3 text-base font-extrabold text-ink">
              Verify Exact Terminal / Station Exit
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
              Multi-terminal hubs (DEL T1/T3, CSMT/LTT, JP/GADJ) can sit 8–18 km
              apart; match your hotel pin to your exact boarding point.
            </p>
          </div>
        </div>
      </section>

      {/* Tool 3: Guest ID & Booking Checklist */}
      <section
        id="stay-checklist"
        className="scroll-mt-24 rounded-3xl border border-line bg-card p-6 shadow-lg shadow-black/5 dark:shadow-black/25 sm:p-8"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500/20 text-amber-900 dark:text-yellow-300">
            <ShieldCheckIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-ink">
              Hotel Check-In Essentials in India
            </h2>
            <p className="text-sm text-ink-soft">
              Keep these guest identity and reservation rules handy at check-in.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
          {[
            "Every adult guest must carry an original physical or DigiLocker Government ID (Aadhaar, Passport, Driving Licence, or Voter ID).",
            "Note that PAN Cards are generally NOT accepted as address/identity proof at hotel check-in desks.",
            "Check whether breakfast and Wi-Fi are bundled before comparing base room tariffs.",
            "Keep your train PNR or flight PNR handy if you booked a flexible transit rate.",
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-line bg-subcard p-4"
            >
              <CheckCircleIcon className="mt-0.5 h-5 w-5 text-orange-600 dark:text-amber-400" />
              <p className="text-sm font-medium leading-relaxed text-ink">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
