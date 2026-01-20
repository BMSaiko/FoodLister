// app/page.js
import Navbar from '@/components/layouts/Navbar';
import RestaurantsList from '@/components/RestaurantsList';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <RestaurantsList showHeader={false} />
    </main>
  );
}
