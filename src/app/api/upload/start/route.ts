import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const ROLE = process.env.SUPABASE_SERVICE_ROLE || '';
const BUCKET = (process.env.SUPABASE_VIDEO_BUCKET || 'Videos').trim();

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
    const filename = String(body.filename || '').trim();
    const mimetype = String(body.mimetype || 'video/mp4');
    const title = String(body.title || '').trim();
    if (!filename) return NextResponse.json({ error: 'filename required' }, { status: 400 });
    if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 });

    const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')) : '';
    const key = `uploads/${new Date().getFullYear()}/${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;

    const admin = createClient(URL, ROLE);

    // ensure bucket exists and is public
    const { data: bucket, error: bErr } = await admin.storage.getBucket(BUCKET);
    if (bErr || !bucket) {
      const { error } = await admin.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 524_288_000 });
      if (error && !/already exists/i.test(error.message)) {
        return NextResponse.json({ error: `Create bucket failed: ${error.message}` }, { status: 500 });
      }
    }

    const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(key);
    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: error?.message || 'Failed to create signed URL' }, { status: 500 });
    }

    const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(key);
    const publicUrl = pub?.publicUrl || '';

    return NextResponse.json({
      path: key,
      signedUrl: data.signedUrl,
      publicUrl,
      title,
      mimetype,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
