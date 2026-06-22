"use client";

import React from "react";
import { User, MapPin, Globe, Calendar, Copy, Share2, Edit, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

interface UserProfileHeaderProps {
  name: string;
  userIdCode: string;
  profileImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedDate?: string;
  isPublic: boolean;
  isOwnProfile: boolean;
  onCopyLink: () => void;
  onShare: () => void;
  onPrivacyToggle: () => void;
  copySuccess: boolean;
  isUpdatingPrivacy: boolean;
}

export default function UserProfileHeader({
  name, userIdCode, profileImage, bio, location, website, joinedDate,
  isPublic, isOwnProfile, onCopyLink, onShare, onPrivacyToggle, copySuccess, isUpdatingPrivacy
}: UserProfileHeaderProps) {
  // Generate gradient from name hash
  const getGradient = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const h1 = Math.abs(hash % 360);
    const h2 = (h1 + 60) % 360;
    return `linear-gradient(135deg, hsl(${h1},50%,12%) 0%, hsl(${h2},40%,10%) 100%)`;
  };

  return (
    <section className="relative mb-6">
      {/* Cover */}
      <div className="w-full h-32 md:h-44 rounded-3xl overflow-hidden relative" style={{ background: getGradient(name) }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/60 to-transparent" />
        {/* Decorative orbs */}
        <div className="absolute top-4 right-8 w-24 h-24 bg-purple-500/[0.08] rounded-full blur-2xl" />
        <div className="absolute bottom-4 left-8 w-20 h-20 bg-pink-500/[0.06] rounded-full blur-2xl" />
      </div>

      {/* Avatar + Info */}
      <div className="px-4 md:px-6 -mt-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-white/[0.03] ring-4 ring-[#050505] overflow-hidden shadow-xl">
              {profileImage ? (
                <img src={profileImage} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <User className="h-10 w-10 text-white/20" />
                </div>
              )}
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-[#050505]" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{name}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.06] border border-white/[0.08] text-white/40 uppercase tracking-wider">
                {userIdCode}
              </span>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-white/35">
              {location && (
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{location}</span>
              )}
              {website && (
                <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-purple-400/70 hover:text-purple-400 transition-colors">
                  <Globe className="h-3.5 w-3.5" />Website
                </a>
              )}
              {joinedDate && (
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Membro desde {new Date(joinedDate).toLocaleDateString("pt-PT", { month: "short", year: "numeric" })}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isOwnProfile && (
              <Link href="/users/settings" className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/15 text-purple-400 rounded-xl hover:bg-purple-500/25 transition-all text-sm font-medium min-h-[44px]">
                <Edit className="h-4 w-4" /><span className="hidden sm:inline">Editar</span>
              </Link>
            )}
            <button onClick={onCopyLink} className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] text-white/55 rounded-xl hover:bg-white/[0.08] transition-all text-sm font-medium min-h-[44px]">
              <Copy className="h-4 w-4" /><span className="hidden sm:inline">{copySuccess ? "Copiado!" : "Copiar"}</span>
            </button>
            <button onClick={onShare} className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] text-white/55 rounded-xl hover:bg-white/[0.08] transition-all text-sm font-medium min-h-[44px]">
              <Share2 className="h-4 w-4" /><span className="hidden sm:inline">Partilhar</span>
            </button>
          </div>
        </div>

        {/* Bio */}
        {bio && (
          <p className="text-sm text-white/45 mt-4 max-w-2xl leading-relaxed">{bio}</p>
        )}

        {/* Privacy toggle (own profile) */}
        {isOwnProfile && (
          <button
            onClick={onPrivacyToggle}
            disabled={isUpdatingPrivacy}
            className={`mt-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              isPublic
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            } disabled:opacity-50`}
          >
            {isPublic ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            {isPublic ? "Perfil Publico" : "Perfil Privado"}
          </button>
        )}
      </div>
    </section>
  );
}
