"use client";
import Link from "next/link";

const RestaurantCard = ({ restaurant }) => {
  return (
    <div className="border p-4 rounded-lg shadow-md bg-white">
      <img src={restaurant.image} alt={restaurant.name} className="w-full h-32 object-cover rounded" />
      <h3 className="mt-2 font-bold">{restaurant.name}</h3>
      <p className="text-sm text-gray-600">💰 {restaurant.price} por pessoa</p>
      <p className="text-sm">⭐ {restaurant.rating}</p>
      <Link href={`/restaurants/${restaurant.id}`} className="text-blue-500 hover:underline mt-2 block">
        Ver detalhes
      </Link>
    </div>
  );
};

export default RestaurantCard;
