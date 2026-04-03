/**
 * Scroll Lock Utility
 * Prevents scrolling on the document body while maintaining scroll position
 */

import { useEffect } from 'react';

let scrollPosition = 0;
let isLocked = false;

/**
 * Locks scroll and preserves current scroll position
 */
export const lockScroll = () => {
  if (isLocked) return;
  
  isLocked = true;
  scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  
  // Apply styles to prevent scrolling
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollPosition}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.overflow = 'hidden';
  document.body.style.height = '100vh';
  
  // Add a class for additional CSS control if needed
  document.body.classList.add('scroll-locked');
};

/**
 * Unlocks scroll and restores previous scroll position
 */
export const unlockScroll = () => {
  if (!isLocked) return;
  
  isLocked = false;
  
  // Remove styles
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.overflow = '';
  document.body.style.height = '';
  
  // Remove class
  document.body.classList.remove('scroll-locked');
  
  // Restore scroll position
  window.scrollTo(0, scrollPosition);
};

/**
 * Checks if scroll is currently locked
 */
export const isScrollLocked = () => isLocked;

/**
 * React hook for managing scroll lock state
 */
export const useScrollLock = (shouldLock: boolean) => {
  useEffect(() => {
    if (shouldLock) {
      lockScroll();
    } else {
      unlockScroll();
    }
    
    // Cleanup on unmount
    return () => {
      if (isLocked) {
        unlockScroll();
      }
    };
  }, [shouldLock]);
};
