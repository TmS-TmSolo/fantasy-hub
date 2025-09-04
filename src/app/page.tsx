// src/app/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import Hero from "@/components/Hero";
import Ticker from "@/components/Ticker";
import Section from "@/components/Section";
import StatCard from "@/components/StatCard";
import NewsSection from "@/components/NewsSection";
import Footer from "@/components/Footer";

export default async function HomePage() {
  return (
    <>
      {/* Hero Section - now completely separate with its own video */}
      <Hero />

      {/* Ticker */}
      <Ticker
        items={[
          "• Trade window open - 0 current offers",
          "Upload your predictions video Andrew",
          "Brady has a Mangina",
          "The Trophy stays in the South",
        ]}
      />

      {/* News Section - dedicated component with 3 video cards */}
      <Section title="Fantasy News">
        <NewsSection />
      </Section>

      {/* Quick Links */}
      <Section title="Quick Links">
        <div className="flex flex-wrap gap-2">
          <Link href="/tools/league" className="btn btn-ghost h-9">Standings</Link>
          <Link href="/owners" className="btn btn-primary h-9">Team Profiles</Link>
          <Link href="/assistant" className="btn btn-ghost h-9">Start/Sit Assistant</Link>
        </div>
      </Section>

      {/* This Week Stats */}
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