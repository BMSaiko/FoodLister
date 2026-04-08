'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  interactive?: boolean;
  onClick?: () => void;
  as?: 'div' | 'article' | 'section';
}

const variantClasses: Record<string, string> = {
  default: 'bg-card-bg border border-card-border shadow-[var(--card-shadow)]',
  elevated: 'bg-card-bg border border-card-border shadow-[var(--card-shadow-lg)]',
  outlined: 'bg-transparent border-2 border-card-border',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  interactive = false,
  onClick,
  as: Component = 'div',
}) => {
  const baseClasses = 'rounded-[var(--radius-xl)] overflow-hidden transition-all duration-200';
  const interactiveClasses = interactive
    ? 'cursor-pointer hover:shadow-[var(--card-shadow-lg)] hover:-translate-y-0.5 active:translate-y-0'
    : '';

  const classes = `${baseClasses} ${variantClasses[variant]} ${interactiveClasses} ${className}`;

  const content = <Component className={classes} onClick={onClick}>{children}</Component>;

  if (interactive) {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.15 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
}

const aspectRatioClasses: Record<string, string> = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
};

export const CardImage: React.FC<CardImageProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = 'video',
}) => {
  return (
    <div className={`relative overflow-hidden ${aspectRatioClasses[aspectRatio]} ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`p-4 md:p-5 ${className}`}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
}) => {
  return (
    <div className={`flex items-start justify-between gap-3 mb-3 ${className}`}>
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-base md:text-lg font-semibold text-foreground truncate">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-foreground-secondary mt-0.5 line-clamp-2">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
      {!title && !subtitle && children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-4 md:px-5 py-3 border-t border-card-border flex items-center gap-2 ${className}`}>
      {children}
    </div>
  );
};

export default Card;