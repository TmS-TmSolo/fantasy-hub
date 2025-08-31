// src/components/FantasyAssistant.tsx
'use client';
import { useEffect, useRef, useState } from 'react';

type Role = 'user' | 'assistant';
type Msg = { role: Role; content: string };

function cleanReply(raw: string): string {
  try {
    const j = JSON.parse(raw);
    if (typeof j === 'string') return j;
    return j.reply ?? j.message ?? j.text ?? raw;
  } catch {
    return raw;
  }
}

export default function FantasyAssistant() {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', content: 'Start/Sit Chat ready. Give me some names.' },
  ]);
  const [usePaid, setUsePaid] = useState(false);
  const [pin, setPin] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  async function sendChat() {
    const q = input.trim();
    if (!q || busy) return;
    setInput('');
    setBusy(true);
    setMsgs(m => [...m, { role: 'user', content: q }, { role: 'assistant', content: '' }]);

    try {
      const headers: Record<string, string> = {
        'content-type': 'application/json',
        accept: 'text/plain, application/json',
      };
      if (usePaid && pin) { headers['x-ai-mode'] = 'live'; headers['authorization'] = `Bearer ${pin}`; }

      const res = await fetch('/api/chat', { method: 'POST', headers, body: JSON.stringify({ q }) });
      const txt = await res.text();
      const msg = cleanReply(txt) || '(no reply)';
      setMsgs(m => { const out = [...m]; out[out.length - 1] = { role: 'assistant', content: msg }; return out; });
    } catch {
      setMsgs(m => { const out = [...m]; out[out.length - 1] = { role: 'assistant', content: 'Local error. Try again.' }; return out; });
    } finally {
      setBusy(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); }
  }

  return (
    <div id="assistant" className="space-y-4">
      <h3 className="text-base font-semibold">Start/Sit Chat</h3>

      <div className="flex flex-col gap-3">
        <div className="h-[380px] overflow-y-auto rounded-2xl border border-indigo-800 bg-indigo-950 p-4">
          {msgs.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <div
                className={
                  'inline-block max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ' +
                  (m.role === 'user' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-900')
                }
              >
                {m.content}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="flex items-center gap-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="e.g., Start Gibbs or Cook?"
            className="min-h-[56px] flex-1 resize-none rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={sendChat}
            disabled={busy}
            className="rounded-2xl bg-indigo-600 px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? 'Thinking' : 'Send'}
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={usePaid} onChange={e => setUsePaid(e.target.checked)} />
            Use paid
          </label>
          {usePaid && (
            <input
              className="border rounded px-2 py-1 text-sm"
              placeholder="PIN"
              value={pin}
              onChange={e => setPin(e.target.value)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
