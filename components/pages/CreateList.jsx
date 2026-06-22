"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "contexts";
import { useSession } from "hooks/auth/useSession";
import { useListForm } from "hooks/forms/useListForm";
import Navbar from "components/ui/navigation/Navbar";
import ListForm from "components/lists/ListForm";
import { toast } from "react-toastify";

export default function CreateList() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { session } = useSession();
  const [showCelebration, setShowCelebration] = useState(false);

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
      setShowCelebration(true);
      // Redirect after celebration
      setTimeout(() => {
        router.push(`/lists/${listId}`);
      }, 2500);
    }
  });

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Precisa de estar autenticado para criar listas.", {
        position: "top-center",
        autoClose: 3000,
        theme: "dark"
      });
      router.push("/auth/signin");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Precisa de estar autenticado para criar uma lista.", {
        position: "top-center",
        autoClose: 4000,
        theme: "dark"
      });
      router.push("/auth/signin");
      return;
    }
    const displayName = session?.user?.email || user?.email || "Utilizador";
    await saveList(user.id, displayName, false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
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
        availableRestaurants={getAvailableRestaurants("")}
      />
    </>
  );
}
