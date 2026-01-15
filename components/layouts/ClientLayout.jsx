// components/layouts/ClientLayout.jsx
'use client';

import React from 'react';
import { useCreatorName } from "@/hooks/useCreatorName";
import CreatorNameModal from "@/components/ui/CreatorNameModal";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ClientLayout({ children }) {
  const { showModal, setCreatorName, isLoading } = useCreatorName();

  return (
    <>
      {children}
      {!isLoading && showModal && <CreatorNameModal onSave={setCreatorName} />}
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="text-sm sm:text-base"
        bodyClassName="text-sm sm:text-base"
      />
    </>
  );
}
