'use client';

export default function GhostButton({ children, className = '', ...props }) {
  return (
    <button
      className={`h-12 rounded-full border border-[var(--line)] bg-white/[0.03] px-7 font-medium text-[var(--txt)] backdrop-blur transition-all duration-300 hover:border-ember/70 hover:text-white hover:shadow-[0_0_0_1px_rgba(246,65,53,0.4),0_10px_34px_-10px_rgba(246,65,53,0.55)] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
