import { useState, useEffect } from 'react'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import './App.css'
import './index.css'
import 'bootstrap/dist/css/bootstrap.css';
import HeroSection from "./components/HeroSection.jsx";
import Navbar from "./components/Navbar.jsx";
import ProjectSection from "./components/ProjectSection.jsx";
import Timeline from "./components/TimeLine.jsx";
import Experience from "./components/Experience.jsx";

import SkillSection from "./components/SkillsSection.jsx";
import ContactSection from "./components/ContactSection.jsx";
import LandingPage from "./components/Landing.jsx";
import EducationSection from "./components/EducationSection.jsx";
import GlobalChatbot from "./components/GlobalChatbot.jsx";


function App() {
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
    }, [])  //create a new session id if one does not exist


    return (
        <Router>
            <div className="App">
                <Navbar />
                <Routes>
                    {/* Home Page */}
                    <Route
                        path="/"
                        element={
                            <main>
                                <LandingPage />
                                <HeroSection />
                                <EducationSection />
                                <Timeline />
                                <SkillSection/>
                                <ContactSection />
                            </main>
                        }
                    />
                    {/* Projects Page */}
                    <Route path="/projects" element={<ProjectSection />} />
                    {/* Experience Page */}
                    <Route path="/experience" element={<Experience />} />


                </Routes>
                <GlobalChatbot />
            </div>
        </Router>

    )
}

export default App
