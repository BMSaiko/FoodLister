'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Star, MapPin, List, Shuffle, Users, Award, ChevronRight, Sparkles, ChefHat, Utensils, Apple, Coffee, Wine } from 'lucide-react';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    setTimeout(() => setHeroVisible(true), 200);
    setTimeout(() => setFeaturesVisible(true), 600);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Floating decorative elements - optimized for mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary elements - visible on all devices */}
        <div className={`absolute top-20 left-10 w-16 h-16 sm:w-20 sm:h-20 bg-amber-300 rounded-full opacity-50 animate-pulse transition-all duration-1000 shadow-lg ${isVisible ? 'translate-y-0 opacity-50' : 'translate-y-10 opacity-0'}`}></div>
        <ChefHat className={`absolute top-60 right-10 w-6 h-6 sm:w-8 sm:h-8 text-amber-600 opacity-70 animate-bounce transition-all duration-1000 delay-700 drop-shadow-md ${isVisible ? 'scale-100 opacity-70' : 'scale-0 opacity-0'}`} />
        <Apple className={`absolute bottom-1/3 right-5 w-4 h-4 sm:w-5 sm:h-5 text-orange-600 opacity-55 animate-bounce transition-all duration-1000 delay-1500 ${isVisible ? 'translate-x-0 opacity-55' : 'translate-x-5 opacity-0'}`} />

        {/* Secondary elements - hidden on mobile for better performance */}
        <div className={`absolute top-40 right-20 w-12 h-12 sm:w-16 sm:h-16 bg-orange-400 rounded-full opacity-45 animate-bounce transition-all duration-1000 delay-300 shadow-md hidden sm:block ${isVisible ? 'translate-y-0 opacity-45' : 'translate-y-10 opacity-0'}`}></div>
        <div className={`absolute bottom-40 left-20 w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-full opacity-55 animate-pulse transition-all duration-1000 delay-500 shadow-lg hidden sm:block ${isVisible ? 'translate-y-0 opacity-55' : 'translate-y-10 opacity-0'}`}></div>

        {/* Additional elements - hidden on mobile */}
        <div className={`absolute top-32 left-1/3 w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 rounded-full opacity-60 animate-ping transition-all duration-1000 delay-900 hidden sm:block ${isVisible ? 'scale-100 opacity-60' : 'scale-0 opacity-0'}`}></div>
        <div className={`absolute bottom-20 right-1/3 w-3 h-3 sm:w-4 sm:h-4 bg-orange-600 rounded-full opacity-65 animate-pulse transition-all duration-1000 delay-1100 hidden sm:block ${isVisible ? 'scale-100 opacity-65' : 'scale-0 opacity-0'}`}></div>
        <MapPin className={`absolute top-1/2 left-5 w-5 h-5 sm:w-6 sm:h-6 text-amber-700 opacity-50 animate-bounce transition-all duration-1000 delay-1300 hidden sm:block ${isVisible ? 'translate-x-0 opacity-50' : '-translate-x-5 opacity-0'}`} />
      </div>
      {/* Hero Section */}
      <section className="pt-12 pb-16 px-4 sm:pt-16 sm:pb-20 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              <span className="inline-block animate-fade-in-up">Organize seus</span><br />
              <span className="text-amber-500 inline-block animate-fade-in-up animation-delay-300 bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent drop-shadow-lg">
                restaurantes favoritos
              </span>
            </h1>
            <p className={`text-lg xs:text-xl sm:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto transition-all duration-1000 delay-500 ${heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} px-2 sm:px-0`}>
              Descubra, organize e avalie seus restaurantes preferidos.
              <span className="font-semibold text-amber-600"> Crie listas personalizadas</span> e nunca mais esqueça um lugar incrível.
            </p>
          </div>
          <div className={`flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center transition-all duration-1000 delay-700 ${heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} px-4 sm:px-0`}>
            <Link
              href="/auth/signup"
              className="group bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-4 sm:px-8 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 relative overflow-hidden min-h-[48px] flex items-center justify-center"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Começar Agora
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </Link>
            <Link
              href="/restaurants"
              className="group bg-white/80 backdrop-blur-sm hover:bg-white text-gray-900 px-6 py-4 sm:px-8 sm:py-4 rounded-xl font-semibold text-base sm:text-lg border-2 border-gray-200 hover:border-amber-300 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 relative overflow-hidden min-h-[48px] flex items-center justify-center"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Explorar Restaurantes
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-12" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>

        {/* Animated background shapes */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className={`absolute top-1/4 left-1/4 w-32 h-32 bg-amber-400/60 rounded-full blur-xl animate-float transition-all duration-1000 shadow-2xl ${heroVisible ? 'opacity-60' : 'opacity-0'}`}></div>
          <div className={`absolute bottom-1/4 right-1/4 w-24 h-24 bg-orange-500/70 rounded-full blur-lg animate-float-delayed transition-all duration-1000 delay-300 shadow-xl ${heroVisible ? 'opacity-70' : 'opacity-0'}`}></div>
          {/* Additional background elements with better contrast */}
          <div className={`absolute top-1/2 right-1/2 w-20 h-20 bg-yellow-400/50 rounded-full blur-md animate-pulse transition-all duration-1000 delay-500 ${heroVisible ? 'opacity-50' : 'opacity-0'}`}></div>
          <div className={`absolute bottom-1/2 left-1/2 w-16 h-16 bg-amber-500/55 rounded-full blur-lg animate-bounce transition-all duration-1000 delay-700 ${heroVisible ? 'opacity-55' : 'opacity-0'}`}></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:py-20 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className={`text-center mb-12 sm:mb-16 transition-all duration-1000 ${featuresVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} px-2 sm:px-0`}>
            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Tudo que você precisa para organizar sua
              <span className="text-amber-500 block sm:inline"> experiência gastronômica</span>
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: MapPin,
                title: "Organize Restaurantes",
                description: "Cadastre e organize todos os seus restaurantes favoritos em um só lugar, com informações completas e localização.",
                delay: 0
              },
              {
                icon: List,
                title: "Crie Listas Personalizadas",
                description: "Organize seus restaurantes em listas temáticas como \"Românticos\", \"Para ocasiões especiais\" ou \"Favoritos da família\".",
                delay: 100
              },
              {
                icon: Star,
                title: "Avalie e Comente",
                description: "Deixe suas impressões sobre cada restaurante com avaliações e comentários detalhados para futuras visitas.",
                delay: 200
              },
              {
                icon: Shuffle,
                title: "Roleta de Descoberta",
                description: "Use nossa roleta interativa para descobrir novos restaurantes quando não sabe onde comer.",
                delay: 300
              },
              {
                icon: Users,
                title: "Compartilhe Experiências",
                description: "Compartilhe suas descobertas gastronômicas com amigos e veja recomendações de outros usuários.",
                delay: 400
              },
              {
                icon: Award,
                title: "Interface Intuitiva",
                description: "Design moderno e responsivo que funciona perfeitamente no seu computador, tablet ou smartphone.",
                delay: 500
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`group text-center p-8 rounded-2xl bg-gradient-to-br from-white to-amber-50/50 border border-amber-100/50 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 cursor-pointer relative overflow-hidden ${featuresVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                style={{ transitionDelay: `${feature.delay}ms` }}
              >
                {/* Hover background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Floating particles on hover */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-amber-300 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 transform translate-x-2 group-hover:translate-x-0"></div>
                <div className="absolute bottom-4 left-4 w-1 h-1 bg-orange-300 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200 transform -translate-x-2 group-hover:translate-x-0"></div>

                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <feature.icon className="h-10 w-10 text-amber-500 group-hover:text-orange-500 transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-amber-700 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{feature.description}</p>
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:py-20 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 relative overflow-hidden">
        {/* Animated background elements with better contrast - reduced for mobile */}
        <div className="absolute inset-0 hidden sm:block">
          <div className="absolute top-10 left-10 w-16 h-16 bg-yellow-200/35 rounded-full animate-float shadow-lg"></div>
          <div className="absolute top-20 right-20 w-12 h-12 bg-orange-300/40 rounded-full animate-float-delayed shadow-md"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-amber-200/30 rounded-full animate-pulse shadow-lg"></div>
          <div className="absolute bottom-10 right-1/3 w-14 h-14 bg-red-300/35 rounded-full animate-bounce shadow-md"></div>
          {/* Additional high-contrast elements */}
          <div className="absolute top-1/4 left-1/2 w-8 h-8 bg-yellow-300/45 rounded-full animate-ping shadow-lg"></div>
          <ChefHat className="absolute top-1/3 left-1/4 w-6 h-6 text-yellow-200 opacity-60 animate-bounce drop-shadow-lg" />
          <Apple className="absolute bottom-1/4 right-1/4 w-5 h-5 text-orange-200 opacity-65 animate-bounce drop-shadow-md" />
          <Coffee className="absolute top-1/2 right-1/5 w-7 h-7 text-amber-200 opacity-55 animate-pulse drop-shadow-lg" />
          <div className="absolute top-2/3 left-1/3 w-6 h-6 bg-red-400/50 rounded-full animate-bounce shadow-lg"></div>
          <div className="absolute bottom-1/2 right-2/3 w-9 h-9 bg-yellow-400/40 rounded-full animate-float-delayed shadow-md"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center text-white relative z-10 px-2 sm:px-0">
          <div className="animate-fade-in-up">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 drop-shadow-lg">
              Nunca mais esqueça um restaurante
              <span className="text-yellow-200 block sm:inline"> incrível</span>
            </h2>
            <p className="text-lg xs:text-xl mb-8 sm:mb-12 opacity-95 drop-shadow-md max-w-2xl mx-auto leading-relaxed">
              Com o FoodLister, você tem todas as suas experiências gastronômicas organizadas
              e acessíveis a qualquer momento. Encontre facilmente aquele restaurante perfeito
              para cada ocasião.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            {[
              { icon: '∞', text: 'Restaurantes ilimitados', delay: 0, bgColor: 'from-yellow-400/20 to-amber-400/20' },
              { icon: '📱', text: 'Acesso em qualquer dispositivo', delay: 200, bgColor: 'from-orange-400/25 to-red-400/25' },
              { icon: '🔒', text: 'Seus dados sempre seguros', delay: 400, bgColor: 'from-amber-400/20 to-orange-400/20' }
            ].map((benefit, index) => (
              <div
                key={index}
                className={`group bg-gradient-to-br ${benefit.bgColor} backdrop-blur-sm rounded-2xl p-8 border border-white/30 hover:border-white/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 shadow-2xl hover:shadow-3xl relative overflow-hidden`}
                style={{ animationDelay: `${benefit.delay}ms` }}
              >
                {/* Enhanced background effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

                <div className="relative z-10">
                  <div className="text-5xl mb-4 animate-pulse group-hover:animate-bounce transition-all duration-300 drop-shadow-lg">
                    {benefit.icon}
                  </div>
                  <p className="text-lg font-semibold drop-shadow-md group-hover:text-yellow-200 transition-colors duration-300">
                    {benefit.text}
                  </p>
                </div>

                {/* Enhanced hover effect particles */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute top-2 right-2 w-1 h-1 bg-yellow-200 rounded-full animate-ping shadow-lg"></div>
                  <div className="absolute bottom-2 left-2 w-1 h-1 bg-yellow-200 rounded-full animate-ping animation-delay-300 shadow-lg"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-orange-200 rounded-full animate-pulse shadow-md"></div>
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:py-20 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
        {/* Enhanced animated background particles - optimized for mobile */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400 rounded-full opacity-60 animate-pulse shadow-lg"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-orange-400 rounded-full opacity-40 animate-ping shadow-md"></div>
          <div className="absolute bottom-1/4 left-1/2 w-3 h-3 bg-yellow-400 rounded-full opacity-50 animate-bounce shadow-lg"></div>
          <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-amber-300 rounded-full opacity-70 animate-pulse animation-delay-500 shadow-md"></div>
          {/* Additional decorative elements - reduced for mobile */}
          <div className="absolute top-1/6 left-1/3 w-3 h-3 bg-red-400 rounded-full opacity-45 animate-float shadow-lg hidden sm:block"></div>
          <div className="absolute top-2/3 right-1/6 w-2 h-2 bg-orange-300 rounded-full opacity-55 animate-float-delayed shadow-md hidden sm:block"></div>
          <div className="absolute bottom-1/6 left-2/3 w-2 h-2 bg-yellow-300 rounded-full opacity-65 animate-bounce shadow-lg"></div>
          <div className="absolute top-1/2 left-1/6 w-4 h-4 bg-amber-500 rounded-full opacity-40 animate-pulse animation-delay-300 shadow-xl hidden sm:block"></div>
          <Coffee className="absolute top-1/5 right-1/2 w-3 h-3 text-amber-300 opacity-50 animate-bounce drop-shadow-md hidden sm:block" />
          <Wine className="absolute bottom-2/3 left-1/5 w-2 h-2 text-orange-300 opacity-55 animate-bounce drop-shadow-lg" />
          <MapPin className="absolute top-3/4 right-1/4 w-3 h-3 text-yellow-300 opacity-60 animate-pulse drop-shadow-md hidden sm:block" />
          <Utensils className="absolute bottom-1/5 right-3/4 w-2 h-2 text-red-300 opacity-50 animate-spin drop-shadow-lg" />
          {/* Larger accent elements - hidden on mobile */}
          <div className="absolute top-1/8 left-1/2 w-5 h-5 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full opacity-30 animate-float blur-sm hidden sm:block"></div>
          <div className="absolute bottom-1/4 right-1/3 w-6 h-6 bg-gradient-to-r from-orange-400 to-red-400 rounded-full opacity-25 animate-float-delayed blur-sm hidden sm:block"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 px-2 sm:px-0">
          <div className="animate-fade-in-up">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 drop-shadow-lg">
              Pronto para começar sua
              <span className="text-amber-400 block sm:inline"> jornada gastronômica</span>?
            </h2>
            <p className="text-lg xs:text-xl mb-6 sm:mb-8 opacity-90 drop-shadow-md max-w-2xl mx-auto leading-relaxed">
              Junte-se a milhares de usuários que já organizam suas experiências culinárias conosco.
              <span className="text-amber-300 font-semibold"> Comece agora mesmo!</span>
            </p>
          </div>

          <div className="animate-fade-in-up animation-delay-300">
            <Link
              href="/auth/signup"
              className="group bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:via-orange-400 hover:to-red-400 text-white px-8 py-4 sm:px-10 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-110 relative overflow-hidden inline-block min-h-[52px] sm:min-h-[60px]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:rotate-12" />
                Criar Conta Gratuita
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:-rotate-12" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              {/* Ripple effect */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 rounded-2xl border-2 border-white/50 animate-ping"></div>
                <div className="absolute inset-0 rounded-2xl border-2 border-white/50 animate-ping animation-delay-200"></div>
              </div>
            </Link>
          </div>

          {/* Additional encouragement */}
          <div className="mt-6 sm:mt-8 animate-fade-in-up animation-delay-500">
            <p className="text-amber-200 text-xs sm:text-sm opacity-75">
              🎉 <strong>Grátis para sempre</strong> • Sem cartão de crédito • Comece em segundos
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
