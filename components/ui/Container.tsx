import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'narrow' | 'wide' | 'full';
  as?: 'div' | 'main' | 'section' | 'article';
}

const variantClasses: Record<string, string> = {
  default: 'container-main',
  narrow: 'container-main max-w-3xl',
  wide: 'container-main max-w-7xl',
  full: 'w-full px-4 sm:px-6 lg:px-8',
};

export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  variant = 'default',
  as: Component = 'div',
}) => {
  const classes = `${variantClasses[variant]} ${className}`;

  return (
    <Component className={classes}>
      {children}
    </Component>
  );
};

export default Container;