// components/layouts/ClientLayout.jsx
'use client';

import React from 'react';
import { AuthProvider, FiltersProvider } from "@/contexts";
import { ModalProvider } from "@/contexts/ModalContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MapSelectorModal from '@/components/ui/RestaurantManagement/MapSelectorModal';

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <FiltersProvider>
        <ModalProvider>
          {children}
          <MapSelectorModal />
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
        </ModalProvider>
      </FiltersProvider>
    </AuthProvider>
  );
}
