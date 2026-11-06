export interface BlogSection {
  heading: string;
  paragraphs: string[];
  bullets?: { label: string; detail: string }[];
  callout?: { title: string; text: string };
}

export interface BlogFaqItem {
  question: string;
  answer: string;
}

export interface BlogQuickActionLink {
  label: string;
  sublabel: string;
  href: string;
  airlineCode?: string;
}

export type BlogCategory =
  | "Flight Tracker Guide"
  | "Airport & Terminals"
  | "Delay Intelligence"
  | "Aviation Decoded"
  | "Flyer Rights & Rules"
  | "PNR Masterclass"
  | "Waitlist & Quotas"
  | "Charting Rules"
  | "Rail Comfort";

export interface BlogPost {
  slug: string;
  domain: "air" | "rail";
  title: string;
  excerpt: string;
  category: BlogCategory;
  readTime: string;
  publishedDate: string;
  publishedIso: string;
  author: {
    name: string;
    role: string;
  };
  accentColor: string;
  heroTagline: string;
  seoKeywords: string[];
  keyTakeaways: string[];
  sections: BlogSection[];
  faqs?: BlogFaqItem[];
  quickActionLinks?: BlogQuickActionLink[];
}

export const FLIGHT_BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-check-live-flight-status-by-flight-number-and-airline",
    domain: "air",
    title:
      "How to Check Live Flight Status by Airline & Flight Number (2026 Complete Guide)",
    excerpt:
      "Learn how to track any domestic or international flight in real time using your 2-letter airline IATA code, flight number, and origin departure date—including terminal, boarding gate, and baggage belt updates.",
    category: "Flight Tracker Guide",
    readTime: "6 min read",
    publishedDate: "November 2026",
    publishedIso: "2026-11-06",
    author: {
      name: "Capt. Vikramaditya Rao",
      role: "Aviation Operations & Airspace Analyst",
    },
    accentColor: "from-orange-600 via-amber-500 to-yellow-500",
    heroTagline: "Real-Time Domestic & Global Flight Tracking Masterclass",
    seoKeywords: [
      "how to check live flight status",
      "check flight status by flight number",
      "live flight tracker india",
      "indigo 6e live flight status",
      "air india flight status check",
      "akasa air flight tracker",
      "flight arrival and departure time today",
    ],
    keyTakeaways: [
      "Every commercial flight is uniquely identified by a 2-character IATA airline code (like 6E, AI, IX, QP, or EK) paired with a 1 to 4-digit flight number.",
      "Always select the calendar departure date of the flight's origin airport—especially important for midnight red-eye international departures.",
      "Live flight trackers combine ATC radar feeds and aircraft ACARS OOOI sensors to report terminal numbers, gates, takeoff times, and baggage carousels.",
    ],
    quickActionLinks: [
      {
        label: "Open Live Flight Status Tracker",
        sublabel: "Search 500+ airlines with terminal, gate & belt info",
        href: "/air/flight-status",
      },
      {
        label: "Track IndiGo 6E 2045 Live",
        sublabel: "Instant domestic corridor telemetry",
        href: "/air/flight-status?airline=6E&flight=2045",
        airlineCode: "6E",
      },
      {
        label: "Track Air India AI 101 Live",
        sublabel: "Long-haul international radar & gate status",
        href: "/air/flight-status?airline=AI&flight=101",
        airlineCode: "AI",
      },
      {
        label: "Track Akasa Air QP 1103 Live",
        sublabel: "Check terminal, gate & Boeing 737 MAX status",
        href: "/air/flight-status?airline=QP&flight=1103",
        airlineCode: "QP",
      },
    ],
    sections: [
      {
        heading: "Decoding Your Airline Code and Flight Number on a Boarding Pass",
        paragraphs: [
          "Whether you are heading to the airport yourself or picking up family at arrivals, the fastest way to check accurate live flight running status is by combining the carrier's IATA code and numeric flight designator—not just searching city names where dozens of flights depart every hour.",
          "On every e-ticket, SMS itinerary, and printed boarding pass, you will spot an alphanumeric code such as 6E 2045, AI 101, IX 194, QP 1103, or EK 511. Splitting that code into its two parts unlocks exact gate-to-gate telemetry:",
        ],
        bullets: [
          {
            label: "6E — IndiGo (Domestic & International)",
            detail:
              "India's largest carrier by fleet size. Enter '6E' in the Airline Search box followed by the 3 or 4-digit flight number (e.g., 2045 or 2131).",
          },
          {
            label: "AI & IX — Air India & Air India Express",
            detail:
              "Full-service domestic/long-haul routes operate under 'AI' (e.g., AI 101), while value domestic and Gulf/Southeast Asia routes use 'IX'.",
          },
          {
            label: "QP & SG — Akasa Air & SpiceJet",
            detail:
              "Akasa Air operates Boeing 737 MAX aircraft under IATA code 'QP', while SpiceJet operates domestic and regional routes under 'SG'.",
          },
          {
            label: "EK, QR, EY, SQ & BA — Major Global Hub Carriers",
            detail:
              "Track international widebody flights seamlessly using 'EK' (Emirates), 'QR' (Qatar Airways), 'EY' (Etihad), 'SQ' (Singapore Airlines), or 'BA' (British Airways).",
          },
        ],
        callout: {
          title: "Smart Paste Shortcut on TravelAdda",
          text: "On TravelAdda's Live Flight Status page, you can either search any airline by name with official carrier icons in the dropdown OR paste a full code like '6E 2045' directly into the flight number box—our tracker automatically matches the airline for you!",
        },
      },
      {
        heading: "Why 'Origin Departure Date' Matters for Red-Eye & International Flights",
        paragraphs: [
          "One of the most common mistakes travellers make when tracking late-night international flights (for example, Dubai, Doha, Jeddah, Frankfurt, or London departures between 11:30 PM and 02:30 AM) is selecting their arrival date instead of the flight's origin departure date.",
          "Global aviation systems index every flight instance by the local calendar date on which the aircraft is scheduled to push back from its departure airport. For instance, if flight QP 562 departs Jeddah at 23:55 on 24 November and lands in Mumbai at 07:20 on 25 November, you should select 24 November as the Departure Date.",
        ],
      },
      {
        heading: "What Live Telemetry Can You Check Before Leaving for the Airport?",
        paragraphs: [
          "Checking flight status 3 to 4 hours before departure—and again 60 minutes before arrival pickup—gives you four operational details that static PDF tickets never show:",
        ],
        bullets: [
          {
            label: "Departure & Arrival Terminal Confirmation",
            detail:
              "Multi-terminal hubs like Delhi (T1/T2/T3) and Mumbai (T1/T2) occasionally shift domestic flight series across terminals. Live flight status confirms the exact active terminal.",
          },
          {
            label: "Assigned Boarding Gate & Arrival Gate",
            detail:
              "Airport Apron Control typically assigns physical boarding gates 60–120 minutes prior to pushback, saving long walks across mega-concourses.",
          },
          {
            label: "Live Airborne Progress & Remaining Time",
            detail:
              "Once wheels lift off (Off-Ground), jet-stream tailwinds or holding patterns around busy runways dynamically shift the Estimated Arrival Time.",
          },
          {
            label: "Baggage Claim Carousel Belt",
            detail:
              "Upon landing, checking the assigned baggage belt number lets passengers walk straight from immigration or arrival gates to the right conveyor.",
          },
        ],
      },
    ],
    faqs: [
      {
        question: "Can I check live flight status without a PNR booking reference?",
        answer:
          "Yes! Unlike PNR lookups which require private passenger credentials, live flight status only needs the public airline code, flight number, and departure date—making it ideal for both flyers and family members picking passengers up at arrivals.",
      },
      {
        question: "How often does live flight status update while a plane is in the air?",
        answer:
          "Flight telemetry updates continuously during pushback, takeoff, en-route cruise, and landing. On TravelAdda's Live Flight Status page, you can enable the 'Auto 30s' toggle to refresh live progress automatically every 30 seconds.",
      },
    ],
  },
  {
    slug: "indian-airport-terminals-guide-delhi-mumbai-bengaluru-airline-gates",
    domain: "air",
    title:
      "Delhi T1/T2/T3, Mumbai T1/T2 & Bengaluru T1/T2: How to Check Your Exact Flight Terminal",
    excerpt:
      "Arriving at the wrong airport terminal can cost 35+ minutes in inter-terminal shuttle traffic. Learn how airline flight-number series work at India's busiest airports and verify your live terminal instantly.",
    category: "Airport & Terminals",
    readTime: "7 min read",
    publishedDate: "November 2026",
    publishedIso: "2026-11-06",
    author: {
      name: "Sanya Nair",
      role: "Rail & Aviation Experience Writer",
    },
    accentColor: "from-amber-600 via-orange-500 to-rose-500",
    heroTagline: "Never Take a Wrong Turn at DEL, BOM, BLR or MAA",
    seoKeywords: [
      "delhi airport terminal 1 2 3 airlines",
      "indigo flight number series terminal delhi",
      "mumbai airport t1 vs t2 airlines",
      "bengaluru airport terminal 2 airlines list",
      "check flight terminal number by flight number",
      "boarding gate finder india airports",
    ],
    keyTakeaways: [
      "At Delhi IGI Airport (DEL) and Mumbai CSMIA (BOM), airlines like IndiGo (6E) split domestic flights across terminals based on specific 4-digit flight number series.",
      "All scheduled international departures and arrivals at Delhi (T3), Mumbai (T2), and Bengaluru (T2) operate from dedicated integrated international terminals.",
      "Always verify your flight's live Terminal and Gate on the day of travel, as airport operators periodically rebalance domestic terminal allocations.",
    ],
    quickActionLinks: [
      {
        label: "Verify Your Flight Terminal & Gate Live",
        sublabel: "Instant T1, T2, T3 & Gate lookup by flight number",
        href: "/air/flight-status",
      },
      {
        label: "Check Delhi → Bengaluru (6E 2131) Terminal",
        sublabel: "Live DEL & BLR terminal and gate assignment",
        href: "/air/flight-status?airline=6E&flight=2131",
        airlineCode: "6E",
      },
      {
        label: "Check Delhi → London (BA 142) Terminal",
        sublabel: "IGI T3 & Heathrow T5 gate telemetry",
        href: "/air/flight-status?airline=BA&flight=142",
        airlineCode: "BA",
      },
      {
        label: "Calculate Airport Arrival Buffer Time",
        sublabel: "Interactive DigiYatra & security queue estimator",
        href: "/tools/air#buffer",
      },
    ],
    sections: [
      {
        heading: "Why Same-Airline Flights Use Different Terminals at Delhi & Mumbai",
        paragraphs: [
          "First-time and even frequent flyers are often surprised to discover that two domestic IndiGo (6E) or Air India Express (IX) flights departing 20 minutes apart from the same city can leave from completely different terminal buildings located 5 to 7 kilometres apart!",
          "Because major metro hubs handle over 1,000+ daily air traffic movements, airport operators distribute narrowbody domestic flights by flight-number blocks so check-in islands, DigiYatra e-gates, and baggage belts stay balanced.",
        ],
      },
      {
        heading: "Quick Hub Breakdown: Delhi (DEL), Mumbai (BOM) & Bengaluru (BLR)",
        paragraphs: [
          "While seasonal slot revisions can shift specific flight blocks—which is why running a live lookup on TravelAdda's Flight Status Tracker on departure morning is essential—here is how India's top three multi-terminal hubs are structured:",
        ],
        bullets: [
          {
            label: "New Delhi — Indira Gandhi International Airport (DEL)",
            detail:
              "Terminal 3 (T3) handles all international flights plus Air India domestic flights and designated domestic 6E series. Expanded Terminal 1 (T1) and Terminal 2 (T2) handle high-frequency domestic low-cost carrier blocks based on flight number ranges.",
          },
          {
            label: "Mumbai — Chhatrapati Shivaji Maharaj Intl Airport (BOM)",
            detail:
              "Terminal 2 (Sahar) serves all international airlines, full-service Air India, and designated domestic flights. Terminal 1 (Santacruz) handles select domestic narrowbody schedules.",
          },
          {
            label: "Bengaluru — Kempegowda International Airport (BLR)",
            detail:
              "Terminal 2 ('Terminal in a Garden') handles all international flights alongside Air India, Air India Express, and select domestic carriers, while Terminal 1 serves high-volume domestic operations including IndiGo and Akasa Air.",
          },
          {
            label: "Chennai (MAA) & Kochi (COK)",
            detail:
              "Adjacent domestic and international terminals (such as MAA T1/T4 Domestic vs T2 International, and COK T1 Domestic vs T3 International) are connected via walkways or quick shuttles, yet still require entering the right departure kerb.",
          },
        ],
        callout: {
          title: "Connecting Flight Warning (Domestic ↔ International)",
          text: "If you hold separate PNRs connecting from T1 to T3 in Delhi or T1 to T2 in Mumbai, budget at least 3.5 to 4 hours between landing and your onward departure to clear baggage claim and inter-terminal transfer buses.",
        },
      },
      {
        heading: "When Do Boarding Gate Numbers Appear (and Why Gates Change)?",
        paragraphs: [
          "Unlike terminal numbers—which are fixed weeks in advance in the flight schedule—your exact boarding gate (such as Gate 42A or Gate B14) is assigned dynamically by the airport's Airport Collaborative Decision Making (A-CDM) system roughly 90 to 120 minutes before departure.",
          "If an earlier aircraft parked at your gate experiences a technical inspection or late pushback, apron controllers may reassign your flight to an adjacent gate 30–45 minutes before boarding. Refreshing TravelAdda's Live Flight Status page right after clearing security ensures you walk to the latest active gate.",
        ],
      },
    ],
    faqs: [
      {
        question: "How do I check whether my IndiGo flight is from T1, T2, or T3 in Delhi?",
        answer:
          "Enter airline '6E', your 4-digit flight number, and your travel date on TravelAdda's Live Flight Status Tracker. The Departure Airport card immediately displays the exact terminal (Terminal 1, Terminal 2, or Terminal 3) assigned to that specific flight number.",
      },
      {
        question: "Is inter-terminal transfer free at Delhi and Mumbai airports?",
        answer:
          "Yes, passengers holding valid onward flight tickets or boarding passes can use the official airport inter-terminal shuttle buses free of charge by showing their itinerary at the transfer desk.",
      },
    ],
  },
  {
    slug: "predict-flight-delays-early-by-tracking-inbound-previous-aircraft",
    domain: "air",
    title:
      "Secret to Spotting Flight Delays Early: How Inbound Aircraft Tracking Works",
    excerpt:
      "Why does an airline app say 'On Time' until 45 minutes before departure and suddenly announce a delay? Learn how tracking the incoming previous flight gives you a 2-hour head start.",
    category: "Delay Intelligence",
    readTime: "5 min read",
    publishedDate: "November 2026",
    publishedIso: "2026-11-06",
    author: {
      name: "Capt. Vikramaditya Rao",
      role: "Aviation Operations & Airspace Analyst",
    },
    accentColor: "from-slate-950 via-orange-950 to-amber-900",
    heroTagline: "Beat Reactionary Gate Delays Like an Airline Dispatcher",
    seoKeywords: [
      "how to predict flight delay early",
      "where is my plane right now",
      "track inbound aircraft previous flight",
      "flight delayed due to late arriving aircraft",
      "aircraft turnaround time a320 737",
    ],
    keyTakeaways: [
      "Over 40% of commercial airline delays are 'reactionary delays' caused by the same physical aircraft arriving late from its previous sector.",
      "Narrowbody jets (Airbus A320neo, Boeing 737 MAX) need at least 30–40 minutes on the ground between arrival In-Gate and next pushback.",
      "TravelAdda's Live Flight Status card includes a 1-tap 'Track Inbound Aircraft' button whenever upstream airline ops link the incoming tail rotation.",
    ],
    quickActionLinks: [
      {
        label: "Check Your Flight & Inbound Plane Now",
        sublabel: "Spot knock-on delays before leaving for the airport",
        href: "/air/flight-status",
      },
      {
        label: "Track Emirates EK 511 Live",
        sublabel: "Check widebody turnaround & gate status",
        href: "/air/flight-status?airline=EK&flight=511",
        airlineCode: "EK",
      },
      {
        label: "Track Qatar Airways QR 571 Live",
        sublabel: "Live Doha–India corridor flight radar",
        href: "/air/flight-status?airline=QR&flight=571",
        airlineCode: "QR",
      },
    ],
    sections: [
      {
        heading: "Why Airlines Often Announce Delays Late",
        paragraphs: [
          "Have you ever stood at an airport gate watching the FIDS screen show 'On Time' for a 6:00 PM departure—even though at 5:40 PM there is literally no airplane parked at the jet bridge?",
          "Airlines wait to post official schedule delays because operations control centers at hub airports (like Delhi, Mumbai, Bengaluru, or Hyderabad) sometimes swap aircraft tails at the last minute. However, at non-hub outstations (such as Goa, Jaipur, Kochi, Amritsar, Bagdogra, or Srinagar), there is rarely a spare aircraft waiting—your flight cannot depart until the inbound aircraft lands, disembarks, refuels, and boards!",
        ],
      },
      {
        heading: "Minimum Ground Turnaround Math (Narrowbody vs Widebody)",
        paragraphs: [
          "Once you click 'Track Inbound Aircraft' on TravelAdda's Live Flight Status tracker and see the incoming plane's Estimated Arrival Time, add the minimum physical turnaround window to estimate your true earliest departure:",
        ],
        bullets: [
          {
            label: "Domestic Narrowbody (Airbus A320neo / A321neo / Boeing 737 MAX 8)",
            detail:
              "Requires 30 to 45 minutes minimum from In-Gate arrival to next Out-Gate pushback for deplaning 180–222 passengers, cabin cleaning, catering, refuelling, and boarding.",
          },
          {
            label: "Regional Turboprop (ATR 72-600)",
            detail:
              "Fastest turnaround at 25 to 30 minutes thanks to 72–78 seat capacity and airstair boarding.",
          },
          {
            label: "International Widebody (Boeing 787 / 777 / Airbus A350)",
            detail:
              "Requires 75 to 115 minutes for containerized ULDs cargo unloading, international security sweeps, full meal galley restocking, and 300+ passenger boarding.",
          },
        ],
        callout: {
          title: "Crucial Check-In Rule Even When Inbound Plane Is Late!",
          text: "Never arrive late for airport check-in or bag drop assuming an inbound delay gives you extra time! Airline check-in counters and security gates still close based on the original Scheduled Departure Time unless the airline formally reschedules the flight via SMS/email.",
        },
      },
    ],
    faqs: [
      {
        question: "What does 'Late Arrival of Incoming Aircraft' mean?",
        answer:
          "Commercial airplanes fly 4 to 7 back-to-back sectors every day. If morning fog or air-traffic congestion delays Sector 1 by 50 minutes, that delay ripples into Sector 2 and Sector 3 unless ground crews recover time during turnaround.",
      },
      {
        question: "How do I find which inbound flight is operating my plane?",
        answer:
          "Search your airline, flight number, and date on TravelAdda's Live Flight Status page. Whenever airline dispatch has assigned the rotation, a 'Track Inbound Aircraft' button appears right below the Arrival & Departure cards.",
      },
    ],
  },
  {
    slug: "flight-status-oooi-terms-explained-out-gate-off-ground-in-gate",
    domain: "air",
    title:
      "Scheduled vs Estimated, Out-Gate, Off-Ground & In-Gate: Flight Status Terms Decoded",
    excerpt:
      "What is the difference between Out-Gate and Off-Ground, or On-Ground and In-Gate? Understand real aviation OOOI telemetry so you read flight trackers with pilot-level precision.",
    category: "Aviation Decoded",
    readTime: "5 min read",
    publishedDate: "November 2026",
    publishedIso: "2026-11-06",
    author: {
      name: "Aarav Kulkarni",
      role: "Senior Transit & Telemetry Editor",
    },
    accentColor: "from-indigo-950 via-slate-900 to-orange-900",
    heroTagline: "How Aircraft Sensors Report Every Phase of Your Flight",
    seoKeywords: [
      "out gate vs off ground meaning",
      "on ground vs in gate flight status",
      "oooi aviation times explained",
      "scheduled vs estimated flight time",
      "landed vs arrived flight tracker difference",
    ],
    keyTakeaways: [
      "Aviation uses four automated ACARS milestones called OOOI: Out-Gate (pushback), Off-Ground (wheels up), On-Ground (touchdown), and In-Gate (parked at arrival bridge).",
      "Official airline 'On-Time Performance' (OTP) is measured by In-Gate arrival within 15 minutes of Scheduled Arrival—not runway touchdown.",
      "For airport pickups, add 15–25 minutes after Domestic In-Gate (or 40–60 minutes after International In-Gate for immigration & customs) to time kerbside pickup.",
    ],
    quickActionLinks: [
      {
        label: "Test Live OOOI Flight Telemetry",
        sublabel: "Inspect Out-Gate, Takeoff, Touchdown & Belt times",
        href: "/air/flight-status",
      },
      {
        label: "Track Air India Express IX 194",
        sublabel: "Check live Gulf–India arrival & baggage belt",
        href: "/air/flight-status?airline=IX&flight=194",
        airlineCode: "IX",
      },
    ],
    sections: [
      {
        heading: "What Are OOOI Timestamps in Modern Aviation?",
        paragraphs: [
          "Every modern Airbus and Boeing jet is equipped with automated micro-switches on the cabin doors, parking brakes, and landing gear struts connected to ACARS (Aircraft Communications Addressing and Reporting System). As the flight progresses, the aircraft transmits four exact timestamps—known across global aviation as OOOI:",
        ],
        bullets: [
          {
            label: "1. OUT (Out-Gate Time)",
            detail:
              "Triggered the instant cabin doors close, the aerobridge retracts, and the aircraft releases its parking brake for pushback. Airlines count this as the official departure time!",
          },
          {
            label: "2. OFF (Off-Ground / Takeoff Time)",
            detail:
              "Triggered by weight-off-wheels sensors on the landing gear the moment the aircraft lifts off the departure runway after taxiing.",
          },
          {
            label: "3. ON (On-Ground / Touchdown Time)",
            detail:
              "Triggered when the main landing gear touches down on the destination runway. At busy mega-airports like Delhi or Mumbai, taxiing from runway to gate can still take 10–18 minutes.",
          },
          {
            label: "4. IN (In-Gate Time)",
            detail:
              "Triggered when the aircraft parks at the arrival stand, sets parking brakes, and opens passenger doors. This is the true arrival timestamp.",
          },
        ],
        callout: {
          title: "Perfect Airport Pickup Timing Formula",
          text: "Picking someone up at Arrivals? Watch the On-Ground and In-Gate fields on TravelAdda's Flight Status page. Drive into the arrival pickup lane ~20 minutes after In-Gate for domestic travellers with check-in bags, or ~45 minutes after In-Gate for international arrivals!",
        },
      },
      {
        heading: "Why Block Duration Is Longer Than Actual Air Time",
        paragraphs: [
          "If a flight between Mumbai (BOM) and Bengaluru (BLR) only spends 1 hour 15 minutes in the air, why does the published schedule say 1 hour 50 minutes?",
          "Airlines publish 'Block Time' (Out-Gate to In-Gate), which includes pushback, taxi-out queue at the departure runway, airborne routing, approach sequencing, and taxi-in to the arrival gate. That built-in cushion is why a flight that takes off 20 minutes late often still arrives 'On Time' at its destination!",
        ],
      },
    ],
    faqs: [
      {
        question: "Why does a flight say 'Departed' even before taking off?",
        answer:
          "In airline terminology, a flight transitions to 'Departed' or 'Out-Gate' as soon as the aircraft doors close and pushback begins—typically 10 to 20 minutes before actual runway takeoff (Off-Ground).",
      },
      {
        question: "Are departure and arrival times shown in IST for international flights?",
        answer:
          "Aviation schedules always display each airport's local timezone—for example, London Heathrow departure in GMT/BST and New Delhi arrival in IST—so your watch at each airport always matches the board.",
      },
    ],
  },
  {
    slug: "dgca-flight-delay-cancellation-passenger-rights-india-guide",
    domain: "air",
    title:
      "Flight Delayed or Cancelled in India? DGCA Passenger Rights, Free Meals & Refund Rules",
    excerpt:
      "Know your exact legal entitlements under India's DGCA Civil Aviation Requirements (CAR) when your live flight status shows a 2-hour+ delay, overnight rescheduling, or last-minute cancellation.",
    category: "Flyer Rights & Rules",
    readTime: "6 min read",
    publishedDate: "November 2026",
    publishedIso: "2026-11-06",
    author: {
      name: "Meera Deshmukh",
      role: "Transport Policy & Consumer Analyst",
    },
    accentColor: "from-rose-600 via-orange-600 to-amber-500",
    heroTagline: "Know Your DGCA Charter Entitlements Before You Reach the Desk",
    seoKeywords: [
      "dgca flight delay rules india",
      "flight delayed 2 hours free meal indigo air india",
      "flight cancelled compensation india",
      "hotel accommodation for delayed flight india",
      "airline customer care helpline india",
    ],
    keyTakeaways: [
      "Under DGCA CAR Section 3, Series M, Part IV, airlines must provide free meals and refreshments once delays cross 2, 3, or 4 hours (depending on flight block duration).",
      "For domestic flight delays exceeding 6 hours, airlines must communicate a revised departure time 24 hours ahead OR offer an alternate flight / 100% full refund.",
      "Keep a copy or screenshot of your live flight status summary and airline helpline number handy when requesting rebooking at airport transfer desks.",
    ],
    quickActionLinks: [
      {
        label: "Check Live Delay Status & Airline Helplines",
        sublabel: "Copy timestamped status + toll-free carrier numbers",
        href: "/air/flight-status",
      },
      {
        label: "Check Airline Baggage Allowance Limits",
        sublabel: "Verify 7 kg cabin & 15–30 kg check-in rules on rebooked flights",
        href: "/tools/air#baggage",
      },
      {
        label: "Check Transit Hotel GST & Tariff Calculator",
        sublabel: "Plan unexpected airport layover stays smartly",
        href: "/tools/hotel#gst-calculator",
      },
    ],
    sections: [
      {
        heading: "DGCA Free Meals & Refreshments Thresholds During Delays",
        paragraphs: [
          "Whenever you have checked in on time and your flight shows an operational delay on the live flight status board, India's Directorate General of Civil Aviation (DGCA) mandates complimentary meals and refreshments scaled by your flight's scheduled block time:",
        ],
        bullets: [
          {
            label: "Block Time up to 2.5 Hours (Most Domestic Routes)",
            detail:
              "Free meals and refreshments apply once the departure delay reaches 2 hours or more.",
          },
          {
            label: "Block Time between 2.5 Hours and 5 Hours",
            detail:
              "Free meals and refreshments apply once the departure delay reaches 3 hours or more.",
          },
          {
            label: "Block Time above 5 Hours (Long-Haul International)",
            detail:
              "Free meals and refreshments apply once the departure delay reaches 4 hours or more.",
          },
        ],
      },
      {
        heading: "6-Hour+ Delays, Overnight Stays & Last-Minute Cancellations",
        paragraphs: [
          "When weather fog, technical snags, or crew duty limits push delays into major disruptions, stronger passenger protections kick in:",
          "If a domestic flight is expected to be delayed by more than 6 hours, the airline must offer you the choice between an alternate flight within 6 hours OR a 100% full refund of your ticket (with zero cancellation penalty, even on non-refundable Economy Saver fares!). Furthermore, if a flight scheduled between 8:00 PM and 3:00 AM is delayed by more than 6 hours—or delayed past 24 hours—complimentary hotel accommodation including airport transfers is mandated for non-extraordinary operational delays.",
        ],
        callout: {
          title: "What About Fog or ATC Airspace Closures?",
          text: "Under DGCA rules, 'Extraordinary Circumstances' beyond an airline's control (dense winter CAT-III fog, severe thunderstorms, ATC radar outages, or security alerts) exempt airlines from cash compensation, though your right to a full ticket refund or free rebooking on cancelling a severely delayed trip still applies!",
        },
      },
      {
        heading: "3 Steps to Take Immediately When Your Flight Status Turns 'Delayed' or 'Cancelled'",
        paragraphs: [
          "Don't wait in a 90-person queue at the airport customer desk before acting:",
          "First, verify the exact status and copy the timestamped summary from TravelAdda's Live Flight Status page (using the 'Copy Status' button). Second, call the airline's official helpline number displayed directly inside our Airline Search dropdown and Flight Status card—phone agents can often rebook you onto the next available flight faster than terminal desks. Third, if switching to an overnight express train on short-haul corridors like Delhi–Jaipur, Mumbai–Ahmedabad, or Chennai–Bengaluru, check TravelAdda's Live Train Status & Current Booking availability!",
        ],
      },
    ],
    faqs: [
      {
        question: "Am I entitled to a full refund if my flight is delayed by more than 6 hours?",
        answer:
          "Yes. Under DGCA passenger charter rules for domestic flights, if your flight is delayed beyond 6 hours and you choose not to travel on the delayed or alternate flight offered, the airline must process a full 100% refund without deducting cancellation fees.",
      },
      {
        question: "Where can I find official airline helpline phone numbers quickly?",
        answer:
          "Open TravelAdda's Live Flight Status page and type the airline name in the Airline Search dropdown—official customer support phone numbers are listed directly alongside each carrier's logo and on your live flight status card.",
      },
    ],
  },
];

export const RAIL_BLOG_POSTS: BlogPost[] = [
  {
    slug: "decode-10-digit-indian-railways-pnr-number",
    domain: "rail",
    title: "What Every Digit of Your 10-Digit Indian Railways PNR Secretly Reveals",
    excerpt:
      "Your PNR isn't just a random confirmation code. The first three digits tell you the exact railway zone and PRS server where your journey originates.",
    category: "PNR Masterclass",
    readTime: "5 min read",
    publishedDate: "November 2026",
    publishedIso: "2026-11-01",
    author: { name: "Aarav Kulkarni", role: "Senior Rail Transit Editor" },
    accentColor: "from-slate-950 via-indigo-950 to-blue-950",
    heroTagline: "Inside CRIS & Passenger Reservation System Architecture",
    seoKeywords: [
      "10 digit pnr number meaning",
      "indian railways pnr first 3 digits",
      "cris prs zone codes",
      "live pnr status check",
    ],
    keyTakeaways: [
      "The 1st digit identifies the originating Railway Zone (e.g., 2 or 3 for Northern/NWR zones).",
      "Digits 2 and 3 pinpoint the specific PRS (Passenger Reservation System) data center.",
      "The remaining 7 digits are dynamically generated to make your itinerary unique for 9 months.",
    ],
    quickActionLinks: [
      {
        label: "Check 10-Digit PNR Status Live",
        sublabel: "Instant CNF, RAC & Waitlist confirmation",
        href: "/rail/pnr-status",
      },
      {
        label: "Spot Your Train Live on Radar",
        sublabel: "Blinking GPS station & coach order tracker",
        href: "/rail/live-status",
      },
    ],
    sections: [
      {
        heading: "What Does PNR Actually Stand For?",
        paragraphs: [
          "PNR stands for Passenger Name Record — a 10-digit digital dossier stored inside the Centre for Railway Information Systems (CRIS) database. Whenever you book an IRCTC e-ticket or a counter reservation slip (up to 6 passengers on a single form), CRIS creates one unified 10-digit PNR record.",
          "Rather than storing static text on your PDF ticket, live seat upgrades — from Waitlisted (WL) to RAC and finally Confirmed (CNF) — happen inside this central PNR record.",
        ],
      },
      {
        heading: "Decoding the First Three Digits (Zonal PRS Mapping)",
        paragraphs: [
          "The very first digit of your PNR depends on the train's originating zone (not necessarily the city from where you booked online):",
        ],
        bullets: [
          {
            label: "Digits 2 & 3 (New Delhi PRS)",
            detail:
              "Covers Northern, North Western, North Central, and North Eastern Railway trains.",
          },
          {
            label: "Digits 4 & 5 (Chennai PRS)",
            detail:
              "Covers Southern, South Western, and South Central Railway corridors.",
          },
          {
            label: "Digits 6 & 7 (Kolkata PRS)",
            detail:
              "Covers Eastern, East Coast, South Eastern, and Northeast Frontier zones.",
          },
          {
            label: "Digits 8 & 9 (Mumbai PRS)",
            detail:
              "Covers Western, Central, and West Central Railway routes including Konkan links.",
          },
          {
            label: "Digit 1 (Secunderabad PRS)",
            detail:
              "Dedicated South Central PRS node handling high-volume Deccan express trains.",
          },
        ],
        callout: {
          title: "Pro Traveller Tip",
          text: "Even after your journey ends, PNR numbers remain archived before eventually being recycled by CRIS months later. Always verify the train number and journey date when checking status.",
        },
      },
      {
        heading: "Booking Status vs. Current Status: Why Both Matter",
        paragraphs: [
          "When you run a live PNR check on TravelAdda, you see two columns: Booking Status and Current Status. Booking Status is frozen forever at the moment of payment.",
          "Current Status reflects real-time cancellations and chart allocations. If your ticket was already confirmed at booking, Coach & Berth numbers appear immediately; if you were RAC or Waitlisted, final coach and berth numbers lock in when the reservation chart is prepared.",
        ],
      },
    ],
  },
  {
    slug: "gnwl-vs-pqwl-vs-rlwl-vs-tqwl-confirmation-guide",
    domain: "rail",
    title: "GNWL vs PQWL vs RLWL vs TQWL: Which Waitlist Confirms Fastest?",
    excerpt:
      "Not all waitlisted tickets are treated equally. Learn why GNWL/25 often confirms effortlessly while PQWL/6 might stay unconfirmed till departure.",
    category: "Waitlist & Quotas",
    readTime: "6 min read",
    publishedDate: "November 2026",
    publishedIso: "2026-11-02",
    author: { name: "Meera Deshmukh", role: "Indian Rail Data Analyst" },
    accentColor: "from-orange-600 via-amber-500 to-yellow-500",
    heroTagline: "Smart Quota Strategy for High-Demand Seasons",
    seoKeywords: [
      "gnwl vs pqwl vs rlwl",
      "tqwl confirmation chances",
      "rac ticket rules indian railways",
      "waitlisted e ticket refund",
    ],
    keyTakeaways: [
      "GNWL (General Waitlist) receives top priority whenever end-to-end passengers cancel.",
      "RLWL (Remote Location Waitlist) operates on an independent intermediate-station mini-quota.",
      "Fully waitlisted IRCTC e-tickets are automatically cancelled and refunded after charting.",
    ],
    quickActionLinks: [
      {
        label: "Check Waitlist PNR Confirmation",
        sublabel: "Live GNWL, RLWL, PQWL & RAC tracker",
        href: "/rail/pnr-status",
      },
      {
        label: "Spot Live Train Running Status",
        sublabel: "Track live delays, platforms & coach rake",
        href: "/rail/live-status",
      },
    ],
    sections: [
      {
        heading: "The Hierarchy of Indian Railways Waitlist Pools",
        paragraphs: [
          "Seeing 'WL/8' on two different trains can mean completely different confirmation odds depending on the prefix attached to your waitlist code. Indian Railways divides seats across origin-destination pools so intermediate towns aren't left empty-handed.",
        ],
        bullets: [
          {
            label: "GNWL (General Waiting List) — Highest Priority",
            detail:
              "Issued to passengers boarding at or near the train's originating station and travelling close to the terminating station. Largest seat pool and highest cancellation turnover.",
          },
          {
            label: "RLWL (Remote Location Waiting List) — Moderate Priority",
            detail:
              "Assigned for major intermediate hubs along long routes. Confirmations depend strictly on cancellations by passengers holding seats for that specific intermediate leg.",
          },
          {
            label: "PQWL (Pooled Quota Waiting List) — Tight Pool",
            detail:
              "Shared across several smaller intermediate stations. Because the pooled quota allocation is small, movement is slower than GNWL.",
          },
          {
            label: "TQWL (Tatkal Waiting List) — Last-Minute Pool",
            detail:
              "Formerly CKWL. Unlike GNWL, TQWL tickets skip RAC and jump directly to CNF only if confirmed Tatkal passengers cancel.",
          },
        ],
      },
      {
        heading: "What Happens If an E-Ticket Remains Waitlisted After Charting?",
        paragraphs: [
          "If all passengers on an online IRCTC e-ticket remain on the Waiting List after final chart preparation, you are NOT permitted to board reserved coaches. CRIS automatically triggers a cancellation and credits the refund (minus nominal clerkage charges) back to your payment source within 3–5 working days.",
          "However, on a 'Partially Confirmed' PNR — where at least one passenger is CNF or RAC and another is WL on the same 10-digit PNR — all passengers on that PNR are legally permitted to board and share the allotted berth, subject to TTE verification.",
        ],
        callout: {
          title: "RAC Means You Can Always Board!",
          text: "Reservation Against Cancellation (RAC) guarantees entry into the coach with a shared side-lower seating berth, and frequently upgrades to a full sleeping berth once the TTE marks no-shows onboard.",
        },
      },
    ],
  },
  {
    slug: "irctc-chart-preparation-timings-first-and-second-chart",
    domain: "rail",
    title: "Chart Preparation Rules 2026: Exact Timings for 1st & 2nd Railway Charts",
    excerpt:
      "Wondering why your PNR still says 'Chart Not Prepared'? Here is the exact 4-hour and previous-evening schedule followed across Indian Railways.",
    category: "Charting Rules",
    readTime: "4 min read",
    publishedDate: "October 2026",
    publishedIso: "2026-10-24",
    author: { name: "Rohan Verma", role: "Travel Operations Specialist" },
    accentColor: "from-slate-950 via-violet-950 to-indigo-950",
    heroTagline: "Never Miss Last-Minute Current Booking & Upgrades",
    seoKeywords: [
      "irctc chart preparation time",
      "first and second chart railway rules",
      "chart not prepared meaning",
      "current booking window irctc",
    ],
    keyTakeaways: [
      "Day & afternoon trains prepare their 1st chart roughly 4 hours prior to scheduled departure.",
      "Early-morning departures (before 12:00 PM) usually finalize their 1st chart the previous night between 8:00 PM and 9:30 PM.",
      "A 2nd final chart is locked 30 minutes before departure to allocate last-minute Current Booking seats.",
    ],
    quickActionLinks: [
      {
        label: "Verify Chart Preparation Status",
        sublabel: "Enter 10-digit PNR to check coach & berth",
        href: "/rail/pnr-status",
      },
      {
        label: "Check Live Train Platform & Coach Order",
        sublabel: "Engine-to-guard coach positions",
        href: "/rail/live-status",
      },
    ],
    sections: [
      {
        heading: "Why Does My Status Say 'Chart Not Prepared'?",
        paragraphs: [
          "Until a few hours before your train departs from its originating or charting-control station, CRIS keeps seat rebalancing dynamic. During this phase, our PNR Status tool displays 'Chart Not Prepared' — which is completely normal even for 100% Confirmed (CNF) tickets!",
          "For confirmed tickets in Chair Car (CC), AC 3-Tier (3A), or Sleeper (SL), you will usually already see your coach and berth, while RAC passengers receive their exact coach and seat number the moment charting completes.",
        ],
      },
      {
        heading: "First Chart vs. Second Chart Schedule",
        paragraphs: [
          "Indian Railways runs a two-stage charting workflow so vacant quota berths (VIP/HQ, Foreign Tourist, Ladies, Senior Citizen) aren't wasted:",
        ],
        bullets: [
          {
            label: "Trains Departing 12:00 Noon to 11:59 PM",
            detail:
              "First reservation chart is prepared at least 4 hours before scheduled departure.",
          },
          {
            label: "Morning Trains (05:00 AM to 12:00 Noon)",
            detail:
              "First chart is typically prepared the previous evening around 20:00–21:00 hrs so passengers don't have to wake up at 2 AM to check WL status.",
          },
          {
            label: "Second Chart (30 Minutes Before Departure)",
            detail:
              "Captures Current Booking reservations and late cancellations right before the TTE's handheld HHT tablet syncs.",
          },
        ],
        callout: {
          title: "Secret Hack: Current Booking Window",
          text: "Right between the 1st Chart (4 hours prior) and 2nd Chart (30 mins prior), any leftover berths open under 'Current Availability' at a 10% base-fare discount on select trains!",
        },
      },
    ],
  },
  {
    slug: "indian-railways-coach-classes-explained-cc-ec-3e-2a",
    domain: "rail",
    title: "From Double Decker CC to Vistadome EV & 3E Economy: Choosing the Best Coach",
    excerpt:
      "Confused between 3A and 3E, or Upper vs Lower Deck in Double Decker trains? Our visual guide breaks down every coach prefix and comfort level.",
    category: "Rail Comfort",
    readTime: "5 min read",
    publishedDate: "October 2026",
    publishedIso: "2026-10-18",
    author: { name: "Sanya Nair", role: "Rail & Aviation Experience Writer" },
    accentColor: "from-amber-600 via-orange-500 to-yellow-500",
    heroTagline: "Pick the Right Seat Before You Book",
    seoKeywords: [
      "indian railways coach codes cc ec 3e 3a",
      "vistadome ev coach features",
      "3a vs 3e difference",
      "coach position from engine",
    ],
    keyTakeaways: [
      "In Double Decker Chair Car coaches, 'U' denotes Upper Deck and 'L' denotes Lower Deck.",
      "3E (AC 3-Tier Economy) packs 83 redesigned ergonomic berths with individual AC vents and USB-C ports at lower fares than 3A.",
      "EV (Vistadome) features rotatable 180-degree pushback chairs and panoramic glass roofs on scenic ghat routes.",
    ],
    quickActionLinks: [
      {
        label: "Inspect Exact Coach Order From Engine",
        sublabel: "Search any train number to see full rake layout",
        href: "/rail/live-status",
      },
      {
        label: "Open Coach & Berth Code Decoder",
        sublabel: "Translate CNF, WS, LB, UB, 3E & EV codes",
        href: "/rail/pnr-status#decoder",
      },
    ],
    sections: [
      {
        heading: "Decoding Coach Prefixes on Your PNR Slip",
        paragraphs: [
          "Once your ticket confirms, your coach ID tells you both the class and deck layout. Knowing the prefix saves last-minute sprinting across long 24-coach platforms:",
        ],
        bullets: [
          {
            label: "C1–C12 / Upper & Lower Deck (AC Chair Car - CC)",
            detail:
              "Standard Shatabdi & Vande Bharat Chair Cars use C1, C2... while Double Decker Express trains append U (Upper Deck), M (Middle level), or L (Lower Deck).",
          },
          {
            label: "E1–E2 (Executive Chair Car - EC)",
            detail:
              "2x2 wide business-style reclining seats with leg rests on Vande Bharat, Tejas, and Shatabdi trains.",
          },
          {
            label: "B1–B15 & M1–M5 (AC 3-Tier 3A vs Economy 3E)",
            detail:
              "B-series coaches represent classic 72/80-berth LHB 3A coaches, while M-series denotes modern 83-berth 3A Economy coaches.",
          },
          {
            label: "A1–A5 & H1 (AC 2-Tier 2A & First AC 1A)",
            detail:
              "A-series offers spacious 2-tier curtains/reading lamps; H1 offers lockable 2-berth coupes and 4-berth cabins.",
          },
        ],
        callout: {
          title: "Double Decker Luggage Tip",
          text: "Booking Upper Deck gives fantastic elevated window views! Pack medium-sized backpacks or cabin trolleys, as staircase turns into upper/lower decks are compact.",
        },
      },
    ],
  },
];

export const ALL_BLOG_POSTS: BlogPost[] = [
  ...FLIGHT_BLOG_POSTS,
  ...RAIL_BLOG_POSTS,
];

export const PNR_FAQ_ITEMS = [
  {
    question: "How does TravelAdda check live Indian Railways PNR status?",
    answer:
      "When you enter your 10-digit PNR number, TravelAdda calls our owned backend API (/api/pnr/{pnr}), which performs a secure server-to-server real-time query against the live railway PNR engine, enriches coach, berth, and quota codes into human-readable labels, and delivers instant status updates.",
  },
  {
    question: "Where do I find the 10-digit PNR number on my ticket?",
    answer:
      "On an IRCTC e-ticket (ERS/SMS/WhatsApp), the 10-digit PNR is printed at the top-left or top-right under 'PNR No'. On a physical counter PRS ticket, it appears in the upper-left box in a 3-3-4 digit grouping.",
  },
  {
    question: "What do coach, seat, and quota codes mean on my PNR result?",
    answer:
      "CNF means Confirmed; RAC means Reservation Against Cancellation; WL means Waitlisted. Coach IDs indicate your compartment (such as B1 for 3A, A1 for 2A, or C-series for AC Chair Car), followed by your seat number, berth position (such as LB for Lower Berth or WS for Window Side), and booking quota (such as GN for General or TQ for Tatkal).",
  },
  {
    question: "Do I need to carry a printed ticket if my PNR status is Confirmed?",
    answer:
      "No physical printout is needed for IRCTC e-tickets. An SMS, screenshot, or live TravelAdda PNR confirmation paired with one original valid government photo ID (Aadhaar, Passport, Voter ID, Driving Licence, or PAN Card) is completely valid onboard.",
  },
  {
    question: "Why does my PNR status show an error late at night?",
    answer:
      "Indian Railways CRIS PRS servers undergo daily scheduled maintenance for roughly 45 minutes between 11:45 PM and 12:30 AM IST. Queries right inside that maintenance window may briefly pause before resuming automatically.",
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return ALL_BLOG_POSTS.find((post) => post.slug === slug);
}
