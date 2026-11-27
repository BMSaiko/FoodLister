'use client';

import { usePathname, useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import { useLanguage } from '@/contexts/LanguageContext';
import useUnseenRelease from '@/hooks/releases/useUnseenRelease';

const EXCLUDED = ['/auth', '/subscribe', '/checkout', '/novidades'];

/** O popup só aparece fora de autenticação, checkout e das próprias novidades. */
export function isPopupRoute(path: string | null): boolean {
  if (!path) return false;
  return !EXCLUDED.some((p) => path === p || path.startsWith(`${p}/`));
}

/** Popup «Há novidades»: uma vez por release (o estado visto vive no hook). */
export default function ReleasePopup() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { release, markSeen } = useUnseenRelease();

  if (!release || !isPopupRoute(pathname)) return null;

  const dismiss = () => void markSeen(release.version);
  const open = () => {
    dismiss();
    router.push(`/novidades/${release.version}`);
  };

  return (
    <Modal isOpen onClose={dismiss} size="sm" variant="bottom-sheet" ariaLabel={t('Há novidades')}>
      <div className="p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-500">{t('Há novidades')}</p>
        <h2 className="mt-1 text-xl font-semibold text-white">
          {t('Versão')} {release.version}
        </h2>
        <p className="mt-1.5 mb-5 text-white/60">{release.title}</p>
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={dismiss}
            className="flex-1 rounded-[10px] border border-white/10 px-3.5 py-2.5 text-white/60 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
          >
            {t('Agora não')}
          </button>
          <button
            type="button"
            autoFocus
            onClick={open}
            className="flex-1 rounded-[10px] bg-amber-500 px-3.5 py-2.5 font-semibold text-black hover:bg-amber-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          >
            {t('Ver novidades')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
