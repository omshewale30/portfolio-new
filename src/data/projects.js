// The three flagships live in caseStudies.js because they carry a richer shape.
// Every other project is maintained once here and grouped by its tier at export.
export const projects = [
  {
    tier: "supporting",
    title: "Image to LaTeX",
    description:
      "Developed a robust equation-to-LaTeX conversion system combining Optical Character Recognition (OCR) with Natural Language Processing (NLP) to accurately transcribe mathematical expressions. Leveraged Vision Transformers (ViT) for visual feature extraction and decoder LLMs for LaTeX generation, improving performance on low-quality and handwritten equations.",
    tags: ["Machine Learning", "TensorFlow", "OCR", "NLP"],
    aiBadges: ["Vision Transformer", "OCR Pipeline"],
    link: "https://drive.google.com/file/d/1P_J3Q39MPd2p6FeERYnNe4iStTSxlRQC/view?usp=sharing",
    linkText: "Report",
  },
  {
    tier: "supporting",
    title: "Career Copilot AI",
    description:
      "Engineered Career Copilot AI, a full-stack intelligent platform providing personalized career advice, resume analysis, and job search assistance. Leveraged React for the frontend and FastAPI with LangChain/OpenAI for backend AI capabilities, featuring an interactive chat interface and Stripe integration for premium services.",
    tags: ["React", "FastAPI", "LangChain", "OpenAI", "Supabase", "Full-Stack", "AI/ML"],
    aiBadges: ["GPT-4", "LangChain", "Multi-Agent"],
    link: "https://career-copilot-nu.vercel.app/",
    linkText: "Try it out",
  },
  {
    tier: "supporting",
    title: "Jarvis - RAG Chatbot",
    description:
      "Developed Jarvis, a RAG-based chatbot that uses LangChain and OpenAI to provide personalized responses to user queries about me. It uses a vector database to store the data like my resume, projects, github, certifications, linkedin, etc and a chat interface to interact with the bot.",
    tags: ["React", "FastAPI", "LangChain", "OpenAI", "Full-Stack", "AI/ML"],
    aiBadges: ["RAG", "GPT-4", "LangChain"],
    link: "https://jarvis-interface.vercel.app/",
    linkText: "Chat with Jarvis",
  },
  {
    tier: "supporting",
    title: "TaskFlow AI",
    description:
      "Developed TaskFlow AI, a full-stack intelligent platform providing personalized task management, scheduling, and productivity tips. Leveraged Next.js for the frontend and FastAPI with LangChain/OpenAI for backend AI capabilities",
    tags: ["Next.js", "FastAPI", "LangChain", "OpenAI", "Supabase", "Full-Stack", "AI/ML"],
    aiBadges: ["GPT-4", "LangChain"],
    link: "https://taskflow-ai-rose.vercel.app/",
    linkText: "Try it out",
  },
  {
    tier: "archive",
    title: "Facial Recognition",
    description:
      "This application utilizes a Siamese network to perform facial verification based on L1Distance. The Siamese network architecture is designed for finding the similarity between two comparable things, in this case, facial images. This project implements a facial verification system that can determine if two given images are of the same person.",
    tags: ["Machine Learning", "Python", "OpenCV", "Computer Vision"],
    link: "https://github.com/omshewale30/facial-recognition",
    linkText: "GitHub",
  },
  {
    tier: "archive",
    title: "NASA Psyche Mission",
    description:
      "Led the development of a web-based Unity game designed to promote awareness of the NASA Psyche mission. Worked within a five-member team, crafting a realistic space environment using authentic NASA-provided data. Delivered the project ahead of schedule, receiving overwhelmingly positive feedback from NASA sponsors for its engaging design and educational impact.",
    tags: ["React", "Bootstrap", "API"],
    link: "https://missiontopsyche.github.io/tungsten_12e_web_game/",
    linkText: "Try it out",
  },
  {
    tier: "archive",
    title: "PharmAlliance Clinical Escape Room",
    description:
      "Leading the development of a web-based 2D escape room game designed to enhance clinical education. The game, set in a virtual exam room, engages players with interactive puzzles focused on pharmacist decision-making. Built using Dart and Flutter, the project includes an authoring tool that enables faculty to customize scenarios, ensuring scalable and adaptable learning experiences. Initially tailored for diabetes care and pharmacist prescribing, this platform aims to revolutionize clinical training across institutions.",
    tags: ["Dart", "Flutter", "Game Development", "Education Technology"],
    link: "https://yashas-hm-unc.github.io/illness-lab-website/",
    linkText: "Try it out",
  },
  {
    tier: "archive",
    title: "PumpPal - Macro Tracking App 🍎",
    description:
      "PumpPal is a sleek and intuitive iOS app designed to help users track macronutrient intake and achieve their fitness goals. Built with Swift and SwiftUI, 🚀",
    tags: ["Swift", "SwiftUI", "CoreML", "MapKit", "Mobile App Development"],
    link: "https://github.com/omshewale30/PumpPal",
    linkText: "GitHub",
  },
  {
    tier: "archive",
    title: "SynapseMD - AI Medical Assistant",
    description:
      "Developed a web-based AI medical assistant to provide personalized health assessments based on user-input symptoms and biographical data. Leveraging Google's MedPaLM model which is fine tuned on health data, the app delivers structured diagnoses with probable causes and actionable advice through an intuitive interface. Built with Vite, React, and shadcn/ui, it features interactive components like accordions and tabs for result exploration, aiming to enhance user understanding of health conditions while emphasizing professional consultation.",
    tags: ["Vite", "React", "LLM", "tailwind", "Healthcare"],
    aiBadges: ["MedPaLM", "LLM"],
    link: "https://synapsemd.vercel.app/",
    linkText: "Explore the App",
  },
  {
    tier: "archive",
    title: "smArtbIte",
    description:
      "Developed an AI-powered web application to generate healthy recipes from user-provided ingredients or fridge images. Built a React frontend with Chakra UI and an Express backend leveraging Google Cloud's Vertex AI for text and image recognition. Implemented features like dietary restriction filters, image previews, and step-by-step recipe displays, delivering a user-friendly tool for personalized cooking.",
    tags: ["React", "Chakra UI", "Express", "Google Cloud Vertex AI"],
    aiBadges: ["Vertex AI", "Computer Vision"],
    link: "https://smartbite.vercel.app/",
    linkText: "Try it out",
  },
  {
    tier: "archive",
    title: "Game Application for Mental Health Patients",
    description:
      "Led the development of 5 diverse games in Unity, specifically designed to enhance fine motor skills for mental health patients. Implemented an interactive user interface, resulting in improved accessibility and ease of navigation for patients. Received positive feedback from users, with a measured increase in fine motor skill improvement among patients.",
    tags: ["Unity", "Game Development", "UI/UX Design", "C#"],
  },
  {
    tier: "archive",
    title: "Shopping Web Application",
    description:
      "Led a team of 5 in developing a full-stack shopping application in Java, similar to Amazon.com. Implemented a robust database system to manage customer information and correlate it with order numbers, improving data retrieval processes. Leveraged SQL and GUI features to create a highly user-oriented and intuitive shopping experience.",
    tags: ["Java", "JavaFX", "SQL", "HTML", "CSS", "Full-Stack Development"],
    link: "https://github.com/aroth6/shopping-app",
    linkText: "View Project",
  },
];

export const supportingProjects = projects.filter((project) => project.tier === "supporting");
export const archivedProjects = projects.filter((project) => project.tier === "archive");
