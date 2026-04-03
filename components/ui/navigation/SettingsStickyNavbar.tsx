import React, { useState, useEffect } from 'react';
import { ArrowUp, Save, ArrowLeft, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SettingsStickyNavbarProps {
  scrollThreshold?: number;
  onSave?: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  profile?: {
    userIdCode: string;
  };
}

export default function SettingsStickyNavbar({
  scrollThreshold = 100,
  onSave,
  onCancel,
  isSubmitting = false,
  profile
}: SettingsStickyNavbarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Create intersection observer for the header section
    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        // Show scroll button when we're not at the top
        setIsVisible(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      }
    );

    // Observe the header (top section)
    const header = document.getElementById('settings-header');
    if (header) {
      headerObserver.observe(header);
    }

    // Also listen to scroll events for better responsiveness
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsVisible(scrollTop > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      headerObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollThreshold]);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const handleSave = () => {
    if (onSave && !isSubmitting) {
      onSave();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
      <div className="max-w-md mx-auto px-4 py-2">
        {/* Horizontal scrollable container for buttons */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
          {/* Scroll Button - Far Left */}
          <button
            onClick={handleScrollToTop}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 transform hover:scale-110 ${
              isVisible
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-100 text-gray-400 shadow-sm'
            } ${isVisible ? 'animate-bounce' : ''}`}
            aria-label="Voltar ao topo"
            title="Voltar ao topo"
            style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(10px)' }}
          >
            <ArrowUp className="h-5 w-5" />
          </button>

          {/* Spacer to center the remaining buttons */}
          <div className="flex-1"></div>

          {/* Back Button - Centered */}
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-12 h-12 bg-gray-100 text-gray-700 border border-gray-200 rounded-full hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
            aria-label="Voltar"
            title="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Save Button - Centered */}
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
              isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 shadow-lg hover:shadow-xl transform hover:scale-110'
            }`}
            aria-label={isSubmitting ? 'Salvando...' : 'Salvar alterações'}
            title={isSubmitting ? 'Salvando...' : 'Salvar alterações'}
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <Save className="h-5 w-5" />
            )}
          </button>

          {/* View Public Profile Button - Centered */}
          {profile && (
            <Link
              href={`/users/${profile.userIdCode}`}
              className="flex items-center justify-center w-12 h-12 bg-gray-100 text-gray-700 border border-gray-200 rounded-full hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
              aria-label="Ver Perfil Público"
              title="Ver Perfil Público"
            >
              <Eye className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
