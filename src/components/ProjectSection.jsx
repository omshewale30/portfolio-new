"use client"
import AOS from "aos"
import "aos/dist/aos.css"
import { useEffect } from "react"

const ProjectsSection = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 })
  }, [])

  const projects = [
    {
      title: "Image to LaTeX",
      description:
        "Developed a robust equation-to-LaTeX conversion system combining Optical Character Recognition (OCR) with Natural Language Processing (NLP) to accurately transcribe mathematical expressions. Leveraged Vision Transformers (ViT) for visual feature extraction and decoder LLMs for LaTeX generation, improving performance on low-quality and handwritten equations.",
      tags: ["Machine Learning", "TensorFlow", "OCR", "NLP"],
      link: "https://adminliveunc-my.sharepoint.com/:b:/r/personal/gtbachel_ad_unc_edu/Documents/Attachments/755_Final_Report.pdf?csf=1&web=1&e=X7q1Rs",
      linkText: "Report",
      featured: true,
    },
    {
      title: "Career Copilot AI",
      description:
        "Engineered Career Copilot AI, a full-stack intelligent platform providing personalized career advice, resume analysis, and job search assistance. Leveraged React for the frontend and FastAPI with LangChain/OpenAI for backend AI capabilities, featuring an interactive chat interface and Stripe integration for premium services.",
      tags: ["React", "FastAPI", "LangChain", "OpenAI", "Supabase", "Full-Stack", "AI/ML"],
      link: "https://career-copilot-nu.vercel.app/",
      linkText: "Try it out",
      featured: true,
    },
    {
      title: "Jarvis - RAG Chatbot",
      description:
        "Developed Jarvis, a RAG-based chatbot that uses LangChain and OpenAI to provide personalized responses to user queries about me. It uses a vector database to store the data like my resume, projects, github, certifications, linkedin, etc and a chat interface to interact with the bot.",
      tags: ["React", "FastAPI", "LangChain", "OpenAI", "Full-Stack", "AI/ML"],
      link: "https://jarvis-interface.vercel.app/",
      linkText: "Chat with Jarvis",
      featured: true,
    },
    {
      title: "TaskFlow AI",
      description:
        "Developed TaskFlow AI, a full-stack intelligent platform providing personalized task management, scheduling, and productivity tips. Leveraged Next.js for the frontend and FastAPI with LangChain/OpenAI for backend AI capabilities",
      tags: ["Next.js", "FastAPI", "LangChain", "OpenAI", "Supabase", "Full-Stack", "AI/ML"],
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
      link: "https://yourprojectlink.com",
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
      link: "https://synapsemd.vercel.app/",
      linkText: "Explore the App",
    },
    {
      title: "smArtbIte",
      description:
        "Developed an AI-powered web application to generate healthy recipes from user-provided ingredients or fridge images. Built a React frontend with Chakra UI and an Express backend leveraging Google Cloud's Vertex AI for text and image recognition. Implemented features like dietary restriction filters, image previews, and step-by-step recipe displays, delivering a user-friendly tool for personalized cooking.",
      tags: ["React", "Chakra UI", "Express", "Google Cloud Vertex AI"],
      link: "https://smartbite.vercel.app/",
      linkText: "Try it out",
    },
    {
      title: "Game Application for Mental Health Patients",
      description:
        "Led the development of 5 diverse games in Unity, specifically designed to enhance fine motor skills for mental health patients. Implemented an interactive user interface, resulting in improved accessibility and ease of navigation for patients. Received positive feedback from users, with a measured increase in fine motor skill improvement among patients.",
      tags: ["Unity", "Game Development", "UI/UX Design", "C#"],
      link: "#",
      linkText: "View Project",
    },
    {
      title: "Shopping Web Application",
      description:
        "Led a team of 5 in developing a full-stack shopping application in Java, similar to Amazon.com. Implemented a robust database system to manage customer information and correlate it with order numbers, improving data retrieval processes. Leveraged SQL and GUI features to create a highly user-oriented and intuitive shopping experience.",
      tags: ["Java", "JavaFX", "SQL", "HTML", "CSS", "Full-Stack Development"],
      link: "#",
      linkText: "View Project",
    },
  ]

  return (
    <section
      id="projects"
      className="relative overflow-hidden bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_50%,#ffffff_100%)] py-16 sm:py-20"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.05) 0%, transparent 50%), radial-gradient(circle at 40% 60%, rgba(14, 165, 233, 0.03) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="mb-14 text-center sm:mb-20">
          <h2 className="mb-4 bg-gradient-to-r from-slate-800 via-blue-500 to-violet-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl">
            Featured Projects
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-500 sm:text-xl">
            A collection of innovative solutions spanning AI, web development, and emerging technologies
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-3xl border bg-white/80 p-6 shadow-md backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-2xl md:p-8 ${
                project.featured
                  ? "border-blue-200 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.10),0_10px_10px_-5px_rgba(0,0,0,0.04),0_0_0_1px_rgba(59,130,246,0.05)]"
                  : "border-white/20"
              }`}
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 ${project.featured ? "opacity-100" : "opacity-0 transition-opacity duration-300 group-hover:opacity-100"}`} />
              <div className="relative z-[1]">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="flex-1 text-2xl font-semibold leading-snug text-slate-800">{project.title}</h3>
                  {project.featured && (
                    <span className="inline-flex w-fit shrink-0 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                      Featured
                    </span>
                  )}
                </div>

                <p className="mb-6 text-sm leading-7 text-slate-600">{project.description}</p>

                <div className="mb-6 flex flex-wrap gap-2">
                  {project.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-2xl border border-slate-300/40 bg-gradient-to-r from-slate-100 to-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-transparent hover:bg-gradient-to-r hover:from-blue-500 hover:to-violet-500 hover:text-white"
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
                    className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-500/10 to-violet-500/10 px-5 py-3 text-sm font-semibold text-blue-500 transition-all duration-300 hover:-translate-y-0.5 hover:border-transparent hover:bg-gradient-to-r hover:from-blue-500 hover:to-violet-500 hover:text-white hover:shadow-[0_8px_25px_rgba(59,130,246,0.3)]"
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
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProjectsSection
