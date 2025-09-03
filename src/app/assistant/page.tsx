// src/app/assistant/page.tsx
import Section from "@/components/Section";
import FantasyAssistant from "@/components/FantasyAssistant";

export const dynamic = "force-dynamic";

export default function AssistantPage() {
  return (
    <Section title="Start / Sit Assistant">
      <FantasyAssistant />
    </Section>
  );
}
