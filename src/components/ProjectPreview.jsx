import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../CSS/ProjectPreview.css";

const ProjectPreview = () => {
  const navigate = useNavigate();

  const previewProjects = [
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
  ];

  return (
    <div className="project-preview-section">
      <div className="project-preview-container">
        <div className="project-preview-header">
          <h2 className="project-preview-title">Featured Projects</h2>
          <p className="project-preview-subtitle">
            A glimpse into my innovative solutions spanning AI, web development, and emerging technologies
          </p>
        </div>

        <div className="project-preview-grid">
          {previewProjects.map((project, index) => (
            <div
              key={index}
              className="project-preview-card"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="project-preview-content">
                <div className="project-preview-card-header">
                  <h3 className="project-preview-card-title">{project.title}</h3>
                  <span className="featured-badge">Featured</span>
                </div>

                <p className="project-preview-description">{project.description}</p>

                <div className="project-preview-tags">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="project-preview-footer">
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-preview-link">
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

        <div className="project-preview-cta">
          <button 
            className="see-more-button"
            onClick={() => navigate('/projects')}
          >
            See More Projects
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M5 12H19M19 12L12 5M19 12L12 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectPreview; 