import { useId, useState } from "react";
import { contact, faqs } from "../content";
import { FaqScene } from "./FaqScene";
import { useReveal } from "../lib/useReveal";

function Item({ q, a, open, onToggle, i }: { q: string; a: string[]; open: boolean; onToggle: () => void; i: number }) {
  const id = useId();
  return (
    <li className={`reveal overflow-hidden rounded-[20px] border transition-colors duration-500 ${open ? "border-ink bg-paper-3" : "border-line bg-transparent hover:border-ink/30"}`} style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
          className="group flex w-full items-center justify-between gap-6 px-6 py-5 text-left md:px-7 md:py-6"
        >
          <span className="display text-[clamp(1.15rem,1.7vw,1.5rem)] font-[700] tracking-[-0.01em]">{q}</span>
          <span className={`grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-500 ${open ? "bg-red text-white" : "bg-paper-2 text-ink group-hover:bg-ink group-hover:text-paper"}`}>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
              <path d="M0 7h14" stroke="currentColor" strokeWidth="1.6" />
              <path d="M7 0v14" stroke="currentColor" strokeWidth="1.6" className="origin-center transition-transform duration-500 ease-[var(--ease-out-expo)]" style={{ transform: open ? "rotate(90deg) scaleY(0)" : "none" }} />
            </svg>
          </span>
        </button>
      </h3>
      <div
        id={id}
        inert={!open}
        className="grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-expo)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
      >
        <div className="overflow-hidden">
          <div className="max-w-[40rem] space-y-3 px-6 pb-7 text-[1.0625rem] leading-relaxed text-ink-2 md:px-7">
            {a.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const [pulse, setPulse] = useState(0);
  const head = useReveal<HTMLDivElement>();
  const list = useReveal<HTMLUListElement>();
  return (
    <section id="faq" className="border-t border-line py-28 md:py-40" aria-labelledby="faq-title">
      <div className="wrap grid gap-14 md:grid-cols-12 md:gap-8">
        <div ref={head} className="md:col-span-5">
          <div className="md:sticky md:top-32">
            <h2 id="faq-title" className="reveal display text-h2 font-[800]">
              Still not convinced? <span className="ital font-normal">We’ve got the answers.</span>
            </h2>
            <p className="reveal mt-6 text-lg text-ink-2" style={{ "--d": "80ms" } as React.CSSProperties}>
              Have more questions? Mail us at{" "}
              <a href={`mailto:${contact.email}`} className="link text-ink">{contact.email}</a>
            </p>
            <FaqScene pulse={pulse} />
          </div>
        </div>
        <div className="relative md:col-span-7">
          <ul ref={list} className="space-y-3">
            {faqs.map((f, i) => (
              <Item key={f.q} i={i} q={f.q} a={f.a} open={open === i} onToggle={() => {
                  if (open !== i) setPulse((n) => n + 1);
                  setOpen(open === i ? null : i);
                }}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
