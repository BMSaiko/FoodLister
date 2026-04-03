import React from 'react';
import { User, MapPin, Globe, Calendar, Eye, EyeOff, Camera, Shield, CheckCircle } from 'lucide-react';
import PrivacyToggle from './PrivacyToggle';
import ProfileActions from './ProfileActions';

interface UserProfileHeaderProps {
  profile: {
    id: string;
    userIdCode: string;
    name: string;
    profileImage?: string;
    location?: string;
    bio?: string;
    website?: string;
    publicProfile: boolean;
    createdAt: string;
    stats?: {
      totalRestaurantsVisited: number;
      totalReviews: number;
      totalLists: number;
      totalRestaurantsAdded: number;
      joinedDate: string;
    };
  };
  isOwnProfile: boolean;
  onPrivacyToggle?: (isPublic: boolean) => void;
  onImageUpload?: (file: File) => void;
  isLoading?: boolean;
  className?: string;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  profile,
  isOwnProfile,
  onPrivacyToggle,
  onImageUpload,
  isLoading = false,
  className = ''
}) => {
  const formatJoinedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 ${className}`}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Profile Image and Basic Info */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6">
          <div className="lg:w-32 lg:h-32 w-24 h-24 relative flex-shrink-0">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 to-orange-400 shadow-xl flex items-center justify-center overflow-hidden ring-4 ring-white">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 sm:h-16 sm:w-16 text-white opacity-80" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{profile.name}</h2>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                  <User className="h-4 w-4 mr-1.5" />
                  {profile.userIdCode}
                </span>
                {isOwnProfile && onPrivacyToggle && (
                  <PrivacyToggle
                    isPublic={profile.publicProfile}
                    onToggle={onPrivacyToggle}
                    isLoading={isLoading}
                  />
                )}
              </div>
            </div>
            
            {profile.bio && (
              <p className="text-gray-700 mb-3 line-clamp-3 text-sm sm:text-base">{profile.bio}</p>
            )}
            
            <div className="flex flex-wrap gap-2">
              {profile.location && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs sm:text-sm bg-gray-100 text-gray-700">
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs sm:text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                >
                  <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                  Website
                </a>
              )}
              {profile.stats?.joinedDate && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs sm:text-sm bg-green-100 text-green-700">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                  Membro desde {formatJoinedDate(profile.stats.joinedDate)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats - Mobile optimized */}
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-3 sm:p-4 border border-amber-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Restaurantes Visitados</p>
                <p className="text-xl sm:text-2xl font-bold text-amber-600">{profile.stats?.totalRestaurantsVisited ?? 0}</p>
              </div>
              <User className="h-6 sm:h-8 w-6 sm:w-8 text-amber-500 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 sm:p-4 border border-orange-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Avaliações</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-600">{profile.stats?.totalReviews ?? 0}</p>
              </div>
              <User className="h-6 sm:h-8 w-6 sm:w-8 text-orange-500 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-3 sm:p-4 border border-yellow-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Listas Criadas</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">{profile.stats?.totalLists ?? 0}</p>
              </div>
              <User className="h-6 sm:h-8 w-6 sm:w-8 text-yellow-500 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-3 sm:p-4 border border-green-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Restaurantes Adicionados</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{profile.stats?.totalRestaurantsAdded ?? 0}</p>
              </div>
              <User className="h-6 sm:h-8 w-6 sm:w-8 text-green-500 opacity-80" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {isOwnProfile && (
        <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6">
          <ProfileActions
            profile={profile}
            isOwnProfile={isOwnProfile}
          />
        </div>
      )}
    </div>
  );
};

export default UserProfileHeader;