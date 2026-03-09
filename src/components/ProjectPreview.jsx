import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { cardReveal, fadeInUp, staggerContainer } from "../utils/animations";

const ProjectPreview = () => {
  const navigate = useNavigate();

  const getAiBadgeClass = (badge) => {
    const key = badge.toLowerCase();
    if (key.includes("gpt-4")) return "ai-badge-gpt4";
    if (key.includes("rag")) return "ai-badge-rag";
    if (key.includes("langchain")) return "ai-badge-langchain";
    if (key.includes("azure")) return "ai-badge-azure";
    if (key.includes("multi-agent")) return "ai-badge-multi-agent";
    return "ai-badge-default";
  };

  const previewProjects = [
    {
      title: "Image to LaTeX",
      category: "Machine Learning",
      year: "2024",
      description:
        "Developed a robust equation-to-LaTeX conversion system combining Optical Character Recognition (OCR) with Natural Language Processing (NLP) to accurately transcribe mathematical expressions. Leveraged Vision Transformers (ViT) for visual feature extraction and decoder LLMs for LaTeX generation, improving performance on low-quality and handwritten equations.",
      tags: ["Machine Learning", "TensorFlow", "OCR", "NLP"],
      link: "https://adminliveunc-my.sharepoint.com/:b:/r/personal/gtbachel_ad_unc_edu/Documents/Attachments/755_Final_Report.pdf?csf=1&web=1&e=X7q1Rs",
      linkText: "Report",
      aiBadges: ["Vision Transformer", "OCR Pipeline"],
      mockupTint: "from-amber-300/30 via-amber-200/10 to-transparent",
      featured: true,
    },
    {
      title: "Career Copilot AI",
      category: "AI Product",
      year: "2025",
      description:
        "Engineered Career Copilot AI, a full-stack intelligent platform providing personalized career advice, resume analysis, and job search assistance. Leveraged React for the frontend and FastAPI with LangChain/OpenAI for backend AI capabilities, featuring an interactive chat interface and Stripe integration for premium services.",
      tags: ["React", "FastAPI", "LangChain", "OpenAI", "Supabase", "Full-Stack", "AI/ML"],
      link: "https://career-copilot-nu.vercel.app/",
      linkText: "Try it out",
      aiBadges: ["GPT-4", "LangChain", "Multi-Agent"],
      mockupTint: "from-emerald-300/30 via-cyan-200/10 to-transparent",
      featured: true,
    },
    {
      title: "Jarvis - RAG Chatbot",
      category: "AI Assistant",
      year: "2025",
      description:
        "Developed Jarvis, a RAG-based chatbot that uses LangChain and OpenAI to provide personalized responses to user queries about me. It uses a vector database to store the data like my resume, projects, github, certifications, linkedin, etc and a chat interface to interact with the bot.",
      tags: ["React", "FastAPI", "LangChain", "OpenAI", "Full-Stack", "AI/ML"],
      link: "https://jarvis-interface.vercel.app/",
      linkText: "Chat with Jarvis",
      aiBadges: ["RAG", "GPT-4", "LangChain"],
      mockupTint: "from-blue-300/30 via-sky-200/10 to-transparent",
      featured: true,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[var(--color-bg-base)]" id="projects-preview">
      <div className="section-shell relative z-10">
        <motion.div
          className="mb-12"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <p className="eyebrow-label mb-3">// Projects</p>
          <h2 className="font-display mb-4 text-4xl text-[var(--color-text-primary)] max-md:text-3xl">
            Featured Projects
          </h2>
          <p className="max-w-2xl text-lg text-[var(--color-text-muted)] max-md:text-base">
            Spotlighting AI-first products with modern stacks, production workflows, and measurable impact.
          </p>
          <div className="divider-warm mt-8 mb-2" />
        </motion.div>

        <motion.div
          className="mb-14 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {previewProjects.map((project, index) => (
            <motion.div
              key={project.title}
              className="project-spotlight-card group flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]"
              variants={cardReveal}
            >
              <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${project.mockupTint}`}>
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(12,10,8,0.05),rgba(12,10,8,0.75))]" />
                <div className="absolute left-4 top-4 rounded border border-[var(--color-border-subtle)] bg-[rgba(14,11,8,0.55)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-primary)]">
                  [{String(index + 1).padStart(2, "0")}]
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-subtle)]">
                    {project.category}
                  </p>
                  <h3 className="font-display mt-1 text-2xl leading-tight text-[var(--color-text-primary)]">
                    {project.title}
                  </h3>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {project.aiBadges.map((badge) => (
                    <span key={badge} className={`ai-badge ${getAiBadgeClass(badge)}`}>
                      {badge}
                    </span>
                  ))}
                </div>

                <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {project.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-[var(--color-border-subtle)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--color-text-subtle)]"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 4 && (
                    <span className="rounded border border-[var(--color-border-subtle)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--color-text-meta)]">
                      +{project.tags.length - 4}
                    </span>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">
                    {project.year}
                  </span>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono inline-flex items-center gap-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-4 py-2 text-xs uppercase tracking-[0.08em] text-[var(--color-primary)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-bg-base)]"
                  >
                    {project.linkText}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="btn-primary inline-flex items-center gap-2"
            onClick={() => {
              navigate('/projects');
              setTimeout(() => {
                const projectsSection = document.getElementById('projects');
                if (projectsSection) {
                  const navbarHeight = document.querySelector(".navbar")?.offsetHeight || 80;
                  const scrollPosition = projectsSection.offsetTop - navbarHeight;
                  window.scrollTo({ top: scrollPosition, behavior: "smooth" });
                }
              }, 100);
            }}
          >
            See More Projects
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <a
            href="https://github.com/omshewale30"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            View GitHub
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProjectPreview;
