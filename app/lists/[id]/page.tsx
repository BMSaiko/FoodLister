"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import Navbar from "@/components/ui/navigation/Navbar";
import RestaurantRoulette from "@/components/ui/RestaurantRoulette";
import Link from "next/link";
import { toast } from "react-toastify";
import { useShare } from "@/hooks/utilities/useShare";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import Skeleton from "@/components/ui/Skeleton";
import ListCover from "@/components/ui/lists/ListCover";
import ListMetaBar from "@/components/ui/lists/ListMetaBar";
import ListStatistics from "@/components/ui/lists/ListStatistics";
import ListRestaurantGrid from "@/components/ui/lists/ListRestaurantGrid";
import ListComments from "@/components/ui/lists/ListComments";
import ListExportButtons from "@/components/ui/lists/ListExportButtons";
import ListCollaborators from "@/components/ui/lists/ListCollaborators";
import ListActivityFeed from "@/components/ui/lists/ListActivityFeed";
import { ArrowLeft } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  price_per_person?: number;
  rating?: number;
  location?: string;
  source_url?: string;
  creator?: string;
  menu_url?: string;
  menu_links?: string[];
  menu_images?: string[];
  phone_numbers?: string[];
  created_at: string;
  updated_at: string;
  creator_id?: string;
  creator_name?: string;
  cuisine_types: any[];
  review_count?: number;
  features: any[];
  dietary_options: any[];
}

interface List {
  id: string;
  name: string;
  description?: string;
  creator_id?: string;
  creator?: string;
  created_at: string;
  updated_at: string;
  is_public?: boolean;
  filters?: any;
  restaurants: Restaurant[];
}

export default function ListDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [list, setList] = useState<List | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRoulette, setShowRoulette] = useState(false);
  const [applyingFilters, setApplyingFilters] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const { share } = useShare();

  useEffect(() => {
    async function fetchListDetails() {
      if (!id) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/lists/${id}`, { credentials: "include" });
        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          throw new Error(`Failed: ${response.status} - ${errorText}`);
        }
        const responseData = await response.json();
        if (!responseData || typeof responseData !== "object" || !("list" in responseData)) {
          throw new Error("Invalid response structure");
        }
        const { list: listData } = responseData;
        const transformedRestaurants = (listData.restaurants || []).map((r: any) => ({
          ...r,
          features: r.restaurant_features?.map((rf: any) => rf.features) || [],
          dietary_options: r.restaurant_dietary_options?.map((rdo: any) => rdo.dietary_options) || [],
          cuisine_types: r.restaurant_cuisine_types?.map((rct: any) => rct.cuisine_types) || [],
        }));
        setList(listData);
        setRestaurants(transformedRestaurants);
      } catch (error) {
        console.error("Error fetching list:", error);
        setList(null);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    }
    fetchListDetails();
  }, [id]);

  const handleShareList = async () => {
    if (!list) return;
    await share({ title: list.name, text: list.description || `Ve a lista "${list.name}" no FoodLister!`, url: `/lists/${id}` });
  };

  const handleDuplicateList = async () => {
    if (!list) return;
    setDuplicating(true);
    try {
      const res = await fetch(`/api/lists/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: `${list.name} (Copia)` }), credentials: "include" });
      const data = await res.json();
      if (res.ok) { toast.success("Lista duplicada!"); router.push(`/lists/${data.list.id}`); }
      else toast.error(data.error || "Erro ao duplicar");
    } catch { toast.error("Erro ao duplicar"); }
    finally { setDuplicating(false); }
  };

  const handleDeleteList = async () => {
    if (!confirm(`Tem certeza que deseja eliminar a lista "${list?.name}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/lists/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { toast.success("Lista eliminada!"); router.push("/lists"); }
      else toast.error(data.error || `Erro ao eliminar (${res.status})`);
    } catch (e) { console.error("Delete error:", e); toast.error("Erro ao eliminar"); }
    finally { setDeleting(false); }
  };

  const applyFilters = async () => {
    if (!list?.filters) return;
    setApplyingFilters(true);
    try {
      const supabase = (await import("@/libs/supabase/client")).getClient();
      const filters = list.filters;

      // Fetch junction table IDs in parallel (independent queries)
      const [cuisinesRes, featuresRes, dietaryRes] = await Promise.all([
        filters.cuisineTypes?.length
          ? supabase.from("restaurant_cuisine_types").select("restaurant_id").in("cuisine_type_id", filters.cuisineTypes)
          : Promise.resolve({ data: [] }),
        filters.features?.length
          ? supabase.from("restaurant_restaurant_features").select("restaurant_id").in("feature_id", filters.features)
          : Promise.resolve({ data: [] }),
        filters.dietaryOptions?.length
          ? supabase.from("restaurant_dietary_options_junction").select("restaurant_id").in("dietary_option_id", filters.dietaryOptions)
          : Promise.resolve({ data: [] }),
      ]);

      if ((filters.cuisineTypes?.length > 0 && (cuisinesRes.data?.length ?? 0) === 0) ||
          (filters.features?.length > 0 && (featuresRes.data?.length ?? 0) === 0) ||
          (filters.dietaryOptions?.length > 0 && (dietaryRes.data?.length ?? 0) === 0)) {
        setRestaurants([]); setApplyingFilters(false); return;
      }

      let query = supabase.from("restaurants").select("*");
      if (cuisinesRes.data?.length) query = query.in("id", [...new Set(cuisinesRes.data.map((x: any) => x.restaurant_id))]);
      if (featuresRes.data?.length) query = query.in("id", [...new Set(featuresRes.data.map((x: any) => x.restaurant_id))]);
      if (dietaryRes.data?.length) query = query.in("id", [...new Set(dietaryRes.data.map((x: any) => x.restaurant_id))]);
      query = query.gte("price_per_person", filters.priceRange?.[0] ?? 0).lte("price_per_person", filters.priceRange?.[1] ?? 100).gte("rating", filters.minRating ?? 0);
      const { data, error } = await query;
      if (!error && data) {
        setRestaurants(data.map((r: any) => ({
          ...r,
          features: r.restaurant_features?.map((rf: any) => rf.features) || [],
          dietary_options: r.restaurant_dietary_options?.map((rdo: any) => rdo.dietary_options) || [],
          cuisine_types: r.restaurant_cuisine_types?.map((rct: any) => rct.cuisine_types) || [],
        })));
      }
    } catch (err) { console.error("Filter error:", err); }
    finally { setApplyingFilters(false); }
  };

  // Compute stats for meta bar
  const metaStats = useMemo(() => {
    if (!restaurants.length) return { avgRating: undefined as number | undefined, avgPrice: undefined as number | undefined, uniqueLocations: 0 };
    const ratings: number[] = restaurants.filter((r): r is typeof r & { rating: number } => r.rating != null).map(r => r.rating);
    const prices: number[] = restaurants.filter((r): r is typeof r & { price_per_person: number } => r.price_per_person != null).map(r => r.price_per_person);
    const locations = [...new Set(restaurants.filter(r => r.location).map(r => r.location))];
    return {
      avgRating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : undefined,
      avgPrice: prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : undefined,
      uniqueLocations: locations.length,
    };
  }, [restaurants]);

  if (loading) {
    return (
      <ErrorBoundary pageName="ListDetails">
        <div className="min-h-[100dvh]" style={{ backgroundColor: "var(--background)" }}>
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="animate-pulse h-[40dvh] rounded-3xl bg-white/[0.04] mb-6" />
            <div className="animate-pulse h-20 rounded-2xl bg-white/[0.04] mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} variant="restaurant-card" />)}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (!list) {
    return (
      <ErrorBoundary pageName="ListDetails">
        <div className="min-h-[100dvh]" style={{ backgroundColor: "var(--background)" }}>
          <Navbar />
          <div className="min-h-[60dvh] flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white/60 mb-4">Lista nao encontrada</h2>
              <Link href="/lists" className="text-amber-400 hover:text-amber-300 transition-colors">Voltar as listas</Link>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary pageName="ListDetails">
      <div className="min-h-[100dvh]" style={{ backgroundColor: "var(--background)" }}>
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          {/* Back link */}
          <Link href="/lists" className="inline-flex items-center text-amber-400/70 hover:text-amber-400 transition-colors mb-4 text-sm min-h-[44px]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Voltar as listas</span>
          </Link>

          {/* Hero Cover */}
          <ListCover
            name={list.name}
            description={list.description}
            isPublic={list.is_public}
            restaurantCount={restaurants.length}
            creator={list.creator}
            isOwner={!!(user && list.creator_id === user.id)}
            duplicating={duplicating}
            deleting={deleting}
            onShare={handleShareList}
            onRoulette={() => setShowRoulette(true)}
            onDuplicate={handleDuplicateList}
            onDelete={handleDeleteList}
            listId={id as string}
          />

          {/* Meta Bar */}
          <ListMetaBar
            restaurantCount={restaurants.length}
            avgRating={metaStats.avgRating}
            avgPrice={metaStats.avgPrice}
            uniqueLocations={metaStats.uniqueLocations}
            createdAt={list.created_at}
            hasFilters={!!list.filters}
            applyingFilters={applyingFilters}
            onApplyFilters={applyFilters}
          />

          {/* Statistics Dashboard */}
          {restaurants.length > 0 && <ListStatistics restaurants={restaurants} />}

          {/* Restaurant Grid */}
          <ListRestaurantGrid
            restaurants={restaurants}
          />

          {/* Export */}
          {restaurants.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white/70 mb-3">Exportar Lista</h3>
              <ListExportButtons list={list} restaurants={restaurants} />
            </div>
          )}

          {/* Collaborators */}
          {user?.id === list.creator_id && (
            <div className="mb-8 p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
              <div className="p-4 md:p-5 rounded-2xl bg-white/[0.03]">
                <ListCollaborators listId={id as string} isOwner={true} />
              </div>
            </div>
          )}

          {/* Comments */}
          {list.is_public && (
            <div className="mb-8">
              <ListComments listId={id as string} isOwner={user?.id === list.creator_id} />
            </div>
          )}

          {/* Activity Feed */}
          <div className="mb-8 p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
            <div className="p-4 md:p-5 rounded-2xl bg-white/[0.03]">
              <ListActivityFeed listId={id as string} />
            </div>
          </div>
        </div>

        {/* Roulette Modal */}
        {showRoulette && (
          <RestaurantRoulette restaurants={restaurants} onClose={() => setShowRoulette(false)} />
        )}
      </div>
    </ErrorBoundary>
  );
}
