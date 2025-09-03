'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import VideoPlayer from './VideoPlayer';

type VideoRow = { id: string; title: string; public_url: string; storage_path: string; created_at: string };
type Props = { featuredOnly?: boolean; limit?: number; className?: string };

export default function VideoGrid({ featuredOnly = false, limit, className }: Props) {
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [selected, setSelected] = useState<VideoRow | null>(null);
  const [q, setQ] = useState('');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setErr(null);
      let qy = supabase
        .from('videos')
        .select('id,title,public_url,storage_path,created_at')
        .order('created_at', { ascending: false });

      if (featuredOnly) {
        const tryFilter = await qy.eq('featured', true);
        if (!tryFilter.error) {
          setVideos(limit ? (tryFilter.data || []).slice(0, limit) : (tryFilter.data || []));
          return;
        }
      }

      const { data, error } = await qy;
      if (error) { setErr(error.message); setVideos([]); return; }
      setVideos(limit ? (data || []).slice(0, limit) : (data || []));
    })();
  }, [featuredOnly, limit]);

  const list = q
    ? videos.filter(v =>
        v.title.toLowerCase().includes(q.toLowerCase()) ||
        v.storage_path.toLowerCase().includes(q.toLowerCase()))
    : videos;

  return (
    <div className={className ?? 'space-y-4'}>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search videos" className="border rounded p-2 w-full max-w-md" />
      {err && <div className="text-sm text-red-600">{err}</div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map(v => (
          <button key={v.id} className="text-left border rounded overflow-hidden hover:shadow" onClick={() => setSelected(v)}>
            <div className="aspect-video bg-black grid place-items-center text-white text-sm">Play</div>
            <div className="p-3">
              <div className="font-semibold line-clamp-2">{v.title}</div>
              <div className="text-xs text-gray-600 mt-1">{new Date(v.created_at).toLocaleString()}</div>
            </div>
          </button>
        ))}
      </div>
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 grid place-items-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white w-full max-w-3xl rounded shadow" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 py-3 border-b">
              <div className="font-semibold truncate pr-4">{selected.title}</div>
              <button className="px-3 py-1 text-sm border rounded" onClick={() => setSelected(null)}>Close</button>
            </div>
            <div className="p-4">
              <VideoPlayer src={selected.public_url} title={selected.title} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
