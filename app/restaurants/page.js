// app/restaurants/page.js
import Navbar from '@/components/ui/navigation/Navbar';
import RestaurantsList from '@/components/RestaurantsList';
import RouletteBanner from '@/components/ui/RestaurantList/RouletteBanner';

export default function RestaurantsPage() {
  return (
    <main className="min-h-screen bg-background-secondary">
      <Navbar />

      <RouletteBanner />

      <RestaurantsList showHeader={true} />
    </main>
  );
}
