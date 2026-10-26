// components/layouts/NavbarActions.tsx (versão responsiva)
'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts';
import ToviSpinner from '@/components/loading/ToviSpinner';
import Icon from '@/components/ui/icons/Icon';

const NavbarActions = ({ activeSection, showLogin = true, showSignout = true }: { activeSection: 'restaurants' | 'lists'; showLogin?: boolean; showSignout?: boolean }) => {
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full sm:w-auto min-h-[44px] sm:min-h-[40px]">
        <ToviSpinner className="h-4 w-4" />
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
          <button className="flex items-center justify-center bg-primary text-black px-3 sm:px-4 py-2.5 sm:py-2 rounded-md hover:bg-primary-hover active:bg-primary-dark transition-colors w-full sm:w-auto min-h-[44px] sm:min-h-[40px] text-sm sm:text-base font-medium">
            <Icon name="perfil" className="h-4 w-4 mr-1.5 sm:mr-1" />
            <span className="hidden sm:inline">Entrar</span>
            <span className="sm:hidden">Login</span>
          </button>
        </Link>
      </div>
    );
  }

  // User authenticated - show create button and sign out if showSignout is true
  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      {activeSection === 'restaurants' ? (
        <Link href="/restaurants/create" className="flex-1 sm:flex-none">
          <button className="flex items-center justify-center bg-primary text-black px-3 sm:px-4 py-2.5 sm:py-2 rounded-md hover:bg-primary-hover active:bg-primary-dark transition-colors w-full sm:w-auto min-h-[44px] sm:min-h-[40px] text-sm sm:text-base font-medium">
            <Icon name="mais" className="h-4 w-4 mr-1.5 sm:mr-1" />
            <span className="hidden sm:inline">Novo Restaurante</span>
            <span className="sm:hidden">+</span>
          </button>
        </Link>
      ) : (
        <Link href="/lists/create" className="flex-1 sm:flex-none">
          <button className="flex items-center justify-center bg-primary text-black px-3 sm:px-4 py-2.5 sm:py-2 rounded-md hover:bg-primary-hover active:bg-primary-dark transition-colors w-full sm:w-auto min-h-[44px] sm:min-h-[40px] text-sm sm:text-base font-medium">
            <Icon name="mais" className="h-4 w-4 mr-1.5 sm:mr-1" />
            <span className="hidden sm:inline">Nova Lista</span>
            <span className="sm:hidden">+</span>
          </button>
        </Link>
      )}
    </div>
  );
};

export default NavbarActions;
