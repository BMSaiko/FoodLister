// app/lists/page.js
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ListCard from '@/components/ui/RestaurantManagement/ListCard';
import Navbar from '@/components/ui/navigation/Navbar';
import Link from 'next/link';
import { Plus, Search as SearchIcon, ListChecks } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';

// Component to handle the search params logic
function ListsContent() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    async function fetchLists() {
      setLoading(true);

      try {
        const searchParam = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
        const response = await fetch(`/api/lists${searchParam}`, {
          next: { revalidate: 60 }
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`Failed to fetch lists: ${response.status} ${response.statusText} - ${errorText}`);
        }

        let responseData;
        try {
          responseData = await response.json();
        } catch (jsonError) {
          throw new Error(`Invalid JSON response: ${jsonError.message}`);
        }

        if (!responseData || typeof responseData !== 'object' || !('lists' in responseData)) {
          throw new Error('Invalid response structure: missing lists data');
        }

        const { lists: data } = responseData;
        if (!Array.isArray(data)) {
          throw new Error('Invalid response structure: lists data is not an array');
        }

        setLists(data);
      } catch (error) {
        console.error('Erro ao buscar listas:', error);
        setLists([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLists();
  }, [searchQuery]);
  
  const renderEmptyState = () => {
    if (searchQuery) {
      return (
        <div className="empty-state">
          <SearchIcon className="h-12 w-12 empty-state-icon" />
          <h3 className="empty-state-title">Nenhum resultado encontrado</h3>
          <p className="empty-state-text">
            Não encontramos nenhuma lista que corresponda a "{searchQuery}".
          </p>
          <Link href="/lists" className="btn btn-ghost mt-4">
            Limpar pesquisa
          </Link>
        </div>
      );
    }
    
    return (
      <div className="empty-state">
        <ListChecks className="h-12 w-12 empty-state-icon" />
        <h3 className="empty-state-title">Nenhuma lista cadastrada</h3>
        <p className="empty-state-text">
          Crie sua primeira lista para organizar seus restaurantes favoritos por categoria, ocasião ou qualquer critério.
        </p>
        <Link 
          href="/lists/create"
          className="btn btn-primary mt-4"
        >
          <Plus className="h-4 w-4" />
          Criar Nova Lista
        </Link>
      </div>
    );
  };
  
  return (
    <>
      <PageHeader
        title={searchQuery ? `Resultados para "${searchQuery}"` : 'Todas as Listas'}
        subtitle={searchQuery ? 'Resultados da pesquisa' : 'Organize seus restaurantes em listas personalizadas'}
        action={
          <Link href="/lists/create" className="btn btn-primary">
            <Plus className="h-4 w-4" />
            Nova Lista
          </Link>
        }
      />
      
      {loading ? (
        <div className="grid-responsive">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="card h-48 skeleton" />
          ))}
        </div>
      ) : lists.length > 0 ? (
        <div className="grid-responsive">
          {lists.map(list => (
            <ListCard 
              key={list.id} 
              list={list} 
              restaurantCount={list.restaurantCount} 
            />
          ))}
        </div>
      ) : (
        renderEmptyState()
      )}
    </>
  );
}

// Loading fallback for Suspense
function ListsLoading() {
  return (
    <div className="grid-responsive">
      {Array(6).fill(0).map((_, index) => (
        <div key={index} className="card h-48 skeleton" />
      ))}
    </div>
  );
}

// Main component with Suspense
export default function ListsPage() {
  return (
    <main className="min-h-screen bg-background-secondary">
      <Navbar />
      
      <Container variant="wide" className="py-6 sm:py-8">
        <Suspense fallback={<ListsLoading />}>
          <ListsContent />
        </Suspense>
      </Container>
    </main>
  );
}