export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'Videos';                    // your bucket name (case-sensitive)
const MAX_BYTES = 200 * 1024 * 1024;        // 200 MB

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const role = process.env.SUPABASE_SERVICE_ROLE!;
const TOKEN = process.env.UPLOAD_TOKEN!;

const admin = createClient(url, role, { auth: { persistSession: false } });

export async function POST(req: NextRequest) {
  try {
    // simple shared-secret gate
    const auth = req.headers.get('authorization') || '';
    const pin = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!TOKEN || pin !== TOKEN) return new Response('Unauthorized', { status: 401 });

    const form = await req.formData();
    const file = form.get('file') as File | null;
    const title = String(form.get('title') ?? '').trim();
    const teamId = String(form.get('teamId') ?? '').trim();

    if (!file || !title || !teamId) return new Response('Missing fields', { status: 400 });
    if (file.size > MAX_BYTES) return new Response('File too large', { status: 400 });
    if (!/^video\//.test(file.type)) return new Response('Only video/* allowed', { status: 400 });

    const safe = (s: string) => s.replace(/[^a-z0-9._-]+/gi, '_');
    const path = `${Date.now()}_${safe(teamId)}_${safe(title)}_${safe(file.name)}`;

    const { error: upErr } = await admin.storage.from(BUCKET).upload(path, file, { upsert: false });
    if (upErr) return new Response(upErr.message, { status: 400 });

    const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
    const url = pub?.publicUrl;
    if (!url) return new Response('No public URL', { status: 500 });

    // service role bypasses RLS, so insert works without a table insert policy
    const { error: insErr } = await admin.from('videos').insert({ title, url, team_id: teamId });
    if (insErr) return new Response(insErr.message, { status: 400 });

    return Response.json({ ok: true, url, path });
  } catch (e: any) {
    return new Response(`Upload error: ${e?.message ?? 'unknown'}`, { status: 500 });
  }
}
