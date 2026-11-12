"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircleIcon,
  ClockIcon,
  CopyIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@/components/Icons";
import {
  BookingSource,
  CLASS_RULES,
  ComputedRefundResult,
  computeRailRefund,
  DEFAULT_REFUND_STATE,
  extractFareAndFees,
  formatINR,
  getBookingFeeConfig,
  PaymentMethod,
  REFUND_SEO_SCENARIOS,
  RefundCalculatorState,
  SAMPLE_PRS_JSON_STRING,
  STATUS_META,
  TicketStatusCode,
  TravelClassCode,
  VERIFIED_TEST_CASES,
} from "@/lib/rail-refund-service";

interface RailRefundCalculatorProps {
  initialState?: Partial<RefundCalculatorState>;
  initialResult: ComputedRefundResult;
  activeScenarioSlug?: string;
}

function generateDeterministicQrMatrix(seedText: string): boolean[][] {
  const size = 21;
  const grid: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        if (r0 + r < size && c0 + c < size) {
          grid[r0 + r][c0 + c] = isBorder || isInner;
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  let hash = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    hash ^= seedText.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;

      hash ^= (r * 31 + c * 17) & 0xff;
      hash = Math.imul(hash, 16777619);
      grid[r][c] = (Math.abs(hash) % 10) < 5;
    }
  }

  return grid;
}

export default function RailRefundCalculator({
  initialState,
  initialResult,
  activeScenarioSlug,
}: RailRefundCalculatorProps) {
  const [state, setState] = useState<RefundCalculatorState>(() => ({
    ...DEFAULT_REFUND_STATE,
    ...initialState,
  }));

  const [activePresetBadge, setActivePresetBadge] = useState<string>(
    "Verified PRS JSON Case: SBC Vande Bharat CC (PNR 4347417217 • 14h 50m • ₹355 Cut)"
  );
  const [cancelDateInput, setCancelDateInput] = useState<string>(
    "2026-11-02T16:55"
  );
  const [departureDateInput, setDepartureDateInput] = useState<string>(
    "2026-11-03T07:45"
  );

  // JSON Modal State
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [jsonInputText, setJsonInputText] = useState(SAMPLE_PRS_JSON_STRING);
  const [jsonFeedback, setJsonFeedback] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const isHindi = lang === "hi";

  const result = useMemo(() => {
    const isUnchangedFromInitial =
      state.ruleRegime === initialResult.state.ruleRegime &&
      state.bookingSource === initialResult.state.bookingSource &&
      state.paymentMethod === initialResult.state.paymentMethod &&
      state.pgEnabled === initialResult.state.pgEnabled &&
      state.fareInputMode === initialResult.state.fareInputMode &&
      state.travelClass === initialResult.state.travelClass &&
      state.ticketStatus === initialResult.state.ticketStatus &&
      state.totalPassengers === initialResult.state.totalPassengers &&
      state.cancelPassengers === initialResult.state.cancelPassengers &&
      state.enteredTotalAmount === initialResult.state.enteredTotalAmount &&
      state.pureTotalFareEntered === initialResult.state.pureTotalFareEntered &&
      state.hasCatering === initialResult.state.hasCatering &&
      state.totalCateringFee === initialResult.state.totalCateringFee &&
      state.hasInsurance === initialResult.state.hasInsurance &&
      state.insurancePerPax === initialResult.state.insurancePerPax &&
      state.insuranceRefundable === initialResult.state.insuranceRefundable &&
      state.hoursBeforeDeparture === initialResult.state.hoursBeforeDeparture &&
      state.chartPrepared === initialResult.state.chartPrepared &&
      state.roundToNextFive === initialResult.state.roundToNextFive;

    return isUnchangedFromInitial ? initialResult : computeRailRefund(state);
  }, [state, initialResult]);

  const isRegularRegime = state.ruleRegime === "ACTUAL_48H";
  const bookingFees = getBookingFeeConfig(state);

  const syncDatesFromHours = (hoursGap: number) => {
    if (Math.abs(hoursGap - 14.83) < 0.05) {
      setCancelDateInput("2026-11-02T16:55");
      setDepartureDateInput("2026-11-03T07:45");
      return;
    }
    const baseCancel = new Date("2026-11-12T10:00:00");
    const dep = new Date(baseCancel.getTime() + hoursGap * 3600 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
      )}:${pad(d.getMinutes())}`;
    setCancelDateInput(fmt(baseCancel));
    setDepartureDateInput(fmt(dep));
  };

  const handleDatePickerChange = (newCancel: string, newDep: string) => {
    setCancelDateInput(newCancel);
    setDepartureDateInput(newDep);
    if (newCancel && newDep) {
      const diffMs =
        new Date(newDep).getTime() - new Date(newCancel).getTime();
      const hours = Math.max(0, Number((diffMs / (1000 * 3600)).toFixed(2)));
      setState((prev) => ({
        ...prev,
        hoursBeforeDeparture: hours,
      }));
    }
  };

  const handleLoadTestCase = (tcId: string) => {
    const found = VERIFIED_TEST_CASES.find((t) => t.id === tcId);
    if (!found) return;
    const nextState: RefundCalculatorState = {
      ...state,
      ...found.state,
    };
    setState(nextState);
    setActivePresetBadge(found.badgeTitle);
    syncDatesFromHours(nextState.hoursBeforeDeparture);
  };

  const handleTotalPassengersChange = (newTotal: number) => {
    const clampedTotal = Math.max(1, Math.min(12, newTotal || 1));
    setState((prev) => {
      const nextCancel = Math.min(prev.cancelPassengers, clampedTotal);
      const nextPureTotal =
        prev.fareInputMode === "PURE_FARE"
          ? Number((prev.purePerPaxFareEntered * clampedTotal).toFixed(2))
          : prev.pureTotalFareEntered;
      const nextCateringTotal = prev.hasCatering
        ? Number((prev.perPaxCateringFee * clampedTotal).toFixed(2))
        : prev.totalCateringFee;
      return {
        ...prev,
        totalPassengers: clampedTotal,
        cancelPassengers: nextCancel,
        pureTotalFareEntered: nextPureTotal,
        totalCateringFee: nextCateringTotal,
      };
    });
  };

  const handleApplyJson = () => {
    try {
      const data = JSON.parse(jsonInputText.trim());
      const rbResp = data.RBresponse || {};
      const tktRes = data.RBTktres || {};
      const comm = data.commercials || {};

      const totalFare = Number(rbResp.totalFare || tktRes.totalFare || 1395);
      const catCharge = Number(rbResp.cateringCharge || 0);
      const pureTrainFare = totalFare - catCharge;
      const paxCount = Number(tktRes.numberOfAdults || 1);
      const agentFee = Number(
        comm.TravelAgentFee ?? tktRes.taServiceCharge ?? 40
      );
      const pgCharge = Number(comm.pgCharge ?? 0);
      const irctcFee = Number(tktRes.serviceChargeTotal || 35.4);

      const classCode = String(
        rbResp.enqClass || tktRes.journeyClass || "CC"
      ).toUpperCase();
      let mappedClass: TravelClassCode = "3AC";
      if (classCode === "1A" || classCode === "EC") mappedClass = "1AC";
      else if (classCode === "2A" || classCode === "FC") mappedClass = "2AC";
      else if (classCode === "SL") mappedClass = "SL";
      else if (classCode === "2S") mappedClass = "2S";

      setState((prev) => ({
        ...prev,
        bookingSource: agentFee > 0 ? "AGENT" : "PERSONAL",
        pgEnabled: pgCharge > 0,
        travelClass: mappedClass,
        totalPassengers: paxCount,
        cancelPassengers: paxCount,
        hasCatering: catCharge > 0,
        totalCateringFee: catCharge,
        perPaxCateringFee: Number((catCharge / paxCount).toFixed(2)),
        pureTotalFareEntered: pureTrainFare,
        purePerPaxFareEntered: Number((pureTrainFare / paxCount).toFixed(2)),
        enteredTotalAmount: Number(
          (totalFare + irctcFee + pgCharge + agentFee).toFixed(2)
        ),
      }));

      setJsonFeedback({
        ok: true,
        message: "PRS / IRCTC Ticket JSON parsed and applied!",
      });
      setTimeout(() => {
        setIsJsonModalOpen(false);
        setJsonFeedback(null);
      }, 650);
    } catch {
      setJsonFeedback({
        ok: false,
        message: "Invalid JSON format. Please paste a valid IRCTC/PRS JSON object.",
      });
    }
  };

  const buildReceiptShareText = () => {
    const scenarioPath = activeScenarioSlug
      ? `https://traveladda.in/rail/refund-calculator/${activeScenarioSlug}`
      : "https://traveladda.in/rail/refund-calculator";
    return [
      isHindi
        ? `🚆 *IRCTC / भारतीय रेलवे टिकट रिफंड रसीद (TravelAdda PRS Verified)*`
        : `🚆 *IRCTC / Indian Railways Refund Receipt (TravelAdda PRS Verified)*`,
      `• ${isHindi ? "बुकिंग व स्टेटस" : "Mode & Status"}: ${state.bookingSource} • ${result.classConfig.shortName} • ${STATUS_META[state.ticketStatus].shortLabel}`,
      `• ${isHindi ? "नियम (Regime)" : "Regime"}: ${
        isRegularRegime
          ? isHindi
            ? "सामान्य ट्रेन / वंदे भारत चेयर कार (48h / 12h / 4h)"
            : "Regular Trains (48h / 12h / 4h)"
          : isHindi
          ? "वंदे भारत स्लीपर / अमृत भारत II (72h / 8h गजट)"
          : "Vande Bharat Sleeper / Amrit Bharat II (72h / 8h Gazette)"
      }`,
      `• ${isHindi ? "ग्राहक द्वारा कुल भुगतान (Grand Total)" : "Grand Total Paid"}: ${formatINR(result.extracted.grandTotalPaid)}`,
      `• ${isHindi ? `शुद्ध रेलवे किराया (${result.cancellingPax} यात्री)` : `Pure Railway Fare (${result.cancellingPax} Pax)`}: ${formatINR(
        result.totalCancellingTicketFare
      )}`,
      `• ${isHindi ? "रेलवे कैंसिलेशन कटौती (PRS Cut)" : "PRS Cancellation Deduction"}: -${formatINR(result.finalRailwayCut)} (${
        result.perPaxFormulaStr
      })`,
      `• *${isHindi ? "बैंक में आने वाला कुल रिफंड" : "Final Net Bank Refund"}: ${formatINR(result.totalNetRefund)}* (${formatINR(
        result.perPaxNetRefund
      )}/Pax)`,
      `🔗 ${isHindi ? "अपना रिफंड चेक करें" : "Check live PRS refund"}: ${scenarioPath}`,
    ].join("\n");
  };

  const handleCopyRefundReceipt = () => {
    const text = buildReceiptShareText();

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2200);
    }
  };

  const handleWhatsAppShare = () => {
    const text = buildReceiptShareText();
    if (typeof window !== "undefined") {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(text)}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  const qrMatrix = useMemo(
    () =>
      generateDeterministicQrMatrix(
        `${state.ruleRegime}-${state.bookingSource}-${state.travelClass}-${state.ticketStatus}-${result.totalNetRefund}-${result.finalRailwayCut}`
      ),
    [
      state.ruleRegime,
      state.bookingSource,
      state.travelClass,
      state.ticketStatus,
      result.totalNetRefund,
      result.finalRailwayCut,
    ]
  );

  return (
    <div className="space-y-6">
      {/* Top Action & Gazette Regime Switcher Bar */}
      <div className="rounded-2xl border border-amber-300/80 bg-amber-50/90 p-4 shadow-xs dark:border-amber-500/30 dark:bg-amber-950/30">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#1956b4] px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-white">
                {isHindi
                  ? "भारत का राजपत्र G.S.R. 41(E) — 16 जनवरी 2026"
                  : "Gazette of India G.S.R. 41(E) — 16 Jan 2026"}
              </span>
              <span className="text-xs font-extrabold text-ink sm:text-sm">
                {isHindi
                  ? "72-घंटे और 8-घंटे का नियम केवल 2 ट्रेनों पर लागू — बाकी सभी ट्रेनों में 48h / 12h / 4h नियम!"
                  : "72-Hour & 8-Hour Rule Applies ONLY to 2 Trains — Regular Trains Follow 48h / 12h / 4h!"}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-ink-soft">
              {isHindi ? (
                <>
                  रेल मंत्रालय गजट अधिसूचना <strong>G.S.R. 41(E)</strong> के अनुसार:{" "}
                  <strong>1. वंदे भारत स्लीपर एक्सप्रेस</strong> और{" "}
                  <strong>2. अमृत भारत II एक्सप्रेस</strong> में{" "}
                  <strong>&gt;72h (25% कटौती, कोई फ्लैट शुल्क नहीं)</strong>,{" "}
                  <strong>72h से 8h (50% कटौती)</strong> और{" "}
                  <strong>&lt;8h या चार्ट के बाद (₹0 रिफंड)</strong> लागू है। अन्य सभी ट्रेनों{" "}
                  <strong>
                    (सामान्य वंदे भारत चेयर कार CC/EC, राजधानी, शताब्दी, दुरंतो, मेल/एक्सप्रेस)
                  </strong>{" "}
                  में{" "}
                  <strong>
                    &gt;48h फ्लैट शुल्क, 48h–12h (25% कटौती), &lt;12h से ≥4h चार्ट बनने से पहले (50% कटौती), और चार्ट बनने के बाद / &lt;4h (₹0 रिफंड)
                  </strong>{" "}
                  लागू है।
                </>
              ) : (
                <>
                  Under Ministry of Railways Gazette Notification{" "}
                  <strong>G.S.R. 41(E)</strong>: <strong>1. Vande Bharat Sleeper Express</strong> and{" "}
                  <strong>2. Amrit Bharat II Express</strong> deduct{" "}
                  <strong>25% (&gt;72h, no flat fee)</strong>,{" "}
                  <strong>50% (72h to 8h)</strong>, and{" "}
                  <strong>₹0 (&lt;8h or post-chart)</strong>. All other trains{" "}
                  <strong>
                    (Regular Vande Bharat Chair Car CC/EC, Rajdhani, Shatabdi, Duronto, Mail/Express)
                  </strong>{" "}
                  follow:{" "}
                  <strong>
                    &gt;48h Flat Fee, 48h–12h (25% Cut), &lt;12h to ≥4h if Chart Not Prepared (50% Cut), and Post-Chart / &lt;4h (₹0 Refund)
                  </strong>
                  .
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Language Toggle: English / हिंदी */}
            <div
              role="group"
              aria-label="Language Switcher"
              className="inline-flex rounded-xl border border-[#1956b4]/30 bg-card p-1 shadow-2xs"
            >
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-extrabold transition ${
                  !isHindi
                    ? "bg-[#1956b4] text-white shadow-2xs"
                    : "text-ink-soft hover:bg-subcard"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang("hi")}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-extrabold transition ${
                  isHindi
                    ? "bg-[#fc6203] text-white shadow-2xs"
                    : "text-ink-soft hover:bg-subcard"
                }`}
              >
                हिंदी
              </button>
            </div>

            <div className="inline-flex flex-wrap rounded-xl border border-line bg-card p-1 shadow-2xs">
              <button
                type="button"
                onClick={() =>
                  setState((prev) => ({ ...prev, ruleRegime: "ACTUAL_48H" }))
                }
                className={`rounded-lg px-3 py-2 text-left text-xs font-extrabold transition ${
                  isRegularRegime
                    ? "bg-[#1956b4] text-white shadow-2xs"
                    : "text-ink-soft hover:bg-subcard"
                }`}
              >
                {isHindi
                  ? "सामान्य ट्रेन / वंदे भारत CC (48h / 12h / 4h)"
                  : "Regular Trains / Vande Bharat CC (48h / 12h / 4h)"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    ruleRegime: "VB_SLEEPER_72H",
                  }))
                }
                className={`rounded-lg px-3 py-2 text-left text-xs font-extrabold transition ${
                  !isRegularRegime
                    ? "bg-rose-600 text-white shadow-2xs"
                    : "text-ink-soft hover:bg-subcard"
                }`}
              >
                {isHindi
                  ? "वंदे भारत स्लीपर / अमृत भारत II (72h / 8h)"
                  : "Vande Bharat Sleeper / Amrit Bharat II (72h / 8h)"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1-Click Verified PRS Test Cases Bar + JSON Paste & Rounding Controls */}
      <div className="rounded-2xl border border-line bg-card p-3.5 shadow-xs sm:p-4">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#1956b4]/10 px-2.5 py-1 text-xs font-extrabold text-[#1956b4] dark:bg-blue-500/20 dark:text-blue-300">
              <SparklesIcon className="h-3.5 w-3.5 text-[#fc6203]" />
              1-Click Verified PRS Test Cases
            </span>
            <span className="text-xs font-bold text-ink-soft">
              {activePresetBadge}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  roundToNextFive: !prev.roundToNextFive,
                }))
              }
              className={`rounded-xl border px-3 py-1.5 text-xs font-extrabold transition ${
                state.roundToNextFive
                  ? "border-emerald-500/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "border-line bg-subcard text-ink-muted"
              }`}
            >
              ₹5 Double Rounding: {state.roundToNextFive ? "ON (PRS Exact)" : "OFF (Raw)"}
            </button>

            <button
              type="button"
              onClick={() => setIsJsonModalOpen(true)}
              className="rounded-xl border border-[#1956b4]/30 bg-blue-50/70 px-3 py-1.5 text-xs font-extrabold text-[#1956b4] transition hover:bg-blue-100/70 dark:bg-blue-500/15 dark:text-blue-300"
            >
              Paste IRCTC / PRS JSON
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
          {VERIFIED_TEST_CASES.map((tc) => (
            <button
              key={tc.id}
              type="button"
              onClick={() => handleLoadTestCase(tc.id)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                tc.isHighlight
                  ? "border-amber-400 bg-amber-400/20 text-amber-950 hover:bg-amber-400/30 dark:text-amber-200"
                  : tc.isGazette
                  ? "border-rose-400/50 bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 dark:text-rose-300"
                  : "border-line bg-subcard/70 text-ink-soft hover:border-[#1956b4] hover:text-[#1956b4] dark:hover:text-blue-300"
              }`}
            >
              {tc.buttonLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Main 12-Column Grid: Left Controls (7 cols) + Right Sticky Live PRS Receipt (5 cols) */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: 4 Step-by-Step Interactive Calculator Cards */}
        <div className="space-y-5 lg:col-span-7">
          {/* STEP 1: Booking Source (Personal vs Agent RSP vs Counter) */}
          <div className="space-y-4 rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink sm:text-base">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1956b4] text-xs font-extrabold text-white">
                  1
                </span>
                {isHindi
                  ? "टिकट कहाँ से बुक किया गया है? (Booking Source)"
                  : "Where Was the Ticket Booked? (Booking Source)"}
              </h2>
              <span className="rounded-lg border border-blue-200 bg-blue-50/80 px-2.5 py-1 text-[11px] font-bold text-[#1956b4] dark:border-blue-500/30 dark:bg-blue-950/50 dark:text-blue-300">
                {state.bookingSource === "AGENT"
                  ? `Agent ID: IRCTC ${formatINR(bookingFees.irctcFee)} + Agent ${formatINR(
                      bookingFees.agentFee
                    )} + PG (${result.extracted.pgBase <= 2000 ? "0.75%" : "1%"})`
                  : state.bookingSource === "PERSONAL"
                  ? `Personal ID (${state.paymentMethod}): IRCTC ${formatINR(
                      bookingFees.irctcFee
                    )} • ₹0 PG Fee`
                  : "Railway Counter (PRS): ₹0 Extra Booking Fee"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {(
                [
                  {
                    id: "PERSONAL" as BookingSource,
                    title: isHindi
                      ? "Personal IRCTC ID (व्यक्तिगत)"
                      : "Personal IRCTC ID",
                    sub: isHindi
                      ? "केवल IRCTC शुल्क • ₹0 PG शुल्क"
                      : "Only IRCTC Fee • ₹0 PG Charge",
                  },
                  {
                    id: "AGENT" as BookingSource,
                    title: isHindi
                      ? "Agent ID (अधिकृत एजेंट / CSC)"
                      : "Agent ID (RSP / CSC)",
                    sub: isHindi
                      ? "IRCTC + एजेंट ₹40/₹20 + PG 0.75%/1%"
                      : "IRCTC + Agent ₹40/₹20 + PG 0.75%/1%",
                  },
                  {
                    id: "COUNTER" as BookingSource,
                    title: isHindi
                      ? "Railway Counter (रेलवे काउंटर)"
                      : "Railway Counter (PRS)",
                    sub: isHindi
                      ? "शून्य IRCTC / एजेंट / PG शुल्क"
                      : "Zero IRCTC / Agent / PG Fees",
                  },
                ]
              ).map((src) => {
                const active = state.bookingSource === src.id;
                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() =>
                      setState((prev) => ({ ...prev, bookingSource: src.id }))
                    }
                    className={`rounded-xl border p-3 text-left transition ${
                      active
                        ? "border-[#1956b4] bg-blue-50/70 ring-2 ring-[#1956b4]/15 dark:border-blue-400 dark:bg-blue-950/40"
                        : "border-line bg-subcard/50 hover:border-[#1956b4]/50"
                    }`}
                  >
                    <div className="text-xs font-extrabold text-ink sm:text-sm">
                      {src.title}
                    </div>
                    <div className="mt-0.5 text-[11px] text-ink-muted">
                      {src.sub}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Personal Payment Mode Sub-Bar */}
            {state.bookingSource === "PERSONAL" && (
              <div className="flex flex-col justify-between gap-2.5 rounded-xl border border-indigo-200/80 bg-indigo-50/60 p-3 sm:flex-row sm:items-center dark:border-indigo-500/30 dark:bg-indigo-950/30">
                <div>
                  <div className="text-xs font-extrabold text-ink">
                    Personal ID Payment Mode (IRCTC Convenience Fee):
                  </div>
                  <div className="text-[11px] text-ink-muted">
                    UPI attracts lower IRCTC convenience fee (PG charge remains ₹0)
                  </div>
                </div>
                <div className="inline-flex shrink-0 rounded-xl border border-line bg-card p-1">
                  {(
                    [
                      {
                        id: "CARD" as PaymentMethod,
                        label: "Card / NetBanking (₹35.40 / ₹17.70)",
                      },
                      {
                        id: "UPI" as PaymentMethod,
                        label: "BHIM / UPI (₹11.80)",
                      },
                    ]
                  ).map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() =>
                        setState((prev) => ({ ...prev, paymentMethod: pm.id }))
                      }
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        state.paymentMethod === pm.id
                          ? "bg-[#1956b4] text-white"
                          : "text-ink-soft hover:bg-subcard"
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Agent PG Controls Sub-Bar */}
            {state.bookingSource === "AGENT" && (
              <div className="flex flex-col justify-between gap-2.5 rounded-xl border border-amber-300/80 bg-amber-50/70 p-3 sm:flex-row sm:items-center dark:border-amber-500/30 dark:bg-amber-950/30">
                <div>
                  <div className="text-xs font-extrabold text-ink">
                    Agent Payment Gateway (PG) Rule:{" "}
                    <span className="font-normal text-ink-soft">
                      Applied on (Train Fare + Catering + IRCTC Fee + Insurance)
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-muted">
                    If PG Base <strong>≤ ₹2,000 → 0.75%</strong> | If PG Base{" "}
                    <strong>&gt; ₹2,000 → 1.00%</strong> (Agent ₹40/₹20 fee is outside PG Base)
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setState((prev) => ({ ...prev, pgEnabled: !prev.pgEnabled }))
                  }
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                    state.pgEnabled
                      ? "bg-amber-600 text-white hover:bg-amber-700"
                      : "bg-subcard text-ink-muted hover:bg-line"
                  }`}
                >
                  {state.pgEnabled
                    ? "PG Charge: ON (Auto 0.75% / 1%)"
                    : "PG Charge: OFF (₹0)"}
                </button>
              </div>
            )}
          </div>

          {/* STEP 2: Coach Class & Ticket Status */}
          <div className="space-y-4 rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-5">
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink sm:text-base">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1956b4] text-xs font-extrabold text-white">
                2
              </span>
              {isHindi
                ? "कोच श्रेणी (Class) और वर्तमान टिकट स्थिति चुनें"
                : "Select Coach Class & Current Ticket Status"}
            </h2>

            {/* Coach Class Grid */}
            <div>
              <label className="mb-2 block text-xs font-bold text-ink-soft">
                Coach Travel Class:
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {(Object.keys(CLASS_RULES) as TravelClassCode[]).map((code) => {
                  const rule = CLASS_RULES[code];
                  const active = state.travelClass === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() =>
                        setState((prev) => ({ ...prev, travelClass: code }))
                      }
                      className={`rounded-xl border p-2.5 text-left transition ${
                        active
                          ? "border-[#1956b4] bg-blue-50/70 ring-2 ring-[#1956b4]/15 dark:border-blue-400 dark:bg-blue-950/40"
                          : "border-line bg-subcard/50 hover:border-[#1956b4]/50"
                      }`}
                    >
                      <div className="text-xs font-extrabold text-ink">
                        {rule.shortName}
                      </div>
                      <div className="mt-0.5 text-[10px] text-ink-muted">
                        {rule.isAC
                          ? `Flat: ₹${rule.flatFee}+GST (₹${rule.flatWithGstRounded})`
                          : `Flat: ₹${rule.flatFee} (No GST)`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ticket Status Grid */}
            <div>
              <label className="mb-2 block text-xs font-bold text-ink-soft">
                Ticket Status at Time of Cancellation:
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {(Object.keys(STATUS_META) as TicketStatusCode[]).map(
                  (statusKey) => {
                    const meta = STATUS_META[statusKey];
                    const active = state.ticketStatus === statusKey;
                    return (
                      <button
                        key={statusKey}
                        type="button"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            ticketStatus: statusKey,
                          }))
                        }
                        className={`rounded-xl border p-2.5 text-left transition ${
                          active
                            ? "border-[#1956b4] bg-blue-50/70 ring-2 ring-[#1956b4]/15 dark:border-blue-400 dark:bg-blue-950/40"
                            : "border-line bg-subcard/50 hover:border-[#1956b4]/50"
                        }`}
                      >
                        <div className="text-xs font-extrabold text-ink">
                          {meta.shortLabel}
                        </div>
                        <div className="mt-0.5 text-[10px] text-ink-muted">
                          {meta.sublabel}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* STEP 3: Cancellation Timing Window & Date-Time Pickers */}
          <div className="space-y-4 rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink sm:text-base">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1956b4] text-xs font-extrabold text-white">
                  3
                </span>
                {isHindi
                  ? "टिकट कब कैंसिल किया जा रहा है? (प्रस्थान से पहले का समय)"
                  : "When Was the Ticket Cancelled? (Time Before Departure)"}
              </h2>
              <span className="rounded-lg border border-amber-300 bg-amber-100/80 px-2.5 py-1 text-xs font-extrabold text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/50 dark:text-amber-200">
                Gap: {result.hoursWhole}h {result.minutesRemainder}m (
                {result.slabShortLabel})
              </span>
            </div>

            {/* Quick Slab Selector Buttons */}
            <div>
              <label className="mb-2 block text-xs font-bold text-ink-soft">
                {isRegularRegime
                  ? "Quick Time-Slab Selection (Regular Trains & Vande Bharat CC — 48h / 12h / 4h):"
                  : "Quick Time-Slab Selection (Vande Bharat Sleeper & Amrit Bharat II — Gazette G.S.R. 41(E)):"}
              </label>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {[
                  {
                    hours: 80,
                    title: isRegularRegime ? "> 48 Hours" : "> 72 Hours",
                    sub: isRegularRegime
                      ? "Flat Fee (₹190/₹120)"
                      : "25% Cut (No Flat Fee!)",
                    isMatch: isRegularRegime
                      ? state.hoursBeforeDeparture > 48
                      : state.hoursBeforeDeparture > 72,
                  },
                  {
                    hours: 14.83,
                    title: isRegularRegime ? "48h to 12h" : "72h to 24h",
                    sub: isRegularRegime
                      ? "25% Cut (JSON: 14h 50m)"
                      : "50% Cut (72h–8h Slab)",
                    isMatch: isRegularRegime
                      ? state.hoursBeforeDeparture <= 48 &&
                        state.hoursBeforeDeparture >= 12
                      : state.hoursBeforeDeparture <= 72 &&
                        state.hoursBeforeDeparture >= 24,
                  },
                  {
                    hours: 9,
                    title: isRegularRegime
                      ? "<12h to ≥4h (No Chart)"
                      : "24h to 8h (No Chart)",
                    sub: "50% Cut (Chart Not Prepared)",
                    isMatch: isRegularRegime
                      ? state.hoursBeforeDeparture < 12 &&
                        state.hoursBeforeDeparture >= 4
                      : state.hoursBeforeDeparture < 24 &&
                        state.hoursBeforeDeparture >= 8,
                  },
                  {
                    hours: 2,
                    title: isRegularRegime
                      ? "Post-Chart / <4h"
                      : "Post-Chart / <8h",
                    sub: "CNF: ₹0 | RAC/WL: Refund",
                    isMatch: isRegularRegime
                      ? state.hoursBeforeDeparture < 4 &&
                        state.hoursBeforeDeparture >= 0.5
                      : state.hoursBeforeDeparture < 8 &&
                        state.hoursBeforeDeparture >= 0.5,
                  },
                  {
                    hours: 0.25,
                    title: "< 30 Minutes",
                    sub: "Only WL Auto-Refund",
                    isMatch: state.hoursBeforeDeparture < 0.5,
                  },
                ].map((slab) => (
                  <button
                    key={slab.title}
                    type="button"
                    onClick={() => {
                      setState((prev) => ({
                        ...prev,
                        hoursBeforeDeparture: slab.hours,
                        chartPrepared: false,
                      }));
                      syncDatesFromHours(slab.hours);
                    }}
                    className={`rounded-xl border p-2 text-center transition ${
                      slab.isMatch
                        ? "border-[#1956b4] bg-blue-50/70 ring-2 ring-[#1956b4]/15 dark:border-blue-400 dark:bg-blue-950/40"
                        : "border-line bg-subcard/50 hover:border-[#1956b4]/50"
                    }`}
                  >
                    <div className="text-xs font-extrabold text-ink">
                      {slab.title}
                    </div>
                    <div className="mt-0.5 text-[10px] text-ink-muted">
                      {slab.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Exact Date-Time Pickers */}
            <div className="grid grid-cols-1 gap-3 rounded-xl border border-line bg-subcard/50 p-3.5 sm:grid-cols-2">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label
                    htmlFor="cancelDateTime"
                    className="text-xs font-bold text-ink-soft"
                  >
                    Ticket Cancellation Date &amp; Time:
                  </label>
                </div>
                <input
                  id="cancelDateTime"
                  type="datetime-local"
                  value={cancelDateInput}
                  onChange={(e) =>
                    handleDatePickerChange(e.target.value, departureDateInput)
                  }
                  className="w-full rounded-lg border border-line bg-card px-3 py-2 text-xs font-semibold text-ink sm:text-sm"
                />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label
                    htmlFor="departureDateTime"
                    className="text-xs font-bold text-ink-soft"
                  >
                    Scheduled Train Departure Time:
                  </label>
                  <span className="text-[11px] text-ink-muted">
                    Origin / Charting Time
                  </span>
                </div>
                <input
                  id="departureDateTime"
                  type="datetime-local"
                  value={departureDateInput}
                  onChange={(e) =>
                    handleDatePickerChange(cancelDateInput, e.target.value)
                  }
                  className="w-full rounded-lg border border-line bg-card px-3 py-2 text-xs font-semibold text-ink sm:text-sm"
                />
              </div>
            </div>

            {/* Chart Prepared Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-line bg-subcard/50 px-3.5 py-2.5">
              <label
                htmlFor="chartPreparedCheckbox"
                className="cursor-pointer select-none text-xs font-bold text-ink"
              >
                Was the train&apos;s First Reservation Chart (Chart Prepared) already prepared at cancellation?
              </label>
              <input
                id="chartPreparedCheckbox"
                type="checkbox"
                checked={state.chartPrepared}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    chartPrepared: e.target.checked,
                  }))
                }
                className="h-4 w-4 cursor-pointer rounded text-[#1956b4]"
              />
            </div>
          </div>

          {/* STEP 4: Passengers, Fare Input Mode (Grand Total vs Pure Fare), Catering & Insurance */}
          <div className="space-y-4 rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-5">
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink sm:text-base">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1956b4] text-xs font-extrabold text-white">
                4
              </span>
              {isHindi
                ? "यात्री संख्या, टिकट किराया (Grand Total या Pure Fare), कैटरिंग और बीमा"
                : "Passengers, Ticket Fare (Grand Total vs Pure Fare), Catering & Insurance"}
            </h2>

            {/* Passenger Selectors */}
            <div className="grid grid-cols-1 gap-3 rounded-xl border border-line bg-subcard/50 p-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink-soft">
                  Total Passengers Booked on Ticket:
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={`tot-${n}`}
                      type="button"
                      onClick={() => handleTotalPassengersChange(n)}
                      className={`h-8 w-8 rounded-lg border text-xs font-bold transition ${
                        state.totalPassengers === n
                          ? "border-[#1956b4] bg-[#1956b4] text-white"
                          : "border-line bg-card text-ink"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={state.totalPassengers}
                    onChange={(e) =>
                      handleTotalPassengersChange(
                        parseInt(e.target.value, 10) || 1
                      )
                    }
                    aria-label="Total passengers booked"
                    className="h-8 w-12 rounded-lg border border-line bg-card text-center text-xs font-bold text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink-soft">
                  Passengers Being Cancelled:
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((n) => {
                    const disabled = n > state.totalPassengers;
                    const active = state.cancelPassengers === n;
                    return (
                      <button
                        key={`can-${n}`}
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            cancelPassengers: n,
                          }))
                        }
                        className={`h-8 w-8 rounded-lg border text-xs font-bold transition ${
                          disabled
                            ? "cursor-not-allowed border-line bg-subcard opacity-40"
                            : active
                            ? "border-[#1956b4] bg-[#1956b4] text-white"
                            : "border-line bg-card text-ink"
                        }`}
                      >
                        {n}
                      </button>
                    );
                  })}
                  <input
                    type="number"
                    min={1}
                    max={state.totalPassengers}
                    value={state.cancelPassengers}
                    onChange={(e) => {
                      const val = Math.max(
                        1,
                        Math.min(
                          state.totalPassengers,
                          parseInt(e.target.value, 10) || 1
                        )
                      );
                      setState((prev) => ({ ...prev, cancelPassengers: val }));
                    }}
                    aria-label="Passengers being cancelled"
                    className="h-8 w-12 rounded-lg border border-line bg-card text-center text-xs font-bold text-ink"
                  />
                </div>
              </div>
            </div>

            {/* Section A: Fare Input Mode Switcher */}
            <div className="space-y-3 rounded-xl border border-line bg-subcard/50 p-3.5">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div className="text-xs font-extrabold text-ink">
                  Section A: How Would You Like to Enter the Fare?
                </div>
                <div className="inline-flex rounded-xl border border-line bg-card p-1">
                  <button
                    type="button"
                    onClick={() => {
                      const ext = extractFareAndFees(state);
                      setState((prev) => ({
                        ...prev,
                        fareInputMode: "GRAND_TOTAL",
                        enteredTotalAmount: ext.grandTotalPaid,
                      }));
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      state.fareInputMode === "GRAND_TOTAL"
                        ? "bg-[#1956b4] text-white"
                        : "text-ink-soft hover:bg-subcard"
                    }`}
                  >
                    1. Grand Total Paid (All Inclusive)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const ext = extractFareAndFees(state);
                      setState((prev) => ({
                        ...prev,
                        fareInputMode: "PURE_FARE",
                        pureTotalFareEntered: ext.pureTotalTrainFare,
                        purePerPaxFareEntered: ext.purePerPaxTrainFare,
                      }));
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      state.fareInputMode === "PURE_FARE"
                        ? "bg-[#1956b4] text-white"
                        : "text-ink-soft hover:bg-subcard"
                    }`}
                  >
                    2. Pure Railway Train Fare Only
                  </button>
                </div>
              </div>

              {state.fareInputMode === "GRAND_TOTAL" ? (
                <div className="space-y-1.5">
                  <label
                    htmlFor="enteredGrandTotalInput"
                    className="block text-xs font-bold text-ink-soft"
                  >
                    Grand Total Printed at Bottom of Ticket (Includes IRCTC Fee, Agent Fee, PG, Catering &amp; Insurance):
                  </label>
                  <div className="relative">
                    <span className=" absolute left-3.5 top-1/2 -translate-y-1/2 font-extrabold text-ink-muted">
                      ₹
                    </span>
                    <input
                      id="enteredGrandTotalInput"
                      type="number"
                      step="0.01"
                      value={state.enteredTotalAmount}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          enteredTotalAmount: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full rounded-xl border-2 border-[#1956b4]/50 bg-card py-2.5 pl-8 pr-4 text-base font-extrabold text-ink focus:border-[#1956b4] focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-ink-muted">
                    Note: In Grand Total mode, our engine automatically reverses Agent Fee, Payment Gateway (0.75% / 1%), IRCTC Convenience Fee, and Catering to isolate your exact Pure Train Fare.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="pureTotalFareInput"
                      className="mb-1 block text-xs font-bold text-ink-soft"
                    >
                      1. Total Pure Train Fare (Incl. GST, Excl. Catering/IRCTC Fee):
                    </label>
                    <input
                      id="pureTotalFareInput"
                      type="number"
                      step="1"
                      value={state.pureTotalFareEntered}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setState((prev) => ({
                          ...prev,
                          pureTotalFareEntered: val,
                          purePerPaxFareEntered: Number(
                            (val / prev.totalPassengers).toFixed(2)
                          ),
                        }));
                      }}
                      className="w-full rounded-xl border border-line bg-card px-3 py-2 text-sm font-extrabold text-ink"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="purePerPaxFareInput"
                      className="mb-1 block text-xs font-bold text-ink-soft"
                    >
                      2. Per-Passenger Pure Train Fare:
                    </label>
                    <input
                      id="purePerPaxFareInput"
                      type="number"
                      step="1"
                      value={state.purePerPaxFareEntered}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setState((prev) => ({
                          ...prev,
                          purePerPaxFareEntered: val,
                          pureTotalFareEntered: Number(
                            (val * prev.totalPassengers).toFixed(2)
                          ),
                        }));
                      }}
                      className="w-full rounded-xl border border-line bg-card px-3 py-2 text-sm font-extrabold text-ink"
                    />
                  </div>
                </div>
              )}

              {/* Live Extracted Pure Fare Dark Strip */}
              <div className="space-y-1.5 rounded-xl bg-slate-900 p-3 text-xs text-white">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-slate-300">
                    Extracted Pure Train Fare (Incl. GST, Excl. Food):{" "}
                    <strong className="text-sm text-emerald-400">
                      {formatINR(result.extracted.pureTotalTrainFare)}
                    </strong>
                  </span>
                  <span className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-0.5 font-bold text-amber-300">
                    Per Passenger Pure Fare:{" "}
                    {formatINR(result.extracted.purePerPaxTrainFare)}
                  </span>
                </div>

                {state.bookingSource === "AGENT" && (
                  <div className="border-t border-slate-800 pt-1.5 text-[11px] text-amber-300">
                    <strong>PG Base (Agent ID):</strong>{" "}
                    <span className="text-white">
                      {formatINR(
                        result.extracted.pureTotalTrainFare +
                          result.extracted.totalCatering
                      )}{" "}
                      (Fare+Food) + {formatINR(result.extracted.irctcFee)} (IRCTC)
                      {result.extracted.totalInsurance > 0
                        ? ` + ${formatINR(result.extracted.totalInsurance)} (Ins)`
                        : ""}{" "}
                      = {formatINR(result.extracted.pgBase)}
                    </span>{" "}
                    →{" "}
                    <strong className="text-emerald-300">
                      {state.pgEnabled
                        ? `PG (${result.extracted.pgRateLabel}) = ${formatINR(
                            result.extracted.pgCharge
                          )}`
                        : "PG OFF = ₹0"}
                    </strong>
                  </div>
                )}

                <div className="border-t border-slate-800 pt-1.5 text-[11px] text-sky-300">
                  <strong>Ex-GST Deduction Base (Per Pax):</strong>{" "}
                  <span className="text-white">
                    Base Fare (Ex-GST) {formatINR(result.exGstTrainPerPax)} +
                    Catering (Ex-GST) {formatINR(result.exGstCatPerPax)} ={" "}
                    {formatINR(result.combinedExGstPerPax)}
                  </span>
                </div>
              </div>
            </div>

            {/* Section B: Catering / Food Charge */}
            <div className="space-y-3 rounded-xl border border-line bg-subcard/50 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-extrabold text-ink">
                    Section B: Did the Ticket Include Catering / Food Charges?
                  </div>
                  <div className="text-[11px] text-ink-muted">
                    Vande Bharat / Rajdhani / Shatabdi (JSON Case: ₹363 Total Catering = ₹346.62 Ex-GST + ₹16.38 GST)
                  </div>
                </div>
                <div className="inline-flex rounded-xl border border-line bg-card p-1">
                  <button
                    type="button"
                    onClick={() =>
                      setState((prev) => ({ ...prev, hasCatering: false }))
                    }
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                      !state.hasCatering
                        ? "bg-[#1956b4] text-white"
                        : "text-ink-soft hover:bg-subcard"
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        hasCatering: true,
                        perPaxCateringFee:
                          prev.totalCateringFee <= 0
                            ? 363
                            : prev.perPaxCateringFee,
                        totalCateringFee:
                          prev.totalCateringFee <= 0
                            ? 363 * prev.totalPassengers
                            : prev.totalCateringFee,
                      }))
                    }
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                      state.hasCatering
                        ? "bg-emerald-700 text-white"
                        : "text-ink-soft hover:bg-subcard"
                    }`}
                  >
                    Yes (Included)
                  </button>
                </div>
              </div>

              {state.hasCatering && (
                <div className="space-y-2.5 border-t border-line pt-2.5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="totalCateringInput"
                        className="mb-1 block text-xs font-bold text-ink-soft"
                      >
                        Total Catering Charge (Incl. GST):
                      </label>
                      <input
                        id="totalCateringInput"
                        type="number"
                        step="1"
                        value={state.totalCateringFee}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setState((prev) => ({
                            ...prev,
                            totalCateringFee: val,
                            perPaxCateringFee: Number(
                              (val / prev.totalPassengers).toFixed(2)
                            ),
                          }));
                        }}
                        className="w-full rounded-lg border border-line bg-card px-3 py-1.5 text-sm font-bold text-ink"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="perPaxCateringInput"
                        className="mb-1 block text-xs font-bold text-ink-soft"
                      >
                        Per-Passenger Catering (Incl. GST):
                      </label>
                      <input
                        id="perPaxCateringInput"
                        type="number"
                        step="1"
                        value={state.perPaxCateringFee}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setState((prev) => ({
                            ...prev,
                            perPaxCateringFee: val,
                            totalCateringFee: Number(
                              (val * prev.totalPassengers).toFixed(2)
                            ),
                          }));
                        }}
                        className="w-full rounded-lg border border-line bg-card px-3 py-1.5 text-sm font-bold text-ink"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-card px-3 py-2 text-[11px]">
                    <div className="text-ink-soft">
                      <strong>Ex-GST Catering:</strong>{" "}
                      <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                        {formatINR(result.exGstCatPerPax * result.totalPax)}
                      </span>{" "}
                      <span className="text-ink-muted">
                        (Catering 5% GST:{" "}
                        {formatINR(result.catGstPerPax * result.totalPax)})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-ink-muted">
                        Presets:
                      </span>
                      {[
                        { val: 363, label: "₹363 (Vande Bharat)" },
                        { val: 150, label: "₹150" },
                        { val: 300, label: "₹300" },
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() =>
                            setState((prev) => ({
                              ...prev,
                              hasCatering: true,
                              perPaxCateringFee: preset.val,
                              totalCateringFee: Number(
                                (preset.val * prev.totalPassengers).toFixed(2)
                              ),
                            }))
                          }
                          className="rounded border border-line bg-subcard px-2 py-0.5 text-[11px] font-bold text-ink hover:border-[#1956b4]"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section C: IRCTC Travel Insurance */}
            <div className="space-y-3 rounded-xl border border-line bg-subcard/50 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-extrabold text-ink">
                    Section C: Was IRCTC Travel Insurance Opted?
                  </div>
                  <div className="text-[11px] text-ink-muted">
                    ₹0.45 or ₹0.35 per passenger (Added to PG Base and refundable on cancellation)
                  </div>
                </div>
                <div className="inline-flex rounded-xl border border-line bg-card p-1">
                  <button
                    type="button"
                    onClick={() =>
                      setState((prev) => ({ ...prev, hasInsurance: false }))
                    }
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                      !state.hasInsurance
                        ? "bg-[#1956b4] text-white"
                        : "text-ink-soft hover:bg-subcard"
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setState((prev) => ({ ...prev, hasInsurance: true }))
                    }
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                      state.hasInsurance
                        ? "bg-emerald-700 text-white"
                        : "text-ink-soft hover:bg-subcard"
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>

              {state.hasInsurance && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink-soft">
                      Rate (Per Pax):
                    </span>
                    {[0.45, 0.35].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            insurancePerPax: rate,
                          }))
                        }
                        className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${
                          Math.abs(state.insurancePerPax - rate) < 0.001
                            ? "border-[#1956b4] bg-[#1956b4] text-white"
                            : "border-line bg-card text-ink"
                        }`}
                      >
                        ₹{rate} / Pax
                      </button>
                    ))}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <input
                      type="checkbox"
                      checked={state.insuranceRefundable}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          insuranceRefundable: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded"
                    />
                    <span>Include Insurance in Net Bank Refund</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Live PRS Refund Receipt & Dynamic QR Pass */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:col-span-5">
          <div className="overflow-hidden rounded-3xl border-2 border-[#1956b4]/20 bg-card shadow-lg">
            {/* Receipt Top Navy Header */}
            <div className="ta-navy-hero p-5 text-white">
              <div className="flex items-center justify-between gap-2 text-xs font-semibold text-blue-200">
                <span>
                  {state.bookingSource === "AGENT"
                    ? "Agent ID (RSP)"
                    : state.bookingSource === "PERSONAL"
                    ? "Personal ID"
                    : "Railway Counter"}{" "}
                  • {result.classConfig.shortName} •{" "}
                  {STATUS_META[state.ticketStatus].shortLabel}
                </span>
                <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-[11px] font-extrabold text-slate-950">
                  {result.cancellingPax}/{result.totalPax} Pax Cancelled
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/20 p-3.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                    {isHindi ? "कुल बैंक रिफंड (Net Refund)" : "Net Bank Refund"}
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-emerald-300 sm:text-3xl">
                    {formatINR(result.totalNetRefund)}
                  </div>
                  <div className="mt-0.5 text-[11px] text-emerald-100">
                    {isHindi ? "प्रति यात्री रिफंड:" : "Per Pax Refund:"}{" "}
                    {formatINR(result.perPaxNetRefund)}
                  </div>
                </div>

                <div className="rounded-2xl border border-rose-400/40 bg-rose-500/20 p-3.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-rose-200">
                    {isHindi ? "रेलवे कटौती (PRS Cut)" : "PRS Railway Cut"}
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-rose-300 sm:text-3xl">
                    - {formatINR(result.finalRailwayCut)}
                  </div>
                  <div className="mt-0.5 text-[11px] text-rose-100">
                    {formatINR(result.perPaxRailwayCut)} /{" "}
                    {isHindi ? "यात्री" : "Passenger"}
                  </div>
                </div>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="space-y-4 p-4 text-xs sm:p-5">
              {/* Box 1: Grand Total Reverse Breakdown */}
              <div className="space-y-2 rounded-2xl border border-line bg-subcard/50 p-3.5">
                <div className="flex items-center justify-between border-b border-line pb-1.5 font-extrabold text-ink">
                  <span>1. Ticket Grand Total Breakdown</span>
                  <span className="rounded-md bg-card px-2 py-0.5 text-[11px] font-bold text-[#1956b4] dark:text-blue-300">
                    {state.bookingSource}
                  </span>
                </div>

                <div className="space-y-1.5 text-ink-soft">
                  <div className="flex justify-between font-bold text-ink">
                    <span>Customer Grand Total Paid:</span>
                    <span>{formatINR(result.extracted.grandTotalPaid)}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>- IRCTC Convenience Fee (Non-Refundable):</span>
                    <span>- {formatINR(result.extracted.irctcFee)}</span>
                  </div>

                  {result.extracted.totalInsurance > 0 && (
                    <div className="flex justify-between">
                      <span>
                        • Travel Insurance (
                        {state.insuranceRefundable
                          ? "Included in Refund"
                          : "Non-Refundable"}
                        ):
                      </span>
                      <span>{formatINR(result.extracted.totalInsurance)}</span>
                    </div>
                  )}

                  {state.bookingSource === "AGENT" && (
                    <>
                      <div className="flex justify-between rounded border border-amber-300/70 bg-amber-50/80 px-2 py-1 text-[11px] text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200">
                        <span>
                          <strong>PG Base</strong> (Fare + IRCTC + Insurance):
                        </span>
                        <span className="font-bold">
                          {formatINR(result.extracted.pgBase)}
                        </span>
                      </div>
                      <div className="flex justify-between text-rose-600 dark:text-rose-400">
                        <span>
                          - Payment Gateway (PG {result.extracted.pgRateLabel}):
                        </span>
                        <span>- {formatINR(result.extracted.pgCharge)}</span>
                      </div>
                      <div className="flex justify-between text-rose-600 dark:text-rose-400">
                        <span>- Agent Service Charge (RSP Non-Refundable):</span>
                        <span>- {formatINR(result.extracted.agentFee)}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between border-t border-line pt-1.5 font-extrabold text-[#1956b4] dark:text-blue-300">
                    <span>= Total Pure Railway Fare (Train + Catering):</span>
                    <span>
                      {formatINR(
                        result.extracted.pureTotalTrainFare +
                          result.extracted.totalCatering
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Box 2: PRS Double ₹5 Rounding Cancellation Math */}
              <div className="space-y-2 rounded-2xl border border-line bg-subcard/50 p-3.5">
                <div className="flex items-center justify-between gap-2 border-b border-line pb-1.5 font-extrabold text-ink">
                  <span>2. PRS Cancellation Deduction Math</span>
                  <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-[#1956b4] dark:bg-blue-950 dark:text-blue-300">
                    {result.perPaxFormulaStr}
                  </span>
                </div>

                <div className="space-y-1.5 text-ink-soft">
                  <div className="flex justify-between">
                    <span>
                      Cancelling Pax Pure Train Fare ({result.cancellingPax}{" "}
                      Pax, Incl. GST):
                    </span>
                    <span className="font-bold text-ink">
                      {formatINR(result.cancellingTrainFare)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>+ Cancelling Pax Catering Charge (Incl. GST):</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {formatINR(result.cancellingCatering)}
                    </span>
                  </div>

                  <div className="flex justify-between rounded border border-indigo-200 bg-indigo-50/80 px-2 py-1 text-[11px] text-indigo-950 dark:border-indigo-500/30 dark:bg-indigo-950/40 dark:text-indigo-200">
                    <span>
                      <strong>Step 1 (Ex-GST Base):</strong> Train + Food Ex-GST:
                    </span>
                    <span className="font-extrabold">
                      {formatINR(
                        result.combinedExGstPerPax * result.cancellingPax
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>{result.baseCutLabelStr}</span>
                    <span>- {formatINR(result.baseCancelCharge)}</span>
                  </div>

                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>• Step 3: 5% Cancellation GST on Rounded Base:</span>
                    <span>- {formatINR(result.gstCharge)}</span>
                  </div>

                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>
                      • Step 4: Stage-2 ₹5 Round-Up on (Base + GST):
                    </span>
                    <span>- {formatINR(result.roundingDiff)}</span>
                  </div>

                  <div className="flex justify-between border-t border-line pt-1.5 font-extrabold text-rose-700 dark:text-rose-400">
                    <span>Total Railway Cancellation Cut (PRS Charge):</span>
                    <span>- {formatINR(result.finalRailwayCut)}</span>
                  </div>
                </div>
              </div>

              {/* Box 3: Final Net Bank Refund */}
              <div className="space-y-1.5 rounded-2xl border-2 border-emerald-400/60 bg-emerald-50/80 p-3.5 dark:border-emerald-500/40 dark:bg-emerald-950/30">
                <div className="flex justify-between font-semibold text-ink">
                  <span>Cancelling Pax Railway Fare (Train + Catering):</span>
                  <span>{formatINR(result.totalCancellingTicketFare)}</span>
                </div>
                <div className="flex justify-between font-semibold text-rose-700 dark:text-rose-400">
                  <span>- PRS Railway Cancellation Deduction:</span>
                  <span>- {formatINR(result.finalRailwayCut)}</span>
                </div>
                {result.insuranceRefund > 0 && (
                  <div className="flex justify-between font-semibold text-emerald-800 dark:text-emerald-300">
                    <span>+ Travel Insurance Refund:</span>
                    <span>+ {formatINR(result.insuranceRefund)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-emerald-300 pt-2 text-base font-extrabold text-emerald-900 dark:border-emerald-500/40 dark:text-emerald-300">
                  <span>Final Refund Credited to Bank:</span>
                  <span>{formatINR(result.totalNetRefund)}</span>
                </div>
              </div>

              {/* Applied PRS Rule & Gazette Comparison Box */}
              <div className="space-y-1.5 rounded-2xl border border-amber-300/80 bg-amber-50/80 p-3.5 text-ink dark:border-amber-500/30 dark:bg-amber-950/30">
                <div className="text-xs font-extrabold">
                  Applied Indian Railways PRS Rule:
                </div>
                <p className="text-[11px] leading-relaxed text-ink-soft">
                  {result.ruleExplanationText}
                </p>
                <p className="pt-1 text-[11px] font-bold text-[#1956b4] dark:text-blue-300">
                  {result.smartTipText}
                </p>
                {result.regimeComparisonNote && (
                  <div className="mt-2 border-t border-amber-300/70 pt-2 text-[11px] font-semibold text-ink">
                    {result.regimeComparisonNote}
                  </div>
                )}
              </div>

              {/* Dynamic Shareable QR Refund Pass & Copy / WhatsApp Share Buttons */}
              <div className="space-y-2.5 rounded-2xl border border-line bg-subcard/60 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      aria-label="Dynamic QR Refund Receipt Pass"
                      className="grid shrink-0 grid-cols-21 gap-[1px] rounded-lg border border-line bg-white p-1.5 shadow-2xs"
                      style={{ width: 64, height: 64 }}
                    >
                      {qrMatrix.flatMap((row, rIdx) =>
                        row.map((cell, cIdx) => (
                          <span
                            key={`${rIdx}-${cIdx}`}
                            className={
                              cell ? "bg-slate-950" : "bg-transparent"
                            }
                            style={{ width: 2, height: 2 }}
                          />
                        ))
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs font-extrabold text-ink">
                        <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-600" />
                        <span>
                          {isHindi
                            ? "डायनामिक PRS रिफंड पास"
                            : "Dynamic PRS Refund Pass"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-ink-muted">
                        {isHindi ? "कुल रिफंड" : "Net Refund"}{" "}
                        {formatINR(result.totalNetRefund)} •{" "}
                        {isHindi ? "कटौती" : "Cut"}{" "}
                        {formatINR(result.finalRailwayCut)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopyRefundReceipt}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1956b4] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#144696]"
                  >
                    {copiedSummary ? (
                      <>
                        <CheckCircleIcon className="h-3.5 w-3.5" />
                        <span>{isHindi ? "कॉपी हो गया!" : "Copied!"}</span>
                      </>
                    ) : (
                      <>
                        <CopyIcon className="h-3.5 w-3.5" />
                        <span>{isHindi ? "रसीद कॉपी करें" : "Copy Receipt"}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppShare}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                  >
                    <span>💬</span>
                    <span>
                      {isHindi ? "WhatsApp शेयर" : "Share on WhatsApp"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Scenario Switcher Pills */}
          <div className="rounded-2xl border border-line bg-card p-4 shadow-xs">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                Dedicated Refund Calculators by Ticket Type
              </span>
              <ClockIcon className="h-3.5 w-3.5 text-ink-muted" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {REFUND_SEO_SCENARIOS.slice(0, 10).map((sc) => {
                const isCurrent = activeScenarioSlug === sc.slug;
                return (
                  <Link
                    key={sc.slug}
                    href={`/rail/refund-calculator/${sc.slug}`}
                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition ${
                      isCurrent
                        ? "border-[#1956b4] bg-[#1956b4] text-white"
                        : "border-line bg-subcard/60 text-ink-soft hover:border-[#1956b4] hover:text-[#1956b4]"
                    }`}
                  >
                    {sc.shortTitle}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* JSON Paste Modal */}
      {isJsonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl space-y-4 rounded-3xl border border-line bg-card p-5 shadow-2xl sm:p-6">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-base font-extrabold text-ink">
                  Paste IRCTC / PRS API Ticket JSON Log
                </h3>
                <p className="text-xs text-ink-muted">
                  Paste your raw ticket JSON (`RBresponse` / `RBTktres`) to auto-populate pure fare, catering, GST, and agent PG charges.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsJsonModalOpen(false)}
                className="px-2 text-lg font-extrabold text-ink-muted hover:text-ink"
              >
                ✕
              </button>
            </div>

            <textarea
              rows={8}
              value={jsonInputText}
              onChange={(e) => setJsonInputText(e.target.value)}
              placeholder='Paste {"RBresponse": ..., "RBTktres": ...} JSON here...'
              className="w-full rounded-xl border border-line bg-subcard p-3 font-mono text-xs text-ink focus:border-[#1956b4] focus:outline-none"
            />

            {jsonFeedback && (
              <div
                className={`text-xs font-bold ${
                  jsonFeedback.ok ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {jsonFeedback.message}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setJsonInputText(SAMPLE_PRS_JSON_STRING)}
                className="rounded-xl border border-line bg-subcard px-3.5 py-2 text-xs font-bold text-ink hover:bg-line"
              >
                Load Sample SBC Vande Bharat JSON
              </button>
              <button
                type="button"
                onClick={handleApplyJson}
                className="rounded-xl bg-[#1956b4] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#144696]"
              >
                Parse &amp; Calculate Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

