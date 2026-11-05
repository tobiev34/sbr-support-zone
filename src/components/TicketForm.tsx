import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { sendTicket } from "@/lib/tickets.functions";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
  required?: boolean;
};

type Accent = "volt" | "plasma" | "coral";

const accentText: Record<Accent, string> = {
  volt: "text-volt",
  plasma: "text-plasma",
  coral: "text-coral",
};

const accentBtn: Record<Accent, string> = {
  volt: "bg-volt",
  plasma: "bg-plasma",
  coral: "bg-coral",
};

const inputCls =
  "w-full rounded-xl border-[3px] border-edge bg-background px-4 py-3 text-sm text-foreground placeholder:text-dim/70 outline-none transition-colors focus:border-volt/60";

export function PageIntro({
  eyebrow,
  title,
  children,
  accent = "volt",
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  accent?: Accent;
}) {
  return (
    <div className="animate-rise">
      <div className={`font-mono text-[11px] uppercase tracking-[0.08em] ${accentText[accent]}`}>
        {eyebrow}
      </div>
      <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-balance md:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-[52ch] text-pretty leading-relaxed text-dim">{children}</p>
    </div>
  );
}

export function TicketForm({
  fields,
  submitLabel,
  successMessage,
  accent = "volt",
}: {
  fields: Field[];
  submitLabel: string;
  successMessage: string;
  accent?: Accent;
}) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const send = useServerFn(sendTicket);
  const [files, setFiles] = useState<{ file: File; url: string }[]>([]);
  const [drag, setDrag] = useState(false);
  const totalSize = files.reduce((s, p) => s + p.file.size, 0);
  const tooBig = files.length > 5 || totalSize > 10 * 1024 * 1024;

  function addFiles(list: FileList) {
    const picked = Array.from(list).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
    );
    setFiles((prev) => [...prev, ...picked.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
  }

  function removeFile(i: number) {
    setFiles((prev) => {
      const p = prev[i];
      if (p) URL.revokeObjectURL(p.url);
      return prev.filter((_, j) => j !== i);
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const kind = accent === "coral" ? "Report" : accent === "plasma" ? "Support" : "Ban appeal";
    const proof = files.map((p) => p.file);
    if (tooBig) {
      toast.error("Proof is too big: max 5 files and 10 MB in total.");
      return;
    }
    const body = new FormData();
    body.append("kind", kind);
    body.append(
      "fields",
      JSON.stringify(fields.map((f) => ({ label: f.label, value: String(fd.get(f.name) ?? "") }))),
    );
    proof.forEach((f) => body.append("proof", f));
    setBusy(true);
    try {
      const res = await send({ data: body });
      if (!res.ok) throw new Error();
      setSent(true);
      toast.success(successMessage);
      form.reset();
      files.forEach((p) => URL.revokeObjectURL(p.url));
      setFiles([]);
    } catch {
      toast.error("Could not send right now. Please try again later.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-edge bg-panel p-6 brick md:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((f) => (
          <label
            key={f.name}
            className={`block ${f.type === "textarea" ? "sm:col-span-2" : ""}`}
          >
            <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.06em] text-dim">
              {f.label}
              {f.required !== false && <span className={accentText[accent]}> *</span>}
            </span>
            {f.type === "textarea" ? (
              <textarea
                name={f.name}
                rows={5}
                required={f.required !== false}
                placeholder={f.placeholder}
                className={inputCls}
              />
            ) : f.type === "select" ? (
              <select
                name={f.name}
                required={f.required !== false}
                defaultValue=""
                className={inputCls}
              >
                <option value="" disabled>
                  Choose…
                </option>
                {f.options?.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                name={f.name}
                type={f.type ?? "text"}
                required={f.required !== false}
                placeholder={f.placeholder}
                className={inputCls}
              />
            )}
          </label>
        ))}
        <div className="sm:col-span-2">
          <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.06em] text-dim">
            Proof (pictures or videos)
          </span>
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-[3px] border-dashed px-4 py-8 text-center transition-colors ${drag ? "border-foreground bg-panel" : "border-edge bg-background hover:border-dim"}`}
          >
            <span className="font-display text-lg uppercase">Drop photos or videos here</span>
            <span className="text-sm text-dim">or click to choose · up to 5 files, 10 MB total</span>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="sr-only"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
          {files.length > 0 && (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {files.map((p, i) => (
                  <div
                    key={p.url}
                    className="relative overflow-hidden rounded-xl border-[3px] border-edge bg-background"
                  >
                    {p.file.type.startsWith("video/") ? (
                      <video src={p.url} className="aspect-square w-full object-cover" muted />
                    ) : (
                      <img src={p.url} alt={p.file.name} className="aspect-square w-full object-cover" />
                    )}
                    <button
                      type="button"
                      aria-label={`Remove ${p.file.name}`}
                      onClick={() => removeFile(i)}
                      className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-lg border-2 border-edge bg-panel text-sm font-bold text-foreground"
                    >
                      ✕
                    </button>
                    <div className="truncate px-2 py-1 text-[11px] text-dim">
                      {p.file.name} · {(p.file.size / 1024 / 1024).toFixed(1)} MB
                    </div>
                  </div>
                ))}
              </div>
              <div className={`mt-2 text-xs ${tooBig ? "text-destructive" : "text-dim"}`}>
                {files.length}/5 files · {(totalSize / 1024 / 1024).toFixed(1)} / 10 MB
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <span className="font-mono text-[11px] text-dim">
          {sent ? "✓ Received — we'll reply by email" : "avg. reply · 2h 14m"}
        </span>
        <button
          type="submit"
          disabled={busy}
          className={`brick-btn rounded-xl px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 ${accentBtn[accent]}`}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
