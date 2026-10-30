import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { work, type Work as WorkItem } from "../content";
import { asset } from "../lib/media";
import { pauseScroll, resumeScroll } from "../lib/smooth";
import { useReveal } from "../lib/useReveal";
import { Halftone } from "./Halftone";
import { Button } from "./Button";
import { IconArrow, IconBillboard, IconNewspaper, IconSocial, IconTransit } from "./Icons";

const ease = [0.16, 1, 0.3, 1] as const;
const byId = Object.fromEntries(work.map((w) => [w.id, w]));

// Two justified rows: every image in a row shares one height and the row
// runs flush edge to edge. Flex-grow by aspect ratio does the arithmetic.
const rows = [["sbi", "keventer", "lic"], ["itc", "rollick", "next"]];

const mediumIcon: Record<string, typeof IconArrow> = {
  "Print campaign": IconNewspaper,
  "Digital billboard": IconBillboard,
  "Train and metro": IconTransit,
  "Social media": IconSocial,
};

function Piece({ w, n, onOpen }: { w: WorkItem; n: number; onOpen: (w: WorkItem, el: HTMLButtonElement) => void }) {
  const ref = useReveal<HTMLElement>("0px 0px -8% 0px");
  const Icon = mediumIcon[w.medium] ?? IconArrow;
  return (
    <figure ref={ref} className="reveal min-w-0 md:[flex:var(--grow)_1_0%]" style={{ "--grow": w.w / w.h, "--d": `${(n % 3) * 90}ms` } as React.CSSProperties}>
      <button
        type="button"
        data-cursor="View"
        onClick={(e) => onOpen(w, e.currentTarget)}
        aria-label={`View ${w.client}, ${w.medium.toLowerCase()}`}
        className="group block w-full text-left"
      >
        <motion.div layoutId={`work-${w.id}`} transition={{ duration: 0.8, ease }} className="overflow-hidden" style={{ aspectRatio: `${w.w} / ${w.h}` }}>
          <Halftone
            src={asset(w.src)}
            alt={w.alt}
            width={w.w}
            height={w.h}
            className="size-full !bg-transparent"
            imgClassName="size-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
          />
        </motion.div>
        <figcaption className="mt-4 flex items-start justify-between gap-4 border-t border-line pt-3">
          <span className="min-w-0">
            <span className="flex items-baseline gap-2.5">
              <span className="text-[0.75rem] tabular-nums text-ink-3">{String(n + 1).padStart(2, "0")}</span>
              <span className="display truncate text-[1.125rem] font-[700] tracking-[-0.01em] md:text-[1.25rem]">{w.client}</span>
            </span>
            <span className="mt-1 flex items-center gap-1.5 text-[0.8125rem] text-ink-2">
              <Icon className="size-3.5" />
              {w.medium}
            </span>
          </span>
          <IconArrow className="mt-1 size-4 shrink-0 -translate-x-1 translate-y-1 text-ink opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
        </figcaption>
      </button>
    </figure>
  );
}

function Next() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="reveal flex min-w-0 flex-col justify-between border-t-2 border-ink pt-5 max-md:mt-4 max-md:gap-10 md:[flex:1.05_1_0%]" style={{ "--d": "180ms" } as React.CSSProperties}>
      <p className="display text-[clamp(2rem,3vw,3rem)] font-[800] leading-[0.95] tracking-[-0.03em]">
        Your campaign,
        <br />
        <span className="font-normal">next</span>
        <span className="text-red">.</span>
      </p>
      <div>
        <p className="mb-5 max-w-[18rem] text-[0.9375rem] leading-relaxed text-ink-2">
          Print, outdoor, television, radio, social and transit, planned and bought by one team.
        </p>
        <Button href="#contact">Start a campaign</Button>
      </div>
    </div>
  );
}

export function Work() {
  const head = useReveal<HTMLDivElement>();
  const [open, setOpen] = useState<WorkItem | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    pauseScroll();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("keydown", onKey);
      resumeScroll();
      opener.current?.focus({ preventScroll: true });
    };
  }, [open]);

  const show = (w: WorkItem, el: HTMLButtonElement) => {
    opener.current = el;
    setOpen(w);
  };
  let n = 0;

  return (
    <section id="work" className="py-28 md:py-40" aria-labelledby="work-title">
      <div className="wrap">
        <div ref={head} className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 id="work-title" className="reveal display text-h2 font-[800] md:col-span-7">
            Our <span className="font-[500]">portfolio</span>.
          </h2>
          <p className="reveal max-w-[26rem] text-lg text-ink-2 md:col-span-4 md:col-start-9" style={{ "--d": "80ms" } as React.CSSProperties}>
            A showcase of impactful campaigns, from dynamic billboards to newspaper, social and transit.
          </p>
        </div>

        <div className="mt-14 space-y-12 md:mt-20 md:space-y-16">
          {rows.map((row, r) => (
            <div key={r} className="flex flex-col gap-12 md:flex-row md:gap-7">
              {row.map((id) => (id === "next" ? <Next key={id} /> : <Piece key={id} w={byId[id]} n={n++} onOpen={show} />))}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>{open && <Lightbox key={open.id} w={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </section>
  );
}

function Lightbox({ w, onClose }: { w: WorkItem; onClose: () => void }) {
  const closeBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => closeBtn.current?.focus({ preventScroll: true }), []);
  const landscape = w.w > w.h;
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4 md:p-10" role="dialog" aria-modal="true" aria-label={`${w.client}, ${w.medium}`}>
      <motion.div
        className="absolute inset-0 bg-paper/92 backdrop-blur-md"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease }}
      />
      <figure className="relative flex max-h-full flex-col items-center">
        <motion.div layoutId={`work-${w.id}`} transition={{ duration: 0.8, ease }} className="overflow-hidden shadow-[0_40px_90px_-30px_rgb(18_17_16/0.45)]">
          <img
            src={asset(w.src)}
            alt={w.alt}
            width={w.w}
            height={w.h}
            style={{ maxWidth: `min(90vw, ${Math.round(w.w * 1.5)}px)` }}
            className={`block h-auto ${landscape ? "w-[90vw]" : "max-h-[74svh] w-auto"}`}
          />
        </motion.div>
        <motion.figcaption
          className="mt-5 flex w-full items-baseline justify-between gap-6 text-[0.9375rem]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.35, duration: 0.6, ease } }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          <span>
            <span className="font-medium">{w.client}</span>
            <span className="text-ink-2"> · {w.medium}</span>
          </span>
          <button ref={closeBtn} type="button" onClick={onClose} className="group inline-flex items-center gap-2 font-medium">
            <span className="roll"><span>Close</span><span aria-hidden>Close</span></span>
            <span className="grid size-8 place-items-center rounded-full bg-ink text-paper" aria-hidden>
              <svg viewBox="0 0 12 12" className="size-3 transition-transform duration-500 group-hover:rotate-90"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" /></svg>
            </span>
          </button>
        </motion.figcaption>
      </figure>
    </div>
  );
}
