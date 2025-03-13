"use client";

import { useEffect, useState } from "react";

const useRestaurants = (searchQuery = "") => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      let url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/restaurants?select=*`;
      if (searchQuery) {
        url += `&name=ilike.%${searchQuery}%`;
      }
      const res = await fetch(url, {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
      });
      const data = await res.json();
      setRestaurants(data);
      setLoading(false);
    };

    fetchRestaurants();
  }, [searchQuery]);

  return { restaurants, loading };
};

export default useRestaurants;