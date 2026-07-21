'use client';

export default function PassionButton({ children, className = '', disabled, ...props }) {
  return (
    <button
      disabled={disabled}
      className={`group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-gradient-passion px-7 font-semibold text-white shadow-[0_10px_34px_-10px_rgba(246,65,53,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-12px_rgba(235,6,3,0.45)] disabled:pointer-events-none disabled:opacity-60 ${className}`}
      {...props}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative">{children}</span>
    </button>
  );
}
