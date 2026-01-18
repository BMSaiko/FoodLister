// components/layouts/NavbarActions.tsx (versão responsiva)
'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/contexts';

const NavbarActions = ({ activeSection, showLogin = true, showSignout = true }) => {
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full sm:w-auto min-h-[44px] sm:min-h-[40px]">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!user) {
    // User not authenticated - show sign in button only if showLogin is true
    if (!showLogin) {
      return null;
    }
    return (
      <div className="flex w-full sm:w-auto">
        <Link href="/auth/signin" className="w-full sm:w-auto">
          <button className="flex items-center justify-center bg-amber-500 text-white px-3 sm:px-4 py-2.5 sm:py-2 rounded-md hover:bg-amber-600 active:bg-amber-700 transition-colors w-full sm:w-auto min-h-[44px] sm:min-h-[40px] text-sm sm:text-base font-medium">
            <User className="h-4 w-4 mr-1.5 sm:mr-1" />
            <span className="hidden sm:inline">Entrar</span>
            <span className="sm:hidden">Login</span>
          </button>
        </Link>
      </div>
    );
  }

  // User authenticated - show create button, profile button and sign out if showSignout is true
  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      {activeSection === 'restaurants' ? (
        <Link href="/restaurants/create" className="flex-1 sm:flex-none">
          <button className="flex items-center justify-center bg-amber-500 text-white px-3 sm:px-4 py-2.5 sm:py-2 rounded-md hover:bg-amber-600 active:bg-amber-700 transition-colors w-full sm:w-auto min-h-[44px] sm:min-h-[40px] text-sm sm:text-base font-medium">
            <Plus className="h-4 w-4 mr-1.5 sm:mr-1" />
            <span className="hidden sm:inline">Novo Restaurante</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </Link>
      ) : (
        <Link href="/lists/create" className="flex-1 sm:flex-none">
          <button className="flex items-center justify-center bg-amber-500 text-white px-3 sm:px-4 py-2.5 sm:py-2 rounded-md hover:bg-amber-600 active:bg-amber-700 transition-colors w-full sm:w-auto min-h-[44px] sm:min-h-[40px] text-sm sm:text-base font-medium">
            <Plus className="h-4 w-4 mr-1.5 sm:mr-1" />
            <span className="hidden sm:inline">Nova Lista</span>
            <span className="sm:hidden">Nova</span>
          </button>
        </Link>
      )}
      <Link href="/profile" className="flex-shrink-0">
        <button className="flex items-center justify-center bg-gray-100 text-gray-700 px-3 sm:px-4 py-2.5 sm:py-2 rounded-md hover:bg-gray-200 active:bg-gray-300 transition-colors min-h-[44px] sm:min-h-[40px] text-sm sm:text-base font-medium" title="Configurações">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline ml-1.5">Perfil</span>
        </button>
      </Link>
      {showSignout && (
        <button
          onClick={handleSignOut}
          className="flex items-center justify-center bg-gray-100 text-gray-700 px-3 sm:px-4 py-2.5 sm:py-2 rounded-md hover:bg-gray-200 active:bg-gray-300 transition-colors min-h-[44px] sm:min-h-[40px] text-sm sm:text-base font-medium"
          title="Sair"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline ml-1.5">Sair</span>
        </button>
      )}
    </div>
  );
};

export default NavbarActions;
