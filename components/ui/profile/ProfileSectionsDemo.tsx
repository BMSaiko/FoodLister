import React from 'react';
import { Star, List, Utensils } from 'lucide-react';
import { TouchButton } from './shared';

interface ProfileSectionsDemoProps {
  onBack?: () => void;
}

const ProfileSectionsDemo: React.FC<ProfileSectionsDemoProps> = ({ onBack }) => {
  const mockReviews = [
    {
      id: '1',
      rating: 4.5,
      comment: 'Excelente restaurante com um serviço impecável e pratos deliciosos. Recomendo especialmente o prato principal!',
      amountSpent: 45.50,
      createdAt: '2024-01-15T10:30:00Z',
      restaurant: {
        id: '1',
        name: 'Restaurante Italiano',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
        rating: 4.2
      }
    },
    {
      id: '2',
      rating: 3.0,
      comment: 'Ambiente agradável, mas o tempo de espera foi um pouco longo. A comida estava boa.',
      amountSpent: 32.00,
      createdAt: '2024-01-10T19:15:00Z',
      restaurant: {
        id: '2',
        name: 'Pizzaria do Centro',
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
        rating: 3.8
      }
    }
  ];

  const mockLists = [
    {
      id: '1',
      name: 'Restaurantes Italianos',
      description: 'Minha seleção dos melhores restaurantes italianos da cidade.',
      createdAt: '2024-01-20T14:20:00Z',
      restaurantCount: 8
    },
    {
      id: '2',
      name: 'Para datas especiais',
      description: 'Restaurantes românticos e especiais para comemorações.',
      createdAt: '2024-01-18T16:45:00Z',
      restaurantCount: 5
    }
  ];

  const mockRestaurants = [
    {
      id: '1',
      name: 'Restaurante Gourmet',
      description: 'Culinária contemporânea com ingredientes frescos e sazonais.',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
      location: 'Centro',
      priceLevel: 3,
      rating: 4.5,
      createdAt: '2024-01-25T11:30:00Z',
      cuisineTypes: ['Gourmet', 'Contemporâneo'],
      dietaryOptions: ['Vegetariano', 'Vegano'],
      features: ['Wi-Fi', 'Estacionamento', 'Entrega']
    },
    {
      id: '2',
      name: 'Café da Praça',
      description: 'Ambiente descontraído com ótimos cafés e lanches.',
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
      location: 'Praça Central',
      priceLevel: 1,
      rating: 4.0,
      createdAt: '2024-01-22T09:15:00Z',
      cuisineTypes: ['Cafeteria', 'Lanches'],
      dietaryOptions: ['Vegetariano'],
      features: ['Wi-Fi', 'Acesso para deficientes']
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demonstração de Seções de Perfil</h1>
          <p className="text-gray-600 mt-1">Veja como as seções se comportam em diferentes dispositivos</p>
        </div>
        {onBack && (
          <TouchButton
            onClick={onBack}
            variant="secondary"
            size="md"
            icon={<Star className="h-4 w-4" />}
          >
            Voltar
          </TouchButton>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-semibold text-amber-800 mb-2">Como testar:</h3>
        <ul className="text-amber-700 text-sm space-y-1">
          <li>• Use o inspetor do navegador para mudar o tamanho da tela</li>
          <li>• Teste em dispositivos reais (mobile, tablet, desktop)</li>
          <li>• Verifique a área de toque (mínimo 44px)</li>
          <li>• Observe as transições e animações</li>
          <li>• Teste a acessibilidade com leitores de tela</li>
        </ul>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Star className="h-6 w-6 text-amber-500" />
          <h2 className="text-xl font-semibold text-gray-900">Avaliações do Usuário</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {mockReviews.map((review) => (
            <div key={review.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-all duration-200 group touch-space">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-current" />
                      <span className="font-semibold">{review.rating}/5</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Utensils className="h-4 w-4 text-orange-500" />
                      <span>Nota média: {review.restaurant.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 touch-target">
                  <img
                    src={review.restaurant.imageUrl}
                    alt={review.restaurant.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="mb-3">
                <h4 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                  {review.restaurant.name}
                </h4>
              </div>

              <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 mb-4 ios-safe-padding-bottom">
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base line-clamp-4">
                  {review.comment}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start sm:items-center justify-between text-sm text-gray-500">
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm bg-green-100 text-green-700">
                    <span className="h-3 w-3 sm:h-4 sm:w-4 mr-1">📅</span>
                    Avaliado em {new Date(review.createdAt).toLocaleDateString('pt-PT')}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="h-4 w-4">💶</span>
                    <span>{review.amountSpent?.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <span className="h-4 w-4">💬</span>
                  <span>Avaliação</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lists Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <List className="h-6 w-6 text-amber-500" />
          <h2 className="text-xl font-semibold text-gray-900">Listas do Usuário</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {mockLists.map((list) => (
            <div key={list.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-all duration-200 group touch-space">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-amber-500 text-white p-2 rounded-lg">
                      <List className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                      {list.name}
                    </h3>
                  </div>
                  
                  <p className="text-gray-700 text-sm line-clamp-3 mb-3 ios-safe-padding-bottom">
                    {list.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-gray-600">
                    <div className="bg-white rounded-lg px-3 py-1 border border-gray-200">
                      <span className="text-sm font-medium text-gray-700">
                        <span className="h-4 w-4 inline mr-1">🍽️</span>
                        {list.restaurantCount} restaurantes
                      </span>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm bg-green-100 text-green-700">
                      <span className="h-3 w-3 sm:h-4 sm:w-4 mr-1">📅</span>
                      Criada em {new Date(list.createdAt).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center touch-target">
                  <span className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors">➡️</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start sm:items-center justify-between">
                <div className="bg-white rounded-lg px-3 py-1 border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">
                    <span className="h-4 w-4 inline mr-1">🍽️</span>
                    {list.restaurantCount} restaurantes
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Ver lista completa
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Restaurants Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Utensils className="h-6 w-6 text-amber-500" />
          <h2 className="text-xl font-semibold text-gray-900">Restaurantes do Usuário</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {mockRestaurants.map((restaurant) => (
            <div key={restaurant.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-all duration-200 group touch-space">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 sm:gap-3 mb-3">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-current" />
                      <span className="text-sm font-semibold text-gray-700">{restaurant.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="h-4 w-4">💰</span>
                      <span className="text-sm font-medium text-gray-700">
                        {'$'.repeat(restaurant.priceLevel || 1)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-sm line-clamp-2 mb-3 ios-safe-padding-bottom">
                    {restaurant.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm bg-blue-100 text-blue-700">
                      <span className="h-3 w-3 sm:h-4 sm:w-4 mr-1">📍</span>
                      {restaurant.location}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm bg-orange-100 text-orange-700">
                      <span className="h-3 w-3 sm:h-4 sm:w-4 mr-1">🍝</span>
                      {restaurant.cuisineTypes[0]}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm bg-green-100 text-green-700">
                      <span className="h-3 w-3 sm:h-4 sm:w-4 mr-1">📅</span>
                      Adicionado em {new Date(restaurant.createdAt).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                </div>
                
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 touch-target">
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-white rounded-full text-xs sm:text-sm text-gray-600 border border-gray-200">
                  Tipos: {restaurant.cuisineTypes.join(', ')}
                </span>
                <span className="px-2 py-1 bg-white rounded-full text-xs sm:text-sm text-gray-600 border border-gray-200">
                  Opções: {restaurant.dietaryOptions.join(', ')}
                </span>
                <span className="px-2 py-1 bg-white rounded-full text-xs sm:text-sm text-gray-600 border border-gray-200">
                  Recursos: {restaurant.features.join(', ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Summary */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Melhorias Implementadas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-amber-600 mb-2">📱 Mobile-First</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Grid responsivo (1→2→3 colunas)</li>
              <li>• Área de toque mínima de 44px</li>
              <li>• Espaçamento otimizado para mobile</li>
              <li>• Textos legíveis em telas pequenas</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-amber-600 mb-2">🎨 Design Consistente</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Componentes reutilizáveis</li>
              <li>• Paleta de cores harmoniosa</li>
              <li>• Tipografia consistente</li>
              <li>• Espaçamento padronizado</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-amber-600 mb-2">⚡ Performance</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Imagens lazy loading</li>
              <li>• Animações otimizadas</li>
              <li>• Componentes leves</li>
              <li>• CSS-in-JS eficiente</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-amber-600 mb-2">♿ Acessibilidade</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Contraste adequado</li>
              <li>• Navegação por teclado</li>
              <li>• ARIA labels</li>
              <li>• Foco visível</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-amber-600 mb-2">🎯 UX Mobile</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Feedback tátil</li>
              <li>• Espaçamento seguro iOS</li>
              <li>• Botões touch-friendly</li>
              <li>• Transições suaves</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-amber-600 mb-2">🔄 Responsividade</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Breakpoints inteligentes</li>
              <li>• Layouts fluidos</li>
              <li>• Texto responsivo</li>
              <li>• Imagens adaptativas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSectionsDemo;