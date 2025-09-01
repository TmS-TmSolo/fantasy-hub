import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE =
  process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const BUCKET = process.env.SUPABASE_VIDEO_BUCKET || 'videos';

function bearer(req: NextRequest): string {
  const h = req.headers.get('authorization') || '';
  return h.toLowerCase().startsWith('bearer ') ? h.slice(7) : '';
}

export async function POST(req: NextRequest) {
  try {
    // PIN auth
    const token = bearer(req);
    const okPins = [process.env.UPLOAD_TOKEN, process.env.ADMIN_AI_PIN].filter(Boolean) as string[];
    if (!okPins.length) {
      return NextResponse.json({ error: 'Server PINs not configured.' }, { status: 500 });
    }
    if (!okPins.includes(token)) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // Env guard
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return NextResponse.json(
        { error: 'Supabase env not set (need SUPABASE_URL|NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE).' },
        { status: 500 }
      );
    }

    // Form data
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const title = String(form.get('title') || '').trim();
    if (!file) return NextResponse.json({ error: 'File missing.' }, { status: 400 });
    if (!title) return NextResponse.json({ error: 'Title missing.' }, { status: 400 });

    // Admin client
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Ensure bucket
    await admin.storage
      .createBucket(BUCKET, { public: true, fileSizeLimit: 524_288_000 })
      .catch(() => { /* already exists */ });

    // Object key
    const name = (file as any).name as string | undefined;
    const ext = name && name.includes('.') ? name.slice(name.lastIndexOf('.')) : '';
    const key = `uploads/${new Date().getFullYear()}/${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;

    // Upload
    const { error: upErr } = await admin.storage.from(BUCKET).upload(key, file, {
      cacheControl: '31536000',
      contentType: (file as any).type || 'video/mp4',
      upsert: false,
    });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    // Public URL + DB row
    const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(key);
    const public_url = pub?.publicUrl || '';

    const { error: insErr } = await admin
      .from('videos')
      .insert({ title, storage_path: key, public_url });
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

    return NextResponse.json({ message: 'Uploaded', url: public_url, path: key }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error.' }, { status: 500 });
  }
}
