import React from "react";

type IconProps = { className?: string };

const make = (paths: React.ReactNode) =>
  function Icon({ className = "h-[18px] w-[18px]" }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={`flex-none ${className}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths}
      </svg>
    );
  };

export const Share2 = make(<path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6" />);
export const Shuffle = make(
  <>
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <circle cx="9" cy="9" r="1" />
    <circle cx="15" cy="15" r="1" />
    <circle cx="15" cy="9" r="1" />
    <circle cx="9" cy="15" r="1" />
  </>
);
export const Edit = make(<path d="M4 20h4L19 9l-4-4L4 16z" />);
export const Copy = make(
  <>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a2 2 0 012-2h9" />
  </>
);
export const Trash2 = make(<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />);
export const MoreHorizontal = make(
  <>
    <circle cx="5" cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="19" cy="12" r="1.5" />
  </>
);
export const Filter = make(<path d="M4 6h16M7 12h10M10 18h4" />);
export const MapPin = make(
  <>
    <path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </>
);
export const Star = make(<path d="M12 4l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z" />);
export const List = make(<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />);
export const LayoutGrid = make(
  <>
    <rect x="4" y="4" width="7" height="7" rx="1" />
    <rect x="13" y="4" width="7" height="7" rx="1" />
    <rect x="4" y="13" width="7" height="7" rx="1" />
    <rect x="13" y="13" width="7" height="7" rx="1" />
  </>
);
