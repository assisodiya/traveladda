export interface ToolMenuItem {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  href: string;
  badge?: string;
  iconKey: "plane" | "luggage" | "train" | "ticket" | "calculator" | "clock";
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
    categoryTitle: "Air Tools",
    categorySubtitle: "Live flight radar & baggage calculator",
    hubHref: "/air/flight-status",
    accentBadgeClass:
      "bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300",
    items: [
      {
        id: "live-flight-status",
        title: "Live Flight Status Tracker",
        shortTitle: "Flight Status",
        description:
          "Track 500+ airlines by flight number with live terminal, gate & baggage belt",
        href: "/air/flight-status",
        badge: "LIVE",
        iconKey: "plane",
      },
      {
        id: "air-baggage-buffer",
        title: "Baggage & Arrival Time Calculator",
        shortTitle: "Air Baggage Tool",
        description:
          "Check 7 kg / 15 kg airline baggage limits & calculate terminal arrival time",
        href: "/tools/air",
        iconKey: "luggage",
      },
    ],
  },
  {
    id: "rail",
    categoryTitle: "Rail Tools",
    categorySubtitle: "Live train GPS, PNR & chart time",
    hubHref: "/rail/live-status",
    accentBadgeClass:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    items: [
      {
        id: "live-train-status",
        title: "Live Train Running Status",
        shortTitle: "Train Status",
        description:
          "Spot your train's live GPS station, delay minutes, platform & coach position",
        href: "/rail/live-status",
        badge: "LIVE",
        iconKey: "train",
      },
      {
        id: "pnr-status-checker",
        title: "10-Digit PNR Status Checker",
        shortTitle: "PNR Status",
        description:
          "Check real-time CNF, RAC, Waitlist & chart preparation status",
        href: "/rail/pnr-status",
        badge: "LIVE",
        iconKey: "ticket",
      },
      {
        id: "train-chart-time",
        title: "Train Chart Preparation Time",
        shortTitle: "Chart Time",
        description:
          "Find 1st & 2nd (vacancy) chart times and remote charting station by stop",
        href: "/rail/chart-time",
        badge: "NEW",
        iconKey: "clock",
      },
    ],
  },
  {
    id: "hotel",
    categoryTitle: "Hotel Tools",
    categorySubtitle: "Room tariff & GST slab calculator",
    hubHref: "/tools/hotel",
    accentBadgeClass:
      "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    items: [
      {
        id: "hotel-gst-calculator",
        title: "Hotel Room GST Calculator",
        shortTitle: "Hotel GST Calc",
        description:
          "Calculate 0%, 12% & 18% Indian hotel GST tax & total room tariff",
        href: "/tools/hotel",
        badge: "ACTIVE",
        iconKey: "calculator",
      },
    ],
  },
];
