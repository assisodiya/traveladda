"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { TOOL_CATEGORIES, type ToolMenuItem } from "@/lib/tools-catalog";
import {
  BookOpenIcon,
  CalculatorIcon,
  ChevronDownIcon,
  ClockIcon,
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

type MenuCategoryId = "air" | "rail" | "hotel";

function renderToolItemIcon(iconKey: ToolMenuItem["iconKey"]) {
  switch (iconKey) {
    case "plane":
      return <PlaneIcon className="h-4 w-4" />;
    case "luggage":
      return <LuggageIcon className="h-4 w-4" />;
    case "train":
      return <TrainIcon className="h-4 w-4" />;
    case "ticket":
      return <TicketIcon className="h-4 w-4" />;
    case "calculator":
      return <CalculatorIcon className="h-4 w-4" />;
    case "clock":
      return <ClockIcon className="h-4 w-4" />;
  }
}

function PathnameSync({
  onPathname,
}: {
  onPathname: React.Dispatch<React.SetStateAction<string>>;
}) {
  const pathname = usePathname() ?? "";
  useEffect(() => {
    onPathname(pathname);
  }, [pathname, onPathname]);
  return null;
}

const TOP_MENU_TABS: {
  id: MenuCategoryId;
  label: string;
  icon: (props: { className?: string }) => React.ReactNode;
  isActivePath: (pathname: string) => boolean;
}[] = [
  {
    id: "air",
    label: "Flights",
    icon: (props) => <PlaneIcon {...props} />,
    isActivePath: (p) =>
      p.startsWith("/air/") ||
      p.startsWith("/flight-status") ||
      p === "/tools/air",
  },
  {
    id: "rail",
    label: "Trains",
    icon: (props) => <TrainIcon {...props} />,
    isActivePath: (p) =>
      p.startsWith("/rail/") ||
      p.startsWith("/chart-times") ||
      p.startsWith("/delhi-metro"),
  },
  {
    id: "hotel",
    label: "Hotels",
    icon: (props) => <HotelIcon {...props} />,
    isActivePath: (p) =>
      p.startsWith("/tools/hotel") || p.startsWith("/toll-calculator"),
  },
];

export function Navbar() {
  const [pathname, setPathname] = useState("");
  const [openMenuId, setOpenMenuId] = useState<MenuCategoryId | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] =
    useState<MenuCategoryId>("air");
  const headerRef = useRef<HTMLElement>(null);

  const closeAllMenus = () => {
    setOpenMenuId(null);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (headerRef.current && !headerRef.current.contains(target)) {
        setOpenMenuId(null);
        setMobileMenuOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeAllMenus();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick, {
      passive: true,
    });
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleDesktopMenu = (id: MenuCategoryId) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  return (
    <header ref={headerRef} className="ta-navbar sticky top-0 z-50">
      <Suspense fallback={null}>
        <PathnameSync onPathname={setPathname} />
      </Suspense>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-3 sm:px-6 lg:px-8">
        {/* Left: Brand Logo + Primary ixigo / MMT / Goibibo Style Category Tabs */}
        <div className="flex items-center gap-4 sm:gap-8">
          <div onClick={closeAllMenus} className="shrink-0">
            <Logo size="lg" priority />
          </div>

          {/* Desktop 3-Tab Menu Bar: Flights | Trains | Hotels */}
          <nav
            aria-label="Primary Categories"
            className="hidden items-center gap-1 md:flex"
          >
            {TOP_MENU_TABS.map((tab) => {
              const category = TOOL_CATEGORIES.find((c) => c.id === tab.id);
              const isOpen = openMenuId === tab.id;
              const isRouteActive = tab.isActivePath(pathname);

              return (
                <div key={tab.id} className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDesktopMenu(tab.id)}
                    aria-expanded={isOpen}
                    className={`cursor-pointer relative inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-bold transition select-none ${
                      isOpen || isRouteActive
                        ? "bg-blue-50/90 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                        : "text-ink-soft hover:bg-subcard hover:text-ink"
                    }`}
                  >
                    {tab.icon({
                      className: `h-4 w-4 ${
                        isOpen || isRouteActive
                          ? "text-[#1956b4] dark:text-blue-300"
                          : "text-ink-muted"
                      }`,
                    })}
                    <span>{tab.label}</span>
                    <ChevronDownIcon
                      className={`h-3.5 w-3.5 text-ink-muted transition-transform duration-150 ${
                        isOpen ? "rotate-180 text-[#1956b4] dark:text-blue-300" : ""
                      }`}
                    />
                    {(isOpen || isRouteActive) && (
                      <span className="absolute right-3 bottom-0 left-3 h-0.5 rounded-full bg-[#fc6203]" />
                    )}
                  </button>

                  {/* Standard Clean Anchored Dropdown (ixigo / MakeMyTrip / Goibibo Style) */}
                  {isOpen && category && (
                    <div className="absolute top-full left-0 z-50 mt-2 w-80 rounded-xl border border-line bg-card p-1.5 shadow-xl ring-1 ring-black/5">
                      <div className="border-b border-line px-3 py-2">
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-muted">
                          {category.categoryTitle}
                        </p>
                      </div>

                      <div className="divide-y divide-line/50 py-1">
                        {category.items.map((item) => {
                          const isItemActive = pathname === item.href;
                          return (
                            <Link
                              key={item.id}
                              href={item.href}
                              onClick={closeAllMenus}
                              className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition ${
                                isItemActive
                                  ? "bg-blue-50/70 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                                  : "hover:bg-subcard"
                              }`}
                            >
                              <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-subcard text-[#1956b4] dark:text-blue-300">
                                {renderToolItemIcon(item.iconKey)}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="truncate text-xs font-bold text-ink sm:text-sm">
                                    {item.title}
                                  </span>
                                  {item.badge && (
                                    <span className="shrink-0 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-emerald-700 dark:text-emerald-300">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="mt-0.5 line-clamp-1 text-[11px] text-ink-muted">
                                  {item.description}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Right: Travel Guides + Theme Toggle (Desktop) */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/blog"
            onClick={closeAllMenus}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition sm:text-sm ${
              pathname.startsWith("/blog")
                ? "bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                : "text-ink-soft hover:bg-subcard hover:text-ink"
            }`}
          >
            <BookOpenIcon className="h-4 w-4 text-ink-muted" />
            <span>Guides</span>
          </Link>

          <div className="border-l border-line pl-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="cursor-pointer inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-subcard text-ink"
          >
            {mobileMenuOpen ? (
              <CloseIcon className="h-4 w-4" />
            ) : (
              <MenuIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown: 3 Standard Category Tabs (Flights | Trains | Hotels) + List */}
      {mobileMenuOpen && (
        <div className="border-t border-line bg-card px-4 py-3 shadow-xl md:hidden">
          {/* 3 Category Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-subcard p-1">
            {TOP_MENU_TABS.map((tab) => {
              const active = mobileActiveTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMobileActiveTab(tab.id)}
                  className={`cursor-pointer flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-extrabold transition ${
                    active
                      ? "bg-[#1956b4] text-white shadow-2xs"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {tab.icon({ className: "h-3.5 w-3.5" })}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Category Related Menu Items */}
          <div className="mt-2 divide-y divide-line">
            {TOOL_CATEGORIES.find((c) => c.id === mobileActiveTab)?.items.map(
              (item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={closeAllMenus}
                  className="flex items-center gap-3 py-2.5"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-subcard text-[#1956b4] dark:text-blue-300">
                    {renderToolItemIcon(item.iconKey)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-bold text-ink">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-700 dark:text-emerald-300">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-[11px] text-ink-muted">
                      {item.description}
                    </p>
                  </div>
                </Link>
              )
            )}
          </div>

          {/* Secondary Quick Links */}
          <div className="mt-2 flex items-center justify-between border-t border-line pt-2.5 text-xs font-bold text-ink-soft">
            <Link href="/blog" onClick={closeAllMenus} className="hover:text-ink">
              Travel Guides
            </Link>
            <Link href="/tools" onClick={closeAllMenus} className="hover:text-ink">
              All Tools
            </Link>
            <Link href="/about" onClick={closeAllMenus} className="hover:text-ink">
              About
            </Link>
            <Link href="/contact" onClick={closeAllMenus} className="hover:text-ink">
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
