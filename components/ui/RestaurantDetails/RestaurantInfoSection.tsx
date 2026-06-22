import React from 'react';
import { MapPin, Globe, FileText, ImageIcon, Phone, Smartphone, Home } from 'lucide-react';
import HorizontalImageList from './HorizontalImageList';
import { useModal } from '@/contexts/ModalContext';

interface RestaurantInfoSectionProps {
  location?: string;
  sourceUrl?: string;
  menuLinks?: string[];
  menuImages?: string[];
  phoneNumbers?: string[];
  latitude?: number;
  longitude?: number;
  source_url?: string;
}

const detectPhoneType = (phoneNumber: string): string => {
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
  let numberWithoutCountry = cleanNumber;
  if (cleanNumber.startsWith('+351')) {
    numberWithoutCountry = cleanNumber.substring(4);
  } else if (cleanNumber.startsWith('351')) {
    numberWithoutCountry = cleanNumber.substring(3);
  }
  const areaCode = numberWithoutCountry.substring(0, 2);
  const mobileCodes = ['91', '92', '93', '96'];
  return mobileCodes.includes(areaCode) ? 'mobile' : 'landline';
};

export default function RestaurantInfoSection({
  location,
  sourceUrl,
  menuLinks = [],
  menuImages = [],
  phoneNumbers = [],
  latitude,
  longitude,
  source_url
}: RestaurantInfoSectionProps) {

  const { openMapModal } = useModal();

  const hasInfo = location || sourceUrl || menuLinks.length > 0 || menuImages.length > 0 || phoneNumbers.length > 0;

  if (!hasInfo) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 sm:p-6 mb-4">
      <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
        Informacoes
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {location && (
          <div
            className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl ring-1 ring-white/10 hover:bg-white/[0.05] transition-colors duration-150 cursor-pointer min-h-[48px]"
            onClick={() => openMapModal({ location, latitude, longitude, source_url })}
          >
            <div className="flex-shrink-0 bg-amber-500/10 rounded-lg p-2">
              <MapPin className="h-4 w-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white/40 mb-0.5">Localizacao</div>
              <p className="text-sm text-white/80 truncate">{location}</p>
            </div>
          </div>
        )}

        {(sourceUrl || source_url) && (
          <a
            href={sourceUrl || source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl ring-1 ring-white/10 hover:bg-white/[0.05] transition-colors duration-150 min-h-[48px]"
          >
            <div className="flex-shrink-0 bg-blue-500/10 rounded-lg p-2">
              <Globe className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white/40 mb-0.5">Website</div>
              <p className="text-sm text-blue-400 truncate">Abrir site</p>
            </div>
          </a>
        )}

        {menuLinks && menuLinks.length > 0 && (
          <a
            href={menuLinks[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl ring-1 ring-white/10 hover:bg-white/[0.05] transition-colors duration-150 min-h-[48px]"
          >
            <div className="flex-shrink-0 bg-orange-500/10 rounded-lg p-2">
              <FileText className="h-4 w-4 text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white/40 mb-0.5">Menu</div>
              <p className="text-sm text-orange-400 truncate">Ver menu</p>
            </div>
          </a>
        )}

        {phoneNumbers && phoneNumbers.length > 0 && (
          <a
            href={'tel:' + phoneNumbers[0]}
            className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl ring-1 ring-white/10 hover:bg-white/[0.05] transition-colors duration-150 min-h-[48px]"
          >
            <div className="flex-shrink-0 bg-green-500/10 rounded-lg p-2">
              {detectPhoneType(phoneNumbers[0]) === 'mobile' ? (
                <Smartphone className="h-4 w-4 text-green-400" />
              ) : (
                <Phone className="h-4 w-4 text-green-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white/40 mb-0.5">Telefone</div>
              <p className="text-sm text-green-400 truncate">{phoneNumbers[0]}</p>
            </div>
          </a>
        )}
      </div>

      {menuImages && menuImages.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center mb-3">
            <div className="bg-purple-500/10 rounded-lg p-1.5 mr-2">
              <ImageIcon className="h-4 w-4 text-purple-400" />
            </div>
            <span className="text-sm font-medium text-white/70">Fotos do Menu</span>
          </div>
          <HorizontalImageList
            images={menuImages}
            title="Imagens do Menu"
          />
        </div>
      )}

      {phoneNumbers && phoneNumbers.length > 1 && (
        <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-2">
          {phoneNumbers.slice(1).map((phone, index) => (
            <a
              key={index}
              href={'tel:' + phone}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors duration-150"
            >
              <div className="bg-white/[0.05] rounded-full p-1.5">
                {detectPhoneType(phone) === 'mobile' ? (
                  <Smartphone className="h-3 w-3 text-white/40" />
                ) : (
                  <Phone className="h-3 w-3 text-white/40" />
                )}
              </div>
              <span className="text-sm text-white/60">{phone}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
