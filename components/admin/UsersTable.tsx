import type { AdminUser } from '@/libs/types';
import { Shield, ShieldOff, UserX, UserCheck, ExternalLink } from 'lucide-react';
import { updateUserAdminStatus } from '@/libs/admin';
import ConfirmModal from './ConfirmModal';
import { useState } from 'react';
import Link from 'next/link';

interface UsersTableProps {
  users: AdminUser[];
  onRefresh: () => void;
}

export default function UsersTable({ users, onRefresh }: UsersTableProps) {
  const [confirmModal, setConfirmModal] = useState<{ userId: string; userName: string } | null>(null);

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    const success = await updateUserAdminStatus(userId, !currentStatus);
    if (success) onRefresh();
  };

  const handleDeactivate = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/users/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
        credentials: 'include',
      });
      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
    }
  };

  const handleReactivate = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/users/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'reactivate' }),
        credentials: 'include',
      });
      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error reactivating user:', error);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left p-4 text-xs font-medium uppercase tracking-[0.15em] text-white/30">Utilizador</th>
              <th className="text-left p-4 text-xs font-medium uppercase tracking-[0.15em] text-white/30">Reviews</th>
              <th className="text-left p-4 text-xs font-medium uppercase tracking-[0.15em] text-white/30">Listas</th>
              <th className="text-left p-4 text-xs font-medium uppercase tracking-[0.15em] text-white/30">Status</th>
              <th className="text-left p-4 text-xs font-medium uppercase tracking-[0.15em] text-white/30">Admin</th>
              <th className="text-left p-4 text-xs font-medium uppercase tracking-[0.15em] text-white/30">Criado</th>
              <th className="text-left p-4 text-xs font-medium uppercase tracking-[0.15em] text-white/30">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.user_id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="p-4">
                  <Link href={`/users/${user.user_id_code}`} className="flex items-center gap-3 group">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.display_name || 'User'} className="w-9 h-9 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-amber-500/50 transition-opacity duration-150" />
                    ) : (
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white bg-gradient-to-br from-amber-500 to-orange-500">
                        {(user.display_name || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <span className="text-white font-medium group-hover:text-amber-400 transition-colors">{user.display_name || 'Anónimo'}</span>
                      {user.is_active === false && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 uppercase tracking-wider">
                          Inativo
                        </span>
                      )}
                    </div>
                  </Link>
                </td>
                <td className="p-4 text-white/60">{user.total_reviews}</td>
                <td className="p-4 text-white/60">{user.total_lists}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.is_active !== false
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${user.is_active !== false ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    {user.is_active !== false ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => toggleAdmin(user.user_id, user.is_admin)}
                    className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                    title={user.is_admin ? 'Remover admin' : 'Tornar admin'}
                  >
                    {user.is_admin ? <Shield className="h-4 w-4 text-amber-400" /> : <ShieldOff className="h-4 w-4 text-white/20" />}
                  </button>
                </td>
                <td className="p-4 text-xs text-white/30">
                  {new Date(user.created_at).toLocaleDateString('pt-PT')}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/users/${user.user_id_code}`}
                      className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                      title="Ver detalhe"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-white/30 hover:text-blue-400" />
                    </Link>
                    {user.is_active !== false ? (
                      <button
                        onClick={() => setConfirmModal({ userId: user.user_id, userName: user.display_name || 'Utilizador' })}
                        className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                        title="Desativar utilizador"
                      >
                        <UserX className="h-3.5 w-3.5 text-white/30 hover:text-red-400" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReactivate(user.user_id)}
                        className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                        title="Reativar utilizador"
                      >
                        <UserCheck className="h-3.5 w-3.5 text-white/30 hover:text-emerald-400" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        onConfirm={() => confirmModal && handleDeactivate(confirmModal.userId)}
        title="Desativar Utilizador"
        message={`Tens a certeza que desejas desativar ${confirmModal?.userName || 'este utilizador'}? A conta será desativada mas os dados mantidos na base de dados.`}
        confirmText="Desativar"
        danger
      />
    </>
  );
}
