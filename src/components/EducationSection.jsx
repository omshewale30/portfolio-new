import React, { useEffect } from "react";

import '/src/CSS/EducationSection.css';
import AOS from "aos";
import "aos/dist/aos.css";

const educationDetails = [
    {
        degree: "B.S in Computer Science",
        institution: "Arizona State University",
        years: "08/2020 - 05/2024",
        gpa: "4.0/4.0",
        transcriptLink: "../transcripts/ASU_Transcript.pdf",
        description: "Graduated Summa Cum Laude with the prestigious Moeur Award.",
        icon: "🎓"
    },
    {
        degree: "M.S in Computer Science",
        institution: "University of North Carolina at Chapel Hill",
        years: "08/2024 - 05/2026",
        gpa: "4.0/4.0",
        transcriptLink: "../transcripts/UNC_Transcript.pdf",
        description: "Focusing on LLMs and computer vision.",
        icon: "🚀"
    },
];

const EducationSection = () => {
    useEffect(() => {
        AOS.init({ duration: 1000, once: true });
    }, []);

    return (
        <div id="education" className="education-section">
            <h2 className="education-title">Education</h2>
            <div className="education-grid">
                {educationDetails.map((edu, index) => (
                    <div 
                        key={index} 
                        className="education-card"
                        data-aos="fade-up"
                        data-aos-delay={`${index * 200}`}
                    >
                        <div className="education-icon">{edu.icon}</div>
                        <h3 className="education-degree">{edu.degree}</h3>
                        <h4 className="education-institution">{edu.institution}</h4>
                        <p className="education-years">{edu.years}</p>
                        <p className="education-gpa">
                            <strong>GPA:</strong> {edu.gpa}
                        </p>
                        <p className="education-description">{edu.description}</p>
                        <a
                            href={edu.transcriptLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transcript-link"
                        >
                            View Transcript
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EducationSection;