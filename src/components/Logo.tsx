import Link from "next/link";

interface LogoProps {
  theme?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function Logo({
  theme = "light",
  size = "md",
  showTagline = false,
}: LogoProps) {
  const iconSizes = {
    sm: "size-9",
    md: "size-10",
    lg: "size-12",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const isDarkSurface = theme === "dark";

  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-3 focus-visible:rounded-xl"
      aria-label="TravelAdda Home"
    >
      <span
        className={`relative grid ${iconSizes[size]} shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 shadow-md ring-1 ring-white/15 transition-transform duration-300 group-hover:scale-105`}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          className="size-[78%]"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="taArc"
              x1="10"
              y1="48"
              x2="52"
              y2="14"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="55%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
          </defs>
          {/* Soaring flight / express arc */}
          <path
            d="M12 46C20 30 32 21 51 15"
            stroke="url(#taArc)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M38 14L52 14.5L46.5 27.5"
            stroke="url(#taArc)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* High-speed railway track base */}
          <path
            d="M14 50H48"
            stroke="#2DD4BF"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <path
            d="M21 44.5H43"
            stroke="#5EEAD4"
            strokeOpacity="0.7"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeDasharray="4 4.5"
          />
          {/* Origin beacon */}
          <circle cx="13.5" cy="45.5" r="4.2" fill="#FBBF24" />
        </svg>
      </span>

      <span className="flex flex-col leading-none">
        <span
          className={`${textSizes[size]} font-extrabold tracking-tight ${
            isDarkSurface ? "text-white" : "text-slate-900"
          }`}
        >
          Travel
          <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Adda
          </span>
        </span>
        {showTagline && (
          <span
            className={`mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
              isDarkSurface ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Rail &amp; Air Companion
          </span>
        )}
      </span>
    </Link>
  );
}

