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
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileToolsExpanded, setMobileToolsExpanded] = useState(true);

  const headerRef = useRef<HTMLElement>(null);

  const isToolsRoute =
    pathname.startsWith("/tools") ||
    pathname.startsWith("/air/") ||
    pathname.startsWith("/rail/");

  // Close menus when clicking outside the header or pressing Escape
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        headerRef.current &&
        !headerRef.current.contains(e.target as Node)
      ) {
        setToolsOpen(false);
        setMobileOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setToolsOpen(false);
        setMobileOpen(false);
      }
    }

    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const closeAllMenus = () => {
    setToolsOpen(false);
    setMobileOpen(false);
  };

  return (
    <header ref={headerRef} className="ta-navbar sticky top-0 z-50">
      <Suspense fallback={null}>
        <PathnameSync onPathname={setPathname} />
      </Suspense>

      <div className="mx-auto flex h-15 max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4 xl:gap-7">
          <div onClick={closeAllMenus}>
            <Logo size="sm" priority />
          </div>

          {/* Desktop Main Menu Bar */}
          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 lg:flex"
          >
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

            {/* 2. Tools Dropdown Button */}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setToolsOpen((prev) => !prev);
              }}
              aria-expanded={toolsOpen}
              aria-haspopup="true"
              className={`relative inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition select-none xl:px-3.5 xl:text-sm ${
                toolsOpen || isToolsRoute
                  ? "bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                  : "text-ink-soft hover:bg-subcard hover:text-ink"
              }`}
            >
              <CompassIcon
                className={`h-4 w-4 ${
                  toolsOpen || isToolsRoute
                    ? "text-[#1956b4] dark:text-blue-300"
                    : "text-ink-muted"
                }`}
              />
              <span>Tools</span>
              <ChevronDownIcon
                className={`h-3.5 w-3.5 transition-transform duration-150 ${
                  toolsOpen ? "rotate-180 text-[#1956b4] dark:text-blue-300" : ""
                }`}
              />
              {(toolsOpen || isToolsRoute) && (
                <span className="absolute right-3 bottom-0 left-3 h-0.5 rounded-full bg-[#fc6203]" />
              )}
            </button>

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
        </div>

        {/* Right Desktop Controls */}
        <div className="hidden items-center gap-2.5 lg:flex">
          <ThemeToggle />
          <Link
            href="/blog"
            onClick={closeAllMenus}
            className="ta-btn-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold xl:text-sm"
          >
            <BookOpenIcon className="h-4 w-4" />
            <span>Explore Guides</span>
          </Link>
        </div>

        {/* Mobile / Tablet Controls */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => {
              setMobileToolsExpanded(true);
              setMobileOpen((prev) => !prev);
            }}
            aria-expanded={mobileOpen}
            className={`inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition select-none ${
              mobileOpen
                ? "border-[#1956b4] bg-[#1956b4] text-white"
                : "border-line bg-subcard text-[#1956b4] dark:text-blue-300"
            }`}
          >
            <CompassIcon className="h-3.5 w-3.5" />
            <span>Tools</span>
            <ChevronDownIcon
              className={`h-3.5 w-3.5 transition-transform duration-150 ${
                mobileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <ThemeToggle />

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-line bg-subcard text-ink"
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

      {/* DESKTOP CATEGORY-WISE TOOLS MEGA DROPDOWN PANEL */}
      {toolsOpen && (
        <div className="hidden border-t border-line bg-card shadow-2xl lg:block">
          <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#1956b4] text-white">
                  <CompassIcon className="h-3.5 w-3.5" />
                </span>
                <p className="text-sm font-extrabold text-ink">
                  All Travel Tools by Category (Air, Rail &amp; Hotel)
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/tools"
                  onClick={closeAllMenus}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-400"
                >
                  <span>Open Full Tools Directory</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setToolsOpen(false)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-line bg-subcard px-2 py-1 text-xs font-semibold text-ink-muted hover:text-ink"
                >
                  <CloseIcon className="h-3.5 w-3.5" />
                  <span>Close</span>
                </button>
              </div>
            </div>

            {/* 3 Category Columns */}
            <div className="mt-4 grid gap-6 lg:grid-cols-3">
              {TOOL_CATEGORIES.map((category) => (
                <div
                  key={category.id}
                  className="rounded-2xl border border-line bg-subcard/40 p-4"
                >
                  <div className="mb-3 flex items-center justify-between border-b border-line pb-2.5">
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
                    <Link
                      href={category.hubHref}
                      onClick={closeAllMenus}
                      className="text-[11px] font-bold text-[#1956b4] hover:underline dark:text-blue-400"
                    >
                      Hub →
                    </Link>
                  </div>

                  <div className="space-y-1.5">
                    {category.items.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={closeAllMenus}
                        className="group flex items-start gap-2.5 rounded-xl border border-transparent bg-card p-2.5 shadow-2xs transition hover:border-[#1956b4]"
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
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 text-xs">
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
                className="font-bold text-[#fc6203] hover:underline"
              >
                Read 2026–27 Travel Guides →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE / TABLET MENU DRAWER */}
      {mobileOpen && (
        <div className="max-h-[calc(100dvh-3.75rem)] overflow-y-auto border-t border-line bg-card px-4 py-4 shadow-2xl sm:max-h-[calc(100dvh-4rem)] lg:hidden">
          <div className="mx-auto max-w-lg space-y-3">
            {/* Primary Mobile Navigation Links */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/"
                onClick={closeAllMenus}
                className="flex items-center gap-2 rounded-xl border border-line bg-subcard/70 px-3 py-2.5 text-xs font-bold text-ink hover:border-[#1956b4]"
              >
                <BuildingStationIcon className="h-4 w-4 text-[#1956b4] dark:text-blue-300" />
                <span>Home</span>
              </Link>
              <Link
                href="/blog"
                onClick={closeAllMenus}
                className="flex items-center gap-2 rounded-xl border border-line bg-subcard/70 px-3 py-2.5 text-xs font-bold text-ink hover:border-[#1956b4]"
              >
                <BookOpenIcon className="h-4 w-4 text-[#fc6203]" />
                <span>Travel Guides</span>
              </Link>
            </div>

            {/* Category-Wise Tools Accordion inside Mobile Menu */}
            <div className="overflow-hidden rounded-2xl border border-line bg-subcard/40">
              <button
                type="button"
                onClick={() => setMobileToolsExpanded((prev) => !prev)}
                aria-expanded={mobileToolsExpanded}
                className="flex w-full cursor-pointer items-center justify-between border-b border-line bg-subcard px-3.5 py-3 text-left"
              >
                <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                  <CompassIcon className="h-4 w-4" />
                  <span>All Travel Tools (Category-Wise)</span>
                </span>
                <ChevronDownIcon
                  className={`h-4 w-4 text-ink-muted transition-transform ${
                    mobileToolsExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mobileToolsExpanded && (
                <div className="space-y-4 p-3">
                  {TOOL_CATEGORIES.map((category) => (
                    <div key={category.id} className="space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${category.accentBadgeClass}`}
                        >
                          {category.categoryTitle}
                        </span>
                        <Link
                          href={category.hubHref}
                          onClick={closeAllMenus}
                          className="text-[11px] font-bold text-[#1956b4] dark:text-blue-300"
                        >
                          Open Hub →
                        </Link>
                      </div>

                      <div className="grid gap-1.5">
                        {category.items.map((item) => (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={closeAllMenus}
                            className="flex items-center justify-between rounded-xl border border-line bg-card px-3 py-2.5 text-xs font-semibold text-ink shadow-2xs transition hover:border-[#1956b4]"
                          >
                            <span className="flex min-w-0 items-center gap-2.5">
                              <span
                                className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${category.accentBadgeClass}`}
                              >
                                {renderToolItemIcon(item.iconKey)}
                              </span>
                              <span className="truncate">{item.title}</span>
                            </span>
                            {item.badge ? (
                              <span className="ml-2 shrink-0 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                                {item.badge}
                              </span>
                            ) : (
                              <ArrowRightIcon className="ml-2 h-3.5 w-3.5 shrink-0 text-ink-muted" />
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}

                  <Link
                    href="/tools"
                    onClick={closeAllMenus}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#1956b4] py-2.5 text-xs font-bold text-white"
                  >
                    <span>Open Full Tools Directory</span>
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Company & Legal Links */}
            <div className="grid grid-cols-2 gap-2 border-t border-line pt-3 text-xs font-semibold">
              <Link
                href="/about"
                onClick={closeAllMenus}
                className="rounded-lg bg-subcard px-3 py-2 text-ink-soft hover:text-ink"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                onClick={closeAllMenus}
                className="rounded-lg bg-subcard px-3 py-2 text-ink-soft hover:text-ink"
              >
                Contact Us
              </Link>
              <Link
                href="/privacy-policy"
                onClick={closeAllMenus}
                className="rounded-lg bg-subcard px-3 py-2 text-ink-soft hover:text-ink"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                onClick={closeAllMenus}
                className="rounded-lg bg-subcard px-3 py-2 text-ink-soft hover:text-ink"
              >
                Terms &amp; Disclaimer
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
