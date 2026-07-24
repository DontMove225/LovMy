'use client';

import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';

export default function AdModal({ apiPost, imageBaseURL }) {
  const [ad, setAd] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await apiPost('ads_active.php', {});
        if (cancelled || result.Result !== 'true') return;
        const candidate = (result.data || []).find((a) => !sessionStorage.getItem(`ad_seen_${a.id}`));
        if (candidate) {
          setAd(candidate);
          setOpen(true);
        }
      } catch (error) {
        console.error(error);
      }
    })();
    return () => { cancelled = true; };
  }, [apiPost]);

  const dismiss = () => {
    if (ad) sessionStorage.setItem(`ad_seen_${ad.id}`, '1');
    setOpen(false);
  };

  const handleClick = () => {
    if (ad?.link_url) {
      apiPost('ads_click.php', { ad_id: ad.id }).catch(() => {});
      window.open(ad.link_url, '_blank', 'noopener,noreferrer');
    }
    dismiss();
  };

  if (!open || !ad) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-sm animate-rise overflow-hidden rounded-3xl border border-[var(--line)] bg-obsidian shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-obsidian/70 text-white backdrop-blur transition hover:bg-obsidian"
          aria-label="Fermer"
        >
          <FiX className="h-4 w-4" />
        </button>

        <button type="button" onClick={handleClick} className="block w-full cursor-pointer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${imageBaseURL}${ad.image}`}
            alt={ad.title || 'Publicité'}
            className="max-h-[75vh] w-full object-contain"
          />
        </button>

        {ad.title ? (
          <p className="px-5 py-3 text-center font-serif text-base text-white">{ad.title}</p>
        ) : null}
      </div>
    </div>
  );
}
