// hooks/useCreatorName.ts
'use client';

import { useState, useEffect } from 'react';

export function useCreatorName() {
  const [creatorName, setCreatorName] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Tenta obter o nome do criador dos cookies
    const getCookieValue = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : '';
    };

    const nameFromCookie = getCookieValue('creatorName');
    
    if (nameFromCookie) {
      setCreatorName(nameFromCookie);
      setShowModal(false);
    } else {
      setShowModal(true);
    }
    
    setIsLoading(false);
  }, []);

  const handleSetCreatorName = (name: string) => {
    setCreatorName(name);
    setShowModal(false);
  };

  return {
    creatorName,
    showModal,
    isLoading,
    setCreatorName: handleSetCreatorName
  };
}