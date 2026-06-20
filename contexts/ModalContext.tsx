import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface MapModalData {
  location: string;
  latitude?: number;
  longitude?: number;
  source_url?: string;
}

interface ModalContextType {
  isMapModalOpen: boolean;
  mapModalData: MapModalData | null;
  openMapModal: (data: MapModalData) => void;
  closeMapModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapModalData, setMapModalData] = useState<MapModalData | null>(null);

  const openMapModal = useCallback((data: MapModalData) => {
    setMapModalData(data);
    setIsMapModalOpen(true);
  }, []);

  const closeMapModal = useCallback(() => {
    setIsMapModalOpen(false);
    setMapModalData(null);
  }, []);

  // Set aria-hidden on main content when modal is open
  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      if (isMapModalOpen) {
        mainContent.setAttribute('aria-hidden', 'true');
        mainContent.setAttribute('inert', '');
      } else {
        mainContent.removeAttribute('aria-hidden');
        mainContent.removeAttribute('inert');
      }
    }
    return () => {
      const main = document.querySelector('main');
      if (main) {
        main.removeAttribute('aria-hidden');
        main.removeAttribute('inert');
      }
    };
  }, [isMapModalOpen]);

  const value = {
    isMapModalOpen,
    mapModalData,
    openMapModal,
    closeMapModal
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};
