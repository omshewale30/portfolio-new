import React, { useEffect, useState } from "react";
import { Grid, Code, Cpu, Github, Instagram, Linkedin } from 'lucide-react';
import '/src/CSS/Landing.css';
import ScheduleCallButton from './ScheduleCallButton';

const LandingPage = () => {
    const gridSize = 50;
    const dots = Array(gridSize).fill(null);

    const scrollToNextSection = () => {
        const nextSection = document.querySelector('.hero'); // or whatever your next section's class is
        if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth' });
        }
    };


    const [text, setText] = useState("");
    const phrases = [
        "solving business problems with AI💼",
        "designing intelligent systems with neural networks🧠",
        "building AI agents🤖",
        "critical problem solving🤔"
    ];

    const [isDeleting, setIsDeleting] = useState(false);
    const [loopIndex, setLoopIndex] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(100);

    useEffect(() => {
        const handleTyping = () => {
            const currentPhrase = phrases[loopIndex % phrases.length];
            if (!isDeleting) {
                setText(currentPhrase.substring(0, text.length + 1));
                if (text === currentPhrase) {
                    setTimeout(() => setIsDeleting(true), 1000); // Shorter pause before deleting
                }
            } else {
                setText(currentPhrase.substring(0, text.length - 1));
                if (text === "") {
                    setIsDeleting(false);
                    setLoopIndex(loopIndex + 1);
                }
            }
        };
        const timer = setTimeout(handleTyping, isDeleting ? 50 : typingSpeed); // Faster deleting speed
        return () => clearTimeout(timer);
    }, [text, isDeleting, loopIndex, typingSpeed]);


    return (
        <div className="landing-container">
            {/* Schedule Call Button */}
            <ScheduleCallButton />
            
            {/* Animated Background Grid */}
            <div className="social-icons">
                <a href="https://github.com/omshewale30" target="_blank" rel="noopener noreferrer">
                    <Github size={20} />
                </a>
                <a href="https://instagram.com/omshewale3000" target="_blank" rel="noopener noreferrer">
                    <Instagram size={20} />
                </a>
                <a href="https://www.linkedin.com/in/omshewale/" target="_blank" rel="noopener noreferrer">
                    <Linkedin size={20} />
                </a>
            </div>
            <div className="background-grid">
                <div className="grid-container">
                    {dots.map((_, i) => (
                        <div key={i} className="grid-item">
                            <div 
                                className="grid-dot"
                                style={{ animationDelay: `${(i % 10) * 400 + Math.floor(i / 10) * 200}ms` }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Icons */}
            <div className="floating-icon icon-1">
                <Grid size={32} strokeWidth={1.5} />
            </div>
            <div className="floating-icon icon-2">
                <Code size={32} strokeWidth={1.5} />
            </div>
            <div className="floating-icon icon-3">
                <Cpu size={32} strokeWidth={1.5} />
            </div>

            {/* Main Content */}
            <div className="content-container">

                <h1 className="title">Om Shewale</h1>
                <div className="divider"></div>
                <h2 className="subtitle">AI Engineer</h2>
                <h3>
                    I like <span className="dynamic-text">{text}</span>.
                </h3>

                {/* Call to Action Button */}
                <div className="scroll-indicator" onClick={scrollToNextSection}>
                    <span>Scroll Down</span>
                    <div className="arrow"></div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;