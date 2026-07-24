'use client';

import { FiX, FiCheck } from 'react-icons/fi';

export default function PaymentMethodModal({
  open,
  title = 'Paiement',
  amount,
  amountInput = false,
  amountValue,
  onAmountChange,
  methods,
  selected,
  onSelect,
  onContinue,
  onClose,
}) {
  if (!open) return null;

  const continueDisabled = !selected || (amountInput && !(Number(amountValue) > 0));

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-rise rounded-3xl border border-[var(--line)] bg-obsidian p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-ember">{title}</span>
            {!amountInput ? <h2 className="mt-1 font-serif text-2xl text-white">{amount} €</h2> : null}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[var(--txt-soft)] transition hover:bg-white/5 hover:text-white"
            aria-label="Fermer"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {amountInput ? (
          <div className="mb-5">
            <label className="mb-1.5 block text-xs text-[var(--txt-faint)]">Montant à ajouter</label>
            <div className="flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-white/5 px-4 py-3 focus-within:border-ember">
              <span className="font-mono text-sm text-[var(--txt-faint)]">€</span>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="Entrez un montant"
                value={amountValue}
                onChange={(e) => onAmountChange(e.target.value)}
                className="w-full bg-transparent text-lg text-white outline-none placeholder:text-[var(--txt-faint)]"
              />
            </div>
          </div>
        ) : null}

        <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--txt-faint)]">
          Choisir un moyen de paiement
        </p>
        <div className="space-y-2.5">
          {methods.map((m) => {
            const active = selected === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => onSelect(m.key)}
                className={`flex w-full items-center gap-3.5 rounded-2xl border p-3.5 text-left transition ${
                  active ? 'border-ember bg-ember/10' : 'border-[var(--line)] hover:border-ember/30 hover:bg-white/[0.03]'
                }`}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: m.bg }}>
                  <m.icon className="h-5 w-5" style={{ color: m.color }} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-white">{m.label}</span>
                  <span className="block truncate text-xs text-[var(--txt-faint)]">{m.description}</span>
                </span>
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition ${
                    active ? 'border-ember bg-ember' : 'border-[var(--line)]'
                  }`}
                >
                  {active ? <FiCheck className="h-3 w-3 text-white" strokeWidth={3} /> : null}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onContinue}
          disabled={continueDisabled}
          className="group relative mt-6 w-full overflow-hidden rounded-2xl bg-gradient-passion px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_34px_-10px_rgba(246,65,53,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-12px_rgba(235,6,3,0.45)] disabled:pointer-events-none disabled:opacity-40"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <span className="relative">Continuer</span>
        </button>
      </div>
    </div>
  );
}
