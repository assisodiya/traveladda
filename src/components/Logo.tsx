import Link from "next/link";

interface LogoProps {
  theme?: "dark" | "light";
  size?: "sm" | "md" | "lg";
}

export function Logo({ theme = "light", size = "md" }: LogoProps) {
  const iconSizes = {
    sm: "h-9 w-9",
    md: "h-10 w-10",
    lg: "h-11 w-11",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-[22px]",
    lg: "text-2xl",
  };

  const isDarkSurface = theme === "dark";

  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2.5 focus-visible:rounded-xl"
      aria-label="TravelAdda Home"
    >
      <span
        className={`relative inline-flex ${iconSizes[size]} shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-950 via-indigo-800 to-teal-700 shadow-sm ring-1 ring-slate-900/10 transition-transform duration-200 group-hover:scale-105`}
      >
        <svg
          viewBox="0 0 64 64"
          width="28"
          height="28"
          fill="none"
          className="h-7 w-7 shrink-0"
          aria-hidden="true"
        >
          <path
            d="M14 45C22 30 33 21 50 16"
            stroke="#38BDF8"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M38 14.5L51 15.5L46 27.5"
            stroke="#2DD4BF"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 49.5H47"
            stroke="#FB7185"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
          <circle cx="15" cy="44.5" r="4.2" fill="#38BDF8" />
        </svg>
      </span>

      <span
        className={`${textSizes[size]} font-extrabold leading-none tracking-tight ${
          isDarkSurface ? "text-white" : "text-slate-900"
        }`}
      >
        Travel
        <span
          className={
            isDarkSurface
              ? "text-sky-400"
              : "text-indigo-600"
          }
        >
          Adda
        </span>
      </span>
    </Link>
  );
}
