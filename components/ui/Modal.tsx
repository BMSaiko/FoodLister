'use client';

import { useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import { createPortal } from 'react-dom';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
type ModalVariant = 'dialog' | 'bottom-sheet' | 'full-screen';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: ModalSize;
  variant?: ModalVariant;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  className?: string;
  ariaLabel?: string;
}

const SIZE_MAP: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

export default function Modal({
  isOpen,
  onClose,
  children,
  size = 'md',
  variant = 'dialog',
  closeOnBackdrop = true,
  closeOnEsc = true,
  className = '',
  ariaLabel = 'Dialog',
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const scrollYRef = useRef(0);

  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  useEffect(() => {
    if (isOpen && !visible) {
      setVisible(true);
      setClosing(false);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = useCallback(() => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
      onClose();
    }, 150);
  }, [closing, onClose]);

  useEffect(() => {
    if (!visible || !closeOnEsc) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); handleClose(); }
    };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [visible, closeOnEsc, handleClose]);

  useEffect(() => {
    if (visible) {
      scrollYRef.current = window.scrollY;
      document.body.style.cssText = `position:fixed;top:-${scrollYRef.current}px;left:0;right:0;overflow:hidden`;
      return () => {
        document.body.style.cssText = '';
        window.scrollTo(0, scrollYRef.current);
      };
    }
  }, [visible]);

  useEffect(() => {
    const el = document.querySelector('main');
    if (!el) return;
    if (visible) { el.setAttribute('aria-hidden', 'true'); el.setAttribute('inert', ''); }
    else { el.removeAttribute('aria-hidden'); el.removeAttribute('inert'); }
    return () => { el.removeAttribute('aria-hidden'); el.removeAttribute('inert'); };
  }, [visible]);

  if (!mounted || !visible) return null;

  const isFull = variant === 'full-screen';
  const isSheet = variant === 'bottom-sheet';
  const animIn = isSheet ? 'sheetIn 300ms cubic-bezier(0.16,1,0.3,1)' : 'modalIn 200ms ease-out';
  const animOut = isSheet ? 'sheetOut 150ms ease-in forwards' : 'modalOut 150ms ease-in forwards';
  const bdIn = 'backdropIn 200ms ease-out';
  const bdOut = 'backdropOut 150ms ease-in forwards';

  const position = isFull
    ? 'inset-0'
    : isSheet
      ? 'items-end justify-center md:items-center md:justify-center'
      : 'items-center justify-center';

  const panelRadius = isFull ? '' : isSheet ? 'rounded-t-3xl md:rounded-3xl' : 'rounded-3xl';
  const sizeClass = isFull ? 'w-full h-full' : `w-full ${SIZE_MAP[size]}`;
  const maxH = isFull ? '' : 'max-h-[85vh] md:max-h-[90vh]';

  const dragHandle = isSheet ? (
    <div className="flex justify-center pt-2 pb-1 md:hidden">
      <div className="w-10 h-1 rounded-full bg-white/20" />
    </div>
  ) : null;

  const fullScreenOverflow = isFull ? "overflow-visible" : "overflow-auto";

  // Backdrop click: only close if closeOnBackdrop is true AND click was on backdrop itself
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (!closeOnBackdrop) return;
    // Only close if the click target IS the backdrop (not a child that bubbled up)
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const portal = (
    <div className={`fixed inset-0 z-50 flex ${position} ${isFull ? '' : 'p-0 md:p-4'}`}>
      {/* Backdrop — z-0 (below content) */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        style={{ animation: closing ? bdOut : bdIn }}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Content — z-20 (above backdrop, receives pointer events) */}
      {isFull ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          className={`relative z-20 w-full h-full ${fullScreenOverflow} ${className}`}
          style={{ animation: closing ? animOut : animIn }}
        >
          {children}
        </div>
      ) : (
        <div
          className={`relative z-20 ${sizeClass} p-1.5 ${panelRadius}`}
          style={{ animation: closing ? animOut : animIn }}
        >
          <div className={`absolute inset-0 ${panelRadius} bg-white/[0.02] ring-1 ring-white/[0.08] backdrop-blur-xl`} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            className={`relative rounded-[calc(1.5rem-0.375rem)] bg-gradient-to-br from-[#0a0a0a] to-[#111111] overflow-y-auto ${maxH} ${className}`}
          >
            {dragHandle}
            {children}
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(portal, document.body);
}
