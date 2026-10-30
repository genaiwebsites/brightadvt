import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { finePointer } from "../lib/media";

/** A few pixels of pull toward the cursor. Desktop pointers only. */
export function Magnetic({ children, strength = 6 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 22, mass: 0.6 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 22, mass: 0.6 });

  const move = (e: React.PointerEvent) => {
    if (!finePointer() || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    x.set(dx * strength);
    y.set(dy * strength * 0.6);
  };
  const leave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span ref={ref} className="inline-block" style={{ x, y }} onPointerMove={move} onPointerLeave={leave}>
      {children}
    </motion.span>
  );
}
