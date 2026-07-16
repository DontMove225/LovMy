'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiHeart, FiX, FiMapPin, FiMessageSquare, FiGift, FiLock } from 'react-icons/fi';
import GiftPicker from './GiftPicker';

function calcAge(birthDate) {
  if (!birthDate) return null;
  const dob = new Date(birthDate);
  if (Number.isNaN(dob.getTime())) return null;
  const diffMs = Date.now() - dob.getTime();
  return Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
}

function CompatRing({ pct }) {
  const r = 15.5;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="relative h-9 w-9 shrink-0">
      <svg viewBox="0 0 36 36" className="h-9 w-9 -rotate-90">
        <circle cx="18" cy="18" r={r} fill="rgba(8,7,20,0.55)" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
        <circle
          cx="18" cy="18" r={r} fill="none" stroke="#F64135" strokeWidth="3" strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">
        {pct}%
      </span>
    </div>
  );
}

function ProfileCard({ profile, imageBaseURL, distanceKm, compatPct, photoCount = 1, canChat = true, gifts = [], onLike, onPass, onGift }) {
  const router = useRouter();
  const age = calcAge(profile.birth_date);
  const [showGifts, setShowGifts] = useState(false);

  const handleChat = () => {
    if (!canChat) {
      router.push('/upgrade');
      return;
    }
    router.push(`/chat?partner=${profile.id}&name=${encodeURIComponent(profile.name || '')}`);
  };

  return (
    <div>
      <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-[var(--line)] shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
        <Link href={`/detail/${profile.id}`} className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(160deg, var(--steel), var(--velvet) 60%, var(--nightred))' }}
          >
            {profile.profile_pic ? (
              <Image
                src={`${imageBaseURL}${profile.profile_pic}`}
                alt={profile.name || 'Profil'}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-serif text-6xl text-white/25">
                {profile.name?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
          </div>
        </Link>

        {/* Photo carousel dots */}
        {photoCount > 1 ? (
          <div className="absolute left-3 right-3 top-3 flex gap-1">
            {Array.from({ length: photoCount }).map((_, i) => (
              <span key={i} className={`h-0.5 flex-1 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/30'}`} />
            ))}
          </div>
        ) : null}

        {/* Bottom gradient overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-obsidian via-obsidian/60 to-transparent" />

        {/* Compat ring */}
        {compatPct != null ? (
          <div className="absolute right-3 top-3">
            <CompatRing pct={compatPct} />
          </div>
        ) : null}

        {/* Bottom content */}
        <Link href={`/detail/${profile.id}`} className="absolute inset-x-0 bottom-0 p-4">
          {distanceKm != null ? (
            <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-obsidian/60 px-2.5 py-1 font-mono text-[11px] text-white backdrop-blur">
              <FiMapPin className="h-3 w-3" /> {distanceKm.toFixed(0)} km
            </span>
          ) : null}
          <p className="font-serif text-lg leading-tight text-white">
            {profile.name || 'Profil'}
            {age ? `, ${age}` : ''}
          </p>
          {profile.profile_bio ? (
            <p className="mt-0.5 line-clamp-1 text-xs text-white/70">{profile.profile_bio}</p>
          ) : null}
        </Link>
      </div>

      {/* Action row below the card */}
      <div className="relative mt-3 flex items-center justify-center gap-2.5">
        {onPass ? (
          <button
            onClick={onPass}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-[var(--txt-soft)] transition hover:bg-ember/10 hover:text-ember"
            aria-label="Passer"
          >
            <FiX className="h-4 w-4" />
          </button>
        ) : null}
        {onLike ? (
          <button
            onClick={onLike}
            className="grid h-11 w-11 place-items-center rounded-full bg-gradient-passion text-white shadow-[0_6px_16px_rgba(235,6,3,0.45)] transition hover:brightness-110"
            aria-label="Liker"
          >
            <FiHeart className="h-[18px] w-[18px]" />
          </button>
        ) : null}
        <button
          onClick={handleChat}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-[var(--txt-soft)] transition hover:bg-white/10 hover:text-white"
          aria-label={canChat ? 'Envoyer un message' : 'Fonctionnalité Premium'}
        >
          {canChat ? <FiMessageSquare className="h-4 w-4" /> : <FiLock className="h-4 w-4" />}
        </button>
        {onGift ? (
          <button
            onClick={() => setShowGifts((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-[var(--txt-soft)] transition hover:bg-white/10 hover:text-white"
            aria-label="Envoyer un cadeau"
          >
            <FiGift className="h-4 w-4" />
          </button>
        ) : null}

        {showGifts ? (
          <GiftPicker gifts={gifts} onSend={onGift} onClose={() => setShowGifts(false)} />
        ) : null}
      </div>
    </div>
  );
}

export default memo(ProfileCard);
