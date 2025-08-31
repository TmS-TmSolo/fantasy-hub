'use client';
import { useEffect, useState } from 'react';
import VideoPlayer from './VideoPlayer';
import { supabase } from '@/lib/supabase';

type Row = { id: string; title: string; url: string };

export default function VideoGrid() {
  const [list, setList] = useState<Row[]>([]);
  useEffect(() => {
    supabase.from('videos').select('id,title,url').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setList(data); });
  }, []);
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map(v => (
        <div key={v.id} className="space-y-2">
          <VideoPlayer src={v.url} title={v.title} />
        </div>
      ))}
    </div>
  );
}
