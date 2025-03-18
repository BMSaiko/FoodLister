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
          <button className="flex items-center justify-center bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition-colors w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-1" />
            <span className="text-sm">Novo Restaurante</span>
          </button>
        </Link>
      ) : (
        <Link href="/lists/create" className="w-full sm:w-auto">
          <button className="flex items-center justify-center bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition-colors w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-1" />
            <span className="text-sm">Nova Lista</span>
          </button>
        </Link>
      )}
    </div>
  );
};

export default NavbarActions;