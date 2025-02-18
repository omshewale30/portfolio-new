
import React, { useRef } from "react";
import "../CSS/ProjectSection.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

const ProjectsSection = () => {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const projects = [
        {
            title: "Image to LaTeX",
            description: "Developed a robust equation-to-LaTeX conversion system combining Optical Character Recognition (OCR) with Natural Language Processing (NLP) to accurately transcribe mathematical expressions. Leveraged Vision Transformers (ViT) for visual feature extraction and decoder LLMs for LaTeX generation, improving performance on low-quality and handwritten equations.",
            tags: ["Machine Learning", "TensorFlow", "OCR", "NLP"],
            link: "https://adminliveunc-my.sharepoint.com/:b:/r/personal/gtbachel_ad_unc_edu/Documents/Attachments/755_Final_Report.pdf?csf=1&web=1&e=X7q1Rs",
            linkText: "Report",
        },
        {
            title: "Facial Recognition",
            description: "This application utilizes a Siamese network to perform facial verification based on L1Distance. The Siamese network architecture is designed for finding the similarity between two comparable things, in this case, facial images. This project implements a facial verification system that can determine if two given images are of the same person.",
            tags: ["Machine Learning", "Python", "OpenCV", "Computer Vision"],
            link: "https://github.com/omshewale30/facial-recognition",
            linkText: "GitHub",
        },
        {
            title: "NASA Psyche Mission",
            description: "Led the development of a web-based Unity game designed to promote awareness of the NASA Psyche mission. Worked within a five-member team, crafting a realistic space environment using authentic NASA-provided data. Delivered the project ahead of schedule, receiving overwhelmingly positive feedback from NASA sponsors for its engaging design and educational impact.",
            tags: ["React", "Bootstrap", "API"],
            link: "https://missiontopsyche.github.io/tungsten_12e_web_game/",
            linkText: "Try it out",
        },
        {
            title: "PharmAlliance Clinical Escape Room",
            description: "Leading the development of a web-based 2D escape room game designed to enhance clinical education. The game, set in a virtual exam room, engages players with interactive puzzles focused on pharmacist decision-making. Built using Dart and Flutter, the project includes an authoring tool that enables faculty to customize scenarios, ensuring scalable and adaptable learning experiences. Initially tailored for diabetes care and pharmacist prescribing, this platform aims to revolutionize clinical training across institutions.",
            tags: ["Dart", "Flutter", "Game Development", "Education Technology"],
            link: "https://yourprojectlink.com",  // Replace with actual link if available
            linkText: "Try it out",
        },
        {
            title: "PumpPal - Macro Tracking App 🍎",
            description: "PumpPal is a sleek and intuitive iOS app designed to help users track macronutrient intake and achieve their fitness goals. Built with Swift and SwiftUI, 🚀",
            tags: ["Swift", "SwiftUI", "CoreML", "MapKit", "Mobile App Development"],
            link: "https://github.com",
            linkText: "GitHub",
        },
        {
            title: "Game Application for Mental Health Patients",
            description: "Led the development of 5 diverse games in Unity, specifically designed to enhance fine motor skills for mental health patients. Implemented an interactive user interface, resulting in improved accessibility and ease of navigation for patients. Received positive feedback from users, with a measured increase in fine motor skill improvement among patients.",
            tags: ["Unity", "Game Development", "UI/UX Design", "C#"],
            link: "#", // Add a link if available
            linkText: "View Project", // Update link text if applicable
        },
        {
            title: "Shopping Web Application",
            description: "Led a team of 5 in developing a full-stack shopping application in Java, similar to Amazon.com. Implemented a robust database system to manage customer information and correlate it with order numbers, improving data retrieval processes. Leveraged SQL and GUI features to create a highly user-oriented and intuitive shopping experience.",
            tags: ["Java", "JavaFX", "SQL", "HTML", "CSS", "Full-Stack Development"],
            link: "#", // Add a link if available
            linkText: "View Project", // Update link text if applicable
        }
    ];

    return (
        <div className="projects-section">
            <h2 className="projects-title">Projects</h2>
            <div className="projects-grid">
                {projects.map((project, index) => (
                    <div
                        key={index}
                        className="project-card"
                        data-aos="fade-up"
                        data-aos-delay={index * 100}
                    >
                        <div className="project-content">
                            <h3>{project.title}</h3>
                            <p>{project.description}</p>
                            <div className="project-tags">
                                {project.tags.map((tag, i) => (
                                    <span key={i}>{tag}</span>
                                ))}
                            </div>
                            <div className="project-links">
                                <a href={project.link} target="_blank" rel="noopener noreferrer">
                                    {project.linkText}
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

};

export default ProjectsSection;
