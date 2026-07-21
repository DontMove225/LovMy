'use client';

import { useRef } from 'react';

export default function ProfileCard({
  name,
  age,
  location,
  photo,
  verified = false,
  online = false,
  tags = [],
  className = '',
  onClick,
}) {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg)`;
  };

  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(900px) rotateY(0) rotateX(0)';
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative aspect-[3/4] w-full overflow-hidden rounded-[28px] border border-[var(--line)] shadow-[0_24px_70px_-24px_rgba(68,0,4,0.7)] transition-transform duration-300 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      style={{ transitionTimingFunction: 'cubic-bezier(.22,1,.36,1)' }}
    >
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(8,7,20,0.92)]" style={{ backgroundImage: 'linear-gradient(180deg, rgba(8,7,20,0) 42%, rgba(68,0,4,.55) 78%, rgba(8,7,20,.92) 100%)' }} />

      {online && (
        <div className="absolute left-3.5 top-3.5 flex items-center gap-1.5 rounded-full bg-[rgba(8,7,20,0.5)] px-2.5 py-1 text-[11px] text-white backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          En ligne
        </div>
      )}

      {verified && (
        <div className="absolute right-3.5 top-3.5 grid h-7 w-7 place-items-center rounded-full bg-passion text-white shadow-[0_10px_34px_-10px_rgba(246,65,53,0.5)]">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="3">
            <path d="M4 12l5 5L20 6" />
          </svg>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="font-serif text-2xl text-white">
          {name}
          {age && <span className="font-sans text-lg font-light text-[var(--txt-soft)]"> · {age}</span>}
        </h3>
        {location && (
          <span className="mt-1.5 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.18em] text-blush">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21s-6-5.2-6-10a6 6 0 1112 0c0 4.8-6 10-6 10Z" />
              <circle cx="12" cy="11" r="2" />
            </svg>
            {location}
          </span>
        )}
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--line)] bg-[rgba(8,7,20,0.4)] px-2.5 py-1 text-[11px] text-[var(--txt-soft)] backdrop-blur"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
