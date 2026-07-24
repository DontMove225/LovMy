'use client';

import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MyContext } from '@/context/MyProvider';
import axios from 'axios';

export default function ForgotPasswordPage() {
  const { basUrl } = useContext(MyContext);
  const router = useRouter();
  const [step, setStep] = useState('identify'); // identify | reset
  const [identifier, setIdentifier] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSendOtp = async (event) => {
    event.preventDefault();
    if (!identifier) {
      setMessage('Veuillez renseigner votre mobile ou votre email.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${basUrl}send_forgot_password_otp.php`, {
        mobile: identifier,
      });

      if (response.data.Result === 'true') {
        setMobile(response.data.mobile || identifier);
        setStep('reset');
      } else {
        setMessage(response.data.ResponseMsg || 'Aucun compte trouvé.');
      }
    } catch (error) {
      setMessage('Erreur réseau, réessayez plus tard.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setMessage('');
    try {
      const response = await axios.post(`${basUrl}send_forgot_password_otp.php`, {
        mobile: identifier,
      });
      setMessage(
        response.data.Result === 'true'
          ? 'Un nouveau code a été envoyé.'
          : response.data.ResponseMsg || 'Impossible de renvoyer le code.'
      );
    } catch (error) {
      setMessage('Erreur réseau, réessayez plus tard.');
      console.error(error);
    } finally {
      setResending(false);
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();
    if (!otp || !password) {
      setMessage('Veuillez renseigner le code et le nouveau mot de passe.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${basUrl}forget_password.php`, {
        mobile,
        otp,
        password,
      });

      if (response.data.Result === 'true') {
        router.push('/login');
      } else {
        setMessage(response.data.ResponseMsg || 'Code invalide ou expiré.');
      }
    } catch (error) {
      setMessage('Erreur réseau, réessayez plus tard.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden bg-obsidian px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 78% 8%, rgba(235,6,3,.20), transparent 60%), radial-gradient(50% 40% at 12% 30%, rgba(48,59,99,.22), transparent 60%)',
        }}
      />
      <div className="relative w-full max-w-md animate-rise">
        <div className="rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8 backdrop-blur-xl">
          {step === 'identify' ? (
            <>
              <div className="mb-8 text-center">
                <h1 className="font-serif text-3xl text-white">Mot de passe oublié</h1>
                <p className="mt-2 text-[var(--txt-soft)]">
                  Entrez votre mobile ou votre email, nous vous enverrons un code par SMS.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSendOtp}>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--txt-soft)]">
                    Email ou numéro de téléphone
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full rounded-2xl border border-[var(--line)] bg-white/5 px-4 py-3 text-white outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/20"
                    placeholder="Email ou mobile"
                  />
                </div>

                {message && (
                  <p className="rounded-xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-ember">
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-2xl bg-gradient-passion px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_34px_-10px_rgba(246,65,53,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-12px_rgba(235,6,3,0.45)] disabled:pointer-events-none disabled:opacity-60"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">{loading ? 'Envoi…' : 'Envoyer le code'}</span>
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="font-serif text-3xl text-white">Nouveau mot de passe</h1>
                <p className="mt-2 text-[var(--txt-soft)]">
                  Entrez le code reçu par SMS au {mobile} et votre nouveau mot de passe.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleReset}>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--txt-soft)]">
                    Code de vérification
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full rounded-2xl border border-[var(--line)] bg-white/5 px-4 py-3 text-center text-lg tracking-[0.5em] text-white outline-none transition focus:border-ember"
                    placeholder="••••••"
                    maxLength={6}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--txt-soft)]">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-[var(--line)] bg-white/5 px-4 py-3 text-white outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/20"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--txt-soft)]">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl border border-[var(--line)] bg-white/5 px-4 py-3 text-white outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/20"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>

                {message && (
                  <p className="rounded-xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-ember">
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-2xl bg-gradient-passion px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_34px_-10px_rgba(246,65,53,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-12px_rgba(235,6,3,0.45)] disabled:pointer-events-none disabled:opacity-60"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">{loading ? 'Mise à jour…' : 'Réinitialiser le mot de passe'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full text-center text-sm text-blush hover:underline disabled:opacity-60"
                >
                  {resending ? 'Envoi…' : 'Renvoyer le code'}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-[var(--txt-soft)] hover:underline">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
