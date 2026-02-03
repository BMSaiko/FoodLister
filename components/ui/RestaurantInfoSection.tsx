import React from 'react';
import { MapPin, Globe, FileText, ImageIcon, Phone, Smartphone, Home } from 'lucide-react';
import HorizontalImageList from './HorizontalImageList';

interface RestaurantInfoSectionProps {
  location?: string;
  sourceUrl?: string;
  menuLinks?: string[];
  menuImages?: string[];
  phoneNumbers?: string[];
  onOpenMap?: () => void;
}

// Helper function to detect if a number is mobile or fixed
const detectPhoneType = (phoneNumber: string): string => {
  // Clean the number removing spaces, hyphens, parentheses
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');

  // Remove country code if exists (+351 or 351)
  let numberWithoutCountry = cleanNumber;
  if (cleanNumber.startsWith('+351')) {
    numberWithoutCountry = cleanNumber.substring(4);
  } else if (cleanNumber.startsWith('351')) {
    numberWithoutCountry = cleanNumber.substring(3);
  }

  // Check first 2 digits (area code)
  const areaCode = numberWithoutCountry.substring(0, 2);

  // Mobile codes in Portugal: 91, 92, 93, 96
  const mobileCodes = ['91', '92', '93', '96'];
  return mobileCodes.includes(areaCode) ? 'mobile' : 'landline';
};

export default function RestaurantInfoSection({
  location,
  sourceUrl,
  menuLinks = [],
  menuImages = [],
  phoneNumbers = [],
  onOpenMap
}: RestaurantInfoSectionProps) {
  
  // Check if we have any information to display
  const hasInfo = location || sourceUrl || menuLinks.length > 0 || menuImages.length > 0 || phoneNumbers.length > 0;

  if (!hasInfo) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-4">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
        <span className="mr-2">📋</span>
        Informações do Restaurante
      </h3>
      
      <div className="space-y-3 sm:space-y-4">
        {/* Location */}
        {location && (
          <div
            className="flex items-center p-2 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl border border-blue-200 hover:bg-blue-100 active:bg-blue-200 transition-all duration-200 cursor-pointer min-h-[48px] sm:min-h-[64px]"
            onClick={onOpenMap}
          >
            <div className="flex-shrink-0 bg-white rounded-full p-1 sm:p-2 shadow-sm mr-2 sm:mr-4">
              <MapPin className="h-4 w-4 sm:h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-medium text-gray-800 mb-1">Localização</div>
              <p className="text-xs sm:text-sm text-gray-600 truncate">{location}</p>
            </div>
            <div className="flex-shrink-0 text-blue-600 text-xs sm:text-sm font-medium">
              Abrir no mapa
            </div>
          </div>
        )}

        {/* Phone Numbers */}
        {phoneNumbers.length > 0 && (
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
              <Phone className="h-3 w-3 sm:h-4 w-4 mr-1 sm:mr-2 text-amber-500" />
              Telefones para contato
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {phoneNumbers.map((phone, index) => {
                const phoneType = detectPhoneType(phone);
                const PhoneIcon = phoneType === 'mobile' ? Smartphone : Home;

                return (
                  <div
                    key={index}
                    className="flex items-center p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-amber-300 transition-all duration-200 group hover:shadow-md"
                  >
                    <div className="flex-shrink-0 bg-white rounded-full p-1 sm:p-2 shadow-sm mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-200">
                      <PhoneIcon className="h-3 w-3 sm:h-4 w-4 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">{phone}</span>
                        <span className="text-xs text-gray-500 bg-amber-100 px-1 sm:px-2 py-0.5 rounded-full">
                          {phoneType === 'mobile' ? 'móvel' : 'fixo'}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`tel:${phone}`}
                      className="ml-1 sm:ml-2 p-0.5 sm:p-1 hover:bg-amber-100 rounded-full transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="h-3 w-3 sm:h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Source URL */}
        {sourceUrl && (
          <div 
            className="flex items-center p-2 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl border border-purple-200 hover:bg-purple-100 active:bg-purple-200 transition-all duration-200 cursor-pointer min-h-[48px] sm:min-h-[64px]"
            onClick={() => window.open(sourceUrl, '_blank', 'noopener,noreferrer')}
          >
            <div className="flex-shrink-0 bg-white rounded-full p-1 sm:p-2 shadow-sm mr-2 sm:mr-4">
              <Globe className="h-4 w-4 sm:h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-medium text-gray-800 mb-1">Fonte Original</div>
              <p className="text-xs sm:text-sm text-gray-600 truncate">{sourceUrl}</p>
            </div>
            <a 
              href={sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-800 hover:underline text-xs sm:text-sm font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              Visitar site
            </a>
          </div>
        )}

        {/* Menu Links */}
        {menuLinks.length > 0 && (
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center text-gray-700 text-xs sm:text-sm font-medium">
              <Globe className="h-3 w-3 sm:h-4 w-4 mr-1 sm:mr-2 text-amber-500" />
              Links de Menus ({menuLinks.length})
            </div>
            <div className="space-y-1 sm:space-y-2">
              {menuLinks.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center p-2 sm:p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 hover:bg-amber-100 active:bg-amber-200 transition-all duration-200 cursor-pointer min-h-[44px] sm:min-h-[56px]"
                  onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}
                >
                  <div className="flex-shrink-0 bg-white rounded-full p-1 sm:p-2 shadow-sm mr-2 sm:mr-3">
                    <FileText className="h-3 w-3 sm:h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-700 truncate">{link}</p>
                  </div>
                  <span className="text-amber-600 hover:text-amber-800 hover:underline text-xs sm:text-sm font-medium ml-1 sm:ml-2">
                    Ver menu
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu Images */}
        {menuImages.length > 0 && (
          <HorizontalImageList
            images={menuImages}
            title="Imagens do Menu"
          />
        )}
      </div>
    </div>
  );
}
