"use client";

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Modal from '@/components/ui/Modal';
import Icon from '@/components/ui/icons/Icon';

export const DIRECTIONS_PREF_KEY = 'foodlister:directions-app';

export type DirectionsApp = 'google' | 'waze' | 'apple';

export interface DirectionsPlace {
  name: string;
  location?: string;
  latitude: number;
  longitude: number;
}

export function directionsLinks(place: DirectionsPlace): Record<DirectionsApp, string> {
  const ll = `${place.latitude},${place.longitude}`;
  const q = encodeURIComponent(place.location || place.name);
  return {
    google: `https://www.google.com/maps/dir/?api=1&destination=${ll}`,
    waze: `https://waze.com/ul?ll=${ll}&navigate=yes`,
    apple: `https://maps.apple.com/?daddr=${ll}&q=${q}`,
  };
}

const APPS: { id: DirectionsApp; label: string; hint: string; badge: string }[] = [
  { id: 'google', label: 'Google Maps', hint: 'Abre a app ou o site', badge: 'G' },
  { id: 'waze', label: 'Waze', hint: 'Navegação com trânsito', badge: 'W' },
  { id: 'apple', label: 'Apple Maps', hint: 'iPhone, iPad e Mac', badge: 'M' },
];

interface DirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: DirectionsPlace;
}

export default function DirectionsModal({ isOpen, onClose, place }: DirectionsModalProps) {
  const [remember, setRemember] = useState(false);
  const links = directionsLinks(place);
  const address = place.location || `${place.latitude}, ${place.longitude}`;

  const choose = (app: DirectionsApp) => {
    if (remember) {
      try {
        localStorage.setItem(DIRECTIONS_PREF_KEY, app);
      } catch {
        // armazenamento indisponível: a escolha não é lembrada
      }
    }
    onClose();
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success('Morada copiada');
    } catch {
      toast.error('Não foi possível copiar a morada.');
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" variant="bottom-sheet" ariaLabel="Como chegar">
      <div className="p-5">
        <h3 className="text-lg font-bold text-white/90">Como chegar</h3>
        <p className="mt-1 text-sm text-white/80">{place.name}</p>
        <p className="text-sm text-white/50 break-words">{address}</p>

        <div className="mt-4 space-y-2">
          {APPS.map(app => (
            <a
              key={app.id}
              href={links[app.id]}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => choose(app.id)}
              className="flex items-center gap-3 min-h-[52px] px-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
            >
              <span aria-hidden className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/20 text-sm font-bold text-amber-400">{app.badge}</span>
              <span className="flex-1">
                <b className="block text-sm text-white/90">{app.label}</b>
                <small className="text-xs text-white/50">{app.hint}</small>
              </span>
              <Icon name="chevron-dir" className="h-4 w-4 text-white/40" aria-hidden />
            </a>
          ))}
          <button
            type="button"
            onClick={copyAddress}
            className="flex w-full items-center gap-3 min-h-[52px] px-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-colors text-left"
          >
            <Icon name="copiar" className="h-5 w-5 text-amber-400" aria-hidden />
            <span className="flex-1">
              <b className="block text-sm text-white/90">Copiar morada</b>
              <small className="text-xs text-white/50">Para colar noutra app</small>
            </span>
          </button>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-white/70">
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
          Lembrar a minha escolha
        </label>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full min-h-[44px] rounded-xl border border-white/[0.08] text-sm text-white/70 hover:bg-white/[0.04]"
        >
          Cancelar
        </button>
      </div>
    </Modal>
  );
}
