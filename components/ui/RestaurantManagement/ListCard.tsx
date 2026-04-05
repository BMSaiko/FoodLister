// components/ui/ListCard.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Utensils, User, Globe, Lock, ArrowRight, Trash2, Tag, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import type { List } from '@/libs/types';

interface ListCardProps {
  list: List;
  restaurantCount?: number;
  isOwner?: boolean;
  onDelete?: (listId: string) => void;
}

const ListCard = ({ list, restaurantCount = 0, isOwner = false, onDelete }: ListCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const isPublic = (list as any).is_public !== false;
  const tags = (list as any).tags as string[] | undefined;
  const coverImageUrl = (list as any).cover_image_url as string | undefined;
  const createdDate = new Date(list.created_at).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/lists/${list.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete list');
      }

      toast.success('Lista eliminada com sucesso!');
      onDelete?.(list.id);
    } catch (error: any) {
      console.error('Error deleting list:', error);
      toast.error(error.message || 'Erro ao eliminar lista');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  return (
    <div className="group relative h-full">
      <Link href={`/lists/${list.id}`} className="block h-full">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full w-full flex flex-col border border-gray-100">
          {/* Cover image if available */}
          {coverImageUrl && (
            <div className="relative h-32 overflow-hidden">
              <img 
                src={coverImageUrl} 
                alt={list.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-2 left-3 flex items-center gap-1 text-white text-xs">
                <ImageIcon className="h-3 w-3" />
                <span>Capa personalizada</span>
              </div>
            </div>
          )}
          
          {/* Top section with icon and badge */}
          <div className={`p-4 sm:p-5 ${coverImageUrl ? 'pt-3' : 'pb-0'}`}>
            <div className="flex justify-between items-start mb-3">
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-3 w-12 h-12 flex items-center justify-center shadow-sm">
                <Utensils className="h-5 w-5 text-amber-600" />
              </div>
              
              <div className="flex items-center gap-1">
                {/* Privacy indicator */}
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${
                  isPublic 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' 
                    : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700'
                }`}>
                  {isPublic ? (
                    <><Globe className="h-3 w-3" /> Pública</>
                  ) : (
                    <><Lock className="h-3 w-3" /> Privada</>
                  )}
                </span>
                
                {/* Delete button for owners */}
                {isOwner && (
                  <button
                    onClick={handleDeleteClick}
                    className="p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar lista"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Content section */}
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex-grow flex flex-col">
            <h3 className="font-bold text-base sm:text-lg text-gray-800 line-clamp-1 group-hover:text-amber-600 transition-colors">
              {list.name}
            </h3>
            <p className="text-gray-500 mt-2 flex-grow text-sm sm:text-base line-clamp-2 leading-relaxed">
              {list.description || 'Sem descrição'}
            </p>
            
            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.slice(0, 3).map((tag: string, index: number) => (
                  <span 
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium"
                  >
                    <Tag className="h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="text-xs text-gray-500 px-1">+{tags.length - 3}</span>
                )}
              </div>
            )}
            
            {/* Bottom section with stats */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                    {restaurantCount} {restaurantCount === 1 ? 'restaurante' : 'restaurantes'}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>{createdDate}</span>
                </div>
                
                {list.creator && (
                  <div className="flex items-center text-xs text-gray-500">
                    <User className="h-3 w-3 mr-1 text-gray-400" />
                    <span className="truncate max-w-[120px]">{list.creator}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Hover indicator */}
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
            <div className="flex items-center text-amber-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Ver lista <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </div>
        </div>
      </Link>
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 rounded-full p-2">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-800">Eliminar Lista</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Tem a certeza que deseja eliminar a lista <strong>"{list.name}"</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'A eliminar...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListCard;
