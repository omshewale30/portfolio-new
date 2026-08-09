import { useNavigate } from "react-router-dom";
import { Github, Instagram, Linkedin, MapPin } from "lucide-react";
import ScheduleCallButton from "./ScheduleCallButton";
import ChatBot from "./ChatBot";

const Hero = () => {
  const navigate = useNavigate();

  const goToSelectedWork = () => {
    document.getElementById("selected-work")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="about" className="relative min-h-screen overflow-hidden bg-[var(--color-bg-base)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(200,168,130,0.12),transparent_50%),radial-gradient(circle_at_80%_75%,rgba(184,140,94,0.14),transparent_50%)]" />

      {/* ── Two-column shell ── */}
      <div className="section-shell relative z-10 flex min-h-screen items-center py-20 max-md:py-20">
        <div className="flex w-full min-w-0 items-center gap-8 max-lg:gap-6 max-md:flex-col max-md:gap-8">

          {/* ── LEFT COLUMN (60%) ── */}
          <div className="flex min-w-0 flex-1 flex-col max-md:w-full max-md:max-w-xl">

            {/* Headline */}
            <p className="eyebrow-label mb-1">{"// Curiosity, systems, and the human question"}</p>
            <h1 className="font-display break-words text-5xl leading-[1.06] tracking-[-0.025em] text-[var(--color-text-primary)] md:text-5xl lg:text-6xl xl:text-7xl">
              Glad you’re here.
              <br />
              <span className="text-[var(--color-primary)]">Let’s question the obvious.</span>
            </h1>

            {/* Subline */}
            <p className="mt-4 max-w-xl text-lg leading-[1.65] text-[var(--color-text-muted)] md:text-xl">
              I’m Om, a builder drawn to AI, philosophy, and the systems that shape how we live. This is where I
              share what I’m making, what I’m learning, and the questions I haven’t answered yet.
            </p>

            {/* Terminal-style AI Chat */}
            <div id="jarvis" className="mt-7 w-full min-w-0 max-w-xl scroll-mt-28 overflow-hidden rounded-xl">
              <div className="mb-3">
                <p className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-primary)]">
                  A small experiment
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-subtle)]">
                  Ask Jarvis what I’m building or thinking about, and see how it arrives at an answer.
                </p>
              </div>
              <ChatBot terminal />
            </div>


            {/* CTAs */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button type="button" className="btn-primary" onClick={goToSelectedWork}>
                See what I’m building
              </button>
              <button type="button" className="btn-ghost" onClick={() => navigate("/projects")}>
                Browse all projects
              </button>
            </div>


          </div>

          {/* ── RIGHT COLUMN — About Card (40%) ── */}
          <div className="min-w-0 w-[38%] flex-shrink-0 max-lg:w-[42%] max-md:w-full max-md:max-w-sm max-md:self-center">
            <div className="w-full overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-glass-strong)]">

              {/* Photo — bleeds to all edges, no padding */}
              <div className="relative h-[320px] w-full overflow-hidden lg:h-[360px]">
                <img
                  src="/assets/Hero.webp"
                  alt="Portrait of Om Shewale"
                  width="1938"
                  height="2361"
                  className="h-full w-full object-cover object-[center_18%] transition-transform duration-700 hover:scale-[1.03]"
                />
                {/* Subtle gradient fade at the bottom so it merges into the card info */}
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--color-bg-surface)] to-transparent" />
              </div>

              {/* Info strip */}
              <div className="px-5 pb-5 pt-4 sm:px-6">
                {/* Thin amber accent line */}
                <div className="mb-4 h-px w-10 bg-[var(--color-primary)]" />

                <p className="font-display text-2xl leading-tight text-[var(--color-text-primary)]">
                  Om Shewale
                </p>
                <p className="mt-1 font-mono text-xs uppercase tracking-[0.1em] text-[var(--color-primary)]">
                  Applied AI Engineer · AI Strategy
                </p>

                <div className="mt-4 flex items-center gap-2 text-[var(--color-text-subtle)]">
                  <MapPin size={13} className="flex-shrink-0 text-[var(--color-primary)] opacity-70" />
                  <span className="font-mono text-xs tracking-[0.06em]">United States</span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <a
                    href="https://github.com/omshewale30"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub profile"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-border-muted)] text-[var(--color-text-subtle)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    <Github size={16} />
                  </a>
                  <a
                    href="https://instagram.com/omshewale3000"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram profile"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-border-muted)] text-[var(--color-text-subtle)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    <Instagram size={16} />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/omshewale/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn profile"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-border-muted)] text-[var(--color-text-subtle)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    <Linkedin size={16} />
                  </a>
                  <ScheduleCallButton inline />
                </div>
                


              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
