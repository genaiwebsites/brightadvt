// Hand-drawn service icons on a 32px grid, 1.5px stroke, round joins: one family.
type P = { className?: string };
const base = {
  viewBox: "0 0 32 32",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const IconNewspaper = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M7 6h17v18a2 2 0 0 0 2 2H8a3 3 0 0 1-3-3V11h2" />
    <path d="M24 12h3v12a2 2 0 0 1-4 0" />
    <path d="M11 11h9M11 15h9M11 19h5" />
  </svg>
);
export const IconBillboard = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="4" y="6" width="24" height="12" rx="1" />
    <path d="M11 18v9M21 18v9M8 23h16" />
    <path d="M9 10.5h8M9 13.5h5" />
    <circle cx="23" cy="12" r="1.6" fill="currentColor" stroke="none" />
  </svg>
);
export const IconTv = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="4" y="9" width="24" height="16" rx="2.5" />
    <path d="M12 4l4 5 4-5M11 28h10" />
    <path d="M14 14.5v5l4.5-2.5z" />
  </svg>
);
export const IconRadio = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="4" y="11" width="24" height="15" rx="2.5" />
    <path d="M8 11l15-6" />
    <circle cx="20.5" cy="18.5" r="3.5" />
    <path d="M8 16h6M8 19h6M8 22h6" />
  </svg>
);
export const IconSocial = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="9" y="3.5" width="14" height="25" rx="3" />
    <path d="M14 25.5h4" />
    <path d="M16 18.5s-4-2.4-4-5.1a2.2 2.2 0 0 1 4-1.3 2.2 2.2 0 0 1 4 1.3c0 2.7-4 5.1-4 5.1z" />
  </svg>
);
export const IconTransit = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="7" y="4" width="18" height="20" rx="4" />
    <path d="M7 14h18M12 8h8" />
    <circle cx="11.5" cy="19" r="1" fill="currentColor" />
    <circle cx="20.5" cy="19" r="1" fill="currentColor" />
    <path d="M11 24l-3 4M21 24l3 4" />
  </svg>
);
export const IconRupee = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="16" cy="16" r="12" />
    <path d="M11 10h10M11 14h10M14 10c3 0 4.5 1.5 4.5 3.5S17 18 14 18h-2l7 6" />
  </svg>
);
export const IconChannels = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="16" cy="16" r="3" />
    <circle cx="6.5" cy="8" r="2.5" />
    <circle cx="25.5" cy="8" r="2.5" />
    <circle cx="6.5" cy="24" r="2.5" />
    <circle cx="25.5" cy="24" r="2.5" />
    <path d="M8.5 9.6l5.2 4.4M23.5 9.6l-5.2 4.4M8.5 22.4l5.2-4.4M23.5 22.4l-5.2-4.4" />
  </svg>
);
export const IconPen = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M6 26l3.5-1 14-14a2.5 2.5 0 0 0-3.5-3.5l-14 14z" />
    <path d="M18.5 9l4.5 4.5M6 26h20" />
  </svg>
);
export const IconSearch = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="14" cy="14" r="8" />
    <path d="M20 20l7 7M11 14h6M14 11v6" />
  </svg>
);
export const IconMap = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 8l7-3 10 3 7-3v19l-7 3-10-3-7 3z" />
    <path d="M11 5v19M21 8v19" />
  </svg>
);
export const IconHandshake = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M3 12l5-4 5 2 3-1 5 1 5-2 3 4-5 7-5 4-3-2-3 1-4-4z" />
    <path d="M13 10l-3 4a2 2 0 0 0 3 2l3-3 6 6" />
  </svg>
);
export const IconLaunch = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M18 5c5 0 9 4 9 9-3 3-6 5-9 6l-6-6c1-3 3-6 6-9z" />
    <circle cx="20" cy="12" r="2" />
    <path d="M12 14l-5 1-3 4 5 1M18 20l-1 5-4 3-1-5M9 23l-4 4" />
  </svg>
);
export const IconArrow = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M9 23L23 9M12 9h11v11" />
  </svg>
);
