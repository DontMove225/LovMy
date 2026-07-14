import { FiPhone, FiPhoneOff, FiVideo } from 'react-icons/fi';

export default function IncomingCallModal({ call, onAccept, onReject }) {
  const caller = call.caller || {};
  const isVideo = call.type === 'VIDEO';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-[var(--line)] bg-obsidian p-8 text-center shadow-[0_30px_70px_rgba(0,0,0,0.6)]">
        <div className="mx-auto flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-gradient-passion font-serif text-3xl text-white">
          {caller.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <h2 className="mt-5 font-serif text-2xl text-white">{caller.name ?? 'Appel entrant'}</h2>
        <p className="mt-1 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wide text-blush">
          {isVideo ? <FiVideo className="h-3.5 w-3.5" /> : <FiPhone className="h-3.5 w-3.5" />}
          Appel {isVideo ? 'vidéo' : 'audio'} entrant…
        </p>

        <div className="mt-8 flex justify-center gap-6">
          <button
            onClick={onReject}
            className="grid h-16 w-16 place-items-center rounded-full bg-red-600 text-white shadow-[0_10px_24px_rgba(220,38,38,0.45)] transition hover:brightness-110"
            aria-label="Refuser"
          >
            <FiPhoneOff className="h-6 w-6" />
          </button>
          <button
            onClick={onAccept}
            className="grid h-16 w-16 place-items-center rounded-full bg-emerald-600 text-white shadow-[0_10px_24px_rgba(5,150,105,0.45)] transition hover:brightness-110"
            aria-label="Accepter"
          >
            <FiPhone className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
