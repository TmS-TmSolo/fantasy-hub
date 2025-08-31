// src/components/Section.tsx
export default function Section({title, children, id}:{title:string; children:React.ReactNode; id?:string}) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="text-2xl font-display mb-4">{title}</h2>
      {children}
    </section>
  );
}
