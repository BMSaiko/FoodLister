import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  backLink?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
  className = '',
  backLink,
}) => {
  return (
    <div className={`page-header ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {backLink && (
              <a
                href={backLink}
                className="text-foreground-secondary hover:text-primary transition-colors p-1 -ml-1 rounded-md"
                aria-label="Voltar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </a>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-base text-foreground-secondary ml-8 sm:ml-0">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0 self-start sm:self-auto">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;