import React from "react";
import Link from "next/link";

interface ProfileCardProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  children, className = "", href, onClick, hoverEffect = true,
}) => {
  const baseClasses = `p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] transition-all duration-200 ${
    hoverEffect ? "hover:bg-white/[0.04] hover:scale-[1.02]" : ""
  } ${className}`;

  const inner = <div className="p-4 rounded-xl bg-white/[0.03]">{children}</div>;

  if (href) {
    return (
      <Link href={href} className={`block ${baseClasses}`}>
        {inner}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={`block w-full text-left ${baseClasses}`}>
        {inner}
      </button>
    );
  }

  return <div className={baseClasses}>{inner}</div>;
};
