import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const ROLE = process.env.SUPABASE_SERVICE_ROLE || '';
const BUCKET = (process.env.SUPABASE_VIDEO_BUCKET || 'videos').trim();

function bearer(req: NextRequest) {
  const h = req.headers.get('authorization') || '';
  return h.toLowerCase().startsWith('bearer ') ? h.slice(7) : '';
}

export async function POST(req: NextRequest) {
  try {
    const pin = bearer(req);
    const ok = [process.env.UPLOAD_TOKEN, process.env.ADMIN_AI_PIN].filter(Boolean) as string[];
    if (!ok.length) return NextResponse.json({ error: 'PINs not configured.' }, { status: 500 });
    if (!ok.includes(pin)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!URL || !ROLE) return NextResponse.json({ error: 'Supabase env not set.' }, { status: 500 });

    const body = await req.json().catch(() => ({}));
    const title = String(body.title || '').trim();
    const path = String(body.path || '').trim();
    if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 });
    if (!path) return NextResponse.json({ error: 'path required' }, { status: 400 });

    const admin = createClient(URL, ROLE);

    // derive public URL
    const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
    const public_url = pub?.publicUrl || '';

    const { error: insErr } = await admin.from('Videos').insert({
      title,
      storage_path: path,
      public_url,
    });
    if (insErr) return NextResponse.json({ error: `DB insert failed: ${insErr.message}` }, { status: 500 });

    return NextResponse.json({ ok: true, url: public_url, path });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
