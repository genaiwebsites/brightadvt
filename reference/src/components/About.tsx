import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";
import { Manifesto } from "./Manifesto";
import { facts, reasons } from "../content";
import { useReveal } from "../lib/useReveal";
import { IconBillboard, IconChannels, IconNewspaper, IconPen, IconRupee } from "./Icons";

function Count({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const [v, setV] = useState(to);
  useEffect(() => {
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) setV(0);
  }, []);
  useEffect(() => {
    if (!inView || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = animate(0, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, to]);
  return (
    <span ref={ref} className="tabular-nums">
      {v.toLocaleString("en-IN")}
      <span className="text-red">{suffix}</span>
    </span>
  );
}

const reasonIcons = [IconRupee, IconChannels, IconPen];
const factIcons = [IconNewspaper, IconBillboard, IconPen, IconChannels];

export function About() {
  const stats = useReveal<HTMLDivElement>();
  const why = useReveal<HTMLDivElement>();

  return (
    <section id="about" className="py-28 md:py-40" aria-label="About Bright">
      <div className="wrap">
        <Manifesto />

        <div ref={stats} className="mt-20 grid grid-cols-2 border-t border-line md:mt-28 lg:grid-cols-4">
          {facts.map((f, i) => {
            const Icon = factIcons[i];
            return (
              <div
                key={f.text}
                className="reveal group relative border-b border-line py-8 pr-6 even:border-l even:pl-6 lg:border-b-0 lg:border-l lg:pl-8 lg:first:border-l-0 lg:first:pl-0"
                style={{ "--d": `${i * 90}ms` } as React.CSSProperties}
              >
                <Icon className="size-7 text-ink-3 transition-colors duration-500 group-hover:text-red" />
                <p className="display mt-8 text-[clamp(3rem,6.4vw,6rem)] font-[800] leading-none tracking-[-0.04em]">
                  <Count to={f.value} suffix={f.suffix} />
                </p>
                <p className="mt-3 text-[0.95rem] text-ink-2">{f.text}</p>
              </div>
            );
          })}
        </div>

        <div ref={why} className="mt-24 grid gap-12 md:mt-32 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <h2 className="reveal display text-h3 font-[800]">
              Good-bye to traditional advertising <span className="ital font-normal">hassle</span>.
            </h2>
            <p className="reveal mt-4 text-ink-2" style={{ "--d": "80ms" } as React.CSSProperties}>
              Here’s why you should choose us.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-3 md:col-span-8">
            {reasons.map((r, i) => {
              const Icon = reasonIcons[i];
              return (
                <li
                  key={r.title}
                  className="reveal group relative overflow-hidden rounded-[20px] border border-line bg-paper-3 p-6 transition-[transform,box-shadow] duration-700 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgb(18_17_16/0.35)] md:p-7"
                  style={{ "--d": `${120 + i * 90}ms` } as React.CSSProperties}
                >
                  <span className="grid size-12 place-items-center rounded-full bg-paper-2 text-ink transition-colors duration-500 group-hover:bg-red group-hover:text-white">
                    <Icon className="size-6 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:rotate-[-8deg] group-hover:scale-110" />
                  </span>
                  <h3 className="display mt-10 text-[1.375rem] font-[700] leading-tight tracking-[-0.01em]">{r.title}</h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-2">
                    {r.before}
                    <strong className="font-medium text-ink">{r.mark}</strong>
                    {r.after}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
