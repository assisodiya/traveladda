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

export function Navbar() {
  const [pathname, setPathname] = useState("");
  const headerRef = useRef<HTMLElement>(null);
  const desktopToolsRef = useRef<HTMLDetailsElement>(null);
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);

  const isToolsRoute =
    pathname.startsWith("/tools") ||
    pathname.startsWith("/air/") ||
    pathname.startsWith("/rail/");

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

            {/* 2. Tools Category-Wise Dropdown (Native <details> + JS enhanced) */}
            <details ref={desktopToolsRef} className="group relative">
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

              {/* Centered Under "Tools" Button Category-Wise Mega Dropdown Panel */}
              <div className="absolute top-full left-1/2 z-50 mt-2.5 w-[min(700px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-line bg-card shadow-2xl ring-1 ring-black/10">
                <span
                  aria-hidden="true"
                  className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-t border-l border-line bg-subcard"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-2xl border-b border-line bg-subcard/80 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#1956b4] text-white">
                      <CompassIcon className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-xs font-extrabold text-ink sm:text-sm">
                      Active Travel Tools (Air, Rail &amp; Hotel)
                    </p>
                  </div>
                  <Link
                    href="/tools"
                    onClick={closeAllMenus}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#1956b4] hover:underline dark:text-blue-400"
                  >
                    <span>All Tools</span>
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* 3 Category Columns */}
                <div className="grid gap-3.5 p-4 lg:grid-cols-3">
                  {TOOL_CATEGORIES.map((category) => (
                    <div
                      key={category.id}
                      className="rounded-xl border border-line bg-subcard/40 p-3"
                    >
                      <div className="mb-2.5 border-b border-line pb-2">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${category.accentBadgeClass}`}
                        >
                          {category.categoryTitle}
                        </span>
                        <p className="mt-0.5 text-[11px] text-ink-muted">
                          {category.categorySubtitle}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        {category.items.map((item) => (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={closeAllMenus}
                            className="group/item flex items-start gap-2.5 rounded-xl border border-transparent bg-card p-2.5 shadow-2xs transition hover:border-[#1956b4]"
                          >
                            <span
                              className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${category.accentBadgeClass}`}
                            >
                              {renderToolItemIcon(item.iconKey)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1.5">
                                <p className="truncate text-xs font-bold text-ink group-hover/item:text-[#1956b4] dark:group-hover/item:text-blue-300">
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

                {/* Dropdown Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-line bg-subcard/70 px-5 py-2.5 text-xs">
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

            {/* Mobile Full-Width Dropdown Panel */}
            <div className="fixed inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-card px-4 py-4 shadow-2xl sm:top-20 sm:max-h-[calc(100dvh-5rem)]">
              <div className="mx-auto max-w-lg space-y-4">
                {/* Main Mobile Pages */}
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

                {/* All Tools Category-Wise */}
                <div className="rounded-2xl border border-line bg-subcard/40 p-3">
                  <div className="mb-3 flex items-center justify-between border-b border-line pb-2">
                    <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                      <CompassIcon className="h-4 w-4" />
                      <span>All Tools (Category-Wise)</span>
                    </span>
                    <Link
                      href="/tools"
                      onClick={closeAllMenus}
                      className="text-[11px] font-bold text-[#1956b4] dark:text-blue-300"
                    >
                      View All →
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {TOOL_CATEGORIES.map((category) => (
                      <div key={category.id} className="space-y-1.5">
                        <div className="px-1">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${category.accentBadgeClass}`}
                          >
                            {category.categoryTitle}
                          </span>
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
                  </div>
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
          </details>
        </div>
      </div>
    </header>
  );
}
