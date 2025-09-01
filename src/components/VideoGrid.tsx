'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Video = {
  id: string | number;
  title: string;
  url: string;
  featured?: boolean;
  featured_rank?: number | null;
  created_at?: string | null;
};

type Props = {
  /** Homepage: show only these if available */
  featuredOnly?: boolean;
  /** Limit count, e.g., 3 for homepage */
  limit?: number;
  /** Filter out URLs that were deleted from storage */
  filterStale?: boolean;
};

async function headExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

export default function VideoGrid({ featuredOnly = false, limit, filterStale = true }: Props) {
  const [list, setList] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);

      // base select
      let q = supabase
        .from('videos')
        .select('id,title,url,featured,featured_rank,created_at');

      if (featuredOnly) q = q.eq('featured', true);

      // order: featured_rank desc first, then newest created
      // featured_rank defaults to 0 if you don’t set it
      q = q.order('featured_rank', { ascending: false }).order('created_at', { ascending: false });

      if (limit) q = q.limit(limit);

      const { data, error } = await q;

      if (error) {
        if (alive) {
          setList([]);
          setLoading(false);
        }
        return;
      }

      let rows = (data ?? []) as Video[];

      // If you asked for featuredOnly but none are flagged, fall back to newest
      if (featuredOnly && rows.length === 0) {
        const { data: newest } = await supabase
          .from('videos')
          .select('id,title,url,featured,featured_rank,created_at')
          .order('created_at', { ascending: false })
          .limit(limit ?? 3);
        rows = (newest ?? []) as Video[];
      }

      if (filterStale) {
        const withOk = await Promise.all(
          rows.map(async (v) => ({ v, ok: await headExists(v.url) }))
        );
        rows = withOk.filter((x) => x.ok).map((x) => x.v);
      }

      if (alive) {
        setList(rows);
        setLoading(false);
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, [featuredOnly, limit, filterStale]);

  if (loading) return <div className="text-sm text-muted">Loading…</div>;
  if (list.length === 0) return <div className="text-sm text-muted">No videos yet.</div>;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((v) => (
        <div key={String(v.id)} className="card overflow-hidden">
          <div className="p-3">
            <h3 className="font-semibold">{v.title}</h3>
          </div>
          <video src={v.url} controls className="w-full aspect-video" />
        </div>
      ))}
    </div>
  );
}
