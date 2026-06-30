'use client';

import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MyContext } from '@/context/MyProvider';
import axios from 'axios';

export default function PhoneNumberPage() {
  const { basUrl } = useContext(MyContext);
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!phone || phone.length < 7) {
      setMessage('Veuillez entrer un numéro valide.');
      return;
    }

    try {
      const response = await axios.post(`${basUrl}mobile_check.php`, {
        mobile: phone.replace(/\D/g, ''),
        ccode: '+91',
      });

      if (response.data.Result === 'true') {
        router.push('/login');
      } else {
        setMessage(response.data.ResponseMsg || 'Impossible de vérifier le numéro');
      }
    } catch (error) {
      setMessage('Erreur réseau, réessayez plus tard.');
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-slate-900">Numéro de téléphone</h1>
        <p className="mt-3 text-slate-600">Entrez votre numéro pour continuer l'inscription.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Numéro</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
              placeholder="+91 12345 67890"
            />
          </label>

          {message ? <p className="text-sm text-rose-600">{message}</p> : null}

          <button
            type="submit"
            className="w-full rounded-2xl bg-violet-600 px-5 py-3 text-white transition hover:bg-violet-700"
          >
            Vérifier le numéro
          </button>
        </form>
      </div>
    </main>
  );
}
