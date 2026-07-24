'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { MyContext } from '@/context/MyProvider';
import { FiLock, FiAlertTriangle } from 'react-icons/fi';

export default function AccountSecurityPage() {
  const router = useRouter();
  const { apiPost, getStoredUser } = useContext(MyContext);
  const [me, setMe] = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState('');
  const [deleting, setDeleting] = useState(false);

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

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setPwMsg('');

    if (!currentPassword || !newPassword) {
      setPwMsg('Veuillez renseigner tous les champs.');
      return;
    }
    if (newPassword.length < 8) {
      setPwMsg('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg('Les mots de passe ne correspondent pas.');
      return;
    }

    setSaving(true);
    try {
      const result = await apiPost('auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      if (result.Result === 'true') {
        setPwMsg('Mot de passe modifié avec succès.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwMsg(result.ResponseMsg || 'Erreur lors de la modification.');
      }
    } catch (error) {
      setPwMsg('Erreur réseau, réessayez plus tard.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteMsg('');
    try {
      const result = await apiPost('acc_delete.php', {});
      if (result.Result === 'true') {
        localStorage.removeItem('token');
        localStorage.removeItem('UserId');
        localStorage.removeItem('Register_User');
        router.push('/login');
      } else {
        setDeleteMsg(result.ResponseMsg || 'Erreur lors de la suppression.');
      }
    } catch (error) {
      setDeleteMsg('Erreur réseau, réessayez plus tard.');
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  if (!me) return null;

  const inputClass = 'w-full rounded-2xl border border-[var(--line)] bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-ember';
  const labelClass = 'mb-1.5 block text-sm font-medium text-[var(--txt-soft)]';

  return (
    <main className="min-h-screen bg-obsidian px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6 animate-rise">
        <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
          <span className="font-mono text-xs uppercase tracking-[0.32em] text-ember">Sécurité</span>
          <h1 className="mt-2 font-serif text-3xl text-white">Compte & sécurité</h1>
          <p className="mt-2 text-[var(--txt-soft)]">Gère ton mot de passe et la suppression de ton compte.</p>
        </div>

        <form onSubmit={handleChangePassword} className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-passion">
              <FiLock className="h-4 w-4 text-white" />
            </div>
            <h2 className="font-serif text-lg text-white">Changer le mot de passe</h2>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className={labelClass}>Mot de passe actuel</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className={inputClass}
              />
            </div>

            {pwMsg && (
              <p className={`rounded-xl border px-4 py-3 text-sm ${pwMsg.includes('succès') ? 'border-emerald-800 bg-emerald-900/50 text-emerald-400' : 'border-ember/30 bg-ember/10 text-ember'}`}>
                {pwMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-passion px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_34px_-10px_rgba(246,65,53,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-12px_rgba(235,6,3,0.45)] disabled:pointer-events-none disabled:opacity-60"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">{saving ? 'Modification…' : 'Modifier le mot de passe'}</span>
            </button>
          </div>
        </form>

        <div className="rounded-3xl border border-ember/30 bg-ember/[0.04] p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ember/15">
              <FiAlertTriangle className="h-4 w-4 text-ember" />
            </div>
            <h2 className="font-serif text-lg text-white">Zone dangereuse</h2>
          </div>
          <p className="mt-4 text-sm text-[var(--txt-soft)]">
            Supprimer ton compte désactive définitivement ton profil et te déconnecte de tous tes appareils.
            Cette action ne peut pas être annulée par toi-même.
          </p>

          {deleteMsg && (
            <p className="mt-4 rounded-xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-ember">
              {deleteMsg}
            </p>
          )}

          {confirmDelete ? (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="rounded-2xl bg-ember px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
              >
                {deleting ? 'Suppression…' : 'Oui, supprimer définitivement'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="rounded-2xl border border-[var(--line)] px-5 py-3 text-sm text-[var(--txt-soft)] transition hover:bg-white/5"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="mt-5 rounded-2xl border border-ember/40 px-5 py-3 text-sm font-semibold text-ember transition hover:bg-ember/10"
            >
              Supprimer mon compte
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
