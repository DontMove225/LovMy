'use client';

import { useState } from 'react';

function CircleButton({ onClick, className = '', children, ariaLabel, active, activeClass }) {
  const [pulsing, setPulsing] = useState(false);

  const handleClick = (e) => {
    setPulsing(true);
    setTimeout(() => setPulsing(false), 700);
    onClick?.(e);
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={handleClick}
      className={`grid h-14 w-14 place-items-center rounded-full border border-[var(--line)] bg-white/[0.03] transition-all duration-300 active:scale-90 ${
        active ? activeClass : 'hover:border-white/20'
      } ${className}`}
    >
      <span className={pulsing ? 'animate-heartbeat' : ''}>{children}</span>
    </button>
  );
}

export function PassButton({ onClick }) {
  return (
    <CircleButton onClick={onClick} ariaLabel="Passer">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--txt-soft)" strokeWidth="2.2">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </CircleButton>
  );
}

export function LikeButton({ onClick }) {
  return (
    <CircleButton
      onClick={onClick}
      ariaLabel="Aimer"
      active
      activeClass="border-passion/60 shadow-[0_0_0_1px_rgba(235,6,3,0.4),0_10px_34px_-10px_rgba(246,65,53,0.5)]"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--passion)" strokeWidth="1.8">
        <path d="M12 21s-7.5-4.9-9.6-9.1C.9 8.6 2.5 5.5 5.7 5.1 8 4.8 10 6.2 12 8.6c2-2.4 4-3.8 6.3-3.5 3.2.4 4.8 3.5 3.3 6.8C19.5 16.1 12 21 12 21Z" />
      </svg>
    </CircleButton>
  );
}

export function SuperLikeButton({ onClick }) {
  return (
    <CircleButton
      onClick={onClick}
      ariaLabel="Super like"
      active
      activeClass="border-steel/60 shadow-[0_10px_34px_-10px_rgba(48,59,99,0.8)]"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--steel)" strokeWidth="1.6">
        <path d="M12 2l2.9 6.3L22 9.2l-5 4.7 1.3 6.9L12 17.8 5.7 20.8 7 13.9l-5-4.7 7.1-.9L12 2z" />
      </svg>
    </CircleButton>
  );
}

export function RewindButton({ onClick }) {
  return (
    <CircleButton onClick={onClick} ariaLabel="Revenir en arrière" className="h-11 w-11">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--blush)" strokeWidth="2">
        <path d="M3 8h10a6 6 0 110 12H7" />
        <path d="M3 8l4-4M3 8l4 4" />
      </svg>
    </CircleButton>
  );
}

export function BoostButton({ onClick }) {
  return (
    <button
      type="button"
      aria-label="Boost"
      onClick={onClick}
      className="relative grid h-11 w-11 place-items-center rounded-full bg-gradient-passion text-white shadow-[0_10px_34px_-10px_rgba(246,65,53,0.5)] transition-transform active:scale-90"
    >
      <span className="absolute inset-0 rounded-full shadow-[0_0_0_3px_rgba(246,65,53,0.35)] animate-halo" />
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
      </svg>
    </button>
  );
}
