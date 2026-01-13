// components/layouts/NavbarActions.tsx (versão responsiva)
'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

const NavbarActions = ({ activeSection }) => {
  return (
    <div className="flex w-full sm:w-auto">
      {activeSection === 'restaurants' ? (
        <Link href="/restaurants/create" className="w-full sm:w-auto">
          <button className="flex items-center justify-center bg-amber-500 text-white px-3 sm:px-4 py-2.5 sm:py-2 rounded-md hover:bg-amber-600 active:bg-amber-700 transition-colors w-full sm:w-auto min-h-[44px] sm:min-h-[40px] text-sm sm:text-base font-medium">
            <Plus className="h-4 w-4 mr-1.5 sm:mr-1" />
            <span className="hidden sm:inline">Novo Restaurante</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </Link>
      ) : (
        <Link href="/lists/create" className="w-full sm:w-auto">
          <button className="flex items-center justify-center bg-amber-500 text-white px-3 sm:px-4 py-2.5 sm:py-2 rounded-md hover:bg-amber-600 active:bg-amber-700 transition-colors w-full sm:w-auto min-h-[44px] sm:min-h-[40px] text-sm sm:text-base font-medium">
            <Plus className="h-4 w-4 mr-1.5 sm:mr-1" />
            <span className="hidden sm:inline">Nova Lista</span>
            <span className="sm:hidden">Nova</span>
          </button>
        </Link>
      )}
    </div>
  );
};

export default NavbarActions;