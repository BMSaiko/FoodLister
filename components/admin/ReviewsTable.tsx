'use client';

import { Trash2 } from 'lucide-react';

interface ReviewsTableProps {
  reviews: any[];
  onDelete: (id: string) => Promise<boolean>;
}

export default function ReviewsTable({ reviews, onDelete }: ReviewsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
            <th className="text-left p-3" style={{ color: 'var(--muted-foreground)' }}>Utilizador</th>
            <th className="text-left p-3" style={{ color: 'var(--muted-foreground)' }}>Rating</th>
            <th className="text-left p-3" style={{ color: 'var(--muted-foreground)' }}>Comentário</th>
            <th className="text-left p-3" style={{ color: 'var(--muted-foreground)' }}>Data</th>
            <th className="text-left p-3" style={{ color: 'var(--muted-foreground)' }}>Ação</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map(r => (
            <tr key={r.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
              <td className="p-3" style={{ color: 'var(--foreground)' }}>{r.user_name || 'Anónimo'}</td>
              <td className="p-3">{'⭐'.repeat(r.rating)}</td>
              <td className="p-3 max-w-xs truncate" style={{ color: 'var(--foreground)' }}>{r.comment || '—'}</td>
              <td className="p-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>{new Date(r.created_at).toLocaleDateString('pt-PT')}</td>
              <td className="p-3">
                <button onClick={() => onDelete(r.id)} className="p-1 rounded hover:bg-red-50 transition-colors" title="Apagar review">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

