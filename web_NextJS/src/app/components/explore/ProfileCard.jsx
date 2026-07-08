import Link from 'next/link';
import { FiHeart, FiX, FiMapPin, FiCheckCircle } from 'react-icons/fi';

function calcAge(birthDate) {
  if (!birthDate) return null;
  const dob = new Date(birthDate);
  if (Number.isNaN(dob.getTime())) return null;
  const diffMs = Date.now() - dob.getTime();
  return Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
}

export default function ProfileCard({ profile, imageBaseURL, distanceKm, compatPct, onLike, onPass }) {
  const age = calcAge(profile.birth_date);

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-[var(--line)] bg-gradient-to-b from-[#15101f] to-[#0a0712] shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
      <Link href={`/detail/${profile.id}`} className="block">
        <div
          className="relative h-64 w-full"
          style={{ background: 'linear-gradient(160deg, var(--steel), var(--velvet) 60%, var(--nightred))' }}
        >
          {profile.profile_pic ? (
            <img
              src={`${imageBaseURL}${profile.profile_pic}`}
              alt={profile.name || 'Profil'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-serif text-6xl text-white/25">
              {profile.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}

          {profile.is_verify ? (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-obsidian/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-blush backdrop-blur">
              <FiCheckCircle className="h-3 w-3" /> Vérifié
            </span>
          ) : null}

          {distanceKm != null ? (
            <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-obsidian/60 px-2.5 py-1 font-mono text-[11px] text-white backdrop-blur">
              <FiMapPin className="h-3 w-3" /> {distanceKm.toFixed(0)} km
            </span>
          ) : null}
        </div>
      </Link>

      {(onLike || onPass) && (
        <div className="absolute -bottom-5 right-5 flex gap-2">
          {onPass ? (
            <button
              onClick={onPass}
              className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] bg-obsidian text-[var(--txt-soft)] shadow-lg transition hover:text-ember"
              aria-label="Passer"
            >
              <FiX className="h-5 w-5" />
            </button>
          ) : null}
          {onLike ? (
            <button
              onClick={onLike}
              className="grid h-11 w-11 place-items-center rounded-full bg-gradient-passion text-white shadow-[0_10px_24px_rgba(235,6,3,0.45)] transition hover:brightness-110"
              aria-label="Liker"
            >
              <FiHeart className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      )}

      <div className="px-5 pb-6 pt-8">
        <h3 className="font-serif text-xl text-white">
          {profile.name || 'Profil'}
          {age ? `, ${age}` : ''}
        </h3>
        {profile.profile_bio ? (
          <p className="mt-1 line-clamp-2 text-sm text-[var(--txt-soft)]">{profile.profile_bio}</p>
        ) : null}

        {compatPct != null ? (
          <div className="mt-4 flex items-center gap-2.5">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-steel to-ember"
                style={{ width: `${compatPct}%` }}
              />
            </div>
            <span className="font-mono text-xs text-ember">{compatPct}%</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
