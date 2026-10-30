import Lenis from "lenis";
import { frame, cancelFrame } from "motion/react";

let lenis: Lenis | null = null;

export function startSmoothScroll() {
  if (lenis || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, anchors: { offset: -24 } });
  // Drive Lenis from Motion's frame loop so scroll and animation share one clock.
  const update = (data: { timestamp: number }) => lenis?.raf(data.timestamp);
  frame.update(update, true);
  return () => {
    cancelFrame(update);
    lenis?.destroy();
    lenis = null;
  };
}

export const pauseScroll = () => lenis?.stop();
export const resumeScroll = () => lenis?.start();

export function scrollToHash(hash: string) {
  const el = document.querySelector(hash);
  if (!el) return;
  if (lenis) lenis.scrollTo(el as HTMLElement, { offset: 0, duration: 1.4 });
  else el.scrollIntoView({ behavior: "smooth" });
}
