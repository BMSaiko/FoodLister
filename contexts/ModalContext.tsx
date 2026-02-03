import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface MapModalData {
  location: string;
  latitude?: number;
  longitude?: number;
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