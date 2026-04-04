// components/pages/EditRestaurant.jsx
// Refactored: Now uses shared RestaurantForm component
"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts';
import { toast } from 'react-toastify';
import RestaurantForm from '@/components/restaurant/RestaurantForm';

// Auth guard component
function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      toast.error('Você precisa estar logado para editar restaurantes.', {
        position: "top-center",
        autoClose: 3000
      });
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return children;
}

export default function EditRestaurant({ restaurantId }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get back URL from params
  const getBackUrl = () => {
    const source = searchParams.get('source');
    const userId = searchParams.get('userId');
    const tab = searchParams.get('tab');

    if (source === 'profile' && userId) {
      const profileUrl = `/users/${userId}`;
      const baseUrl = tab ? `${profileUrl}?tab=${tab}` : profileUrl;
      return restaurantId ? `${baseUrl}&restaurantId=${restaurantId}` : baseUrl;
    }
    
    return `/restaurants/${restaurantId}`;
  };

  const getBackLabel = () => {
    const source = searchParams.get('source');
    return source === 'profile' ? 'Voltar para Perfil do Usuário' : 'Voltar para Detalhes do Restaurante';
  };

  return (
    <AuthGuard>
      <RestaurantForm
        restaurantId={restaurantId}
        backUrl={getBackUrl()}
        backLabel={getBackLabel()}
        onSuccess={() => router.push(getBackUrl())}
      />
    </AuthGuard>
  );
}