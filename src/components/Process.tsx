import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useAnimationControls, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { process } from "../content";
import { asset } from "../lib/media";
import { useReveal } from "../lib/useReveal";
import { IconHandshake, IconLaunch, IconMap, IconPen, IconSearch } from "./Icons";

const icons = [IconSearch, IconMap, IconPen, IconHandshake, IconLaunch];
const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;
const ease = [0.16, 1, 0.3, 1] as const;

type Geo = { d: string; w: number; h: number; stops: number[] };

// Waiting on the platform at the end of the line (Open Peeps).
const platform = ["standing-03", "standing-13", "standing-21", "standing-08", "standing-16"];

function Rider({ src, i, arrived, flip }: { src: string; i: number; arrived: boolean; flip?: boolean }) {
  const c = useAnimationControls();
  const hop = () => c.start({ y: [0, -22, 0, -6, 0], transition: { duration: 0.7, times: [0, 0.35, 0.65, 0.85, 1] } });
  useEffect(() => {
    if (arrived) {
      const t = setTimeout(hop, 120 + i * 110);
      return () => clearTimeout(t);
    }
  }, [arrived]);
  return (
    <motion.img
      src={asset(`peeps/${src}.webp`)}
      alt=""
      loading="lazy"
      animate={c}
      onPointerEnter={hop}
      className="h-[clamp(110px,13vw,170px)] w-auto origin-bottom cursor-pointer"
      style={{ scaleX: flip ? -1 : 1 }}
    />
  );
}

/**
 * The campaign as a railway line. The track runs down a clear centre lane
 * (never through the copy); scrolling drives a small Bright tram along it,
 * stations light up as it arrives, and the line terminates at "Live."
 * where the people waiting on the platform cheer it in.
 */
export function Process() {
  const box = useRef<HTMLDivElement>(null);
  const anchors = useRef<(HTMLSpanElement | null)[]>([]);
  const terminus = useRef<HTMLSpanElement>(null);
  const path = useRef<SVGPathElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [lit, setLit] = useState(-1);
  const [arrived, setArrived] = useState(false);
  const [tram, setTram] = useState({ x: 0, y: 0, a: 90 });
  const headRef = useReveal<HTMLDivElement>();

  useIso(() => {
    const build = () => {
      const el = box.current;
      if (!el || !terminus.current) return;
      const b = el.getBoundingClientRect();
      const at = (n: HTMLElement) => {
        const r = n.getBoundingClientRect();
        return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 };
      };
      const pts = anchors.current.map((a) => at(a!));
      const end = at(terminus.current);
      const all = [{ x: pts[0].x, y: 0 }, ...pts, end];
      const segs: string[] = [];
      for (let i = 1; i < all.length; i++) {
        const a = all[i - 1];
        const c = all[i];
        const dy = c.y - a.y;
        segs.push(`C${a.x} ${a.y + dy * 0.5} ${c.x} ${c.y - dy * 0.5} ${c.x} ${c.y}`);
      }
      const d = `M${all[0].x} 0` + segs.join("");
      const tmp = document.createElementNS("http://www.w3.org/2000/svg", "path");
      tmp.setAttribute("d", d);
      const total = tmp.getTotalLength();
      const stops = pts.map((_, i) => {
        tmp.setAttribute("d", `M${all[0].x} 0` + segs.slice(0, i + 1).join(""));
        return tmp.getTotalLength() / total;
      });
      setGeo({ d, w: b.width, h: b.height, stops });
    };
    build();
    const ro = new ResizeObserver(build);
    if (box.current) ro.observe(box.current);
    document.fonts?.ready.then(build);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: box, offset: ["start 60%", "end 80%"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.5 });

  useMotionValueEvent(p, "change", (v) => {
    if (!geo || !path.current) return;
    const len = path.current.getTotalLength();
    const l = Math.max(0, Math.min(1, v)) * len;
    const a = path.current.getPointAtLength(Math.max(0, l - 1));
    const b = path.current.getPointAtLength(Math.min(len, l + 1));
    setTram({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, a: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI });
    let n = -1;
    geo.stops.forEach((s, i) => v >= s - 0.004 && (n = i));
    setLit(n);
    setArrived(v > 0.985);
  });

  return (
    <section
      id="process"
      className="relative overflow-hidden border-t border-line bg-paper-3 bg-[radial-gradient(rgb(18_17_16/0.07)_0.9px,transparent_1px)] [background-size:22px_22px] py-28 md:py-40"
      aria-labelledby="process-title"
    >
      <div className="wrap">
        <div ref={headRef} className="mx-auto max-w-[46rem] text-center">
          <h2 id="process-title" className="reveal display text-h2 font-[800]">
            How a campaign <span className="ital font-normal">comes together</span>.
          </h2>
          <p className="reveal mx-auto mt-5 max-w-[34rem] text-lg text-ink-2" style={{ "--d": "80ms" } as React.CSSProperties}>
            One line, five stops, one accountable team from the first conversation to the morning your ads go live.
          </p>
        </div>

        <div ref={box} className="relative mt-16 md:mt-24">
          {geo && (
            <svg className="pointer-events-none absolute inset-0 overflow-visible" width={geo.w} height={geo.h} aria-hidden>
              {/* Sleepers, then two rails (an ink stroke with a paper core), then the lit line. */}
              <path d={geo.d} fill="none" stroke="var(--color-ink-3)" strokeOpacity="0.55" strokeWidth="18" strokeDasharray="2 9" />
              <path d={geo.d} fill="none" stroke="var(--color-ink)" strokeWidth="10" strokeLinecap="round" />
              <path d={geo.d} fill="none" stroke="var(--color-paper-3)" strokeWidth="6.5" strokeLinecap="round" />
              <motion.path ref={path} d={geo.d} fill="none" stroke="var(--color-red)" strokeWidth="6.5" strokeLinecap="round" style={{ pathLength: p }} />
            </svg>
          )}

          {/* The tram: Bright livery, always facing along the track. */}
          {geo && (
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 z-10 size-0"
              style={{ transform: `translate(${tram.x}px, ${tram.y}px) rotate(${tram.a}deg)` }}
            >
              <svg width="58" height="26" viewBox="0 0 58 26" className="absolute left-0 top-0 max-w-none -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_6px_8px_rgb(18_17_16/0.25)]">
                <rect x="1" y="2" width="54" height="22" rx="7" fill="#121110" />
                <path d="M47 2h1a7 7 0 0 1 7 7v8a7 7 0 0 1-7 7h-1z" fill="#ff1616" />
                <rect x="7" y="7" width="7" height="6" rx="1.5" fill="#f4f2ec" />
                <rect x="17" y="7" width="7" height="6" rx="1.5" fill="#f4f2ec" />
                <rect x="27" y="7" width="7" height="6" rx="1.5" fill="#f4f2ec" />
                <rect x="37" y="7" width="7" height="6" rx="1.5" fill="#f4f2ec" />
                <rect x="7" y="17" width="37" height="2" rx="1" fill="#ff1616" />
                <circle cx="53" cy="13" r="1.6" fill="#fff6d6" />
              </svg>
            </span>
          )}

          <ol className="relative">
            {process.map((s, i) => {
              const Icon = icons[i];
              const left = i % 2 === 0;
              const on = lit >= i;
              return (
                <li key={s.title} className="relative grid min-h-[240px] items-center py-10 md:min-h-[max(320px,36vh)] md:grid-cols-12 md:py-0">
                  <span
                    ref={(el) => {
                      anchors.current[i] = el;
                    }}
                    aria-hidden
                    className={`absolute top-1/2 z-[5] grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] text-[0.75rem] font-semibold tabular-nums transition-[background-color,border-color,color] duration-500 max-md:left-[22px] ${
                      left ? "md:left-[calc(50%-56px)]" : "md:left-[calc(50%+56px)]"
                    } ${on ? "border-red bg-red text-white" : "border-ink bg-paper-3 text-ink"}`}
                  >
                    {i + 1}
                    {on && <span className="absolute inset-0 animate-[station_1.2s_ease-out_1] rounded-full border-2 border-red" />}
                  </span>

                  <div
                    className={`relative pl-16 transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)] md:pl-0 ${
                      left ? "md:col-span-5 md:col-start-1 md:text-right" : "md:col-span-5 md:col-start-8"
                    } ${on ? "opacity-100" : "opacity-35 md:translate-y-3"}`}
                  >
                    <div className={`flex items-center gap-4 ${left ? "md:flex-row-reverse" : ""}`}>
                      <span className={`grid size-12 place-items-center rounded-full transition-colors duration-500 ${on ? "bg-ink text-paper" : "bg-paper-2 text-ink"}`}>
                        <Icon className="size-6" />
                      </span>
                      <span className="ital text-[2rem] leading-none text-red">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="display mt-5 text-h3 font-[800]">{s.title}</h3>
                    <p className={`mt-3 max-w-[28rem] text-[1.0625rem] leading-relaxed text-ink-2 ${left ? "md:ml-auto" : ""}`}>{s.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Terminus. */}
          <div className="relative flex flex-col items-center pt-44 md:pt-28">
            <span ref={terminus} aria-hidden className="absolute left-1/2 top-[172px] size-0 md:top-[108px]" />
            <div className="relative z-10 flex flex-col items-center">
              <motion.div
                className="rounded-[10px] bg-ink px-5 py-2.5 text-paper shadow-[0_14px_30px_-14px_rgb(18_17_16/0.6)]"
                animate={arrived ? { backgroundColor: "#ff1616", scale: [1, 1.08, 1] } : { backgroundColor: "#121110", scale: 1 }}
                transition={{ duration: 0.6, ease }}
              >
                <span className="display text-2xl font-[800]">Live</span>
                <span className={arrived ? "text-ink" : "text-red"}>.</span>
              </motion.div>
              <span className="h-6 w-[3px] bg-ink" aria-hidden />
              <div className="flex items-end gap-[clamp(2px,1vw,14px)]" aria-hidden>
                {platform.map((src, i) => (
                  <Rider key={src} src={src} i={i} arrived={arrived} flip={i < 2} />
                ))}
              </div>
              <span className="h-2 w-[min(78vw,620px)] rounded-full bg-ink" aria-hidden />
              <p className="mt-5 text-center text-[0.95rem] text-ink-2">
                Every channel goes live together. <span className="ital">Then we report back.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
