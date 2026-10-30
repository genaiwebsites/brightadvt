import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { asset, finePointer } from "../lib/media";

type Group = "print" | "ooh" | "screen" | "transit";
type W = { w: string; g?: Group; after?: string };

const plain = (s: string): W[] => s.split(" ").map((w) => ({ w }));
const phrase = (s: string, g: Group, after?: string): W[] =>
  s.split(" ").map((w, i, a) => ({ w, g, after: i === a.length - 1 ? after : undefined }));

const words: W[] = [
  ...plain("For over 45 years, Bright has put brands where people look:"),
  ...phrase("on the front page", "print", ","),
  ...phrase("on the skyline", "ooh", ","),
  ...phrase("on screen", "screen"),
  { w: "and" },
  ...phrase("on the move", "transit", "."),
  ...plain("One team plans it, makes it and buys the space."),
];

const previews: Record<Group, { src: string; w: number; h: number; label: string; frame: "paper" | "photo" | "phone" }> = {
  print: { src: "img/work-sbi.webp", w: 418, h: 598, label: "Print · SBI Card", frame: "paper" },
  ooh: { src: "img/work-lic.webp", w: 770, h: 400, label: "Outdoor · LIC", frame: "photo" },
  screen: { src: "img/work-rollick.webp", w: 225, h: 225, label: "Social · Rollick", frame: "phone" },
  transit: { src: "img/work-itc.webp", w: 600, h: 400, label: "Transit · ITC", frame: "photo" },
};

function Word({ t, i, n, p }: { t: W; i: number; n: number; p: MotionValue<number> }) {
  const opacity = useTransform(p, [i / n, (i + 1.6) / n], [0.12, 1]);
  return <motion.span style={{ opacity }}>{t.w}</motion.span>;
}

/**
 * The statement reads as plain, full-width type that fills in as you scroll.
 * The four places it names are live: point at one and the work appears.
 */
export function Manifesto() {
  const box = useRef<HTMLDivElement>(null);
  const para = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: para, offset: ["start 85%", "end 50%"] });
  const [hover, setHover] = useState<{ g: Group; x: number; y: number } | null>(null);

  const enter = (g: Group, e: React.PointerEvent<HTMLSpanElement>) => {
    if (!finePointer() || !box.current) return;
    const b = box.current.getBoundingClientRect();
    const r = e.currentTarget.getBoundingClientRect();
    setHover({ g, x: r.left - b.left + r.width / 2, y: r.top - b.top });
  };

  // Group consecutive words of the same phrase so each phrase is one target.
  const out: React.ReactNode[] = [];
  for (let i = 0; i < words.length; ) {
    const g = words[i].g;
    if (!g) {
      out.push(<Word key={i} t={words[i]} i={i} n={words.length} p={scrollYProgress} />, " ");
      i++;
      continue;
    }
    const start = i;
    while (i < words.length && words[i].g === g) i++;
    const run = words.slice(start, i);
    const after = run[run.length - 1].after;
    out.push(
      <span
        key={start}
        onPointerEnter={(e) => enter(g, e)}
        onPointerLeave={() => setHover(null)}
        className={`ital cursor-default font-normal underline decoration-red/35 decoration-[0.045em] underline-offset-[0.16em] transition-[text-decoration-color,color] duration-300 ${
          hover?.g === g ? "text-red decoration-red" : ""
        }`}
      >
        {run.map((t, k) => (
          <span key={k}>
            <Word t={t} i={start + k} n={words.length} p={scrollYProgress} />
            {k < run.length - 1 ? " " : ""}
          </span>
        ))}
      </span>,
      after ? <Word key={`${start}-p`} t={{ w: after }} i={i - 1} n={words.length} p={scrollYProgress} /> : null,
      " "
    );
  }

  const pv = hover ? previews[hover.g] : null;
  const cardW = pv ? (pv.w > pv.h ? 280 : pv.frame === "phone" ? 170 : 180) : 0;

  return (
    <div ref={box} className="relative">
      <p
        ref={para}
        className="display text-[clamp(2.25rem,5.3vw,5.75rem)] font-[700] leading-[1.02] tracking-[-0.032em]"
      >
        <span className="sr-only">
          For over 45 years, Bright has put brands where people look: on the front page, on the skyline, on screen and on
          the move. One team plans it, makes it and buys the space.
        </span>
        <span aria-hidden>{out}</span>
      </p>

      <AnimatePresence>
        {hover && pv && (
          <div
            key={hover.g}
            aria-hidden
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full pb-3.5"
            style={{ left: hover.x, top: hover.y, width: cardW }}
          >
          <motion.figure
            className="origin-bottom"
            initial={{ opacity: 0, scale: 0.7, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 2 }}
            exit={{ opacity: 0, scale: 0.85, rotate: -3, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
          >
            <div
              className={`overflow-hidden shadow-[0_30px_60px_-24px_rgb(18_17_16/0.5)] ${
                pv.frame === "phone"
                  ? "rounded-[22px] border-[6px] border-ink bg-ink"
                  : pv.frame === "paper"
                    ? "rounded-[4px] bg-paper-3 p-2"
                    : "rounded-[14px]"
              }`}
            >
              <div className="relative">
                <img src={asset(pv.src)} alt="" className={`block h-auto w-full ${pv.frame === "phone" ? "rounded-[14px]" : ""}`} />
                <figcaption className="absolute bottom-2 left-2 rounded-full bg-ink/85 px-2.5 py-1 font-sans text-[0.6875rem] font-medium tracking-normal text-paper backdrop-blur-sm">
                  {pv.label}
                </figcaption>
              </div>
            </div>
          </motion.figure>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
