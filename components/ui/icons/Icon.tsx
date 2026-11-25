import React from 'react';
import type { IconName } from './names';

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'name' | 'ref'> {
  name: IconName;
  size?: 16 | 20 | 24 | 32 | 48 | 64;
  title?: string;
}

export default function Icon({ name, size = 20, title, className, ...rest }: IconProps) {
  const a11y = title ? { role: 'img' as const } : { 'aria-hidden': true as const };
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} focusable="false" {...a11y} {...rest}>
      {title && <title>{title}</title>}
      <use href={`/icons/sprite.svg#${name}`} />
    </svg>
  );
}
