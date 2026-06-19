'use client';

import type { AdminUser } from '@/libs/types';
import { Shield, ShieldOff } from 'lucide-react';
import { updateUserAdminStatus } from '@/libs/admin';

interface UsersTableProps {
  users: AdminUser[];
  onRefresh: () => void;
}

export default function UsersTable({ users, onRefresh }: UsersTableProps) {
  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    await updateUserAdminStatus(userId, !currentStatus);
    onRefresh();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
            <th className="text-left p-3" style={{ color: 'var(--muted-foreground)' }}>Utilizador</th>
            <th className="text-left p-3" style={{ color: 'var(--muted-foreground)' }}>Reviews</th>
            <th className="text-left p-3" style={{ color: 'var(--muted-foreground)' }}>Listas</th>
            <th className="text-left p-3" style={{ color: 'var(--muted-foreground)' }}>Verificado</th>
            <th className="text-left p-3" style={{ color: 'var(--muted-foreground)' }}>Admin</th>
            <th className="text-left p-3" style={{ color: 'var(--muted-foreground)' }}>Criado</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.user_id} className="border-b" style={{ borderColor: 'var(--border)' }}>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                    {(user.display_name || '?')[0].toUpperCase()}
                  </div>
                  <span style={{ color: 'var(--foreground)' }}>{user.display_name || 'Anónimo'}</span>
                </div>
              </td>
              <td className="p-3" style={{ color: 'var(--foreground)' }}>{user.total_reviews}</td>
              <td className="p-3" style={{ color: 'var(--foreground)' }}>{user.total_lists}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded-full text-xs ${user.is_verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {user.is_verified ? '✓' : '✗'}
                </span>
              </td>
              <td className="p-3">
                <button onClick={() => toggleAdmin(user.user_id, user.is_admin)} className="p-1 rounded hover:opacity-70 transition-opacity" title={user.is_admin ? 'Remover admin' : 'Tornar admin'}>
                  {user.is_admin ? <Shield className="h-4 w-4 text-amber-500" /> : <ShieldOff className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />}
                </button>
              </td>
              <td className="p-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {new Date(user.created_at).toLocaleDateString('pt-PT')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

