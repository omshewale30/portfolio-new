import React, {useEffect, useState} from "react";

import { Grid, Code, Cpu } from 'lucide-react';
import '/src/CSS/Landing.css';

const LandingPage = () => {
    const gridSize = 20;
    const dots = Array(gridSize).fill(null);
    const scrollToNextSection = () => {
        const nextSection = document.querySelector('.hero'); // or whatever your next section's class is
        if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth' });
        }
    };


    const [text, setText] = useState("");
    const phrases = [
        "designing intelligent systems with neural networks🧠",
        "building facial recognition solutions👁️",
        "transforming complex algorithms into seamless code💻",
        "unlocking insights through AI and computer vision🤖"
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
            {/* Animated Background Grid */}
            <div className="background-grid">
                <div className="grid-container">
                    {dots.map((_, i) => (
                        <div key={i} className="grid-item">
                            <div className="grid-dot"
                                 style={{ animationDelay: `${i * 200}ms` }}>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Icons */}
            <div className="floating-icon icon-1">
                <Grid size={48} />
            </div>
            <div className="floating-icon icon-2">
                <Code size={48} />
            </div>
            <div className="floating-icon icon-3">
                <Cpu size={48} />
            </div>

            {/* Main Content */}
            <div className="content-container">

                <h1 className="title">Om Shewale</h1>
                <div className="divider"></div>
                <h2 className="subtitle">AI & Computer Vision Engineer</h2>
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