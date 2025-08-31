import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !/^https?:\/\//.test(url)) throw new Error('Set NEXT_PUBLIC_SUPABASE_URL (https://xxxx.supabase.co)');
if (!anon) throw new Error('Set NEXT_PUBLIC_SUPABASE_ANON_KEY (Settings → API)');

export const supabase = createClient(url, anon);
