'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiHeart, FiX, FiMapPin, FiMessageSquare, FiGift, FiLock, FiCheck } from 'react-icons/fi';
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
  const [liking, setLiking] = useState(false);
  const [passing, setPassing] = useState(false);

  const handleChat = () => {
    if (!canChat) {
      router.push('/upgrade');
      return;
    }
    router.push(`/chat?partner=${profile.id}&name=${encodeURIComponent(profile.name || '')}`);
  };

  const handleLike = () => {
    setLiking(true);
    setTimeout(() => setLiking(false), 700);
    onLike?.();
  };

  const handlePass = () => {
    setPassing(true);
    setTimeout(() => setPassing(false), 400);
    onPass?.();
  };

  return (
    <div className="relative">
    <div
      className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-[var(--line)] shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition-shadow duration-300 hover:shadow-[0_24px_70px_-24px_rgba(68,0,4,0.7)]"
    >
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
              className="object-cover transition-transform duration-500 group-hover:scale-105"
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
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-obsidian via-obsidian/70 to-transparent" />

      {/* Compat ring */}
      {compatPct != null ? (
        <div className="absolute right-3 top-3">
          <CompatRing pct={compatPct} />
        </div>
      ) : null}

      {/* Bottom content */}
      <Link href={`/detail/${profile.id}`} className="absolute inset-x-0 bottom-14 px-4">
        {distanceKm != null ? (
          <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-obsidian/60 px-2.5 py-1 font-mono text-[11px] text-white backdrop-blur">
            <FiMapPin className="h-3 w-3" /> {distanceKm.toFixed(0)} km
          </span>
        ) : null}
        <p className="flex items-center gap-1.5 font-serif text-lg leading-tight text-white">
          {profile.name || 'Profil'}
          {age ? `, ${age}` : ''}
          {profile.is_verify ? (
            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-passion">
              <FiCheck className="h-2.5 w-2.5 text-white" strokeWidth={3} />
            </span>
          ) : null}
        </p>
        {profile.profile_bio ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-white/70">{profile.profile_bio}</p>
        ) : null}
      </Link>

      {/* Action row overlaid on the photo, bottom edge */}
      <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2.5 px-4">
        {onPass ? (
          <button
            onClick={handlePass}
            className={`grid h-9 w-9 place-items-center rounded-full bg-obsidian/70 text-white/80 backdrop-blur transition-all duration-300 hover:text-ember active:scale-90 ${passing ? 'scale-90' : ''}`}
            aria-label="Passer"
          >
            <FiX className="h-4 w-4" />
          </button>
        ) : null}
        {onLike ? (
          <button
            onClick={handleLike}
            className="relative grid h-10 w-10 place-items-center rounded-full bg-gradient-passion text-white shadow-[0_10px_34px_-10px_rgba(246,65,53,0.5)] transition-all duration-300 hover:-translate-y-0.5 active:scale-90"
            aria-label="Liker"
          >
            {liking && <span className="absolute inset-0 rounded-full shadow-[0_0_0_3px_rgba(246,65,53,0.35)] animate-halo" />}
            <FiHeart className={`relative h-[17px] w-[17px] ${liking ? 'animate-heartbeat' : ''}`} />
          </button>
        ) : null}
        <button
          onClick={handleChat}
          className="grid h-9 w-9 place-items-center rounded-full bg-obsidian/70 text-white/80 backdrop-blur transition-all duration-300 hover:text-white active:scale-90"
          aria-label={canChat ? 'Envoyer un message' : 'Fonctionnalité Premium'}
        >
          {canChat ? <FiMessageSquare className="h-4 w-4" /> : <FiLock className="h-4 w-4" />}
        </button>
        {onGift ? (
          <button
            onClick={() => setShowGifts((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full bg-obsidian/70 text-white/80 backdrop-blur transition-all duration-300 hover:text-white active:scale-90"
            aria-label="Envoyer un cadeau"
          >
            <FiGift className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>

      {showGifts ? (
        <GiftPicker gifts={gifts} onSend={onGift} onClose={() => setShowGifts(false)} />
      ) : null}
    </div>
  );
}

export default memo(ProfileCard);
