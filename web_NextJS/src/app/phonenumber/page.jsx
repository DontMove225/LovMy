'use client';

import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MyContext } from '@/context/MyProvider';
import axios from 'axios';

export default function PhoneNumberPage() {
  const { basUrl, login } = useContext(MyContext);
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!phone || phone.length < 7) {
      setMessage('Veuillez entrer un numéro valide.');
      return;
    }

    const pending = JSON.parse(localStorage.getItem('Register_User') || 'null');
    if (!pending) {
      setMessage('Session expirée, veuillez recommencer l\'inscription.');
      router.push('/register');
      return;
    }

    setLoading(true);
    setMessage('');
    const mobile = phone.replace(/\D/g, '');

    try {
      const checkResponse = await axios.post(`${basUrl}mobile_check.php`, {
        mobile,
        ccode: '+33',
      });

      if (checkResponse.data.Result === 'true') {
        setMessage('Ce numéro est déjà utilisé.');
        return;
      }

      const registerResponse = await axios.post(`${basUrl}reg_user.php`, {
        name: pending.name,
        email: pending.email,
        password: pending.password,
        mobile,
        ccode: '+33',
      });

      if (registerResponse.data.Result === 'true') {
        localStorage.removeItem('Register_User');
        login(registerResponse.data.UserLogin, registerResponse.data.token);
        router.push('/dashboard');
      } else {
        setMessage(registerResponse.data.ResponseMsg || 'Impossible de créer le compte');
      }
    } catch (error) {
      setMessage('Erreur réseau, réessayez plus tard.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-obsidian px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8">
        <h1 className="font-serif text-3xl text-white">Numéro de téléphone</h1>
        <p className="mt-3 text-[var(--txt-soft)]">Entrez votre numéro pour continuer l&apos;inscription.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-[var(--txt-soft)]">Numéro</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white/5 px-4 py-3 text-white outline-none transition focus:border-ember"
              placeholder="+33 6 12 34 56 78"
            />
          </label>

          {message ? <p className="text-sm text-ember">{message}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-passion px-5 py-3 text-white shadow-[0_12px_30px_rgba(235,6,3,0.35)] transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? 'Création du compte…' : 'Créer mon compte'}
          </button>
        </form>
      </div>
    </main>
  );
}
