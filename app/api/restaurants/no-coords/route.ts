import { NextRequest, NextResponse } from "next/server";
import { getPublicServerClient } from "@/libs/supabase/server";
import { getErrorMessage } from "@/types/api";
import type { ApiErrorType } from "@/types/api";
import type { Database } from "@/types/database";

type DbRestaurant = Database["public"]["Tables"]["restaurants"]["Row"];

interface RestaurantNoCoords {
  id: string;
  name: string;
  location: string | null;
  creator_name: string | null;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const client = await getPublicServerClient();
    if (!client) {
      return NextResponse.json(
        { error: getErrorMessage("INTERNAL_ERROR"), code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    }

    const { data, error } = await client
      .from("restaurants")
      .select("id, name, location, creator_name, created_at")
      .or("latitude.is.null,longitude.is.null");

    if (error) {
      console.error("Error fetching restaurants without coords:", error);
      return NextResponse.json(
        { error: getErrorMessage("DATABASE_ERROR"), code: "DATABASE_ERROR" },
        { status: 500 }
      );
    }

    const restaurants: RestaurantNoCoords[] = (data as DbRestaurant[]).map((r) => ({
      id: r.id,
      name: r.name,
      location: r.location,
      creator_name: r.creator_name,
      created_at: r.created_at,
    }));

    return NextResponse.json(
      {
        restaurants,
        meta: { count: restaurants.length },
      },
      {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
      }
    );
  } catch (error) {
    console.error("Unexpected error in /api/restaurants/no-coords:", error);
    return NextResponse.json(
      { error: getErrorMessage("INTERNAL_ERROR"), code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
