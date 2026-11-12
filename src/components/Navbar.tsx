"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { TOOL_CATEGORIES, type ToolMenuItem } from "@/lib/tools-catalog";
import {
  BookOpenIcon,
  BuildingStationIcon,
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
  const headerRef = useRef<HTMLElement>(null);
  const detailsRefs = useRef<Record<string, HTMLDetailsElement | null>>({});

  const closeAllMenus = () => {
    if (!headerRef.current) return;
    const openDetails = headerRef.current.querySelectorAll("details[open]");
    openDetails.forEach((d) => d.removeAttribute("open"));
  };

  const closeOtherMenus = (activeKey: string) => {
    Object.entries(detailsRefs.current).forEach(([key, el]) => {
      if (key !== activeKey && el?.open) {
        el.open = false;
      }
    });
  };

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (headerRef.current && !headerRef.current.contains(target)) {
        closeAllMenus();
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

        {/* Right: Desktop Navigation Menu (Home | Flights | Trains | Hotels | Guides) + Theme Toggle */}
        <div className="ml-auto hidden items-center gap-1 lg:flex xl:gap-1.5">
          <nav aria-label="Primary" className="flex items-center gap-1">
            {/* Home Link */}
            <Link
              href="/"
              onClick={closeAllMenus}
              className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition xl:px-3.5 xl:text-sm ${
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

            {/* 3 Standard Category Dropdowns: Flights | Trains | Hotels */}
            {TOP_MENU_TABS.map((tab) => {
              const category = TOOL_CATEGORIES.find((c) => c.id === tab.id);
              const isRouteActive = tab.isActivePath(pathname);

              return (
                <details
                  key={tab.id}
                  ref={(el) => {
                    detailsRefs.current[tab.id] = el;
                  }}
                  onToggle={(e) => {
                    if ((e.currentTarget as HTMLDetailsElement).open) {
                      closeOtherMenus(tab.id);
                    }
                  }}
                  className="group relative"
                >
                  <summary
                    className={`relative inline-flex cursor-pointer list-none items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition select-none [&::-webkit-details-marker]:hidden xl:px-3.5 xl:text-sm ${
                      isRouteActive
                        ? "bg-blue-50 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                        : "text-ink-soft group-open:bg-blue-50 group-open:text-[#1956b4] hover:bg-subcard hover:text-ink dark:group-open:bg-blue-500/15 dark:group-open:text-blue-300"
                    }`}
                  >
                    {tab.icon({
                      className: `h-4 w-4 ${
                        isRouteActive
                          ? "text-[#1956b4] dark:text-blue-300"
                          : "text-ink-muted group-open:text-[#1956b4] dark:group-open:text-blue-300"
                      }`,
                    })}
                    <span>{tab.label}</span>
                    <ChevronDownIcon className="h-3.5 w-3.5 text-ink-muted transition-transform duration-150 group-open:rotate-180 group-open:text-[#1956b4] dark:group-open:text-blue-300" />
                    {isRouteActive && (
                      <span className="absolute right-3 bottom-0 left-3 h-0.5 rounded-full bg-[#fc6203]" />
                    )}
                  </summary>

                  {/* Standard Anchored Dropdown Menu (Aligned Right so it never clips) */}
                  {category && (
                    <div className="absolute top-full right-0 z-50 mt-2 w-80 rounded-xl border border-line bg-card p-1.5 shadow-2xl ring-1 ring-black/10">
                      <div className="flex items-center justify-between border-b border-line px-3 py-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1956b4] dark:text-blue-300">
                          {category.categoryTitle}
                        </span>
                        <span className="text-[10px] font-semibold text-ink-muted">
                          {category.items.length} Tools
                        </span>
                      </div>

                      <div className="divide-y divide-line/60 py-1">
                        {category.items.map((item) => {
                          const isItemActive = pathname === item.href;
                          return (
                            <Link
                              key={item.id}
                              href={item.href}
                              onClick={closeAllMenus}
                              className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition ${
                                isItemActive
                                  ? "bg-blue-50/80 text-[#1956b4] dark:bg-blue-500/15 dark:text-blue-300"
                                  : "hover:bg-subcard"
                              }`}
                            >
                              <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-subcard text-[#1956b4] dark:text-blue-300">
                                {renderToolItemIcon(item.iconKey)}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="truncate text-xs font-extrabold text-ink sm:text-sm">
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
                </details>
              );
            })}

            {/* Travel Guides Link */}
            <Link
              href="/blog"
              onClick={closeAllMenus}
              className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition xl:px-3.5 xl:text-sm ${
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
              <span>Guides</span>
              {pathname.startsWith("/blog") && (
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

          <details
            ref={(el) => {
              detailsRefs.current.mobile = el;
            }}
            onToggle={(e) => {
              if ((e.currentTarget as HTMLDetailsElement).open) {
                closeOtherMenus("mobile");
              }
            }}
            className="group"
          >
            <summary
              aria-label="Open navigation menu"
              className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-line bg-subcard px-3 py-2 text-xs font-bold text-ink select-none [&::-webkit-details-marker]:hidden group-open:border-[#1956b4] group-open:bg-[#1956b4] group-open:text-white"
            >
              <span>Menu</span>
              <MenuIcon className="h-4 w-4 group-open:hidden" />
              <CloseIcon className="hidden h-4 w-4 group-open:block" />
            </summary>

            {/* Mobile Dropdown Panel with Flights, Trains, Hotels Accordion / Sections */}
            <div className="fixed inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-card px-4 py-4 shadow-2xl sm:top-20 sm:max-h-[calc(100dvh-5rem)]">
              <div className="mx-auto max-w-2xl space-y-3">
                {TOP_MENU_TABS.map((tab, idx) => {
                  const category = TOOL_CATEGORIES.find((c) => c.id === tab.id);
                  if (!category) return null;
                  return (
                    <details
                      key={tab.id}
                      open={idx === 0}
                      className="group/cat rounded-xl border border-line bg-subcard/40"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between px-3.5 py-2.5 text-xs font-extrabold text-ink select-none [&::-webkit-details-marker]:hidden">
                        <span className="flex items-center gap-2">
                          {tab.icon({
                            className:
                              "h-4 w-4 text-[#1956b4] dark:text-blue-300",
                          })}
                          <span>{tab.label}</span>
                        </span>
                        <ChevronDownIcon className="h-3.5 w-3.5 text-ink-muted transition-transform group-open/cat:rotate-180" />
                      </summary>

                      <div className="divide-y divide-line border-t border-line bg-card px-3 py-1 rounded-b-xl">
                        {category.items.map((item) => (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={closeAllMenus}
                            className="flex items-center gap-2.5 py-2.5"
                          >
                            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-subcard text-[#1956b4] dark:text-blue-300">
                              {renderToolItemIcon(item.iconKey)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1.5">
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
                        ))}
                      </div>
                    </details>
                  );
                })}

                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-bold">
                  <Link
                    href="/"
                    onClick={closeAllMenus}
                    className="rounded-lg border border-line bg-subcard py-2 text-ink-soft hover:text-ink"
                  >
                    Home
                  </Link>
                  <Link
                    href="/blog"
                    onClick={closeAllMenus}
                    className="rounded-lg border border-line bg-subcard py-2 text-ink-soft hover:text-ink"
                  >
                    Guides
                  </Link>
                  <Link
                    href="/contact"
                    onClick={closeAllMenus}
                    className="rounded-lg border border-line bg-subcard py-2 text-ink-soft hover:text-ink"
                  >
                    Contact
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
