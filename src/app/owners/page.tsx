// src/app/owners/page.tsx
export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";

type Owner = {
  id: string;
  display_name: string;
  photo_url?: string | null;
  bio?: string | null;
};

export default async function OwnersPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, anon);

  const { data, error } = await supabase
    .from("owners")
    .select("id, display_name, photo_url, bio")
    .order("display_name", { ascending: true });

  const owners: Owner[] =
    !error && Array.isArray(data) ? data : Array.from({ length: 12 }, (_, i) => ({
      id: String(i + 1),
      display_name: `Owner ${i + 1}`,
      photo_url: null,
      bio: "Add bio in Admin.",
    }));

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">League Owners</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {owners.map((o) => (
          <div key={o.id} className="border rounded p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={o.photo_url || "/owners/placeholder.webp"}
              alt={o.display_name}
              className="w-full h-48 object-cover rounded mb-3"
            />
            <div className="font-semibold">{o.display_name}</div>
            <p className="text-sm text-gray-700">{o.bio || "—"}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
