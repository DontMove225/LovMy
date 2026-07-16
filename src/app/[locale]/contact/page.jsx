import Link from 'next/link';
import { FiArrowLeft, FiMail } from 'react-icons/fi';

export const metadata = {
  title: 'Contact',
  description: 'Contactez le support LovMy.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-obsidian px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--txt-soft)] hover:text-white">
          <FiArrowLeft className="h-4 w-4" /> Retour à l&apos;accueil
        </Link>

        <span className="font-mono text-xs uppercase tracking-[0.32em] text-ember">Support</span>
        <h1 className="mt-2 font-serif text-4xl text-white">Contactez-nous</h1>
        <p className="mt-4 text-[var(--txt-soft)]">
          Une question, un problème, une suggestion ? Notre équipe est là pour vous aider.
        </p>

        <div className="mt-8 flex items-center gap-4 rounded-2xl border border-[var(--line)] bg-white/[0.03] p-6">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-passion">
            <FiMail className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-serif text-lg text-white">Par email</p>
            <a href="mailto:support@lovmy.fr" className="text-sm text-blush hover:underline">
              support@lovmy.fr
            </a>
          </div>
        </div>

        <p className="mt-6 text-sm text-[var(--txt-faint)]">
          Nous répondons généralement sous 24 à 48 heures ouvrées.
        </p>
      </div>
    </main>
  );
}
