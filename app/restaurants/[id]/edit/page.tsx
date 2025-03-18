// app/restaurants/[id]/edit/page.tsx
"use client";

import { useParams } from 'next/navigation';
import EditRestaurant from '../../../../components/pages/EditRestaurant';

export default function EditRestaurantPage() {
  const { id } = useParams();
  
  return <EditRestaurant restaurantId={id} />;
}