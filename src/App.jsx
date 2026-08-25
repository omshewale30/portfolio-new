import { lazy, Suspense, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import './App.css'
import { trackPageView } from "./analytics.js";
import Hero from "./components/Hero.jsx";
import Navbar from "./components/Navbar.jsx";
import TechMarquee from "./components/TechMarquee.jsx";
import ProofStrip from "./components/ProofStrip.jsx";
import SelectedWork from "./components/SelectedWork.jsx";
import RecentNotes from "./components/RecentNotes.jsx";
import CurrentRoleSummary from "./components/CurrentRoleSummary.jsx";
import JarvisCTA from "./components/JarvisCTA.jsx";
import ContactSection from "./components/ContactSection.jsx";
import EducationSection from "./components/EducationSection.jsx";
const ProjectSection = lazy(() => import("./components/ProjectSection.jsx"));
const Experience = lazy(() => import("./components/Experience.jsx"));
const CaseStudy = lazy(() => import("./pages/CaseStudy.jsx"));
const NotesIndex = lazy(() => import("./pages/NotesIndex.jsx"));
const NoteDetail = lazy(() => import("./pages/NoteDetail.jsx"));

const preferredScrollBehavior = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

const RouteLoadingFallback = () => (
    <main
        className="flex min-h-[60vh] items-center justify-center bg-[var(--color-bg-base)] px-6 pt-24"
        aria-live="polite"
        aria-busy="true"
    >
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-text-meta)]">
            Loading page…
        </p>
    </main>
);

function AppContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const previousPathRef = useRef(null);

    // New routes always begin at the top. Homepage section links are handled below.
    useEffect(() => {
        const pathChanged = previousPathRef.current !== location.pathname;
        previousPathRef.current = location.pathname;

        if (!pathChanged || (location.pathname === "/" && location.state?.scrollTo)) return;
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        const frameId = window.requestAnimationFrame(() => {
            document.getElementById("main-content")?.focus({ preventScroll: true });
        });
        return () => window.cancelAnimationFrame(frameId);
    }, [location.pathname, location.state?.scrollTo]);

    // Fire-and-forget page view tracking on every route change.
    useEffect(() => {
        const noteMatch = location.pathname.match(/^\/notes\/([^/]+)$/);
        trackPageView(location.pathname, noteMatch ? noteMatch[1] : null);
    }, [location.pathname]);

    // Scroll to section when navigating to home with state.scrollTo (e.g. from Navbar hash links)
    useEffect(() => {
        if (location.pathname !== "/" || !location.state?.scrollTo) return;
        const sectionId = location.state.scrollTo;
        const timer = requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const el = document.getElementById(sectionId);
                if (el) el.scrollIntoView({ behavior: preferredScrollBehavior(), block: "start" });
                navigate(".", { replace: true, state: {} });
            });
        });
        return () => cancelAnimationFrame(timer);
    }, [location.pathname, location.state?.scrollTo, navigate]);

    return (
        <div className="App">
            <a href="#main-content" className="skip-link">Skip to content</a>
            <Navbar />
            <div id="main-content" tabIndex="-1">
                <Suspense fallback={<RouteLoadingFallback />}>
                    <Routes>
                    {/* Home Page */}
                    <Route
                        path="/"
                        element={
                            <main>
                                <Hero />
                                <ProofStrip />
                                <div className="section-transition section-transition-delay-1">
                                    <SelectedWork />
                                </div>
                                <div className="section-transition section-transition-delay-2">
                                    <RecentNotes />
                                </div>
                                <div className="section-transition section-transition-delay-3">
                                    <CurrentRoleSummary />
                                </div>
                                <div className="section-transition section-transition-delay-3">
                                    <EducationSection compact />
                                </div>
                                <TechMarquee />
                                <div className="section-transition section-transition-delay-3">
                                    <JarvisCTA />
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
                    {/* Case Study Page */}
                    <Route path="/work/:slug" element={<CaseStudy />} />
                    {/* Notes */}
                    <Route path="/notes" element={<NotesIndex />} />
                    <Route path="/notes/:slug" element={<NoteDetail />} />

                    </Routes>
                </Suspense>
            </div>
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
