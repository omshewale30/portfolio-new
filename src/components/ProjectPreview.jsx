import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProjectPreview = () => {
  const navigate = useNavigate();

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
      featured: true,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[var(--color-bg-base)]" id="projects-preview">
      <div className="section-shell relative z-10">
        <div className="mb-12">
          <p className="eyebrow-label mb-3">// Projects</p>
          <h2 className="font-display mb-4 text-4xl text-[var(--color-text-primary)] max-md:text-3xl">
            Featured Projects
          </h2>
          <p className="max-w-2xl text-lg text-[var(--color-text-muted)] max-md:text-base">
            A glimpse into my innovative solutions spanning AI, web development, and emerging technologies
          </p>
          <div className="divider-warm mt-8 mb-2" />
        </div>

        <div className="mb-14">
          {previewProjects.map((project, index) => (
            <div
              key={project.title}
              className="project-preview-row border-b border-[var(--color-border-muted)] py-6 first:pt-0"
            >
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-mono text-xs tracking-[0.1em] text-[var(--color-primary)]">
                  [{String(index + 1).padStart(2, "0")}]
                </span>
                <span className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">
                  {project.category}
                </span>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-row-hover font-display text-2xl text-[var(--color-text-primary)] max-md:text-xl"
                >
                  {project.title}
                </a>
                <span className="ml-auto font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">
                  {project.year}
                </span>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--color-text-muted)]">
                {project.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="rounded border border-[var(--color-border-subtle)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--color-text-subtle)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

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
