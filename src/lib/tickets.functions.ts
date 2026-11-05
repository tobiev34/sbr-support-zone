import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  kind: z.enum(["Report", "Ban appeal", "Support"]),
  fields: z
    .array(z.object({ label: z.string().max(100), value: z.string().max(1000) }))
    .max(20),
});

// Discord accepts ~10 MB per message for bots in normal servers.
export const MAX_PROOF_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 5;

const colors = { Report: 0xe5533d, "Ban appeal": 0xddf60e, Support: 0x06bfcb };

// Accept / Decline buttons. Clicks are handled by /api/public/discord-interactions.
const decisionButtons = [
  {
    type: 1,
    components: [
      { type: 2, style: 3, label: "Accept", emoji: { name: "✅" }, custom_id: "ticket:accept" },
      { type: 2, style: 4, label: "Decline", emoji: { name: "❌" }, custom_id: "ticket:decline" },
    ],
  },
];

function parseInput(d: unknown) {
  if (!(d instanceof FormData)) throw new Error("Expected form data");
  const parsed = schema.parse({
    kind: d.get("kind"),
    fields: JSON.parse(String(d.get("fields") ?? "[]")),
  });
  const files = d
    .getAll("proof")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"))
    .slice(0, MAX_FILES);
  const total = files.reduce((s, f) => s + f.size, 0);
  if (total > MAX_PROOF_BYTES) throw new Error("Files too large");
  return { ...parsed, files };
}

function multipart(payload: object, files: File[]) {
  const body = new FormData();
  body.append("payload_json", JSON.stringify(payload));
  files.forEach((f, i) => body.append(`files[${i}]`, f, (f.name || `proof-${i}`).replace(/[^\w.-]/g, "_")));
  return body;
}

export const sendTicket = createServerFn({ method: "POST" })
  .inputValidator(parseInput)
  .handler(async ({ data }) => {
    const embed = {
      title: `New ${data.kind}`,
      color: colors[data.kind],
      timestamp: new Date().toISOString(),
      fields: [
        ...data.fields
          .filter((f) => f.value.trim())
          .map((f) => ({ name: f.label, value: f.value.slice(0, 1000), inline: f.value.length < 40 })),
        ...(data.files.length
          ? [{ name: "Proof", value: `📎 ${data.files.length} file(s) attached below`, inline: false }]
          : []),
        { name: "Status", value: "⏳ Waiting for staff", inline: false },
      ],
    };
    // Show photos inside the card itself (Discord groups up to 4 embeds sharing a url into a gallery).
    const fileName = (f: File, i: number) => (f.name || `proof-${i}`).replace(/[^\w.-]/g, "_");
    const images = data.files
      .map((f, i) => ({ f, name: fileName(f, i) }))
      .filter(({ f }) => f.type.startsWith("image/"))
      .slice(0, 4);
    const galleryUrl = "https://sbr-player-support-hub.lovable.app";
    const firstImage = images[0];
    if (firstImage) {
      Object.assign(embed, { url: galleryUrl, image: { url: `attachment://${firstImage.name}` } });
    }
    const extraEmbeds = images.slice(1).map(({ name }) => ({ url: galleryUrl, image: { url: `attachment://${name}` } }));
    const allEmbeds = [embed, ...extraEmbeds];
    const firstValue = (data.fields.find((f) => f.value.trim())?.value ?? "new").slice(0, 60);
    const threadName = `${data.kind}: ${firstValue}`;

    const botToken = process.env["DISCORD_BOT_TOKEN"];
    const channelId = process.env["DISCORD_CHANNEL_ID"];

    if (botToken && channelId) {
      const auth = { Authorization: `Bot ${botToken}` };
      const chRes = await fetch(`https://discord.com/api/v10/channels/${channelId}`, { headers: auth });
      if (!chRes.ok) {
        console.error("Discord channel lookup failed", chRes.status, await chRes.text());
        return { ok: false, error: "Could not send" };
      }
      const channel = (await chRes.json()) as { type: number };
      const isForum = channel.type === 15 || channel.type === 16;
      const message = { allowed_mentions: { parse: [] }, embeds: allEmbeds, components: decisionButtons };
      const res = isForum
        ? await fetch(`https://discord.com/api/v10/channels/${channelId}/threads`, {
            method: "POST",
            headers: auth,
            body: multipart({ name: threadName, message }, data.files),
          })
        : await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
            method: "POST",
            headers: auth,
            body: multipart(message, data.files),
          });
      if (!res.ok) {
        console.error("Discord bot send failed", res.status, await res.text());
        return { ok: false, error: "Could not send" };
      }
      return { ok: true };
    }

    // Fallback: plain webhook (no buttons).
    const url = process.env["DISCORD_WEBHOOK_URL"];
    if (!url) return { ok: false, error: "Not configured yet" };
    const payload = { allowed_mentions: { parse: [] }, embeds: allEmbeds };
    const post = (p: object) => fetch(url, { method: "POST", body: multipart(p, data.files) });
    let res = await post(payload);
    if (res.status === 400) {
      const err = await res.text();
      if (err.includes("220001")) {
        res = await post({ ...payload, thread_name: threadName });
      } else {
        console.error("Discord webhook failed", res.status, err);
        return { ok: false, error: "Could not send" };
      }
    }
    if (!res.ok) {
      console.error("Discord webhook failed", res.status, await res.text());
      return { ok: false, error: "Could not send" };
    }
    return { ok: true };
  });
