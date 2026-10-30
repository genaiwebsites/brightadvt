import { useRef } from "react";
import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity, wrap } from "motion/react";
import { clients } from "../content";
import { asset } from "../lib/media";

/**
 * Client logos on a belt that speeds up with the scroll and reverses with it.
 */
export function Clients() {
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const vel = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(vel, [-2000, 0, 2000], [-4, 0, 4], { clamp: false });
  const dir = useRef(1);
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let move = dir.current * -1.6 * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += move * Math.abs(f);
    base.set(base.get() + move);
  });

  return (
    <section className="relative border-y border-line bg-paper-3 py-10 md:py-12" aria-labelledby="clients-title">
      <div className="wrap mb-8 flex flex-wrap items-end justify-between gap-4">
        <h2 id="clients-title" className="text-[0.95rem] font-medium">
          Trusted by market leaders in <span className="ital text-[1.1rem]">FMCG, banking, insurance</span> and{" "}
          <span className="ital text-[1.1rem]">infrastructure</span>.
        </h2>
        <p className="text-[0.8125rem] text-ink-2">One of them has stayed with us for over 35 years.</p>
      </div>
      <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <motion.ul className="flex w-max items-center" style={{ x }}>
          {[...clients, ...clients].map((c, i) => (
            <li
              key={i}
              aria-hidden={i >= clients.length}
              className="logo-tile flex h-20 w-[clamp(140px,15vw,220px)] shrink-0 items-center justify-center px-6 md:h-24 md:px-9"
            >
              <img src={asset(c.src)} alt={i < clients.length ? c.name : ""} width={c.w} height={c.h} loading="lazy" className="max-h-full max-w-full object-contain" />
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
