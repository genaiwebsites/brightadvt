import { useState } from "react";
import { motion } from "motion/react";
import { LETTERS, DOT } from "./logo-path";

const VB = "440 35 2315 777";
const ease = [0.16, 1, 0.3, 1] as const;

/** Static wordmark, used where nothing should move. */
export function Logo({ className, title = "Bright" }: { className?: string; title?: string }) {
  return (
    <svg viewBox={VB} className={className} role="img" aria-label={title}>
      {LETTERS.map((l) => (
        <path key={l.ch} d={l.d} fill="currentColor" />
      ))}
      <circle cx={DOT.cx} cy={DOT.cy} r={DOT.r} fill="var(--color-red)" />
    </svg>
  );
}

/**
 * Nav wordmark. On scroll it folds to "B." (the letters drop behind a mask and
 * the full stop slides in after the B). Hovering makes the dot hop.
 */
export function NavLogo({ compact, className }: { compact: boolean; className?: string }) {
  const [hop, setHop] = useState(0);
  const dx = 960 - DOT.cx; // dot position when only the B is showing
  return (
    <svg
      viewBox={VB}
      className={className}
      role="img"
      aria-label="Bright"
      onPointerEnter={() => setHop((h) => h + 1)}
      overflow="visible"
    >
      <defs>
        <clipPath id="nav-logo-clip">
          <rect x="440" y="-200" width="2400" height="1012" />
        </clipPath>
      </defs>
      <g clipPath="url(#nav-logo-clip)">
        {LETTERS.map((l, i) => (
          <motion.path
            key={l.ch}
            d={l.d}
            fill="currentColor"
            initial={false}
            animate={i === 0 ? { y: 0 } : { y: compact ? 820 : 0 }}
            transition={{ duration: 0.7, ease, delay: compact ? (LETTERS.length - i) * 0.03 : i * 0.04 }}
          />
        ))}
      </g>
      <motion.g initial={false} animate={{ x: compact ? dx : 0 }} transition={{ duration: 0.8, ease }}>
        <motion.circle
          key={hop}
          cx={DOT.cx}
          cy={DOT.cy}
          r={DOT.r}
          fill="var(--color-red)"
          initial={hop ? { y: 0 } : false}
          animate={hop ? { y: [0, -260, 0, -70, 0] } : undefined}
          transition={{ duration: 0.75, times: [0, 0.35, 0.65, 0.82, 1], ease: "easeOut" }}
        />
      </motion.g>
    </svg>
  );
}

/** Logo used by the first-visit preloader: letters rise, the dot drops and bounces (CSS-driven). */
export function PreloaderLogo({ className }: { className?: string }) {
  return (
    <svg viewBox={VB} className={className} aria-hidden overflow="visible">
      <defs>
        <clipPath id="pl-clip">
          <rect x="440" y="0" width="2400" height="812" />
        </clipPath>
      </defs>
      <g clipPath="url(#pl-clip)">
        {LETTERS.map((l, i) => (
          <path
            key={l.ch}
            d={l.d}
            fill="currentColor"
            className="pl-letter"
            style={{ "--i": i, transformBox: "fill-box" } as React.CSSProperties}
          />
        ))}
      </g>
      <circle cx={DOT.cx} cy={DOT.cy} r={DOT.r} fill="var(--color-red)" className="pl-dot" style={{ transformBox: "fill-box" }} />
    </svg>
  );
}
