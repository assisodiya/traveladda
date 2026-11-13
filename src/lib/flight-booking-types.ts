import type { SupportedFlightCurrency } from "./travelpayouts-config";

export interface AirportHub {
  iata: string;
  city: string;
  cityHindi: string;
  citySlug: string;
  stateOrCountry: string;
  airportName: string;
  terminals: string;
  domesticTerminal: string;
  intlTerminal: string;
  lat: number;
  lng: number;
  isInternationalHub: boolean;
  isTier1: boolean;
}

export interface FlightScheduleOffer {
  id: string;
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  fullFlightCode: string;
  originIata: string;
  originCity: string;
  originTerminal: string;
  destinationIata: string;
  destinationCity: string;
  destinationTerminal: string;
  departureIso: string;
  departureTime24: string;
  arrivalTime24: string;
  durationMinutes: number;
  durationFormatted: string;
  transfers: number;
  stopsLabel: string;
  aircraft: string;
  cabinBaggage: string;
  checkInBaggage: string;
  price: number;
  currency: SupportedFlightCurrency;
  formattedPrice: string;
  isLiveApiFare: boolean;
  isCheapest: boolean;
  isFastest: boolean;
  bookingUrls: {
    primaryAffiliate: string;
    ixigo: string;
    makemytrip: string;
    goibibo: string;
    skyscanner: string;
  };
}

export interface DailyCalendarFare {
  date: string; // YYYY-MM-DD
  dayShort: string; // e.g. "15 Nov"
  weekdayShort: string; // e.g. "Sun"
  price: number;
  formattedPrice: string;
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  transfers: number;
  isCheapestOfMonth: boolean;
}

export interface FlightRoutePageData {
  routeSlug: string;
  routePath: string;
  origin: AirportHub;
  destination: AirportHub;
  departureDate: string;
  currency: SupportedFlightCurrency;
  aerialDistanceKm: number;
  minDurationMinutes: number;
  minDurationFormatted: string;
  lowestFare: number;
  formattedLowestFare: string;
  averageFare: number;
  formattedAverageFare: string;
  directFlightsCount: number;
  totalFlightsCount: number;
  firstFlightTime: string;
  lastFlightTime: string;
  airlinesOperating: {
    code: string;
    name: string;
    minPrice: number;
    formattedMinPrice: string;
    flightCount: number;
  }[];
  offers: FlightScheduleOffer[];
  calendarFares: DailyCalendarFare[];
  fetchedAt: string;
  source: "Travelpayouts Aviasales API v3 + DGCA Schedule Engine";
}

export const MAJOR_AIRPORT_HUBS: AirportHub[] = [
  {
    iata: "DEL",
    city: "New Delhi",
    cityHindi: "नई दिल्ली",
    citySlug: "delhi",
    stateOrCountry: "Delhi NCR",
    airportName: "Indira Gandhi International Airport",
    terminals: "T1, T2, T3",
    domesticTerminal: "T1 / T2 / T3",
    intlTerminal: "T3",
    lat: 28.5562,
    lng: 77.1,
    isInternationalHub: false,
    isTier1: true,
  },
  {
    iata: "BOM",
    city: "Mumbai",
    cityHindi: "मुंबई",
    citySlug: "mumbai",
    stateOrCountry: "Maharashtra",
    airportName: "Chhatrapati Shivaji Maharaj International Airport",
    terminals: "T1, T2",
    domesticTerminal: "T1 / T2",
    intlTerminal: "T2",
    lat: 19.0896,
    lng: 72.8656,
    isInternationalHub: false,
    isTier1: true,
  },
  {
    iata: "BLR",
    city: "Bengaluru",
    cityHindi: "बेंगलुरु",
    citySlug: "bengaluru",
    stateOrCountry: "Karnataka",
    airportName: "Kempegowda International Airport",
    terminals: "T1, T2",
    domesticTerminal: "T1 / T2",
    intlTerminal: "T2",
    lat: 13.1986,
    lng: 77.7066,
    isInternationalHub: false,
    isTier1: true,
  },
  {
    iata: "HYD",
    city: "Hyderabad",
    cityHindi: "हैदराबाद",
    citySlug: "hyderabad",
    stateOrCountry: "Telangana",
    airportName: "Rajiv Gandhi International Airport",
    terminals: "Main PTB",
    domesticTerminal: "T1",
    intlTerminal: "T1",
    lat: 17.2403,
    lng: 78.4294,
    isInternationalHub: false,
    isTier1: true,
  },
  {
    iata: "MAA",
    city: "Chennai",
    cityHindi: "चेन्नई",
    citySlug: "chennai",
    stateOrCountry: "Tamil Nadu",
    airportName: "Chennai International Airport",
    terminals: "T1, T2, T4",
    domesticTerminal: "T1 / T4",
    intlTerminal: "T2",
    lat: 12.9941,
    lng: 80.1709,
    isInternationalHub: false,
    isTier1: true,
  },
  {
    iata: "CCU",
    city: "Kolkata",
    cityHindi: "कोलकाता",
    citySlug: "kolkata",
    stateOrCountry: "West Bengal",
    airportName: "Netaji Subhas Chandra Bose International Airport",
    terminals: "T2",
    domesticTerminal: "T2",
    intlTerminal: "T2",
    lat: 22.6547,
    lng: 88.4467,
    isInternationalHub: false,
    isTier1: true,
  },
  {
    iata: "GOI",
    city: "Goa",
    cityHindi: "गोवा",
    citySlug: "goa",
    stateOrCountry: "Goa (Dabolim & Mopa GOX)",
    airportName: "Goa International Airport (Dabolim / Mopa)",
    terminals: "T1, T2",
    domesticTerminal: "T1",
    intlTerminal: "T2",
    lat: 15.3808,
    lng: 73.8314,
    isInternationalHub: false,
    isTier1: true,
  },
  {
    iata: "PNQ",
    city: "Pune",
    cityHindi: "पुणे",
    citySlug: "pune",
    stateOrCountry: "Maharashtra",
    airportName: "Pune International Airport (Lohegaon)",
    terminals: "T1, New T2",
    domesticTerminal: "T2",
    intlTerminal: "T1",
    lat: 18.5822,
    lng: 73.9197,
    isInternationalHub: false,
    isTier1: true,
  },
  {
    iata: "AMD",
    city: "Ahmedabad",
    cityHindi: "अहमदाबाद",
    citySlug: "ahmedabad",
    stateOrCountry: "Gujarat",
    airportName: "Sardar Vallabhbhai Patel International Airport",
    terminals: "T1, T2",
    domesticTerminal: "T1",
    intlTerminal: "T2",
    lat: 23.0772,
    lng: 72.6347,
    isInternationalHub: false,
    isTier1: true,
  },
  {
    iata: "COK",
    city: "Kochi",
    cityHindi: "कोच्चि",
    citySlug: "kochi",
    stateOrCountry: "Kerala",
    airportName: "Cochin International Airport",
    terminals: "T1, T3",
    domesticTerminal: "T1",
    intlTerminal: "T3",
    lat: 10.152,
    lng: 76.4019,
    isInternationalHub: false,
    isTier1: true,
  },
  {
    iata: "JAI",
    city: "Jaipur",
    cityHindi: "जयपुर",
    citySlug: "jaipur",
    stateOrCountry: "Rajasthan",
    airportName: "Jaipur International Airport",
    terminals: "T1, T2",
    domesticTerminal: "T2",
    intlTerminal: "T1",
    lat: 26.8242,
    lng: 75.8122,
    isInternationalHub: false,
    isTier1: true,
  },
  {
    iata: "LKO",
    city: "Lucknow",
    cityHindi: "लखनऊ",
    citySlug: "lucknow",
    stateOrCountry: "Uttar Pradesh",
    airportName: "Chaudhary Charan Singh International Airport",
    terminals: "T3",
    domesticTerminal: "T3",
    intlTerminal: "T3",
    lat: 26.7606,
    lng: 80.8893,
    isInternationalHub: false,
    isTier1: true,
  },
  {
    iata: "SXR",
    city: "Srinagar",
    cityHindi: "श्रीनगर",
    citySlug: "srinagar",
    stateOrCountry: "Jammu & Kashmir",
    airportName: "Sheikh ul-Alam International Airport",
    terminals: "T1",
    domesticTerminal: "T1",
    intlTerminal: "T1",
    lat: 33.9871,
    lng: 74.7742,
    isInternationalHub: false,
    isTier1: true,
  },
  {
    iata: "GAU",
    city: "Guwahati",
    cityHindi: "गुवाहाटी",
    citySlug: "guwahati",
    stateOrCountry: "Assam",
    airportName: "Lokpriya Gopinath Bordoloi International Airport",
    terminals: "T1",
    domesticTerminal: "T1",
    intlTerminal: "T1",
    lat: 26.1061,
    lng: 91.5859,
    isInternationalHub: false,
    isTier1: true,
  },
  {
    iata: "PAT",
    city: "Patna",
    cityHindi: "पटना",
    citySlug: "patna",
    stateOrCountry: "Bihar",
    airportName: "Jay Prakash Narayan Airport",
    terminals: "T1",
    domesticTerminal: "T1",
    intlTerminal: "T1",
    lat: 25.5913,
    lng: 85.088,
    isInternationalHub: false,
    isTier1: false,
  },
  {
    iata: "BBI",
    city: "Bhubaneswar",
    cityHindi: "भुवनेश्वर",
    citySlug: "bhubaneswar",
    stateOrCountry: "Odisha",
    airportName: "Biju Patnaik International Airport",
    terminals: "T1, T2",
    domesticTerminal: "T1",
    intlTerminal: "T2",
    lat: 20.2444,
    lng: 85.8178,
    isInternationalHub: false,
    isTier1: false,
  },
  {
    iata: "IXC",
    city: "Chandigarh",
    cityHindi: "चंडीगढ़",
    citySlug: "chandigarh",
    stateOrCountry: "Chandigarh / Punjab",
    airportName: "Shaheed Bhagat Singh International Airport",
    terminals: "T1",
    domesticTerminal: "T1",
    intlTerminal: "T1",
    lat: 30.6735,
    lng: 76.7885,
    isInternationalHub: false,
    isTier1: false,
  },
  {
    iata: "ATQ",
    city: "Amritsar",
    cityHindi: "अमृतसर",
    citySlug: "amritsar",
    stateOrCountry: "Punjab",
    airportName: "Sri Guru Ram Dass Jee International Airport",
    terminals: "T1",
    domesticTerminal: "T1",
    intlTerminal: "T1",
    lat: 31.7096,
    lng: 74.7973,
    isInternationalHub: false,
    isTier1: false,
  },
  {
    iata: "VNS",
    city: "Varanasi",
    cityHindi: "वाराणसी",
    citySlug: "varanasi",
    stateOrCountry: "Uttar Pradesh",
    airportName: "Lal Bahadur Shastri International Airport",
    terminals: "T1",
    domesticTerminal: "T1",
    intlTerminal: "T1",
    lat: 25.4524,
    lng: 82.8593,
    isInternationalHub: false,
    isTier1: false,
  },
  {
    iata: "IDR",
    city: "Indore",
    cityHindi: "इंदौर",
    citySlug: "indore",
    stateOrCountry: "Madhya Pradesh",
    airportName: "Devi Ahilya Bai Holkar Airport",
    terminals: "T1",
    domesticTerminal: "T1",
    intlTerminal: "T1",
    lat: 22.7218,
    lng: 75.8011,
    isInternationalHub: false,
    isTier1: false,
  },
  {
    iata: "NAG",
    city: "Nagpur",
    cityHindi: "नागपुर",
    citySlug: "nagpur",
    stateOrCountry: "Maharashtra",
    airportName: "Dr. Babasaheb Ambedkar International Airport",
    terminals: "T1",
    domesticTerminal: "T1",
    intlTerminal: "T1",
    lat: 21.0922,
    lng: 79.0472,
    isInternationalHub: false,
    isTier1: false,
  },
  {
    iata: "CJB",
    city: "Coimbatore",
    cityHindi: "कोयंबटूर",
    citySlug: "coimbatore",
    stateOrCountry: "Tamil Nadu",
    airportName: "Coimbatore International Airport",
    terminals: "T1",
    domesticTerminal: "T1",
    intlTerminal: "T1",
    lat: 11.03,
    lng: 77.0434,
    isInternationalHub: false,
    isTier1: false,
  },
  {
    iata: "TRV",
    city: "Thiruvananthapuram",
    cityHindi: "तिरुवनंतपुरम",
    citySlug: "thiruvananthapuram",
    stateOrCountry: "Kerala",
    airportName: "Thiruvananthapuram International Airport",
    terminals: "T1, T2",
    domesticTerminal: "T1",
    intlTerminal: "T2",
    lat: 8.4821,
    lng: 76.9201,
    isInternationalHub: false,
    isTier1: false,
  },
  {
    iata: "IXB",
    city: "Bagdogra",
    cityHindi: "बागडोगरा (दार्जिलिंग/सिक्किम)",
    citySlug: "bagdogra",
    stateOrCountry: "West Bengal",
    airportName: "Bagdogra International Airport (Siliguri)",
    terminals: "T1",
    domesticTerminal: "T1",
    intlTerminal: "T1",
    lat: 26.6812,
    lng: 88.3286,
    isInternationalHub: false,
    isTier1: false,
  },
  {
    iata: "RPR",
    city: "Raipur",
    cityHindi: "रायपुर",
    citySlug: "raipur",
    stateOrCountry: "Chhattisgarh",
    airportName: "Swami Vivekananda Airport",
    terminals: "T1",
    domesticTerminal: "T1",
    intlTerminal: "T1",
    lat: 21.1804,
    lng: 81.7388,
    isInternationalHub: false,
    isTier1: false,
  },
  {
    iata: "IXR",
    city: "Ranchi",
    cityHindi: "रांची",
    citySlug: "ranchi",
    stateOrCountry: "Jharkhand",
    airportName: "Birsa Munda Airport",
    terminals: "T1",
    domesticTerminal: "T1",
    intlTerminal: "T1",
    lat: 23.3143,
    lng: 85.3217,
    isInternationalHub: false,
    isTier1: false,
  },
  {
    iata: "UDR",
    city: "Udaipur",
    cityHindi: "उदयपुर",
    citySlug: "udaipur",
    stateOrCountry: "Rajasthan",
    airportName: "Maharana Pratap Airport",
    terminals: "T1",
    domesticTerminal: "T1",
    intlTerminal: "T1",
    lat: 24.6177,
    lng: 73.8961,
    isInternationalHub: false,
    isTier1: false,
  },
  {
    iata: "JDH",
    city: "Jodhpur",
    cityHindi: "जोधपुर",
    citySlug: "jodhpur",
    stateOrCountry: "Rajasthan",
    airportName: "Jodhpur Airport",
    terminals: "T1",
    domesticTerminal: "T1",
    intlTerminal: "T1",
    lat: 26.2511,
    lng: 73.0489,
    isInternationalHub: false,
    isTier1: false,
  },
  {
    iata: "VTZ",
    city: "Visakhapatnam",
    cityHindi: "विशाखापत्तनम",
    citySlug: "visakhapatnam",
    stateOrCountry: "Andhra Pradesh",
    airportName: "Visakhapatnam International Airport",
    terminals: "T1",
    domesticTerminal: "T1",
    intlTerminal: "T1",
    lat: 17.7212,
    lng: 83.2245,
    isInternationalHub: false,
    isTier1: false,
  },
  {
    iata: "IXM",
    city: "Madurai",
    cityHindi: "मदुरै",
    citySlug: "madurai",
    stateOrCountry: "Tamil Nadu",
    airportName: "Madurai Airport",
    terminals: "T1",
    domesticTerminal: "T1",
    intlTerminal: "T1",
    lat: 9.8345,
    lng: 78.0934,
    isInternationalHub: false,
    isTier1: false,
  },
  {
    iata: "STV",
    city: "Surat",
    cityHindi: "सूरत",
    citySlug: "surat",
    stateOrCountry: "Gujarat",
    airportName: "Surat International Airport",
    terminals: "T1",
    domesticTerminal: "T1",
    intlTerminal: "T1",
    lat: 21.1141,
    lng: 72.7418,
    isInternationalHub: false,
    isTier1: false,
  },
  {
    iata: "AYJ",
    city: "Ayodhya",
    cityHindi: "अयोध्या",
    citySlug: "ayodhya",
    stateOrCountry: "Uttar Pradesh",
    airportName: "Maharishi Valmiki International Airport",
    terminals: "T1",
    domesticTerminal: "T1",
    intlTerminal: "T1",
    lat: 26.748,
    lng: 82.1508,
    isInternationalHub: false,
    isTier1: false,
  },
  // Top 8 International Hubs from India
  {
    iata: "DXB",
    city: "Dubai",
    cityHindi: "दुबई",
    citySlug: "dubai",
    stateOrCountry: "United Arab Emirates",
    airportName: "Dubai International Airport",
    terminals: "T1, T2, T3",
    domesticTerminal: "T1 / T3",
    intlTerminal: "T1 / T2 / T3",
    lat: 25.2532,
    lng: 55.3657,
    isInternationalHub: true,
    isTier1: true,
  },
  {
    iata: "SIN",
    city: "Singapore",
    cityHindi: "सिंगापुर",
    citySlug: "singapore",
    stateOrCountry: "Singapore",
    airportName: "Singapore Changi Airport",
    terminals: "T1, T2, T3, T4",
    domesticTerminal: "T1 / T3",
    intlTerminal: "T1 / T2 / T3",
    lat: 1.3644,
    lng: 103.9915,
    isInternationalHub: true,
    isTier1: true,
  },
  {
    iata: "BKK",
    city: "Bangkok",
    cityHindi: "बैंकॉक",
    citySlug: "bangkok",
    stateOrCountry: "Thailand",
    airportName: "Suvarnabhumi International Airport",
    terminals: "Main Terminal",
    domesticTerminal: "Main",
    intlTerminal: "Main",
    lat: 13.69,
    lng: 100.7501,
    isInternationalHub: true,
    isTier1: true,
  },
  {
    iata: "AUH",
    city: "Abu Dhabi",
    cityHindi: "अबू धाबी",
    citySlug: "abu-dhabi",
    stateOrCountry: "United Arab Emirates",
    airportName: "Zayed International Airport",
    terminals: "Terminal A",
    domesticTerminal: "Terminal A",
    intlTerminal: "Terminal A",
    lat: 24.433,
    lng: 54.6511,
    isInternationalHub: true,
    isTier1: false,
  },
  {
    iata: "DOH",
    city: "Doha",
    cityHindi: "दोहा",
    citySlug: "doha",
    stateOrCountry: "Qatar",
    airportName: "Hamad International Airport",
    terminals: "Main Terminal",
    domesticTerminal: "Main",
    intlTerminal: "Main",
    lat: 25.2731,
    lng: 51.6081,
    isInternationalHub: true,
    isTier1: false,
  },
  {
    iata: "LHR",
    city: "London",
    cityHindi: "लंदन",
    citySlug: "london",
    stateOrCountry: "United Kingdom",
    airportName: "London Heathrow Airport",
    terminals: "T2, T3, T4, T5",
    domesticTerminal: "T2 / T5",
    intlTerminal: "T2 / T3 / T4",
    lat: 51.47,
    lng: -0.4543,
    isInternationalHub: true,
    isTier1: true,
  },
  {
    iata: "KUL",
    city: "Kuala Lumpur",
    cityHindi: "कुआलालंपुर",
    citySlug: "kuala-lumpur",
    stateOrCountry: "Malaysia",
    airportName: "Kuala Lumpur International Airport (KLIA)",
    terminals: "KLIA 1, KLIA 2",
    domesticTerminal: "KLIA 1 / 2",
    intlTerminal: "KLIA 1 / 2",
    lat: 2.7456,
    lng: 101.7072,
    isInternationalHub: true,
    isTier1: false,
  },
  {
    iata: "KTM",
    city: "Kathmandu",
    cityHindi: "काठमांडू",
    citySlug: "kathmandu",
    stateOrCountry: "Nepal",
    airportName: "Tribhuvan International Airport",
    terminals: "Intl Terminal",
    domesticTerminal: "Domestic",
    intlTerminal: "International",
    lat: 27.6966,
    lng: 85.3591,
    isInternationalHub: true,
    isTier1: false,
  },
];

export const AIRPORT_BY_IATA_MAP: Map<string, AirportHub> = (() => {
  const map = new Map<string, AirportHub>();
  for (const a of MAJOR_AIRPORT_HUBS) {
    map.set(a.iata.toUpperCase(), a);
  }
  return map;
})();

export const AIRPORT_BY_SLUG_MAP: Map<string, AirportHub> = (() => {
  const map = new Map<string, AirportHub>();
  for (const a of MAJOR_AIRPORT_HUBS) {
    map.set(a.citySlug.toLowerCase(), a);
    map.set(a.iata.toLowerCase(), a);
  }
  map.set("new-delhi", MAJOR_AIRPORT_HUBS[0]);
  map.set("bangalore", MAJOR_AIRPORT_HUBS[2]);
  map.set("cochin", MAJOR_AIRPORT_HUBS[9]);
  map.set("trivandrum", MAJOR_AIRPORT_HUBS[22]);
  map.set("vizag", MAJOR_AIRPORT_HUBS[28]);
  return map;
})();

export const AIRLINE_NAMES_BY_CODE: Record<string, string> = {
  "6E": "IndiGo",
  AI: "Air India",
  IX: "Air India Express",
  QP: "Akasa Air",
  SG: "SpiceJet",
  "9I": "Alliance Air",
  S5: "Star Air",
  I7: "IndiaOne Air",
  EK: "Emirates",
  EY: "Etihad Airways",
  QR: "Qatar Airways",
  SQ: "Singapore Airlines",
  TG: "Thai Airways",
  FD: "Thai AirAsia",
  MH: "Malaysia Airlines",
  OD: "Batik Air",
  BA: "British Airways",
  VS: "Virgin Atlantic",
  RA: "Nepal Airlines",
  FZ: "flydubai",
  G9: "Air Arabia",
  UL: "SriLankan Airlines",
  LH: "Lufthansa",
};

export function resolveAirlineDisplayName(code: string): string {
  const upper = (code || "6E").trim().toUpperCase();
  return AIRLINE_NAMES_BY_CODE[upper] || `${upper} Airlines`;
}

export function buildFlightRouteSlug(
  originSlugOrIata: string,
  destSlugOrIata: string
): string {
  const origin =
    AIRPORT_BY_SLUG_MAP.get((originSlugOrIata || "").toLowerCase()) ||
    AIRPORT_BY_IATA_MAP.get((originSlugOrIata || "").toUpperCase());
  const dest =
    AIRPORT_BY_SLUG_MAP.get((destSlugOrIata || "").toLowerCase()) ||
    AIRPORT_BY_IATA_MAP.get((destSlugOrIata || "").toUpperCase());

  const fromSlug = origin
    ? origin.citySlug
    : (originSlugOrIata || "delhi").toLowerCase();
  const toSlug = dest
    ? dest.citySlug
    : (destSlugOrIata || "mumbai").toLowerCase();

  return `${fromSlug}-to-${toSlug}-flights`;
}

export function buildFlightRoutePath(
  originSlugOrIata: string,
  destSlugOrIata: string
): string {
  return `/flights/${buildFlightRouteSlug(originSlugOrIata, destSlugOrIata)}`;
}

export function parseFlightRouteSlug(rawSlug: string): {
  origin: AirportHub;
  destination: AirportHub;
} | null {
  const clean = decodeURIComponent(rawSlug || "")
    .trim()
    .toLowerCase()
    .replace(/-flights?-schedule$/, "")
    .replace(/-cheap-flights?$/, "")
    .replace(/-flights?$/, "");

  const parts = clean.split("-to-");
  if (parts.length !== 2) return null;

  const origin = AIRPORT_BY_SLUG_MAP.get(parts[0].trim());
  const destination = AIRPORT_BY_SLUG_MAP.get(parts[1].trim());
  if (!origin || !destination || origin.iata === destination.iata) {
    return null;
  }

  return { origin, destination };
}

export const POPULAR_FLIGHT_CORRIDORS: {
  fromIata: string;
  toIata: string;
  badge: string;
}[] = [
  { fromIata: "DEL", toIata: "BOM", badge: "#1 Busiest Corridor" },
  { fromIata: "BOM", toIata: "DEL", badge: "65+ Daily Flights" },
  { fromIata: "BLR", toIata: "DEL", badge: "Tech Hub Express" },
  { fromIata: "DEL", toIata: "BLR", badge: "45+ Daily Flights" },
  { fromIata: "BOM", toIata: "GOI", badge: "Weekend Leisure" },
  { fromIata: "DEL", toIata: "GOI", badge: "Direct Non-Stop" },
  { fromIata: "DEL", toIata: "SXR", badge: "Kashmir Gateway" },
  { fromIata: "DEL", toIata: "HYD", badge: "Corporate Trunk" },
  { fromIata: "BLR", toIata: "BOM", badge: "35+ Daily Flights" },
  { fromIata: "DEL", toIata: "CCU", badge: "Eastern Trunk" },
  { fromIata: "DEL", toIata: "MAA", badge: "Southern Trunk" },
  { fromIata: "BOM", toIata: "BLR", badge: "Metro Corridor" },
  { fromIata: "DEL", toIata: "PAT", badge: "High Demand" },
  { fromIata: "DEL", toIata: "LKO", badge: "Short Haul" },
  { fromIata: "DEL", toIata: "AYJ", badge: "Pilgrimage Route" },
  { fromIata: "DEL", toIata: "VNS", badge: "Kashi Corridor" },
  { fromIata: "DEL", toIata: "DXB", badge: "Top International" },
  { fromIata: "BOM", toIata: "DXB", badge: "UAE Direct" },
  { fromIata: "DEL", toIata: "SIN", badge: "SE Asia Hub" },
  { fromIata: "DEL", toIata: "BKK", badge: "Thailand Direct" },
];

export interface IndexableFlightRouteItem {
  routeSlug: string;
  routePath: string;
  originIata: string;
  originCity: string;
  destinationIata: string;
  destinationCity: string;
  isPrimaryCorridor: boolean;
}

const ALL_INDEXABLE_FLIGHT_ROUTES: IndexableFlightRouteItem[] = (() => {
  const primarySet = new Set(
    POPULAR_FLIGHT_CORRIDORS.map((c) => `${c.fromIata}-${c.toIata}`)
  );
  const list: IndexableFlightRouteItem[] = [];
  for (const origin of MAJOR_AIRPORT_HUBS) {
    for (const dest of MAJOR_AIRPORT_HUBS) {
      if (origin.iata === dest.iata) continue;
      // Avoid International -> International pairs (keep India <-> Domestic & India <-> International)
      if (origin.isInternationalHub && dest.isInternationalHub) continue;
      const routeSlug = `${origin.citySlug}-to-${dest.citySlug}-flights`;
      list.push({
        routeSlug,
        routePath: `/flights/${routeSlug}`,
        originIata: origin.iata,
        originCity: origin.city,
        destinationIata: dest.iata,
        destinationCity: dest.city,
        isPrimaryCorridor:
          primarySet.has(`${origin.iata}-${dest.iata}`) ||
          (origin.isTier1 && dest.isTier1),
      });
    }
  }
  return list;
})();

export function getAllIndexableFlightRouteSlugs(): IndexableFlightRouteItem[] {
  return ALL_INDEXABLE_FLIGHT_ROUTES;
}

export function getRelatedFlightRoutes(
  originIata: string,
  destIata: string,
  limit = 16
): IndexableFlightRouteItem[] {
  const result: IndexableFlightRouteItem[] = [];
  const seen = new Set<string>([`${originIata}-${destIata}`]);

  const pushRoute = (item: IndexableFlightRouteItem | undefined) => {
    if (
      item &&
      !seen.has(`${item.originIata}-${item.destinationIata}`)
    ) {
      seen.add(`${item.originIata}-${item.destinationIata}`);
      result.push(item);
    }
  };

  // 1. Return route (Dest -> Origin)
  pushRoute(
    ALL_INDEXABLE_FLIGHT_ROUTES.find(
      (r) => r.originIata === destIata && r.destinationIata === originIata
    )
  );

  // 2. Other outbound routes from this same Origin airport
  for (const r of ALL_INDEXABLE_FLIGHT_ROUTES) {
    if (r.originIata === originIata && result.length < Math.floor(limit / 2)) {
      pushRoute(r);
    }
  }

  // 3. Other inbound routes to this same Destination airport
  for (const r of ALL_INDEXABLE_FLIGHT_ROUTES) {
    if (r.destinationIata === destIata && result.length < limit - 4) {
      pushRoute(r);
    }
  }

  // 4. Top flagship corridors
  for (const r of ALL_INDEXABLE_FLIGHT_ROUTES) {
    if (r.isPrimaryCorridor && result.length < limit) {
      pushRoute(r);
    }
  }

  return result.slice(0, limit);
}

