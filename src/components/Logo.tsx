import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

export function Logo({ size = "md" }: LogoProps) {
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

  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2.5 focus-visible:rounded-xl"
      aria-label="TravelAdda Home"
    >
      <span
        style={{
          backgroundImage:
            "linear-gradient(135deg, #c2410c 0%, #ea580c 52%, #f59e0b 100%)",
        }}
        className={`relative inline-flex ${iconSizes[size]} shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-sm ring-1 ring-black/10 transition-transform duration-200 group-hover:scale-105 dark:ring-white/15`}
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
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M38 14.5L51 15.5L46 27.5"
            stroke="#FEF08A"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 49.5H47"
            stroke="#FDE047"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
          <circle cx="15" cy="44.5" r="4.2" fill="#FEF08A" />
        </svg>
      </span>

      <span
        className={`${textSizes[size]} font-extrabold leading-none tracking-tight text-ink`}
      >
        Travel
        <span className="text-orange-600 dark:text-amber-400">Adda</span>
      </span>
    </Link>
  );
}
