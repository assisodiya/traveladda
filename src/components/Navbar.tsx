"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { href: "/", label: "Portal Home" },
  { href: "/rail/pnr-status", label: "PNR Status", badge: "LIVE" },
  { href: "/#toolkit", label: "Travel Tools" },
  { href: "/#corridors", label: "Scenic Routes" },
  { href: "/rail/pnr-status#rail-blog", label: "Rail Blog" },
];

function DesktopNavLinksList({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Primary navigation"
      className="hidden items-center gap-1 md:flex"
    >
      {NAV_LINKS.map((item) => {
        const isActive =
          Boolean(pathname) &&
          (item.href === "/"
            ? pathname === "/"
            : item.href === "/rail/pnr-status" &&
              pathname.startsWith("/rail/pnr-status"));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <span>{item.label}</span>
            {item.badge && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function ActiveDesktopNav() {
  const pathname = usePathname();
  return <DesktopNavLinksList pathname={pathname} />;
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <Logo theme="light" size="md" showTagline />

        {/* Desktop Nav wrapped in Suspense for Next.js 16 Cache Components */}
        <Suspense fallback={<DesktopNavLinksList pathname="" />}>
          <ActiveDesktopNav />
        </Suspense>

        {/* Action CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/rail/pnr-status"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-orange-500/25 transition hover:from-orange-700 hover:to-amber-600"
          >
            <span>Check PNR</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? (
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
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
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
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

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-lg md:hidden">
          <div className="flex flex-col gap-1.5">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            <Link
              href="/rail/pnr-status"
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-3 text-sm font-bold text-white"
            >
              Check Live PNR Status →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
