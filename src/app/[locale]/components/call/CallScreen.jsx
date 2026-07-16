'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { MyContext } from '@/context/MyProvider';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff } from 'react-icons/fi';

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function CallScreen({ call, onEnd }) {
  const { getStoredUser } = useContext(MyContext);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(call.type === 'VIDEO');
  const [elapsed, setElapsed] = useState(0);
  const [remoteJoined, setRemoteJoined] = useState(false);
  const trtcRef = useRef(null);
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const isVideo = call.type === 'VIDEO';

  useEffect(() => {
    if (call.status !== 'connected' || !call.configured) return;
    let cancelled = false;

    (async () => {
      try {
        const { default: TRTC } = await import('trtc-sdk-v5');
        const trtc = TRTC.create();
        trtcRef.current = trtc;
        const me = getStoredUser();

        trtc.on(TRTC.EVENT.REMOTE_VIDEO_AVAILABLE, ({ userId, streamType }) => {
          trtc.startRemoteVideo({ userId, streamType, view: remoteRef.current });
          setRemoteJoined(true);
        });
        trtc.on(TRTC.EVENT.REMOTE_AUDIO_AVAILABLE, () => setRemoteJoined(true));
        trtc.on(TRTC.EVENT.ERROR, (e) => setError(e?.message || 'Erreur TRTC'));

        await trtc.enterRoom({
          sdkAppId: call.sdkAppId,
          userId: String(me.id),
          userSig: call.userSig,
          useStringRoomId: true,
          strRoomId: call.channelName,
        });

        await trtc.startLocalAudio();
        if (isVideo) {
          await trtc.startLocalVideo({ view: localRef.current });
        }

        if (!cancelled) setConnected(true);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError('Impossible de rejoindre l\'appel. Vérifiez la configuration TRTC.');
      }
    })();

    return () => {
      cancelled = true;
      if (trtcRef.current) {
        trtcRef.current.exitRoom().catch(() => {});
        trtcRef.current.destroy();
        trtcRef.current = null;
      }
    };
  }, [call.status, call.configured, call.sdkAppId, call.userSig, call.channelName, isVideo, getStoredUser]);

  useEffect(() => {
    if (!connected) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [connected]);

  const toggleMic = async () => {
    if (!trtcRef.current) return;
    await trtcRef.current.updateLocalAudio({ mute: micOn });
    setMicOn((v) => !v);
  };

  const toggleCam = async () => {
    if (!trtcRef.current) return;
    await trtcRef.current.updateLocalVideo({ mute: camOn });
    setCamOn((v) => !v);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-obsidian">
      <div className="relative flex-1">
        <div ref={remoteRef} className="absolute inset-0 h-full w-full bg-gradient-to-br from-steel to-velvet" />

        {!remoteJoined ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-passion font-serif text-3xl text-white">
              {call.peerName?.[0]?.toUpperCase() ?? '?'}
            </div>
            <p className="mt-5 font-serif text-2xl text-white">{call.peerName ?? 'Utilisateur'}</p>
            <p className="mt-2 font-mono text-xs uppercase tracking-wide text-blush">
              {!call.configured
                ? 'Appels non configurés'
                : call.status === 'calling'
                ? 'Appel en cours…'
                : connected
                ? 'En attente de connexion…'
                : 'Connexion…'}
            </p>
            {error ? <p className="mt-3 max-w-xs text-sm text-ember">{error}</p> : null}
          </div>
        ) : null}

        {isVideo && call.configured ? (
          <div
            ref={localRef}
            className="absolute bottom-6 right-6 h-40 w-28 overflow-hidden rounded-2xl border border-[var(--line)] bg-black shadow-lg sm:h-48 sm:w-36"
          />
        ) : null}

        {connected ? (
          <div className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-obsidian/60 px-4 py-1.5 font-mono text-xs text-white backdrop-blur">
            {formatDuration(elapsed)}
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-center gap-5 border-t border-[var(--line)] bg-white/[0.02] py-6">
        <button
          onClick={toggleMic}
          disabled={!call.configured}
          className="grid h-14 w-14 place-items-center rounded-full border border-[var(--line)] text-white transition hover:bg-white/5 disabled:opacity-40"
        >
          {micOn ? <FiMic className="h-5 w-5" /> : <FiMicOff className="h-5 w-5" />}
        </button>

        {isVideo ? (
          <button
            onClick={toggleCam}
            disabled={!call.configured}
            className="grid h-14 w-14 place-items-center rounded-full border border-[var(--line)] text-white transition hover:bg-white/5 disabled:opacity-40"
          >
            {camOn ? <FiVideo className="h-5 w-5" /> : <FiVideoOff className="h-5 w-5" />}
          </button>
        ) : null}

        <button
          onClick={onEnd}
          className="grid h-16 w-16 place-items-center rounded-full bg-red-600 text-white shadow-[0_10px_24px_rgba(220,38,38,0.45)] transition hover:brightness-110"
          aria-label="Raccrocher"
        >
          <FiPhoneOff className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
