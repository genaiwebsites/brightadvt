import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { voices } from "../content";
import { asset } from "../lib/media";
import { useReveal } from "../lib/useReveal";

const ease = [0.16, 1, 0.3, 1] as const;

export function Voices() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const ref = useReveal<HTMLDivElement>();
  const go = (d: number) => {
    setDir(d);
    setI((n) => (n + d + voices.length) % voices.length);
  };
  const v = voices[i];

  return (
    <section id="voices" className="py-28 md:py-40" aria-labelledby="voices-title">
      <div ref={ref} className="wrap grid gap-14 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-4">
          <h2 id="voices-title" className="reveal text-[0.95rem] font-medium text-ink-2">
            Real reviews. Don’t take our word for it.
          </h2>
          <p className="reveal display mt-8 text-[clamp(7rem,15vw,14rem)] font-[900] leading-[0.8] tracking-[-0.06em]" style={{ "--d": "80ms" } as React.CSSProperties}>
            35<span className="text-red">+</span>
          </p>
          <p className="reveal mt-5 max-w-[18rem] text-lg leading-snug" style={{ "--d": "140ms" } as React.CSSProperties}>
            <span className="ital">years</span> that Sobisco Biscuits has worked with Bright, and counting.
          </p>
        </div>

        <figure className="reveal relative flex min-h-[420px] flex-col justify-between rounded-[28px] bg-ink p-8 text-paper md:col-span-8 md:p-14" style={{ "--d": "120ms" } as React.CSSProperties}>
          <svg viewBox="0 0 48 36" className="h-9 w-12 text-red" aria-hidden>
            <path d="M0 36V20C0 8 6 1 18 0v7c-6 1-9 5-9 11h9v18zm30 0V20C30 8 36 1 48 0v7c-6 1-9 5-9 11h9v18z" fill="currentColor" />
          </svg>
          <div className="relative mt-8 flex-1 overflow-hidden" aria-live="polite">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.blockquote
                key={i}
                custom={dir}
                initial={{ opacity: 0, y: 30 * dir, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -30 * dir, filter: "blur(6px)" }}
                transition={{ duration: 0.7, ease }}
              >
                <p className="display text-[clamp(1.6rem,3vw,2.75rem)] font-[500] leading-[1.12] tracking-[-0.02em]">
                  {v.quote}
                </p>
              </motion.blockquote>
            </AnimatePresence>
          </div>
          <figcaption className="mt-10 flex flex-wrap items-center justify-between gap-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={i}
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.5, ease }}
              >
                <img src={asset(v.src)} alt="" loading="lazy" width={v.w} height={v.h} className="size-14 rounded-full object-cover object-[25%_35%]" />
                <span className="text-[0.95rem] leading-snug">
                  <span className="block font-medium">{v.name}</span>
                  <span className="block text-paper/60">{v.role}</span>
                </span>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center gap-3">
              <span className="mr-2 text-[0.8125rem] tabular-nums text-paper/60">
                {String(i + 1).padStart(2, "0")} / {String(voices.length).padStart(2, "0")}
              </span>
              {[-1, 1].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => go(d)}
                  aria-label={d < 0 ? "Previous review" : "Next review"}
                  className="group grid size-12 place-items-center rounded-full border border-paper/25 transition-colors duration-500 hover:border-red hover:bg-red"
                >
                  <svg viewBox="0 0 16 16" className={`size-4 transition-transform duration-500 ${d < 0 ? "rotate-180 group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"}`} fill="none" aria-hidden>
                    <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </button>
              ))}
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
