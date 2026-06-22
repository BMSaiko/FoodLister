import React from "react";
import { MapPin, Globe, FileText, Phone, Smartphone, ImageIcon } from "lucide-react";
import { useModal } from "@/contexts/ModalContext";
import MenuGallery from "./MenuGallery";

interface InfoBentoProps {
  location?: string;
  sourceUrl?: string;
  menuLinks?: string[];
  menuImages?: string[];
  phoneNumbers?: string[];
  latitude?: number;
  longitude?: number;
}

const detectPhoneType = (phone: string): string => {
  const clean = phone.replace(/[\s\-\(\)]/g, "");
  let num = clean;
  if (clean.startsWith("+351")) num = clean.substring(4);
  else if (clean.startsWith("351")) num = clean.substring(3);
  const areaCode = num.substring(0, 2);
  return ["91", "92", "93", "96"].includes(areaCode) ? "mobile" : "landline";
};

export default function InfoBento({
  location,
  sourceUrl,
  menuLinks = [],
  menuImages = [],
  phoneNumbers = [],
  latitude,
  longitude
}: InfoBentoProps) {
  const { openMapModal } = useModal();
  const hasInfo = location || sourceUrl || menuLinks.length > 0 || phoneNumbers.length > 0;
  const hasMenuImages = menuImages && menuImages.length > 0;
  if (!hasInfo && !hasMenuImages) return null;

  return (
    <section className="mb-6">
      {/* Bento Grid */}
      {hasInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {location && (
            <div
              className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-2xl ring-1 ring-white/[0.06] hover:bg-white/[0.05] transition-colors duration-150 cursor-pointer min-h-[60px] md:col-span-2"
              onClick={() => openMapModal({ location, latitude, longitude })}
            >
              <div className="flex-shrink-0 bg-amber-500/10 rounded-xl p-2.5">
                <MapPin className="h-5 w-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white/40 mb-0.5">Localizacao</div>
                <p className="text-sm text-white/80 truncate">{location}</p>
              </div>
              <span className="text-xs text-amber-400/60 font-medium flex-shrink-0">Abrir mapa</span>
            </div>
          )}

          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-2xl ring-1 ring-white/[0.06] hover:bg-white/[0.05] transition-colors duration-150 min-h-[60px]"
            >
              <div className="flex-shrink-0 bg-blue-500/10 rounded-xl p-2.5">
                <Globe className="h-5 w-5 text-blue-400" />
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
              className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-2xl ring-1 ring-white/[0.06] hover:bg-white/[0.05] transition-colors duration-150 min-h-[60px]"
            >
              <div className="flex-shrink-0 bg-orange-500/10 rounded-xl p-2.5">
                <FileText className="h-5 w-5 text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white/40 mb-0.5">Menu</div>
                <p className="text-sm text-orange-400 truncate">Ver menu</p>
              </div>
            </a>
          )}

          {phoneNumbers && phoneNumbers.length > 0 && (
            <a
              href={"tel:" + phoneNumbers[0]}
              className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-2xl ring-1 ring-white/[0.06] hover:bg-white/[0.05] transition-colors duration-150 min-h-[60px]"
            >
              <div className="flex-shrink-0 bg-green-500/10 rounded-xl p-2.5">
                {detectPhoneType(phoneNumbers[0]) === "mobile" ? (
                  <Smartphone className="h-5 w-5 text-green-400" />
                ) : (
                  <Phone className="h-5 w-5 text-green-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white/40 mb-0.5">Telefone</div>
                <p className="text-sm text-green-400 truncate">{phoneNumbers[0]}</p>
              </div>
            </a>
          )}

          {/* Additional phones */}
          {phoneNumbers && phoneNumbers.length > 1 && (
            <div className="md:col-span-2 space-y-2">
              {phoneNumbers.slice(1).map((phone, i) => (
                <a
                  key={i}
                  href={"tel:" + phone}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-150"
                >
                  <div className="bg-white/[0.05] rounded-full p-1.5">
                    {detectPhoneType(phone) === "mobile" ? (
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
      )}

      {/* Menu Gallery */}
      {hasMenuImages && (
        <MenuGallery images={menuImages} restaurantName="Menu" />
      )}
    </section>
  );
}
