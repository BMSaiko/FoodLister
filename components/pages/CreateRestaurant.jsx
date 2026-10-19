// components/pages/CreateRestaurant.jsx
// Refactored: Now uses shared RestaurantForm component
"use client";

import { useAuthUser } from '@/hooks/auth/useAuthUser';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import RestaurantForm from '@/components/restaurant/RestaurantForm';
import ToviLoader from "@/components/loading/ToviLoader";

export default function CreateRestaurant() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthUser();
  const [isAdmin, setIsAdmin] = useState(false);

  // Apenas admins podem usar batch import
  useEffect(() => {
    if (user?.id) {
      fetch('/api/users/me')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => setIsAdmin(!!d?.isAdmin))
        .catch(() => setIsAdmin(false));
    }
  }, [user?.id]);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Você precisa estar logado para criar restaurantes.', {
        position: "top-center",
        autoClose: 3000
      });
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  // Show loading while checking auth
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[var(--gray-50)] flex items-center justify-center">
        <ToviLoader size="sm" />
      </div>
    );
  }

  return (
    <RestaurantForm
      backUrl="/restaurants"
      backLabel="Voltar para Restaurantes"
      enableBatchImport={isAdmin}
    />
  );
}