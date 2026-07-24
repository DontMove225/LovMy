'use client';

export default function HeartbeatLoader({ size = 64, className = '' }) {
  return (
    <div
      className={`relative grid place-items-center ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Chargement"
    >
      <span className="absolute inset-0 animate-halo rounded-full bg-[radial-gradient(circle,rgba(246,65,53,0.4),transparent_62%)]" />
      <svg
        viewBox="0 0 24 24"
        width={size * 0.53}
        height={size * 0.53}
        fill="var(--passion)"
        className="animate-heartbeat drop-shadow-[0_10px_20px_rgba(235,6,3,0.4)]"
      >
        <path d="M12 21s-7.5-4.9-9.6-9.1C.9 8.6 2.5 5.5 5.7 5.1 8 4.8 10 6.2 12 8.6c2-2.4 4-3.8 6.3-3.5 3.2.4 4.8 3.5 3.3 6.8C19.5 16.1 12 21 12 21Z" />
      </svg>
    </div>
  );
}
