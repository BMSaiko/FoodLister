import React from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface PrivacyToggleProps {
  isPublic: boolean;
  onToggle: (isPublic: boolean) => void;
  isLoading?: boolean;
  className?: string;
}

const PrivacyToggle: React.FC<PrivacyToggleProps> = ({
  isPublic,
  onToggle,
  isLoading = false,
  className = ''
}) => {
  const Icon = isPublic ? Eye : EyeOff;
  const statusText = isPublic ? 'Perfil Público' : 'Perfil Privado';
  const statusColor = isPublic ? 'text-green-600' : 'text-red-600';

  return (
    <button
      onClick={() => !isLoading && onToggle(!isPublic)}
      disabled={isLoading}
      className={`h-8 w-8 ${statusColor} transition-all duration-200 hover:scale-110 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
        isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
      title={isPublic ? 'Tornar perfil privado' : 'Tornar perfil público'}
    >
      {isLoading ? (
        <Loader2 className={`h-5 w-5 ${statusColor} animate-spin`} />
      ) : (
        <Icon className={`h-5 w-5 ${statusColor}`} />
      )}
    </button>
  );
};

export default PrivacyToggle;