import { ArrowUpRight } from "lucide-react";

const preferredScrollBehavior = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

export default function JarvisCTA() {
  const handleClick = (event) => {
    const jarvis = document.getElementById("jarvis");
    if (!jarvis) return;

    event.preventDefault();
    jarvis.scrollIntoView({ behavior: preferredScrollBehavior(), block: "start" });
    window.setTimeout(() => document.getElementById("jarvis-input")?.focus({ preventScroll: true }), 400);
  };

  return (
    <section className="bg-[var(--color-bg-base)]" aria-labelledby="jarvis-cta-heading">
      <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-6 sm:p-8">
          <div className="flex max-w-3xl flex-col gap-2">
            <span className="mono-label">{"// skip the keyword wall"}</span>
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
        </div>
      </div>
    </section>
  );
}
