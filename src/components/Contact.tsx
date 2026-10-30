import { useState } from "react";
import { contact } from "../content";
import { useReveal } from "../lib/useReveal";
import { Button } from "./Button";

type Status = "idle" | "sending" | "sent" | "mailto" | "error";
type Errors = Partial<Record<"name" | "email", string>>;

const ENDPOINT = import.meta.env.PUBLIC_FORM_ENDPOINT as string | undefined;
const interests = ["Newspaper", "Billboards", "Television", "Radio", "Social media", "Transit"];

function Field({ id, label, type = "text", error, textarea, autoComplete }: { id: string; label: string; type?: string; error?: string; textarea?: boolean; autoComplete?: string }) {
  const common = {
    id,
    name: id,
    placeholder: " ",
    autoComplete,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
    className: "peer block w-full resize-none border-0 bg-transparent px-0 pb-3 pt-7 text-lg text-paper outline-none placeholder:text-transparent",
  };
  return (
    <div className="relative">
      {textarea ? <textarea rows={3} {...common} /> : <input type={type} {...common} />}
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-0 top-7 origin-left text-lg text-paper/55 transition-transform duration-500 ease-[var(--ease-out-expo)] peer-focus:-translate-y-6 peer-focus:scale-[0.78] peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-[0.78]"
      >
        {label}
      </label>
      <span className={`block h-px w-full ${error ? "bg-red" : "bg-paper/20"}`} />
      <span className="absolute bottom-0 left-0 block h-px w-full origin-left scale-x-0 bg-red transition-transform duration-700 ease-[var(--ease-out-expo)] peer-focus:scale-x-100" />
      {error && (
        <p id={`${id}-error`} className="absolute -bottom-6 left-0 text-sm text-[#ff7a7a]">
          {error}
        </p>
      )}
    </div>
  );
}

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [picked, setPicked] = useState<string[]>([]);
  const head = useReveal<HTMLDivElement>();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const next: Errors = {};
    if (!data.name?.trim()) next.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(data.email ?? "")) next.email = "Enter an email like name@company.com.";
    setErrors(next);
    if (Object.keys(next).length) {
      form.querySelector<HTMLElement>("[aria-invalid]")?.focus();
      return;
    }
    const payload: Record<string, string> = { ...data, channels: picked.join(", ") };
    if (!ENDPOINT) {
      const body = `Name: ${payload.name}\nEmail: ${payload.email}\nChannels: ${payload.channels || "-"}\n\n${payload.message ?? ""}`;
      location.href = `mailto:${contact.email}?subject=${encodeURIComponent("New campaign enquiry")}&body=${encodeURIComponent(body)}`;
      setStatus("mailto");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="relative z-10 -mb-10 rounded-t-[36px] bg-night pb-36 pt-24 text-paper md:rounded-t-[56px] md:pb-44 md:pt-32" aria-labelledby="contact-title">
      <div ref={head} className="wrap grid gap-16 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-6">
          <h2 id="contact-title" className="display text-[clamp(3rem,7vw,7rem)] font-[900] leading-[0.86] tracking-[-0.04em]">
            <span className="reveal-mask"><span>Shoot your</span></span>
            <span className="reveal-mask"><span style={{ "--d": "80ms" } as React.CSSProperties}>campaigns into</span></span>
            <span className="reveal-mask"><span style={{ "--d": "160ms" } as React.CSSProperties}>a <span className="ital font-normal">new era</span><span className="text-red">.</span></span></span>
          </h2>
          <p className="reveal mt-8 max-w-[26rem] text-lg text-paper/70" style={{ "--d": "220ms" } as React.CSSProperties}>
            Let us craft your story. Get in touch with our brand consultant today.
          </p>
          <dl className="reveal mt-12 grid max-w-[30rem] gap-px overflow-hidden rounded-[20px] bg-paper/10 sm:grid-cols-2" style={{ "--d": "300ms" } as React.CSSProperties}>
            {[
              { k: "Call", v: contact.phone, href: contact.phoneHref },
              { k: "Email", v: contact.email, href: `mailto:${contact.email}` },
              { k: "Head office", v: "Kolkata" },
              { k: "Now open", v: "Bengaluru" },
            ].map((x) => (
              <div key={x.k} className="bg-night p-5">
                <dt className="text-[0.8125rem] text-paper/55">{x.k}</dt>
                <dd className="mt-1 text-[1.0625rem]">{x.href ? <a href={x.href} className="link">{x.v}</a> : x.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="md:col-span-5 md:col-start-8">
          {status === "sent" ? (
            <div className="rounded-[28px] bg-night-2 p-10" role="status">
              <p className="display text-h3 font-[800]">
                Thank you<span className="text-red">.</span>
              </p>
              <p className="mt-3 text-lg text-paper/70">Your message is with our team. We’ll be in touch.</p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="reveal rounded-[28px] bg-night-2 p-7 md:p-10" style={{ "--d": "200ms" } as React.CSSProperties}>
              <fieldset>
                <legend className="text-[0.875rem] text-paper/60">What are you planning?</legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {interests.map((t) => {
                    const on = picked.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setPicked((p) => (on ? p.filter((x) => x !== t) : [...p, t]))}
                        className={`inline-flex h-9 items-center gap-2 rounded-full border px-4 text-[0.875rem] transition-[background-color,border-color,color] duration-300 ${
                          on ? "border-red bg-red text-white" : "border-paper/20 text-paper/80 hover:border-paper/50"
                        }`}
                      >
                        <span className={`size-1.5 rounded-full transition-colors ${on ? "bg-white" : "bg-paper/40"}`} />
                        {t}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <div className="mt-8 space-y-8">
                <Field id="name" label="Your name" error={errors.name} autoComplete="name" />
                <Field id="email" label="Your email" type="email" error={errors.email} autoComplete="email" />
                <Field id="message" label="Tell us about the campaign (optional)" textarea />
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Button type="submit" tone="red" size="lg" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Send enquiry"}
                </Button>
                <p className="text-[0.875rem] text-paper/60" role="status">
                  {status === "mailto" && "Your email app should open with these details."}
                  {status === "error" && <span className="text-[#ff7a7a]">That didn’t go through. Please try again, or email us.</span>}
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
