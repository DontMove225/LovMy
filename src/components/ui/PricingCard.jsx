'use client';

import PassionButton from './PassionButton';
import GlassCard from './GlassCard';

export default function PricingCard({ eyebrow, price, features = [], featured = false, ribbon, onSelect, ctaLabel = 'Choisir' }) {
  return (
    <GlassCard
      className={`relative flex flex-col rounded-[28px] p-6 ${
        featured ? 'border-passion/50 shadow-[0_18px_50px_-12px_rgba(235,6,3,0.45)]' : ''
      }`}
    >
      {ribbon && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-passion px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
          {ribbon}
        </span>
      )}
      <p className="font-mono text-xs font-medium uppercase tracking-[0.32em] text-ember">{eyebrow}</p>
      <div className="mt-2 font-serif text-4xl text-white">{price}</div>
      <ul className="my-5 flex flex-1 flex-col gap-2.5">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2 text-sm text-[var(--txt-soft)]">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--ember)" strokeWidth="2.5" className="mt-0.5 shrink-0">
              <path d="M4 12l5 5L20 6" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <PassionButton onClick={onSelect} className="w-full">
        {ctaLabel}
      </PassionButton>
    </GlassCard>
  );
}
