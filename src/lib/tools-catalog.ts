export interface ToolMenuItem {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  href: string;
  badge?: string;
  iconKey:
    | "plane"
    | "luggage"
    | "clock"
    | "phone"
    | "BoardingCheck"
    | "train"
    | "ticket"
    | "coach"
    | "decoder"
    | "calculator"
    | "hotel"
    | "shield";
}

export interface ToolCategoryGroup {
  id: "air" | "rail" | "hotel";
  categoryTitle: string;
  categorySubtitle: string;
  hubHref: string;
  accentBadgeClass: string;
  items: ToolMenuItem[];
}

export const TOOL_CATEGORIES: ToolCategoryGroup[] = [
  {
    id: "air",
    categoryTitle: "Air & Aviation Tools",
    categorySubtitle: "Live flight tracking, baggage & airport buffers",
    hubHref: "/tools/air",
    accentBadgeClass:
      "bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300",
    items: [
      {
        id: "live-flight-status",
        title: "Live Flight Status Tracker",
        shortTitle: "Flight Status",
        description:
          "Track 500+ airlines by flight number with live terminal, boarding gate & baggage belt",
        href: "/air/flight-status",
        badge: "LIVE",
        iconKey: "plane",
      },
      {
        id: "baggage-allowance",
        title: "Airline Baggage Allowance Checker",
        shortTitle: "Baggage Rules",
        description:
          "Check 7 kg cabin & 15–30 kg check-in luggage rules across IndiGo, Air India, Akasa & international",
        href: "/tools/air#baggage",
        iconKey: "luggage",
      },
      {
        id: "airport-buffer",
        title: "Airport Arrival Time Calculator",
        shortTitle: "Arrival Buffer",
        description:
          "Compute exact terminal entry time for domestic & international departures",
        href: "/tools/air#buffer",
        iconKey: "clock",
      },
      {
        id: "airline-directory",
        title: "Airline Directory & 24x7 Helplines",
        shortTitle: "Airline Directory",
        description:
          "Official IATA codes, hub terminals & customer care numbers for top carriers",
        href: "/air/flight-status#airlines-directory",
        iconKey: "phone",
      },
      {
        id: "digiyatra-checklist",
        title: "DigiYatra & Boarding Checklist",
        shortTitle: "Boarding Rules",
        description:
          "Power bank rules, 100 ml liquid limits & contactless terminal gate checklist",
        href: "/tools/air#checklist",
        iconKey: "BoardingCheck",
      },
    ],
  },
  {
    id: "rail",
    categoryTitle: "Indian Railways & PNR Tools",
    categorySubtitle: "Live train GPS, 10-digit PNR & coach decoders",
    hubHref: "/rail/live-status",
    accentBadgeClass:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    items: [
      {
        id: "live-train-status",
        title: "Spot Your Train (Live Running Status)",
        shortTitle: "Live Train Status",
        description:
          "Real-time GPS station position, delay minutes, platform number & route map",
        href: "/rail/live-status",
        badge: "LIVE",
        iconKey: "train",
      },
      {
        id: "pnr-status-checker",
        title: "10-Digit IRCTC PNR Status Checker",
        shortTitle: "PNR Status",
        description:
          "Instant CNF, RAC & Waitlist confirmation status with reservation chart updates",
        href: "/rail/pnr-status",
        badge: "LIVE",
        iconKey: "ticket",
      },
      {
        id: "coach-position",
        title: "Train Coach Position & Rake Sequence",
        shortTitle: "Coach Position",
        description:
          "Find exact coach sequence from the locomotive (ENG, LPR, 1A, 2A, 3A, CC, EV)",
        href: "/rail/live-status",
        iconKey: "coach",
      },
      {
        id: "berth-quota-decoder",
        title: "Coach, Berth & Waitlist Quota Decoder",
        shortTitle: "PNR Decoder",
        description:
          "Decode LB, UB, SL, WS berth codes and GNWL, RLWL, PQWL & TQWL priority",
        href: "/rail/pnr-status#decoder",
        iconKey: "decoder",
      },
    ],
  },
  {
    id: "hotel",
    categoryTitle: "Hotels, GST & Stay Tools",
    categorySubtitle: "Room GST tax calculator, transit stays & ID rules",
    hubHref: "/tools/hotel",
    accentBadgeClass:
      "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    items: [
      {
        id: "hotel-gst-calculator",
        title: "Hotel Room Tariff & GST Calculator",
        shortTitle: "Hotel GST Calc",
        description:
          "Calculate 0%, 12% (up to ₹7,500) & 18% (above ₹7,500) Indian hotel GST bills",
        href: "/tools/hotel#gst-calculator",
        badge: "POPULAR",
        iconKey: "calculator",
      },
      {
        id: "transit-checkin-planner",
        title: "Early Check-In & Transit Stay Planner",
        shortTitle: "Check-In Planner",
        description:
          "Align early-morning train & red-eye flight arrivals with 2:00 PM hotel check-in",
        href: "/tools/hotel#transit-planner",
        iconKey: "hotel",
      },
      {
        id: "guest-id-rules",
        title: "Indian Hotel Guest ID & Check-In Rules",
        shortTitle: "Hotel ID Rules",
        description:
          "Mandatory Aadhaar, DigiLocker, Passport & family check-in compliance checklist",
        href: "/tools/hotel#stay-checklist",
        iconKey: "shield",
      },
    ],
  },
];

