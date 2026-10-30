import { Magnetic } from "./Magnetic";
import { scrollToHash } from "../lib/smooth";

type Props = {
  children: string;
  href?: string;
  tone?: "ink" | "paper" | "red";
  size?: "md" | "lg";
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  icon?: boolean;
};

const tones = {
  ink: "bg-ink text-paper",
  paper: "bg-paper text-ink",
  red: "bg-red text-white",
};

/**
 * Pill button. On hover a red disc swells from the leading dot to fill the
 * pill, the label rolls to a fresh copy and the arrow leaves and re-enters.
 */
export function Button({ children, href, tone = "ink", size = "md", type = "button", disabled, onClick, icon = true }: Props) {
  const cls = `group relative isolate inline-flex items-center gap-3 overflow-hidden rounded-full font-medium transition-[opacity] ${
    size === "lg" ? "h-14 pl-6 pr-2 text-base" : "h-11 pl-5 pr-1.5 text-[0.9375rem]"
  } ${tones[tone]} disabled:cursor-progress disabled:opacity-70`;
  const inner = (
    <>
      <span
        aria-hidden
        className={`absolute left-5 top-1/2 -z-10 size-2 -translate-y-1/2 rounded-full transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[60] ${
          tone === "red" ? "bg-ink" : "bg-red"
        } ${size === "lg" ? "left-6" : ""}`}
      />
      <span className="roll pl-4">
        <span>{children}</span>
        <span aria-hidden className="pl-4">{children}</span>
      </span>
      {icon && (
        <span
          className={`relative grid place-items-center overflow-hidden rounded-full ${size === "lg" ? "size-10" : "size-8"} ${
            tone === "paper" ? "bg-ink text-paper" : "bg-paper text-ink"
          }`}
        >
          <svg viewBox="0 0 16 16" className="size-3.5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-[150%] group-hover:-translate-y-[150%]" fill="none" aria-hidden>
            <path d="M4 12L12 4M5.5 4H12v6.5" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          <svg viewBox="0 0 16 16" className="absolute size-3.5 -translate-x-[150%] translate-y-[150%] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-0 group-hover:translate-y-0" fill="none" aria-hidden>
            <path d="M4 12L12 4M5.5 4H12v6.5" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </span>
      )}
    </>
  );

  const el = href ? (
    <a
      href={href}
      className={cls}
      onClick={
        href.startsWith("#")
          ? (e) => {
              e.preventDefault();
              scrollToHash(href);
            }
          : undefined
      }
    >
      {inner}
    </a>
  ) : (
    <button type={type} className={cls} disabled={disabled} onClick={onClick}>
      {inner}
    </button>
  );
  return <Magnetic>{el}</Magnetic>;
}
