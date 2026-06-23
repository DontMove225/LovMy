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
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-slate-900">Créer un compte</h1>
        <p className="mt-3 text-slate-600">Inscris-toi pour commencer sur LovMy.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nom</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
              placeholder="First name"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
              placeholder="Email address"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Mot de passe</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
              placeholder="Password"
            />
          </label>

          {message ? <p className="text-sm text-rose-600">{message}</p> : null}

          <button
            type="submit"
            className="w-full rounded-2xl bg-violet-600 px-5 py-3 text-white transition hover:bg-violet-700"
          >
            Continuer
          </button>
        </form>
      </div>
    </main>
  );
}
