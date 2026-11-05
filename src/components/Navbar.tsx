"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CalculatorIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  HotelIcon,
  LuggageIcon,
  MapPinIcon,
  PlaneIcon,
  ShieldCheckIcon,
  TicketIcon,
  TrainIcon,
} from "./Icons";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

type MenuKey = "air" | "rail" | "hotel";

interface DropdownToolItem {
  title: string;
  description: string;
  href: string;
  badge?: string;
  icon: React.ReactNode;
  iconBg: string;
}

interface MenuCategory {
  key: MenuKey;
  label: string;
  tagline: string;
  mainIcon: React.ReactNode;
  viewAllHref: string;
  viewAllLabel: string;
  items: DropdownToolItem[];
}

const MENU_CATEGORIES: MenuCategory[] = [
  {
    key: "air",
    label: "Air",
    tagline: "Flight planning & airport utilities",
    mainIcon: <PlaneIcon className="h-4 w-4" />,
    viewAllHref: "/tools/air",
    viewAllLabel: "Open All Air Tools",
    items: [
      {
        title: "Baggage Allowance Checker",
        description: "Cabin & check-in weight limits by airline and fare type",
        href: "/tools/air#baggage",
        badge: "TOOL",
        icon: <LuggageIcon className="h-5 w-5" />,
        iconBg: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
      },
      {
        title: "Airport Arrival & Layover Planner",
        description: "Calculate ideal terminal reporting & gate buffer times",
        href: "/tools/air#buffer",
        icon: <ClockIcon className="h-5 w-5" />,
        iconBg: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
      },
      {
        title: "Boarding & DigiYatra Checklist",
        description: "Essential cabin rules, ID docs & web check-in guide",
        href: "/tools/air#checklist",
        icon: <ShieldCheckIcon className="h-5 w-5" />,
        iconBg: "bg-yellow-500/20 text-amber-900 dark:text-yellow-300",
      },
    ],
  },
  {
    key: "rail",
    label: "Rail",
    tagline: "Live Indian Railways tools & guides",
    mainIcon: <TrainIcon className="h-4 w-4" />,
    viewAllHref: "/rail/pnr-status",
    viewAllLabel: "Open Rail PNR Hub",
    items: [
      {
        title: "Live PNR Status Checker",
        description: "Real-time seat confirmation, coach, berth & chart status",
        href: "/rail/pnr-status",
        badge: "LIVE",
        icon: <TicketIcon className="h-5 w-5" />,
        iconBg: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
      },
      {
        title: "Coach & Berth Code Decoder",
        description: "Translate CNF, RAC, GNWL, WS, LB, CC, 3E & EV codes",
        href: "/rail/pnr-status#decoder",
        icon: <CheckCircleIcon className="h-5 w-5" />,
        iconBg: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
      },
      {
        title: "Rail Travel Blog & Chart Rules",
        description: "1st & 2nd chart timings, waitlist priority & coach tips",
        href: "/rail/pnr-status#rail-blog",
        icon: <BookOpenIcon className="h-5 w-5" />,
        iconBg: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
      },
    ],
  },
  {
    key: "hotel",
    label: "Hotel",
    tagline: "Smart stay budget & check-in tools",
    mainIcon: <HotelIcon className="h-4 w-4" />,
    viewAllHref: "/tools/hotel",
    viewAllLabel: "Open All Hotel Tools",
    items: [
      {
        title: "Hotel Tariff & GST Calculator",
        description: "Estimate total stay cost across 0%, 12% & 18% tax slabs",
        href: "/tools/hotel#gst-calculator",
        badge: "TOOL",
        icon: <CalculatorIcon className="h-5 w-5" />,
        iconBg: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
      },
      {
        title: "Check-in & Transit Stay Planner",
        description: "Plan early railway/flight arrivals & transit room windows",
        href: "/tools/hotel#transit-planner",
        icon: <ClockIcon className="h-5 w-5" />,
        iconBg: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
      },
      {
        title: "Guest ID & Booking Guide",
        description: "Accepted ID proofs, cancellation tips & hub locations",
        href: "/tools/hotel#stay-checklist",
        icon: <MapPinIcon className="h-5 w-5" />,
        iconBg: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
      },
    ],
  },
];

function DesktopDropdownBar({ pathname }: { pathname: string }) {
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenMenu(null);
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const isCategoryActive = (key: MenuKey) => {
    if (!pathname) return false;
    if (key === "rail") {
      return pathname.startsWith("/rail") || pathname.startsWith("/blog");
    }
    if (key === "air") return pathname.startsWith("/tools/air");
    if (key === "hotel") return pathname.startsWith("/tools/hotel");
    return false;
  };

  return (
    <div ref={navRef} className="hidden items-center gap-2 md:flex">
      {MENU_CATEGORIES.map((category) => {
        const isOpen = openMenu === category.key;
        const isActive = isCategoryActive(category.key);

        return (
          <div
            key={category.key}
            className="relative"
            onMouseEnter={() => setOpenMenu(category.key)}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button
              type="button"
              onClick={() =>
                setOpenMenu((prev) =>
                  prev === category.key ? null : category.key
                )
              }
              aria-expanded={isOpen}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                isOpen || isActive
                  ? "bg-orange-500/15 text-orange-700 ring-1 ring-orange-500/30 dark:text-amber-300 dark:ring-amber-400/35"
                  : "text-ink-soft hover:bg-subcard hover:text-ink"
              }`}
            >
              {category.mainIcon}
              <span>{category.label}</span>
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform duration-200 ${
                  isOpen
                    ? "rotate-180 text-orange-600 dark:text-amber-400"
                    : "text-ink-muted"
                }`}
              />
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
              <div className="absolute left-1/2 top-full z-50 w-[380px] -translate-x-1/2 pt-2.5">
                <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-2xl shadow-black/20">
                  {/* Dropdown Header */}
                  <div className="ta-ticket-header flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2 text-orange-700 dark:text-amber-300">
                      {category.mainIcon}
                      <span className="text-xs font-extrabold uppercase tracking-wider">
                        {category.label} Toolkit
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-ink-soft">
                      {category.tagline}
                    </span>
                  </div>

                  {/* Tool Links */}
                  <div className="divide-y divide-line p-2">
                    {category.items.map((tool) => (
                      <Link
                        key={tool.title}
                        href={tool.href}
                        onClick={() => setOpenMenu(null)}
                        className="group flex items-start gap-3.5 rounded-xl p-3 transition-colors hover:bg-subcard"
                      >
                        <span
                          className={`mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tool.iconBg} transition-transform group-hover:scale-105`}
                        >
                          {tool.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="text-sm font-bold text-ink group-hover:text-orange-600 dark:group-hover:text-amber-300">
                              {tool.title}
                            </span>
                            {tool.badge && (
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wide ${
                                  tool.badge === "LIVE"
                                    ? "bg-orange-500/18 text-orange-700 dark:text-orange-300"
                                    : "bg-amber-500/18 text-amber-800 dark:text-amber-300"
                                }`}
                              >
                                {tool.badge === "LIVE" && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500 dark:bg-amber-400" />
                                )}
                                {tool.badge}
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">
                            {tool.description}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>

                  {/* Dropdown Footer Link */}
                  <div className="border-t border-line bg-subcard px-4 py-2.5">
                    <Link
                      href={category.viewAllHref}
                      onClick={() => setOpenMenu(null)}
                      className="inline-flex w-full items-center justify-between text-xs font-extrabold text-orange-700 hover:text-orange-900 dark:text-amber-300 dark:hover:text-amber-200"
                    >
                      <span>{category.viewAllLabel}</span>
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ActiveDesktopNav() {
  const pathname = usePathname();
  return <DesktopDropdownBar pathname={pathname} />;
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<MenuKey | null>("rail");

  return (
    <header className="ta-navbar sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Main Brand Logo (Main Heading Only) */}
        <Logo size="md" />

        {/* Main Top Menu: Air, Rail, Hotel with Rich Tool Dropdowns */}
        <Suspense fallback={<DesktopDropdownBar pathname="" />}>
          <ActiveDesktopNav />
        </Suspense>

        {/* Right Theme Toggle + Primary CTA */}
        <div className="hidden items-center gap-2.5 md:flex">
          <ThemeToggle />
          <Link
            href="/rail/pnr-status"
            className="ta-btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-extrabold"
          >
            <TicketIcon className="h-4 w-4" />
            <span>PNR Status</span>
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-subcard text-ink"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? (
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                className="h-5 w-5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                className="h-5 w-5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7h16M4 12h16M4 17h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileOpen && (
        <div className="border-t border-line bg-card px-4 py-4 shadow-xl md:hidden">
          <div className="space-y-2">
            {MENU_CATEGORIES.map((cat) => {
              const expanded = mobileExpanded === cat.key;
              return (
                <div
                  key={cat.key}
                  className="overflow-hidden rounded-2xl border border-line bg-subcard"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setMobileExpanded((prev) =>
                        prev === cat.key ? null : cat.key
                      )
                    }
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-extrabold text-ink"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/15 text-orange-700 dark:text-amber-300">
                        {cat.mainIcon}
                      </span>
                      <span>{cat.label}</span>
                    </span>
                    <ChevronDownIcon
                      className={`h-4 w-4 text-ink-muted transition-transform ${
                        expanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {expanded && (
                    <div className="space-y-1 border-t border-line bg-card p-2">
                      {cat.items.map((tool) => (
                        <Link
                          key={tool.title}
                          href={tool.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-subcard"
                        >
                          <span
                            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tool.iconBg}`}
                          >
                            {tool.icon}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-ink">
                              {tool.title}
                            </span>
                            <span className="block truncate text-xs text-ink-soft">
                              {tool.description}
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <Link
              href="/rail/pnr-status"
              onClick={() => setMobileOpen(false)}
              className="ta-btn-primary mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold"
            >
              <TicketIcon className="h-4 w-4" />
              <span>Check Live PNR Status</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
