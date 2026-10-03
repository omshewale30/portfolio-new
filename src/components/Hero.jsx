import { useEffect, useRef, useState } from "react";
import ChatBot from "./ChatBot";
import ParticleField from "./ParticleField";

const PROMPTS = [
  "What do we owe the people whose work we automate?",
  "Is a system that explains itself more trustworthy, or only more persuasive?",
  "When does a tool stop extending us and start replacing us?",
  "What should stay slow on purpose?",
  "Can judgment be measured, or only observed?",
];
const ROTATE_MS = 4500;

const pad = (n) => String(n).padStart(2, "0");

const Hero = () => {
  const heroRef = useRef(null);
  const [promptIndex, setPromptIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const interval = window.setInterval(
      () => setPromptIndex((index) => (index + 1) % PROMPTS.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section id="about" ref={heroRef} className="relative overflow-hidden bg-[var(--color-bg-base)]">
      <ParticleField hostRef={heroRef} />

      <div className="relative mx-auto max-w-[var(--container-max)] px-4 pt-24 sm:px-6 lg:px-12 lg:pt-[120px]">
        <div className="grid items-end gap-10 pb-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
          <div className="flex min-w-0 flex-col gap-[26px]">
            <span className="flex items-center gap-2.5 text-xs text-[var(--color-text-subtle)]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--color-text-meta)]" />
              Applied AI Engineer · Chapel Hill, NC
            </span>
            <h1 className="headline m-0 text-[44px] leading-none text-[var(--color-text-primary)] [text-wrap:balance] sm:text-[60px] xl:text-[76px]">
              I build AI systems,
              <br />
              then ask what
              <br />
              they&apos;re <span className="rubric">for</span>.
            </h1>
            <div className="flex items-baseline gap-3">
              <span className="shrink-0 font-mono text-[13px] text-[var(--color-text-meta)]">
                query://{pad(promptIndex + 1)}
              </span>
              <p
                key={promptIndex}
                className="prompt-fade m-0 min-h-7 text-lg tracking-[-0.01em] text-[var(--color-text-muted)] sm:text-xl"
                aria-live="off"
              >
                {PROMPTS[promptIndex]}
              </p>
            </div>
          </div>

          <div className="relative h-[360px] w-full max-w-[340px] overflow-hidden rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] max-lg:justify-self-start lg:h-[420px]">
            <img
              src="/assets/Hero.webp"
              alt="Portrait of Om Shewale"
              width="1938"
              height="2361"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover object-[center_18%] [mask-image:linear-gradient(to_bottom,#000_58%,transparent_92%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_58%,transparent_92%)]"
            />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-[18px]">
              <span className="text-xl text-[var(--color-text-primary)]">Om Shewale</span>
              <span className="text-xs text-[var(--color-text-subtle)]">AI strategy · UNC Finance &amp; Operations</span>
            </div>
          </div>
        </div>

        <div id="jarvis" className="scroll-mt-24 pb-14">
          <ChatBot />
        </div>
      </div>
    </section>
  );
};

export default Hero;
