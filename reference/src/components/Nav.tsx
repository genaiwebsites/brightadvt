import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { NavLogo } from "./Logo";
import { Button } from "./Button";
import { contact } from "../content";
import { pauseScroll, resumeScroll, scrollToHash } from "../lib/smooth";
import { asset } from "../lib/media";

const links = [
  { href: "#work", label: "Work" },
  { href: "#services", label: "Services" },
  { href: "#process", label: "Process" },
  { href: "#voices", label: "Clients" },
  { href: "#faq", label: "FAQs" },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function Nav() {
  const { scrollY } = useScroll();
  const [compact, setCompact] = useState(false);
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    setCompact(y > 160);
    setSolid(y > 24);
  });

  useEffect(() => {
    const sections = links
      .map((l) => document.querySelector<HTMLElement>(l.href))
      .filter((s): s is HTMLElement => !!s);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = `#${e.target.id}`;
          if (e.isIntersecting) setActive(id);
          else setActive((cur) => (cur === id ? null : cur));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    pauseScroll();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => {
      resumeScroll();
      removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setOpen(false);
    requestAnimationFrame(() => scrollToHash(href));
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div
          className={`transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
            solid && !open ? "bg-paper/80 shadow-[0_1px_0_var(--color-line)] backdrop-blur-xl" : ""
          }`}
        >
          <nav className="wrap flex h-16 items-center justify-between md:h-[76px]" aria-label="Primary">
            <a href="#top" onClick={(e) => go(e, "#top")} className="-m-2 p-2" aria-label="Bright, back to top">
              <NavLogo compact={compact && !open} className="h-[26px] w-auto overflow-visible md:h-[30px]" />
            </a>

            <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-line bg-paper-3/70 p-1 backdrop-blur-md lg:flex">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={(e) => go(e, l.href)}
                    aria-current={active === l.href ? "true" : undefined}
                    className="group relative flex h-9 items-center rounded-full px-4 text-[0.9rem] text-ink-2 transition-colors duration-300 hover:text-ink aria-[current]:text-ink"
                  >
                    {active === l.href && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-paper-2"
                        transition={{ duration: 0.6, ease }}
                      />
                    )}
                    <span className="roll">
                      <span>{l.label}</span>
                      <span aria-hidden>{l.label}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <Button href="#contact">Let’s talk</Button>
              </div>
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-controls="menu"
                className="relative grid size-11 place-items-center rounded-full bg-ink text-paper lg:hidden"
                aria-label={open ? "Close menu" : "Open menu"}
              >
                <span
                  className={`absolute h-[1.5px] w-4 bg-current transition-transform duration-500 ease-[var(--ease-out-expo)] ${
                    open ? "rotate-45" : "-translate-y-[3px]"
                  }`}
                />
                <span
                  className={`absolute h-[1.5px] w-4 bg-current transition-transform duration-500 ease-[var(--ease-out-expo)] ${
                    open ? "-rotate-45" : "translate-y-[3px]"
                  }`}
                />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu"
            className="fixed inset-0 z-40 flex flex-col bg-paper pt-24 lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="wrap flex-1">
              {[...links, { href: "#contact", label: "Contact" }].map((l, i) => (
                <li key={l.href} className="overflow-hidden border-b border-line">
                  <motion.a
                    href={l.href}
                    onClick={(e) => go(e, l.href)}
                    className="display flex items-center justify-between py-4 text-[clamp(2.25rem,10vw,3.5rem)] leading-none tracking-[-0.03em]"
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, ease, delay: 0.25 + i * 0.05 }}
                  >
                    {l.label}
                    {active === l.href && <span className="size-3 rounded-full bg-red" aria-hidden />}
                  </motion.a>
                </li>
              ))}
            </ul>
            <div className="wrap relative flex items-end justify-between pb-8 text-[0.9375rem]">
              <div className="space-y-1">
                <a href={contact.phoneHref} className="block">{contact.phone}</a>
                <a href={`mailto:${contact.email}`} className="block text-ink-2">{contact.email}</a>
              </div>
              <motion.img
                src={asset("peeps/sitting-11.webp")}
                alt=""
                className="h-36 w-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease, delay: 0.5 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
