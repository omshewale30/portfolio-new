import { MessageCircle } from "lucide-react";

const preferredScrollBehavior = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

export default function JarvisCTA() {
  const handleClick = (event) => {
    const jarvis = document.getElementById("jarvis");
    if (!jarvis) return;

    event.preventDefault();
    jarvis.scrollIntoView({ behavior: preferredScrollBehavior(), block: "start" });
  };

  return (
    <section
      className="bg-[var(--color-bg-base)]"
      aria-labelledby="jarvis-cta-heading"
    >
      <div className="section-shell">
        <div className="surface-card flex items-center justify-between gap-8 overflow-hidden px-8 py-9 max-md:flex-col max-md:items-start max-md:gap-6 max-md:px-6 max-md:py-8">
          <div className="max-w-3xl">
            <p className="eyebrow-label mb-3">{"// Skip the keyword wall"}</p>
            <h2
              id="jarvis-cta-heading"
              className="font-display text-4xl font-normal tracking-[-0.02em] text-[var(--color-text-primary)] max-md:text-3xl"
            >
              Still looking for a skills matrix?
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-[var(--color-text-muted)] max-md:text-base">
              Fair. Ask Jarvis what I build, how I build it, and where I’ve used the tools that matter.
            </p>
          </div>

          <a
            href="#jarvis"
            onClick={handleClick}
            className="btn-primary inline-flex shrink-0 items-center justify-center gap-2 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] max-md:w-full"
          >
            <MessageCircle size={17} aria-hidden="true" />
            Just ask Jarvis
          </a>
        </div>
      </div>
    </section>
  );
}
