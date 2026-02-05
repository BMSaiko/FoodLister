import { useCallback } from 'react';
import { toast } from 'react-toastify';

interface ProfileActionsOptions {
  onProfileUpdate?: (updatedProfile: any) => void;
  onImageUpload?: (file: File) => Promise<string>;
  onPrivacyToggle?: (isPublic: boolean) => Promise<boolean>;
}

interface ProfileActionsResult {
  handleCopyProfileLink: (profileId: string, profileName: string) => void;
  handleShareProfile: (profileId: string, profileName: string) => Promise<void>;
  handlePrivacyToggle: (isPublic: boolean) => Promise<void>;
  handleImageUpload: (file: File) => Promise<void>;
}

export const useProfileActions = (options: ProfileActionsOptions): ProfileActionsResult => {
  const { onProfileUpdate, onImageUpload, onPrivacyToggle } = options;

  const handleCopyProfileLink = useCallback((profileId: string, profileName: string) => {
    const profileUrl = `${window.location.origin}/users/${profileId}`;
    navigator.clipboard.writeText(profileUrl).then(() => {
      toast.success('Link do perfil copiado!');
    }).catch(() => {
      toast.error('Erro ao copiar link');
    });
  }, []);

  const handleShareProfile = useCallback(async (profileId: string, profileName: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileName} - Perfil FoodList`,
          text: `Confira o perfil de ${profileName} no FoodList!`,
          url: `${window.location.origin}/users/${profileId}`,
        });
      } catch (error) {
        console.log('Sharing failed:', error);
        handleCopyProfileLink(profileId, profileName);
      }
    } else {
      handleCopyProfileLink(profileId, profileName);
    }
  }, [handleCopyProfileLink]);

  const handlePrivacyToggle = useCallback(async (isPublic: boolean) => {
    if (!onPrivacyToggle) {
      toast.error('Função de alteração de privacidade não configurada');
      return;
    }

    try {
      const success = await onPrivacyToggle(isPublic);
      if (success) {
        toast.success(isPublic ? 'Perfil agora é público!' : 'Perfil agora é privado!');
        if (onProfileUpdate) {
          onProfileUpdate({ publicProfile: isPublic });
        }
      }
    } catch (error) {
      console.error('Error updating profile privacy:', error);
      toast.error('Erro ao atualizar privacidade do perfil');
    }
  }, [onPrivacyToggle, onProfileUpdate]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!onImageUpload) {
      toast.error('Função de upload de imagem não configurada');
      return;
    }

    try {
      const imageUrl = await onImageUpload(file);
      if (onProfileUpdate) {
        onProfileUpdate({ profileImage: imageUrl });
      }
      toast.success('Imagem atualizada com sucesso!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao atualizar imagem de perfil');
    }
  }, [onImageUpload, onProfileUpdate]);

  return {
    handleCopyProfileLink,
    handleShareProfile,
    handlePrivacyToggle,
    handleImageUpload
  };
};