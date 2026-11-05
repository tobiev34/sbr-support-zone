import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, TicketForm } from "@/components/TicketForm";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Contact Support — SBR Studio" },
      { name: "description", content: "Billing, account, or bug problems? Open a ticket with SBR support." },
      { property: "og:title", content: "Contact Support — SBR Studio" },
      { property: "og:description", content: "Reach a real SBR support agent." },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  return (
    <main className="relative mx-auto grid max-w-6xl gap-10 px-6 pt-16 pb-28 lg:grid-cols-[0.8fr_1.2fr]">
      <PageIntro eyebrow="02 · Contact support" title="Talk to SBR support" accent="plasma">
        Billing, account recovery, or a bug that won't quit — reach a real SBR agent.
      </PageIntro>
      <TicketForm
        accent="plasma"
        submitLabel="Send ticket"
        successMessage="Ticket sent — support will reply soon."
        fields={[
          { name: "username", label: "Username", placeholder: "Your in-game name" },
          { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
          { name: "topic", label: "Topic", type: "select", options: ["Account", "Billing", "Bug", "Other"] },
          { name: "subject", label: "Subject", placeholder: "Short summary" },
          { name: "message", label: "Message", type: "textarea", placeholder: "How can we help?" },
        ]}
      />
    </main>
  );
}
