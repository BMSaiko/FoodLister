"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const useLists = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLists = async () => {
      const { data, error } = await supabase.from("lists").select("*");
      if (error) console.error("Error fetching lists:", error);
      else setLists(data);
      setLoading(false);
    };

    fetchLists();
  }, []);

  return { lists, loading };
};
