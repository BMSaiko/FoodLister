"use client";
import { useRestaurants } from "./hooks/useRestaurants";
import Navbar from "./components/Navbar";
import RestaurantCard from "./components/RestaurantCard";

export default function Home() {
  const { restaurants, loading } = useRestaurants();

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        {loading ? (
          <p>Loading restaurants...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
