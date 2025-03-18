// components/layouts/NavbarActions.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

const NavbarActions = ({ activeSection }) => {
  return (
    <div className="flex">
      {activeSection === 'restaurants' ? (
        <Link href="/restaurants/create">
          <button className="flex items-center bg-amber-500 text-white px-3 py-2 rounded hover:bg-amber-600 transition-colors">
            <Plus className="h-4 w-4 mr-1" />
            <span className="text-sm">Novo Restaurante</span>
          </button>
        </Link>
      ) : (
        <Link href="/lists/create">
          <button className="flex items-center bg-amber-500 text-white px-3 py-2 rounded hover:bg-amber-600 transition-colors">
            <Plus className="h-4 w-4 mr-1" />
            <span className="text-sm">Nova Lista</span>
          </button>
        </Link>
      )}
    </div>
  );
};

export default NavbarActions;