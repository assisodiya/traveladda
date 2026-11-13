import { NextResponse } from "next/server";
import { MAJOR_AIRPORT_HUBS } from "@/lib/flight-booking-types";

export interface AutocompletePlaceItem {
  iata: string;
  city: string;
  airportName: string;
  countryName: string;
  countryCode: string;
  terminals: string;
  lat: number;
  lng: number;
  isInternational: boolean;
}

interface RawTravelpayoutsPlace {
  code?: string;
  name?: string;
  type?: string;
  country_code?: string;
  country_name?: string;
  main_airport_name?: string | null;
  city_name?: string | null;
  coordinates?: {
    lat?: number;
    lon?: number;
  };
}

const DEFAULT_POPULAR_PLACES: AutocompletePlaceItem[] = MAJOR_AIRPORT_HUBS.slice(
  0,
  20
).map((h) => ({
  iata: h.iata,
  city: h.city,
  airportName: h.airportName,
  countryName: h.isInternationalHub ? h.stateOrCountry : "India",
  countryCode: h.isInternationalHub ? "INTL" : "IN",
  terminals: h.domesticTerminal,
  lat: h.lat,
  lng: h.lng,
  isInternational: h.isInternationalHub,
}));

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawQuery = (searchParams.get("q") || "").trim();

  if (rawQuery.length < 2) {
    return NextResponse.json(
      {
        success: true,
        query: rawQuery,
        data: DEFAULT_POPULAR_PLACES,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=86400",
        },
      }
    );
  }

  const lower = rawQuery.toLowerCase();

  // 1. Match local curated airports first (for instant terminal info)
  const localMatches: AutocompletePlaceItem[] = MAJOR_AIRPORT_HUBS.filter(
    (h) =>
      h.iata.toLowerCase().includes(lower) ||
      h.city.toLowerCase().includes(lower) ||
      h.airportName.toLowerCase().includes(lower) ||
      h.stateOrCountry.toLowerCase().includes(lower) ||
      h.cityHindi.includes(rawQuery)
  ).map((h) => ({
    iata: h.iata,
    city: h.city,
    airportName: h.airportName,
    countryName: h.isInternationalHub ? h.stateOrCountry : "India",
    countryCode: h.isInternationalHub ? "INTL" : "IN",
    terminals: h.domesticTerminal,
    lat: h.lat,
    lng: h.lng,
    isInternational: h.isInternationalHub,
  }));

  // 2. Fetch live global & Indian airports/cities from Travelpayouts places2 API
  const remoteMatches: AutocompletePlaceItem[] = [];
  try {
    const upstreamUrl = `https://autocomplete.travelpayouts.com/places2?term=${encodeURIComponent(
      rawQuery
    )}&locale=en&types[]=airport&types[]=city`;

    const res = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(4500),
    });

    if (res.ok) {
      const rawList = (await res.json()) as RawTravelpayoutsPlace[];
      if (Array.isArray(rawList)) {
        for (const item of rawList) {
          const iata = String(item.code || "")
            .trim()
            .toUpperCase();
          if (!/^[A-Z]{3}$/.test(iata)) continue;

          const city = String(
            item.city_name || item.name || iata
          ).trim();
          const countryCode = String(item.country_code || "IN")
            .trim()
            .toUpperCase();
          const countryName = String(item.country_name || "India").trim();
          const airportName =
            item.type === "airport"
              ? `${String(item.name || city).trim()} Airport`
              : item.main_airport_name
                ? `${String(item.main_airport_name).trim()} Airport`
                : `${city} Airport`;

          const lat =
            typeof item.coordinates?.lat === "number"
              ? item.coordinates.lat
              : 20.5937;
          const lng =
            typeof item.coordinates?.lon === "number"
              ? item.coordinates.lon
              : 78.9629;

          remoteMatches.push({
            iata,
            city,
            airportName: airportName.replace(/\s+Airport\s+Airport$/i, " Airport"),
            countryName,
            countryCode,
            terminals: "Main Terminal",
            lat,
            lng,
            isInternational: countryCode !== "IN",
          });
        }
      }
    }
  } catch {
    // Fallback to localMatches if upstream times out
  }

  // Merge and deduplicate by IATA code, prioritizing exact IATA match and Indian airports
  const mergedMap = new Map<string, AutocompletePlaceItem>();
  for (const item of [...localMatches, ...remoteMatches]) {
    if (!mergedMap.has(item.iata)) {
      mergedMap.set(item.iata, item);
    }
  }

  const merged = Array.from(mergedMap.values()).sort((a, b) => {
    const aExact = a.iata.toLowerCase() === lower ? 1 : 0;
    const bExact = b.iata.toLowerCase() === lower ? 1 : 0;
    if (aExact !== bExact) return bExact - aExact;

    const aIn = a.countryCode === "IN" ? 1 : 0;
    const bIn = b.countryCode === "IN" ? 1 : 0;
    return bIn - aIn;
  });

  return NextResponse.json(
    {
      success: true,
      query: rawQuery,
      count: merged.length,
      data: merged.slice(0, 15),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    }
  );
}

