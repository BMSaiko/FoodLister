// app/lists/[id]/edit/page.tsx
"use client";

import { useParams } from 'next/navigation';
import EditList from '@/components/pages/EditList';

export default function EditListPage() {
  const { id } = useParams();
  
  return <EditList listId={id} />;
}