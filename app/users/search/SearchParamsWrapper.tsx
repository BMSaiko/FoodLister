'use client';

import { useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';

interface SearchParamsWrapperProps {
  children: (searchParams: URLSearchParams) => ReactNode;
}

export default function SearchParamsWrapper({ children }: SearchParamsWrapperProps) {
  const searchParams = useSearchParams();
  
  return <>{children(searchParams)}</>;
}