import React, { useState } from "react";
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

const detectPhoneType = (phone: string) => {
  const clean = phone.replace(/[\s\-\(\)]/g, "");
  let num = clean;
  if (clean.startsWith("+351")) num = clean.substring(4);
  else if (clean.startsWith("351")) num = clean.substring(3);
  return ["91", "92", "93", "96"].includes(num.substring(0, 2)) ? "mobile" : "landline";
};

export default function InfoBento({ location, sourceUrl, menuLinks = [], menuImages = [], phoneNumbers = [], latitude, longitude }: InfoBentoProps) {
  const { openMapModal } = useModal();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const hasInfo = location || sourceUrl || menuLinks.length > 0 || phoneNumbers.length > 0;
  const hasMenuImages = menuImages && menuImages.length > 0;
  if (!hasInfo && !hasMenuImages) return null;

  const CardShell = ({ children, id, className = "", span2 = false }: { children: React.ReactNode; id: string; className?: string; span2?: boolean }) => (
    <div
      className={`p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06] transition-all duration-300 ${hoveredCard === id ? "ring-1 ring-amber-500/20 bg-white/[0.04]" : ""} ${span2 ? "md:col-span-2" : ""} ${className}`}
      onMouseEnter={() => setHoveredCard(id)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      <div className={`p-4 rounded-2xl bg-white/[0.03] h-full transition-all duration-300 ${hoveredCard === id ? "bg-white/[0.05]" : ""}`}>
        {children}
      </div>
    </div>
  );

  const IconBox = ({ color, children }: { color: string; children: React.ReactNode }) => (
    <div className={`flex-shrink-0 rounded-xl p-2.5 transition-transform duration-200 group-hover:scale-110 ${color}`}>
      {children}
    </div>
  );

  return (
    <section className="mb-8">
      {hasInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {/* Location — span 2 */}
          {location && (
            <CardShell id="location" span2>
              <div className="flex items-center gap-3 cursor-pointer h-full" onClick={() => openMapModal({ location, latitude, longitude, source_url: sourceUrl })}>
                <IconBox color="bg-amber-500/10"><MapPin className="h-5 w-5 text-amber-400" /></IconBox>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium text-white/35 uppercase tracking-wider mb-0.5">Localizacao</div>
                  <p className="text-sm text-white/75 truncate">{location}</p>
                </div>
                <span className="text-xs text-amber-400/50 font-medium flex-shrink-0 transition-all duration-200 group-hover:text-amber-400 group-hover:translate-x-0.5">Mapa</span>
              </div>
            </CardShell>
          )}

          {/* Website */}
          {sourceUrl && (
            <CardShell id="website">
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 h-full group">
                <IconBox color="bg-blue-500/10"><Globe className="h-5 w-5 text-blue-400" /></IconBox>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium text-white/35 uppercase tracking-wider mb-0.5">Website</div>
                  <p className="text-sm text-blue-400 truncate">Abrir site</p>
                </div>
              </a>
            </CardShell>
          )}

          {/* Menu Link */}
          {menuLinks && menuLinks.length > 0 && (
            <CardShell id="menu-link">
              <a href={menuLinks[0]} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 h-full group">
                <IconBox color="bg-orange-500/10"><FileText className="h-5 w-5 text-orange-400" /></IconBox>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium text-white/35 uppercase tracking-wider mb-0.5">Menu</div>
                  <p className="text-sm text-orange-400 truncate">Ver menu</p>
                </div>
              </a>
            </CardShell>
          )}

          {/* Phone */}
          {phoneNumbers && phoneNumbers.length > 0 && (
            <CardShell id="phone">
              <a href={"tel:" + phoneNumbers[0]} className="flex items-center gap-3 h-full group">
                <IconBox color="bg-emerald-500/10">
                  {detectPhoneType(phoneNumbers[0]) === "mobile" ? <Smartphone className="h-5 w-5 text-emerald-400" /> : <Phone className="h-5 w-5 text-emerald-400" />}
                </IconBox>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium text-white/35 uppercase tracking-wider mb-0.5">Telefone</div>
                  <p className="text-sm text-emerald-400 truncate">{phoneNumbers[0]}</p>
                </div>
              </a>
            </CardShell>
          )}

          {/* Additional phones */}
          {phoneNumbers && phoneNumbers.length > 1 && (
            <div className="md:col-span-2 space-y-1.5">
              {phoneNumbers.slice(1).map((phone, i) => (
                <a key={i} href={"tel:" + phone} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-150">
                  <div className="bg-white/[0.04] rounded-full p-1.5">
                    {detectPhoneType(phone) === "mobile" ? <Smartphone className="h-3 w-3 text-white/35" /> : <Phone className="h-3 w-3 text-white/35" />}
                  </div>
                  <span className="text-sm text-white/55">{phone}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Menu Gallery */}
      {hasMenuImages && <MenuGallery images={menuImages} restaurantName="Menu" />}
    </section>
  );
}
