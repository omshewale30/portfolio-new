// src/components/HeroSection.jsx

import React, { useState, useEffect } from 'react';
import {Button, Card} from 'react-bootstrap';
import '/src/CSS/HeroSection.css';


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
        description:
            "Focusing on LLMs and computer vision.",
    },
];
const HeroSection = () => {

    const [scroll, setScroll] = useState(0);
    const handleScroll = () => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const normalisedScroll = Math.min(Math.max(scrollPosition / windowHeight, 0), 1);

        setScroll(normalisedScroll);
    }
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        }
    },[]);


    return (
        <section className="hero">
            <div className="hero-content">
                <Card className="hero-card shadow-lg" >
                    <Card.Body>
                        <div className="card-image-wrapper" style={{transform: `scale(${1-scroll/1000}`}}>
                            <img src="/assets/OMI_8044.jpeg" alt=""
                                 className='card-image'
                                 style={{
                                 transform: `scale(${0.5 + (scroll * 0.5)})`, // Scales from 0.5 to 1
                                 opacity: scroll, // Fades in from 0 to 1
                                 transition: 'all 0.3s ease-out'
                             }}
                            />
                        </div>
                        <Card.Title className="mt-4"> Hi, I'am Om Shewale</Card.Title>
                        <Card.Text className="hero-text">
                            a software developer passionate about solving problems through AI and computer vision.
                            Outside of coding, I enjoy lifting weights, playing football, exploring the outdoors, and recently, I’ve developed a love for pool. My journey blends technical expertise with creativity, and I’m driven to make an impact through innovative solutions. Welcome to my portfolio!
                        </Card.Text>

                    </Card.Body>
                </Card>
            </div>

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
        </section>
    );
};

export default HeroSection;
