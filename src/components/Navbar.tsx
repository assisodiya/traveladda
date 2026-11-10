"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { TOOL_CATEGORIES, type ToolMenuItem } from "@/lib/tools-catalog";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CalculatorIcon,
  ChevronDownIcon,
  ClockIcon,
  CloseIcon,
  CoachTrainIcon,
  CompassIcon,
  HotelIcon,
  LuggageIcon,
  MenuIcon,
  PhoneCallIcon,
  PlaneIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TicketIcon,
  TrainIcon,
} from "./Icons";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

interface NavTab {
  label: string;
  shortLabel: string;
  href: string;
  matchPrefix: string;
  badge?: string;
  icon: React.ReactNode;
}

const PRIMARY_NAV_TABS: NavTab[] = [
  {
    label: "Flight Status",
    shortLabel: "Flights",
    href: "/air/flight-status",
    matchPrefix: "/air/flight-status",
    badge: "LIVE",
    icon: <PlaneIcon className="h-4 w-4" />,
  },
  {
    label: "Train Status",
    shortLabel: "Trains",
    href: "/rail/live-status",
    matchPrefix: "/rail/live-status",
    badge: "LIVE",
    icon: <TrainIcon className="h-4 w-4" />,
  },
  {
    label: "PNR Status",
    shortLabel: "PNR",
    href: "/rail/pnr-status",
    matchPrefix: "/rail/pnr-status",
    icon: <TicketIcon className="h-4 w-4" />,
  },
];

const SECONDARY_NAV_TABS: NavTab[] = [
  {
    label: "Guides",
    shortLabel: "Guides",
    href: "/blog",
    matchPrefix: "/blog",
    icon: <BookOpenIcon className="h-4 w-4" />,
  },
  {
    label: "About Us",
    shortLabel: "About",
    href: "/about",
    matchPrefix: "/about",
    icon: <ShieldCheckIcon className="h-4 w-4" />,
  },
];

function renderToolItemIcon(iconKey: ToolMenuItem["iconKey"]) {
  switch (iconKey) {
    case "plane":
      return <PlaneIcon className="h-4 w-4" />;
    case "luggage":
      return <LuggageIcon className="h-4 w-4" />;
    case "clock":
      return <ClockIcon className="h-4 w-4" />;
    case "phone":
      return <PhoneCallIcon className="h-4 w-4" />;
    case "BoardingCheck":
      return <ShieldCheckIcon className="h-4 w-4" />;
    case "train":
      return <TrainIcon className="h-4 w-4" />;
    case "ticket":
      return <TicketIcon className="h-4 w-4" />;
    case "coach":
      return <CoachTrainIcon className="h-4 w-4" />;
    case "decoder":
      return <SparklesIcon className="h-4 w-4" />;
    case "calculator":
      return <CalculatorIcon className="h-4 w-4" />;
    case "hotel":
      return <HotelIcon className="h-4 w-4" />;
    case "shield":
      return <ShieldCheckIcon className="h-4 w-4" />;
  }
}

function ToolsMegaDropdown({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isToolsActive = pathname.startsWith("/tools");

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`relative inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition xl:px-3 xl:text-sm ${
          isToolsActive || open
            ? "bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
            : "text-ink-soft hover:bg-subcard hover:text-ink"
        }`}
      >
        <CompassIcon
          className={`h-4 w-4 ${
            isToolsActive || open
              ? "text-[#1956b4] dark:text-blue-300"
              : "text-ink-muted"
          }`}
        />
        <span>Tools</span>
        <span className="rounded bg-[#fc6203]/15 px-1.5 py-0.5 text-[10px] font-bold leading-none text-[#fc6203]">
          12
        </span>
        <ChevronDownIcon
          className={`h-3.5 w-3.5 transition-transform duration-150 ${
            open ? "rotate-180 text-[#1956b4] dark:text-blue-300" : ""
          }`}
        />
        {isToolsActive && (
          <span className="absolute right-2.5 bottom-0 left-2.5 h-0.5 rounded-full bg-[#fc6203]" />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-1/2 z-50 w-[860px] max-w-[92vw] -translate-x-1/2 pt-2">
          <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-2xl ring-1 ring-black/5">
            {/* Mega Menu Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-subcard/70 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#1956b4] text-white">
                  <CompassIcon className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-ink">
                    TravelAdda Utility Suite (Category-Wise Tools)
                  </p>
                </div>
              </div>
              <Link
                href="/tools"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-400"
              >
                <span>View All 12 Travel Tools</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* 3 Category Columns */}
            <div className="grid divide-y divide-line p-4 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
              {TOOL_CATEGORIES.map((category) => (
                <div
                  key={category.id}
                  className="px-3 py-2 first:pl-1 last:pr-1"
                >
                  <div className="mb-2.5 flex items-center justify-between px-2">
                    <div>
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${category.accentBadgeClass}`}
                      >
                        {category.categoryTitle}
                      </span>
                      <p className="mt-0.5 text-[11px] text-ink-muted">
                        {category.categorySubtitle}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {category.items.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="group flex items-start gap-2.5 rounded-xl p-2 transition hover:bg-subcard"
                      >
                        <span
                          className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${category.accentBadgeClass}`}
                        >
                          {renderToolItemIcon(item.iconKey)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <p className="truncate text-xs font-bold text-ink group-hover:text-[#1956b4] dark:group-hover:text-blue-300">
                              {item.title}
                            </p>
                            {item.badge && (
                              <span className="shrink-0 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-ink-muted">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Mega Menu Footer Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-subcard/60 px-5 py-2.5 text-xs">
              <div className="flex flex-wrap items-center gap-4 text-ink-muted">
                <Link
                  href="/about"
                  onClick={() => setOpen(false)}
                  className="font-semibold hover:text-[#1956b4] dark:hover:text-blue-300"
                >
                  About Us
                </Link>
                <Link
                  href="/privacy-policy"
                  onClick={() => setOpen(false)}
                  className="font-semibold hover:text-[#1956b4] dark:hover:text-blue-300"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  onClick={() => setOpen(false)}
                  className="font-semibold hover:text-[#1956b4] dark:hover:text-blue-300"
                >
                  Terms &amp; Disclaimer
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="font-semibold hover:text-[#1956b4] dark:hover:text-blue-300"
                >
                  Contact Support
                </Link>
              </div>
              <Link
                href="/blog"
                onClick={() => setOpen(false)}
                className="font-bold text-[#fc6203] hover:underline"
              >
                Explore 2026–27 Travel Guides →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavLinksDesktop({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
      {PRIMARY_NAV_TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.matchPrefix);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`relative inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition xl:px-3 xl:text-sm ${
              isActive
                ? "bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                : "text-ink-soft hover:bg-subcard hover:text-ink"
            }`}
          >
            <span
              className={
                isActive
                  ? "text-[#1956b4] dark:text-blue-300"
                  : "text-ink-muted"
              }
            >
              {tab.icon}
            </span>
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold leading-none text-emerald-700 dark:text-emerald-300">
                {tab.badge}
              </span>
            )}
            {isActive && (
              <span className="absolute right-2.5 bottom-0 left-2.5 h-0.5 rounded-full bg-[#fc6203]" />
            )}
          </Link>
        );
      })}

      {/* Category-Wise Tools Mega Dropdown */}
      <ToolsMegaDropdown pathname={pathname} />

      {SECONDARY_NAV_TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.matchPrefix);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`relative inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition xl:px-3 xl:text-sm ${
              isActive
                ? "bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                : "text-ink-soft hover:bg-subcard hover:text-ink"
            }`}
          >
            <span
              className={
                isActive
                  ? "text-[#1956b4] dark:text-blue-300"
                  : "text-ink-muted"
              }
            >
              {tab.icon}
            </span>
            <span>{tab.label}</span>
            {isActive && (
              <span className="absolute right-2.5 bottom-0 left-2.5 h-0.5 rounded-full bg-[#fc6203]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function ActiveDesktopNav() {
  const pathname = usePathname() ?? "";
  return <NavLinksDesktop pathname={pathname} />;
}

const MOBILE_STRIP_TABS: NavTab[] = [
  ...PRIMARY_NAV_TABS,
  {
    label: "All Tools",
    shortLabel: "Tools",
    href: "/tools",
    matchPrefix: "/tools",
    icon: <CompassIcon className="h-4 w-4" />,
  },
  ...SECONDARY_NAV_TABS,
];

function MobileQuickTabStrip({ pathname }: { pathname: string }) {
  return (
    <div className="ta-no-scrollbar flex items-center gap-1 overflow-x-auto border-t border-line bg-card px-3 py-1.5 lg:hidden">
      {MOBILE_STRIP_TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.matchPrefix);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              isActive
                ? "bg-[#1956b4] text-white shadow-2xs"
                : "bg-subcard text-ink-soft hover:text-ink"
            }`}
          >
            {tab.icon}
            <span>{tab.shortLabel}</span>
          </Link>
        );
      })}
    </div>
  );
}

function ActiveMobileStrip() {
  const pathname = usePathname() ?? "";
  return <MobileQuickTabStrip pathname={pathname} />;
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="ta-navbar sticky top-0 z-50">
      <div className="mx-auto flex h-15 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 xl:gap-6">
          <Logo size="md" priority />
          <Suspense fallback={<NavLinksDesktop pathname="" />}>
            <ActiveDesktopNav />
          </Suspense>
        </div>

        {/* Right Utility Controls */}
        <div className="hidden items-center gap-2.5 lg:flex">
          <ThemeToggle />
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-subcard px-3 py-2 text-xs font-bold text-ink transition hover:border-[#1956b4]"
          >
            <CompassIcon className="h-3.5 w-3.5 text-[#1956b4] dark:text-blue-300" />
            <span>All Tools</span>
          </Link>
          <Link
            href="/air/flight-status"
            className="ta-btn-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold xl:text-sm"
          >
            <PlaneIcon className="h-4 w-4" />
            <span>Track Flight</span>
          </Link>
        </div>

        {/* Mobile / Tablet Header Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-subcard text-ink"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* 1-Tap Horizontal Category Bar on Mobile & Tablet */}
      <Suspense fallback={<MobileQuickTabStrip pathname="" />}>
        <ActiveMobileStrip />
      </Suspense>

      {/* Clean Mobile Menu Drawer with Category-Wise Tools */}
      {mobileOpen && (
        <div className="max-h-[82vh] overflow-y-auto border-t border-line bg-card px-4 py-4 shadow-xl lg:hidden">
          <div className="space-y-5">
            {TOOL_CATEGORIES.map((category) => (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${category.accentBadgeClass}`}
                  >
                    {category.categoryTitle}
                  </span>
                  <Link
                    href={category.hubHref}
                    onClick={() => setMobileOpen(false)}
                    className="text-[11px] font-bold text-[#1956b4] dark:text-blue-300"
                  >
                    Open Hub →
                  </Link>
                </div>

                <div className="grid gap-1.5 sm:grid-cols-2">
                  {category.items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between rounded-xl border border-line bg-subcard/60 px-3 py-2.5 text-xs font-semibold text-ink hover:border-[#1956b4]"
                    >
                      <span className="inline-flex items-center gap-2.5">
                        <span
                          className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${category.accentBadgeClass}`}
                        >
                          {renderToolItemIcon(item.iconKey)}
                        </span>
                        <span>{item.title}</span>
                      </span>
                      {item.badge && (
                        <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Guides & Legal Links in Mobile Menu */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-xs font-semibold text-ink-soft">
              <Link
                href="/blog"
                onClick={() => setMobileOpen(false)}
                className="hover:text-[#1956b4]"
              >
                Travel Guides
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className="hover:text-[#1956b4]"
              >
                About Us
              </Link>
              <Link
                href="/privacy-policy"
                onClick={() => setMobileOpen(false)}
                className="hover:text-[#1956b4]"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                onClick={() => setMobileOpen(false)}
                className="hover:text-[#1956b4]"
              >
                Terms &amp; Disclaimer
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="hover:text-[#1956b4]"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
