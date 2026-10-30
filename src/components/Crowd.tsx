import { useEffect, useRef } from "react";
import { asset } from "../lib/media";
import { CROWD2, PEOPLE } from "./crowd2-sheet";

// Open Peeps (Pablo Stanley, CC0) in their original line-art style, each a
// unique recombination of the kit's parts with the head on its own layer
// (scripts/peeps-crowd2.py), so heads can turn independently of bodies.
const SHEET = "peeps/crowd2.webp";
const { box: BOX, ground: GROUND, pivot: NECK } = CROWD2;
const HIP_Y = GROUND * 0.55;

// Three rows, back to front. `box` is the figure box height relative to the
// canvas, `show` is how much of the figure (from the head down) is above the
// canvas edge, so front rows are cut at the waist and back rows show more.
const ROWS = [
  { box: 1.28, show: 0.86, ink: [150, 145, 137], fill: [240, 237, 230], spacing: 0.62 },
  { box: 1.5, show: 0.7, ink: [92, 88, 82], fill: [246, 244, 238], spacing: 0.7 },
  { box: 1.78, show: 0.55, ink: [30, 28, 26], fill: [251, 250, 246], spacing: 0.8 },
] as const;

type Person = {
  row: number;
  body: HTMLCanvasElement;
  head: HTMLCanvasElement;
  b: number[];
  h: number[];
  x: number;
  dir: 1 | -1;
  speed: number; // 0 = standing
  phase: number;
  breath: number;
  // Head: damped springs toward a target tilt and facing.
  tilt: number;
  tiltV: number;
  tiltT: number;
  face: number;
  faceV: number;
  faceT: number;
  nextGlance: number;
  lookUntil: number;
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function spring(x: number, v: number, target: number, k: number, c: number, dt: number) {
  const a = -k * (x - target) - c * v;
  v += a * dt;
  return [x + v * dt, v];
}

/**
 * A dense street crowd in the manner of Skiper 39: overlapping rows of people
 * cut by the bottom of the frame, back rows fading into the paper. Motion is
 * small and human: a rise and fall with each step and a slight sway at the
 * hips; standing people breathe and shift their weight; heads move on their
 * own springs (glancing about, looking back over a shoulder, looking up when
 * the billboard turns, and following the cursor when it comes close).
 */
export function Crowd({ className = "" }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current!;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let people: Person[] = [];
    let raf = 0;
    let last = 0;
    let running = false;
    let inView = true;
    let pointer: { x: number; y: number } | null = null;
    const sheet = new Image();
    sheet.decoding = "async";
    const cache = new Map<string, HTMLCanvasElement>();

    const tone = (r: number[], row: number) => {
      const key = `${r[0]},${r[1]}:${row}`;
      const hit = cache.get(key);
      if (hit) return hit;
      const c = document.createElement("canvas");
      c.width = r[2];
      c.height = r[3];
      const g = c.getContext("2d", { willReadFrequently: true })!;
      g.drawImage(sheet, r[0], r[1], r[2], r[3], 0, 0, r[2], r[3]);
      const img = g.getImageData(0, 0, c.width, c.height);
      const d = img.data;
      const { ink, fill } = ROWS[row];
      for (let i = 0; i < d.length; i += 4) {
        const t = (d[i] + d[i + 1] + d[i + 2]) / 765;
        d[i] = ink[0] + (fill[0] - ink[0]) * t;
        d[i + 1] = ink[1] + (fill[1] - ink[1]) * t;
        d[i + 2] = ink[2] + (fill[2] - ink[2]) * t;
      }
      g.putImageData(img, 0, 0);
      cache.set(key, c);
      return c;
    };

    const k = (row: number) => (ROWS[row].box * H) / BOX;
    const groundY = (row: number) => H + (1 - ROWS[row].show) * (GROUND - 40) * k(row);
    const walkSpeed = () => W / 26;

    const spawn = (p: Person, anywhere: boolean) => {
      const w = 330 * k(p.row);
      p.dir = Math.random() < 0.5 ? 1 : -1;
      p.speed = Math.random() < 0.2 ? 0 : walkSpeed() * rand(0.75, 1.2) * (p.row === 0 ? 0.8 : 1);
      if (!anywhere) p.x = p.dir === 1 ? -w * 0.6 : W + w * 0.6;
    };

    const build = () => {
      const pool = [...PEOPLE].sort(() => Math.random() - 0.5);
      let n = 0;
      people = [];
      ROWS.forEach((row, ri) => {
        const width = 330 * k(ri) * 0.62;
        const count = Math.max(4, Math.round(W / (width * row.spacing * 1.25)));
        for (let i = 0; i < count; i++) {
          const f = pool[n++ % pool.length];
          const p: Person = {
            row: ri,
            body: tone(f.b, ri),
            head: tone(f.h, ri),
            b: f.b,
            h: f.h,
            x: ((i + rand(0.1, 0.9)) / count) * (W + width) - width / 2,
            dir: 1,
            speed: 0,
            phase: rand(0, Math.PI * 2),
            breath: rand(0, Math.PI * 2),
            tilt: 0,
            tiltV: 0,
            tiltT: 0,
            face: 1,
            faceV: 0,
            faceT: 1,
            nextGlance: performance.now() + rand(1500, 7000),
            lookUntil: 0,
          };
          spawn(p, true);
          people.push(p);
        }
      });
    };

    const size = () => {
      const r = cv.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      build();
    };

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (const p of people) {
        const s = k(p.row);
        const walking = p.speed > 0;
        const bob = walking ? Math.abs(Math.sin(p.phase)) * 9 : 0; // in box units
        const sway = walking ? Math.sin(p.phase) * 0.012 : Math.sin(p.breath * 0.35) * 0.006;
        const breathe = walking ? 1 : 1 + Math.sin(p.breath) * 0.006;

        ctx.save();
        ctx.translate(p.x, groundY(p.row));
        ctx.scale(p.dir * s, s);
        ctx.translate(-NECK[0], -GROUND - bob);
        // Hips: sway and breathing.
        ctx.translate(NECK[0], HIP_Y);
        ctx.rotate(sway);
        ctx.scale(1, breathe);
        ctx.translate(-NECK[0], -HIP_Y);
        ctx.drawImage(p.body, p.b[4], p.b[5], p.b[2], p.b[3]);
        // Head about the neck: tilt, plus turning (a squash through zero width).
        ctx.translate(NECK[0], NECK[1]);
        ctx.rotate(p.tilt - sway * 0.6);
        ctx.scale(p.face, 1);
        ctx.translate(-NECK[0], -NECK[1]);
        ctx.drawImage(p.head, p.h[4], p.h[5], p.h[2], p.h[3]);
        ctx.restore();
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      for (const p of people) {
        const s = k(p.row);
        if (p.speed > 0) {
          p.x += p.dir * p.speed * dt;
          p.phase += dt * Math.PI * 1.9 * (p.speed / walkSpeed());
          const w = 330 * s;
          if ((p.dir === 1 && p.x > W + w * 0.6) || (p.dir === -1 && p.x < -w * 0.6)) spawn(p, false);
        }
        p.breath += dt * 1.6;

        // Head targets: the cursor when close, otherwise an occasional glance.
        let tiltT = p.tiltT;
        let faceT = p.faceT;
        if (pointer && p.row === 2) {
          const hx = p.x;
          const hy = groundY(p.row) - (GROUND - NECK[1]) * s;
          const dx = pointer.x - hx;
          const dy = pointer.y - hy;
          if (Math.hypot(dx, dy) < 140) {
            faceT = dx * p.dir >= 0 ? 1 : -1;
            tiltT = Math.max(-0.2, Math.min(0.2, (dy / 140) * 0.25)) * faceT;
          }
        }
        if (now > p.lookUntil && now > p.nextGlance) {
          const r = Math.random();
          p.tiltT = r < 0.5 ? rand(-0.1, 0.1) : 0;
          p.faceT = r > 0.82 ? -1 : 1; // now and then, a look back over the shoulder
          p.nextGlance = now + rand(2500, 8000) * (p.faceT === -1 ? 0.35 : 1);
        }
        [p.tilt, p.tiltV] = spring(p.tilt, p.tiltV, tiltT, 60, 11, dt);
        [p.face, p.faceV] = spring(p.face, p.faceV, faceT, 90, 16, dt);
      }
      draw(now);
      if (running) raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || reduce || !inView || document.hidden || !sheet.complete) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // People beneath the board look up at it when it turns.
    const onFlip = (e: Event) => {
      const board = (e as CustomEvent<HTMLElement | null>).detail;
      if (!board) return;
      const b = board.getBoundingClientRect();
      const c = cv.getBoundingClientRect();
      const now = performance.now();
      for (const p of people) {
        const sx = c.left + p.x;
        if (sx > b.left - 60 && sx < b.right + 60 && Math.random() < 0.7) {
          const towards = sx < (b.left + b.right) / 2 ? 1 : -1;
          p.faceT = towards === p.dir ? 1 : -1;
          p.tiltT = -0.16 * p.faceT;
          p.lookUntil = now + rand(1600, 2600);
          p.nextGlance = p.lookUntil;
          window.setTimeout(() => {
            p.tiltT = 0;
            p.faceT = 1;
          }, p.lookUntil - now);
        }
      }
    };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const c = cv.getBoundingClientRect();
      const x = e.clientX - c.left;
      const y = e.clientY - c.top;
      pointer = x > -100 && x < W + 100 && y > -160 && y < H + 40 ? { x, y } : null;
    };

    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      inView ? start() : stop();
    });
    const ro = new ResizeObserver(() => {
      if (!sheet.complete) return;
      size();
      draw(performance.now());
    });
    const vis = () => (document.hidden ? stop() : start());

    sheet.onload = () => {
      size();
      draw(performance.now());
      cv.style.opacity = "1";
      io.observe(cv);
      ro.observe(cv);
      start();
    };
    sheet.src = asset(SHEET);

    addEventListener("bright:billboard-flip", onFlip);
    addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", vis);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      removeEventListener("bright:billboard-flip", onFlip);
      removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  return <canvas ref={canvas} aria-hidden className={`pointer-events-none opacity-0 transition-opacity duration-1000 ${className}`} />;
}
