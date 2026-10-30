import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { Preloader } from "./components/Preloader";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { Clients } from "./components/Clients";
import { About } from "./components/About";
import { Work } from "./components/Work";
import { Services } from "./components/Services";
import { Process } from "./components/Process";
import { Voices } from "./components/Voices";
import { Faq } from "./components/Faq";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { Cursor } from "./components/Cursor";
import { startSmoothScroll } from "./lib/smooth";

export function App() {
  useEffect(() => startSmoothScroll(), []);
  return (
    <MotionConfig reducedMotion="user">
      <Preloader />
      <a href="#main" className="sr-only z-[90] rounded-full bg-ink px-5 py-3 text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <Clients />
        <About />
        <Work />
        <Services />
        <Process />
        <Voices />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <Cursor />
    </MotionConfig>
  );
}
