import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopButtonProps {
  className?: string;
  scrollThreshold?: number;
  smooth?: boolean;
}

export default function ScrollToTopButton({
  className = '',
  scrollThreshold = 100,
  smooth = true
}: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Component mounted log
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    }

    // Check initial mobile state
    const checkMobile = () => {
      const mobile = typeof window !== 'undefined' && window.innerWidth < 768;
      setIsMobile(mobile);
    };

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const isVisibleNow = scrollTop > scrollThreshold;
      setIsVisible(isVisibleNow);
      
      // Debug logging
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      }
    };

    // Initial checks
    checkMobile();
    handleScroll();

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, [scrollThreshold]);

  // Hide completely on mobile
  if (isMobile) {
    return null;
  }

  const scrollToTop = () => {
    if (smooth) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo(0, 0);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToTop();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollToTop();
    }
  };

  // Only render when visible to prevent layout issues
  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
      className={`
        fixed
        bottom-6
        right-6
        z-50
        hidden
        sm:hidden
        md:flex
        md:items-center
        md:justify-center
        lg:flex
        xl:flex
        w-14
        h-14
        bg-amber-500
        hover:bg-amber-600
        text-white
        rounded-full
        shadow-lg
        cursor-pointer
        transition-all
        duration-300
        ease-in-out
        transform
        hover:scale-110
        hover:shadow-xl
        focus:outline-none
        focus:ring-4
        focus:ring-amber-300
        ${className}
      `}
    >
      <ArrowUp className="w-6 h-6" />
    </button>
  );
}