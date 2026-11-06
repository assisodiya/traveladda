"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import {
  BookOpenIcon,
  CloseIcon,
  HotelIcon,
  LuggageIcon,
  MenuIcon,
  PlaneIcon,
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
  {
    label: "Air Baggage",
    shortLabel: "Baggage",
    href: "/tools/air",
    matchPrefix: "/tools/air",
    icon: <LuggageIcon className="h-4 w-4" />,
  },
  {
    label: "Hotels & GST",
    shortLabel: "Hotels",
    href: "/tools/hotel",
    matchPrefix: "/tools/hotel",
    icon: <HotelIcon className="h-4 w-4" />,
  },
  {
    label: "Guides",
    shortLabel: "Guides",
    href: "/blog",
    matchPrefix: "/blog",
    icon: <BookOpenIcon className="h-4 w-4" />,
  },
];

function NavLinksDesktop({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
      {PRIMARY_NAV_TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.matchPrefix);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
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
    </nav>
  );
}

function ActiveDesktopNav() {
  const pathname = usePathname() ?? "";
  return <NavLinksDesktop pathname={pathname} />;
}

function MobileQuickTabStrip({ pathname }: { pathname: string }) {
  return (
    <div className="ta-no-scrollbar flex items-center gap-1 overflow-x-auto border-t border-line bg-card px-3 py-1.5 md:hidden">
      {PRIMARY_NAV_TABS.map((tab) => {
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
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Logo size="sm" />
          <Suspense fallback={<NavLinksDesktop pathname="" />}>
            <ActiveDesktopNav />
          </Suspense>
        </div>

        {/* Right Utility Controls */}
        <div className="hidden items-center gap-2.5 md:flex">
          <ThemeToggle />
          <Link
            href="/air/flight-status"
            className="ta-btn-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold lg:text-sm"
          >
            <PlaneIcon className="h-4 w-4" />
            <span>Track Flight</span>
          </Link>
        </div>

        {/* Mobile Header Controls */}
        <div className="flex items-center gap-2 md:hidden">
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

      {/* 1-Tap Horizontal Category Bar on Mobile (ixigo / ConfirmTkt style) */}
      <Suspense fallback={<MobileQuickTabStrip pathname="" />}>
        <ActiveMobileStrip />
      </Suspense>

      {/* Clean Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="border-t border-line bg-card px-4 py-4 shadow-lg md:hidden">
          <div className="grid gap-1.5">
            {PRIMARY_NAV_TABS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink hover:bg-subcard"
              >
                <span className="inline-flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300">
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </span>
                {tab.badge && (
                  <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    {tab.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
