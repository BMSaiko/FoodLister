import React from 'react';

interface TouchButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  icon,
  fullWidth = false
}) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    rounded-lg font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    ${fullWidth ? 'w-full' : ''}
  `;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px] min-w-[120px]',
    md: 'px-4 sm:px-6 py-3 text-base min-h-[44px] min-w-[140px]',
    lg: 'px-6 sm:px-8 py-4 text-lg min-h-[48px] min-w-[160px]'
  };

  const variantClasses = {
    primary: `
      bg-amber-500 text-white shadow-md hover:shadow-lg
      hover:bg-amber-600 active:bg-amber-700
      focus:ring-amber-500 focus:ring-offset-2
      touch-feedback
    `,
    secondary: `
      bg-white text-gray-700 border border-gray-300
      hover:bg-gray-50 active:bg-gray-100
      focus:ring-gray-400 focus:ring-offset-2
      touch-feedback
    `,
    ghost: `
      bg-transparent text-gray-600
      hover:bg-gray-100 active:bg-gray-200
      focus:ring-gray-300 focus:ring-offset-2
      touch-feedback
    `
  };

  const classes = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `;

  const content = (
    <>
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
      )}
      {icon && !loading && icon}
      {children}
    </>
  );

  if (type === 'submit' || type === 'reset') {
    return (
      <button
        type={type}
        className={classes}
        disabled={disabled}
      >
        {content}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={classes}
      disabled={disabled || loading}
    >
      {content}
    </button>
  );
};

interface TouchIconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export const TouchIconButton: React.FC<TouchIconButtonProps> = ({
  icon,
  onClick,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  className = '',
  ariaLabel
}) => {
  const baseClasses = `
    inline-flex items-center justify-center
    rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    touch-feedback
  `;

  const sizeClasses = {
    sm: 'p-2 min-h-[36px] min-w-[36px]',
    md: 'p-2.5 min-h-[44px] min-w-[44px]',
    lg: 'p-3 min-h-[48px] min-w-[48px]'
  };

  const variantClasses = {
    primary: `
      bg-amber-500 text-white
      hover:bg-amber-600 active:bg-amber-700
      focus:ring-amber-500 focus:ring-offset-2
    `,
    secondary: `
      bg-white text-gray-700 border border-gray-300
      hover:bg-gray-50 active:bg-gray-100
      focus:ring-gray-400 focus:ring-offset-2
    `,
    ghost: `
      bg-transparent text-gray-600
      hover:bg-gray-100 active:bg-gray-200
      focus:ring-gray-300 focus:ring-offset-2
    `
  };

  const classes = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classes}
      aria-label={ariaLabel}
    >
      {icon}
    </button>
  );
};

interface TouchLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const TouchLink: React.FC<TouchLinkProps> = ({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  fullWidth = false
}) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    rounded-lg font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    touch-feedback
    ${fullWidth ? 'w-full' : ''}
  `;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px] min-w-[120px]',
    md: 'px-4 sm:px-6 py-3 text-base min-h-[44px] min-w-[140px]',
    lg: 'px-6 sm:px-8 py-4 text-lg min-h-[48px] min-w-[160px]'
  };

  const variantClasses = {
    primary: `
      bg-amber-500 text-white shadow-md hover:shadow-lg
      hover:bg-amber-600 active:bg-amber-700
      focus:ring-amber-500 focus:ring-offset-2
    `,
    secondary: `
      bg-white text-gray-700 border border-gray-300
      hover:bg-gray-50 active:bg-gray-100
      focus:ring-gray-400 focus:ring-offset-2
    `
  };

  const classes = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `;

  return (
    <a href={href} className={classes}>
      {icon && icon}
      {children}
    </a>
  );
};