// src/app/page.tsx
export const dynamic = 'force-dynamic';

import Hero from "@/components/Hero";
import Ticker from "@/components/Ticker";
import Section from "@/components/Section";
import StatCard from "@/components/StatCard";
import Cup from "@/components/Cup";
import Footer from "@/components/Footer";
import VideoPlayer from "@/components/VideoPlayer";

const VIDEO_URL = process.env.NEXT_PUBLIC_VIDEO_URL ?? "";

function CupPage() {
  return <Cup />;
}

export default async function HomePage() {
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

      <Section title="League Video">
        {VIDEO_URL ? (
          <VideoPlayer
            src={VIDEO_URL}
            title="League Video"
            autoPlay
            muted
            loop
            controls
            className="w-full"
          />
        ) : (
          <div className="text-sm text-gray-600">
            Set <code>NEXT_PUBLIC_VIDEO_URL</code> to display a video.
          </div>
        )}
      </Section>

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
