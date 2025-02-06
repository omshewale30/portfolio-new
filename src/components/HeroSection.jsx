// src/components/HeroSection.jsx

import React, { useState, useEffect } from 'react';
import {Button, Card} from 'react-bootstrap';
import '/src/CSS/HeroSection.css';



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
                <Card className="hero-card shadow-lg">
                    <Card.Body>
                        <div className="card-image-wrapper">
                            <img
                                src="/assets/OMI_8044.jpeg"
                                alt="Om Shewale"
                                className="card-image"
                                style={{
                                    transform: `scale(${0.5 + (scroll * 0.5)})`, // Scales from 0.5 to 1
                                    opacity: scroll, // Fades in from 0 to 1
                                    transition: 'all 0.3s ease-out'
                                }}
                            />
                        </div>
                        <Card.Title className="card-title">Hi, I'm Om Shewale</Card.Title>
                        <Card.Text className="hero-text">
                            A software developer passionate about solving problems through AI and computer vision.
                            Outside of coding, I enjoy lifting weights, playing football, exploring the outdoors, and
                            recently, I’ve developed a love for pool. My journey blends technical expertise with
                            creativity, and I’m driven to make an impact through innovative solutions. Welcome to my
                            portfolio!
                        </Card.Text>
                    </Card.Body>
                </Card>
            </div>
        </section>
    );
};

export default HeroSection;
