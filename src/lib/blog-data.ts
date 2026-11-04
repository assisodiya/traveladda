export interface BlogSection {
  heading: string;
  paragraphs: string[];
  bullets?: { label: string; detail: string }[];
  callout?: { title: string; text: string };
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: "PNR Masterclass" | "Waitlist & Quotas" | "Charting Rules" | "Rail Comfort";
  readTime: string;
  publishedDate: string;
  author: {
    name: string;
    role: string;
  };
  accentColor: string;
  heroTagline: string;
  keyTakeaways: string[];
  sections: BlogSection[];
}

export const RAIL_BLOG_POSTS: BlogPost[] = [
  {
    slug: "decode-10-digit-indian-railways-pnr-number",
    title: "What Every Digit of Your 10-Digit Indian Railways PNR Secretly Reveals",
    excerpt:
      "Your PNR isn't just a random confirmation code. The first three digits tell you the exact railway zone and PRS server where your journey originates.",
    category: "PNR Masterclass",
    readTime: "5 min read",
    publishedDate: "November 2026",
    author: { name: "Aarav Kulkarni", role: "Senior Rail Transit Editor" },
    accentColor: "from-amber-500 to-orange-600",
    heroTagline: "Inside CRIS & Passenger Reservation System Architecture",
    keyTakeaways: [
      "The 1st digit identifies the originating Railway Zone (e.g., 2 or 3 for Northern/NWR zones).",
      "Digits 2 and 3 pinpoint the specific PRS (Passenger Reservation System) data center.",
      "The remaining 7 digits are dynamically generated to make your itinerary unique for 9 months.",
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
          "The very first digit of your PNR depends on the train's originating zone (not necessarily the city from where you booked online). That is why a Jaipur or New Delhi corridor train like 12986 Double Decker Express starts with a '2':",
        ],
        bullets: [
          {
            label: "Digits 2 & 3 (New Delhi PRS)",
            detail: "Covers Northern, North Western, North Central, and North Eastern Railway trains.",
          },
          {
            label: "Digits 4 & 5 (Chennai PRS)",
            detail: "Covers Southern, South Western, and South Central Railway corridors.",
          },
          {
            label: "Digits 6 & 7 (Kolkata PRS)",
            detail: "Covers Eastern, East Coast, South Eastern, and Northeast Frontier zones.",
          },
          {
            label: "Digits 8 & 9 (Mumbai PRS)",
            detail: "Covers Western, Central, and West Central Railway routes including Konkan links.",
          },
          {
            label: "Digit 1 (Secunderabad PRS)",
            detail: "Dedicated South Central PRS node handling high-volume Deccan express trains.",
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
          "When you run a live PNR check on TravelAdda, you see two columns: Booking Status and Current Status. Booking Status is frozen forever at the moment of payment — for instance, 'WL/14/GN' or 'CNF/C8U/71/WS/GN'.",
          "Current Status reflects real-time cancellations and chart allocations. If your ticket was already confirmed at booking, Coach & Berth numbers appear immediately; if you were RAC or Waitlisted, final coach and berth numbers lock in when the reservation chart is prepared.",
        ],
      },
    ],
  },
  {
    slug: "gnwl-vs-pqwl-vs-rlwl-vs-tqwl-confirmation-guide",
    title: "GNWL vs PQWL vs RLWL vs TQWL: Which Waitlist Confirms Fastest?",
    excerpt:
      "Not all waitlisted tickets are treated equally. Learn why GNWL/25 often confirms effortlessly while PQWL/6 might stay unconfirmed till departure.",
    category: "Waitlist & Quotas",
    readTime: "6 min read",
    publishedDate: "November 2026",
    author: { name: "Meera Deshmukh", role: "Indian Rail Data Analyst" },
    accentColor: "from-emerald-500 to-teal-700",
    heroTagline: "Smart Quota Strategy for High-Demand Seasons",
    keyTakeaways: [
      "GNWL (General Waitlist) receives top priority whenever end-to-end passengers cancel.",
      "RLWL (Remote Location Waitlist) operates on an independent intermediate-station mini-quota.",
      "Fully waitlisted IRCTC e-tickets are automatically cancelled and refunded after charting.",
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
    title: "Chart Preparation Rules 2026: Exact Timings for 1st & 2nd Railway Charts",
    excerpt:
      "Wondering why your PNR still says 'Chart Not Prepared'? Here is the exact 4-hour and previous-evening schedule followed across Indian Railways.",
    category: "Charting Rules",
    readTime: "4 min read",
    publishedDate: "October 2026",
    author: { name: "Rohan Verma", role: "Travel Operations Specialist" },
    accentColor: "from-indigo-500 to-slate-800",
    heroTagline: "Never Miss Last-Minute Current Booking & Upgrades",
    keyTakeaways: [
      "Day & afternoon trains prepare their 1st chart roughly 4 hours prior to scheduled departure.",
      "Early-morning departures (before 12:00 PM) usually finalize their 1st chart the previous night between 8:00 PM and 9:30 PM.",
      "A 2nd final chart is locked 30 minutes before departure to allocate last-minute Current Booking seats.",
    ],
    sections: [
      {
        heading: "Why Does My Status Say 'Chart Not Prepared'?",
        paragraphs: [
          "Until a few hours before your train departs from its originating or charting-control station, CRIS keeps seat rebalancing dynamic. During this phase, our PNR Status tool displays 'Chart Not Prepared' — which is completely normal even for 100% Confirmed (CNF) tickets!",
          "For confirmed tickets in Chair Car (CC), AC 3-Tier (3A), or Sleeper (SL), you will usually already see your coach and berth (such as C8U / 71 / Window Side), while RAC passengers receive their exact coach and seat number the moment charting completes.",
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
            detail: "First reservation chart is prepared at least 4 hours before scheduled departure.",
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
    title: "From Double Decker CC to Vistadome EV & 3E Economy: Choosing the Best Coach",
    excerpt:
      "Confused between 3A and 3E, or C8U vs C8L in Double Decker trains? Our visual guide breaks down every coach prefix and comfort level.",
    category: "Rail Comfort",
    readTime: "5 min read",
    publishedDate: "October 2026",
    author: { name: "Sanya Nair", role: "Rail & Aviation Experience Writer" },
    accentColor: "from-rose-500 to-orange-600",
    heroTagline: "Pick the Right Seat Before You Book",
    keyTakeaways: [
      "In Double Decker Chair Car coaches (like C8U / C8L), 'U' denotes Upper Deck and 'L' denotes Lower Deck.",
      "3E (AC 3-Tier Economy) packs 83 redesigned ergonomic berths with individual AC vents and USB-C ports at lower fares than 3A.",
      "EV (Vistadome) features rotatable 180-degree pushback chairs and panoramic glass roofs on scenic ghat routes.",
    ],
    sections: [
      {
        heading: "Decoding Coach Prefixes on Your PNR Slip",
        paragraphs: [
          "Once your ticket confirms, your coach ID tells you both the class and deck layout. Knowing the prefix saves last-minute sprinting across long 24-coach platforms:",
        ],
        bullets: [
          {
            label: "C1–C12 / C8U & C8L (AC Chair Car - CC)",
            detail:
              "Standard Shatabdi & Vande Bharat Chair Cars use C1, C2... while Double Decker Express trains append U (Upper Deck), M (Middle level), or L (Lower Deck) — e.g., C8U means Coach C8, Upper Deck!",
          },
          {
            label: "E1–E2 (Executive Chair Car - EC)",
            detail: "2x2 wide business-style reclining seats with leg rests on Vande Bharat, Tejas, and Shatabdi trains.",
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
          text: "Booking Upper Deck (e.g. C8U) gives fantastic elevated window views! Pack medium-sized backpacks or cabin trolleys, as staircase turns into upper/lower decks are compact.",
        },
      },
    ],
  },
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
      "On an IRCTC e-ticket (ERS/SMS/WhatsApp), the 10-digit PNR is printed at the top-left or top-right under 'PNR No'. On a physical counter PRS ticket, it appears in the upper-left box in a 3-3-4 digit grouping (for example, 252-801-2827).",
  },
  {
    question: "What does CNF/C8U/71/WS/GN mean on my PNR result?",
    answer:
      "CNF means Confirmed; C8U is Coach C8 (Upper Deck on Double Decker Express); 71 is Seat/Berth #71; WS stands for Window Side; and GN indicates the ticket was booked under General Quota.",
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
  return RAIL_BLOG_POSTS.find((post) => post.slug === slug);
}

