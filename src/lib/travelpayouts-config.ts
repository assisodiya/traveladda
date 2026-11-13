/**
 * Server-Side Travelpayouts / Aviasales API Configuration
 * Can be overridden anytime via environment variables in .env.local:
 * - TRAVELPAYOUTS_API_TOKEN
 * - TRAVELPAYOUTS_MARKER
 */

export const TRAVELPAYOUTS_SERVER_CONFIG = {
  apiToken:
    process.env.TRAVELPAYOUTS_API_TOKEN || "c47529f41bee938ae9ef0f30e28ee134",
  partnerMarker: process.env.TRAVELPAYOUTS_MARKER || "600242",
  baseUrlV3: "https://api.travelpayouts.com/aviasales/v3",
  baseUrlV1: "https://api.travelpayouts.com/v1",
  aviasalesSearchHost: "https://www.aviasales.com",
} as const;

export type SupportedFlightCurrency = "inr" | "usd" | "aed" | "eur" | "gbp";

export interface CurrencyConfigItem {
  code: SupportedFlightCurrency;
  label: string;
  symbol: string;
  locale: string;
  fallbackRateFromInr: number;
}

export const FLIGHT_CURRENCIES: Record<
  SupportedFlightCurrency,
  CurrencyConfigItem
> = {
  inr: {
    code: "inr",
    label: "INR (₹)",
    symbol: "₹",
    locale: "en-IN",
    fallbackRateFromInr: 1,
  },
  usd: {
    code: "usd",
    label: "USD ($)",
    symbol: "$",
    locale: "en-US",
    fallbackRateFromInr: 0.0116,
  },
  aed: {
    code: "aed",
    label: "AED (د.إ)",
    symbol: "AED ",
    locale: "en-AE",
    fallbackRateFromInr: 0.0426,
  },
  eur: {
    code: "eur",
    label: "EUR (€)",
    symbol: "€",
    locale: "en-IE",
    fallbackRateFromInr: 0.0108,
  },
  gbp: {
    code: "gbp",
    label: "GBP (£)",
    symbol: "£",
    locale: "en-GB",
    fallbackRateFromInr: 0.0091,
  },
};

export function normalizeFlightCurrency(
  raw?: string | null
): SupportedFlightCurrency {
  const clean = (raw || "inr").trim().toLowerCase();
  if (
    clean === "inr" ||
    clean === "usd" ||
    clean === "aed" ||
    clean === "eur" ||
    clean === "gbp"
  ) {
    return clean;
  }
  return "inr";
}

export function formatFlightPrice(
  amount: number,
  currency: SupportedFlightCurrency
): string {
  const cfg = FLIGHT_CURRENCIES[currency] || FLIGHT_CURRENCIES.inr;
  const rounded = Math.max(1, Math.round(amount));
  return `${cfg.symbol}${rounded.toLocaleString(cfg.locale)}`;
}

