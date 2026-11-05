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
      className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700"
    >
      {isDark ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </button>
  );
}

