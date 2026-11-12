import tollDataset from "./toll-plazas-india.json";

export type VehicleCategory = "car" | "lcv" | "bus-truck" | "multi-axle";
export type TripDirectionMode = "one-way" | "return-24h" | "round-trip";
export type FuelType = "petrol" | "diesel" | "cng" | "ev";

export interface TollCity {
  slug: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  petrolInr: number;
  dieselInr: number;
  cngInr: number;
  evKwhInr: number;
}

export interface TollPlaza {
  id: string;
  name: string;
  highway: string;
  state: string;
  lat: number;
  lng: number;
  carSingle: number;
  carReturn: number;
  lcvSingle: number;
  busTruckSingle: number;
  multiAxleSingle: number;
}

export interface TollCorridor {
  from: string;
  to: string;
  distanceKm: number;
  durationMins: number;
  highwaySummary: string;
  plazaIds: string[];
}

export interface TollPlazaStopItem {
  index: number;
  plaza: TollPlaza;
  estimatedKmFromOrigin: number;
  singleFareInr: number;
  return24hFareInr: number;
  appliedFareInr: number;
}

export interface FuelComparisonItem {
  fuelType: FuelType;
  label: string;
  unitPriceLabel: string;
  efficiencyLabel: string;
  unitsConsumed: number;
  fuelCostInr: number;
  totalWithTollInr: number;
}

export interface ComputedTollRoutePlan {
  fromCity: TollCity;
  toCity: TollCity;
  routeSlug: string;
  routePath: string;
  isCuratedCorridor: boolean;
  highwaySummary: string;
  oneWayDistanceKm: number;
  effectiveDistanceKm: number;
  oneWayDurationMins: number;
  effectiveDurationMins: number;
  durationFormatted: string;
  vehicleCategory: VehicleCategory;
  vehicleLabel: string;
  tripMode: TripDirectionMode;
  tripModeLabel: string;
  plazas: TollPlazaStopItem[];
  plazaCount: number;
  oneWayCarTollInr: number;
  return24hCarTollInr: number;
  appliedTollInr: number;
  fastag24hSavingsInr: number;
  cashPenaltyDoubleInr: number;
  fuelType: FuelType;
  fuelUnitPriceInr: number;
  mileage: number;
  fuelUnitsRequired: number;
  fuelUnitName: "Litres" | "kg" | "kWh";
  fuelCostInr: number;
  totalTripCostInr: number;
  passengers: number;
  costPerPassengerInr: number;
  fuelComparisons: FuelComparisonItem[];
}

export const VEHICLE_CATEGORY_META: Record<
  VehicleCategory,
  { label: string; shortLabel: string; defaultMileage: Record<FuelType, number> }
> = {
  car: {
    label: "Car / Jeep / Van / SUV (4-Wheeler)",
    shortLabel: "Car / SUV",
    defaultMileage: { petrol: 16, diesel: 20, cng: 24, ev: 6.5 },
  },
  lcv: {
    label: "Light Commercial Vehicle (LCV / Mini-Goods)",
    shortLabel: "LCV / Pickup",
    defaultMileage: { petrol: 11, diesel: 14, cng: 16, ev: 4.5 },
  },
  "bus-truck": {
    label: "Bus / Truck (2-Axle Commercial)",
    shortLabel: "Bus / 2-Axle Truck",
    defaultMileage: { petrol: 5, diesel: 6, cng: 6.5, ev: 1.8 },
  },
  "multi-axle": {
    label: "Multi-Axle Heavy Truck (3 to 6 Axle)",
    shortLabel: "Multi-Axle HCV",
    defaultMileage: { petrol: 3.5, diesel: 4, cng: 4.2, ev: 1.2 },
  },
};

export const TRIP_MODE_META: Record<TripDirectionMode, { label: string; description: string }> = {
  "one-way": {
    label: "One-Way Trip",
    description: "Single highway journey from Origin to Destination",
  },
  "return-24h": {
    label: "Same-Day / 24h Return (FASTag Discount)",
    description: "Return across the same NHAI toll plazas within 24 hours (~25% FASTag discount)",
  },
  "round-trip": {
    label: "Round Trip (Return after 24 Hours)",
    description: "Two full single-journey toll deductions (Outward + Return after 24 hours)",
  },
};

export function getAllTollCities(): TollCity[] {
  return tollDataset.cities as TollCity[];
}

export function getAllTollPlazas(): TollPlaza[] {
  return tollDataset.plazas as TollPlaza[];
}

export function getAllCuratedCorridors(): TollCorridor[] {
  return tollDataset.corridors as TollCorridor[];
}

export function getTollCityBySlug(slug: string): TollCity | null {
  const normalized = slug.trim().toLowerCase();
  return (tollDataset.cities as TollCity[]).find((c) => c.slug === normalized) ?? null;
}

export function buildTollRouteSlug(fromSlug: string, toSlug: string): string {
  return `${fromSlug.trim().toLowerCase()}-to-${toSlug.trim().toLowerCase()}-toll-tax-and-fuel-cost`;
}

export function buildTollRoutePath(fromSlug: string, toSlug: string): string {
  return `/toll-calculator/${buildTollRouteSlug(fromSlug, toSlug)}`;
}

export function parseTollRouteSlug(rawSlug: string): { fromCity: TollCity; toCity: TollCity } | null {
  const cleaned = rawSlug
    .trim()
    .toLowerCase()
    .replace(/-toll-tax-and-fuel-cost$/, "")
    .replace(/-toll-tax$/, "")
    .replace(/-toll-calculator$/, "");

  const parts = cleaned.split("-to-");
  if (parts.length !== 2) return null;

  const fromCity = getTollCityBySlug(parts[0]);
  const toCity = getTollCityBySlug(parts[1]);
  if (!fromCity || !toCity || fromCity.slug === toCity.slug) {
    return null;
  }
  return { fromCity, toCity };
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pointToSegmentDistanceKm(
  pLat: number,
  pLng: number,
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number
): { crossTrackKm: number; progressRatio: number } {
  const dx = bLng - aLng;
  const dy = bLat - aLat;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    return { crossTrackKm: haversineKm(pLat, pLng, aLat, aLng), progressRatio: 0 };
  }
  const t = ((pLng - aLng) * dx + (pLat - aLat) * dy) / lenSq;
  const clampedT = Math.max(0, Math.min(1, t));
  const projLat = aLat + clampedT * dy;
  const projLng = aLng + clampedT * dx;
  return {
    crossTrackKm: haversineKm(pLat, pLng, projLat, projLng),
    progressRatio: t,
  };
}

function getPlazaRatesForVehicle(
  plaza: TollPlaza,
  vehicleCategory: VehicleCategory
): { single: number; return24h: number } {
  switch (vehicleCategory) {
    case "car":
      return { single: plaza.carSingle, return24h: plaza.carReturn };
    case "lcv":
      return {
        single: plaza.lcvSingle,
        return24h: Math.round((plaza.lcvSingle * 1.5) / 5) * 5,
      };
    case "bus-truck":
      return {
        single: plaza.busTruckSingle,
        return24h: Math.round((plaza.busTruckSingle * 1.5) / 5) * 5,
      };
    case "multi-axle":
      return {
        single: plaza.multiAxleSingle,
        return24h: Math.round((plaza.multiAxleSingle * 1.5) / 5) * 5,
      };
  }
}

function formatDurationMins(totalMins: number): string {
  const hours = Math.floor(totalMins / 60);
  const mins = Math.round(totalMins % 60);
  if (hours <= 0) return `${mins} mins`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} mins`;
}

export interface ComputeTollPlanInput {
  fromSlug: string;
  toSlug: string;
  vehicleCategory?: VehicleCategory;
  tripMode?: TripDirectionMode;
  fuelType?: FuelType;
  mileage?: number;
  fuelPriceInr?: number;
  passengers?: number;
}

export function computeHighwayTollPlan(input: ComputeTollPlanInput): ComputedTollRoutePlan | null {
  const fromCity = getTollCityBySlug(input.fromSlug);
  const toCity = getTollCityBySlug(input.toSlug);
  if (!fromCity || !toCity || fromCity.slug === toCity.slug) {
    return null;
  }

  const vehicleCategory: VehicleCategory = input.vehicleCategory ?? "car";
  const tripMode: TripDirectionMode = input.tripMode ?? "one-way";
  const fuelType: FuelType = input.fuelType ?? "petrol";
  const passengers = Math.max(1, Math.min(50, Math.round(input.passengers ?? 1)));

  const plazasMap = new Map<string, TollPlaza>(
    getAllTollPlazas().map((p) => [p.id, p])
  );

  // Check curated corridors (forward or reverse)
  const forwardCorridor = getAllCuratedCorridors().find(
    (c) => c.from === fromCity.slug && c.to === toCity.slug
  );
  const reverseCorridor = !forwardCorridor
    ? getAllCuratedCorridors().find(
        (c) => c.from === toCity.slug && c.to === fromCity.slug
      )
    : undefined;

  let oneWayDistanceKm: number;
  let oneWayDurationMins: number;
  let highwaySummary: string;
  let matchedPlazas: TollPlaza[] = [];
  let isCuratedCorridor = false;

  if (forwardCorridor) {
    isCuratedCorridor = true;
    oneWayDistanceKm = forwardCorridor.distanceKm;
    oneWayDurationMins = forwardCorridor.durationMins;
    highwaySummary = forwardCorridor.highwaySummary;
    matchedPlazas = forwardCorridor.plazaIds
      .map((id) => plazasMap.get(id))
      .filter((p): p is TollPlaza => Boolean(p));
  } else if (reverseCorridor) {
    isCuratedCorridor = true;
    oneWayDistanceKm = reverseCorridor.distanceKm;
    oneWayDurationMins = reverseCorridor.durationMins;
    highwaySummary = reverseCorridor.highwaySummary;
    matchedPlazas = [...reverseCorridor.plazaIds]
      .reverse()
      .map((id) => plazasMap.get(id))
      .filter((p): p is TollPlaza => Boolean(p));
  } else {
    // Spatial highway estimation + corridor point-to-segment matching
    const airDistanceKm = haversineKm(fromCity.lat, fromCity.lng, toCity.lat, toCity.lng);
    oneWayDistanceKm = Math.max(45, Math.round(airDistanceKm * 1.24));
    oneWayDurationMins = Math.max(45, Math.round((oneWayDistanceKm / 62) * 60));

    const candidatePlazas = getAllTollPlazas()
      .map((plaza) => {
        const { crossTrackKm, progressRatio } = pointToSegmentDistanceKm(
          plaza.lat,
          plaza.lng,
          fromCity.lat,
          fromCity.lng,
          toCity.lat,
          toCity.lng
        );
        return { plaza, crossTrackKm, progressRatio };
      })
      .filter(
        (item) =>
          item.progressRatio >= 0.04 &&
          item.progressRatio <= 0.96 &&
          item.crossTrackKm <= 68
      )
      .sort((a, b) => a.progressRatio - b.progressRatio);

    matchedPlazas = candidatePlazas.map((item) => item.plaza);

    const uniqueHighways = Array.from(
      new Set(matchedPlazas.map((p) => p.highway.split(" (")[0]))
    ).slice(0, 3);

    highwaySummary =
      uniqueHighways.length > 0
        ? `${uniqueHighways.join(" • ")} National Highway Corridor`
        : `National Highway Corridor (${fromCity.state} → ${toCity.state})`;
  }

  const tripMultiplier = tripMode === "one-way" ? 1 : 2;
  const effectiveDistanceKm = oneWayDistanceKm * tripMultiplier;
  const effectiveDurationMins = oneWayDurationMins * tripMultiplier;

  const totalPlazas = matchedPlazas.length;
  const plazaStops: TollPlazaStopItem[] = matchedPlazas.map((plaza, idx) => {
    const rates = getPlazaRatesForVehicle(plaza, vehicleCategory);
    const appliedFareInr =
      tripMode === "one-way"
        ? rates.single
        : tripMode === "return-24h"
        ? rates.return24h
        : rates.single * 2;

    const rawDistFromOrigin = Math.round(
      haversineKm(fromCity.lat, fromCity.lng, plaza.lat, plaza.lng) * 1.18
    );
    const fallbackKm = Math.round(
      ((idx + 1) / (totalPlazas + 1)) * oneWayDistanceKm
    );
    const estimatedKmFromOrigin = Math.min(
      oneWayDistanceKm - 8,
      Math.max(12, rawDistFromOrigin > 0 && rawDistFromOrigin < oneWayDistanceKm ? rawDistFromOrigin : fallbackKm)
    );

    return {
      index: idx + 1,
      plaza,
      estimatedKmFromOrigin,
      singleFareInr: rates.single,
      return24hFareInr: rates.return24h,
      appliedFareInr,
    };
  });

  // Fallback estimated NHAI toll if a long cross-country city pair doesn't cross our 52 specific plazas
  const rawOneWayCarToll = matchedPlazas.reduce((acc, p) => acc + p.carSingle, 0);
  const rawReturn24hCarToll = matchedPlazas.reduce((acc, p) => acc + p.carReturn, 0);
  const rawAppliedToll = plazaStops.reduce((acc, s) => acc + s.appliedFareInr, 0);

  const fallbackCarSingle =
    totalPlazas === 0
      ? Math.round((oneWayDistanceKm * 1.55) / 5) * 5
      : rawOneWayCarToll;
  const fallbackCarReturn =
    totalPlazas === 0
      ? Math.round((fallbackCarSingle * 1.5) / 5) * 5
      : rawReturn24hCarToll;

  const vehicleMultiplier =
    vehicleCategory === "car"
      ? 1
      : vehicleCategory === "lcv"
      ? 1.6
      : vehicleCategory === "bus-truck"
      ? 3.35
      : 5.25;

  const appliedTollInr =
    totalPlazas > 0
      ? rawAppliedToll
      : Math.round(
          ((tripMode === "one-way"
            ? fallbackCarSingle
            : tripMode === "return-24h"
            ? fallbackCarReturn
            : fallbackCarSingle * 2) *
            vehicleMultiplier) /
            5
        ) * 5;

  const singleFullTollForVehicle =
    totalPlazas > 0
      ? plazaStops.reduce((acc, s) => acc + s.singleFareInr, 0)
      : Math.round((fallbackCarSingle * vehicleMultiplier) / 5) * 5;

  const return24hTollForVehicle =
    totalPlazas > 0
      ? plazaStops.reduce((acc, s) => acc + s.return24hFareInr, 0)
      : Math.round((fallbackCarReturn * vehicleMultiplier) / 5) * 5;

  const fastag24hSavingsInr = Math.max(
    0,
    singleFullTollForVehicle * 2 - return24hTollForVehicle
  );

  // Default fuel price from origin city if not explicitly passed
  const defaultFuelPrices: Record<FuelType, number> = {
    petrol: fromCity.petrolInr,
    diesel: fromCity.dieselInr,
    cng: fromCity.cngInr,
    ev: fromCity.evKwhInr,
  };

  const fuelUnitPriceInr =
    input.fuelPriceInr && input.fuelPriceInr > 0
      ? input.fuelPriceInr
      : defaultFuelPrices[fuelType];

  const defaultMileageForSelection =
    VEHICLE_CATEGORY_META[vehicleCategory].defaultMileage[fuelType];
  const mileage =
    input.mileage && input.mileage > 0
      ? input.mileage
      : defaultMileageForSelection;

  const fuelUnitsRequired = Number((effectiveDistanceKm / mileage).toFixed(1));
  const fuelCostInr = Math.round(fuelUnitsRequired * fuelUnitPriceInr);
  const totalTripCostInr = appliedTollInr + fuelCostInr;
  const costPerPassengerInr = Math.round(totalTripCostInr / passengers);

  const fuelUnitName: "Litres" | "kg" | "kWh" =
    fuelType === "cng" ? "kg" : fuelType === "ev" ? "kWh" : "Litres";

  const fuelMetaList: { type: FuelType; label: string; unit: string }[] = [
    { type: "petrol", label: "Petrol", unit: "L" },
    { type: "diesel", label: "Diesel", unit: "L" },
    { type: "cng", label: "CNG", unit: "kg" },
    { type: "ev", label: "Electric (EV DC Fast Charge)", unit: "kWh" },
  ];

  const fuelComparisons: FuelComparisonItem[] = fuelMetaList.map((fm) => {
    const eff = VEHICLE_CATEGORY_META[vehicleCategory].defaultMileage[fm.type];
    const price = defaultFuelPrices[fm.type];
    const units = Number((effectiveDistanceKm / eff).toFixed(1));
    const fCost = Math.round(units * price);
    return {
      fuelType: fm.type,
      label: fm.label,
      unitPriceLabel: `₹${price.toFixed(2)}/${fm.unit}`,
      efficiencyLabel: `${eff} km/${fm.unit}`,
      unitsConsumed: units,
      fuelCostInr: fCost,
      totalWithTollInr: fCost + appliedTollInr,
    };
  });

  const routeSlug = buildTollRouteSlug(fromCity.slug, toCity.slug);

  return {
    fromCity,
    toCity,
    routeSlug,
    routePath: `/toll-calculator/${routeSlug}`,
    isCuratedCorridor,
    highwaySummary,
    oneWayDistanceKm,
    effectiveDistanceKm,
    oneWayDurationMins,
    effectiveDurationMins,
    durationFormatted: formatDurationMins(effectiveDurationMins),
    vehicleCategory,
    vehicleLabel: VEHICLE_CATEGORY_META[vehicleCategory].label,
    tripMode,
    tripModeLabel: TRIP_MODE_META[tripMode].label,
    plazas: plazaStops,
    plazaCount: plazaStops.length,
    oneWayCarTollInr: fallbackCarSingle,
    return24hCarTollInr: fallbackCarReturn,
    appliedTollInr,
    fastag24hSavingsInr,
    cashPenaltyDoubleInr: appliedTollInr * 2,
    fuelType,
    fuelUnitPriceInr,
    mileage,
    fuelUnitsRequired,
    fuelUnitName,
    fuelCostInr,
    totalTripCostInr,
    passengers,
    costPerPassengerInr,
    fuelComparisons,
  };
}

export interface PopularTollRouteSummary {
  fromSlug: string;
  toSlug: string;
  fromName: string;
  toName: string;
  distanceKm: number;
  durationFormatted: string;
  highwaySummary: string;
  plazaCount: number;
  carSingleTollInr: number;
  carReturn24hTollInr: number;
  petrolOneWayCostInr: number;
  routeSlug: string;
  routePath: string;
}

export function getPopularTollRoutes(limit = 30): PopularTollRouteSummary[] {
  const corridors = getAllCuratedCorridors().slice(0, limit);
  const results: PopularTollRouteSummary[] = [];

  for (const c of corridors) {
    const plan = computeHighwayTollPlan({
      fromSlug: c.from,
      toSlug: c.to,
      vehicleCategory: "car",
      tripMode: "one-way",
      fuelType: "petrol",
    });
    if (!plan) continue;
    results.push({
      fromSlug: plan.fromCity.slug,
      toSlug: plan.toCity.slug,
      fromName: plan.fromCity.name,
      toName: plan.toCity.name,
      distanceKm: plan.oneWayDistanceKm,
      durationFormatted: plan.durationFormatted,
      highwaySummary: plan.highwaySummary,
      plazaCount: plan.plazaCount,
      carSingleTollInr: plan.oneWayCarTollInr,
      carReturn24hTollInr: plan.return24hCarTollInr,
      petrolOneWayCostInr: plan.fuelCostInr,
      routeSlug: plan.routeSlug,
      routePath: plan.routePath,
    });
  }

  return results;
}

export interface IndexableTollRouteItem {
  fromSlug: string;
  toSlug: string;
  fromName: string;
  toName: string;
  fromState: string;
  toState: string;
  routeSlug: string;
  routePath: string;
  isPrimaryCorridor: boolean;
}

export interface CityOriginRouteGroup {
  originCity: TollCity;
  routes: IndexableTollRouteItem[];
}

export function getAllIndexableTollRouteSlugs(): IndexableTollRouteItem[] {
  const seen = new Set<string>();
  const items: IndexableTollRouteItem[] = [];

  // 1. All 30 curated corridors in BOTH directions (60 top-intent highway routes)
  for (const c of getAllCuratedCorridors()) {
    const fromCity = getTollCityBySlug(c.from);
    const toCity = getTollCityBySlug(c.to);
    if (!fromCity || !toCity) continue;

    const fwdSlug = buildTollRouteSlug(fromCity.slug, toCity.slug);
    if (!seen.has(fwdSlug)) {
      seen.add(fwdSlug);
      items.push({
        fromSlug: fromCity.slug,
        toSlug: toCity.slug,
        fromName: fromCity.name,
        toName: toCity.name,
        fromState: fromCity.state,
        toState: toCity.state,
        routeSlug: fwdSlug,
        routePath: `/toll-calculator/${fwdSlug}`,
        isPrimaryCorridor: true,
      });
    }

    const revSlug = buildTollRouteSlug(toCity.slug, fromCity.slug);
    if (!seen.has(revSlug)) {
      seen.add(revSlug);
      items.push({
        fromSlug: toCity.slug,
        toSlug: fromCity.slug,
        fromName: toCity.name,
        toName: fromCity.name,
        fromState: toCity.state,
        toState: fromCity.state,
        routeSlug: revSlug,
        routePath: `/toll-calculator/${revSlug}`,
        isPrimaryCorridor: true,
      });
    }
  }

  // 2. Additional high-search regional highway combinations across top hubs (marked primary)
  const highVolumePairs: [string, string][] = [
    ["jaipur", "udaipur"],
    ["jaipur", "ajmer"],
    ["jaipur", "jodhpur"],
    ["jaipur", "kota"],
    ["jaipur", "agra"],
    ["jaipur", "chandigarh"],
    ["jaipur", "haridwar"],
    ["agra", "lucknow"],
    ["agra", "varanasi"],
    ["agra", "ayodhya"],
    ["lucknow", "ayodhya"],
    ["lucknow", "prayagraj"],
    ["lucknow", "kanpur"],
    ["prayagraj", "varanasi"],
    ["prayagraj", "ayodhya"],
    ["chandigarh", "manali"],
    ["chandigarh", "shimla"],
    ["chandigarh", "amritsar"],
    ["chandigarh", "katra"],
    ["chandigarh", "jammu"],
    ["ludhiana", "amritsar"],
    ["jammu", "katra"],
    ["haridwar", "rishikesh"],
    ["haridwar", "dehradun"],
    ["ahmedabad", "vadodara"],
    ["ahmedabad", "surat"],
    ["surat", "vadodara"],
    ["pune", "shirdi"],
    ["pune", "nashik"],
    ["pune", "hyderabad"],
    ["pune", "bengaluru"],
    ["hyderabad", "tirupati"],
    ["hyderabad", "chennai"],
    ["chennai", "tirupati"],
    ["chennai", "coimbatore"],
    ["chennai", "mysuru"],
    ["indore", "bhopal"],
    ["indore", "ahmedabad"],
    ["indore", "mumbai"],
    ["delhi", "prayagraj"],
    ["delhi", "kanpur"],
    ["delhi", "jodhpur"],
    ["delhi", "kota"],
    ["delhi", "jammu"],
    ["delhi", "ludhiana"],
    ["delhi", "indore"],
    ["delhi", "bhopal"],
    ["delhi", "ahmedabad"],
    ["delhi", "mumbai"],
  ];

  for (const [a, b] of highVolumePairs) {
    const cityA = getTollCityBySlug(a);
    const cityB = getTollCityBySlug(b);
    if (!cityA || !cityB) continue;

    for (const [origin, dest] of [
      [cityA, cityB],
      [cityB, cityA],
    ]) {
      const slug = buildTollRouteSlug(origin.slug, dest.slug);
      if (!seen.has(slug)) {
        seen.add(slug);
        items.push({
          fromSlug: origin.slug,
          toSlug: dest.slug,
          fromName: origin.name,
          toName: dest.name,
          fromState: origin.state,
          toState: dest.state,
          routeSlug: slug,
          routePath: `/toll-calculator/${slug}`,
          isPrimaryCorridor: true,
        });
      }
    }
  }

  // 3. Complete All-to-All City Combinations (40 Origin Cities x 39 Destination Cities = 1,560 Total Routes)
  const allCities = getAllTollCities();
  for (const origin of allCities) {
    for (const dest of allCities) {
      if (origin.slug === dest.slug) continue;
      const slug = buildTollRouteSlug(origin.slug, dest.slug);
      if (!seen.has(slug)) {
        seen.add(slug);
        items.push({
          fromSlug: origin.slug,
          toSlug: dest.slug,
          fromName: origin.name,
          toName: dest.name,
          fromState: origin.state,
          toState: dest.state,
          routeSlug: slug,
          routePath: `/toll-calculator/${slug}`,
          isPrimaryCorridor: false,
        });
      }
    }
  }

  return items;
}

export function getAllCityCombinationGroups(): CityOriginRouteGroup[] {
  const allCities = getAllTollCities();
  const allRoutes = getAllIndexableTollRouteSlugs();
  const byOrigin = new Map<string, IndexableTollRouteItem[]>();

  for (const route of allRoutes) {
    const list = byOrigin.get(route.fromSlug);
    if (list) {
      list.push(route);
    } else {
      byOrigin.set(route.fromSlug, [route]);
    }
  }

  return allCities.map((originCity) => {
    const routes = (byOrigin.get(originCity.slug) ?? []).sort((a, b) => {
      if (a.isPrimaryCorridor !== b.isPrimaryCorridor) {
        return a.isPrimaryCorridor ? -1 : 1;
      }
      return a.toName.localeCompare(b.toName);
    });
    return {
      originCity,
      routes,
    };
  });
}

