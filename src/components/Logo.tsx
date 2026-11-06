import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  priority?: boolean;
}

const SIZE_CLASSES = {
  sm: "h-9 w-auto sm:h-10",
  md: "h-10 w-auto sm:h-12",
  lg: "h-12 w-auto sm:h-14",
} as const;

export function Logo({ size = "md", priority = false }: LogoProps) {
  return (
    <Link
      href="/"
      className="group inline-flex shrink-0 items-center rounded-xl transition focus-visible:outline-2 focus-visible:outline-[#1956b4] dark:bg-white/95 dark:px-2.5 dark:py-0.5"
      aria-label="TravelAdda Home"
    >
      <Image
        src="/assets/TravelAdda-travel-logo.png"
        alt="TravelAdda — Flights, Trains, PNR & Travel Tools"
        width={2056}
        height={765}
        priority={priority}
        unoptimized
        className={`${SIZE_CLASSES[size]} object-contain select-none`}
      />
    </Link>
  );
}
