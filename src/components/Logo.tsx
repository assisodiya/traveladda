import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

export function Logo({ size = "md" }: LogoProps) {
  const iconSizes = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2 focus-visible:rounded-lg"
      aria-label="TravelAdda Home"
    >
      <span className={`inline-flex ${iconSizes[size]} shrink-0 items-center justify-center rounded-lg bg-[#1956b4] text-white shadow-2xs`}>
        <svg
          viewBox="0 0 32 32"
          width="20"
          height="20"
          fill="none"
          className="h-5 w-5 shrink-0"
          aria-hidden="true"
        >
          <path
            d="M6 22C11 14 17 10 26 7"
            stroke="#FFFFFF"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M19 6.5L26.5 7L23.5 13.5"
            stroke="#FF8A3D"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="7" cy="22" r="2.5" fill="#FF8A3D" />
        </svg>
      </span>

      <span
        className={`${textSizes[size]} font-extrabold leading-none tracking-tight text-[#0a223d] dark:text-white`}
      >
        travel
        <span className="text-[#fc6203]">adda</span>
      </span>
    </Link>
  );
}
