'use client';

import { FiBell, FiX } from 'react-icons/fi';

export default function NotificationPermissionPrompt({ onEnable, onDismiss, loading }) {
  return (
    <div className="fixed bottom-5 right-5 z-[60] w-[calc(100vw-2.5rem)] max-w-sm animate-rise">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-white/[0.04] p-5 shadow-[0_24px_70px_-24px_rgba(68,0,4,0.7)] backdrop-blur-xl">
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fermer"
          className="absolute right-3 top-3 rounded-full p-1 text-[var(--txt-faint)] transition hover:bg-white/5 hover:text-white"
        >
          <FiX className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-5">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-passion shadow-[0_10px_34px_-10px_rgba(246,65,53,0.5)]">
            <span className="absolute inset-0 rounded-full bg-gradient-passion opacity-60 animate-halo" />
            <FiBell className="relative h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-serif text-lg text-white">Restez au courant</h3>
            <p className="mt-1 text-sm text-[var(--txt-soft)]">
              Active les notifications pour ne rater aucun match, message ou like.
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-full px-4 py-2 text-xs font-medium text-[var(--txt-soft)] transition hover:text-white"
          >
            Plus tard
          </button>
          <button
            type="button"
            onClick={onEnable}
            disabled={loading}
            className="rounded-full bg-gradient-passion px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-[0_10px_34px_-10px_rgba(246,65,53,0.5)] transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? 'Activation…' : 'Activer'}
          </button>
        </div>
      </div>
    </div>
  );
}
