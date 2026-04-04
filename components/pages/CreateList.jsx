// components/pages/CreateList.jsx
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'contexts';
import { useSession } from 'hooks/auth/useSession';
import { useListForm } from 'hooks/forms/useListForm';
import Navbar from 'components/ui/navigation/Navbar';
import ListForm from 'components/lists/ListForm';
import { toast } from 'react-toastify';

export default function CreateList() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
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
    onSuccess: (listId) => {
      router.push(`/lists/${listId}`);
    }
  });

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Você precisa estar logado para criar listas.', {
        position: "top-center",
        autoClose: 3000,
        theme: "light"
      });
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para criar uma lista.', { 
        position: "top-center", 
        autoClose: 4000, 
        theme: "light" 
      });
      router.push('/auth/signin');
      return;
    }

    // Get user display name from session or email
    const displayName = session?.user?.email || user?.email || 'Usuário';
    await saveList(user.id, displayName, false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <ListForm
        mode="create"
        formData={formData}
        selectedRestaurants={selectedRestaurants}
        loading={loading}
        saving={saving}
        error={error}
        backLink="/lists"
        backText="Voltar para Listas"
        onFormChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
        onSubmit={handleSubmit}
        onAddRestaurant={addRestaurant}
        onRemoveRestaurant={removeRestaurant}
        availableRestaurants={getAvailableRestaurants('')}
      />
    </>
  );
}