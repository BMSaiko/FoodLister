import React, { useState, useEffect } from 'react';
import { ArrowUp, Share2, Copy, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface ProfileStickyNavbarProps {
  scrollThreshold?: number;
  onShare?: () => void;
  onCopyLink?: () => void;
  onEdit?: () => void;
  isSharing?: boolean;
  isCopying?: boolean;
  isEditing?: boolean;
  profile?: {
    userIdCode: string;
  };
  isOwnProfile?: boolean;
}

export default function ProfileStickyNavbar({
  scrollThreshold = 100,
  onShare,
  onCopyLink,
  onEdit,
  isSharing = false,
  isCopying = false,
  isEditing = false,
  profile,
  isOwnProfile = false
}: ProfileStickyNavbarProps) {
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
    const header = document.getElementById('profile-header');
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

  const handleShare = () => {
    if (onShare && !isSharing) {
      onShare();
    }
  };

  const handleCopyLink = () => {
    if (onCopyLink && !isCopying) {
      onCopyLink();
    }
  };

  const handleEdit = () => {
    if (onEdit && !isEditing) {
      onEdit();
    } else if (!onEdit) {
      // Default edit behavior - navigate to settings
      router.push('/users/settings');
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

          {/* Share Button - Centered */}
          <button
            onClick={handleShare}
            disabled={isSharing}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
              isSharing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-110'
            }`}
            aria-label={isSharing ? 'Compartilhando...' : 'Compartilhar perfil'}
            title={isSharing ? 'Compartilhando...' : 'Compartilhar perfil'}
          >
            {isSharing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <Share2 className="h-5 w-5" />
            )}
          </button>

          {/* Copy Link Button - Centered */}
          <button
            onClick={handleCopyLink}
            disabled={isCopying}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
              isCopying
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700 shadow-lg hover:shadow-xl transform hover:scale-110'
            }`}
            aria-label={isCopying ? 'Copiando...' : 'Copiar link do perfil'}
            title={isCopying ? 'Copiando...' : 'Copiar link do perfil'}
          >
            {isCopying ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>

          {/* Edit Profile Button - Centered (only for own profile) */}
          {isOwnProfile && (
            <button
              onClick={handleEdit}
              disabled={isEditing}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                isEditing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 shadow-lg hover:shadow-xl transform hover:scale-110'
              }`}
              aria-label={isEditing ? 'Editando...' : 'Editar perfil'}
              title={isEditing ? 'Editando...' : 'Editar perfil'}
            >
              {isEditing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <Edit className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}