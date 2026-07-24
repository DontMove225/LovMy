'use client';

export default function PremiumBadge({ label = 'Premium', className = '' }) {
  return (
    <span
      className={`relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-gradient-passion px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white ${className}`}
    >
      <span
        className="absolute inset-0 animate-shimmer bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)]"
        style={{ backgroundSize: '200% 100%' }}
      />
      <span className="relative">✦ {label}</span>
    </span>
  );
}
