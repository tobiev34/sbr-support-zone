import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, TicketForm } from "@/components/TicketForm";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Hacker Report — SBR Studio" },
      { name: "description", content: "Report a hacker or exploiter in SBR. Reports are confidential." },
      { property: "og:title", content: "Hacker Report — SBR Studio" },
      { property: "og:description", content: "Report hackers and exploiters in SBR." },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  return (
    <main className="relative mx-auto grid max-w-6xl gap-10 px-6 pt-16 pb-28 lg:grid-cols-[0.8fr_1.2fr]">
      <PageIntro eyebrow="03 · Report" title="Hacker report" accent="coral">
        Name the hacker and add the match ID. Reports stay confidential.
      </PageIntro>
      <TicketForm
        accent="coral"
        submitLabel="File report"
        successMessage="Report filed — it will be reviewed privately."
        fields={[
          { name: "username", label: "Your username", placeholder: "Your in-game name" },
          { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
          { name: "target", label: "Who are you reporting?", type: "select", options: ["Player", "Staff"] },
          { name: "targetName", label: "Their username", placeholder: "Name of the person" },
          { name: "reason", label: "Reason", type: "select", options: ["Aimbot", "Speed / fly hack", "Exploiting / glitching", "Other cheat"] },
          { name: "matchId", label: "Match ID", placeholder: "Optional", required: false },
          { name: "details", label: "What happened?", type: "textarea", placeholder: "Describe the situation…" },
        ]}
      />
    </main>
  );
}
