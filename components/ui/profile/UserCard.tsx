import React from 'react';
import Link from 'next/link';
import { User, MapPin, Calendar, Star, List, Eye, EyeOff } from 'lucide-react';

interface UserCardProps {
  user: {
    id: string;
    name: string;
    profileImage?: string;
    location?: string;
    bio?: string;
    userIdCode: string;
    publicProfile: boolean;
    totalReviews: number;
    totalLists: number;
    createdAt: string;
  };
}

export default function UserCard({ user }: UserCardProps) {
  const formatJoinedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <Link
      href={`/users/${user.id}`}
      className="block bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden hover:border-amber-500/30 hover:bg-white/[0.05] transition-all duration-300 group"
    >
      <div className="p-4 sm:p-5">
        {/* Avatar + Name Row */}
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center overflow-hidden">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-7 w-7 text-amber-500/60" />
              )}
            </div>
            {/* Privacy indicator */}
            <div className="absolute -bottom-1 -right-1">
              {user.publicProfile ? (
                <Eye className="h-2.5 w-2.5 text-green-400" />
              ) : (
                <EyeOff className="h-2.5 w-2.5 text-red-400" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white/90 group-hover:text-amber-400 transition-colors truncate">
                {user.name}
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {user.userIdCode}
              </span>
            </div>

            {user.bio && (
              <p className="text-white/40 text-xs sm:text-sm line-clamp-2 mt-1 leading-relaxed">{user.bio}</p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-2">
              {user.location && (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-white/40">
                  <MapPin className="h-3 w-3" />
                  {user.location}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-white/30">
                <Calendar className="h-3 w-3" />
                Desde {formatJoinedDate(user.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4 pt-4 border-t border-white/[0.06]">
          <div className="text-center">
            <div className="text-base sm:text-lg font-bold text-orange-400">{user.totalReviews}</div>
            <div className="text-[10px] sm:text-xs text-white/30">Avaliações</div>
          </div>
          <div className="text-center">
            <div className="text-base sm:text-lg font-bold text-yellow-400">{user.totalLists}</div>
            <div className="text-[10px] sm:text-xs text-white/30">Listas</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
