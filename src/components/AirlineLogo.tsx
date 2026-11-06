"use client";

import Image from "next/image";
import { useState } from "react";

export interface AirlineLogoProps {
  code: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  xs: { box: "h-6 w-6 rounded-lg p-0.5", px: 20, text: "text-[9px]" },
  sm: { box: "h-8 w-8 rounded-xl p-1", px: 28, text: "text-[10px]" },
  md: { box: "h-10 w-10 rounded-xl p-1.5", px: 34, text: "text-xs" },
  lg: { box: "h-12 w-12 rounded-2xl p-1.5", px: 42, text: "text-sm" },
} as const;

export function AirlineLogo({
  code,
  name,
  size = "sm",
  className = "",
}: AirlineLogoProps) {
  const cleanCode = code.trim().toUpperCase().slice(0, 3) || "AIR";
  const [failedCode, setFailedCode] = useState<string | null>(null);
  const dims = SIZE_MAP[size];
  const hasError = failedCode === cleanCode;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden border border-stone-200/90 bg-white shadow-2xs dark:border-stone-700/80 dark:bg-white ${dims.box} ${className}`}
      title={name ? `${name} (${cleanCode})` : cleanCode}
    >
      {hasError ? (
        <span
          className={`font-mono font-black tracking-tight text-orange-700 ${dims.text}`}
        >
          {cleanCode}
        </span>
      ) : (
        <Image
          src={`/api/flights/icon/${encodeURIComponent(cleanCode)}`}
          alt={`${name ?? cleanCode} (${cleanCode}) airline logo`}
          width={dims.px}
          height={dims.px}
          unoptimized
          onError={() => setFailedCode(cleanCode)}
          className="h-full w-full object-contain"
        />
      )}
    </span>
  );
}

