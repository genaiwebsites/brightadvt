import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { services } from "../content";
import { useReveal } from "../lib/useReveal";
import { Button } from "./Button";
import { serviceArt } from "./ServiceArt";
import { IconBillboard, IconNewspaper, IconRadio, IconSocial, IconTransit, IconTv } from "./Icons";

const icons = {
  newspaper: IconNewspaper,
  billboards: IconBillboard,
  tv: IconTv,
  radio: IconRadio,
  social: IconSocial,
  transit: IconTransit,
};
const ease = [0.16, 1, 0.3, 1] as const;
const cta = {
  newspaper: "Plan a newspaper campaign",
  billboards: "Book a billboard",
  tv: "Plan a TV campaign",
  radio: "Plan a radio campaign",
  social: "Plan a social campaign",
  transit: "Plan a transit campaign",
};

function Row({ s, i, open, onToggle }: { s: (typeof services)[number]; i: number; open: boolean; onToggle: () => void }) {
  const Icon = icons[s.id];
  const Art = serviceArt[s.id];
  const panel = useId();
  return (
    <li className="reveal border-b border-line" style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panel}
          onClick={onToggle}
          className="group relative isolate grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-2 py-6 text-left transition-colors duration-500 hover:text-paper md:grid-cols-[auto_minmax(0,1.1fr)_minmax(0,1fr)_auto] md:gap-x-8 md:px-4 md:py-8"
        >
          {/* Ink rises from the bottom of the row on hover. */}
          <span
            aria-hidden
            className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-ink transition-transform duration-[650ms] ease-[var(--ease-out-expo)] group-hover:scale-y-100"
          />
          <span
            className={`grid size-12 place-items-center rounded-full transition-colors duration-500 md:size-14 ${
              open ? "bg-red text-white" : "bg-paper-2 text-ink group-hover:bg-red group-hover:text-white"
            }`}
          >
            <Icon className="size-6 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-rotate-6 group-hover:scale-110 md:size-7" />
          </span>
          <span className="display text-[clamp(1.75rem,4.2vw,3.75rem)] font-[800] leading-none tracking-[-0.03em]">
            <span className={`inline-block transition-transform duration-700 ease-[var(--ease-out-expo)] ${open ? "" : "md:group-hover:translate-x-3"}`}>
              {s.name}
            </span>
          </span>
          <span className={`col-span-3 text-[0.98rem] leading-snug transition-opacity duration-500 md:col-span-1 md:max-w-[26rem] ${open ? "text-ink" : "text-ink-2"} transition-colors group-hover:text-paper/75`}>
            {s.proof}
          </span>
          <span
            aria-hidden
            className={`row-start-1 col-start-3 grid size-11 place-items-center rounded-full border transition-[background-color,border-color,color] duration-500 md:col-start-4 ${
              open ? "border-ink bg-ink text-paper group-hover:border-paper group-hover:bg-paper group-hover:text-ink" : "border-line group-hover:border-paper group-hover:bg-paper group-hover:text-ink"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path d="M0 7h14" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M7 0v14"
                stroke="currentColor"
                strokeWidth="1.6"
                className="origin-center transition-transform duration-500 ease-[var(--ease-out-expo)]"
                style={{ transform: open ? "rotate(90deg) scaleY(0)" : "none" }}
              />
            </svg>
          </span>
        </button>
      </h3>

      <div
        id={panel}
        inert={!open}
        className="grid transition-[grid-template-rows] duration-700 ease-[var(--ease-out-expo)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                className="grid gap-10 pb-10 md:grid-cols-12 md:gap-8 md:pb-14"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.15, ease } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                <div className="flex flex-col justify-between gap-8 md:col-span-5 md:pl-[6.5rem] md:pr-6">
                  <div>
                    <p className="text-[clamp(1.125rem,1.5vw,1.375rem)] leading-snug">{s.lead}</p>
                    <ul className="mt-7 border-t border-line">
                      {s.points.map((pt, k) => (
                        <motion.li
                          key={pt}
                          className="flex items-start gap-3 border-b border-line py-3.5 text-[0.95rem] text-ink-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0, transition: { delay: 0.3 + k * 0.08, duration: 0.6, ease } }}
                        >
                          <span className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-red" aria-hidden />
                          {pt}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Button href="#contact">{cta[s.id]}</Button>
                  </div>
                </div>
                <div className="md:col-span-7">
                  <div className="relative aspect-[8/5] overflow-hidden rounded-[18px] bg-paper-3 bg-[radial-gradient(rgb(18_17_16/0.07)_0.9px,transparent_1px)] [background-size:18px_18px]">
                    <Art />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </li>
  );
}

export function Services() {
  const head = useReveal<HTMLDivElement>();
  const list = useReveal<HTMLUListElement>();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="services" className="border-t border-line py-28 md:py-40" aria-labelledby="services-title">
      <div className="wrap">
        <div ref={head} className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 id="services-title" className="reveal display text-h2 font-[800] md:col-span-7">
            Every channel. <span className="font-[500]">One roof</span>.
          </h2>
          <p className="reveal text-lg text-ink-2 md:col-span-4 md:col-start-9" style={{ "--d": "80ms" } as React.CSSProperties}>
            We are a full-suite marketing company. From television ads to newspaper ads to billboards to social media
            campaigns, we do it all.
          </p>
        </div>

        <ul ref={list} className="mt-14 border-t border-line md:mt-20">
          {services.map((s, i) => (
            <Row key={s.id} s={s} i={i} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
        </ul>
      </div>
    </section>
  );
}
