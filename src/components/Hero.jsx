import { useNavigate } from "react-router-dom";
import { Github, Instagram, Linkedin, Mail, MapPin } from "lucide-react";
import ChatBot from "./ChatBot";

const Hero = () => {
  const navigate = useNavigate();

  const goToSelectedWork = () => {
    document.getElementById("selected-work")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="about" className="relative min-h-screen overflow-hidden">
      {/* ── Two-column shell ── */}
      <div className="section-shell relative z-10 flex min-h-screen items-center py-20 max-md:py-20">
        <div className="flex w-full min-w-0 items-center gap-8 max-lg:gap-6 max-md:flex-col max-md:gap-8">

          {/* ── LEFT COLUMN (60%) ── */}
          <div className="flex min-w-0 flex-1 flex-col max-md:w-full max-md:max-w-xl">

            {/* Headline */}
            <p className="eyebrow-label mb-1">{"// Curiosity, systems, and the human question"}</p>
            <h1 className="font-display break-words text-5xl font-normal leading-[1.06] tracking-[-0.025em] text-[var(--color-text-primary)] md:text-5xl lg:text-6xl xl:text-7xl">
              Glad you’re here.
              <br />
              Let’s <span className="pencil-underline">question the obvious.</span>
            </h1>

            {/* Subline */}
            <p className="mt-4 max-w-xl text-lg leading-[1.65] text-[var(--color-text-muted)] md:text-xl">
              I’m Om, a builder drawn to AI, philosophy, and the systems that shape how we live. This is where I
              share what I’m making, what I’m learning, and the questions I haven’t answered yet.
            </p>

            {/* Terminal-style AI Chat */}
            <div id="jarvis" className="mt-7 w-full min-w-0 max-w-xl scroll-mt-28 overflow-hidden rounded-xl">
              <div className="mb-3">
                <p className="pencil-note text-lg leading-snug">
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

          {/* ── RIGHT COLUMN — Fig. 0 print and contact card (40%) ── */}
          <div className="min-w-0 w-[38%] flex-shrink-0 max-lg:w-[42%] max-md:w-full max-md:max-w-sm max-md:self-center">
            <figure className="m-0 flex w-full flex-col gap-4">
              {/* Photo — a print taped into the notebook */}
              <div className="taped-print">
                <img
                  src="/assets/Hero.webp"
                  alt="Portrait of Om Shewale"
                  width="1938"
                  height="2361"
                  className="block aspect-[4/5] max-h-[380px] w-full object-cover object-[center_18%]"
                />
              </div>
              <figcaption className="font-mono text-xs uppercase leading-relaxed tracking-[0.06em] text-[var(--color-text-meta)]">
                Fig. 0 — The author.
              </figcaption>

              {/* Contact card */}
              <div className="flex flex-col gap-3 border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-5 py-4">
                <div>
                  <p className="m-0 font-display text-2xl leading-tight text-[var(--color-text-primary)]">
                    Om Shewale
                  </p>
                  <p className="m-0 mt-1 font-mono text-xs uppercase tracking-[0.1em] text-[var(--color-primary)]">
                    Applied AI Engineer · AI Strategy
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[var(--color-text-meta)]">
                  <MapPin size={13} className="flex-shrink-0 text-[var(--color-primary)]" />
                  <span className="font-mono text-xs uppercase tracking-[0.06em]">United States</span>
                </div>

                <span className="flex select-all items-center gap-2 font-mono text-xs tracking-[0.04em] text-[var(--color-text-primary)]">
                  <Mail size={13} className="flex-shrink-0 text-[var(--color-primary)]" />
                  omshewale030@gmail.com
                </span>

                <div className="flex flex-wrap items-center gap-2 border-t border-dashed border-[var(--color-border-subtle)] pt-3">
                  <a
                    href="https://github.com/omshewale30"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub profile"
                    className="flex h-11 w-11 items-center justify-center border border-[var(--color-border-strong)] text-[var(--color-text-primary)] transition-colors duration-300 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    <Github size={17} />
                  </a>
                  <a
                    href="https://instagram.com/omshewale3000"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram profile"
                    className="flex h-11 w-11 items-center justify-center border border-[var(--color-border-strong)] text-[var(--color-text-primary)] transition-colors duration-300 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    <Instagram size={17} />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/omshewale/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn profile"
                    className="flex h-11 w-11 items-center justify-center border border-[var(--color-border-strong)] text-[var(--color-text-primary)] transition-colors duration-300 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    <Linkedin size={17} />
                  </a>
                </div>
              </div>
            </figure>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
