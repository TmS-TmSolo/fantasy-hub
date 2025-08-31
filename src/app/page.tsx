// src/app/page.tsx
import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import Ticker from "@/components/Ticker";
import Section from "@/components/Section";
import StatCard from "@/components/StatCard";
import VideoGrid from "@/components/VideoGrid";
import FantasyAssistant from "@/components/FantasyAssistant";
import Cup from "@/components/Cup";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Fantasy Hub",
  description: "Fantasy tools and rankings",
};

function CupSection() {
  return <Cup />;
}

export default function HomePage() {
  return (
    <>
      <NavBar />

      <Hero />

      <Ticker
        items={[
          "• Trade window open - 0 current offers",
          "Upload your predictions video Andrew",
          "Brady has a Mangina",
          "The Trophy stays in the South",
        ]}
      />

      <Section title="This Week">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Power Rank" stat="#1" hint="Girth Brooks" />
          <StatCard
            title="Injury Watch"
            stat="2"
            hint="Q tags for Cole"
            accent="accent-2"
          />
          <StatCard
            title="Upset Meter"
            stat="42%"
            hint="Dirty Mike gets upset"
            accent="accent-3"
          />
          <StatCard title="Mangina Leader" stat="-0" hint="All of Us" />
        </div>
      </Section>

      <Section id="highlights" title="Highlights">
        <VideoGrid />
      </Section>

      <Section id="assistant" title="Start/Sit Assistant">
        <div className="card card-glow p-4">
          <FantasyAssistant />
        </div>
      </Section>

      {/* Optional: show the cup on the home page */}
      {/* <Section id="cup" title="League Cup">
        <CupSection />
      </Section> */}

      <Footer />
    </>
  );
}
