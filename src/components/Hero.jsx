import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Github, Instagram, Linkedin, MapPin } from "lucide-react";
import ScheduleCallButton from "./ScheduleCallButton";
import ChatBot from "./ChatBot";

const TOKEN_PHRASES = [
  "solving business problems with AI",
  "designing intelligent systems with neural networks",
  "building AI agents for real-world workflows",
  "shipping full-stack AI products",
];

const Hero = () => {
  const navigate = useNavigate();
  const [tokenText, setTokenText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    const phrase = TOKEN_PHRASES[phraseIndex % TOKEN_PHRASES.length];
    const speed = isDeleting ? 18 : 30;

    const timer = window.setTimeout(() => {
      if (!isDeleting) {
        const next = phrase.slice(0, tokenText.length + 1);
        setTokenText(next);
        if (next === phrase) {
          window.setTimeout(() => setIsDeleting(true), 900);
        }
      } else {
        const next = phrase.slice(0, Math.max(0, tokenText.length - 1));
        setTokenText(next);
        if (next.length === 0) {
          setIsDeleting(false);
          setPhraseIndex((prev) => prev + 1);
        }
      }
    }, speed);

    return () => window.clearTimeout(timer);
  }, [tokenText, isDeleting, phraseIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext("2d");
    if (!context) return undefined;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame;
    let nodes = [];

    const createNodes = (width, height) => {
      const count = Math.max(30, Math.min(80, Math.floor((width * height) / 26000)));
      return Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        pulse: Math.random() * Math.PI * 2,
      }));
    };

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = createNodes(width, height);
    };

    const drawFrame = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      context.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.02;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        const radius = 1.3 + Math.sin(node.pulse) * 0.4;
        context.beginPath();
        context.arc(node.x, node.y, radius, 0, Math.PI * 2);
        context.fillStyle = "rgba(200, 168, 130, 0.75)";
        context.fill();
      }

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.hypot(dx, dy);
          const maxDistance = 145;
          if (distance < maxDistance) {
            const alpha = (1 - distance / maxDistance) * 0.22;
            context.beginPath();
            context.moveTo(nodes[i].x, nodes[i].y);
            context.lineTo(nodes[j].x, nodes[j].y);
            context.strokeStyle = `rgba(200, 168, 130, ${alpha})`;
            context.lineWidth = 1;
            context.stroke();
          }
        }
      }

      if (!reducedMotionQuery.matches) {
        animationFrame = window.requestAnimationFrame(drawFrame);
      }
    };

    const handleResize = () => {
      resizeCanvas();
      if (reducedMotionQuery.matches) drawFrame();
    };

    resizeCanvas();
    drawFrame();

    window.addEventListener("resize", handleResize);
    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const goToProjects = () => {
    navigate("/projects");
  };

  return (
    <section id="about" className="relative min-h-screen overflow-hidden bg-[var(--color-bg-base)]">
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 opacity-90" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(200,168,130,0.12),transparent_50%),radial-gradient(circle_at_80%_75%,rgba(184,140,94,0.14),transparent_50%)]" />

      {/* ── Two-column shell ── */}
      <div className="section-shell relative z-10 flex min-h-screen items-center py-28 max-md:py-24">
        <div className="flex w-full items-center gap-12 max-lg:gap-8 max-md:flex-col max-md:gap-10">

          {/* ── LEFT COLUMN (60%) ── */}
          <div className="flex flex-1 flex-col max-md:w-full gap-4">

            {/* Headline */}
            <h1 className="font-display text-5xl leading-[1.06] tracking-[-0.025em] text-[var(--color-text-primary)] md:text-6xl lg:text-7xl">
              Building intelligent systems.
              <br />
              <span className="text-[var(--color-primary)]">Not just LLM wrappers.</span>
            </h1>

            {/* Subline */}
            <p className="mt-6 max-w-xl text-lg leading-[1.7] text-[var(--color-text-muted)] md:text-xl">
              Applied AI engineer focused on LLM products, agentic workflows, and high-impact software that solves
              meaningful business problems.
            </p>

            {/* Terminal-style AI Chat */}
            <div className="mt-10 w-full max-w-xl">
              <ChatBot terminal />
            </div>


            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <button type="button" className="btn-primary" onClick={goToProjects}>
                View Projects
              </button>
              <a href="/Docs/Om_Shewale.pdf" download className="btn-ghost">
                Download Resume
              </a>
            </div>


          </div>

          {/* ── RIGHT COLUMN — About Card (40%) ── */}
          <div className="w-[38%] flex-shrink-0 max-lg:w-[42%] max-md:w-full max-md:max-w-sm max-md:self-center">
            <div className="overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[rgba(30,24,16,0.82)] shadow-[0_24px_64px_rgba(0,0,0,0.45)] backdrop-blur-sm">

              {/* Photo — bleeds to all edges, no padding */}
              <div className="relative h-[340px] w-full overflow-hidden lg:h-[400px]">
                <img
                  src="/assets/Hero.jpeg"
                  alt="Om Shewale"
                  className="h-full w-full object-cover object-[center_top] transition-transform duration-700 hover:scale-[1.03]"
                />
                {/* Subtle gradient fade at the bottom so it merges into the card info */}
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[rgba(22,18,13,0.92)] to-transparent" />
              </div>

              {/* Info strip */}
              <div className="px-6 pb-6 pt-4">
                {/* Thin amber accent line */}
                <div className="mb-4 h-px w-10 bg-[var(--color-primary)]" />

                <p className="font-display text-2xl leading-tight text-[var(--color-text-primary)]">
                  Om Shewale
                </p>
                <p className="mt-1 font-mono text-xs uppercase tracking-[0.1em] text-[var(--color-primary)]">
                  Applied AI
                </p>

                <div className="mt-4 flex items-center gap-2 text-[var(--color-text-subtle)]">
                  <MapPin size={13} className="flex-shrink-0 text-[var(--color-primary)] opacity-70" />
                  <span className="font-mono text-xs tracking-[0.06em]">United States</span>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <a
                    href="https://github.com/omshewale30"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-border-muted)] text-[var(--color-text-subtle)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    <Github size={16} />
                  </a>
                  <a
                    href="https://instagram.com/omshewale3000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-border-muted)] text-[var(--color-text-subtle)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    <Instagram size={16} />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/omshewale/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-border-muted)] text-[var(--color-text-subtle)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    <Linkedin size={16} />
                  </a>
                  <ScheduleCallButton inline />
                </div>
                

                {/* Availability pill */}
                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-subtle)] bg-[rgba(200,168,130,0.06)] px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.7)" }} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-meta)]">
                    Building
                  </span>
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