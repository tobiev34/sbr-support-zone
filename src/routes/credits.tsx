import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/TicketForm";
import { team } from "@/lib/content";

export const Route = createFileRoute("/credits")({
  head: () => ({
    meta: [
      { title: "Credits — Who Built SBR Studio" },
      { name: "description", content: "Meet the people who created SBR Studio." },
      { property: "og:title", content: "Credits — Who Built SBR Studio" },
      { property: "og:description", content: "The creators behind SBR Studio." },
    ],
  }),
  component: CreditsPage,
});

function CreditsPage() {
  return (
    <main className="relative mx-auto max-w-6xl px-6 pt-16 pb-28">
      <PageIntro eyebrow="Credits" title="Who built SBR">
        The people who created SBR Studio and the game you play.
      </PageIntro>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {team.map((m, i) => (
          <div key={i} className="rounded-2xl border border-edge bg-panel p-5 brick">

            <div className="font-display text-base font-bold tracking-tight">{m.name}</div>
            <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.05em] text-volt">{m.role}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
