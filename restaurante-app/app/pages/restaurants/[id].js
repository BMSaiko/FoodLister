"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function RestaurantPage() {
  const router = useRouter();
  const { id } = router.query;
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchRestaurant = async () => {
      const { data, error } = await supabase.from("restaurants").select("*").eq("id", id).single();
      if (error) console.error("Error fetching restaurant:", error);
      else setRestaurant(data);
    };

    fetchRestaurant();
  }, [id]);

  if (!restaurant) return <p>Loading...</p>;

  return (
    <div className="container mx-auto p-4">
      <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-60 object-cover" />
      <h1 className="text-2xl font-bold mt-4">{restaurant.name}</h1>
      <p>{restaurant.description}</p>
      <p>💰 {restaurant.price_per_person}€ por pessoa</p>
      <p>⭐ {restaurant.rating}</p>
    </div>
  );
}
