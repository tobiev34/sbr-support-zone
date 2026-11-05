import { createFileRoute } from "@tanstack/react-router";

// Discord calls this URL when staff click Accept / Decline on a ticket message.
// Every request is verified with the app's Ed25519 public key before anything happens.

function hexToBytes(hex: string) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

async function verify(request: Request, body: string, publicKey: string) {
  const sig = request.headers.get("X-Signature-Ed25519");
  const ts = request.headers.get("X-Signature-Timestamp");
  if (!sig || !ts || !/^[0-9a-f]+$/i.test(sig)) return false;
  try {
    const key = await crypto.subtle.importKey("raw", hexToBytes(publicKey), { name: "Ed25519" }, false, [
      "verify",
    ]);
    return await crypto.subtle.verify("Ed25519", key, hexToBytes(sig), new TextEncoder().encode(ts + body));
  } catch (e) {
    console.error("Signature check error", e);
    return false;
  }
}

type Embed = { title?: string; color?: number; fields?: { name: string; value: string; inline?: boolean }[] };

export const Route = createFileRoute("/api/public/discord-interactions")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const publicKey = process.env["DISCORD_PUBLIC_KEY"];
        if (!publicKey) return new Response("Not configured", { status: 500 });
        const body = await request.text();
        if (!(await verify(request, body, publicKey))) {
          return new Response("Invalid signature", { status: 401 });
        }
        const interaction = JSON.parse(body) as {
          type: number;
          data?: { custom_id?: string };
          member?: { user?: { id: string } };
          user?: { id: string };
          message?: { embeds?: Embed[] };
        };

        // Discord's "are you there?" check.
        if (interaction.type === 1) return Response.json({ type: 1 });

        if (interaction.type === 3) {
          const action = interaction.data?.custom_id;
          if (action !== "ticket:accept" && action !== "ticket:decline") {
            return Response.json({ type: 6 });
          }
          const accepted = action === "ticket:accept";
          const userId = interaction.member?.user?.id ?? interaction.user?.id ?? "";
          const status = `${accepted ? "✅ Accepted" : "❌ Declined"} by <@${userId}> · <t:${Math.floor(Date.now() / 1000)}:R>`;

          const embeds = (interaction.message?.embeds ?? []).map((e, i) => {
            if (i !== 0) return e;
            const fields = (e.fields ?? []).filter((f) => f.name !== "Status");
            return {
              ...e,
              title: (e.title ?? "").replace(/^(New|Accepted|Declined) /, accepted ? "Accepted " : "Declined "),
              color: accepted ? 0x3ba55d : 0xed4245,
              fields: [...fields, { name: "Status", value: status, inline: false }],
            };
          });

          // Update the message in place and remove the buttons.
          return Response.json({
            type: 7,
            data: { embeds, components: [], allowed_mentions: { parse: [] } },
          });
        }

        return new Response("Unsupported", { status: 400 });
      },
    },
  },
});
