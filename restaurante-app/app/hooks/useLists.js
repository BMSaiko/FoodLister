"use client";
import { useEffect, useState } from "react";

const useLists = (searchQuery = "") => {
  const [lists, setLists] = useState([]);

  useEffect(() => {
    const fetchLists = async () => {
      let url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/lists?select=*`;
      if (searchQuery) {
        url += `&name=ilike.%${searchQuery}%`;
      }
      const res = await fetch(url, {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
      });
      const data = await res.json();
      setLists(data);
    };

    fetchLists();
  }, [searchQuery]);

  return lists;
};

export default useLists;
