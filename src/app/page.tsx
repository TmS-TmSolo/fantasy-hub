// src/app/page.tsx
export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import Hero from "@/components/Hero";
import Ticker from "@/components/Ticker";
import Section from "@/components/Section";
import StatCard from "@/components/StatCard";
import Cup from "@/components/Cup";
import Footer from "@/components/Footer";
import VideoPlayer from "@/components/VideoPlayer";

function CupPage() {
  return <Cup />;
}

type VideoRow = { id: string; title: string; public_url: string; created_at: string };

export default async function HomePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from('videos')
    .select('id,title,public_url,created_at')
    .order('created_at', { ascending: false })
    .limit(1);

  const latest: VideoRow | null = data?.[0] ?? null;

  return (
    <>
      <Hero />

      <Ticker
        items={[
          "• Trade window open - 0 current offers",
          "Upload your predictions video Andrew",
          "Brady has a Mangina",
          "The Trophy stays in the South",
        ]}
      />

      {latest && (
        <Section title="Latest Upload">
          <VideoPlayer
            src={latest.public_url}
            title={latest.title}
            autoPlay
            muted
            loop
            controls={false}
            className="w-full"
          />
          <div className="text-sm text-gray-600 mt-2">
            {new Date(latest.created_at).toLocaleString()}
          </div>
        </Section>
      )}

      <Section title="This Week">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Power Rank" stat="#1" hint="Girth Brooks" />
          <StatCard title="Injury Watch" stat="2" hint="Q tags for Cole" accent="accent-2" />
          <StatCard title="Upset Meter" stat="42%" hint="Dirty Mike gets upset" accent="accent-3" />
          <StatCard title="Mangina Leader" stat="-0" hint="All of Us" />
        </div>
      </Section>
      <Footer />
    </>
  );
}
