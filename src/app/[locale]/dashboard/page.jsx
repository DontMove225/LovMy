'use client';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MyContext } from '@/context/MyProvider';
import LocationPermissionModal from '../components/map/LocationPermissionModal';
import { FiCrosshair } from 'react-icons/fi';

function calcAge(birthDate) {
  if (!birthDate) return null;
  const dob = new Date(birthDate);
  if (Number.isNaN(dob.getTime())) return null;
  return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

export default function DashboardPage() {
  const router = useRouter();
  const { apiPost, imageBaseURL, getStoredUser } = useContext(MyContext);
  const [me, setMe] = useState(null);
  const [mapKey, setMapKey] = useState('');
  const [locationState, setLocationState] = useState('idle'); // idle | requesting | granted | denied
  const [position, setPosition] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [fallback, setFallback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const myMarkerRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    const stored = getStoredUser();
    if (!token || !stored) {
      router.replace('/login');
      return;
    }
    setMe(stored);
  }, [router, getStoredUser]);

  useEffect(() => {
    if (!me) return;
    (async () => {
      try {
        const result = await apiPost('setting.php', {});
        if (result.Result === 'true') {
          setMapKey(result.data?.map_key || '');
        }
      } catch (error) {
        console.error(error);
      }
    })();
  }, [me, apiPost]);

  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationState('denied');
      return;
    }
    setLocationState('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationState('granted');
      },
      () => setLocationState('denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const loadProfiles = useCallback(async (uid, lat, lng) => {
    setLoading(true);
    try {
      const result = await apiPost('map_info.php', { uid, lats: lat, longs: lng });
      setProfiles(result.Result === 'true' ? (result.data || []) : []);
      setFallback(result.Result === 'true' ? Boolean(result.fallback) : false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [apiPost]);

  useEffect(() => {
    if (me && position) loadProfiles(me.id, position.lat, position.lng);
  }, [me, position, loadProfiles]);

  // Load Google Maps script once we have a key
  useEffect(() => {
    if (typeof window === 'undefined' || !mapKey) return;
    if (window.google?.maps) {
      setScriptLoaded(true);
      return;
    }
    const existing = document.getElementById('google-maps-script');
    if (existing) {
      existing.addEventListener('load', () => setScriptLoaded(true));
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${mapKey}&loading=async`;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, [mapKey]);

  // Initialize map once script + position are ready (runs only once)
  useEffect(() => {
    if (!scriptLoaded || !position || !mapDivRef.current || mapRef.current) return;
    mapRef.current = new window.google.maps.Map(mapDivRef.current, {
      center: position,
      zoom: 12,
      disableDefaultUI: true,
      zoomControl: true,
    });
    infoWindowRef.current = new window.google.maps.InfoWindow();
  }, [scriptLoaded, position]);

  // Re-center the map and move "my" marker whenever position changes
  // (e.g. after clicking "refresh location") — the map init effect above
  // only runs once, so without this, a later position update never showed.
  useEffect(() => {
    if (!mapRef.current || !position) return;

    mapRef.current.panTo(position);

    if (myMarkerRef.current) {
      myMarkerRef.current.setPosition(position);
    } else {
      myMarkerRef.current = new window.google.maps.Marker({
        position,
        map: mapRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#F64135',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        title: 'Vous',
        zIndex: 999,
      });
    }
  }, [position]);

  // Render profile markers
  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    profiles.forEach((profile) => {
      const lat = Number(profile.lats);
      const lng = Number(profile.longs);
      if (!lat || !lng) return;

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapRef.current,
        title: profile.name,
      });

      marker.addListener('click', () => {
        const age = calcAge(profile.birth_date);
        const photo = profile.profile_pic
          ? `${imageBaseURL}${profile.profile_pic}`
          : null;

        const content = `
          <div style="font-family:sans-serif;min-width:180px">
            ${photo ? `<img src="${photo}" style="width:100%;height:110px;object-fit:cover;border-radius:8px" />` : ''}
            <p style="margin:8px 0 2px;font-weight:600">${profile.name || ''}${age ? `, ${age}` : ''}${profile.is_verify ? ' ✓' : ''}</p>
            <p style="margin:0;font-size:12px;color:#666;max-width:200px">${profile.profile_bio || ''}</p>
            <a href="/detail/${profile.id}" style="display:inline-block;margin-top:8px;font-size:12px;color:#EB0603;font-weight:600">Voir le profil →</a>
          </div>
        `;
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(mapRef.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, [profiles, imageBaseURL]);

  if (!me) return null;

  return (
    <main className="relative h-[calc(100vh-64px)] bg-obsidian lg:h-screen">
      <div className="animate-rise absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[var(--line)] bg-obsidian/80 px-5 py-2.5 backdrop-blur">
        <span className="font-mono text-xs uppercase tracking-wide text-[var(--txt-soft)]">
          {loading
            ? 'Recherche…'
            : fallback && profiles.length > 0
              ? `Aucun profil dans votre rayon — ${profiles.length} profil${profiles.length > 1 ? 's' : ''} le${profiles.length > 1 ? 's' : ''} plus proche${profiles.length > 1 ? 's' : ''}`
              : `${profiles.length} profil${profiles.length > 1 ? 's' : ''} à proximité`}
        </span>
        {locationState === 'granted' || locationState === 'requesting' ? (
          <button
            type="button"
            onClick={requestLocation}
            disabled={locationState === 'requesting'}
            title="Actualiser ma position"
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[var(--txt-soft)] transition hover:text-white disabled:opacity-50"
          >
            <FiCrosshair className={`h-3.5 w-3.5 ${locationState === 'requesting' ? 'animate-spin' : ''}`} />
          </button>
        ) : null}
      </div>

      {locationState !== 'granted' ? (
        <LocationPermissionModal
          onEnable={requestLocation}
          denied={locationState === 'denied'}
          requesting={locationState === 'requesting'}
        />
      ) : !mapKey ? (
        <div className="flex h-full items-center justify-center px-4 text-center">
          <div>
            <p className="font-serif text-xl text-white">Carte non configurée</p>
            <p className="mt-2 text-sm text-[var(--txt-soft)]">
              Aucune clé Google Maps n&apos;est renseignée pour le moment.
            </p>
          </div>
        </div>
      ) : null}

      <div ref={mapDivRef} className="h-full w-full" />
    </main>
  );
}
