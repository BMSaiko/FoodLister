// components/pages/CreateRestaurant.jsx
// Refactored: Now uses shared RestaurantForm component
"use client";

import { useAuth } from '@/contexts';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import RestaurantForm from '@/components/restaurant/RestaurantForm';

export default function CreateRestaurant() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <RestaurantForm
      backUrl="/restaurants"
      backLabel="Voltar para Restaurantes"
    />
  );
}