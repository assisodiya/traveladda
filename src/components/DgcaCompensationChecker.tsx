"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  type BaggageIssueType,
  type BlockDurationCategory,
  buildAirlineCompensationPath,
  type CancellationNoticeWindow,
  calculateDgcaCompensation,
  type DelayDurationWindow,
  type DeniedBoardingWindow,
  DGCA_AIRLINE_PROFILES,
  type DisruptionCause,
  type DisruptionType,
} from "@/lib/dgca-compensation-types";
import { parseFlightInput } from "@/lib/flight-types";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  CopyIcon,
  LuggageIcon,
  PlaneIcon,
  SearchIcon,
  ShieldCheckIcon,
  TicketIcon,
} from "./Icons";

interface DgcaCompensationCheckerProps {
  initialAirlineCode?: string;
}

export function DgcaCompensationChecker({
  initialAirlineCode = "6E",
}: DgcaCompensationCheckerProps) {
  const [airlineCode, setAirlineCode] = useState<string>(
    initialAirlineCode.toUpperCase(),
  );
  const [flightInput, setFlightInput] = useState<string>(
    `${initialAirlineCode.toUpperCase()} 1205`,
  );
  const [pnrInput, setPnrInput] = useState<string>("");
  const [passengerName, setPassengerName] = useState<string>("");
  const [routeLabel, setRouteLabel] = useState<string>("DEL → BOM");
  const [fetchingFlight, setFetchingFlight] = useState<boolean>(false);
  const [flightFetchNote, setFlightFetchNote] = useState<string | null>(null);

  const [disruptionType, setDisruptionType] =
    useState<DisruptionType>("cancellation");
  const [blockDuration, setBlockDuration] =
    useState<BlockDurationCategory>("block-over-2h");
  const [cause, setCause] = useState<DisruptionCause>("airline-operational");
  const [cancellationNotice, setCancellationNotice] =
    useState<CancellationNoticeWindow>("less-than-24h");
  const [delayWindow, setDelayWindow] =
    useState<DelayDurationWindow>("6h-to-24h");
  const [deniedBoardingWindow, setDeniedBoardingWindow] =
    useState<DeniedBoardingWindow>("alt-over-24h-or-refund");
  const [baggageIssue, setBaggageIssue] = useState<BaggageIssueType>(
    "domestic-loss-damage",
  );
  const [baggageWeightKg, setBaggageWeightKg] = useState<number>(15);
  const [baseFarePlusFuelInr, setBaseFarePlusFuelInr] = useState<number>(4800);
  const [totalTicketPaidInr, setTotalTicketPaidInr] = useState<number>(6200);
  const [passengers, setPassengers] = useState<number>(1);
  const [alternateFlightProvided, setAlternateFlightProvided] =
    useState<boolean>(false);
  const [copiedClaim, setCopiedClaim] = useState<boolean>(false);

  const selectedAirline = useMemo(
    () =>
      DGCA_AIRLINE_PROFILES.find((a) => a.code === airlineCode) ??
      DGCA_AIRLINE_PROFILES[0],
    [airlineCode],
  );

  const result = useMemo(
    () =>
      calculateDgcaCompensation({
        airlineCode,
        flightNumber: flightInput,
        disruptionType,
        blockDuration,
        cause,
        cancellationNotice,
        delayWindow,
        deniedBoardingWindow,
        baggageIssue,
        baggageWeightKg,
        baseFarePlusFuelInr,
        totalTicketPaidInr,
        passengers,
        alternateFlightProvided,
      }),
    [
      airlineCode,
      flightInput,
      disruptionType,
      blockDuration,
      cause,
      cancellationNotice,
      delayWindow,
      deniedBoardingWindow,
      baggageIssue,
      baggageWeightKg,
      baseFarePlusFuelInr,
      totalTicketPaidInr,
      passengers,
      alternateFlightProvided,
    ],
  );

  const handleAutoFillLiveFlight = async () => {
    const parsed = parseFlightInput(flightInput);
    const code = (parsed.extractedAirlineCode || airlineCode).toUpperCase();
    const num = parsed.extractedFlightNumber || "1205";
    setFetchingFlight(true);
    setFlightFetchNote(null);

    try {
      const res = await fetch(
        `/api/flights/status?airline=${encodeURIComponent(code)}&flightNumber=${encodeURIComponent(num)}`,
      );
      if (res.ok) {
        const json = (await res.json()) as {
          success?: boolean;
          data?: {
            airlineCode?: string;
            airlineName?: string;
            flightNumber?: string;
            legs?: Array<{
              departureAirportCode?: string;
              arrivalAirportCode?: string;
              durationMinutes?: number | null;
              statusCode?: string;
              departureDelayMinutes?: number | null;
            }>;
          };
        };
        if (json.success && json.data && json.data.legs?.length) {
          const leg = json.data.legs[0];
          if (json.data.airlineCode) {
            const matchedProfile = DGCA_AIRLINE_PROFILES.find(
              (a) => a.code === json.data?.airlineCode?.toUpperCase(),
            );
            if (matchedProfile) {
              setAirlineCode(matchedProfile.code);
            }
          }
          const dep = leg.departureAirportCode || "DEL";
          const arr = leg.arrivalAirportCode || "BOM";
          setRouteLabel(`${dep} → ${arr}`);

          const durMins = leg.durationMinutes ?? 130;
          if (durMins <= 60) {
            setBlockDuration("block-up-to-1h");
          } else if (durMins <= 120) {
            setBlockDuration("block-1h-to-2h");
          } else {
            setBlockDuration("block-over-2h");
          }

          if (leg.statusCode === "C") {
            setDisruptionType("cancellation");
          } else if ((leg.departureDelayMinutes ?? 0) >= 120) {
            setDisruptionType("delay");
          }

          setFlightFetchNote(
            `Matched ${code}-${num} (${dep} → ${arr}, Block time: ${Math.floor(durMins / 60)}h ${durMins % 60}m) — DGCA slab auto-selected.`,
          );
          return;
        }
      }
      setFlightFetchNote(
        `Applied ${code}-${num} with manual DGCA block-time slab selection below.`,
      );
    } catch {
      setFlightFetchNote(
        `Applied ${code}-${num} — select your exact block duration below.`,
      );
    } finally {
      setFetchingFlight(false);
    }
  };

  const claimEmailSubject = `Formal DGCA Compensation & Refund Claim — Flight ${flightInput.trim() || `${selectedAirline.code} Flight`} ${pnrInput.trim() ? `(PNR: ${pnrInput.trim().toUpperCase()})` : ""} — ${result.legalClauseCitation}`;

  const claimEmailBody = `To:
${selectedAirline.nodalOfficer.name} (${selectedAirline.nodalOfficer.email})
CC: ${selectedAirline.appellateAuthority.email}

Subject: ${claimEmailSubject}

Dear Nodal Officer / Customer Relations Team (${selectedAirline.name}),

I am writing to formally submit a compensation and refund claim under the Directorate General of Civil Aviation (DGCA) Civil Aviation Requirements (CAR) Section 3, Series M, Part IV ("Facilities to be provided to passengers by airlines due to denied boarding, cancellation of flights and delays in flights") and the Ministry of Civil Aviation (MoCA) Passenger Charter.

1. FLIGHT & BOOKING DETAILS:
- Airline: ${selectedAirline.name} (${selectedAirline.code})
- Flight Number: ${flightInput.trim() || `${selectedAirline.code} Flight`}
- Route: ${routeLabel}
- Booking PNR / Ticket Number: ${pnrInput.trim() ? pnrInput.trim().toUpperCase() : "[Insert 6-Character PNR]"}
- Lead Passenger Name: ${passengerName.trim() || "[Insert Passenger Full Name]"}
- Number of Passengers: ${passengers}
- Disruption Category: ${disruptionType.toUpperCase()}
- Applicable Legal Provision: ${result.legalClauseCitation}

2. STATUTORY ENTITLEMENT & CLAIM BREAKDOWN:
- Statutory Verdict: ${result.headlineVerdict}
- Applicable DGCA / Statutory Slab: ${result.statutoryCapLabel}
- Cash Compensation Claimed (${passengers} pax × ₹${result.cashCompensationPerPassengerInr.toLocaleString("en-IN")}): ₹${result.totalCashCompensationInr.toLocaleString("en-IN")}
- Ticket Refund Claimed (${passengers} pax × ₹${result.ticketRefundPerPassengerInr.toLocaleString("en-IN")}): ₹${result.totalTicketRefundInr.toLocaleString("en-IN")}
- TOTAL AMOUNT CLAIMED: ₹${result.grandTotalClaimInr.toLocaleString("en-IN")}

Kindly process the above statutory compensation and/or full refund to the original mode of payment or via NEFT/IMPS within 7 working days as mandated by DGCA CAR Section 3, Series M, Part II & Part IV, and provide a written reference number for AirSewa tracking.

Sincerely,
${passengerName.trim() || "[Your Name]"}
[Your Mobile Number]`;

  const handleCopyClaimEmail = async () => {
    try {
      await navigator.clipboard.writeText(claimEmailBody);
      setCopiedClaim(true);
      setTimeout(() => setCopiedClaim(false), 2500);
    } catch {
      // Ignore clipboard permission errors
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Calculator Card */}
      <div className="rounded-2xl border border-line bg-card p-4 shadow-md sm:p-6">
        {/* Top Row: Airline + Optional Live Flight Lookup */}
        <div className="grid gap-3.5 border-b border-line pb-5 md:grid-cols-12">
          <div className="md:col-span-5">
            <label
              htmlFor="dgca-airline-select"
              className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-muted"
            >
              1. Select Airline
            </label>
            <select
              id="dgca-airline-select"
              value={airlineCode}
              onChange={(e) => {
                const nextCode = e.target.value;
                setAirlineCode(nextCode);
                setFlightInput(`${nextCode} 1205`);
              }}
              className="mt-1.5 h-11 w-full rounded-xl border border-line-strong bg-input px-3 text-sm font-extrabold text-ink focus:border-[#1956b4] focus:outline-none"
            >
              {DGCA_AIRLINE_PROFILES.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.name} ({a.code}) — {a.type}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-7">
            <label
              htmlFor="dgca-flight-input"
              className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-muted"
            >
              Optional: Auto-Detect Block Time by Flight Number
            </label>
            <div className="mt-1.5 flex gap-2">
              <div className="relative flex-1">
                <input
                  id="dgca-flight-input"
                  type="text"
                  value={flightInput}
                  onChange={(e) => setFlightInput(e.target.value.toUpperCase())}
                  placeholder="e.g. 6E 1205, AI 865, QP 1102"
                  className="h-11 w-full rounded-xl border border-line-strong bg-input px-3.5 font-mono text-sm font-extrabold text-ink focus:border-[#1956b4] focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAutoFillLiveFlight}
                disabled={fetchingFlight}
                className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-[#1956b4] px-4 text-xs font-extrabold text-white shadow-xs transition hover:bg-[#144696] disabled:opacity-60"
              >
                <SearchIcon className="h-3.5 w-3.5" />
                <span>
                  {fetchingFlight ? "Checking..." : "Fetch Flight Slab"}
                </span>
              </button>
            </div>
            {flightFetchNote && (
              <p className="mt-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                ✓ {flightFetchNote}
              </p>
            )}
          </div>
        </div>

        {/* Disruption Type 4-Tab Selector */}
        <div className="mt-5">
          <span className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
            2. Select Flight Disruption Type
          </span>
          <div className="mt-2 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {[
              {
                id: "cancellation" as const,
                title: "Flight Cancelled",
                sub: "Up to ₹10,000 + 100% Refund",
                icon: <PlaneIcon className="h-4 w-4" />,
              },
              {
                id: "delay" as const,
                title: "Flight Delayed",
                sub: "Meals, Hotel & 6h+ Full Refund",
                icon: <ClockIcon className="h-4 w-4" />,
              },
              {
                id: "denied-boarding" as const,
                title: "Denied Boarding",
                sub: "Overbooked: Up to ₹20,000",
                icon: <TicketIcon className="h-4 w-4" />,
              },
              {
                id: "baggage" as const,
                title: "Lost / Delayed Bag",
                sub: "₹20,000 Dom / ₹1.45L Intl",
                icon: <LuggageIcon className="h-4 w-4" />,
              },
            ].map((tab) => {
              const active = disruptionType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDisruptionType(tab.id)}
                  className={`flex cursor-pointer flex-col items-start rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-[#1956b4] bg-blue-50/90 shadow-xs ring-2 ring-[#1956b4]/15 dark:border-blue-400 dark:bg-blue-950/50"
                      : "border-line bg-subcard/40 hover:border-line-strong hover:bg-subcard"
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${
                        active
                          ? "bg-[#1956b4] text-white"
                          : "bg-card text-ink-muted"
                      }`}
                    >
                      {tab.icon}
                    </span>
                    {active && (
                      <span className="rounded-full bg-[#1956b4] px-2 py-0.5 text-[10px] font-bold text-white">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs font-extrabold text-ink sm:text-sm">
                    {tab.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">{tab.sub}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Condition Controls */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Block Duration (shown for Cancellation & Delay) */}
          {(disruptionType === "cancellation" ||
            disruptionType === "delay") && (
            <div>
              <label
                htmlFor="dgca-block-duration"
                className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-muted"
              >
                Scheduled Flight Block Time
              </label>
              <select
                id="dgca-block-duration"
                value={blockDuration}
                onChange={(e) =>
                  setBlockDuration(e.target.value as BlockDurationCategory)
                }
                className="mt-1.5 h-11 w-full rounded-xl border border-line-strong bg-input px-3 text-xs font-bold text-ink sm:text-sm"
              >
                <option value="block-up-to-1h">
                  ≤ 1 Hour (Max ₹5,000 Slab — e.g. DEL–JAI)
                </option>
                <option value="block-1h-to-2h">
                  1 to 2 Hours (Max ₹7,500 Slab — e.g. DEL–LKO)
                </option>
                <option value="block-over-2h">
                  &gt; 2 Hours (Max ₹10,000 Slab — e.g. DEL–BOM/BLR)
                </option>
                <option value="intl-eu-uk-long">
                  India ↔ Europe/UK (&gt;3,500 km — €600 / ₹55,200)
                </option>
              </select>
            </div>
          )}

          {/* Cause of Disruption (Cancellation & Delay) */}
          {(disruptionType === "cancellation" ||
            disruptionType === "delay") && (
            <div>
              <label
                htmlFor="dgca-cause"
                className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-muted"
              >
                Primary Cause of Disruption
              </label>
              <select
                id="dgca-cause"
                value={cause}
                onChange={(e) => setCause(e.target.value as DisruptionCause)}
                className="mt-1.5 h-11 w-full rounded-xl border border-line-strong bg-input px-3 text-xs font-bold text-ink sm:text-sm"
              >
                <option value="airline-operational">
                  Airline Operational / Technical Snag / Crew Shortage
                </option>
                <option value="weather-atc-force-majeure">
                  Dense Fog / Bad Weather / ATC Closure (Force Majeure)
                </option>
              </select>
            </div>
          )}

          {/* Cancellation Notice Window */}
          {disruptionType === "cancellation" && (
            <div>
              <label
                htmlFor="dgca-cancel-notice"
                className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-muted"
              >
                When Did Airline Notify You?
              </label>
              <select
                id="dgca-cancel-notice"
                value={cancellationNotice}
                onChange={(e) =>
                  setCancellationNotice(
                    e.target.value as CancellationNoticeWindow,
                  )
                }
                className="mt-1.5 h-11 w-full rounded-xl border border-line-strong bg-input px-3 text-xs font-bold text-ink sm:text-sm"
              >
                <option value="less-than-24h">
                  Less than 24 Hours Before Departure (or at Airport)
                </option>
                <option value="24h-to-14days">
                  Between 24 Hours and 2 Weeks Before Departure
                </option>
                <option value="more-than-14days">
                  More than 2 Weeks (14+ Days) Before Departure
                </option>
              </select>
            </div>
          )}

          {/* Delay Window */}
          {disruptionType === "delay" && (
            <div>
              <label
                htmlFor="dgca-delay-window"
                className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-muted"
              >
                Total Flight Delay Duration
              </label>
              <select
                id="dgca-delay-window"
                value={delayWindow}
                onChange={(e) =>
                  setDelayWindow(e.target.value as DelayDurationWindow)
                }
                className="mt-1.5 h-11 w-full rounded-xl border border-line-strong bg-input px-3 text-xs font-bold text-ink sm:text-sm"
              >
                <option value="2h-to-4h">2 to 4 Hours Delay (Meals Slab)</option>
                <option value="4h-to-6h">4 to 6 Hours Delay (Meals Slab)</option>
                <option value="6h-to-24h">
                  6 to 24 Hours Delay (100% Zero-Fee Refund + Plan B)
                </option>
                <option value="over-24h-or-overnight">
                  24+ Hrs Delay OR 6h+ Night Flight (8 PM – 3 AM: Free Hotel)
                </option>
              </select>
            </div>
          )}

          {/* Denied Boarding Window */}
          {disruptionType === "denied-boarding" && (
            <div className="sm:col-span-2">
              <label
                htmlFor="dgca-db-window"
                className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-muted"
              >
                When Did the Airline Arrange an Alternate Flight?
              </label>
              <select
                id="dgca-db-window"
                value={deniedBoardingWindow}
                onChange={(e) =>
                  setDeniedBoardingWindow(
                    e.target.value as DeniedBoardingWindow,
                  )
                }
                className="mt-1.5 h-11 w-full rounded-xl border border-line-strong bg-input px-3 text-xs font-bold text-ink sm:text-sm"
              >
                <option value="alt-over-24h-or-refund">
                  Alternate Flight &gt; 24 Hours Later OR No Alternate Taken
                  (400% Basic Fare, Max ₹20,000)
                </option>
                <option value="alt-within-24h">
                  Alternate Flight Within 24 Hours (200% Basic Fare, Max
                  ₹10,000)
                </option>
                <option value="alt-within-1h">
                  Alternate Flight Departed Within 1 Hour (₹0 Cash Compensation)
                </option>
              </select>
            </div>
          )}

          {/* Baggage Controls */}
          {disruptionType === "baggage" && (
            <>
              <div>
                <label
                  htmlFor="dgca-bag-sector"
                  className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-muted"
                >
                  Flight Sector Type
                </label>
                <select
                  id="dgca-bag-sector"
                  value={baggageIssue}
                  onChange={(e) =>
                    setBaggageIssue(e.target.value as BaggageIssueType)
                  }
                  className="mt-1.5 h-11 w-full rounded-xl border border-line-strong bg-input px-3 text-xs font-bold text-ink sm:text-sm"
                >
                  <option value="domestic-loss-damage">
                    Domestic India Flight (₹350/kg up to ₹20,000)
                  </option>
                  <option value="international-loss-damage">
                    International Flight (Montreal Convention: 1,288 SDR /
                    ~₹1,45,000)
                  </option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="dgca-bag-kg"
                  className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-muted"
                >
                  Checked Bag Weight (kg)
                </label>
                <input
                  id="dgca-bag-kg"
                  type="number"
                  min={1}
                  max={50}
                  value={baggageWeightKg}
                  onChange={(e) =>
                    setBaggageWeightKg(Number(e.target.value) || 15)
                  }
                  className="mt-1.5 h-11 w-full rounded-xl border border-line-strong bg-input px-3.5 font-mono text-sm font-bold text-ink"
                />
              </div>
            </>
          )}

          {/* Fare & Passenger Inputs */}
          {disruptionType !== "baggage" && (
            <>
              <div>
                <label
                  htmlFor="dgca-base-fare"
                  className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-muted"
                >
                  One-Way Basic Fare + Fuel (₹/pax)
                </label>
                <input
                  id="dgca-base-fare"
                  type="number"
                  min={500}
                  step={100}
                  value={baseFarePlusFuelInr}
                  onChange={(e) =>
                    setBaseFarePlusFuelInr(Number(e.target.value) || 0)
                  }
                  className="mt-1.5 h-11 w-full rounded-xl border border-line-strong bg-input px-3.5 font-mono text-sm font-bold text-ink"
                />
              </div>

              <div>
                <label
                  htmlFor="dgca-total-paid"
                  className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-muted"
                >
                  Total Ticket Paid Incl. Taxes (₹/pax)
                </label>
                <input
                  id="dgca-total-paid"
                  type="number"
                  min={500}
                  step={100}
                  value={totalTicketPaidInr}
                  onChange={(e) =>
                    setTotalTicketPaidInr(Number(e.target.value) || 0)
                  }
                  className="mt-1.5 h-11 w-full rounded-xl border border-line-strong bg-input px-3.5 font-mono text-sm font-bold text-ink"
                />
              </div>
            </>
          )}

          <div>
            <label
              htmlFor="dgca-pax-count"
              className="block text-[11px] font-extrabold uppercase tracking-wider text-ink-muted"
            >
              Passengers on PNR
            </label>
            <input
              id="dgca-pax-count"
              type="number"
              min={1}
              max={15}
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value) || 1)}
              className="mt-1.5 h-11 w-full rounded-xl border border-line-strong bg-input px-3.5 font-mono text-sm font-bold text-ink"
            />
          </div>
        </div>

        {/* Toggle for Alternate Flight Taken */}
        {disruptionType !== "baggage" && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-subcard/50 px-3.5 py-2.5 text-xs">
            <label className="flex cursor-pointer items-center gap-2.5 font-semibold text-ink">
              <input
                type="checkbox"
                checked={alternateFlightProvided}
                onChange={(e) => setAlternateFlightProvided(e.target.checked)}
                className="h-4 w-4 accent-[#1956b4]"
              />
              <span>
                I accepted a free alternate flight (Plan B rebooking) instead of
                cancelling for a ticket refund
              </span>
            </label>
            <span className="font-mono text-[11px] font-bold text-[#1956b4] dark:text-blue-300">
              {result.legalClauseCitation}
            </span>
          </div>
        )}
      </div>

      {/* Verdict & Monetary Entitlement Banner */}
      <div className="overflow-hidden rounded-2xl border-2 border-[#1956b4]/30 bg-card shadow-md">
        <div className="bg-gradient-to-r from-[#0a223d] via-[#123868] to-[#1956b4] px-5 py-4 text-white sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">
              <ShieldCheckIcon className="h-3.5 w-3.5" />
              <span>Official DGCA Entitlement Verdict</span>
            </span>
            <span className="font-mono text-xs font-bold text-blue-200">
              {selectedAirline.name} ({selectedAirline.code}) · {passengers}{" "}
              {passengers === 1 ? "Passenger" : "Passengers"}
            </span>
          </div>
          <h2 className="mt-2 text-lg font-black tracking-tight sm:text-2xl">
            {result.headlineVerdict}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-200 sm:text-sm">
            {result.explanation}
          </p>
        </div>

        {/* 3-Column Financial Breakdown */}
        <div className="grid divide-y divide-line border-b border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="p-4 sm:p-5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
              Statutory Cash Compensation
            </span>
            <p className="mt-1 font-mono text-2xl font-black text-emerald-600 sm:text-3xl dark:text-emerald-400">
              ₹{result.totalCashCompensationInr.toLocaleString("en-IN")}
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">
              ₹{result.cashCompensationPerPassengerInr.toLocaleString("en-IN")}{" "}
              per passenger · {result.statutoryCapLabel}
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
              100% Ticket Refund Eligible
            </span>
            <p className="mt-1 font-mono text-2xl font-black text-[#1956b4] sm:text-3xl dark:text-blue-300">
              ₹{result.totalTicketRefundInr.toLocaleString("en-IN")}
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">
              {alternateFlightProvided
                ? "₹0 (Free Plan B alternate flight selected)"
                : `₹${result.ticketRefundPerPassengerInr.toLocaleString("en-IN")}/pax zero-deduction full refund`}
            </p>
          </div>

          <div className="bg-blue-50/50 p-4 sm:p-5 dark:bg-blue-950/25">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
              Total Claimable Value
            </span>
            <p className="mt-1 font-mono text-2xl font-black text-ink sm:text-3xl">
              ₹{result.grandTotalClaimInr.toLocaleString("en-IN")}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-ink-soft">
              Compensation + Full Refund for {passengers}{" "}
              {passengers === 1 ? "Passenger" : "Passengers"}
            </p>
          </div>
        </div>

        {/* Mandatory Care Checklist */}
        <div className="p-4 sm:p-6">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-muted">
            Mandatory Passenger Rights &amp; Airport Care Checklist
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {result.careEntitlements.map((item) => (
              <div
                key={item.title}
                className={`rounded-xl border p-3.5 ${
                  item.eligible
                    ? "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20"
                    : "border-line bg-subcard/40 opacity-75"
                }`}
              >
                <div className="flex items-start gap-2">
                  {item.eligible ? (
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
                  )}
                  <div>
                    <p className="text-xs font-extrabold text-ink">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">
                      {item.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Airline Nodal Officer Directory + 1-Click Legal Claim Email Generator */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Official Airline Nodal Officer & Escalation Contacts */}
        <div className="flex flex-col justify-between rounded-2xl border border-line bg-card p-5 shadow-xs lg:col-span-5">
          <div>
            <span className="inline-block rounded bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:bg-blue-950/60 dark:text-blue-300">
              Official DGCA Escalation Contacts
            </span>
            <h3 className="mt-2 text-base font-extrabold text-ink sm:text-lg">
              {selectedAirline.name} ({selectedAirline.code}) Nodal Officer &amp;
              Appellate Authority
            </h3>
            <p className="mt-1 text-xs text-ink-soft">
              If the airport desk or regular customer care refuses your
              statutory DGCA claim, escalate directly to:
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl border border-line bg-subcard/50 p-3">
                <p className="font-bold text-ink-muted">
                  Level 1 — Airline Nodal Officer:
                </p>
                <p className="mt-0.5 font-extrabold text-ink">
                  {selectedAirline.nodalOfficer.name}
                </p>
                <p className="mt-1 font-mono font-bold text-[#1956b4] dark:text-blue-300">
                  {selectedAirline.nodalOfficer.email}
                </p>
                <p className="mt-0.5 font-mono text-ink-soft">
                  Helpline: {selectedAirline.nodalOfficer.phone}
                </p>
              </div>

              <div className="rounded-xl border border-line bg-subcard/50 p-3">
                <p className="font-bold text-ink-muted">
                  Level 2 — Appellate Authority:
                </p>
                <p className="mt-0.5 font-extrabold text-ink">
                  {selectedAirline.appellateAuthority.name}
                </p>
                <p className="mt-1 font-mono font-bold text-[#1956b4] dark:text-blue-300">
                  {selectedAirline.appellateAuthority.email}
                </p>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-50/50 p-3 dark:bg-amber-950/20">
                <p className="font-extrabold text-amber-900 dark:text-amber-200">
                  Level 3 — Ministry of Civil Aviation AirSewa Portal
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">
                  File a statutory grievance on{" "}
                  <strong>airsewa.gov.in</strong> attaching your boarding pass /
                  PNR and the Nodal Officer email below.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
            <a
              href={selectedAirline.planBPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line-strong bg-subcard px-3 py-2.5 text-xs font-extrabold text-ink transition hover:border-[#1956b4]"
            >
              <span>{selectedAirline.name} Plan B</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </a>
            <Link
              href={buildAirlineCompensationPath(selectedAirline.slug)}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1956b4] px-3 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#144696]"
            >
              <span>{selectedAirline.name} Rules Page</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: Auto-Generated DGCA Legal Claim Email */}
        <div className="rounded-2xl border border-line bg-card p-5 shadow-xs lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Ready-to-Send Legal Claim Notice
              </span>
              <h3 className="text-base font-extrabold text-ink sm:text-lg">
                Auto-Generated DGCA CAR Compensation Claim Email
              </h3>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyClaimEmail}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#1956b4] px-3.5 py-2 text-xs font-extrabold text-white shadow-xs transition hover:bg-[#144696]"
              >
                <CopyIcon className="h-3.5 w-3.5" />
                <span>{copiedClaim ? "Copied Claim!" : "Copy Claim Text"}</span>
              </button>
              <a
                href={`mailto:${selectedAirline.nodalOfficer.email}?cc=${selectedAirline.appellateAuthority.email}&subject=${encodeURIComponent(claimEmailSubject)}&body=${encodeURIComponent(claimEmailBody)}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line-strong bg-subcard px-3.5 py-2 text-xs font-extrabold text-ink transition hover:border-[#1956b4]"
              >
                <span>Email Nodal Officer →</span>
              </a>
            </div>
          </div>

          <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
            <input
              type="text"
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              placeholder="Your Full Name (Optional)"
              className="h-9 rounded-lg border border-line bg-input px-3 text-xs font-semibold text-ink"
            />
            <input
              type="text"
              value={pnrInput}
              onChange={(e) => setPnrInput(e.target.value.toUpperCase())}
              placeholder="6-Char Airline PNR (Optional)"
              className="h-9 rounded-lg border border-line bg-input px-3 font-mono text-xs font-bold text-ink"
            />
            <input
              type="text"
              value={routeLabel}
              onChange={(e) => setRouteLabel(e.target.value.toUpperCase())}
              placeholder="Route (e.g. DEL → BOM)"
              className="h-9 rounded-lg border border-line bg-input px-3 font-mono text-xs font-bold text-ink"
            />
          </div>

          <pre className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl border border-line bg-subcard/60 p-3.5 font-mono text-[11px] leading-relaxed text-ink-soft">
            {claimEmailBody}
          </pre>
        </div>
      </div>
    </div>
  );
}

