import rawData from "./dgca-compensation-data.json";

export type DisruptionType =
  | "cancellation"
  | "delay"
  | "denied-boarding"
  | "baggage";

export type BlockDurationCategory =
  | "block-up-to-1h"
  | "block-1h-to-2h"
  | "block-over-2h"
  | "intl-eu-uk-long";

export type DisruptionCause =
  | "airline-operational"
  | "weather-atc-force-majeure";

export type CancellationNoticeWindow =
  | "less-than-24h"
  | "24h-to-14days"
  | "more-than-14days";

export type DelayDurationWindow =
  | "2h-to-4h"
  | "4h-to-6h"
  | "6h-to-24h"
  | "over-24h-or-overnight";

export type DeniedBoardingWindow =
  | "alt-within-1h"
  | "alt-within-24h"
  | "alt-over-24h-or-refund";

export type BaggageIssueType =
  | "domestic-loss-damage"
  | "international-loss-damage";

export interface AirlineCompensationProfile {
  iataCode?: string;
  code: string;
  name: string;
  slug: string;
  type: string;
  nodalOfficer: {
    name: string;
    email: string;
    phone: string;
  };
  appellateAuthority: {
    name: string;
    email: string;
  };
  supportEmail: string;
  planBPortalUrl: string;
  refundPortalUrl: string;
  baggagePolicyNote: string;
}

export interface DgcaCompensationInput {
  airlineCode: string;
  flightNumber?: string;
  disruptionType: DisruptionType;
  blockDuration: BlockDurationCategory;
  cause: DisruptionCause;
  cancellationNotice: CancellationNoticeWindow;
  delayWindow: DelayDurationWindow;
  deniedBoardingWindow: DeniedBoardingWindow;
  baggageIssue: BaggageIssueType;
  baggageWeightKg: number;
  baseFarePlusFuelInr: number;
  totalTicketPaidInr: number;
  passengers: number;
  alternateFlightProvided: boolean;
}

export interface DgcaCompensationResult {
  eligibleForCashCompensation: boolean;
  cashCompensationPerPassengerInr: number;
  totalCashCompensationInr: number;
  ticketRefundPerPassengerInr: number;
  totalTicketRefundInr: number;
  grandTotalClaimInr: number;
  statutoryCapLabel: string;
  legalClauseCitation: string;
  headlineVerdict: string;
  explanation: string;
  careEntitlements: Array<{
    title: string;
    eligible: boolean;
    detail: string;
  }>;
}

export const DGCA_COMPENSATION_DATASET = rawData;
export const DGCA_AIRLINE_PROFILES: AirlineCompensationProfile[] =
  rawData.airlines;

export function buildAirlineCompensationPath(slugOrCode: string): string {
  const clean = (slugOrCode || "").trim().toLowerCase();
  const matched = DGCA_AIRLINE_PROFILES.find(
    (a) => a.slug === clean || a.code.toLowerCase() === clean,
  );
  if (matched) {
    return `/air/flight-compensation/${matched.slug}`;
  }
  return `/air/flight-compensation/${clean}`;
}

export function findAirlineCompensationBySlug(
  rawSlug: string,
): AirlineCompensationProfile | null {
  const decoded = decodeURIComponent(rawSlug || "")
    .trim()
    .toLowerCase();
  if (!decoded) return null;

  const exact = DGCA_AIRLINE_PROFILES.find(
    (a) => a.slug === decoded || a.code.toLowerCase() === decoded,
  );
  if (exact) return exact;

  return (
    DGCA_AIRLINE_PROFILES.find(
      (a) =>
        decoded.includes(`-${a.code.toLowerCase()}-`) ||
        decoded.startsWith(`${a.code.toLowerCase()}-`) ||
        decoded.includes(a.name.toLowerCase().replace(/\s+/g, "-")),
    ) ?? null
  );
}

export function calculateDgcaCompensation(
  input: DgcaCompensationInput,
): DgcaCompensationResult {
  const pax = Math.max(1, Math.min(20, Math.round(input.passengers || 1)));
  const baseFare = Math.max(0, Math.round(input.baseFarePlusFuelInr || 0));
  const totalPaid = Math.max(
    baseFare,
    Math.round(input.totalTicketPaidInr || baseFare),
  );
  const isForceMajeure = input.cause === "weather-atc-force-majeure";

  // 1. FLIGHT CANCELLATION
  if (input.disruptionType === "cancellation") {
    const slabMax =
      input.blockDuration === "intl-eu-uk-long"
        ? 55200
        : input.blockDuration === "block-up-to-1h"
          ? 5000
          : input.blockDuration === "block-1h-to-2h"
            ? 7500
            : 10000;

    const statutoryCapLabel =
      input.blockDuration === "intl-eu-uk-long"
        ? "€600 (~₹55,200) under EU261 / UK261"
        : `₹${slabMax.toLocaleString("en-IN")} (or 100% of one-way basic fare + fuel charge, whichever is lower)`;

    let cashPerPax = 0;
    let headline = "";
    let explanation = "";

    if (isForceMajeure) {
      cashPerPax = 0;
      headline =
        "100% Full Ticket Refund (Zero Cancellation Fee) or Free Rebooking";
      explanation =
        "Under DGCA CAR Section 3, Series M, Part IV (Para 1.4 & 1.5), airlines are exempt from extra monetary compensation when a cancellation is caused by extraordinary circumstances beyond airline control (dense fog, severe weather, ATC closure, or security). However, the airline MUST still give you a 100% full refund with zero deduction OR a free alternate flight (Plan B).";
    } else if (input.cancellationNotice === "more-than-14days") {
      cashPerPax = 0;
      headline =
        "100% Full Refund or Free Alternate Flight (Notice ≥ 2 Weeks)";
      explanation =
        "Because the airline informed you at least 2 weeks (14 days) before scheduled departure, no additional DGCA monetary compensation applies, but you are entitled to a 100% full refund or free alternate flight.";
    } else if (
      input.alternateFlightProvided &&
      input.cancellationNotice === "24h-to-14days"
    ) {
      cashPerPax = 0;
      headline = "Alternate Flight Accepted Within Permitted Window";
      explanation =
        "If you accept an alternate flight departing within the permitted DGCA window, extra monetary compensation does not apply, though free airport meals and refreshments must be provided while waiting.";
    } else {
      cashPerPax =
        input.blockDuration === "intl-eu-uk-long"
          ? 55200
          : Math.min(slabMax, baseFare > 0 ? baseFare : slabMax);
      headline = `Eligible for ₹${cashPerPax.toLocaleString("en-IN")}/pax Cash Compensation + 100% Ticket Refund`;
      explanation =
        input.blockDuration === "intl-eu-uk-long"
          ? "Under EU Regulation 261/2004 / UK261 for India–Europe/UK flights (>3,500 km) cancelled within 14 days due to airline operations, each passenger is entitled to €600 (~₹55,200) plus a 100% ticket refund or re-routing."
          : `Under DGCA CAR Section 3, Series M, Part IV (Para 3.3.2), when a flight is cancelled less than 24 hours before departure (or without an acceptable alternate flight after <2 weeks notice) due to airline operational/technical reasons, the airline must pay ₹${cashPerPax.toLocaleString("en-IN")} per passenger (capped at ${statutoryCapLabel}) in addition to refunding the full ticket amount.`;
    }

    const refundPerPax = input.alternateFlightProvided ? 0 : totalPaid;
    const totalCash = cashPerPax * pax;
    const totalRefund = refundPerPax * pax;

    return {
      eligibleForCashCompensation: cashPerPax > 0,
      cashCompensationPerPassengerInr: cashPerPax,
      totalCashCompensationInr: totalCash,
      ticketRefundPerPassengerInr: refundPerPax,
      totalTicketRefundInr: totalRefund,
      grandTotalClaimInr: totalCash + totalRefund,
      statutoryCapLabel,
      legalClauseCitation:
        input.blockDuration === "intl-eu-uk-long"
          ? "EU Regulation 261/2004 Art. 5 & 7 / DGCA CAR Sec 3, Series M, Part IV"
          : "DGCA CAR Section 3, Series M, Part IV — Para 3.3 (Cancellation of Flight)",
      headlineVerdict: headline,
      explanation,
      careEntitlements: [
        {
          title: "100% Full Refund (Zero Cancellation Fee) or Free Plan B Rebooking",
          eligible: true,
          detail:
            "Mandatory for all airline cancellations (including dense fog/weather). Convenience fee & add-ons must be refunded on direct airline bookings.",
        },
        {
          title: "Free Airport Meals & Refreshments",
          eligible: true,
          detail:
            "Mandatory if you have already reported to the airport when the cancellation is announced.",
        },
        {
          title: `Statutory Cash Compensation (${statutoryCapLabel})`,
          eligible: cashPerPax > 0,
          detail: isForceMajeure
            ? "Exempt during ATC/Weather Force Majeure; applies only to operational/technical/commercial cancellations."
            : "Payable when cancelled <24 hrs before departure without an acceptable alternate flight.",
        },
      ],
    };
  }

  // 2. DENIED BOARDING (OVERBOOKED FLIGHT)
  if (input.disruptionType === "denied-boarding") {
    let cashPerPax = 0;
    let statutoryCapLabel = "₹0 (Alternate flight within 1 hour)";
    if (input.deniedBoardingWindow === "alt-within-24h") {
      cashPerPax = Math.min(10000, Math.round(baseFare * 2));
      statutoryCapLabel =
        "200% of one-way basic fare + airline fuel charge (Max ₹10,000)";
    } else if (input.deniedBoardingWindow === "alt-over-24h-or-refund") {
      cashPerPax = Math.min(20000, Math.round(baseFare * 4));
      statutoryCapLabel =
        "400% of one-way basic fare + airline fuel charge (Max ₹20,000)";
    }

    const refundPerPax =
      input.deniedBoardingWindow === "alt-over-24h-or-refund" &&
        !input.alternateFlightProvided
        ? totalPaid
        : 0;
    const totalCash = cashPerPax * pax;
    const totalRefund = refundPerPax * pax;

    return {
      eligibleForCashCompensation: cashPerPax > 0,
      cashCompensationPerPassengerInr: cashPerPax,
      totalCashCompensationInr: totalCash,
      ticketRefundPerPassengerInr: refundPerPax,
      totalTicketRefundInr: totalRefund,
      grandTotalClaimInr: totalCash + totalRefund,
      statutoryCapLabel,
      legalClauseCitation:
        "DGCA CAR Section 3, Series M, Part IV — Para 3.2 (Denied Boarding)",
      headlineVerdict:
        cashPerPax > 0
          ? `Eligible for ₹${cashPerPax.toLocaleString("en-IN")}/pax Denied Boarding Compensation`
          : "No Cash Compensation (Alternate Flight Departed Within 1 Hour)",
      explanation:
        "When you hold a confirmed ticket and report at the boarding gate on time but are denied boarding due to overbooking, DGCA mandates up to 200% of basic fare + fuel charge (max ₹10,000) if rebooked within 24 hours, or 400% (max ₹20,000) plus full ticket refund if no alternate flight is provided within 24 hours.",
      careEntitlements: [
        {
          title: `Mandatory Denied Boarding Compensation (${statutoryCapLabel})`,
          eligible: cashPerPax > 0,
          detail:
            "Must be paid via bank transfer/cash unless the passenger voluntarily accepts travel vouchers.",
        },
        {
          title: "Free Meals & Refreshments While Waiting for Alternate Flight",
          eligible: true,
          detail: "Mandatory at the terminal while awaiting the rebooked flight.",
        },
        {
          title: "Free Hotel Stay + Airport Transfers (If Overnight Wait)",
          eligible: input.deniedBoardingWindow === "alt-over-24h-or-refund",
          detail:
            "Mandatory if the alternate flight departs the next day or requires an overnight halt.",
        },
      ],
    };
  }

  // 3. BAGGAGE LOSS / DELAY / DAMAGE
  if (input.disruptionType === "baggage") {
    const kg = Math.max(1, Math.min(50, Math.round(input.baggageWeightKg || 15)));
    const isIntl = input.baggageIssue === "international-loss-damage";
    const cashPerPax = isIntl ? 145000 : Math.min(20000, kg * 350);
    const statutoryCapLabel = isIntl
      ? "Up to 1,288 SDR (~₹1,45,000) under the Montreal Convention"
      : "Up to ₹20,000 per passenger (₹350 per kg) under DGCA Passenger Charter";

    return {
      eligibleForCashCompensation: true,
      cashCompensationPerPassengerInr: cashPerPax,
      totalCashCompensationInr: cashPerPax * pax,
      ticketRefundPerPassengerInr: 0,
      totalTicketRefundInr: 0,
      grandTotalClaimInr: cashPerPax * pax,
      statutoryCapLabel,
      legalClauseCitation: isIntl
        ? "Montreal Convention 1999 (Article 17 & 22) & Carriage by Air Act"
        : "DGCA MoCA Passenger Charter — Section B (Lost, Delayed or Damaged Baggage)",
      headlineVerdict: `Eligible for up to ₹${cashPerPax.toLocaleString("en-IN")}/pax Baggage Compensation`,
      explanation: isIntl
        ? "For international flights under the Montreal Convention, airline liability for lost, delayed, or damaged checked baggage is capped at 1,288 Special Drawing Rights (SDR), approximately ₹1,45,000 per passenger. Always file a Property Irregularity Report (PIR) before exiting the arrival hall."
        : `For domestic Indian flights, DGCA Passenger Charter stipulates compensation up to ₹20,000 per passenger (calculated at ₹350/kg × ${kg} kg = ₹${cashPerPax.toLocaleString("en-IN")}). Always obtain a Property Irregularity Report (PIR) at the baggage belt before leaving the terminal.`,
      careEntitlements: [
        {
          title: "Property Irregularity Report (PIR) at Arrival Belt",
          eligible: true,
          detail:
            "Must be filed at the airline baggage desk inside the arrival hall before exiting the airport.",
        },
        {
          title: "Interim Essentials / Toiletries Reimbursement (Delayed Bag)",
          eligible: true,
          detail:
            "If your bag is delayed at an outstation city, keep receipts for emergency clothing and toiletries to claim reimbursement.",
        },
        {
          title: `Statutory Baggage Liability (${statutoryCapLabel})`,
          eligible: true,
          detail:
            "Payable for permanently lost or damaged checked-in baggage.",
        },
      ],
    };
  }

  // 4. FLIGHT DELAY
  const isIntlEu =
    input.blockDuration === "intl-eu-uk-long" && !isForceMajeure;
  const isOver6h =
    input.delayWindow === "6h-to-24h" ||
    input.delayWindow === "over-24h-or-overnight";
  const isOver24h = input.delayWindow === "over-24h-or-overnight";

  const cashPerPax = isIntlEu ? 55200 : 0;
  const refundPerPax =
    isOver6h && !input.alternateFlightProvided ? totalPaid : 0;
  const totalCash = cashPerPax * pax;
  const totalRefund = refundPerPax * pax;

  return {
    eligibleForCashCompensation: cashPerPax > 0,
    cashCompensationPerPassengerInr: cashPerPax,
    totalCashCompensationInr: totalCash,
    ticketRefundPerPassengerInr: refundPerPax,
    totalTicketRefundInr: totalRefund,
    grandTotalClaimInr: totalCash + totalRefund,
    statutoryCapLabel: isIntlEu
      ? "€600 (~₹55,200) under EU261 / UK261 for 3h+ arrival delay"
      : isOver24h
        ? "Free Hotel Stay + Free Meals + 100% Full Refund Option (DGCA Para 3.4)"
        : isOver6h
          ? "100% Zero-Fee Full Ticket Refund OR Free Alternate Flight + Free Meals"
          : "Mandatory Free Airport Meals & Refreshments (DGCA Para 3.4.1)",
    legalClauseCitation: isIntlEu
      ? "EU Regulation 261/2004 & DGCA CAR Section 3, Series M, Part IV (Para 3.4)"
      : "DGCA CAR Section 3, Series M, Part IV — Para 3.4 (Delays in Flight)",
    headlineVerdict: isIntlEu
      ? "Eligible for €600 (~₹55,200)/pax EU261 Delay Compensation + Free Meals"
      : isOver24h
        ? "Entitled to Free Hotel Accommodation + Free Meals + 100% Full Refund Option"
        : isOver6h
          ? "Entitled to 100% Full Refund (Zero Cancellation Fee) or Free Plan B Rebooking + Free Meals"
          : "Entitled to Mandatory Free Airport Meals & Refreshments at Boarding Gate",
    explanation: isIntlEu
      ? "For India–Europe/UK flights delayed by 3+ hours on arrival due to airline operations, EU261/UK261 entitles each passenger to €600 (~₹55,200) cash compensation."
      : isOver24h
        ? "Under DGCA CAR Section 3, Series M, Part IV (Para 3.4.3), when a domestic flight is delayed by 24+ hours (or 6+ hours on a flight scheduled between 8:00 PM and 3:00 AM), the airline MUST provide free hotel accommodation (including airport transfers), free meals, and the option of a 100% full refund."
        : isOver6h
          ? "Under DGCA CAR Para 3.4.2, when a flight is delayed by more than 6 hours, the airline must communicate the rescheduled time at least 24 hours prior and offer either a free alternate flight within 6 hours OR a 100% full refund of the ticket with zero cancellation deduction (even during fog!)."
          : "Under DGCA CAR Para 3.4.1, once a flight delay exceeds the block-time threshold (2 hours for ≤2.5h flights, 3 hours for 2.5–5h flights, or 4 hours for all flights), the airline must provide complimentary meals and refreshments at the boarding gate.",
    careEntitlements: [
      {
        title: "Complimentary Airport Meals & Refreshments",
        eligible: true,
        detail:
          "Mandatory at the boarding gate once delay crosses 2–4 hours depending on flight block time.",
      },
      {
        title: "100% Full Refund (Zero Cancellation Fee) or Free Plan B Rebooking",
        eligible: isOver6h,
        detail:
          "Mandatory once delay reaches 6+ hours — you can cancel your ticket for a 100% refund with zero airline penalty.",
      },
      {
        title: "Free Hotel Stay + Airport Transfers",
        eligible: isOver24h,
        detail:
          "Mandatory when delay exceeds 24 hours OR exceeds 6 hours on late-night flights scheduled between 20:00 and 03:00.",
      },
    ],
  };
}
