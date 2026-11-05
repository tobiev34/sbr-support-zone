import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/TicketForm";
import { updates } from "@/lib/content";

export const Route = createFileRoute("/updates")({
  head: () => ({
    meta: [
      { title: "Game Updates — SBR Studio" },
      { name: "description", content: "Patch notes and the latest changes to SBR." },
      { property: "og:title", content: "Game Updates — SBR Studio" },
      { property: "og:description", content: "Read the latest SBR patch notes." },
    ],
  }),
  component: UpdatesPage,
});

function UpdatesPage() {
  return (
    <main className="relative mx-auto max-w-4xl px-6 pt-16 pb-28">
      <PageIntro eyebrow="Game updates" title="Patch notes">
        Everything that changed in SBR, newest first.
      </PageIntro>
      <div className="mt-10 grid gap-4">
        {updates.map((u) => (
          <article key={u.version} className="rounded-2xl border border-edge bg-panel p-6 brick">
            {u.image && (
              <img src={u.image} alt={u.title} width={1024} height={576} className="mb-5 w-full rounded-lg border-[3px] border-edge" />
            )}
            <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-dim">
              <span className="text-volt">{u.version}</span> · {u.date}
            </div>
            <h2 className="mt-2 font-display text-xl font-bold tracking-tight">{u.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-dim">{u.body}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
