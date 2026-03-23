import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import './App.css'
import Hero from "./components/Hero.jsx";
import Navbar from "./components/Navbar.jsx";
import ProjectSection from "./components/ProjectSection.jsx";
import Experience from "./components/Experience.jsx";
import ProjectPreview from "./components/ProjectPreview.jsx";
import TechMarquee from "./components/TechMarquee.jsx";

import SkillSection from "./components/SkillsSection.jsx";
import ContactSection from "./components/ContactSection.jsx";
import EducationSection from "./components/EducationSection.jsx";


function AppContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const [sessionId, setSessionId] = useState(null);

    useEffect(() => {
        const storedSessionId = localStorage.getItem('sessionId');
        if (storedSessionId){
            setSessionId(storedSessionId);
        }else{
            const newSessionId = crypto.randomUUID();
            localStorage.setItem('sessionId', newSessionId);
            setSessionId(newSessionId);
        }
    }, []);

    // Scroll to section when navigating to home with state.scrollTo (e.g. from Navbar hash links)
    useEffect(() => {
        if (location.pathname !== "/" || !location.state?.scrollTo) return;
        const sectionId = location.state.scrollTo;
        const timer = requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const el = document.getElementById(sectionId);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                navigate(".", { replace: true, state: {} });
            });
        });
        return () => cancelAnimationFrame(timer);
    }, [location.pathname, location.state?.scrollTo, navigate]);

    return (
        <div className="App">
            <Navbar />
            <Routes>
                    {/* Home Page */}
                    <Route
                        path="/"
                        element={
                            <main>
                                <Hero />
                                <TechMarquee />
                                <div className="section-transition section-transition-delay-1">
                                    <EducationSection />
                                </div>
                                <div className="section-transition section-transition-delay-2">
                                    <ProjectPreview />
                                </div>
                                <TechMarquee />
                                <div className="section-transition section-transition-delay-3">
                                    <SkillSection/>
                                </div>
                                <div className="section-transition section-transition-delay-3">
                                    <ContactSection />
                                </div>
                            </main>
                        }
                    />
                    {/* Projects Page */}
                    <Route path="/projects" element={<ProjectSection />} />
                    {/* Experience Page */}
                    <Route path="/experience" element={<Experience />} />


            </Routes>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App
