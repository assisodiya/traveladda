"use client";

import { useState } from "react";
import {
  CalculatorIcon,
  CheckCircleIcon,
  ClockIcon,
  HotelIcon,
  MapPinIcon,
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
        className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 sm:p-8"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
            <CalculatorIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Indian Hotel Tariff &amp; GST Calculator
            </h2>
            <p className="text-sm text-slate-600">
              Calculate exact room taxes across official 0%, 12%, and 18% GST
              tariff brackets.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="hotel-rate"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700"
            >
              Room Tariff / Night (₹)
            </label>
            <input
              id="hotel-rate"
              type="number"
              min={0}
              value={tariffPerNight}
              onChange={(e) => setTariffPerNight(e.target.value)}
              className="mt-2 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 font-mono text-base font-bold text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="hotel-nights"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700"
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
              className="mt-2 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 font-mono text-base font-bold text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="hotel-rooms"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700"
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
              className="mt-2 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 font-mono text-base font-bold text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 rounded-2xl bg-slate-900 p-6 text-white sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Base Stay Subtotal
            </p>
            <p className="mt-1 font-mono text-xl font-extrabold text-white">
              ₹{subtotal.toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">
              Applicable GST ({gstPercent}%)
            </p>
            <p className="mt-1 font-mono text-xl font-extrabold text-sky-300">
              ₹{gstAmount.toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Total Payable Estimate
            </p>
            <p className="mt-1 font-mono text-2xl font-black text-emerald-300">
              ₹{grandTotal.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </section>

      {/* Tool 2: Transit & Check-in Planner */}
      <section
        id="transit-planner"
        className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 sm:p-8"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <ClockIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Check-In &amp; Railway / Airport Transit Stay Guide
            </h2>
            <p className="text-sm text-slate-600">
              Align overnight train arrivals and red-eye flights with standard
              hotel check-in windows.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-900">
              <HotelIcon className="h-3.5 w-3.5" />
              <span>Standard Window</span>
            </span>
            <h3 className="mt-3 text-base font-extrabold text-slate-900">
              2:00 PM Check-In / 11:00 AM Check-Out
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Most business and leisure hotels in India follow a 14:00 check-in
              and 11:00 or 12:00 check-out cycle.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-900">
              <ClockIcon className="h-3.5 w-3.5" />
              <span>Early Morning Trains</span>
            </span>
            <h3 className="mt-3 text-base font-extrabold text-slate-900">
              Arriving Between 5 AM – 9 AM?
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Request complimentary luggage cloakroom storage at reception or
              check IRCTC Retiring Rooms / hourly pods at major junctions.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-900">
              <MapPinIcon className="h-3.5 w-3.5" />
              <span>Location Tip</span>
            </span>
            <h3 className="mt-3 text-base font-extrabold text-slate-900">
              Verify Exact Terminal / Station Exit
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Multi-terminal hubs (DEL T1/T3, CSMT/LTT, JP/GADJ) can sit 8–18 km
              apart; match your hotel pin to your exact boarding point.
            </p>
          </div>
        </div>
      </section>

      {/* Tool 3: Guest ID & Booking Checklist */}
      <section
        id="stay-checklist"
        className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 sm:p-8"
      >
        <h2 className="text-xl font-extrabold text-slate-900">
          Hotel Check-In Essentials in India
        </h2>
        <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
          {[
            "Every adult guest must carry an original physical or DigiLocker Government ID (Aadhaar, Passport, Driving Licence, or Voter ID).",
            "Note that PAN Cards are generally NOT accepted as address/identity proof at hotel check-in desks.",
            "Check whether breakfast and Wi-Fi are bundled before comparing base room tariffs.",
            "Keep your train PNR or flight PNR handy if you booked a flexible transit rate.",
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <CheckCircleIcon className="mt-0.5 h-5 w-5 text-teal-600" />
              <p className="text-sm font-medium leading-relaxed text-slate-800">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

