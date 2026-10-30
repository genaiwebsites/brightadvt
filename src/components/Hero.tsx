import { hero } from "../content";
import { Billboard } from "./Billboard";
import { Crowd } from "./Crowd";
import { Button } from "./Button";
import { scrollToHash } from "../lib/smooth";

const v = (o: Record<string, string | number>) => o as React.CSSProperties;
/** One line of news: the new office. */
function OfficeNews() {
  return (
    <a
      href="#contact"
      onClick={(e) => {
        e.preventDefault();
        scrollToHash("#contact");
      }}
      className="fade-in group inline-flex items-center gap-2.5 text-[0.875rem] text-ink-2 transition-colors hover:text-ink"
      style={v({ "--d": "0ms" })}
    >
      <span className="size-1.5 rounded-full bg-red" aria-hidden />
      <span>
        Now open in <span className="font-medium text-ink">Bengaluru</span>
      </span>
      <svg viewBox="0 0 16 16" className="size-3 -translate-x-1 opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-0 group-hover:opacity-100" fill="none" aria-hidden>
        <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </a>
  );
}

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden [--crowd:clamp(140px,20svh,200px)] md:h-[100svh] md:min-h-[600px] md:[--crowd:clamp(190px,28svh,300px)] lg:[--crowd:clamp(180px,30svh,290px)]"
      aria-label="Introduction"
    >
      {/* Street level: a faint ground so the crowd has somewhere to stand. */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-[var(--crowd)] bg-gradient-to-b from-transparent to-paper-2/80" />

      <div className="wrap relative flex flex-1 flex-col pb-[var(--crowd)] pt-24 md:pt-28 lg:pt-[max(6.5rem,13svh)]">
        <div className="relative z-10 lg:max-w-[56%]">
          <OfficeNews />

          <h1 className="display mt-6 text-[clamp(3.4rem,min(8.2vw,13.5svh),8.5rem)] font-[900] leading-[0.86] tracking-[-0.035em] lg:whitespace-nowrap">
            <span className="line-mask">
              <span style={v({ "--i": 0 })}>Advertising</span>
            </span>
            <span className="line-mask">
              <span style={v({ "--i": 1 })}>
                made <span className="ital pr-[0.04em] font-normal">simple</span>
                <span aria-hidden className="ml-[0.02em] inline-block size-[0.17em] rounded-full bg-red align-baseline" />
                <span className="sr-only">.</span>
              </span>
            </span>
          </h1>

          <div className="fade-in mt-6 md:mt-7" style={v({ "--d": "380ms" })}>
            <p className="max-w-[36rem] text-lg leading-snug text-ink-2 md:text-xl">{hero.sub}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 md:mt-7">
              <Button href="#contact" size="lg">Start a campaign</Button>
              <a
                href="#work"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToHash("#work");
                }}
                className="group inline-flex items-center gap-2 text-[0.95rem] font-medium"
              >
                <span className="roll">
                  <span>See the work</span>
                  <span aria-hidden>See the work</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div
        className="fade-in absolute bottom-0 right-[clamp(1rem,3.6vw,3.5rem)] top-[max(25rem,52svh)] flex w-[min(82vw,420px)] md:top-[44svh] md:w-[min(56vw,460px)] lg:top-[max(6.5rem,13svh)] lg:w-[min(40vw,78svh,660px)]"
        style={v({ "--d": "560ms" })}
      >
        <Billboard className="w-full" />
      </div>

      <Crowd className="absolute inset-x-0 bottom-0 z-20 h-[var(--crowd)] w-full" />
    </section>
  );
}
