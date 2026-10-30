import { PreloaderLogo } from "./Logo";

/** First visit only (see the inline script in index.html). Pure CSS, removes itself. */
export function Preloader() {
  return (
    <div className="preloader pointer-events-none fixed inset-0 z-[100] place-items-center bg-paper" aria-hidden>
      <PreloaderLogo className="w-[min(62vw,560px)] overflow-visible text-ink" />
    </div>
  );
}
