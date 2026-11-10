"use client";

import { MoonIcon, SunIcon } from "./Icons";

const THEME_STORAGE_KEY = "traveladda-theme";

declare global {
  interface Window {
    __taLastThemeToggle?: number;
    __taToggleTheme?: () => void;
  }
}

export function toggleSiteTheme() {
  if (typeof document === "undefined") return;
  const now = Date.now();
  if (window.__taLastThemeToggle && now - window.__taLastThemeToggle < 150) {
    return;
  }
  window.__taLastThemeToggle = now;

  const nextDark = !document.documentElement.classList.contains("dark");
  document.documentElement.classList.toggle("dark", nextDark);
  document.documentElement.style.colorScheme = nextDark ? "dark" : "light";
  try {
    window.localStorage.setItem(
      THEME_STORAGE_KEY,
      nextDark ? "dark" : "light"
    );
  } catch {
    // Ignore storage errors
  }
}

export function ThemeToggle() {
  return (
    <button
      type="button"
      data-theme-toggle="true"
      onClick={toggleSiteTheme}
      aria-label="Toggle dark or light mode"
      title="Toggle dark or light mode"
      className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-subcard px-2.5 text-xs font-semibold text-ink-soft transition select-none hover:border-line-strong hover:text-ink"
    >
      <span className="hidden items-center gap-1.5 dark:inline-flex">
        <SunIcon className="h-4 w-4 text-amber-400" />
        <span className="hidden sm:inline">Light</span>
      </span>
      <span className="inline-flex items-center gap-1.5 dark:hidden">
        <MoonIcon className="h-4 w-4 text-[#1956b4]" />
        <span className="hidden sm:inline">Dark</span>
      </span>
    </button>
  );
}
