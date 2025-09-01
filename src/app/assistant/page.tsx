import FantasyAssistant from "@/components/FantasyAssistant";

export const metadata = {
  title: "Fantasy Assistant",
};

export default function AssistantPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl mb-4">Fantasy Assistant</h1>
      <FantasyAssistant />
    </main>
  );
}
