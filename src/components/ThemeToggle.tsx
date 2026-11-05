"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "./Icons";

const THEME_STORAGE_KEY = "traveladda-theme";
const themeListeners = new Set<() => void>();

function subscribeTheme(listener: () => void) {
  themeListeners.add(listener);
  if (typeof window !== "undefined") {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMedia = () => {
      if (!window.localStorage.getItem(THEME_STORAGE_KEY)) {
        document.documentElement.classList.toggle("dark", mq.matches);
        document.documentElement.style.colorScheme = mq.matches
          ? "dark"
          : "light";
        listener();
      }
    };
    mq.addEventListener("change", handleMedia);
    return () => {
      themeListeners.delete(listener);
      mq.removeEventListener("change", handleMedia);
    };
  }
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
      className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-line bg-subcard px-3 text-xs font-bold text-ink transition hover:border-line-strong"
    >
      {isDark ? (
        <>
          <SunIcon className="h-4 w-4 text-amber-300" />
          <span className="hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <MoonIcon className="h-4 w-4 text-teal-700" />
          <span className="hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  );
}
