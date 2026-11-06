"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "./Icons";

const THEME_STORAGE_KEY = "traveladda-theme";
const themeListeners = new Set<() => void>();

function subscribeTheme(listener: () => void) {
  themeListeners.add(listener);
  return () => {
    themeListeners.delete(listener);
  };
}

function getIsDarkSnapshot(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

function getIsDarkServerSnapshot(): boolean {
  return false;
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(
    subscribeTheme,
    getIsDarkSnapshot,
    getIsDarkServerSnapshot
  );

  const toggleTheme = () => {
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
    for (const listener of themeListeners) listener();
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-subcard px-2.5 text-xs font-semibold text-ink-soft transition hover:border-line-strong hover:text-ink"
    >
      {isDark ? (
        <>
          <SunIcon className="h-4 w-4 text-amber-400" />
          <span className="hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <MoonIcon className="h-4 w-4 text-[#1956b4]" />
          <span className="hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  );
}
