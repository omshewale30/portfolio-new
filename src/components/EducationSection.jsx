import React from "react";

import '/src/CSS/EducationSection.css';

const educationDetails = [
    {
        degree: "B.S in Computer Science",
        institution: "Arizona State University",
        years: "08/2020 - 05/2024",
        gpa: "4.0/4.0",
        transcriptLink: "transcripts/ASU_FinalTranscript.pdf",
        description: "Graduated Summa Cum Laude with the prestigious Moeur Award.",
    },
    {
        degree: "M.S in Computer Science",
        institution: "University of North Carolina at Chapel Hill",
        years: "08/2024 - 05/2026",
        gpa: "4.0/4.0",
        transcriptLink: "/transcripts/",
        description: "Focusing on LLMs and computer vision.",
    },
];

const EducationSection = () => {
    return (
        <div id="education" className="education-section">
            <h3 className="education-title">Education</h3>
            <div className="education-grid">
                {educationDetails.map((edu, index) => (
                    <div key={index} className="education-card">
                        <h4 className="education-degree">{edu.degree}</h4>
                        <p className="education-institution">{edu.institution}</p>
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