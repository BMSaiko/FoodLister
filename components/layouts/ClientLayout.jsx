// components/layouts/ClientLayout.jsx
'use client';

import React from 'react';
import { AuthProvider, FiltersProvider, LanguageProvider } from "@/contexts";

import { ModalProvider } from "@/contexts/ModalContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MapSelectorModal from '@/components/ui/RestaurantManagement/MapSelectorModal';
import GlobalSearch from '@/components/ui/GlobalSearch';

export default function ClientLayout({ children }) {
  return (
    <LanguageProvider>
    <AuthProvider>
      <FiltersProvider>
        <ModalProvider>
          {children}
          <GlobalSearch />
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
    </LanguageProvider>
  );
}
