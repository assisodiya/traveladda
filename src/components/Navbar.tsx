"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { TOOL_CATEGORIES, type ToolMenuItem } from "@/lib/tools-catalog";
import {
  ArrowRightIcon,
  BookOpenIcon,
  BuildingStationIcon,
  CalculatorIcon,
  ChevronDownIcon,
  ClockIcon,
  CloseIcon,
  CompassIcon,
  LuggageIcon,
  MenuIcon,
  PhoneCallIcon,
  PlaneIcon,
  ShieldCheckIcon,
  TicketIcon,
  TrainIcon,
} from "./Icons";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

function renderToolItemIcon(iconKey: ToolMenuItem["iconKey"]) {
  switch (iconKey) {
    case "plane":
      return <PlaneIcon className="h-4.5 w-4.5" />;
    case "luggage":
      return <LuggageIcon className="h-4.5 w-4.5" />;
    case "train":
      return <TrainIcon className="h-4.5 w-4.5" />;
    case "ticket":
      return <TicketIcon className="h-4.5 w-4.5" />;
    case "calculator":
      return <CalculatorIcon className="h-4.5 w-4.5" />;
    case "clock":
      return <ClockIcon className="h-4.5 w-4.5" />;
  }
}

function getCategoryBorderClass(categoryId: string) {
  switch (categoryId) {
    case "air":
      return "border-t-4 border-t-[#1956b4]";
    case "rail":
      return "border-t-4 border-t-emerald-600";
    default:
      return "border-t-4 border-t-amber-500";
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

export function Navbar() {
  const [pathname, setPathname] = useState("");
  const headerRef = useRef<HTMLElement>(null);
  const desktopToolsRef = useRef<HTMLDetailsElement>(null);
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);

  const isToolsRoute =
    pathname.startsWith("/tools") ||
    pathname.startsWith("/air/") ||
    pathname.startsWith("/rail/") ||
    pathname.startsWith("/chart-times") ||
    pathname.startsWith("/delhi-metro");

  const closeAllMenus = () => {
    if (desktopToolsRef.current) {
      desktopToolsRef.current.open = false;
    }
    if (mobileMenuRef.current) {
      mobileMenuRef.current.open = false;
    }
  };

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (
        desktopToolsRef.current?.open &&
        !desktopToolsRef.current.contains(target)
      ) {
        desktopToolsRef.current.open = false;
      }
      if (
        mobileMenuRef.current?.open &&
        !mobileMenuRef.current.contains(target)
      ) {
        mobileMenuRef.current.open = false;
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

  return (
    <header ref={headerRef} className="ta-navbar sticky top-0 z-50">
      <Suspense fallback={null}>
        <PathnameSync onPathname={setPathname} />
      </Suspense>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-3 sm:h-20 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <div onClick={closeAllMenus} className="shrink-0">
          <Logo size="lg" priority />
        </div>

        {/* Right: Desktop Navigation Menu + Tools Dropdown + Theme Toggle */}
        <div className="ml-auto hidden items-center gap-1 lg:flex xl:gap-1.5">
          <nav aria-label="Primary" className="flex items-center gap-1">
            {/* 1. Home */}
            <Link
              href="/"
              onClick={closeAllMenus}
              className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition xl:px-3.5 xl:text-sm ${
                pathname === "/"
                  ? "bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                  : "text-ink-soft hover:bg-subcard hover:text-ink"
              }`}
            >
              <BuildingStationIcon
                className={`h-4 w-4 ${
                  pathname === "/"
                    ? "text-[#1956b4] dark:text-blue-300"
                    : "text-ink-muted"
                }`}
              />
              <span>Home</span>
              {pathname === "/" && (
                <span className="absolute right-3 bottom-0 left-3 h-0.5 rounded-full bg-[#fc6203]" />
              )}
            </Link>

            {/* 2. Tools Category-Wise Mega Dropdown */}
            <details ref={desktopToolsRef} className="group">
              <summary
                className={`relative inline-flex cursor-pointer list-none items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition select-none [&::-webkit-details-marker]:hidden xl:px-3.5 xl:text-sm ${
                  isToolsRoute
                    ? "bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                    : "text-ink-soft group-open:bg-blue-50 group-open:text-[#1956b4] hover:bg-subcard hover:text-ink dark:group-open:bg-blue-500/15 dark:group-open:text-blue-300"
                }`}
              >
                <CompassIcon className="h-4 w-4 text-[#1956b4] dark:text-blue-300" />
                <span>Tools</span>
                <ChevronDownIcon className="h-3.5 w-3.5 transition-transform duration-150 group-open:rotate-180" />
                {isToolsRoute && (
                  <span className="absolute right-3 bottom-0 left-3 h-0.5 rounded-full bg-[#fc6203]" />
                )}
              </summary>

              {/* Full-Width Responsive Mega Dropdown Panel (1 col -> 2 cols -> 3 cols, never truncates text) */}
              <div className="fixed inset-x-4 top-[4.25rem] z-50 mx-auto max-h-[calc(100dvh-5.25rem)] max-w-6xl overflow-y-auto rounded-2xl border border-line bg-card shadow-2xl ring-1 ring-black/10 sm:inset-x-6 sm:top-[5.25rem] lg:inset-x-8">
                {/* Dropdown Top Header Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border-b border-line bg-subcard/90 px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#1956b4] text-white shadow-xs">
                      <CompassIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-ink">
                        All Active Travel Utilities — Air, Rail, Metro &amp;
                        Hotel
                      </p>
                      <p className="text-xs text-ink-muted">
                        Instant live tracking, PNR verification, chart
                        preparation schedule, Delhi NCR Metro &amp; GST
                        calculators
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/tools"
                    onClick={closeAllMenus}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#1956b4] px-3.5 py-2 text-xs font-extrabold text-white shadow-xs transition hover:bg-[#144696]"
                  >
                    <span>Explore All Tools</span>
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Responsive Category Grid: 1 col on small, 2 cols on medium/laptop, 3 cols on XL */}
                <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                  {TOOL_CATEGORIES.map((category) => (
                    <div
                      key={category.id}
                      className={`flex flex-col rounded-2xl border border-line bg-subcard/40 p-4 shadow-2xs ${getCategoryBorderClass(category.id)}`}
                    >
                      <div className="mb-3 flex items-start justify-between gap-2 border-b border-line pb-2.5">
                        <div>
                          <span
                            className={`inline-block rounded-md px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider ${category.accentBadgeClass}`}
                          >
                            {category.categoryTitle}
                          </span>
                          <p className="mt-1 text-xs font-medium text-ink-muted">
                            {category.categorySubtitle}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full border border-line bg-card px-2 py-0.5 text-[10px] font-bold text-ink-muted">
                          {category.items.length}{" "}
                          {category.items.length === 1 ? "Tool" : "Tools"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {category.items.map((item) => (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={closeAllMenus}
                            className="group/item flex items-start gap-3 rounded-xl border border-line/80 bg-card p-3 shadow-2xs transition hover:border-[#1956b4] hover:shadow-sm"
                          >
                            <span
                              className={`mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${category.accentBadgeClass}`}
                            >
                              {renderToolItemIcon(item.iconKey)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-1.5">
                                <p className="text-xs font-extrabold leading-snug text-ink group-hover/item:text-[#1956b4] sm:text-sm dark:group-hover/item:text-blue-300">
                                  {item.title}
                                </p>
                                {item.badge && (
                                  <span className="shrink-0 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                                {item.description}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dropdown Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-line bg-subcard/70 px-5 py-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4 text-ink-muted">
                    <Link
                      href="/about"
                      onClick={closeAllMenus}
                      className="font-semibold hover:text-[#1956b4] dark:hover:text-blue-300"
                    >
                      About Us
                    </Link>
                    <Link
                      href="/privacy-policy"
                      onClick={closeAllMenus}
                      className="font-semibold hover:text-[#1956b4] dark:hover:text-blue-300"
                    >
                      Privacy Policy
                    </Link>
                    <Link
                      href="/terms"
                      onClick={closeAllMenus}
                      className="font-semibold hover:text-[#1956b4] dark:hover:text-blue-300"
                    >
                      Terms &amp; Disclaimer
                    </Link>
                    <Link
                      href="/contact"
                      onClick={closeAllMenus}
                      className="font-semibold hover:text-[#1956b4] dark:hover:text-blue-300"
                    >
                      Contact Support
                    </Link>
                  </div>
                  <Link
                    href="/blog"
                    onClick={closeAllMenus}
                    className="font-extrabold text-[#fc6203] hover:underline"
                  >
                    Read 2026–27 Travel Guides →
                  </Link>
                </div>
              </div>
            </details>

            {/* 3. Travel Guides */}
            <Link
              href="/blog"
              onClick={closeAllMenus}
              className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition xl:px-3.5 xl:text-sm ${
                pathname.startsWith("/blog")
                  ? "bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                  : "text-ink-soft hover:bg-subcard hover:text-ink"
              }`}
            >
              <BookOpenIcon
                className={`h-4 w-4 ${
                  pathname.startsWith("/blog")
                    ? "text-[#1956b4] dark:text-blue-300"
                    : "text-ink-muted"
                }`}
              />
              <span>Travel Guides</span>
              {pathname.startsWith("/blog") && (
                <span className="absolute right-3 bottom-0 left-3 h-0.5 rounded-full bg-[#fc6203]" />
              )}
            </Link>

            {/* 4. About Us */}
            <Link
              href="/about"
              onClick={closeAllMenus}
              className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition xl:px-3.5 xl:text-sm ${
                pathname.startsWith("/about")
                  ? "bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                  : "text-ink-soft hover:bg-subcard hover:text-ink"
              }`}
            >
              <ShieldCheckIcon
                className={`h-4 w-4 ${
                  pathname.startsWith("/about")
                    ? "text-[#1956b4] dark:text-blue-300"
                    : "text-ink-muted"
                }`}
              />
              <span>About Us</span>
              {pathname.startsWith("/about") && (
                <span className="absolute right-3 bottom-0 left-3 h-0.5 rounded-full bg-[#fc6203]" />
              )}
            </Link>

            {/* 5. Contact */}
            <Link
              href="/contact"
              onClick={closeAllMenus}
              className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition xl:px-3.5 xl:text-sm ${
                pathname.startsWith("/contact")
                  ? "bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                  : "text-ink-soft hover:bg-subcard hover:text-ink"
              }`}
            >
              <PhoneCallIcon
                className={`h-4 w-4 ${
                  pathname.startsWith("/contact")
                    ? "text-[#1956b4] dark:text-blue-300"
                    : "text-ink-muted"
                }`}
              />
              <span>Contact</span>
              {pathname.startsWith("/contact") && (
                <span className="absolute right-3 bottom-0 left-3 h-0.5 rounded-full bg-[#fc6203]" />
              )}
            </Link>
          </nav>

          <div className="ml-2 flex items-center gap-2 border-l border-line pl-3">
            <ThemeToggle />
          </div>
        </div>

        {/* Right: Mobile & Tablet Controls (Native <details> Menu + Theme Toggle) */}
        <div className="ml-auto flex shrink-0 items-center gap-2 lg:hidden">
          <ThemeToggle />

          <details ref={mobileMenuRef} className="group">
            <summary
              aria-label="Open tools and navigation menu"
              className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-line bg-subcard px-3 py-2 text-xs font-bold text-ink select-none [&::-webkit-details-marker]:hidden group-open:border-[#1956b4] group-open:bg-[#1956b4] group-open:text-white"
            >
              <CompassIcon className="h-4 w-4 text-[#1956b4] group-open:text-white dark:text-blue-300" />
              <span>Tools &amp; Menu</span>
              <MenuIcon className="h-4 w-4 group-open:hidden" />
              <CloseIcon className="hidden h-4 w-4 group-open:block" />
            </summary>

            {/* Mobile & Tablet Full-Width Dropdown Panel (1 col on phone, 2 cols on tablet, full text visible) */}
            <div className="fixed inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-card px-4 py-4 shadow-2xl sm:top-20 sm:max-h-[calc(100dvh-5rem)]">
              <div className="mx-auto max-w-3xl space-y-4">
                {/* Main Mobile Pages */}
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/"
                    onClick={closeAllMenus}
                    className="flex items-center gap-2 rounded-xl border border-line bg-subcard/70 px-3.5 py-2.5 text-xs font-bold text-ink hover:border-[#1956b4]"
                  >
                    <BuildingStationIcon className="h-4 w-4 text-[#1956b4] dark:text-blue-300" />
                    <span>Home</span>
                  </Link>
                  <Link
                    href="/blog"
                    onClick={closeAllMenus}
                    className="flex items-center gap-2 rounded-xl border border-line bg-subcard/70 px-3.5 py-2.5 text-xs font-bold text-ink hover:border-[#1956b4]"
                  >
                    <BookOpenIcon className="h-4 w-4 text-[#fc6203]" />
                    <span>Travel Guides</span>
                  </Link>
                </div>

                {/* All Tools Category-Wise */}
                <div className="rounded-2xl border border-line bg-subcard/40 p-3.5 sm:p-4">
                  <div className="mb-3 flex items-center justify-between border-b border-line pb-2.5">
                    <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                      <CompassIcon className="h-4 w-4" />
                      <span>All Travel Tools</span>
                    </span>
                    <Link
                      href="/tools"
                      onClick={closeAllMenus}
                      className="text-xs font-bold text-[#1956b4] dark:text-blue-300"
                    >
                      View All →
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {TOOL_CATEGORIES.map((category) => (
                      <div key={category.id} className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${category.accentBadgeClass}`}
                          >
                            {category.categoryTitle}
                          </span>
                          <span className="text-[11px] text-ink-muted">
                            {category.categorySubtitle}
                          </span>
                        </div>

                        {/* 1 card per row on phones, 2 cards per row on tablets */}
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {category.items.map((item) => (
                            <Link
                              key={item.id}
                              href={item.href}
                              onClick={closeAllMenus}
                              className="flex items-start gap-2.5 rounded-xl border border-line bg-card p-3 text-left shadow-2xs transition hover:border-[#1956b4]"
                            >
                              <span
                                className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${category.accentBadgeClass}`}
                              >
                                {renderToolItemIcon(item.iconKey)}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-1">
                                  <span className="text-xs font-extrabold leading-snug text-ink">
                                    {item.title}
                                  </span>
                                  {item.badge ? (
                                    <span className="shrink-0 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-700 dark:text-emerald-300">
                                      {item.badge}
                                    </span>
                                  ) : (
                                    <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                                  )}
                                </div>
                                <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">
                                  {item.description}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Company & Legal Links */}
                <div className="grid grid-cols-2 gap-2 border-t border-line pt-3 text-xs font-semibold sm:grid-cols-4">
                  <Link
                    href="/about"
                    onClick={closeAllMenus}
                    className="rounded-lg bg-subcard px-3 py-2 text-center text-ink-soft hover:text-ink"
                  >
                    About Us
                  </Link>
                  <Link
                    href="/contact"
                    onClick={closeAllMenus}
                    className="rounded-lg bg-subcard px-3 py-2 text-center text-ink-soft hover:text-ink"
                  >
                    Contact Us
                  </Link>
                  <Link
                    href="/privacy-policy"
                    onClick={closeAllMenus}
                    className="rounded-lg bg-subcard px-3 py-2 text-center text-ink-soft hover:text-ink"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms"
                    onClick={closeAllMenus}
                    className="rounded-lg bg-subcard px-3 py-2 text-center text-ink-soft hover:text-ink"
                  >
                    Terms &amp; Disclaimer
                  </Link>
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
