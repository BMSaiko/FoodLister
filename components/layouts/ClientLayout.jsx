// components/layouts/ClientLayout.jsx
'use client';

import React from 'react';
import { useCreatorName } from "@/hooks/useCreatorName";
import CreatorNameModal from "@/components/ui/CreatorNameModal";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LoadingProvider } from '@/contexts/LoadingContext';
import Navbar from './Navbar';
import LoadingScreen from '../ui/LoadingScreen';
import { useLoading } from '@/contexts/LoadingContext';

function LayoutContent({ children }) {
  const { showModal, setCreatorName, isLoading } = useCreatorName();
  const { loading } = useLoading();

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        {children}
      </div>
      {!isLoading && showModal && <CreatorNameModal onSave={setCreatorName} />}
      {loading && <LoadingScreen />}
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

export default function ClientLayout({ children }) {
  return (
    <LoadingProvider>
      <LayoutContent>{children}</LayoutContent>
    </LoadingProvider>
  );
}
