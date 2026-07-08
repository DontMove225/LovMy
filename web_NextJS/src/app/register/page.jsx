'use client';

import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MyContext } from '@/context/MyProvider';
import axios from 'axios';

export default function RegisterPage() {
  const { basUrl } = useContext(MyContext);
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name || !email || !password) {
      setMessage('Tous les champs sont requis.');
      return;
    }

    try {
      const response = await axios.post(`${basUrl}email_check.php`, {
        email,
      });

      if (response.data.Result === 'true') {
        localStorage.setItem('Register_User', JSON.stringify({ name, email, password }));
        router.push('/phonenumber');
      } else {
        setMessage(response.data.ResponseMsg || 'Impossible de vérifier l’email');
      }
    } catch (error) {
      setMessage('Erreur réseau, réessayez plus tard.');
      console.error(error);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-obsidian px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 78% 8%, rgba(235,6,3,.20), transparent 60%), radial-gradient(50% 40% at 12% 30%, rgba(48,59,99,.22), transparent 60%)',
        }}
      />
      <div className="relative w-full max-w-md rounded-3xl border border-[var(--line)] bg-white/[0.03] p-8 backdrop-blur-xl">
        <h1 className="font-serif text-3xl text-white">Créer un compte</h1>
        <p className="mt-3 text-[var(--txt-soft)]">Inscris-toi pour commencer sur LovMy.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-[var(--txt-soft)]">Nom</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white/5 px-4 py-3 text-white outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/20"
              placeholder="First name"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[var(--txt-soft)]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white/5 px-4 py-3 text-white outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/20"
              placeholder="Email address"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[var(--txt-soft)]">Mot de passe</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white/5 px-4 py-3 text-white outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/20"
              placeholder="Password"
            />
          </label>

          {message ? <p className="text-sm text-ember">{message}</p> : null}

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-passion px-5 py-3 text-white shadow-[0_12px_30px_rgba(235,6,3,0.35)] transition hover:brightness-110"
          >
            Continuer
          </button>
        </form>
      </div>
    </main>
  );
}
