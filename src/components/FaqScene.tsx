import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls, useInView } from "motion/react";
import { asset } from "../lib/media";

type Phase = "idle" | "ask" | "think" | "answer";
const ease = [0.16, 1, 0.3, 1] as const;
const pop = {
  initial: { opacity: 0, scale: 0.6, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 420, damping: 22 } },
  exit: { opacity: 0, scale: 0.8, y: -6, transition: { duration: 0.25 } },
};

function Peep({ src, flip, controls, delay }: { src: string; flip?: boolean; controls: ReturnType<typeof useAnimationControls>; delay: number }) {
  return (
    <motion.div animate={controls} className="origin-bottom" onPointerEnter={() => hop(controls)}>
      <motion.img
        src={asset(src)}
        alt=""
        loading="lazy"
        className="h-[clamp(150px,15vw,200px)] w-auto origin-bottom cursor-pointer"
        style={{ scaleX: flip ? -1 : 1 }}
        animate={{ scaleY: [1, 1.012, 1] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay }}
      />
    </motion.div>
  );
}

function hop(c: ReturnType<typeof useAnimationControls>) {
  c.start({ y: [0, -18, 0, -5, 0], transition: { duration: 0.7, times: [0, 0.35, 0.65, 0.85, 1] } });
}

/**
 * Two Open Peeps in conversation: one asks, the other thinks, then answers.
 * Opening any question below makes the answer arrive straight away.
 */
export function FaqScene({ pulse }: { pulse: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "0px 0px -15% 0px" });
  const [phase, setPhase] = useState<Phase>("idle");
  const asker = useAnimationControls();
  const answerer = useAnimationControls();
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const run = () => {
    clear();
    setPhase("ask");
    hop(asker);
    at(1500, () => setPhase("think"));
    at(3100, () => {
      setPhase("answer");
      hop(answerer);
    });
    at(5600, () => setPhase("idle"));
    at(6400, run);
  };

  useEffect(() => {
    if (!inView || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (!inView) clear();
      else setPhase("answer");
      return;
    }
    run();
    return clear;
  }, [inView]);

  // A question was opened: answer now.
  useEffect(() => {
    if (!pulse || !inView) return;
    clear();
    setPhase("answer");
    hop(answerer);
    at(2600, () => setPhase("idle"));
    at(3400, run);
  }, [pulse]);

  return (
    <div ref={ref} aria-hidden className="relative mt-12 w-full max-w-[400px] select-none pt-16">
      <div className="relative flex items-end justify-between px-[6%]">
        <div className="relative">
          <AnimatePresence>
            {(phase === "ask" || phase === "think" || phase === "answer") && (
              <motion.span
                key="q"
                {...pop}
                className="absolute -top-14 left-[55%] grid h-11 min-w-11 origin-bottom-left place-items-center rounded-[14px] rounded-bl-[4px] border-[1.5px] border-ink bg-paper-3 px-3"
              >
                <span className="display text-[1.375rem] font-[800] leading-none text-red">?</span>
              </motion.span>
            )}
          </AnimatePresence>
          <Peep src="peeps/standing-13.webp" controls={asker} delay={0} />
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {phase === "think" && (
              <motion.span
                key="dots"
                {...pop}
                className="absolute -top-14 right-[50%] flex h-11 origin-bottom-right items-center gap-1.5 rounded-[14px] rounded-br-[4px] bg-ink px-3.5"
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="size-1.5 rounded-full bg-paper"
                    animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                  />
                ))}
              </motion.span>
            )}
            {phase === "answer" && (
              <motion.span
                key="a"
                {...pop}
                className="absolute -top-14 right-[50%] flex h-11 origin-bottom-right items-center gap-2 rounded-[14px] rounded-br-[4px] bg-ink px-3.5 text-paper"
              >
                <svg viewBox="0 0 16 16" className="size-4" fill="none">
                  <motion.path
                    d="M3 8.5l3.2 3L13 4.5"
                    stroke="var(--color-red)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1, transition: { duration: 0.5, delay: 0.15, ease } }}
                  />
                </svg>
                <span className="whitespace-nowrap text-[0.8125rem] font-medium">Sorted.</span>
              </motion.span>
            )}
          </AnimatePresence>
          <Peep src="peeps/standing-06.webp" flip controls={answerer} delay={1.6} />
        </div>
      </div>
      <div className="h-[3px] rounded-full bg-ink" />
    </div>
  );
}
