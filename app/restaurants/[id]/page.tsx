// app/restaurants/[id]/page.tsx
"use client";

import "leaflet/dist/leaflet.css";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { toast } from "react-toastify";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuthUser } from '@/hooks/auth/useAuthUser';
import { useRestaurantDetail } from "@/hooks/restaurants/useRestaurantDetail";
import { shareRestaurant } from "@/utils/shareRestaurant";
import { logError, logWarn } from "@/utils/logger";
import Navbar from "@/components/ui/navigation/Navbar";
import HeroSection from "@/components/ui/RestaurantDetails/HeroSection";
import AddToList from "@/components/ui/RestaurantDetails/AddToList";
import InfoBento from "@/components/ui/RestaurantDetails/InfoBento";
import RestaurantInfoPanel from "@/components/ui/RestaurantDetails/RestaurantInfoPanel";
import RestaurantLocation from "@/components/ui/RestaurantDetails/RestaurantLocation";
import ReportButton from "@/components/ui/common/ReportButton";
import ScrollToTopButton from "@/components/ui/common/ScrollToTopButton";
import { usePublicApiClient } from "@/hooks/auth/usePublicApiClient";

const CategoryChips = dynamic(() => import("@/components/ui/RestaurantDetails/CategoryChips"));
const ReviewsSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map(i => (
      <div key={i} className="h-24 rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
    ))}
  </div>
);
const ReviewsFeed = dynamic(() => import("@/components/ui/RestaurantDetails/ReviewsFeed"), {
  loading: () => <ReviewsSkeleton />,
});
const ListsSection = dynamic(() => import("@/components/ui/RestaurantDetails/ListsSection"));
const ScheduleMealModal = dynamic(() => import("@/components/ui/RestaurantDetails/ScheduleMealModal"), { ssr: false });

type UserProfile = { display_name?: string; avatar_url?: string; isAdmin?: boolean };

export default function RestaurantDetails() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id || '';
  const reviewId = searchParams?.get('review');
  const { user } = useAuthUser();
  const { get } = usePublicApiClient();
  const {
    status, restaurant, lists, cuisineTypes, reviews, reviewCount,
    onReviewSubmitted, deleteReview, deleteRestaurant,
  } = useRestaurantDetail(id);

  usePageTitle(restaurant?.name ? `${restaurant.name} - FoodLister` : "FoodLister - Restaurante");

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [openReviewForm, setOpenReviewForm] = useState(0);
  const reviewsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const response = await get(`/api/users/me`);
        if (response.ok) {
          const profile = await response.json();
          setUserProfile({
            display_name: profile.display_name || undefined,
            avatar_url: profile.avatar_url || undefined,
            isAdmin: profile.isAdmin ?? false,
          });
        } else if (response.status === 401) {
          logWarn('User not authenticated for profile access');
        }
      } catch (error) {
        logError('Error fetching user profile', error);
      }
    })();
  }, [user?.id, get]);

  const handleShare = async () => {
    const result = await shareRestaurant(restaurant?.name || 'Restaurante', window.location.href);
    if (result.status === 'copied') toast.success('Link copiado para a área de transferência!');
    else if (result.status === 'error') toast.error(result.message);
  };

  const handleDeleteRestaurant = async () => {
    if (!confirm('Tem certeza que deseja eliminar este restaurante?')) return;
    if (await deleteRestaurant()) {
      toast.success('Restaurante eliminado com sucesso!');
      window.location.href = '/restaurants';
    } else {
      toast.error('Não foi possível eliminar o restaurante.');
    }
  };

  const handleDeleteReview = async (targetId: string) => {
    if (!confirm('Tem certeza que deseja eliminar esta avaliação?')) return;
    if (await deleteReview(targetId)) toast.success('Avaliação eliminada com sucesso!');
    else toast.error('Erro ao eliminar avaliação. Tente novamente.');
  };

  const handleReviewSubmitted: typeof onReviewSubmitted = async (review) => {
    await onReviewSubmitted(review);
    toast.success('Avaliação enviada com sucesso!');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-[100dvh]" style={{ backgroundColor: 'var(--background)' }}>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse rounded-xl h-96 mb-6" style={{ backgroundColor: 'var(--card-bg)' }}></div>
          <div className="animate-pulse p-6 rounded-lg h-24 mb-6" style={{ backgroundColor: 'var(--card-bg)' }}></div>
        </div>
      </div>
    );
  }

  if (status !== 'ready' || !restaurant) {
    return (
      <div className="min-h-[100dvh]" style={{ backgroundColor: 'var(--background)' }}>
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-white/90">
            {status === 'error' ? 'Não foi possível carregar o restaurante' : 'Restaurante não encontrado'}
          </h2>
          <Link href="/restaurants" className="mt-4 inline-block text-amber-600 hover:underline">
            Voltar para a página de restaurantes
          </Link>
        </div>
      </div>
    );
  }

  const canManage = !!(user && (restaurant.creator_id === user.id || userProfile?.isAdmin));
  const addToListEl = (
    <AddToList
      restaurantId={restaurant.id}
      isAdmin={!!userProfile?.isAdmin}
      existingListIds={lists.map((l: any) => l.id)}
    />
  );

  return (
    <div className="min-h-[100dvh]" style={{ backgroundColor: 'var(--background)' }}>
      <Navbar />

      <HeroSection
        restaurant={restaurant}
        reviewImages={reviews.flatMap(r => (r as any).images || []).filter(Boolean)}
        reviewCount={reviewCount}
        onShare={handleShare}
        onSchedule={() => setIsScheduleModalOpen(true)}
        onReview={user ? () => setOpenReviewForm(n => n + 1) : undefined}
        onEdit={canManage ? () => { window.location.href = `/restaurants/${restaurant.id}/edit`; } : undefined}
        isOwner={canManage}
        onDelete={userProfile?.isAdmin ? handleDeleteRestaurant : undefined}
        canDelete={!!userProfile?.isAdmin}
        listAction={user ? addToListEl : undefined}
        actionExtra={user ? (
          <>
            <div className="lg:hidden">{addToListEl}</div>
            <ReportButton targetType="restaurant" targetId={restaurant.id} />
          </>
        ) : undefined}
      >
        <RestaurantInfoPanel restaurant={restaurant} />
        <RestaurantLocation restaurant={restaurant} />

        <InfoBento menuImages={restaurant.menu_images} />

        <CategoryChips
          cuisineTypes={cuisineTypes}
          dietaryOptions={restaurant.dietary_options || []}
          features={restaurant.features || []}
        />

        <ReviewsFeed
          userProfile={userProfile}
          ref={reviewsSectionRef}
          restaurantId={id}
          reviews={reviews}
          reviewCount={reviewCount}
          user={user}
          loading={false}
          onReviewSubmitted={handleReviewSubmitted}
          onEditReview={() => {}}
          onDeleteReview={handleDeleteReview}
          restaurantRating={restaurant.rating}
          highlightReviewId={reviewId || undefined}
          openFormSignal={openReviewForm}
        />

        <ListsSection lists={lists} />
      </HeroSection>

      <ScheduleMealModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        restaurantName={restaurant.name}
        restaurantId={restaurant.id}
      />

      <ScrollToTopButton />
    </div>
  );
}
