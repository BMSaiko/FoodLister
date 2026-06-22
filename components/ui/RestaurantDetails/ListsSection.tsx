import React from "react";
import { ListChecks } from "lucide-react";
import Link from "next/link";

interface ListsSectionProps {
  lists: any[];
}

export default function ListsSection({ lists }: ListsSectionProps) {
  if (!lists || lists.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Listas</h2>
      <div className="space-y-2">
        {lists.map((list) => (
          <Link
            key={list.id}
            href={"/lists/" + list.id}
            className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-2xl ring-1 ring-white/[0.06] hover:bg-white/[0.05] transition-colors duration-150"
          >
            <div className="bg-amber-500/10 rounded-xl p-2.5 flex-shrink-0">
              <ListChecks className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80 truncate">{list.name}</p>
              {list.description && (
                <p className="text-xs text-white/40 truncate mt-0.5">{list.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
