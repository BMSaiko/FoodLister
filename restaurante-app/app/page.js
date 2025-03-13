"use client";

import useRestaurants from "./hooks/useRestaurants";
import RestaurantCard from "./components/RestaurantCard";
import Navbar from "./components/Navbar";

export default function Home() {
  const { restaurants, loading } = useRestaurants();

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <h1 className="text-2xl font-bold">Restaurantes</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
}