export default function GiftPicker({ gifts, onSend, onClose }) {
  return (
    <div className="absolute bottom-full right-0 z-20 mb-2 w-56 rounded-2xl border border-[var(--line)] bg-obsidian p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <p className="mb-2 px-1 font-mono text-[10px] uppercase tracking-widest text-[var(--txt-faint)]">
        Envoyer un cadeau
      </p>
      <div className="grid grid-cols-3 gap-2">
        {gifts.map((gift) => (
          <button
            key={gift.id}
            onClick={() => {
              onSend(gift);
              onClose();
            }}
            className="flex flex-col items-center gap-1 rounded-xl border border-[var(--line)] py-2.5 transition hover:border-ember/40 hover:bg-white/5"
          >
            <span className="text-2xl">{gift.img}</span>
            <span className="font-mono text-[10px] text-ember">{gift.price}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
