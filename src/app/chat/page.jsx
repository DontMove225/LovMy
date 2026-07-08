'use client';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MyContext } from '@/context/MyProvider';
import { FiSearch, FiSend } from 'react-icons/fi';

function formatTime(datetime) {
  if (!datetime) return '';
  const d = new Date(datetime);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPage() {
  const router = useRouter();
  const { apiPost, getStoredUser } = useContext(MyContext);
  const [me, setMe] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

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

  const fetchConversations = useCallback(async (uid) => {
    setLoadingList(true);
    try {
      const result = await apiPost('conversations.php', { uid });
      if (result.Result === 'true') {
        setConversations(result.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingList(false);
    }
  }, [apiPost]);

  useEffect(() => {
    if (me) fetchConversations(me.id);
  }, [me, fetchConversations]);

  const fetchMessages = useCallback(async (uid, partnerId) => {
    try {
      const result = await apiPost('messages_list.php', { uid, partner_id: partnerId });
      if (result.Result === 'true') {
        setMessages(result.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  }, [apiPost]);

  useEffect(() => {
    if (!me || !active) return;
    fetchMessages(me.id, active.partner_id);
    const interval = setInterval(() => fetchMessages(me.id, active.partner_id), 4000);
    return () => clearInterval(interval);
  }, [me, active, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!draft.trim() || !active || !me) return;
    setSending(true);
    try {
      await apiPost('send_message.php', {
        sender_id: me.id,
        receiver_id: active.partner_id,
        message: draft.trim(),
      });
      setDraft('');
      await fetchMessages(me.id, active.partner_id);
      await fetchConversations(me.id);
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const filtered = conversations.filter((c) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase())
  );

  if (!me) return null;

  return (
    <main className="h-[calc(100vh-64px)] bg-obsidian px-4 py-6 lg:h-screen">
      <div className="mx-auto flex h-full max-w-6xl gap-5">
        {/* Conversation list */}
        <aside className="flex w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-[var(--line)] bg-white/[0.03]">
          <div className="border-b border-[var(--line)] p-4">
            <div className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white/5 px-3 py-2">
              <FiSearch className="h-4 w-4 text-[var(--txt-faint)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[var(--txt-faint)]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <p className="p-4 text-sm text-[var(--txt-faint)]">Chargement…</p>
            ) : filtered.length === 0 ? (
              <p className="p-4 text-sm text-[var(--txt-faint)]">Aucune conversation pour le moment.</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.partner_id}
                  onClick={() => setActive(c)}
                  className={`flex w-full items-center gap-3 border-b border-[var(--line)] px-4 py-3 text-left transition ${
                    active?.partner_id === c.partner_id ? 'bg-white/5' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-passion text-sm font-bold text-white">
                    {c.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-white">{c.name}</p>
                      <span className="shrink-0 font-mono text-[10px] text-[var(--txt-faint)]">
                        {formatTime(c.datetime)}
                      </span>
                    </div>
                    <p className="truncate text-xs text-[var(--txt-soft)]">{c.last_message}</p>
                  </div>
                  {c.unread_count > 0 ? (
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-passion font-mono text-[10px] font-bold text-white">
                      {c.unread_count}
                    </span>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Thread */}
        <section className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-[var(--line)] bg-white/[0.03]">
          <div className="border-b border-[var(--line)] px-6 py-4">
            <h2 className="font-serif text-lg text-white">
              {active ? active.name : 'Sélectionnez une conversation'}
            </h2>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
            {active ? (
              messages.length === 0 ? (
                <p className="text-center text-sm text-[var(--txt-faint)]">
                  Aucun message. Dites bonjour !
                </p>
              ) : (
                messages.map((m) => {
                  const mine = m.sender_id === me.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm sm:max-w-md ${
                          mine
                            ? 'bg-gradient-passion text-white'
                            : 'border border-[var(--line)] bg-white/5 text-[var(--txt)]'
                        }`}
                      >
                        <p>{m.message}</p>
                        <p className={`mt-1 font-mono text-[10px] ${mine ? 'text-white/70' : 'text-[var(--txt-faint)]'}`}>
                          {formatTime(m.datetime)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[var(--txt-faint)]">
                Choisissez une conversation à gauche pour commencer à discuter.
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {active ? (
            <form onSubmit={handleSend} className="flex items-center gap-3 border-t border-[var(--line)] px-6 py-4">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Écrivez un message…"
                className="flex-1 rounded-full border border-[var(--line)] bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-ember"
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-passion text-white shadow-[0_6px_18px_rgba(235,6,3,0.35)] transition hover:brightness-110 disabled:opacity-50"
              >
                <FiSend className="h-4 w-4" />
              </button>
            </form>
          ) : null}
        </section>
      </div>
    </main>
  );
}
