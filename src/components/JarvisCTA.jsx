import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { fadeInUp, revealOnView } from "../utils/animations";
import { scrollToJarvis } from "../utils/scroll";

export default function JarvisCTA() {
  const handleClick = (event) => {
    if (scrollToJarvis()) event.preventDefault();
  };

  return (
    <section aria-labelledby="jarvis-cta-heading">
      <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
        <motion.div
          className="flex flex-wrap items-center justify-between gap-6 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-6 sm:p-8"
          variants={fadeInUp}
          {...revealOnView}
        >
          <div className="flex max-w-3xl flex-col gap-2">
            <p className="eyebrow-label eyebrow-pill m-0">Skip the keyword wall</p>
            <h2
              id="jarvis-cta-heading"
              className="headline m-0 text-[28px] leading-tight text-[var(--color-text-primary)] sm:text-[34px]"
            >
              Still looking for a skills matrix?
            </h2>
            <p className="m-0 text-[15px] leading-relaxed text-[var(--color-text-subtle)]">
              Fair. Ask Jarvis what I build, how I build it, and where I’ve used the tools that matter.
            </p>
          </div>

          <a href="#jarvis" onClick={handleClick} className="btn-primary shrink-0 max-sm:w-full">
            Just ask Jarvis
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
