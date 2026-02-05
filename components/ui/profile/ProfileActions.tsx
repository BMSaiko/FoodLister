import React from 'react';
import { Copy, Share2, Edit } from 'lucide-react';
import { toast } from 'react-toastify';

interface ProfileActionsProps {
  profile: {
    id: string;
    name: string;
  };
  isOwnProfile: boolean;
  onEdit?: () => void;
  className?: string;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({
  profile,
  isOwnProfile,
  onEdit,
  className = ''
}) => {
  const [copySuccess, setCopySuccess] = React.useState(false);

  const handleCopyProfileLink = () => {
    const profileUrl = `${window.location.origin}/users/${profile.id}`;
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopySuccess(true);
      toast.success('Link do perfil copiado!');
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleShareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} - Perfil FoodList`,
          text: `Confira o perfil de ${profile.name} no FoodList!`,
          url: `${window.location.origin}/users/${profile.id}`,
        });
      } catch (error) {
        console.log('Sharing failed:', error);
      }
    } else {
      handleCopyProfileLink();
    }
  };

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <button
        onClick={handleCopyProfileLink}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <Copy className="h-4 w-4" />
        <span>{copySuccess ? 'Copiado!' : 'Copiar Link'}</span>
      </button>
      
      <button
        onClick={handleShareProfile}
        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
      >
        <Share2 className="h-4 w-4" />
        <span>Compartilhar</span>
      </button>

      {isOwnProfile && onEdit && (
        <button
          onClick={onEdit}
          className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Edit className="h-4 w-4" />
          <span>Editar Perfil</span>
        </button>
      )}
    </div>
  );
};

export default ProfileActions;