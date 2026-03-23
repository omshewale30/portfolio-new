"use client"
import { motion } from "framer-motion"
import { cardReveal, fadeInUp, staggerContainer } from "../utils/animations"

const ProjectsSection = () => {
  const getAiBadgeClass = (badge) => {
    const key = badge.toLowerCase()
    if (key.includes("gpt-4")) return "ai-badge-gpt4"
    if (key.includes("rag")) return "ai-badge-rag"
    if (key.includes("langchain")) return "ai-badge-langchain"
    if (key.includes("azure")) return "ai-badge-azure"
    if (key.includes("multi-agent")) return "ai-badge-multi-agent"
    return "ai-badge-default"
  }

  const projects = [
    {
      title: "Redesign, dont Redecorate: Agentic AI in Enterprise Workflows",
      description:
        "Authored a comprehensive systems research paper advised by Dr. Danielle Szafir evaluating human-in-the-loop (HITL) Agentic AI architectures in high-stakes enterprise workflows. Evaluated two production-grade platforms (Charlotte and Heelper) to demonstrate how domain-specific grounding reduces cognitive load. Developed a quantitative framework linking automated task elimination to measurable organizational ROI.",
      tags: ["Research", "HCI", "System Architecture", "Enterprise Tech"],
      aiBadges: ["Agentic AI", "HITL", "Multi-Agent"],
      link: "#", // Replace with actual link when published
      linkText: "COMING SOON",
      featured: true,
    },
    {
      title: "Charlotte - Enterprise AI Platform",
      description:
        "Engineered and deployed a production RAG-based AI system serving the UNC Cashier's Office, Campus Health, and Accounting. Managed the full lifecycle from UNC ITS compliance review to Azure deployment. The system securely queries EDI reports and transaction data, eliminating over 200 manual hours per year of data searches.",
      tags: ["Python", "Azure", "Vector Database", "Data Governance"],
      aiBadges: ["Enterprise AI", "RAG", "Azure OpenAI"],
      link: "https://charlotte-frontend.azurewebsites.net/",
      linkText: "Try it out",
      featured: true,
    },
    {
      title: "Heelper - AI Email Assistant",
      description:
        "Developed an Agentic AI email assistant designed for the UNC Cashier's office to manage and triage high-volume inbound communications. Built with a Python automation backend to intelligently route, classify, and draft contextual responses, significantly reducing manual triage time and streamlining administrative workflows.",
      tags: ["Python", "Automation", "Workflow Integration", "API"],
      aiBadges: ["Agentic AI", "LLM Orchestration"],
      link: "https://heelper-frontend.nicedesert-a13116bc.eastus.azurecontainerapps.io/", // Add GitHub or demo link if available
      linkText: "View Project",
      featured: true,
    },
    {
      title: "Image to LaTeX",
      description:
        "Developed a robust equation-to-LaTeX conversion system combining Optical Character Recognition (OCR) with Natural Language Processing (NLP) to accurately transcribe mathematical expressions. Leveraged Vision Transformers (ViT) for visual feature extraction and decoder LLMs for LaTeX generation, improving performance on low-quality and handwritten equations.",
      tags: ["Machine Learning", "TensorFlow", "OCR", "NLP"],
      aiBadges: ["Vision Transformer", "OCR Pipeline"],
      link: "https://drive.google.com/file/d/1P_J3Q39MPd2p6FeERYnNe4iStTSxlRQC/view?usp=sharing",
      linkText: "Report",
      featured: true,
    },
    {
      title: "Career Copilot AI",
      description:
        "Engineered Career Copilot AI, a full-stack intelligent platform providing personalized career advice, resume analysis, and job search assistance. Leveraged React for the frontend and FastAPI with LangChain/OpenAI for backend AI capabilities, featuring an interactive chat interface and Stripe integration for premium services.",
      tags: ["React", "FastAPI", "LangChain", "OpenAI", "Supabase", "Full-Stack", "AI/ML"],
      aiBadges: ["GPT-4", "LangChain", "Multi-Agent"],
      link: "https://career-copilot-nu.vercel.app/",
      linkText: "Try it out",
      featured: true,
    },
    {
      title: "Jarvis - RAG Chatbot",
      description:
        "Developed Jarvis, a RAG-based chatbot that uses LangChain and OpenAI to provide personalized responses to user queries about me. It uses a vector database to store the data like my resume, projects, github, certifications, linkedin, etc and a chat interface to interact with the bot.",
      tags: ["React", "FastAPI", "LangChain", "OpenAI", "Full-Stack", "AI/ML"],
      aiBadges: ["RAG", "GPT-4", "LangChain"],
      link: "https://jarvis-interface.vercel.app/",
      linkText: "Chat with Jarvis",
      featured: true,
    },
    {
      title: "TaskFlow AI",
      description:
        "Developed TaskFlow AI, a full-stack intelligent platform providing personalized task management, scheduling, and productivity tips. Leveraged Next.js for the frontend and FastAPI with LangChain/OpenAI for backend AI capabilities",
      tags: ["Next.js", "FastAPI", "LangChain", "OpenAI", "Supabase", "Full-Stack", "AI/ML"],
      aiBadges: ["GPT-4", "LangChain"],
      link: "https://taskflow-ai-rose.vercel.app/",
      linkText: "Try it out",
      featured: true,
    },
    {
      title: "Facial Recognition",
      description:
        "This application utilizes a Siamese network to perform facial verification based on L1Distance. The Siamese network architecture is designed for finding the similarity between two comparable things, in this case, facial images. This project implements a facial verification system that can determine if two given images are of the same person.",
      tags: ["Machine Learning", "Python", "OpenCV", "Computer Vision"],
      link: "https://github.com/omshewale30/facial-recognition",
      linkText: "GitHub",
    },
    {
      title: "NASA Psyche Mission",
      description:
        "Led the development of a web-based Unity game designed to promote awareness of the NASA Psyche mission. Worked within a five-member team, crafting a realistic space environment using authentic NASA-provided data. Delivered the project ahead of schedule, receiving overwhelmingly positive feedback from NASA sponsors for its engaging design and educational impact.",
      tags: ["React", "Bootstrap", "API"],
      link: "https://missiontopsyche.github.io/tungsten_12e_web_game/",
      linkText: "Try it out",
    },
    {
      title: "PharmAlliance Clinical Escape Room",
      description:
        "Leading the development of a web-based 2D escape room game designed to enhance clinical education. The game, set in a virtual exam room, engages players with interactive puzzles focused on pharmacist decision-making. Built using Dart and Flutter, the project includes an authoring tool that enables faculty to customize scenarios, ensuring scalable and adaptable learning experiences. Initially tailored for diabetes care and pharmacist prescribing, this platform aims to revolutionize clinical training across institutions.",
      tags: ["Dart", "Flutter", "Game Development", "Education Technology"],
      link: "https://yashas-hm-unc.github.io/illness-lab-website/",
      linkText: "Try it out",
    },
    {
      title: "PumpPal - Macro Tracking App 🍎",
      description:
        "PumpPal is a sleek and intuitive iOS app designed to help users track macronutrient intake and achieve their fitness goals. Built with Swift and SwiftUI, 🚀",
      tags: ["Swift", "SwiftUI", "CoreML", "MapKit", "Mobile App Development"],
      link: "https://github.com/omshewale30/PumpPal",
      linkText: "GitHub",
    },
    {
      title: "SynapseMD - AI Medical Assistant",
      description:
        "Developed a web-based AI medical assistant to provide personalized health assessments based on user-input symptoms and biographical data. Leveraging Google's MedPaLM model which is fine tuned on health data, the app delivers structured diagnoses with probable causes and actionable advice through an intuitive interface. Built with Vite, React, and shadcn/ui, it features interactive components like accordions and tabs for result exploration, aiming to enhance user understanding of health conditions while emphasizing professional consultation.",
      tags: ["Vite", "React", "LLM", "tailwind", "Healthcare"],
      aiBadges: ["MedPaLM", "LLM"],
      link: "https://synapsemd.vercel.app/",
      linkText: "Explore the App",
    },
    {
      title: "smArtbIte",
      description:
        "Developed an AI-powered web application to generate healthy recipes from user-provided ingredients or fridge images. Built a React frontend with Chakra UI and an Express backend leveraging Google Cloud's Vertex AI for text and image recognition. Implemented features like dietary restriction filters, image previews, and step-by-step recipe displays, delivering a user-friendly tool for personalized cooking.",
      tags: ["React", "Chakra UI", "Express", "Google Cloud Vertex AI"],
      aiBadges: ["Vertex AI", "Computer Vision"],
      link: "https://smartbite.vercel.app/",
      linkText: "Try it out",
    },
    {
      title: "Game Application for Mental Health Patients",
      description:
        "Led the development of 5 diverse games in Unity, specifically designed to enhance fine motor skills for mental health patients. Implemented an interactive user interface, resulting in improved accessibility and ease of navigation for patients. Received positive feedback from users, with a measured increase in fine motor skill improvement among patients.",
      tags: ["Unity", "Game Development", "UI/UX Design", "C#"]
    },
    {
      title: "Shopping Web Application",
      description:
        "Led a team of 5 in developing a full-stack shopping application in Java, similar to Amazon.com. Implemented a robust database system to manage customer information and correlate it with order numbers, improving data retrieval processes. Leveraged SQL and GUI features to create a highly user-oriented and intuitive shopping experience.",
      tags: ["Java", "JavaFX", "SQL", "HTML", "CSS", "Full-Stack Development"],
      link: "https://github.com/aroth6/shopping-app",
      linkText: "View Project",
    },
  ]

  return (
    <section
      id="projects"
      className="relative overflow-hidden bg-[var(--color-bg-base)]"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(200, 168, 130, 0.08) 0%, transparent 44%), radial-gradient(circle at 80% 76%, rgba(200, 168, 130, 0.06) 0%, transparent 46%), radial-gradient(circle at 45% 56%, rgba(200, 168, 130, 0.04) 0%, transparent 52%)",
        }}
      />

      <div className="section-shell relative z-10">
        <motion.div
          className="text-center"
          style={{ marginBottom: "1.25rem" }}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <p className="eyebrow-label mb-3">// Projects</p>
          <h2 className="font-display mb-4 text-4xl italic tracking-tight text-[var(--color-text-primary)] sm:text-5xl md:text-6xl">
            What I've Built
          </h2>
            <div 
          className="divider-warm mb-12"
          style={{ 
            width: "100%", 
            maxWidth: "48rem", 
            margin: "0 auto 1.25rem auto",
            display: "block"
          }}
          />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {projects.map((project) => (
            <motion.div
              key={project.title}
              className={`project-spotlight-card group relative overflow-hidden rounded-3xl border p-6 shadow-[var(--shadow-glass)] transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--color-bg-elevated)] md:p-8 ${
                project.featured
                  ? "border-[var(--color-border-focus)] bg-[var(--color-bg-surface)]"
                  : "border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]"
              }`}
              variants={cardReveal}
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-[var(--color-primary)] ${project.featured ? "opacity-100" : "opacity-0 transition-opacity duration-300 group-hover:opacity-100"}`} />
              <div className="relative z-[1]">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="font-display flex-1 text-2xl leading-snug text-[var(--color-text-primary)]">{project.title}</h3>
                  {project.featured && (
                    <span className="font-mono inline-flex w-fit shrink-0 rounded-xl border border-[var(--color-border-subtle)] bg-[rgba(200,168,130,0.12)] px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-primary)]">
                      Featured
                    </span>
                  )}
                </div>

                {project.aiBadges?.length ? (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {project.aiBadges.map((badge) => (
                      <span key={`${project.title}-${badge}`} className={`ai-badge ${getAiBadgeClass(badge)}`}>
                        {badge}
                      </span>
                    ))}
                  </div>
                ) : null}

                <p className="mb-6 text-sm leading-7 text-[var(--color-text-muted)]">{project.description}</p>

                <div className="mb-6 flex flex-wrap gap-2">
                  {project.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="font-mono rounded-2xl border border-[var(--color-border-muted)] bg-[var(--color-bg-elevated)] px-3 py-1.5 text-xs uppercase tracking-[0.05em] text-[var(--color-text-subtle)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-border-focus)] hover:text-[var(--color-primary)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex justify-end">
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono inline-flex items-center gap-2 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-5 py-3 text-sm font-medium uppercase tracking-[0.08em] text-[var(--color-primary)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-bg-base)] hover:shadow-[var(--shadow-button)]"
                  >
                    <span>{project.linkText}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M7 17L17 7M17 7H7M17 7V17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default ProjectsSection
