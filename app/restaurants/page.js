// app/restaurants/page.js
import Navbar from '@/components/layouts/Navbar';
import RestaurantsList from '@/components/RestaurantsList';
import RouletteBanner from '@/components/ui/RouletteBanner';

export default function RestaurantsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <RouletteBanner />

      <RestaurantsList showHeader={true} />
    </main>
  );
}
