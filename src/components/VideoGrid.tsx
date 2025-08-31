'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Video = { id: string | number; title: string; url: string };

export default function VideoGrid() {
  const [list, setList] = useState<Video[]>([]);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('videos')
        .select('id,title,url')
        .order('created_at', { ascending: false });

      if (error) return;
      setList((data ?? []) as Video[]);
    }
    void load();
  }, []);

  if (list.length === 0) return <div className="text-sm text-muted">No videos yet.</div>;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((v) => (
        <div key={String(v.id)} className="card overflow-hidden">
          <div className="p-3"><h3 className="font-semibold">{v.title}</h3></div>
          <video src={v.url} controls className="w-full aspect-video" />
        </div>
      ))}
    </div>
  );
}
