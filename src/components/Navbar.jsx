import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";


import '/src/CSS/Navbar.css';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [isChatbotOpen, setIsChatbotOpen] = useState(false); // Chatbot state

    // Detect if the device is in mobile view
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth <= 768);
        };
        handleResize(); // Set initial state
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Detect scroll to change navbar background
    useEffect(() => {
        const handleScroll = () => {
            const navbar = document.querySelector(".navbar");
            if (window.scrollY > 50) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleNavigation = (path) => {
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);

        if (path === "/") {
            if (location.pathname !== "/") {
                navigate("/");
                setTimeout(() => {
                    const homeSection = document.getElementById("home");
                    if (homeSection) {
                        const navbarHeight = document.querySelector(".navbar").offsetHeight;
                        const scrollPosition = homeSection.offsetTop - navbarHeight;
                        window.scrollTo({ top: scrollPosition, behavior: "smooth" });
                    }
                }, 500);
            } else {
                const homeSection = document.getElementById("home");
                if (homeSection) {
                    const navbarHeight = document.querySelector(".navbar").offsetHeight;
                    const scrollPosition = homeSection.offsetTop - navbarHeight;
                    window.scrollTo({ top: scrollPosition, behavior: "smooth" });
                }
            }
        } else if (path.startsWith("#")) {
            if (location.pathname !== "/") {
                navigate("/");
                setTimeout(() => {
                    const sectionId = path.slice(1);
                    const section = document.getElementById(sectionId);
                    if (section) {
                        const navbarHeight = document.querySelector(".navbar").offsetHeight;
                        const scrollPosition = section.offsetTop - navbarHeight;
                        window.scrollTo({ top: scrollPosition, behavior: "smooth" });
                    }
                }, 500);
            } else {
                const sectionId = path.slice(1);
                const section = document.getElementById(sectionId);
                if (section) {
                    const navbarHeight = document.querySelector(".navbar").offsetHeight;
                    const scrollPosition = section.offsetTop - navbarHeight;
                    window.scrollTo({ top: scrollPosition, behavior: "smooth" });
                }
            }
        } else {
            if (location.pathname !== path) {
                navigate(path);
                setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }, 100);
            } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        }
    };

    const toggleDropdown = () => {
        if (isMobileView) {
            setIsDropdownOpen((prev) => !prev);
        }
    };

    return (
        <nav className="navbar navbar-expand-lg bg-light fixed-top shadow-sm">
            <div className="container-fluid">
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div
                    className={`collapse navbar-collapse ${isMobileMenuOpen ? "show" : ""}`}
                    id="navbarNav"
                >
                    <ul className="navbar-nav ms-auto">
                        <li
                            className={`nav-item dropdown ${isDropdownOpen ? "show" : ""}`}
                            onMouseEnter={() => !isMobileView && setIsDropdownOpen(true)}
                            onMouseLeave={() => !isMobileView && setIsDropdownOpen(false)}
                        >
                            <a
                                className="nav-link"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (isMobileView) toggleDropdown();
                                }}
                            >
                                Home
                            </a>
                            <div className={`dropdown-menu ${isDropdownOpen ? "show" : ""}`}>
                                <a
                                    className="dropdown-item"
                                    href="#about"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavigation("#about");
                                    }}
                                >
                                    About Me
                                </a>
                                <a
                                    className="dropdown-item"
                                    href="#education"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavigation("#education");
                                    }}
                                >
                                    Education
                                </a>
                                <a
                                    className="dropdown-item"
                                    href="#timeline"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavigation("#timeline");
                                    }}
                                >
                                    Timeline
                                </a>
                                <a
                                    className="dropdown-item"
                                    href="#skills"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavigation("#skills");
                                    }}
                                >
                                    Skills
                                </a>
                                <a
                                    className="dropdown-item"
                                    href="#footer"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavigation("#footer");
                                    }}
                                >
                                    Contact
                                </a>
                            </div>
                        </li>
                        <li className="nav-item">
                            <a
                                className={`nav-link ${location.pathname === "/experience" ? "active" : ""}`}
                                href="#"
                                onClick={() => handleNavigation("/experience")}
                            >
                                Experience
                            </a>
                        </li>
                        <li className="nav-item">
                            <a
                                className={`nav-link ${location.pathname === "/projects" ? "active" : ""}`}
                                href="#"
                                onClick={() => handleNavigation("/projects")}
                            >
                                Projects
                            </a>
                        </li>

                        <li className="nav-item">
                            <a
                                className={`nav-link ${location.pathname === "/wildlife-gallery" ? "active" : ""}`}
                                href="#"
                                onClick={() => handleNavigation("/wildlife-gallery")}
                            >
                                Gallery
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Chatbot Floating Button */}
                <button
                    className="chatbot-toggle"
                    onClick={() => setIsChatbotOpen(!isChatbotOpen)}
                    title="Chat with me"
                >

                </button>
            </div>
        </nav>
    );
};

export default Header;
