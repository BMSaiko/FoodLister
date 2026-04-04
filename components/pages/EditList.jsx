// components/pages/EditList.jsx
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'contexts';
import { useSession } from 'hooks/auth/useSession';
import { useListForm } from 'hooks/forms/useListForm';
import Navbar from 'components/ui/navigation/Navbar';
import ListForm from 'components/lists/ListForm';
import { toast } from 'react-toastify';

function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Você precisa estar logado para editar listas.', { 
        position: "top-center", 
        autoClose: 3000, 
        theme: "light" 
      });
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return children;
}

export default function EditList({ listId }) {
  return (
    <AuthGuard>
      <EditListContent listId={listId} />
    </AuthGuard>
  );
}

function EditListContent({ listId }) {
  const router = useRouter();
  const { user } = useAuth();
  const { session } = useSession();

  const {
    formData,
    selectedRestaurants,
    loading,
    saving,
    error,
    setFormData,
    addRestaurant,
    removeRestaurant,
    saveList,
    getAvailableRestaurants
  } = useListForm({
    listId,
    onSuccess: () => {
      router.push(`/lists/${listId}`);
    }
  });

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para editar uma lista.', { 
        position: "top-center", 
        autoClose: 4000, 
        theme: "light" 
      });
      router.push('/auth/signin');
      return;
    }

    const displayName = session?.user?.email || user?.email || 'Usuário';
    await saveList(user.id, displayName, true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50/30">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded-xl w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded-xl w-full"></div>
              <div className="h-4 bg-gray-200 rounded-xl w-full"></div>
              <div className="h-4 bg-gray-200 rounded-xl w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ListForm
      mode="edit"
      formData={formData}
      selectedRestaurants={selectedRestaurants}
      loading={loading}
      saving={saving}
      error={error}
      backLink={`/lists/${listId}`}
      backText="Voltar para Detalhes da Lista"
      onFormChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
      onSubmit={handleSubmit}
      onAddRestaurant={addRestaurant}
      onRemoveRestaurant={removeRestaurant}
      availableRestaurants={getAvailableRestaurants('')}
    />
  );
}