'use client';

export function ChatBubble({ children, fromMe = false }) {
  if (fromMe) {
    return (
      <div className="max-w-[78%] self-end rounded-[20px] rounded-br-md bg-gradient-passion px-4 py-2.5 text-[0.95rem] leading-snug text-white shadow-[0_10px_34px_-10px_rgba(246,65,53,0.5)]">
        {children}
      </div>
    );
  }

  return (
    <div className="max-w-[78%] self-start rounded-[20px] rounded-bl-md border border-[var(--line)] bg-white/[0.03] px-4 py-2.5 text-[0.95rem] leading-snug text-[var(--txt)] backdrop-blur">
      {children}
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex w-fit items-center gap-1.5 self-start rounded-[20px] rounded-bl-md border border-[var(--line)] bg-white/[0.03] px-4 py-3 backdrop-blur">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 animate-bounce rounded-full bg-blush"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: '1s' }}
        />
      ))}
    </div>
  );
}
