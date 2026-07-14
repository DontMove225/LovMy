const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lovmy.fr/api/';

export const metadata = {
  title: 'FAQ',
  description: 'Questions fréquentes sur LovMy.',
};

async function getFaqs() {
  try {
    const res = await fetch(`${API_URL}faq.php`, { cache: 'no-store' });
    const json = await res.json();
    return json.Result === 'true' ? (json.data || []) : [];
  } catch {
    return [];
  }
}

export default async function FaqPage() {
  const faqs = await getFaqs();

  return (
    <main className="min-h-screen bg-obsidian px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <span className="font-mono text-xs uppercase tracking-[0.32em] text-ember">Aide</span>
          <h1 className="mt-2 font-serif text-4xl text-white">Questions fréquentes</h1>
        </div>

        {faqs.length === 0 ? (
          <p className="text-center text-[var(--txt-soft)]">Aucune question pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.id} className="group rounded-2xl border border-[var(--line)] bg-white/[0.03] p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-serif text-lg text-white">
                  {faq.question}
                  <span className="ml-4 text-ember transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-[var(--txt-soft)]">{faq.answer}</p>
              </details>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
