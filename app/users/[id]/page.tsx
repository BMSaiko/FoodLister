"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useUserData } from "@/hooks/data/useUserData";
import { toast } from "react-toastify";
import { AlertCircle, Loader2, Star } from "lucide-react";
import Navbar from "@/components/ui/navigation/Navbar";
import ScrollToTopButton from "@/components/ui/common/ScrollToTopButton";
import UserProfileHeader from "@/components/ui/profile/UserProfileHeader";
import ProfileStats from "@/components/ui/profile/ProfileStats";
import ProfileTabs from "@/components/ui/profile/ProfileTabs";
import UserReviewsSection from "@/components/ui/profile/sections/reviews/UserReviewsSection";
import UserListsSection from "@/components/ui/profile/sections/lists/UserListsSection";
import UserRestaurantsSection from "@/components/ui/profile/sections/restaurants/UserRestaurantsSection";
import ScheduledMealsSection from "@/components/ui/profile/sections/meals/ScheduledMealsSection";
import UserLoadingPage from "./loading";

interface UserProfile {
  id: string;
  userIdCode: string;
  name: string;
  profileImage?: string;
  location?: string;
  bio?: string;
  website?: string;
  publicProfile: boolean;
  createdAt: string;
  updatedAt: string;
  stats: {
    totalRestaurantsVisited: number;
    totalReviews: number;
    totalLists: number;
    totalRestaurantsAdded: number;
    joinedDate: string;
  };
  recentReviews: any[];
  recentLists: any[];
  isOwnProfile: boolean;
}

const UserProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const isUserCode = /^[A-Z]{2}\d{6}$/.test(userId);

  const [activeTab, setActiveTab] = useState<"reviews" | "lists" | "restaurants" | "meals" | "activity">("reviews");
  const [copySuccess, setCopySuccess] = useState(false);
  const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);
  const [totalMeals, setTotalMeals] = useState(0);

  const searchParams = useSearchParams();

  const {
    profile, reviews, lists, restaurants, loading, loadingStates, error,
    fetchUserRestaurants, refreshProfile
  } = useUserData({
    userId, enableReviews: true, enableLists: true, enableRestaurants: true,
    autoFetch: true, cacheTTL: 5 * 60 * 1000,
  });

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["reviews", "lists", "restaurants", "meals", "activity"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === "restaurants" && profile && restaurants.length === 0 && !loading) {
      fetchUserRestaurants();
    }
  }, [activeTab, profile, restaurants.length, loading, fetchUserRestaurants]);

  useEffect(() => {
    const fetchMealsCount = async () => {
      if (!userId) return;
      try {
        const [orgRes, partRes] = await Promise.all([
          fetch(`/api/meals/scheduled?type=organized&page=1&limit=1`),
          fetch(`/api/meals/scheduled?type=participating&page=1&limit=1`),
        ]);
        const orgTotal = orgRes.ok ? ((await orgRes.json()).total || 0) : 0;
        const partTotal = partRes.ok ? ((await partRes.json()).total || 0) : 0;
        setTotalMeals(orgTotal + partTotal);
      } catch { /* silent */ }
    };
    fetchMealsCount();
  }, [userId]);

  const searchParamsForTab = useSearchParams();
  useEffect(() => {
    const tabParam = searchParamsForTab?.get("tab");
    if (tabParam === "restaurants" && profile && restaurants.length === 0 && !loading) {
      fetchUserRestaurants();
    }
  }, [profile, restaurants.length, loading, fetchUserRestaurants, searchParamsForTab]);

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey as any);
    const currentPath = window.location.pathname;
    const currentUrl = new URL(window.location.href);
    if (tabKey === "reviews") currentUrl.searchParams.delete("tab");
    else currentUrl.searchParams.set("tab", tabKey);
    window.history.replaceState({}, "", `${currentPath}${currentUrl.search}`);
  };

  const handleCopyProfileLink = () => {
    const url = `${window.location.origin}/users/${profile?.userIdCode || userId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleShareProfile = async () => {
    const url = `${window.location.origin}/users/${profile?.userIdCode || userId}`;
    if (navigator.share) {
      try { await navigator.share({ title: `${profile?.name} - FoodLister`, text: `Ve o perfil de ${profile?.name}`, url }); } catch { /* cancelled */ }
    } else {
      handleCopyProfileLink();
    }
  };

  const handlePrivacyToggle = async () => {
    if (!profile) return;
    setIsUpdatingPrivacy(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: profile.name, bio: profile.bio, avatar_url: profile.profileImage,
          phone_number: profile.phoneNumber, website: profile.website,
          location: profile.location, public_profile: !profile.publicProfile,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(!profile.publicProfile ? "Perfil agora e publico!" : "Perfil agora e privado!");
        await refreshProfile();
      } else { throw new Error(data.error || "Erro"); }
    } catch { toast.error("Erro ao atualizar privacidade"); }
    finally { setIsUpdatingPrivacy(false); }
  };

  const isOwnProfile = !!(user && (userId === user.id || (profile && profile.id === user.id)));

  // Loading
  if (authLoading || (loading && !profile)) return <UserLoadingPage />;

  // Error
  if (error || !profile) {
    return (
      <div className="min-h-[100dvh] bg-[var(--background)] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-12 w-12 text-red-400/60 mx-auto" />
          <h1 className="text-xl font-bold text-white/70 mt-4">{error || "Perfil nao encontrado"}</h1>
          <button onClick={() => router.push("/restaurants")} className="mt-4 px-5 py-2.5 bg-purple-500/15 text-purple-400 rounded-xl hover:bg-purple-500/25 transition-colors text-sm font-medium">
            Explorar Restaurantes
          </button>
        </div>
      </div>
    );
  }

  const tabCounts = {
    reviews: profile.stats?.totalReviews ?? 0,
    lists: profile.stats?.totalLists ?? 0,
    restaurants: profile.stats?.totalRestaurantsAdded ?? 0,
    meals: totalMeals,
    activity: (profile.stats?.totalReviews ?? 0) + (profile.stats?.totalLists ?? 0),
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--background)]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <UserProfileHeader
          name={profile.name}
          userIdCode={profile.userIdCode}
          profileImage={profile.profileImage}
          bio={profile.bio}
          location={profile.location}
          website={profile.website}
          joinedDate={profile.stats?.joinedDate}
          isPublic={profile.publicProfile}
          isOwnProfile={isOwnProfile}
          onCopyLink={handleCopyProfileLink}
          onShare={handleShareProfile}
          onPrivacyToggle={handlePrivacyToggle}
          copySuccess={copySuccess}
          isUpdatingPrivacy={isUpdatingPrivacy}
        />

        {/* Stats */}
        <ProfileStats
          totalRestaurantsVisited={profile.stats?.totalRestaurantsVisited ?? 0}
          totalReviews={profile.stats?.totalReviews ?? 0}
          totalLists={profile.stats?.totalLists ?? 0}
          totalRestaurantsAdded={profile.stats?.totalRestaurantsAdded ?? 0}
        />

        {/* Content Card */}
        <div className="p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
          <div className="rounded-2xl bg-white/[0.03] overflow-hidden">
            {/* Tabs */}
            <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} counts={tabCounts} />

            {/* Tab Content */}
            <div className="p-4 md:p-6">
              {activeTab === "reviews" && (
                <UserReviewsSection userId={userId} initialReviews={profile.recentReviews || []} initialTotal={profile.stats?.totalReviews ?? 0} isOwnProfile={isOwnProfile} />
              )}
              {activeTab === "lists" && (
                <UserListsSection userId={userId} initialLists={profile.recentLists || []} initialTotal={profile.stats?.totalLists ?? 0} isOwnProfile={isOwnProfile} />
              )}
              {activeTab === "restaurants" && (
                <UserRestaurantsSection userId={userId} initialRestaurants={restaurants} initialTotal={profile.stats?.totalRestaurantsAdded ?? 0} isOwnProfile={isOwnProfile} isLoading={loading} loadingStates={loadingStates} error={error} />
              )}
              {activeTab === "meals" && (
                <ScheduledMealsSection userId={profile.id} type={isOwnProfile ? "all" : "organized"} />
              )}
              {activeTab === "activity" && (
                <div className="space-y-6">
                  {/* Recent Reviews */}
                  <div>
                    <h3 className="text-lg font-semibold text-white/80 mb-4 flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-400" />Ultimas Reviews
                    </h3>
                    {(profile.recentReviews || []).length > 0 ? (
                      <div className="space-y-3">
                        {(profile.recentReviews || []).slice(0, 3).map((review: any) => (
                          <div key={review.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium text-white/80 text-sm">{review.restaurant?.name || "Restaurante"}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-amber-400 text-sm font-semibold">{review.rating}/5</span>
                                  <span className="text-white/25 text-xs">{new Date(review.createdAt).toLocaleDateString("pt-PT")}</span>
                                </div>
                              </div>
                              {review.restaurant?.imageUrl && (
                                <img src={review.restaurant?.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                              )}
                            </div>
                            {review.comment && <p className="text-white/40 text-sm line-clamp-2">{review.comment}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/30 text-sm py-4 text-center">Nenhuma review encontrada.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ScrollToTopButton />


    </div>
  );
};

export default UserProfilePage;
