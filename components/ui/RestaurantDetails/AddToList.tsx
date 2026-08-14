"use client";

// T75: adicionar o restaurante a uma das listas do user (owner / editor / admin).
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/libs/supabase/client";
import { ListPlus, Check, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import { usePublicApiClient } from "@/hooks/auth/usePublicApiClient";

interface AddToListProps {
  restaurantId: string;
  isAdmin?: boolean;
  /** IDs das listas que jah contem este restaurante (para marcar em vez de repetir POST) */
  existingListIds?: string[];
}

interface EditableList {
  id: string;
  name: string;
}

interface MenuPosition {
  top: number;
  right: number;
}

export default function AddToList({ restaurantId, isAdmin, existingListIds }: AddToListProps) {
  const supabase = createClient();
  const { post } = usePublicApiClient();
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<EditableList[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [pos, setPos] = useState<MenuPosition | null>(null);
  const [filter, setFilter] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora do botao (o menu renderizado por portal nao faz parte do DOM do botao).
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const inMenu = menuRef.current && menuRef.current.contains(e.target as Node);
      if (!inMenu && ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Reposiciona se a pagina desloca enquanto o menu esta aberto.
  useEffect(() => {
    if (!open) return;
    const onScroll = () => position();
    const onResize = () => position();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const position = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
  };

  const loadLists = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id;
      if (!uid) { setLists([]); return; }

      if (isAdmin) {
        // admin: todas as listas (mig 206 alarga lists_select a current_user_is_admin)
        const { data: all } = await supabase.from("lists").select("id, name").order("name");
        setLists((all || []).map((l: any) => ({ id: l.id, name: l.name })));
        return;
      }

      // owner: listas que criei
      const { data: own } = await supabase
        .from("lists")
        .select("id, name")
        .eq("creator_id", uid);

      // editor: listas onde sou colaborador com role=editor (RLS permite user_id=auth.uid())
      const { data: collabs } = await supabase
        .from("list_collaborators")
        .select("list_id, lists(id, name)")
        .eq("user_id", uid);

      const collabLists: EditableList[] = (collabs || [])
        .filter((c: any) => c.lists)
        .map((c: any) => c.lists as EditableList);

      // merge own + editor collabs, dedup por id
      const seen = new Set<string>();
      const merged: EditableList[] = [];
      [...(own || []), ...collabLists].forEach((l) => {
        if (l && l.id && !seen.has(l.id)) { seen.add(l.id); merged.push(l); }
      });
      setLists(merged);
    } catch (e) {
      toast.error("Erro ao carregar listas");
    } finally { setLoading(false); }
  };

  const toggle = () => {
    if (!open) {
      position();
      setFilter("");
      if (lists.length === 0) loadLists();
    }
    setOpen(!open);
  };

  const addToList = async (listId: string) => {
    if (adding) return;
    setAdding(listId);
    try {
      const res = await post(`/api/lists/${listId}/restaurants`, { restaurantId });
      if (res.status === 201) {
        toast.success("Adicionado a lista");
        // marcar como existente localmente
        setLists((prev) => prev);
      } else if (res.status === 409) {
        toast.info("Ja esta nesta lista");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Erro ao adicionar");
      }
    } catch (e) {
      toast.error("Erro ao adicionar a lista");
    } finally { setAdding(null); }
  };

  const alreadyIn = (listId: string) => existingListIds?.includes(listId);

  const menu = open && pos ? (
    <div
      ref={menuRef}
      className="fixed z-[1000] w-64 max-h-80 rounded-2xl bg-[#0a0a0a] ring-1 ring-white/[0.1] shadow-2xl p-2 flex flex-col"
      style={{ top: pos.top, right: pos.right }}
      role="menu"
    >
      {loading ? (
        <p className="px-3 py-2 text-sm text-white/40">A carregar...</p>
      ) : (
        <>
          {lists.length > 0 && (
            <div className="px-1 pb-2">
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filtrar listas..."
                className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.1] text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
              />
            </div>
          )}
          <div className="overflow-y-auto max-h-64">
          {(() => {
            const q = filter.trim().toLowerCase();
            const visible = q ? lists.filter((l) => l.name.toLowerCase().includes(q)) : lists;
            if (visible.length === 0) {
              return <p className="px-3 py-2 text-sm text-white/40">Nenhuma lista corresponde</p>;
            }
            return visible.map((l) => (
          <button
            key={l.id}
            role="menuitem"
            disabled={!!adding}
            onClick={() => addToList(l.id)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-colors text-left"
          >
            <span className="flex-1 text-sm text-white/80 truncate">{l.name}</span>
            {alreadyIn(l.id) ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1"><Check className="h-3.5 w-3.5" />Na lista</span>
            ) : adding === l.id ? (
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : null}
          </button>
          ));
          })()}
          </div>
        </>
      )}
    </div>
  ) : null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] text-white/80 hover:bg-white/[0.12] transition-all duration-200 text-sm font-medium min-h-[44px] hover:scale-105"
      >
        <ListPlus className="h-4 w-4" /><span className="hidden sm:inline">Listas</span><ChevronDown className="h-3.5 w-3.5" />
      </button>

      {createPortal(menu, document.body)}
    </div>
  );
}
