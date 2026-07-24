'use client';

import { useCallback, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const FIELDS = [
  { key: 'auth_key',             label: 'MSG91 Auth Key' },
  { key: 'otp_id',               label: 'MSG91 OTP Template ID' },
  { key: 'map_key',              label: 'Clé Google Maps' },
  { key: 'agora_app_id',         label: 'Agora App ID' },
  { key: 'trtc_sdk_app_id',      label: 'TRTC SDK App ID' },
  { key: 'trtc_secret_key',      label: 'TRTC Secret Key' },
  { key: 'stripe_key',           label: 'Stripe Key (publique)' },
  { key: 'stripe_secret',        label: 'Stripe Secret' },
  { key: 'paypal_client_id',     label: 'PayPal Client ID' },
  { key: 'paypal_client_secret', label: 'PayPal Client Secret' },
  { key: 'google_client_id',     label: 'Google Client ID (connexion sociale)' },
  { key: 'facebook_app_id',      label: 'Facebook App ID (connexion sociale)' },
  { key: 'facebook_app_secret',  label: 'Facebook App Secret (connexion sociale)' },
  { key: 'firebase_credentials', label: 'Firebase — JSON du compte de service' },
  { key: 'firebase_web_config',  label: 'Firebase — config Web (JSON apiKey/authDomain/...)' },
  { key: 'firebase_vapid_key',   label: 'Firebase — clé VAPID (Web Push)' },
];

export default function AdminTechnicalSettings() {
  const { token, ready } = useAdminAuth();
  const basUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lovmy.dontmove.app/api/';

  const [unlocked, setUnlocked] = useState(false);
  const [techPassword, setTechPassword] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [unlocking, setUnlocking] = useState(false);

  const [fieldsState, setFieldsState] = useState({});
  const [draft, setDraft] = useState({});
  const [clearFields, setClearFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  const techHeaders = useCallback((pw) => ({
    Authorization: `Bearer ${token}`,
    'X-Tech-Password': pw,
  }), [token]);

  const loadFields = useCallback(async (pw) => {
    setLoading(true);
    try {
      const r = await axios.get(`${basUrl}admin/technical-settings`, { headers: techHeaders(pw) });
      setFieldsState(r.data.data ?? {});
    } catch (error) {
      if (error.response?.status === 403) {
        setUnlocked(false);
        setUnlockError('Session technique expirée, ressaisissez le mot de passe.');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [basUrl, techHeaders]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    setUnlocking(true);
    setUnlockError('');
    try {
      await axios.post(
        `${basUrl}admin/technical-settings/verify-password`,
        { password: passwordInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTechPassword(passwordInput);
      setUnlocked(true);
      setPasswordInput('');
      await loadFields(passwordInput);
    } catch (error) {
      setUnlockError(
        error.response?.status === 401
          ? 'Mot de passe technique invalide.'
          : 'Erreur réseau, réessayez.'
      );
    } finally {
      setUnlocking(false);
    }
  };

  const toggleClear = (key) => {
    setClearFields((prev) => (
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    ));
    setDraft((d) => ({ ...d, [key]: '' }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await axios.put(
        `${basUrl}admin/technical-settings`,
        { ...draft, clear_fields: clearFields },
        { headers: techHeaders(techPassword) }
      );
      setMsg('Paramètres techniques mis à jour avec succès.');
      setDraft({});
      setClearFields([]);
      await loadFields(techPassword);
    } catch (error) {
      if (error.response?.status === 403) {
        setUnlocked(false);
        setMsg('');
        setUnlockError('Session technique expirée, ressaisissez le mot de passe.');
      } else {
        setMsg('Erreur lors de la sauvegarde.');
      }
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPw(true);
    setPwMsg('');
    try {
      await axios.post(
        `${basUrl}admin/technical-settings/change-password`,
        { new_password: newPw },
        { headers: techHeaders(currentPw) }
      );
      setTechPassword(newPw);
      setCurrentPw('');
      setNewPw('');
      setPwMsg('Mot de passe technique modifié avec succès.');
    } catch (error) {
      setPwMsg(
        error.response?.status === 403
          ? 'Mot de passe actuel incorrect.'
          : 'Erreur lors du changement de mot de passe.'
      );
    } finally {
      setChangingPw(false);
    }
  };

  if (!ready) return null;

  if (!unlocked) {
    return (
      <div className="max-w-md space-y-6">
        <h1 className="font-serif text-2xl text-white">Paramètres techniques</h1>
        <form onSubmit={handleUnlock} className="space-y-4 rounded-2xl border border-[var(--line)] bg-white/[0.03] p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--txt-soft)]">
              Mot de passe technique
            </label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoFocus
              className="w-full rounded-xl border border-[var(--line)] bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-ember"
            />
          </div>
          {unlockError && (
            <p className="rounded-xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-ember">
              {unlockError}
            </p>
          )}
          <button
            type="submit"
            disabled={unlocking || !passwordInput}
            className="rounded-xl bg-gradient-passion px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_34px_-10px_rgba(246,65,53,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-12px_rgba(235,6,3,0.45)] disabled:opacity-60"
          >
            {unlocking ? 'Vérification…' : 'Déverrouiller'}
          </button>
        </form>
      </div>
    );
  }

  if (loading) return <div className="text-[var(--txt-soft)]">Chargement…</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-serif text-2xl text-white">Paramètres techniques</h1>

      <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-[var(--line)] bg-white/[0.03] p-6">
        {FIELDS.map(({ key, label }) => {
          const isSet = fieldsState[key]?.is_set;
          const isClearing = clearFields.includes(key);
          return (
            <div key={key}>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-[var(--txt-soft)]">{label}</label>
                {isSet && (
                  <button
                    type="button"
                    onClick={() => toggleClear(key)}
                    className={`text-xs ${isClearing ? 'text-ember' : 'text-[var(--txt-faint)] hover:text-ember'}`}
                  >
                    {isClearing ? 'Annuler l\'effacement' : 'Effacer'}
                  </button>
                )}
              </div>
              <input
                type="password"
                value={draft[key] ?? ''}
                disabled={isClearing}
                onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                placeholder={isSet ? '••••••••• (laisser vide pour ne pas modifier)' : 'Non configuré'}
                className="w-full rounded-xl border border-[var(--line)] bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-ember disabled:opacity-40"
              />
            </div>
          );
        })}

        {msg && (
          <p className={`rounded-xl border px-4 py-3 text-sm ${msg.includes('succès') ? 'border-emerald-800 bg-emerald-900/50 text-emerald-400' : 'border-ember/30 bg-ember/10 text-ember'}`}>
            {msg}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-gradient-passion px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_34px_-10px_rgba(246,65,53,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-12px_rgba(235,6,3,0.45)] disabled:opacity-60"
        >
          {saving ? 'Sauvegarde…' : 'Sauvegarder'}
        </button>
      </form>

      <form onSubmit={handleChangePassword} className="space-y-4 rounded-2xl border border-[var(--line)] bg-white/[0.03] p-6">
        <h2 className="font-serif text-lg text-white">Changer le mot de passe technique</h2>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--txt-soft)]">Mot de passe actuel</label>
          <input
            type="password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-ember"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--txt-soft)]">Nouveau mot de passe</label>
          <input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-ember"
          />
        </div>
        {pwMsg && (
          <p className={`rounded-xl border px-4 py-3 text-sm ${pwMsg.includes('succès') ? 'border-emerald-800 bg-emerald-900/50 text-emerald-400' : 'border-ember/30 bg-ember/10 text-ember'}`}>
            {pwMsg}
          </p>
        )}
        <button
          type="submit"
          disabled={changingPw || !currentPw || newPw.length < 8}
          className="rounded-xl border border-[var(--line)] px-6 py-2.5 text-sm font-semibold text-white transition hover:border-ember/40 disabled:opacity-60"
        >
          {changingPw ? 'Modification…' : 'Changer le mot de passe'}
        </button>
      </form>
    </div>
  );
}
