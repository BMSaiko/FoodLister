import React from 'react';

/**
 * Ícones próprios do FoodLister: traço arredondado de 2 px (como a cloche do logo)
 * e um detalhe em âmbar (`--accent`, por omissão #f59e0b). Herdam a cor via `currentColor`.
 */
export interface FlIconProps extends Omit<React.SVGProps<SVGSVGElement>, 'children'> {
  size?: number | string;
}

const ACCENT = 'var(--accent, #f59e0b)';

function make(name: string, render: () => React.ReactNode) {
  const Icon = ({ size = 20, className, ...rest }: FlIconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      {render()}
    </svg>
  );
  Icon.displayName = `Fl${name}Icon`;
  return Icon;
}

export const ShareIcon = make('Share', () => (
  <>
    <path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
    <path d="M12 15V4" />
    <path d="m8 8 4-4 4 4" stroke={ACCENT} />
  </>
));

export const CalendarIcon = make('Calendar', () => (
  <>
    <rect x="4" y="5" width="16" height="15" rx="3" />
    <path d="M8 3v4M16 3v4" />
    <path d="M4 11h16" stroke={ACCENT} />
  </>
));

export const EditIcon = make('Edit', () => (
  <>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" />
    <path d="m14 6 4 4" stroke={ACCENT} />
  </>
));

export const TrashIcon = make('Trash', () => (
  <>
    <path d="M5 7h14l-1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" />
    <path d="M4 7h16M10 4h4" stroke={ACCENT} />
  </>
));

export const MoreIcon = make('More', () => (
  <>
    <circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.6" fill={ACCENT} stroke="none" />
    <circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" />
  </>
));

export const StarIcon = make('Star', () => (
  <path
    d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8z"
    fill={ACCENT}
    stroke={ACCENT}
  />
));

export const PinIcon = make('Pin', () => (
  <>
    <path d="M5 11a7 7 0 0 1 14 0c0 5-7 10-7 10s-7-5-7-10z" />
    <circle cx="12" cy="11" r="2.4" fill={ACCENT} stroke="none" />
  </>
));

export const MenuBookIcon = make('MenuBook', () => (
  <>
    <path d="M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2z" />
    <path d="M12 6v14" stroke={ACCENT} />
  </>
));

export const PhoneIcon = make('Phone', () => (
  <>
    <path d="M6 4h3l1.5 4-2 1.5a10 10 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A14 14 0 0 1 4 6a2 2 0 0 1 2-2z" />
    <path d="M15 4.5a5 5 0 0 1 4.5 4.5" stroke={ACCENT} />
  </>
));

export const GlobeIcon = make('Globe', () => (
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" stroke={ACCENT} />
  </>
));

export const ListPlusIcon = make('ListPlus', () => (
  <>
    <path d="M4 7h10M4 12h7M4 17h7" />
    <path d="M17 13v6M14 16h6" stroke={ACCENT} />
  </>
));

export const FlagIcon = make('Flag', () => (
  <>
    <path d="M6 21V4" />
    <path d="M6 5h11l-2 4 2 4H6" stroke={ACCENT} />
  </>
));

export const ExpandIcon = make('Expand', () => <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />);
