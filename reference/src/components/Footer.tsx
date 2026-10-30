import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls, useInView } from "motion/react";
import { contact } from "../content";
import { LETTERS, DOT } from "./logo-path";
import { CROWD, CROWD_SHEET } from "./crowd-sheet";
import { asset } from "../lib/media";
import { scrollToHash } from "../lib/smooth";
import { Button } from "./Button";

// Wordmark geometry (viewBox 440 35 2315 777, baseline at y = 616).
const VB = { x: 440, y: 35, w: 2315, h: 777 };
const pctX = (x: number) => `${((x - VB.x) / VB.w) * 100}%`;
const pctB = (y: number) => `${((VB.y + VB.h - y) / VB.h) * 100}%`;
const pctH = (h: number) => `${(h / VB.h) * 100}%`;

// Open Peeps perched on the letters: x is the figure's centre, y the surface it sits on.
const perch = [
  { src: "peeps/sitting-06.webp", x: 615, y: 72, h: 340 },
  { src: "peeps/sitting-16.webp", x: 1606, y: 270, h: 320 },
  { src: "peeps/standing-14.webp", x: 2120, y: 270, h: 560 },
  { src: "peeps/standing-06.webp", x: 2900, y: 618, h: 620, flip: true },
];
const BIKE = CROWD.find((c) => c.k === "b")!.r;

const ease = [0.16, 1, 0.3, 1] as const;
const links = [
  { href: "#work", label: "Work" },
  { href: "#services", label: "Services" },
  { href: "#process", label: "Process" },
  { href: "#voices", label: "Clients" },
  { href: "#faq", label: "FAQs" },
];

function Perched({ p, i, show, armed, cheer, idle }: { p: (typeof perch)[number]; i: number; show: boolean; armed: boolean; cheer: number; idle: number }) {
  const c = useAnimationControls();
  const hop = (h = 0.09) =>
    c.start({ y: ["0%", `${-h * 100}%`, "0%", `${-h * 25}%`, "0%"], scaleY: [1, 1.04, 0.93, 1.01, 1], transition: { duration: 0.75, times: [0, 0.35, 0.62, 0.82, 1] } });

  // Arrive: drop onto the letter and settle with a little squash.
  useEffect(() => {
    if (!armed) return;
    if (!show) {
      c.set({ y: "-70%", opacity: 0 });
      return;
    }
    c.start({
      y: ["-70%", "0%", "-8%", "0%"],
      scaleY: [1, 0.9, 1.03, 1],
      opacity: [0, 1, 1, 1],
      transition: { duration: 0.9, times: [0, 0.55, 0.8, 1], delay: 1.2 + i * 0.16, ease: "easeOut" },
    });
  }, [show, armed]);
  // Everyone jumps when the full stop bounces; one at a time when idle.
  useEffect(() => {
    if (cheer) {
      const t = setTimeout(() => hop(0.12), 120 + i * 90);
      return () => clearTimeout(t);
    }
  }, [cheer]);
  useEffect(() => {
    if (idle >= 0 && idle % perch.length === i) hop(0.07);
  }, [idle]);

  return (
    <motion.img
      src={asset(p.src)}
      alt=""
      loading="lazy"
      aria-hidden
      animate={c}
      onPointerEnter={() => hop()}
      className="absolute w-auto origin-bottom cursor-pointer"
      style={{ left: pctX(p.x), bottom: pctB(p.y), height: pctH(p.h), x: "-50%", scaleX: p.flip ? -1 : 1 }}
    />
  );
}

/**
 * A cyclist on the footer's ground line: rides the full width, turns round
 * out of sight and comes back the other way, pedalling (a small bob) with a
 * Bright pennant fluttering behind. Only rides while the footer is in view.
 */
function Cyclist() {
  const lane = useRef<HTMLDivElement>(null);
  const rider = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const inView = useInView(lane, { margin: "0px 0px -5% 0px" });
  const H = 62;
  const s = H / BIKE[3];
  const w = Math.round(BIKE[2] * s);

  useEffect(() => {
    if (!inView || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let last = performance.now();
    let x = -w - 20;
    let dir = 1;
    let wait = 0;
    let t = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const W = lane.current?.clientWidth ?? 0;
      if (wait > 0) wait -= dt;
      else {
        x += dir * 150 * dt;
        t += dt;
        if ((dir === 1 && x > W + 20) || (dir === -1 && x < -w - 20)) {
          dir = dir === 1 ? -1 : 1;
          wait = 1.6;
        }
      }
      if (rider.current) rider.current.style.transform = `translate3d(${x}px,0,0) scaleX(${dir})`;
      if (body.current) body.current.style.transform = `translateY(${-Math.abs(Math.sin(t * 9)) * 1.6}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  return (
    <div ref={lane} aria-hidden className="pointer-events-none relative h-[78px] overflow-hidden">
      <div ref={rider} className="absolute bottom-0 left-0 will-change-transform" style={{ width: w, height: H, transform: `translate3d(${-w - 20}px,0,0)`, transformOrigin: "50% 100%" }}>
        <div ref={body} className="relative size-full">
          <svg viewBox="0 0 30 34" className="absolute -left-[14px] bottom-[26px] h-[34px] w-[30px] overflow-visible">
            <line x1="22" y1="34" x2="22" y2="2" stroke="var(--color-ink)" strokeWidth="1.6" />
            <path className="pennant" d="M22 2L2 7l20 5z" fill="var(--color-red)" />
          </svg>
          <div
            className="size-full"
            style={{
              backgroundImage: `url(${asset("peeps/crowd.webp")})`,
              backgroundSize: `${CROWD_SHEET.w * s}px ${CROWD_SHEET.h * s}px`,
              backgroundPosition: `-${BIKE[0] * s}px -${BIKE[1] * s}px`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function BigLogo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const [armed, setArmed] = useState(false);
  const [hop, setHop] = useState(0);

  useEffect(() => {
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) setArmed(true);
  }, []);
  const show = !armed || inView;
  const [idle, setIdle] = useState(-1);
  useEffect(() => {
    if (!armed || !inView) return;
    const t = setInterval(() => setIdle(Math.floor(Math.random() * perch.length) + perch.length * Math.floor(Date.now() / 1000)), 3600);
    return () => clearInterval(t);
  }, [armed, inView]);

  return (
    <div ref={ref} className="relative w-[84%] md:w-[86%]" style={{ aspectRatio: `${VB.w} / ${VB.h}` }}>
      <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} className="absolute inset-0 size-full overflow-visible" role="img" aria-label="Bright">
        <defs>
          <clipPath id="footer-logo-clip">
            <rect x={VB.x - 50} y={-400} width={VB.w + 100} height={VB.y + VB.h + 400} />
          </clipPath>
        </defs>
        <g clipPath="url(#footer-logo-clip)">
          {LETTERS.map((l, i) => (
            <motion.path
              key={l.ch}
              d={l.d}
              fill="currentColor"
              initial={false}
              animate={{ y: show ? 0 : 900 }}
              transition={{ duration: armed ? 1.1 : 0, ease, delay: armed ? i * 0.07 : 0 }}
            />
          ))}
        </g>
        <motion.circle
          key={hop}
          cx={DOT.cx}
          cy={DOT.cy}
          r={DOT.r}
          fill="var(--color-red)"
          className="cursor-pointer"
          onPointerEnter={() => setHop((h) => h + 1)}
          initial={false}
          animate={
            hop
              ? { y: [0, -320, 0, -90, 0] }
              : show
                ? { y: armed ? [-1400, 0, -300, 0, -80, 0] : 0, opacity: 1 }
                : { y: -1400, opacity: 0 }
          }
          transition={
            hop
              ? { duration: 0.8, times: [0, 0.35, 0.65, 0.82, 1] }
              : { duration: armed ? 1.3 : 0, delay: armed ? 0.55 : 0, times: [0, 0.42, 0.62, 0.78, 0.9, 1], ease: "easeOut" }
          }
        />
      </svg>
      {perch.map((p, i) => (
        <Perched key={p.src} p={p} i={i} show={show} armed={armed} cheer={hop} idle={idle} />
      ))}
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    scrollToHash(href);
  };
  return (
    <footer className="relative z-20 rounded-t-[36px] bg-paper pb-8 pt-20 md:rounded-t-[56px] md:pt-28">
      <div className="wrap">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <p className="display text-[clamp(2rem,3.4vw,3.25rem)] font-[800] leading-[0.95] tracking-[-0.03em]">
              Have a brief? <span className="ital font-normal">Let’s talk.</span>
            </p>
            <div className="mt-7">
              <Button href="#contact">Start a campaign</Button>
            </div>
          </div>
          <nav aria-label="Footer" className="md:col-span-2 md:col-start-7">
            <p className="text-[0.8125rem] text-ink-3">Explore</p>
            <ul className="mt-4 space-y-2">
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={(e) => go(e, l.href)} className="group inline-flex text-[1.0625rem]">
                    <span className="roll"><span>{l.label}</span><span aria-hidden>{l.label}</span></span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="md:col-span-2">
            <p className="text-[0.8125rem] text-ink-3">Talk to us</p>
            <ul className="mt-4 space-y-2 text-[1.0625rem]">
              <li><a href={contact.phoneHref} className="link">{contact.phone}</a></li>
              <li><a href={`mailto:${contact.email}`} className="link break-all">{contact.email}</a></li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <p className="text-[0.8125rem] text-ink-3">Offices</p>
            <ul className="mt-4 space-y-2 text-[1.0625rem]">
              <li>Kolkata <span className="text-ink-3">(HQ)</span></li>
              <li>Bengaluru</li>
            </ul>
          </div>
        </div>

        <div className="mt-28 md:mt-40">
          <BigLogo />
        </div>

        <div className="mt-6">
          <Cyclist />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink pt-6 text-[0.8125rem] text-ink-2">
          <p>Bright Advertising Private Limited · © {year}</p>
          <a href="#top" onClick={(e) => go(e, "#top")} className="group inline-flex items-center gap-2 text-ink">
            <span className="roll"><span>Back to top</span><span aria-hidden>Back to top</span></span>
            <span className="grid size-8 place-items-center rounded-full bg-ink text-paper" aria-hidden>
              <svg viewBox="0 0 16 16" className="size-3.5 transition-transform duration-500 group-hover:-translate-y-0.5" fill="none"><path d="M8 14V2M3 7l5-5 5 5" stroke="currentColor" strokeWidth="1.6" /></svg>
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
