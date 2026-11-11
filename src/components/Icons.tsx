import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;

export function PlaneIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path
        d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"
        fill="currentColor"
        fillOpacity="0.12"
      />
    </svg>
  );
}

export function TrainIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <rect
        x="4"
        y="3"
        width="16"
        height="15"
        rx="3.5"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path d="M4 10.5h16" />
      <path d="M12 3v7.5" />
      <circle cx="8.5" cy="14.5" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="14.5" r="1.15" fill="currentColor" stroke="none" />
      <path d="M8 18l-2.2 3" />
      <path d="M16 18l2.2 3" />
      <path d="M9 6.5h6" strokeOpacity="0.55" />
    </svg>
  );
}

export function HotelIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path
        d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path d="M3 21h18" />
      <path d="M9 7h2" />
      <path d="M13 7h2" />
      <path d="M9 11h2" />
      <path d="M13 11h2" />
      <path d="M9 15h2" />
      <path d="M13 15h2" />
      <path d="M10 21v-3.2a2 2 0 014 0V21" />
    </svg>
  );
}

export function RadarLiveIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="currentColor"
        fillOpacity="0.08"
        strokeDasharray="3 2.5"
      />
      <path d="M8.5 8.5a5 5 0 017 0" />
      <path d="M15.5 15.5a5 5 0 01-7 0" />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
      <path d="M12 12l4.5-4.5" />
    </svg>
  );
}

export function RouteTrackIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <circle
        cx="6"
        cy="18"
        r="2.5"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <circle
        cx="18"
        cy="6"
        r="2.5"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path d="M8.5 18h4a3.5 3.5 0 000-7h-1a3.5 3.5 0 010-7h4" />
    </svg>
  );
}

export function GaugeSpeedIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path
        d="M4.2 17.5a9 9 0 1115.6 0"
        fill="currentColor"
        fillOpacity="0.08"
      />
      <path d="M12 14l3.8-3.8" />
      <circle cx="12" cy="14" r="1.8" fill="currentColor" />
      <path d="M7.5 10.5l.8.8" />
      <path d="M12 8v1.2" />
      <path d="M16.5 10.5l-.8.8" />
    </svg>
  );
}

export function CalendarIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <rect
        x="3.5"
        y="4.5"
        width="17"
        height="16"
        rx="2.5"
        fill="currentColor"
        fillOpacity="0.08"
      />
      <path d="M8 2.8v3.4" />
      <path d="M16 2.8v3.4" />
      <path d="M3.5 9.5h17" />
      <circle cx="8.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="13.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="17" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CoachTrainIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <rect
        x="2.5"
        y="6"
        width="19"
        height="10.5"
        rx="2.2"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <rect x="5.5" y="8.8" width="3.5" height="3.2" rx="0.6" />
      <rect x="10.25" y="8.8" width="3.5" height="3.2" rx="0.6" />
      <rect x="15" y="8.8" width="3.5" height="3.2" rx="0.6" />
      <circle cx="7" cy="18.2" r="1.6" />
      <circle cx="17" cy="18.2" r="1.6" />
      <path d="M1.5 13h1" />
      <path d="M21.5 13h1" />
    </svg>
  );
}

export function EngineTrainIcon({
  className = "h-5 w-5",
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path
        d="M3 7.5A1.5 1.5 0 014.5 6h10.8a3 3 0 012.5 1.34l2.7 4.05a2.5 2.5 0 01.42 1.39V15a1.5 1.5 0 01-1.5 1.5H3V7.5z"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M13 6v5.5h6.5" />
      <rect x="5.5" y="8.5" width="4.5" height="3" rx="0.6" />
      <circle cx="6.8" cy="18.2" r="1.6" />
      <circle cx="16.2" cy="18.2" r="1.6" />
      <path d="M8.5 3.5L11 6l2.5-2.5" />
    </svg>
  );
}

export function BuildingStationIcon({
  className = "h-5 w-5",
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path
        d="M3 10l9-6 9 6v10H3V10z"
        fill="currentColor"
        fillOpacity="0.09"
      />
      <path d="M2 20h20" />
      <circle cx="12" cy="10" r="2" />
      <path d="M9.5 20v-4.5a2.5 2.5 0 015 0V20" />
    </svg>
  );
}

export function CompassIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="currentColor"
        fillOpacity="0.08"
      />
      <polygon
        points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
        fill="currentColor"
        fillOpacity="0.18"
      />
    </svg>
  );
}

export function SparklesIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path
        d="M12 3l1.9 4.8L18.7 9.7l-4.8 1.9L12 16.4l-1.9-4.8L5.3 9.7l4.8-1.9L12 3z"
        fill="currentColor"
        fillOpacity="0.16"
      />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
      <path d="M5 16l.7 1.6L7.3 18.3l-1.6.7L5 20.6l-.7-1.6-1.6-.7 1.6-.7L5 16z" />
    </svg>
  );
}

export function SwapArrowsIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M7 16V4m0 0L3.5 7.5M7 4l3.5 3.5" />
      <path d="M17 8v12m0 0l3.5-3.5M17 20l-3.5-3.5" />
    </svg>
  );
}

export function NavigationIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <polygon
        points="3 11 21 3 13 21 11 13 3 11"
        fill="currentColor"
        fillOpacity="0.15"
      />
    </svg>
  );
}

export function BedIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M3 7v11" />
      <path d="M21 18v-6a3 3 0 00-3-3h-7v6" />
      <path d="M3 15h18" />
      <circle
        cx="7.5"
        cy="11"
        r="2"
        fill="currentColor"
        fillOpacity="0.16"
      />
    </svg>
  );
}

export function HelpCircleIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="currentColor"
        fillOpacity="0.08"
      />
      <path d="M9.4 9.2a2.8 2.8 0 015.2 1.3c0 1.8-2.6 2.2-2.6 3.5" />
      <circle cx="12" cy="17.2" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function UserCheckIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <circle
        cx="9.5"
        cy="8"
        r="3.5"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <path d="M3.5 19.5a6 6 0 0112 0" />
      <path d="M16 11.5l1.8 1.8 3.7-3.8" />
    </svg>
  );
}

export function RupeeBadgeIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="currentColor"
        fillOpacity="0.09"
      />
      <path d="M9 8h6" />
      <path d="M9 11h6" />
      <path d="M12.5 17L9.5 13.5h2a2.75 2.75 0 000-5.5" />
    </svg>
  );
}

export function FilterIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <polygon
        points="3 5 21 5 14 13.2 14 19 10 21 10 13.2 3 5"
        fill="currentColor"
        fillOpacity="0.1"
      />
    </svg>
  );
}

export function ZapIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <polygon
        points="13 2 4 14 11.5 14 11 22 20 10 12.5 10 13 2"
        fill="currentColor"
        fillOpacity="0.15"
      />
    </svg>
  );
}

export function MenuIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h12" />
    </svg>
  );
}

export function CloseIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M6 18L18 6" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export function CheckCircleIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path d="M8.5 12.5l2.4 2.4 4.8-5" />
    </svg>
  );
}

export function ClockIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="currentColor"
        fillOpacity="0.09"
      />
      <path d="M12 7v5l3.2 2" />
    </svg>
  );
}

export function LuggageIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <rect
        x="6"
        y="7"
        width="12"
        height="13"
        rx="2.2"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
      <path d="M9 20v1.2" />
      <path d="M15 20v1.2" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}

export function TicketIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path
        d="M3 9a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 000 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1a2 2 0 000-4V9z"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path d="M13.5 7v10" strokeDasharray="2 2" />
      <path d="M7.5 11.5h3" />
    </svg>
  );
}

export function CalculatorIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <rect
        x="4"
        y="3"
        width="16"
        height="18"
        rx="2.5"
        fill="currentColor"
        fillOpacity="0.09"
      />
      <rect x="7.5" y="6.2" width="9" height="3" rx="0.8" />
      <path d="M8 13h2" />
      <path d="M14 13h2" />
      <path d="M8 16.8h2" />
      <path d="M14 16.8h2" />
    </svg>
  );
}

export function BookOpenIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path
        d="M2 4.5h6a4 4 0 014 4v11.5a3 3 0 00-3-3H2V4.5z"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M22 4.5h-6a4 4 0 00-4 4v11.5a3 3 0 013-3h7V4.5z"
        fill="currentColor"
        fillOpacity="0.1"
      />
    </svg>
  );
}

export function MapPinIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path
        d="M12 21s7-5.4 7-11a7 7 0 10-14 0c0 5.6 7 11 7 11z"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function RefreshIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M21 12a9 9 0 11-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

export function CopyIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <rect
        x="9"
        y="9"
        width="13"
        height="13"
        rx="2"
        fill="currentColor"
        fillOpacity="0.09"
      />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

export function PrinterIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M6 9V3h12v6" />
      <rect
        x="3"
        y="9"
        width="18"
        height="8"
        rx="2"
        fill="currentColor"
        fillOpacity="0.08"
      />
      <path d="M6 15h12v6H6z" />
    </svg>
  );
}

export function CodeIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M16 18l6-6-6-6" />
      <path d="M8 6l-6 6 6 6" />
    </svg>
  );
}

export function ShieldCheckIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path
        d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function AlertCircleIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path d="M12 8v4.5" />
      <circle cx="12" cy="16" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SearchIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <circle
        cx="11"
        cy="11"
        r="7"
        fill="currentColor"
        fillOpacity="0.08"
      />
      <path d="M20 20l-3.8-3.8" />
    </svg>
  );
}

export function SunIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="4"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M6.34 17.66l-1.41 1.41" />
      <path d="M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

export function MoonIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path
        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
        fill="currentColor"
        fillOpacity="0.16"
      />
    </svg>
  );
}

export function PhoneCallIcon({ className = "h-4 w-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path
        d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
        fill="currentColor"
        fillOpacity="0.1"
      />
    </svg>
  );
}

export function LiveFlightBeaconIcon({
  size = "md",
  active = true,
}: {
  size?: "sm" | "md" | "lg";
  active?: boolean;
}) {
  const dims =
    size === "lg"
      ? "h-12 w-12"
      : size === "sm"
        ? "h-7 w-7"
        : "h-9 w-9";
  const iconDims =
    size === "lg"
      ? "h-6 w-6"
      : size === "sm"
        ? "h-3.5 w-3.5"
        : "h-4.5 w-4.5";

  return (
    <span className={`relative inline-flex ${dims} shrink-0 items-center justify-center`}>
      {active && (
        <>
          <span
            aria-hidden="true"
            className="ta-radar-ring absolute inset-0 rounded-full bg-blue-500/35"
          />
          <span
            aria-hidden="true"
            className="ta-radar-ring-delay absolute inset-0 rounded-full bg-emerald-400/30"
          />
        </>
      )}
      <span
        className={`relative z-10 inline-flex h-full w-full items-center justify-center rounded-full text-white shadow-sm ring-2 ring-white dark:ring-slate-900 ${
          active ? "bg-[#1956b4]" : "bg-slate-500"
        }`}
      >
        <PlaneIcon className={iconDims} />
        {active && (
          <span
            aria-hidden="true"
            className="ta-led-blink absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-white bg-emerald-400"
          />
        )}
      </span>
    </span>
  );
}

export function LiveTrainBeaconIcon({
  size = "md",
  active = true,
}: {
  size?: "sm" | "md" | "lg";
  active?: boolean;
}) {
  const dims =
    size === "lg"
      ? "h-12 w-12"
      : size === "sm"
        ? "h-7 w-7"
        : "h-9 w-9";
  const iconDims =
    size === "lg"
      ? "h-6 w-6"
      : size === "sm"
        ? "h-3.5 w-3.5"
        : "h-4.5 w-4.5";

  return (
    <span className={`relative inline-flex ${dims} shrink-0 items-center justify-center`}>
      {active && (
        <>
          <span
            aria-hidden="true"
            className="ta-radar-ring absolute inset-0 rounded-full bg-emerald-500/35"
          />
          <span
            aria-hidden="true"
            className="ta-radar-ring-delay absolute inset-0 rounded-full bg-blue-500/25"
          />
        </>
      )}
      <span
        className={`relative z-10 inline-flex h-full w-full items-center justify-center rounded-full text-white shadow-sm ring-2 ring-white dark:ring-slate-900 ${
          active ? "bg-[#0d9458]" : "bg-slate-500"
        }`}
      >
        <TrainIcon className={iconDims} />
        {active && (
          <span
            aria-hidden="true"
            className="ta-led-blink absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-white bg-emerald-300"
          />
        )}
      </span>
    </span>
  );
}

export function SwapIcon({ className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M7 16V4m0 0L3 8m4-4l4 4" />
      <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  );
}


