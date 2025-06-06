// src/components/HeroSection.jsx

import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import '/src/CSS/HeroSection.css';
import AOS from "aos";
import "aos/dist/aos.css";

const HeroSection = () => {
    const [scroll, setScroll] = useState(0);

    useEffect(() => {
        AOS.init({ duration: 1000, once: true });
        
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;
            const normalisedScroll = Math.min(Math.max(scrollPosition / windowHeight, 0), 1);
            setScroll(normalisedScroll);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section className="hero">
            <div className="hero-content">
                <Card 
                    className="hero-card shadow-lg"
                    data-aos="fade-up"
                    data-aos-delay="200"
                >
                    <Card.Body>
                        <div 
                            className="card-image-wrapper"
                            data-aos="zoom-in"
                            data-aos-delay="400"
                        >
                            <img
                                src="/assets/OMI_8044.jpeg"
                                alt="Om Shewale"
                                className="card-image"
                                style={{
                                    transform: `scale(${0.8 + (scroll * 0.2)})`,
                                    opacity: scroll,
                                    transition: 'all 0.3s ease-out'
                                }}
                            />
                        </div>
                        <Card.Title 
                            className="card-title"
                            data-aos="fade-up"
                            data-aos-delay="600"
                        >
                            Hi, I'm Om Shewale
                        </Card.Title>
                        <Card.Text 
                            className="hero-text"
                            data-aos="fade-up"
                            data-aos-delay="800"
                        >
                            A software developer passionate about solving problems through AI and computer vision.
                            Outside of coding, I enjoy lifting weights, playing football, exploring the outdoors, and
                            recently, I've developed a love for pool. My journey blends technical expertise with
                            creativity, and I'm driven to make an impact through innovative solutions. Welcome to my
                            portfolio!
                        </Card.Text>
                    </Card.Body>
                </Card>
            </div>
        </section>
    );
};

export default HeroSection;
