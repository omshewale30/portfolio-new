import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Github, Instagram, Linkedin } from "lucide-react";
import ChatBot from "./ChatBot";
import { EMAIL, LOCATION, socials } from "../data/contact";
import { cardReveal, fadeInUp } from "../utils/animations";

const PROMPTS = [
  "What do we owe the people whose work we automate?",
  "Is a system that explains itself more trustworthy, or only more persuasive?",
  "When does a tool stop extending us and start replacing us?",
  "What should stay slow on purpose?",
  "Can judgment be measured, or only observed?",
];
const ROTATE_MS = 4500;

// Headline, prompt, card, then Jarvis settle in one after another on load.
const heroSequence = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const pad = (n) => String(n).padStart(2, "0");

const Hero = () => {
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
    <section id="about" className="relative">

      <motion.div
        className="relative mx-auto max-w-[var(--container-max)] px-4 pt-24 sm:px-6 lg:px-12 lg:pt-[120px]"
        variants={heroSequence}
        initial="hidden"
        animate="visible"
      >
        {/* Headline and card share a centre line, so neither floats above the other. */}
        <div className="grid items-center gap-10 pb-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
          <div className="flex min-w-0 flex-col gap-[26px]">
            <motion.h1
              variants={fadeInUp}
              className="headline m-0 text-[44px] leading-none text-[var(--color-text-primary)] [text-wrap:balance] sm:text-[60px] xl:text-[76px]"
            >
              Glad you’re here.
              <br />
              <span className="text-[var(--color-text-subtle)]">Let’s question the obvious.</span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="m-0 max-w-[34rem] text-[17px] leading-relaxed text-[var(--color-text-muted)] [text-wrap:pretty] sm:text-lg"
            >
              I’m Om, a builder drawn to AI, philosophy, and the systems that shape how we live. This is where I
              share what I’m making, what I’m learning, and the questions I haven’t answered yet.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex items-baseline gap-3">
              <span className="shrink-0 font-mono text-[13px] text-[var(--color-text-meta)]">
                query://{pad(promptIndex + 1)}
              </span>
              <p className="prompt-stack m-0 grid min-w-0 text-lg tracking-[-0.01em] text-[var(--color-text-muted)] sm:text-xl">
                {PROMPTS.map((prompt, index) => (
                  <span key={prompt} data-active={index === promptIndex} aria-hidden={index !== promptIndex}>
                    {prompt}
                  </span>
                ))}
              </p>
            </motion.div>
          </div>

          {/* Identity card: who, what and where over the portrait; how to reach me underneath.
              Stacked layouts centre it; phones let it fill the column so its edges match the
              headline and the Jarvis panel. */}
          <motion.div
            variants={cardReveal}
            className="w-full max-w-[340px] overflow-hidden rounded-[10px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] max-lg:justify-self-center max-sm:max-w-none"
          >
            {/* Phones take the portrait's own 1938×2361 shape so the full-width card shows the whole
                photo; a fixed height there crops it into a close-up. */}
            <div className="relative h-[360px] max-sm:aspect-[1938/2361] max-sm:h-auto lg:h-[380px]">
              <img
                src="/assets/Hero.webp"
                alt="Portrait of Om Shewale"
                width="1938"
                height="2361"
                fetchPriority="high"
                className="absolute inset-0 h-full w-full object-cover object-[center_18%] [mask-image:linear-gradient(to_bottom,#000_50%,transparent_86%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_50%,transparent_86%)]"
              />
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-[18px]">
                <span className="text-xl text-[var(--color-text-primary)]">Om Shewale</span>
                <span className="text-xs text-[var(--color-text-subtle)]">
                  Applied AI Engineer @ Office of the Chief Financial Officer, UNC Chapel Hill
                </span>
                <span className="font-mono text-[11px] text-[var(--color-text-meta)]">{LOCATION}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 border-t border-[var(--color-border-subtle)] py-1.5 pl-[18px] pr-2">
              <span className="mr-auto min-w-0 select-all truncate font-mono text-[11px] text-[var(--color-text-subtle)]">
                {EMAIL}
              </span>
              <a
                href={socials.linkedin.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="nav-icon-btn shrink-0"
              >
                <Linkedin size={14} aria-hidden="true" />
              </a>
              <a
                href={socials.github.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="nav-icon-btn shrink-0"
              >
                <Github size={14} aria-hidden="true" />
              </a>
              <a
                href={socials.instagram.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="nav-icon-btn shrink-0"
              >
                <Instagram size={14} aria-hidden="true" />
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div variants={fadeInUp} id="jarvis" className="scroll-mt-24 pb-14">
          <ChatBot />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
