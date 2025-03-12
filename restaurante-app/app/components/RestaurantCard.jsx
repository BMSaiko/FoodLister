"use client";
const RestaurantCard = ({ restaurant }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-md">
      <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-40 object-cover" />
      <div className="p-4">
        <h2 className="text-lg font-semibold">{restaurant.name}</h2>
        <p className="text-gray-600">{restaurant.description}</p>
        <p className="text-sm text-gray-500">💰 {restaurant.price_per_person}€ por pessoa</p>
        <p className="text-sm text-gray-500">⭐ {restaurant.rating}</p>
      </div>
    </div>
  );
};

export default RestaurantCard;
