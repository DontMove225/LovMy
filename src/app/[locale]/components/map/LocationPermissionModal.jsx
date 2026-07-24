import { FiMapPin, FiRefreshCw } from 'react-icons/fi';

export default function LocationPermissionModal({ onEnable, denied, requesting }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-obsidian p-8 text-center shadow-[0_30px_70px_rgba(0,0,0,0.6)]">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-passion">
          <span className="absolute inset-0 rounded-full bg-gradient-passion opacity-70 animate-halo" />
          <FiMapPin className="relative h-7 w-7 text-white" />
        </div>
        <h2 className="mt-5 font-serif text-2xl text-white">Activer la localisation</h2>
        <p className="mt-3 text-sm text-[var(--txt-soft)]">
          Pour te montrer les profils proches de toi, LovMy a besoin d&apos;accéder à ta position.
        </p>

        <ol className="mt-6 space-y-2 text-left text-sm text-[var(--txt-soft)]">
          <li className="flex gap-2">
            <span className="font-mono text-ember">1.</span>
            Clique sur &quot;Activer maintenant&quot; ci-dessous.
          </li>
          <li className="flex gap-2">
            <span className="font-mono text-ember">2.</span>
            Autorise l&apos;accès à ta position quand ton navigateur te le demande.
          </li>
          {denied ? (
            <li className="flex gap-2">
              <span className="font-mono text-ember">3.</span>
              Si rien ne se passe, vérifie les autorisations de site dans les paramètres de ton navigateur.
            </li>
          ) : null}
        </ol>

        {denied ? (
          <p className="mt-4 rounded-xl border border-ember/30 bg-ember/10 px-4 py-2.5 text-sm text-ember">
            Localisation refusée ou indisponible. Autorise l&apos;accès puis réessaie.
          </p>
        ) : null}

        <button
          onClick={onEnable}
          disabled={requesting}
          className="group relative mt-7 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-passion px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_34px_-10px_rgba(246,65,53,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-12px_rgba(235,6,3,0.45)] disabled:pointer-events-none disabled:opacity-60"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          {requesting ? (
            <span className="relative flex items-center gap-2">
              <FiRefreshCw className="h-4 w-4 animate-spin" /> Localisation en cours…
            </span>
          ) : (
            <span className="relative">Activer maintenant</span>
          )}
        </button>
      </div>
    </div>
  );
}
