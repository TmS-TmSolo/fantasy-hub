import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const BUCKET = process.env.SUPABASE_VIDEO_BUCKET || 'videos';

function bearer(req: NextRequest) {
  const h = req.headers.get('authorization') || '';
  const lower = h.toLowerCase();
  if (lower.startsWith('bearer ')) return h.slice(7);
  return '';
}

export async function POST(req: NextRequest) {
  try {
    const token = bearer(req);
    const okPins = [process.env.UPLOAD_TOKEN, process.env.ADMIN_AI_PIN].filter(Boolean);
    if (!okPins.length) {
      return NextResponse.json({ error: 'Server PINs not configured.' }, { status: 500 });
    }
    if (!okPins.includes(token)) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get('file') as File | null;
    const title = String(form.get('title') || '').trim();

    if (!file) return NextResponse.json({ error: 'File missing.' }, { status: 400 });
    if (!title) return NextResponse.json({ error: 'Title missing.' }, { status: 400 });

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return NextResponse.json({ error: 'Supabase env not set.' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Ensure bucket exists (idempotent)
    await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 524288000, // 500MB
    }).catch(() => { /* bucket may already exist */ });

    const ext = (() => {
      const name = (file as any).name as string | undefined;
      if (!name) return '';
      const dot = name.lastIndexOf('.');
      return dot >= 0 ? name.slice(dot) : '';
    })();

    const key = `uploads/${new Date().getFullYear()}/${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}${ext}`;

    const upload = await supabase.storage.from(BUCKET).upload(key, file, {
      cacheControl: '31536000',
      contentType: (file as any).type || 'video/mp4',
      upsert: false,
    });

    if (upload.error) {
      return NextResponse.json({ error: upload.error.message }, { status: 500 });
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(key);
    const public_url = pub?.publicUrl;

    const insert = await supabase.from('videos').insert({
      title,
      storage_path: key,
      public_url,
    });

    if (insert.error) {
      return NextResponse.json({ error: insert.error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Uploaded', url: public_url, path: key },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error.' }, { status: 500 });
  }
}
