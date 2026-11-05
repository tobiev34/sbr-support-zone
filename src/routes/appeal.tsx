import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, TicketForm } from "@/components/TicketForm";

export const Route = createFileRoute("/appeal")({
  head: () => ({
    meta: [
      { title: "Appeal a Ban — SBR Studio" },
      { name: "description", content: "Think your ban was unfair? Submit an appeal after your match and a moderator will review it." },
      { property: "og:title", content: "Appeal a Ban — SBR Studio" },
      { property: "og:description", content: "Submit a ban appeal and get a human review from the SBR team." },
    ],
  }),
  component: AppealPage,
});

function AppealPage() {
  return (
    <main className="relative mx-auto grid max-w-6xl gap-10 px-6 pt-16 pb-28 lg:grid-cols-[0.8fr_1.2fr]">
      <PageIntro eyebrow="01 · Ban appeal" title="Appeal your ban">
        Once your game has finished, tell us what happened. A moderator reviews the match replay and
        replies by email.
      </PageIntro>
      <TicketForm
        submitLabel="Submit appeal"
        successMessage="Appeal submitted — a moderator will review it."
        fields={[
          { name: "username", label: "Username", placeholder: "Your in-game name" },
          { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
          { name: "banType", label: "Ban type", type: "select", options: ["Temporary", "Permanent", "Chat ban", "Not sure"] },
          { name: "matchId", label: "Match ID", placeholder: "Optional", required: false },
          { name: "reason", label: "Why should we lift the ban?", type: "textarea", placeholder: "Explain what happened…" },
        ]}
      />
    </main>
  );
}
