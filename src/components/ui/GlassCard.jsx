'use client';

export default function GlassCard({ children, className = '', as: Tag = 'div', ...props }) {
  return (
    <Tag
      className={`rounded-3xl border border-[var(--line)] bg-white/[0.03] backdrop-blur-xl ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
