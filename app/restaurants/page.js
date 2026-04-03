// app/restaurants/page.js
import Navbar from '@/components/ui/navigation/Navbar';
import RestaurantsList from '@/components/RestaurantsList';
import RouletteBanner from '@/components/ui/RestaurantList/RouletteBanner';

export default function RestaurantsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <RouletteBanner />

      <RestaurantsList showHeader={true} />
    </main>
  );
}
