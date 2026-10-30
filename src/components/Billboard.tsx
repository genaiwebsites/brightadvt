import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { asset } from "../lib/media";
import { Logo } from "./Logo";

const SLATS = 14;
const STAGGER = 42;
const FLIP = 1050;
const HOLD = 5200;
const SETTLE = FLIP + (SLATS - 1) * STAGGER + 80;
const LAMPS = [0.13, 0.38, 0.62, 0.87];

type Slide = { label: string; client: string; what: string; img?: string };

const slides: Slide[] = [
  { label: "Your brand, here", client: "Your brand", what: "Prime sites, Eastern India" },
  { label: "SBI Card, Keventer and Rollick creatives", client: "SBI Card · Keventer · Rollick", what: "Print and social", img: "img/bb-print.webp" },
  { label: "ITC Sunfeast Farmlite metro train wrap", client: "ITC", what: "Metro train wrap", img: "img/bb-itc.webp" },
  { label: "LIC digital billboard", client: "LIC", what: "Digital billboard", img: "img/bb-lic.webp" },
];
const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Which slide each of the three prism faces carries at step k. */
const faceSlides = (k: number) =>
  [0, 1, 2].map((j) => {
    let kk = k + 1;
    while (mod(kk, 3) !== j) kk--;
    return mod(kk, slides.length);
  });

function SlideArt({ n }: { n: number }) {
  const s = slides[n];
  if (s.img) return <div className="size-full bg-cover bg-center" style={{ backgroundImage: `var(--slide-${n})` }} />;
  return (
    <div className="relative flex size-full flex-col justify-between overflow-hidden bg-red p-[4.4cqw] text-white">
      <p className="display text-[11.5cqw] leading-[0.8] tracking-[-0.045em]">
        Your brand,
        <br />
        here<span className="text-ink">.</span>
      </p>
      <p className="flex items-end justify-between text-[2cqw] font-medium">
        <span>Prime sites across Eastern India</span>
        <span className="ital text-[2.6cqw]">Book this space</span>
      </p>
      <span className="absolute -right-[6cqw] -top-[10cqw] size-[34cqw] rounded-full border-[0.5cqw] border-white/15" aria-hidden />
    </div>
  );
}

/**
 * The hero hoarding. A tri-vision face (fourteen triangular slats that turn
 * in a ripple, as roadside tri-vision boards do) which settles into a single
 * seamless print between turns. Gooseneck lamps switch on after load and
 * brighten when you come close; a glint follows the cursor across the vinyl;
 * a sheen runs over each new ad. Steel bezel, operator plate, catwalk,
 * braced posts and a service ladder make it a structure, not a frame.
 */
export function Billboard({ className = "" }: { className?: string }) {
  const [k, setK] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [sheen, setSheen] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const face = useRef<HTMLDivElement>(null);
  const visible = useRef(true);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true);
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting));
    if (root.current) io.observe(root.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (paused) return;
    const timers: number[] = [];
    const t = window.setInterval(() => {
      if (!visible.current || document.hidden) return;
      setFlipping(true);
      timers.push(window.setTimeout(() => setK((n) => n + 1), 30));
      timers.push(
        window.setTimeout(() => {
          setFlipping(false);
          setSheen((s) => s + 1);
          dispatchEvent(new CustomEvent("bright:billboard-flip", { detail: root.current }));
        }, SETTLE)
      );
    }, HOLD);
    return () => {
      clearInterval(t);
      timers.forEach(clearTimeout);
    };
  }, [paused]);

  const glint = (e: React.PointerEvent) => {
    const r = face.current?.getBoundingClientRect();
    if (!r) return;
    face.current!.style.setProperty("--gx", `${((e.clientX - r.left) / r.width) * 100}%`);
    face.current!.style.setProperty("--gy", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  const faces = faceSlides(k);
  const cur = mod(k, slides.length);

  return (
    <div
      ref={root}
      className={`flex flex-col items-stretch ${className}`}
      style={Object.fromEntries(slides.map((s, n) => [`--slide-${n}`, s.img ? `url(${asset(s.img)})` : "none"])) as React.CSSProperties}
    >
      <div
        className="relative"
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onPointerMove={glint}
      >
        {/* Gooseneck lamps. */}
        <div className="relative h-[clamp(26px,3vw,44px)]" aria-hidden>
          {LAMPS.map((x, i) => (
            <div key={x} className="absolute bottom-0 h-full -translate-x-1/2" style={{ left: `${x * 100}%` }}>
              <svg viewBox="0 0 40 44" className="h-full w-auto overflow-visible" fill="none">
                <path d="M20 44V18c0-6 4-10 10-10" stroke="#121110" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M24 2h14l3 9H21z" fill="#1d1b19" />
                <rect x="21.5" y="10" width="19" height="2.4" rx="1.2" className="bb-bulb" style={{ animationDelay: `calc(var(--intro, 0s) + ${900 + i * 170}ms)` }} />
              </svg>
            </div>
          ))}
        </div>

        {/* Bezel. */}
        <div className="relative rounded-[8px] bg-[linear-gradient(180deg,#2b2926,#121110_40%)] p-[1.3%] shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_40px_70px_-36px_rgb(18_17_16/0.6)]">
          {[
            "left-[0.45%] top-[1.2%]",
            "right-[0.45%] top-[1.2%]",
            "left-[0.45%] bottom-[1.2%]",
            "right-[0.45%] bottom-[1.2%]",
          ].map((p) => (
            <span key={p} aria-hidden className={`absolute size-[4px] rounded-full bg-[#4a4642] shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] ${p}`} />
          ))}

          <div
            ref={face}
            role="img"
            aria-label={`Billboard: ${slides[cur].label}`}
            className="relative aspect-[7/3] overflow-hidden rounded-[2px] bg-night-2 [container-type:inline-size] [perspective:1600px]"
          >
            {/* Tri-vision slats, only shown while turning. */}
            <div
              aria-hidden
              className="absolute inset-0 grid"
              style={{ gridTemplateColumns: `repeat(${SLATS}, 1fr)`, opacity: flipping ? 1 : 0 }}
            >
              {Array.from({ length: SLATS }, (_, i) => (
                <div key={i} className="relative h-full [transform-style:preserve-3d]">
                  <div
                    className="absolute inset-0 [transform-style:preserve-3d]"
                    style={{
                      transform: `translateZ(calc(-100cqw / ${SLATS} * 0.2887)) rotateY(${-k * 120}deg)`,
                      transition: `transform ${FLIP}ms cubic-bezier(0.7, 0, 0.2, 1) ${i * STAGGER}ms`,
                    }}
                  >
                    {faces.map((n, j) => (
                      <div
                        key={j}
                        className="absolute inset-0 overflow-hidden [backface-visibility:hidden]"
                        style={{ transform: `rotateY(${j * 120}deg) translateZ(calc(100cqw / ${SLATS} * 0.2887))` }}
                      >
                        <div className="absolute inset-y-0 w-[100cqw]" style={{ left: `calc(-100cqw / ${SLATS} * ${i})` }}>
                          <SlideArt n={n} />
                        </div>
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(0_0_0/0.28),transparent_22%,transparent_78%,rgb(255_255_255/0.1))]" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* The settled face: one seamless print. */}
            <div className="absolute inset-0" style={{ opacity: flipping ? 0 : 1 }}>
              <SlideArt n={cur} />
            </div>

            {/* Lamp wash, glint, sheen and vignette. */}
            <div aria-hidden className="bb-lampfx pointer-events-none absolute inset-0 mix-blend-screen">
              <div
                className="absolute inset-0 transition-opacity duration-700"
                style={{
                  opacity: hover ? 1 : 0.7,
                  background: LAMPS.map((x) => `radial-gradient(60% 75% at ${x * 100}% -12%, rgb(255 238 205 / 0.36), transparent 70%)`).join(","),
                }}
              />
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 transition-opacity duration-500"
              style={{
                opacity: hover && !flipping ? 1 : 0,
                background: "radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), rgb(255 255 255 / 0.22), transparent 28%)",
                mixBlendMode: "soft-light",
              }}
            />
            {sheen > 0 && <span key={sheen} aria-hidden className="bb-sheen pointer-events-none absolute inset-y-0 -left-1/3 w-1/3" />}
            <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_40px_rgb(0_0_0/0.28)]" />
          </div>

          {/* Operator plate. */}
          <span className="absolute -bottom-[9px] left-1/2 flex h-[18px] -translate-x-1/2 items-center rounded-[3px] bg-[#0b0b0a] px-2.5 shadow-[0_2px_6px_rgb(0_0_0/0.35)]">
            <Logo className="h-[9px] w-auto text-white" title="Bright" />
          </span>
        </div>

        {/* Catwalk with railing. */}
        <div aria-hidden className="relative mx-[2.5%] mt-[3px]">
          <div className="h-[clamp(10px,1.1vw,16px)] border-x-2 border-t-2 border-ink bg-[repeating-linear-gradient(90deg,#121110_0_1px,transparent_1px_13px)]" />
          <div className="h-[4px] bg-ink" />
        </div>
      </div>

      {/* Two clean steel posts down to the street, one tie between them, and
          the "now showing" plate hanging from the catwalk. */}
      <div className="relative flex-1">
        {[24, 76].map((x) => (
          <span
            key={x}
            aria-hidden
            className="absolute inset-y-0 w-[clamp(10px,1.05vw,16px)] -translate-x-1/2 bg-[linear-gradient(90deg,#121110_0_18%,#2e2b28_18%_45%,#121110_45%)]"
            style={{ left: `${x}%` }}
          />
        ))}
        <span aria-hidden className="absolute inset-x-[24%] top-[34%] h-[3px] bg-ink" />

        <div className="absolute left-1/2 top-0 w-[46%] -translate-x-1/2">
          <div aria-hidden className="mx-auto flex w-[64%] justify-between">
            <span className="h-3 w-px bg-ink" />
            <span className="h-3 w-px bg-ink" />
          </div>
          <div className="flex items-center gap-2 rounded-[9px] border border-ink/15 bg-paper-3 py-1.5 pl-2.5 pr-1.5 text-[0.6875rem] shadow-[0_10px_24px_-14px_rgb(18_17_16/0.45)]">
            <span className="relative grid size-2 shrink-0 place-items-center">
              <span className={`absolute size-2 rounded-full bg-red ${paused ? "" : "animate-ping opacity-50"}`} />
              <span className="size-1.5 rounded-full bg-red" />
            </span>
            <span className="relative h-4 min-w-0 flex-1 overflow-hidden" aria-live="polite">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={cur}
                  className="absolute inset-0 truncate font-medium leading-4 text-ink"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  {slides[cur].client} <span className="font-normal text-ink-2">· {slides[cur].what}</span>
                </motion.span>
              </AnimatePresence>
            </span>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="relative grid size-6 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
              aria-label={paused ? "Play billboard" : "Pause billboard"}
            >
              <svg viewBox="0 0 24 24" className="absolute inset-0 size-full -rotate-90" aria-hidden>
                <circle cx="12" cy="12" r="10.5" fill="none" stroke="var(--color-line)" strokeWidth="1.5" />
                <circle
                  key={`${k}-${paused}`}
                  cx="12"
                  cy="12"
                  r="10.5"
                  fill="none"
                  stroke="var(--color-ink)"
                  strokeWidth="1.5"
                  pathLength={1}
                  strokeDasharray="1"
                  style={{ strokeDashoffset: paused ? 1 : undefined, animation: paused ? undefined : `bb-ring ${HOLD}ms linear both` }}
                />
              </svg>
              {paused ? (
                <svg width="7" height="8" viewBox="0 0 10 12" aria-hidden><path d="M0 0l10 6-10 6z" fill="currentColor" /></svg>
              ) : (
                <svg width="7" height="8" viewBox="0 0 10 12" aria-hidden><path d="M0 0h3v12H0zM7 0h3v12H7z" fill="currentColor" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
