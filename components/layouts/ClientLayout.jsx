// components/layouts/ClientLayout.jsx
'use client';

import React from 'react';
import { useCreatorName } from "@/hooks/useCreatorName";
import CreatorNameModal from "@/components/ui/CreatorNameModal";

export default function ClientLayout({ children }) {
  const { showModal, setCreatorName, isLoading } = useCreatorName();

  return (
    <>
      {children}
      {!isLoading && showModal && <CreatorNameModal onSave={setCreatorName} />}
    </>
  );
}