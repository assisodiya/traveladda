export interface StationInfo {
  code: string;
  name: string;
}

export interface PassengerStatusDetail {
  status: string;
  formatted: string;
  coachId: string | null;
  berthNo: number | string | null;
  berthCode: string | null;
  berthName: string | null;
  quota: string | null;
  quotaName: string | null;
}

export interface NormalizedPassenger {
  serialNumber: number;
  booking: PassengerStatusDetail;
  current: PassengerStatusDetail;
  isConfirmed: boolean;
  isRAC: boolean;
  isWaitlisted: boolean;
  isCancelled: boolean;
  berthCode: string | null;
  berthName: string | null;
  statusBadge: "CNF" | "RAC" | "WL" | "CAN" | "OTHER";
}

export interface NormalizedPnrData {
  pnrNumber: string;
  formattedPnr: string;
  train: {
    number: string;
    name: string;
    journeyDate: string;
    journeyDateRaw: string;
    journeyClass: string;
    journeyClassName: string;
    bookingFare: number | null;
    source: StationInfo;
    destination: StationInfo;
    boardingPoint: StationInfo;
    reservationUpto: StationInfo;
  };
  charting: {
    status: string;
    isPrepared: boolean;
  };
  isWaitlisted: boolean;
  overallStatus: "Confirmed" | "RAC" | "Waitlisted" | "Partially Confirmed" | "Cancelled";
  passengers: NormalizedPassenger[];
  generatedAt: string;
}

export interface OwnedPnrApiResponse {
  success: boolean;
  provider: string;
  endpoint: string;
  data?: NormalizedPnrData;
  error?: {
    code: string;
    message: string;
  };
  meta: {
    timestamp: string;
    traceId: string;
    source: string;
    executionTime: number;
    poweredBy: string;
    fetchedAt: string;
    responseTimeMs: number;
  };
}

export const RAILWAY_CLASS_MAP: Record<string, string> = {
  "1A": "First AC (1A)",
  "2A": "AC 2-Tier (2A)",
  "3A": "AC 3-Tier (3A)",
  "3E": "AC 3-Tier Economy (3E)",
  CC: "AC Chair Car (CC)",
  EC: "Executive Chair Car (EC)",
  EA: "Anubhuti Class (EA)",
  EV: "Vistadome AC (EV)",
  SL: "Sleeper Class (SL)",
  "2S": "Second Sitting (2S)",
  FC: "First Class (FC)",
  VS: "Vistadome Non-AC (VS)",
};

export const BERTH_CODE_MAP: Record<string, string> = {
  LB: "Lower Berth",
  MB: "Middle Berth",
  UB: "Upper Berth",
  SL: "Side Lower",
  SU: "Side Upper",
  SM: "Side Middle",
  WS: "Window Side",
  MS: "Middle Seat",
  AS: "Aisle Seat",
  NC: "No Choice / Cabin",
};

export const QUOTA_CODE_MAP: Record<string, string> = {
  GN: "General Quota",
  TQ: "Tatkal Quota",
  PT: "Premium Tatkal",
  LD: "Ladies Quota",
  SS: "Senior Citizen / Lower Berth",
  HP: "Divyangjan (Physically Challenged)",
  HO: "Headquarters / Official Quota",
  DF: "Defence Quota",
  FT: "Foreign Tourist Quota",
  YU: "Yuva Quota",
  GNWL: "General Waitlist",
  RLWL: "Remote Location Waitlist",
  PQWL: "Pooled Quota Waitlist",
  TQWL: "Tatkal Waitlist",
};

export function getClassName(code?: string | null): string {
  if (!code) return "Standard Class";
  const upper = code.trim().toUpperCase();
  return RAILWAY_CLASS_MAP[upper] ?? upper;
}

export function getBerthName(code?: string | null): string | null {
  if (!code) return null;
  const upper = code.trim().toUpperCase();
  return BERTH_CODE_MAP[upper] ?? upper;
}

export function getQuotaName(code?: string | null): string | null {
  if (!code) return null;
  const upper = code.trim().toUpperCase();
  return QUOTA_CODE_MAP[upper] ?? upper;
}

export function formatPnrDisplay(pnr: string): string {
  const digits = pnr.replace(/\D/g, "");
  if (digits.length !== 10) return pnr;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}
