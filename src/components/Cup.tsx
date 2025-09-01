/* eslint-disable @next/next/no-img-element */
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Champ = { year: number; team: string; manager?: string };
type FileEntry = { name: string };
type CellProps = { children: React.ReactNode; className?: string };

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

  async function listMedia() {
    const v = await supabase.storage.from('Videos').list('trophy/videos', { limit: 100 });
    const p = await supabase.storage.from('Videos').list('trophy/photos', { limit: 100 });

    const vUrls = (v.data ?? [])
      .filter((x: FileEntry) => x.name && !x.name.endsWith('/'))
      .map((x: FileEntry) =>
        supabase.storage.from('Videos').getPublicUrl(`trophy/videos/${x.name}`).data.publicUrl
      );

    const pUrls = (p.data ?? [])
      .filter((x: FileEntry) => x.name && !x.name.endsWith('/'))
      .map((x: FileEntry) =>
        supabase.storage.from('Videos').getPublicUrl(`trophy/photos/${x.name}`).data.publicUrl
      );

    setVids(vUrls);
    setPics(pUrls);
  }

  useEffect(() => { void listMedia(); }, []);

  async function upload(kind: 'video' | 'photo', file: File) {
    if (!file) return;
    const qs = new URLSearchParams({
      path: `trophy/${kind === 'video' ? 'videos' : 'photos'}/${Date.now()}_${file.name}`,
    });
    const form = new FormData();
    form.append('file', file);

    const res = await fetch(`/api/upload?${qs.toString()}`, {
      method: 'POST',
      body: form,
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
              {HISTORY.map((c) => (
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
          <label className="flex items-center gap-2">
            <span className="text-sm w-24">Video:</span>
            <input type="file" accept="video/*" onChange={(e) => e.target.files?.[0] && upload('video', e.target.files[0])} />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-sm w-24">Photo:</span>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload('photo', e.target.files[0])} />
          </label>
        </div>
        <p className="text-xs text-muted">Stored in bucket “Videos” under trophy/.</p>
      </section>

      <section className="space-y-3" id="videos">
        <h2 className="text-2xl font-display">Trophy Videos</h2>
        {vids.length === 0 ? (
          <div className="text-sm text-muted">No videos yet.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vids.map((u) => (
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
            {pics.map((u) => (
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

function Th({ children, className = '' }: CellProps) {
  return <th className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 ${className}`}>{children}</th>;
}
function Td({ children, className = '' }: CellProps) {
  return <td className={`px-3 py-2 text-sm text-slate-100 ${className}`}>{children}</td>;
}
