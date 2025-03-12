"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      const { data, error } = await supabase.from("restaurants").select("*");
      if (error) console.error("Error fetching restaurants:", error);
      else setRestaurants(data);
      setLoading(false);
    };

    fetchRestaurants();
  }, []);

  return { restaurants, loading };
};
