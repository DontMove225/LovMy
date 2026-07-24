'use client';

export default function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-obsidian">
      <span
        className="absolute -right-[10%] -top-[15%] h-[60vmax] w-[60vmax] rounded-full blur-[70px]"
        style={{
          background: 'radial-gradient(circle, rgba(235,6,3,.28), transparent 62%)',
          animation: 'aurora 18s ease-in-out infinite',
        }}
      />
      <span
        className="absolute -left-[12%] top-[22%] h-[52vmax] w-[52vmax] rounded-full blur-[70px]"
        style={{
          background: 'radial-gradient(circle, rgba(48,59,99,.30), transparent 60%)',
          animation: 'aurora 22s ease-in-out infinite reverse',
        }}
      />
      <span
        className="absolute -bottom-[25%] left-1/2 h-[70vmax] w-[70vmax] -translate-x-1/2 rounded-full blur-[70px]"
        style={{
          background: 'radial-gradient(circle, rgba(68,0,4,.6), transparent 68%)',
          animation: 'aurora 26s ease-in-out infinite',
        }}
      />
      <style jsx global>{`
        @keyframes aurora {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          33% { transform: translate3d(4%, -3%, 0) scale(1.08); }
          66% { transform: translate3d(-3%, 4%, 0) scale(0.96); }
        }
      `}</style>
    </div>
  );
}
