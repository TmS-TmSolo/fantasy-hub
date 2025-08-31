'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Champ = { year: number; team: string; manager?: string };

const HISTORY: Champ[] = [
  { year: 2014, team: '—', manager: '' },
  { year: 2015, team: '—', manager: '' },
  { year: 2016, team: '—', manager: '' },
  { year: 2017, team: '—', manager: '' },
  { year: 2018, team: '—', manager: '' },
  { year: 2019, team: '—', manager: '' },
  { year: 2020, team: '—', manager: '' },
  { year: 2021, team: '—', manager: '' },
  { year: 2022, team: '—', manager: '' },
  { year: 2023, team: '—', manager: '' },
  { year: 2024, team: '—', manager: '' },
  { year: 2025, team: '—', manager: '' },
];

export default function Cup() {
  const [vids, setVids] = useState<string[]>([]);
  const [pics, setPics] = useState<string[]>([]);
  const [pass, setPass] = useState('');

  async function listMedia() {
    const v = await supabase.storage.from('Videos').list('trophy/videos', { limit: 100 });
    const p = await supabase.storage.from('Videos').list('trophy/photos', { limit: 100 });
    const vUrls = (v.data || [])
      .filter(x => x.name && !x.name.endsWith('/'))
      .map(x => supabase.storage.from('Videos').getPublicUrl(`trophy/videos/${x.name}`).data.publicUrl);
    const pUrls = (p.data || [])
      .filter(x => x.name && !x.name.endsWith('/'))
      .map(x => supabase.storage.from('Videos').getPublicUrl(`trophy/photos/${x.name}`).data.publicUrl);
    setVids(vUrls);
    setPics(pUrls);
  }
  useEffect(() => { listMedia(); }, []);

  async function upload(kind: 'video' | 'photo', file: File) {
    if (!file) return;
    const qs = new URLSearchParams({ path: `trophy/${kind === 'video' ? 'videos' : 'photos'}/${Date.now()}_${file.name}` });
    const res = await fetch(`/api/upload?${qs.toString()}`, {
      method: 'POST',
      headers: { 'x-upload-token': pass },
      body: (() => { const f = new FormData(); f.append('file', file); return f; })(),
    });
    if (!res.ok) { alert('Upload failed'); return; }
    await listMedia();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-10">
      <section className="card card-glow p-6">
        <h1 className="text-3xl font-display">The Big Cock Cup</h1>
        <p className="text-muted mt-1">Eternal glory for league champions. Add photos and hype videos of the trophy here.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-display">History</h2>
        <div className="card card-glow overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <Th className="text-left">Year</Th>
                <Th className="text-left">Champion Team</Th>
                <Th className="text-left">Manager</Th>
              </tr>
            </thead>
            <tbody>
              {HISTORY.map((c, i) => (
                <tr key={c.year} className="odd:bg-white/10 even:bg-white/5">
                  <Td className="font-medium">{c.year}</Td>
                  <Td>{c.team || '—'}</Td>
                  <Td className="text-slate-300">{c.manager || '—'}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted">Send me the real champs and I’ll fill this in.</p>
      </section>

      <section className="space-y-3 card card-glow p-5">
        <h2 className="text-xl font-display">Add Media</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            type="password"
            placeholder="Upload password"
            className="rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm"
            value={pass}
            onChange={e => setPass(e.target.value)}
          />
          <label className="flex items-center gap-2">
            <span className="text-sm w-24">Video:</span>
            <input type="file" accept="video/*" onChange={e => e.target.files?.[0] && upload('video', e.target.files[0])} />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-sm w-24">Photo:</span>
            <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && upload('photo', e.target.files[0])} />
          </label>
        </div>
        <p className="text-xs text-muted">Uses your existing /api/upload with UPLOAD_TOKEN. Stored in bucket “Videos” under trophy/.</p>
      </section>

      <section className="space-y-3" id="videos">
        <h2 className="text-2xl font-display">Trophy Videos</h2>
        {vids.length === 0 ? (
          <div className="text-sm text-muted">No videos yet.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vids.map(u => (
              <div key={u} className="card overflow-hidden">
                <video src={u} controls className="w-full aspect-video" />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3" id="photos">
        <h2 className="text-2xl font-display">Trophy Photos</h2>
        {pics.length === 0 ? (
          <div className="text-sm text-muted">No photos yet.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {pics.map(u => (
              <div key={u} className="card overflow-hidden">
                <img src={u} alt="Trophy photo" className="w-full h-48 object-cover" />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Th({ children, className='' }: any){
  return <th className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 ${className}`}>{children}</th>;
}
function Td({ children, className='' }: any){
  return <td className={`px-3 py-2 text-sm text-slate-100 ${className}`}>{children}</td>;
}
