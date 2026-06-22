// components/layouts/ClientLayout.jsx
'use client';

import React from 'react';
import { useSearch } from "@/contexts/SearchContext";
import { AuthProvider, FiltersProvider } from "@/contexts";
import { SearchProvider } from "@/contexts/SearchContext";
import GlobalSearchModal from "@/components/ui/GlobalSearchModal";
import { ModalProvider } from "@/contexts/ModalContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MapSelectorModal from '@/components/ui/RestaurantManagement/MapSelectorModal';

export default function ClientLayout({ children }) {
  const { searchOpen } = useSearch();
  
  return (
    <AuthProvider>
      <FiltersProvider>
        <ModalProvider>
          <SearchProvider>{children}</SearchProvider>
      {searchOpen && <GlobalSearchModal />}
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
