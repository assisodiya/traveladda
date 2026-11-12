"use client";

import React, {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  CalculatorIcon,
  CheckCircleIcon,
  CloseIcon,
  CopyIcon,
  MapPinIcon,
  PrinterIcon,
  RefreshIcon,
  RupeeBadgeIcon,
  SearchIcon,
  ShieldCheckIcon,
  SwapIcon,
  TicketIcon,
  TranslateIcon,
  WhatsAppIcon,
  ZapIcon,
} from "@/components/Icons";
import {
  buildTollRoutePath,
  ComputedTollRoutePlan,
  computeHighwayTollPlan,
  FuelType,
  getAllTollCities,
  TollCity,
  TripDirectionMode,
  VEHICLE_CATEGORY_META,
  VehicleCategory,
} from "@/lib/toll-service";

interface HighwayTollCalculatorProps {
  initialFromSlug?: string;
  initialToSlug?: string;
  initialPlan?: ComputedTollRoutePlan | null;
  cities?: TollCity[];
  isDedicatedRoutePage?: boolean;
}

const QUICK_CORRIDOR_PILLS: {
  from: string;
  to: string;
  label: string;
  tag: string;
}[] = [
  { from: "delhi", to: "jaipur", label: "Delhi → Jaipur", tag: "NH-48 / NE-4" },
  { from: "delhi", to: "agra", label: "Delhi → Agra", tag: "Yamuna Expy" },
  { from: "mumbai", to: "pune", label: "Mumbai → Pune", tag: "MPEW Expy" },
  {
    from: "delhi",
    to: "chandigarh",
    label: "Delhi → Chandigarh",
    tag: "NH-44 GT Rd",
  },
  {
    from: "bengaluru",
    to: "mysuru",
    label: "Bengaluru → Mysuru",
    tag: "NH-275 Expy",
  },
  {
    from: "delhi",
    to: "haridwar",
    label: "Delhi → Haridwar",
    tag: "NE-3 / NH-334",
  },
  {
    from: "delhi",
    to: "lucknow",
    label: "Delhi → Lucknow",
    tag: "Agra-LKO Expy",
  },
  { from: "delhi", to: "manali", label: "Delhi → Manali", tag: "NH-44 / NH-3" },
  { from: "mumbai", to: "shirdi", label: "Mumbai → Shirdi", tag: "Samruddhi" },
  {
    from: "bengaluru",
    to: "chennai",
    label: "Bengaluru → Chennai",
    tag: "NH-48",
  },
];

const CITY_SEARCH_ALIASES: Record<string, string> = {
  delhi: "new delhi ncr noida gurugram gurgaon faridabad ghaziabad",
  jaipur: "pink city rajasthan",
  agra: "taj mahal mathura vrindavan",
  mumbai: "bombay navi mumbai thane",
  pune: "lonavala pimpri chinchwad",
  bengaluru: "bangalore electronic city",
  mysuru: "mysore",
  chennai: "madras",
  kolkata: "calcutta howrah",
  varanasi: "kashi banaras benares",
  prayagraj: "allahabad sangam",
  ayodhya: "ram mandir faizabad",
  katra: "vaishno devi smvd",
  haridwar: "roorkee",
  rishikesh: "aiims rishikesh",
  dehradun: "mussoorie",
  chandigarh: "mohali panchkula zirakpur",
  manali: "kullu kasol rohtang",
  shimla: "kalka solan kufri",
  goa: "panaji panjim madgaon calangute",
};

/**
 * Generates a deterministic 21x21 QR-style matrix from any dynamic URL + route payload
 * so the user gets an instant visual Dynamic Trip Pass QR on both SSR and client updates.
 */
function buildDynamicQrMatrix(seedText: string): boolean[][] {
  const size = 21;
  const grid: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );
  const reserved: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  const placeFinder = (rowOffset: number, colOffset: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = rowOffset + r;
        const cc = colOffset + c;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        reserved[rr][cc] = true;
        if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[rr][cc] = isBorder || isInner;
        }
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    reserved[6][i] = true;
    reserved[i][6] = true;
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  let hash = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    hash ^= seedText.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  let step = 1;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (reserved[r][c]) continue;
      const charCode =
        seedText.charCodeAt((r * size + c) % seedText.length) || 42;
      const mixed = Math.imul(hash ^ (charCode * step), 2246822519);
      step++;
      grid[r][c] = (Math.abs(mixed) & 1) === 1;
    }
  }

  return grid;
}

export default function HighwayTollCalculator({
  initialFromSlug = "delhi",
  initialToSlug = "jaipur",
  initialPlan = null,
  cities: providedCities,
  isDedicatedRoutePage = false,
}: HighwayTollCalculatorProps) {
  const router = useRouter();
  const cities = useMemo(
    () => providedCities ?? getAllTollCities(),
    [providedCities]
  );

  const citiesBySlug = useMemo(() => {
    const map = new Map<string, TollCity>();
    for (const c of cities) map.set(c.slug, c);
    return map;
  }, [cities]);

  const [fromSlug, setFromSlug] = useState<string>(initialFromSlug);
  const [toSlug, setToSlug] = useState<string>(initialToSlug);
  const [fromSearchText, setFromSearchText] = useState<string>(
    () => citiesBySlug.get(initialFromSlug)?.name || "Delhi NCR"
  );
  const [toSearchText, setToSearchText] = useState<string>(
    () => citiesBySlug.get(initialToSlug)?.name || "Jaipur"
  );
  const [fromDropdownOpen, setFromDropdownOpen] = useState<boolean>(false);
  const [toDropdownOpen, setToDropdownOpen] = useState<boolean>(false);

  const [vehicleCategory, setVehicleCategory] =
    useState<VehicleCategory>("car");
  const [tripMode, setTripMode] = useState<TripDirectionMode>("one-way");
  const [fuelType, setFuelType] = useState<FuelType>("petrol");
  const [customMileage, setCustomMileage] = useState<string>("16");
  const [customFuelPrice, setCustomFuelPrice] = useState<string>("");
  const [passengers, setPassengers] = useState<number>(4);
  const [navigating, setNavigating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const isHindi = lang === "hi";

  const fromBoxRef = useRef<HTMLDivElement>(null);
  const toBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (fromBoxRef.current && !fromBoxRef.current.contains(target)) {
        setFromDropdownOpen(false);
      }
      if (toBoxRef.current && !toBoxRef.current.contains(target)) {
        setToDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, []);

  const filterCities = (query: string, excludeSlug?: string) => {
    const clean = query.trim().toLowerCase();
    const currentFromName = citiesBySlug.get(fromSlug)?.name.toLowerCase();
    const currentToName = citiesBySlug.get(toSlug)?.name.toLowerCase();

    if (!clean || clean === currentFromName || clean === currentToName) {
      return cities.filter((c) => c.slug !== excludeSlug);
    }

    const scored: { city: TollCity; score: number }[] = [];
    for (const c of cities) {
      if (c.slug === excludeSlug) continue;
      const nameL = c.name.toLowerCase();
      const stateL = c.state.toLowerCase();
      const alias = CITY_SEARCH_ALIASES[c.slug] || "";
      let score = 0;
      if (nameL === clean || c.slug === clean) score = 100;
      else if (nameL.startsWith(clean) || c.slug.startsWith(clean)) score = 85;
      else if (nameL.includes(clean)) score = 70;
      else if (alias.includes(clean)) score = 60;
      else if (stateL.includes(clean)) score = 45;

      if (score > 0) {
        scored.push({ city: c, score });
      }
    }
    scored.sort(
      (a, b) => b.score - a.score || a.city.name.localeCompare(b.city.name)
    );
    return scored.map((s) => s.city);
  };

  const deferredFromSearch = useDeferredValue(fromSearchText);
  const deferredToSearch = useDeferredValue(toSearchText);

  const filteredFromCities = useMemo(
    () => filterCities(deferredFromSearch, toSlug),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deferredFromSearch, toSlug, cities, fromSlug]
  );

  const filteredToCities = useMemo(
    () => filterCities(deferredToSearch, fromSlug),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deferredToSearch, fromSlug, cities, toSlug]
  );

  const resolveCityFromInput = (
    rawText: string,
    fallbackSlug: string
  ): TollCity | null => {
    const clean = rawText.trim().toLowerCase();
    if (!clean) return citiesBySlug.get(fallbackSlug) ?? null;

    const exact = cities.find(
      (c) => c.name.toLowerCase() === clean || c.slug === clean
    );
    if (exact) return exact;

    const matches = filterCities(clean);
    if (matches.length > 0) return matches[0];
    return citiesBySlug.get(fallbackSlug) ?? null;
  };

  const navigateToSsrRoute = (nextFromSlug: string, nextToSlug: string) => {
    if (!nextFromSlug || !nextToSlug) {
      setErrorMessage("Please select both Origin and Destination cities.");
      return;
    }
    if (nextFromSlug === nextToSlug) {
      setErrorMessage(
        "Origin and Destination cannot be the same city. Please pick two different cities."
      );
      return;
    }
    setErrorMessage(null);
    const targetPath = buildTollRoutePath(nextFromSlug, nextToSlug);
    if (
      !isDedicatedRoutePage ||
      nextFromSlug !== initialFromSlug ||
      nextToSlug !== initialToSlug
    ) {
      setNavigating(true);
      router.push(targetPath);
    }
  };

  const handleSelectOrigin = (city: TollCity) => {
    const nextTo = city.slug === toSlug ? fromSlug : toSlug;
    setFromSlug(city.slug);
    setFromSearchText(city.name);
    if (city.slug === toSlug) {
      setToSlug(fromSlug);
      setToSearchText(citiesBySlug.get(fromSlug)?.name || "");
    }
    setFromDropdownOpen(false);
    setErrorMessage(null);
    navigateToSsrRoute(city.slug, nextTo);
  };

  const handleSelectDestination = (city: TollCity) => {
    const nextFrom = city.slug === fromSlug ? toSlug : fromSlug;
    setToSlug(city.slug);
    setToSearchText(city.name);
    if (city.slug === fromSlug) {
      setFromSlug(toSlug);
      setFromSearchText(citiesBySlug.get(toSlug)?.name || "");
    }
    setToDropdownOpen(false);
    setErrorMessage(null);
    navigateToSsrRoute(nextFrom, city.slug);
  };

  const handleSwapCities = () => {
    const prevFrom = fromSlug;
    const prevTo = toSlug;
    setFromSlug(prevTo);
    setToSlug(prevFrom);
    setFromSearchText(citiesBySlug.get(prevTo)?.name || "");
    setToSearchText(citiesBySlug.get(prevFrom)?.name || "");
    setErrorMessage(null);
    navigateToSsrRoute(prevTo, prevFrom);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedOrigin = resolveCityFromInput(fromSearchText, fromSlug);
    const resolvedDest = resolveCityFromInput(toSearchText, toSlug);

    if (!resolvedOrigin || !resolvedDest) {
      setErrorMessage("Please choose valid Origin and Destination cities.");
      return;
    }
    if (resolvedOrigin.slug === resolvedDest.slug) {
      setErrorMessage(
        "Origin and Destination cannot be the same city. Please choose two different cities."
      );
      return;
    }

    setFromSlug(resolvedOrigin.slug);
    setToSlug(resolvedDest.slug);
    setFromSearchText(resolvedOrigin.name);
    setToSearchText(resolvedDest.name);
    setFromDropdownOpen(false);
    setToDropdownOpen(false);
    navigateToSsrRoute(resolvedOrigin.slug, resolvedDest.slug);
  };

  const handleVehicleOrFuelChange = (
    nextVehicle: VehicleCategory,
    nextFuel: FuelType,
    originSlug: string
  ) => {
    setVehicleCategory(nextVehicle);
    setFuelType(nextFuel);
    const defaultEff = String(
      VEHICLE_CATEGORY_META[nextVehicle].defaultMileage[nextFuel]
    );
    setCustomMileage(defaultEff);

    const originCity = citiesBySlug.get(originSlug);
    if (originCity) {
      const priceMap: Record<FuelType, number> = {
        petrol: originCity.petrolInr,
        diesel: originCity.dieselInr,
        cng: originCity.cngInr,
        ev: originCity.evKwhInr,
      };
      setCustomFuelPrice(String(priceMap[nextFuel]));
    }
  };

  const parsedMileage = parseFloat(customMileage);
  const parsedFuelPrice = parseFloat(customFuelPrice);

  // Use SSR initialPlan immediately when state matches default SSR props, otherwise compute live
  const plan: ComputedTollRoutePlan | null = useMemo(() => {
    const isDefaultSsrState =
      initialPlan &&
      fromSlug === initialPlan.fromCity.slug &&
      toSlug === initialPlan.toCity.slug &&
      vehicleCategory === "car" &&
      tripMode === "one-way" &&
      fuelType === "petrol" &&
      (customMileage === "16" || !customMileage) &&
      !customFuelPrice &&
      passengers === 4;

    if (isDefaultSsrState) {
      return initialPlan;
    }

    return computeHighwayTollPlan({
      fromSlug,
      toSlug,
      vehicleCategory,
      tripMode,
      fuelType,
      mileage:
        Number.isFinite(parsedMileage) && parsedMileage > 0
          ? parsedMileage
          : undefined,
      fuelPriceInr:
        Number.isFinite(parsedFuelPrice) && parsedFuelPrice > 0
          ? parsedFuelPrice
          : undefined,
      passengers,
    });
  }, [
    initialPlan,
    fromSlug,
    toSlug,
    vehicleCategory,
    tripMode,
    fuelType,
    customMileage,
    customFuelPrice,
    parsedMileage,
    parsedFuelPrice,
    passengers,
  ]);

  const currentDynamicPath = useMemo(() => {
    const basePath = buildTollRoutePath(fromSlug, toSlug);
    const params = new URLSearchParams();
    if (vehicleCategory !== "car") params.set("vehicle", vehicleCategory);
    if (tripMode !== "one-way") params.set("trip", tripMode);
    if (fuelType !== "petrol") params.set("fuel", fuelType);
    if (passengers !== 4) params.set("passengers", String(passengers));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }, [fromSlug, toSlug, vehicleCategory, tripMode, fuelType, passengers]);

  const qrMatrix = useMemo(
    () =>
      buildDynamicQrMatrix(
        `https://traveladda.in${currentDynamicPath}|toll=${plan?.appliedTollInr ?? 0}|fuel=${plan?.fuelCostInr ?? 0}`
      ),
    [currentDynamicPath, plan?.appliedTollInr, plan?.fuelCostInr]
  );

  const handleCopyDynamicLink = async () => {
    try {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://traveladda.in";
      await navigator.clipboard.writeText(`${origin}${currentDynamicPath}`);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      // Ignore clipboard permission errors
    }
  };

  const handleWhatsAppShare = () => {
    if (!plan || typeof window === "undefined") return;
    const shareUrl = `https://traveladda.in${currentDynamicPath}`;
    const text = [
      isHindi
        ? `🚗 *NHAI FASTag टोल और फ्यूल ट्रिप पास (${plan.fromCity.name} → ${plan.toCity.name})*`
        : `🚗 *NHAI FASTag Highway Toll & Fuel Trip Pass (${plan.fromCity.name} → ${plan.toCity.name})*`,
      `• ${isHindi ? "रूट दूरी व समय" : "Distance & Time"}: ${plan.effectiveDistanceKm} km (${plan.durationFormatted}) • ${plan.tripModeLabel}`,
      `• ${isHindi ? "वाहन व ईंधन" : "Vehicle & Fuel"}: ${VEHICLE_CATEGORY_META[plan.vehicleCategory].shortLabel} • ${plan.fuelType.toUpperCase()}`,
      `• ${isHindi ? "NHAI FASTag टोल टैक्स" : "NHAI FASTag Toll Tax"}: ₹${plan.appliedTollInr.toLocaleString("en-IN")} (${plan.plazaCount || "NHAI"} Plazas)`,
      `• ${isHindi ? "अनुमानित ईंधन खर्च" : "Estimated Fuel Cost"}: ₹${plan.fuelCostInr.toLocaleString("en-IN")} (${plan.fuelUnitsRequired} ${plan.fuelUnitName})`,
      `• *${isHindi ? "कुल ट्रिप खर्च" : "Total Road Trip Cost"}: ₹${plan.totalTripCostInr.toLocaleString("en-IN")}* (₹${plan.costPerPassengerInr.toLocaleString("en-IN")}/${isHindi ? "यात्री" : "pax"})`,
      `🔗 ${isHindi ? "सभी टोल प्लाजा और रूट मैप देखें" : "Live Plaza-by-Plaza Toll & Route"}: ${shareUrl}`,
    ].join("\n");

    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Main Search & Filter Card (SSR + White Mode & Dark Mode) */}
      <div className="rounded-2xl border border-line bg-card p-4 shadow-lg sm:p-6">
        {/* Card Header + Journey Type Action Buttons */}
        <div className="mb-4 flex flex-col gap-3 border-b border-line pb-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1956b4] text-white shadow-xs">
              <TicketIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-extrabold text-ink sm:text-base">
                {isDedicatedRoutePage && plan
                  ? isHindi
                    ? `${plan.fromCity.name} से ${plan.toCity.name} NHAI FASTag टोल और ईंधन कैलकुलेटर`
                    : `${plan.fromCity.name} to ${plan.toCity.name} Highway Toll & Fuel Planner`
                  : isHindi
                  ? "NHAI FASTag हाईवे टोल टैक्स और फ्यूल खर्च कैलकुलेटर"
                  : "Search NHAI FASTag Highway Toll & Fuel Cost"}
              </h2>
              <p className="truncate text-[11px] text-ink-muted sm:text-xs">
                {isHindi
                  ? "40+ शहर • 1,560 हाईवे रूट • 24h रिटर्न छूट और डायनामिक QR पास"
                  : "40+ Cities • 52+ NHAI & Expressway Plazas • SSR Route Pages & Dynamic QR"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Language Switcher: English / हिंदी */}
            <div
              role="group"
              aria-label="Language Switcher"
              className="inline-flex items-center gap-1 rounded-xl border border-[#1956b4]/30 bg-subcard p-1"
            >
              <span className="pl-1.5 text-[#1956b4] dark:text-blue-300">
                <TranslateIcon className="h-3.5 w-3.5" />
              </span>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition sm:text-xs ${
                  !isHindi
                    ? "bg-[#1956b4] text-white shadow-2xs"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang("hi")}
                className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition sm:text-xs ${
                  isHindi
                    ? "bg-[#fc6203] text-white shadow-2xs"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* Journey Mode Action Buttons */}
            <div
              role="group"
              aria-label="Journey type"
              className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-subcard p-1 sm:inline-flex"
            >
              {(
                [
                  { id: "one-way", label: isHindi ? "एक तरफ (One-Way)" : "One-Way" },
                  {
                    id: "return-24h",
                    label: isHindi ? "24h वापसी (-25%)" : "24h Return (-25%)",
                  },
                  {
                    id: "round-trip",
                    label: isHindi ? "राउंड ट्रिप" : "Round Trip",
                  },
                ] as const
              ).map((tab) => {
                const isSelected = tripMode === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTripMode(tab.id)}
                    className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-center text-[11px] font-extrabold transition sm:px-3 sm:text-xs ${
                      isSelected
                        ? "bg-[#1956b4] text-white shadow-xs"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Origin / Swap / Destination / Search Submit Form */}
        <form onSubmit={handleFormSubmit}>
          <div className="relative grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto] lg:items-end">
            {/* Origin City Combobox */}
            <div ref={fromBoxRef} className="relative">
              <label
                htmlFor="toll-origin-input"
                className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-ink-muted"
              >
                From (Origin City)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                  <MapPinIcon className="h-3.5 w-3.5" />
                </span>
                <input
                  id="toll-origin-input"
                  type="text"
                  value={fromSearchText}
                  onFocus={() => {
                    setFromDropdownOpen(true);
                    setToDropdownOpen(false);
                  }}
                  onChange={(e) => {
                    setFromSearchText(e.target.value);
                    setFromDropdownOpen(true);
                  }}
                  placeholder="Enter Origin City (e.g. Delhi, Mumbai)..."
                  autoComplete="off"
                  className="ta-search-box h-12 w-full rounded-xl border border-line-strong bg-input pl-10 pr-20 text-sm font-extrabold text-ink outline-none focus:border-[#1956b4]"
                />
                {fromSearchText && (
                  <button
                    type="button"
                    onClick={() => {
                      setFromSearchText("");
                      setFromDropdownOpen(true);
                    }}
                    aria-label="Clear origin city"
                    className="cursor-pointer absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-muted hover:bg-subcard hover:text-ink"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              {fromDropdownOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-72 overflow-y-auto rounded-2xl border border-line bg-card p-1.5 shadow-2xl ring-1 ring-black/10">
                  <div className="sticky top-0 z-10 flex items-center justify-between bg-card/95 px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-ink-muted backdrop-blur-xs">
                    <span>
                      {fromSearchText.trim()
                        ? "Matching Origin Cities"
                        : "Select Origin City (40 Cities)"}
                    </span>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setFromDropdownOpen(false);
                      }}
                      className="cursor-pointer rounded px-1.5 py-0.5 text-[10px] font-bold text-[#1956b4]"
                    >
                      Close
                    </button>
                  </div>
                  {filteredFromCities.length > 0 ? (
                    filteredFromCities.map((city) => (
                      <button
                        key={city.slug}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectOrigin(city);
                        }}
                        className={`cursor-pointer flex min-h-[42px] w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition hover:bg-subcard ${
                          city.slug === fromSlug
                            ? "bg-blue-50/90 font-extrabold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                            : "text-ink"
                        }`}
                      >
                        <div>
                          <span className="block text-xs sm:text-sm">
                            {city.name}
                          </span>
                          <span className="text-[10px] font-medium text-ink-muted">
                            {city.state}
                          </span>
                        </div>
                        <span className="rounded bg-subcard px-2 py-0.5 text-[10px] font-semibold text-ink-soft">
                          Petrol ₹{city.petrolInr}/L
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-xs text-ink-muted">
                      No city found matching &ldquo;{fromSearchText}&rdquo;
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleSwapCities}
                title="Swap Origin and Destination Cities"
                className="cursor-pointer inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-line bg-subcard px-3 text-xs font-extrabold text-[#1956b4] transition hover:border-[#1956b4] hover:bg-blue-50 active:scale-95 lg:h-12 lg:w-12 dark:text-blue-300 dark:hover:bg-blue-950/40"
              >
                <SwapIcon className="h-4 w-4" />
                <span className="lg:hidden">Reverse Highway Direction</span>
              </button>
            </div>

            {/* Destination City Combobox */}
            <div ref={toBoxRef} className="relative">
              <label
                htmlFor="toll-dest-input"
                className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-ink-muted"
              >
                To (Destination City)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-orange-500/15 text-[#fc6203]">
                  <MapPinIcon className="h-3.5 w-3.5" />
                </span>
                <input
                  id="toll-dest-input"
                  type="text"
                  value={toSearchText}
                  onFocus={() => {
                    setToDropdownOpen(true);
                    setFromDropdownOpen(false);
                  }}
                  onChange={(e) => {
                    setToSearchText(e.target.value);
                    setToDropdownOpen(true);
                  }}
                  placeholder="Enter Destination (e.g. Jaipur, Agra)..."
                  autoComplete="off"
                  className="ta-search-box h-12 w-full rounded-xl border border-line-strong bg-input pl-10 pr-20 text-sm font-extrabold text-ink outline-none focus:border-[#1956b4]"
                />
                {toSearchText && (
                  <button
                    type="button"
                    onClick={() => {
                      setToSearchText("");
                      setToDropdownOpen(true);
                    }}
                    aria-label="Clear destination city"
                    className="cursor-pointer absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-muted hover:bg-subcard hover:text-ink"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              {toDropdownOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-72 overflow-y-auto rounded-2xl border border-line bg-card p-1.5 shadow-2xl ring-1 ring-black/10">
                  <div className="sticky top-0 z-10 flex items-center justify-between bg-card/95 px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-ink-muted backdrop-blur-xs">
                    <span>
                      {toSearchText.trim()
                        ? "Matching Destination Cities"
                        : "Select Destination City (40 Cities)"}
                    </span>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setToDropdownOpen(false);
                      }}
                      className="cursor-pointer rounded px-1.5 py-0.5 text-[10px] font-bold text-[#1956b4]"
                    >
                      Close
                    </button>
                  </div>
                  {filteredToCities.length > 0 ? (
                    filteredToCities.map((city) => (
                      <button
                        key={city.slug}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectDestination(city);
                        }}
                        className={`cursor-pointer flex min-h-[42px] w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition hover:bg-subcard ${
                          city.slug === toSlug
                            ? "bg-blue-50/90 font-extrabold text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                            : "text-ink"
                        }`}
                      >
                        <div>
                          <span className="block text-xs sm:text-sm">
                            {city.name}
                          </span>
                          <span className="text-[10px] font-medium text-ink-muted">
                            {city.state}
                          </span>
                        </div>
                        <span className="rounded bg-subcard px-2 py-0.5 text-[10px] font-semibold text-ink-soft">
                          Petrol ₹{city.petrolInr}/L
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-xs text-ink-muted">
                      No city found matching &ldquo;{toSearchText}&rdquo;
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Primary Search / SSR Route Button */}
            <button
              type="submit"
              disabled={navigating}
              className="ta-btn-primary cursor-pointer inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#fc6203] px-6 text-sm font-extrabold text-white shadow-md transition hover:bg-[#e55600] active:scale-[0.99] disabled:opacity-60 lg:w-auto"
            >
              {navigating ? (
                <>
                  <RefreshIcon className="h-4 w-4 animate-spin" />
                  <span>Loading SSR Route...</span>
                </>
              ) : (
                <>
                  <SearchIcon className="h-4 w-4" />
                  <span>Calculate Toll &amp; Fuel</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-700 dark:text-rose-300">
            {errorMessage}
          </div>
        )}

        {/* Vehicle Class + Fuel Type + Mileage + Fuel Price + Passengers Action Row */}
        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-12">
          {/* Vehicle Class (4 cols) */}
          <div className="lg:col-span-4">
            <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
              NHAI FASTag Vehicle Class
            </label>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {(
                ["car", "lcv", "bus-truck", "multi-axle"] as VehicleCategory[]
              ).map((vc) => {
                const active = vehicleCategory === vc;
                return (
                  <button
                    key={vc}
                    type="button"
                    onClick={() =>
                      handleVehicleOrFuelChange(vc, fuelType, fromSlug)
                    }
                    className={`cursor-pointer truncate rounded-lg border px-2 py-2 text-[11px] font-extrabold transition ${
                      active
                        ? "border-[#1956b4] bg-[#1956b4] text-white shadow-2xs"
                        : "border-line bg-subcard/70 text-ink-soft hover:border-[#1956b4] hover:text-ink"
                    }`}
                  >
                    {VEHICLE_CATEGORY_META[vc].shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fuel / Powertrain (3 cols) */}
          <div className="lg:col-span-3">
            <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
              Fuel / EV Type
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(["petrol", "diesel", "cng", "ev"] as FuelType[]).map((ft) => {
                const active = fuelType === ft;
                return (
                  <button
                    key={ft}
                    type="button"
                    onClick={() =>
                      handleVehicleOrFuelChange(vehicleCategory, ft, fromSlug)
                    }
                    className={`cursor-pointer rounded-lg border py-2 text-[11px] font-extrabold uppercase transition ${
                      active
                        ? "border-emerald-600 bg-emerald-600 text-white shadow-2xs"
                        : "border-line bg-subcard/70 text-ink-soft hover:border-emerald-600 hover:text-ink"
                    }`}
                  >
                    {ft}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mileage Input (2 cols) */}
          <div className="lg:col-span-2">
            <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
              Mileage (
              {fuelType === "cng"
                ? "km/kg"
                : fuelType === "ev"
                ? "km/kWh"
                : "km/L"}
              )
            </label>
            <input
              type="number"
              step="0.5"
              min="1"
              max="60"
              value={customMileage}
              onChange={(e) => setCustomMileage(e.target.value)}
              className="w-full rounded-lg border border-line bg-subcard/60 px-3 py-2 text-xs font-extrabold text-ink focus:border-[#1956b4] focus:bg-card focus:outline-none"
            />
          </div>

          {/* Fuel Price Input (1 col) */}
          <div className="lg:col-span-1">
            <label className="mb-1.5 block truncate text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
              ₹/
              {plan?.fuelUnitName === "Litres"
                ? "L"
                : plan?.fuelUnitName ?? "L"}
            </label>
            <input
              type="number"
              step="0.5"
              min="5"
              max="300"
              placeholder={plan ? String(plan.fuelUnitPriceInr) : "95"}
              value={customFuelPrice}
              onChange={(e) => setCustomFuelPrice(e.target.value)}
              className="w-full rounded-lg border border-line bg-subcard/60 px-2.5 py-2 text-xs font-extrabold text-ink focus:border-[#1956b4] focus:bg-card focus:outline-none"
            />
          </div>

          {/* Passengers Split (2 cols) */}
          <div className="lg:col-span-2">
            <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
              Carpool Split
            </label>
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              aria-label="Passengers for cost split"
              className="cursor-pointer w-full rounded-lg border border-line bg-subcard/60 px-2.5 py-2 text-xs font-extrabold text-ink focus:border-[#1956b4] focus:bg-card focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? "Person (Solo)" : "People"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Direct SSR Route Suggestion Links (100% Server-Side Rendered <Link> Pills) */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-line pt-3.5">
          <span className="mr-1 inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
            <ZapIcon className="h-3.5 w-3.5 text-[#fc6203]" />
            Quick SSR Routes:
          </span>
          {QUICK_CORRIDOR_PILLS.map((pill) => {
            const isActive = fromSlug === pill.from && toSlug === pill.to;
            return (
              <Link
                key={`${pill.from}-${pill.to}`}
                href={buildTollRoutePath(pill.from, pill.to)}
                onClick={() => {
                  setFromSlug(pill.from);
                  setToSlug(pill.to);
                  setFromSearchText(citiesBySlug.get(pill.from)?.name || "");
                  setToSearchText(citiesBySlug.get(pill.to)?.name || "");
                }}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${
                  isActive
                    ? "border-[#1956b4] bg-[#1956b4] text-white shadow-2xs"
                    : "border-line bg-subcard/70 text-ink-soft hover:border-[#1956b4] hover:text-[#1956b4] dark:hover:text-blue-300"
                }`}
              >
                {pill.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Results Section (100% SSR on Initial Load + Instant Reactive Updates) */}
      {plan && (
        <>
          {/* 4 Primary KPI Cards + Dynamic QR Trip Pass Card */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* 4 KPI Cards (8 columns on desktop) */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:col-span-8">
              {/* Total Road Trip Cost */}
              <div className="rounded-2xl border border-[#1956b4]/30 bg-card p-4 shadow-xs sm:p-5">
                <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                  <span>
                    {isHindi ? "कुल ट्रिप खर्च (Total Cost)" : "Total Road Trip Cost"}
                  </span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                    <RupeeBadgeIcon className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-black text-ink sm:text-3xl">
                  ₹{plan.totalTripCostInr.toLocaleString("en-IN")}
                </div>
                <p className="mt-1.5 text-xs text-ink-muted">
                  {plan.tripModeLabel} •{" "}
                  <strong className="text-ink">
                    {plan.effectiveDistanceKm} km
                  </strong>{" "}
                  ({plan.durationFormatted})
                </p>
              </div>

              {/* NHAI FASTag Toll Tax */}
              <div className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-5">
                <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  <span>
                    {isHindi ? "NHAI FASTag टोल टैक्स" : "NHAI FASTag Toll Tax"}
                  </span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <TicketIcon className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-black text-ink sm:text-3xl">
                  ₹{plan.appliedTollInr.toLocaleString("en-IN")}
                </div>
                <p className="mt-1.5 text-xs text-ink-muted">
                  Across{" "}
                  <strong className="text-ink">
                    {plan.plazaCount || "NHAI"}
                  </strong>{" "}
                  Toll Plazas •{" "}
                  {plan.tripMode === "return-24h" ? (
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      Saved ₹{plan.fastag24hSavingsInr} (24h Return)
                    </span>
                  ) : (
                    <span>24h Return: ₹{plan.return24hCarTollInr}</span>
                  )}
                </p>
              </div>

              {/* Fuel / EV Charging Cost */}
              <div className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-5">
                <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[#fc6203]">
                  <span>
                    {isHindi
                      ? `${plan.fuelType.toUpperCase()} ईंधन खर्च`
                      : `${plan.fuelType.toUpperCase()} Fuel Cost`}
                  </span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#fc6203] dark:bg-orange-500/15 dark:text-orange-300">
                    <ZapIcon className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-black text-ink sm:text-3xl">
                  ₹{plan.fuelCostInr.toLocaleString("en-IN")}
                </div>
                <p className="mt-1.5 text-xs text-ink-muted">
                  Needs{" "}
                  <strong className="text-ink">
                    {plan.fuelUnitsRequired} {plan.fuelUnitName}
                  </strong>{" "}
                  @ ₹{plan.fuelUnitPriceInr}/
                  {plan.fuelUnitName === "Litres" ? "L" : plan.fuelUnitName}
                </p>
              </div>

              {/* Per-Passenger Carpool Split */}
              <div className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-5">
                <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  <span>
                    {isHindi ? "प्रति यात्री खर्च (Per Pax)" : "Cost Per Passenger"}
                  </span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                    <CalculatorIcon className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-black text-ink sm:text-3xl">
                  ₹{plan.costPerPassengerInr.toLocaleString("en-IN")}
                </div>
                <p className="mt-1.5 text-xs text-ink-muted">
                  Split among{" "}
                  <strong className="text-ink">
                    {plan.passengers}{" "}
                    {plan.passengers === 1 ? "person" : "passengers"}
                  </strong>
                </p>
              </div>
            </div>

            {/* Dynamic QR Trip Pass & Dynamic Route URL Card (4 columns on desktop) */}
            <div className="flex flex-col justify-between rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-5 lg:col-span-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Dynamic QR Trip Pass
                  </span>
                  <h3 className="mt-1.5 truncate text-sm font-extrabold text-ink">
                    {plan.fromCity.name} → {plan.toCity.name}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-ink-muted">
                    {VEHICLE_CATEGORY_META[plan.vehicleCategory].shortLabel} •{" "}
                    {plan.tripModeLabel} • {plan.fuelType.toUpperCase()}
                  </p>
                </div>

                {/* Live Dynamic SVG QR Code */}
                <div
                  className="shrink-0 rounded-xl border border-line bg-white p-2 shadow-2xs"
                  title={`Dynamic QR for ${plan.fromCity.name} to ${plan.toCity.name} (₹${plan.totalTripCostInr})`}
                >
                  <svg
                    viewBox="0 0 21 21"
                    width="72"
                    height="72"
                    shapeRendering="crispEdges"
                    aria-label="Dynamic Highway Route QR Code"
                  >
                    {qrMatrix.map((row, rIdx) =>
                      row.map((cell, cIdx) =>
                        cell ? (
                          <rect
                            key={`${rIdx}-${cIdx}`}
                            x={cIdx}
                            y={rIdx}
                            width={1}
                            height={1}
                            fill="#0f172a"
                          />
                        ) : null
                      )
                    )}
                  </svg>
                </div>
              </div>

              {/* Dynamic URL Preview & Actions */}
              <div className="mt-3 space-y-2 border-t border-line pt-3">
                <Link
                  href={plan.routePath}
                  className="flex items-center justify-between rounded-lg border border-line bg-subcard px-2.5 py-1.5 text-[11px] transition hover:border-[#1956b4]"
                >
                  <span className="truncate font-mono text-ink-soft">
                    {currentDynamicPath}
                  </span>
                  <span className="ml-2 shrink-0 font-bold text-emerald-700 dark:text-emerald-300">
                    SSR URL
                  </span>
                </Link>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopyDynamicLink}
                    className="cursor-pointer inline-flex items-center justify-center gap-1 rounded-lg border border-line bg-subcard px-2 py-2 text-[11px] font-extrabold text-ink transition hover:border-[#1956b4] hover:text-[#1956b4] dark:hover:text-blue-300"
                  >
                    <CopyIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {copiedUrl
                        ? isHindi
                          ? "कॉपी हुआ!"
                          : "Copied!"
                        : isHindi
                        ? "लिंक कॉपी"
                        : "Copy URL"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleWhatsAppShare}
                    className="cursor-pointer inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2 py-2 text-[11px] font-extrabold text-white transition hover:bg-emerald-700"
                  >
                    <WhatsAppIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {isHindi ? "WhatsApp" : "WhatsApp"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      typeof window !== "undefined" && window.print()
                    }
                    className="cursor-pointer inline-flex items-center justify-center gap-1 rounded-lg bg-[#1956b4] px-2 py-2 text-[11px] font-extrabold text-white transition hover:bg-[#144696]"
                  >
                    <PrinterIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {isHindi ? "प्रिंट पास" : "Print Pass"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Plaza-by-Plaza NHAI FASTag Breakdown Table */}
          <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4 sm:p-6">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                  Sequential Highway Toll Plazas
                </span>
                <h2 className="mt-0.5 text-base font-extrabold text-ink sm:text-xl">
                  {plan.fromCity.name} to {plan.toCity.name} Toll Plaza List
                  &amp; FASTag Tariff
                </h2>
                <p className="mt-0.5 text-xs text-ink-muted">
                  Corridor:{" "}
                  <strong className="text-ink">{plan.highwaySummary}</strong> •{" "}
                  One-Way Distance:{" "}
                  <strong className="text-ink">{plan.oneWayDistanceKm} km</strong>
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <CheckCircleIcon className="h-3.5 w-3.5" />
                NHAI FASTag 2026 Verified Rates
              </span>
            </div>

            {plan.plazas.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-line bg-subcard/70 text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">
                        Toll Plaza Name &amp; State
                      </th>
                      <th className="px-4 py-3">Highway</th>
                      <th className="px-4 py-3">~Km from Start</th>
                      <th className="px-4 py-3 text-right">Car Single</th>
                      <th className="px-4 py-3 text-right">Car 24h Return</th>
                      <th className="px-4 py-3 text-right">LCV / Bus</th>
                      <th className="px-4 py-3 text-right text-[#1956b4] dark:text-blue-300">
                        Applied FASTag
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-xs sm:text-sm">
                    {plan.plazas.map((stop) => (
                      <tr
                        key={stop.plaza.id}
                        className="transition-colors hover:bg-subcard/50"
                      >
                        <td className="px-4 py-3.5 font-bold text-ink-muted">
                          {stop.index}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-ink">
                            {stop.plaza.name}
                          </div>
                          <div className="text-xs text-ink-muted">
                            {stop.plaza.state}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-block rounded-md border border-line bg-subcard px-2.5 py-1 text-xs font-bold text-ink-soft">
                            {stop.plaza.highway}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-ink-soft">
                          ~{stop.estimatedKmFromOrigin} km
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-ink">
                          ₹{stop.plaza.carSingle}
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-emerald-700 dark:text-emerald-300">
                          ₹{stop.plaza.carReturn}
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs text-ink-muted">
                          ₹{stop.plaza.lcvSingle} / ₹{stop.plaza.busTruckSingle}
                        </td>
                        <td className="px-4 py-3.5 text-right font-black text-[#1956b4] dark:text-blue-300">
                          ₹{stop.appliedFareInr}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-line bg-subcard/80 font-extrabold text-ink">
                      <td colSpan={4} className="px-4 py-4 text-xs sm:text-sm">
                        Total NHAI FASTag Toll ({plan.tripModeLabel} •{" "}
                        {VEHICLE_CATEGORY_META[plan.vehicleCategory].shortLabel}
                        )
                      </td>
                      <td className="px-4 py-4 text-right text-ink-soft">
                        ₹{plan.oneWayCarTollInr}
                      </td>
                      <td className="px-4 py-4 text-right text-emerald-700 dark:text-emerald-300">
                        ₹{plan.return24hCarTollInr}
                      </td>
                      <td className="px-4 py-4 text-right text-xs text-ink-muted">
                        —
                      </td>
                      <td className="px-4 py-4 text-right text-base font-black text-[#fc6203] sm:text-lg">
                        ₹{plan.appliedTollInr}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="space-y-2 p-5 text-sm text-ink-soft">
                <p className="flex items-center gap-2 font-bold text-[#1956b4] dark:text-blue-300">
                  <ShieldCheckIcon className="h-4 w-4 shrink-0" />
                  Estimated NHAI Highway Corridor Toll Applied
                </p>
                <p className="text-xs leading-relaxed text-ink-muted sm:text-sm">
                  For the {plan.oneWayDistanceKm} km road corridor between{" "}
                  <strong className="text-ink">{plan.fromCity.name}</strong> and{" "}
                  <strong className="text-ink">{plan.toCity.name}</strong>,
                  standard NHAI per-kilometre national highway toll rates
                  (~₹1.55/km for 4-wheelers) result in an estimated one-way car
                  toll of{" "}
                  <strong className="text-ink">
                    ₹{plan.oneWayCarTollInr}
                  </strong>{" "}
                  and a 24-hour return toll of{" "}
                  <strong className="text-emerald-700 dark:text-emerald-300">
                    ₹{plan.return24hCarTollInr}
                  </strong>
                  .
                </p>
              </div>
            )}

            {/* Non-FASTag Cash Double Fee Warning Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-amber-50/80 px-4 py-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200 sm:px-6">
              <div className="flex items-center gap-2">
                <AlertCircleIcon className="h-4 w-4 shrink-0 text-[#fc6203]" />
                <span>
                  <strong>NHAI Blacklisted / Non-FASTag Cash Penalty:</strong>{" "}
                  Entering a FASTag lane without an active KYV-compliant FASTag
                  balance incurs{" "}
                  <strong>
                    200% double toll fee (₹{plan.cashPenaltyDoubleInr})
                  </strong>
                  .
                </span>
              </div>
              <span className="font-extrabold text-[#fc6203]">
                Recommended FASTag Balance: ₹
                {Math.max(500, plan.appliedTollInr + 150)}
              </span>
            </div>
          </div>

          {/* Petrol vs Diesel vs CNG vs Electric EV Comparison Grid */}
          <div className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                  Powertrain Cost Comparison
                </span>
                <h3 className="text-base font-extrabold text-ink sm:text-lg">
                  Petrol vs Diesel vs CNG vs Electric EV (
                  {plan.effectiveDistanceKm} km)
                </h3>
                <p className="mt-0.5 text-xs text-ink-muted">
                  Click any powertrain card below to switch fuel calculation for{" "}
                  <strong className="text-ink">
                    {plan.fromCity.name} to {plan.toCity.name}
                  </strong>
                  .
                </p>
              </div>
              <Link
                href={plan.routePath}
                className="inline-flex items-center gap-1 text-xs font-extrabold text-[#1956b4] hover:underline dark:text-blue-300"
              >
                <span>
                  SSR Route Page: {plan.fromCity.name} → {plan.toCity.name}
                </span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {plan.fuelComparisons.map((item) => {
                const isSelected = item.fuelType === plan.fuelType;
                return (
                  <button
                    key={item.fuelType}
                    type="button"
                    onClick={() =>
                      handleVehicleOrFuelChange(
                        plan.vehicleCategory,
                        item.fuelType,
                        fromSlug
                      )
                    }
                    className={`cursor-pointer rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-[#1956b4] bg-blue-50/60 shadow-xs dark:border-blue-400 dark:bg-blue-950/40"
                        : "border-line bg-subcard/40 hover:border-[#1956b4] hover:bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-ink-soft">
                        {item.label}
                      </span>
                      {isSelected && (
                        <span className="rounded bg-[#1956b4] px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-2xl font-black text-ink">
                      ₹{item.totalWithTollInr.toLocaleString("en-IN")}
                    </div>
                    <div className="mt-1 text-xs text-ink-muted">
                      Fuel:{" "}
                      <strong className="text-ink">₹{item.fuelCostInr}</strong>{" "}
                      + Toll:{" "}
                      <strong className="text-ink">
                        ₹{plan.appliedTollInr}
                      </strong>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between border-t border-line pt-2 text-[11px] text-ink-muted">
                      <span>{item.unitPriceLabel}</span>
                      <span>
                        {item.unitsConsumed} units @ {item.efficiencyLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
