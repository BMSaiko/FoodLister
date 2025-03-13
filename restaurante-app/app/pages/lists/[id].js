"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RestaurantCard from "../../components/RestaurantCard";

const ListDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    if (!id) return;

    const fetchRestaurants = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/list_restaurants?list_id=eq.${id}&select=restaurants(*)`, {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
      });
      const data = await res.json();
      setRestaurants(data.map((entry) => entry.restaurants));
    };

    fetchRestaurants();
  }, [id]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Restaurantes nesta Lista</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
};

export default ListDetails;
